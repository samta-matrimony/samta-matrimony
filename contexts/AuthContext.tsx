import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { signInWithEmailAndPassword, signOut, onAuthStateChanged, User as FirebaseUser, getIdTokenResult } from "firebase/auth";
import { auth } from "../firebase";

type UserType = {
  uid: string;
  email: string | null;
  role: "admin" | "user";
};

type AuthError = {
  code: string;
  message: string;
};

type AuthContextType = {
  user: UserType | null;
  login: (email: string, password: string) => Promise<UserType>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
  isLoading: boolean;
  isError: boolean;
  error: AuthError | null;
  updateUser: (updates: Partial<UserType>) => void;
};

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<UserType | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<AuthError | null>(null);

  // Helper function to extract role from custom claims or fallback
  const getRoleFromUser = async (firebaseUser: FirebaseUser): Promise<"admin" | "user"> => {
    try {
      const idTokenResult = await getIdTokenResult(firebaseUser);
      // Get role from custom claims set in Firebase Admin SDK
      const customRole = idTokenResult.claims?.role as string | undefined;
      if (customRole === "admin") {
        return "admin";
      }
    } catch (err) {
      console.error("Error fetching custom claims:", err);
    }
    // Fallback: check email domain (for backward compatibility, but not secure for role assignment)
    return firebaseUser.email?.endsWith("@samta.com") ? "admin" : "user";
  };

  // Restore session on mount
  useEffect(() => {
    if (!auth) {
      setIsLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
      try {
        if (firebaseUser) {
          const role = await getRoleFromUser(firebaseUser);
          const userData: UserType = {
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            role,
          };
          setUser(userData);
          setError(null);
        } else {
          setUser(null);
        }
      } catch (err: any) {
        console.error("Error in onAuthStateChanged:", err);
        setError({
          code: err?.code || "auth/unknown",
          message: err?.message || "Failed to load authentication state",
        });
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    if (!auth) {
      const authError: AuthError = {
        code: "auth/not-initialized",
        message: "Firebase auth not initialized",
      };
      setError(authError);
      throw authError;
    }

    const trimmedEmail = email?.trim() || "";
    if (!trimmedEmail || !password) {
      const authError: AuthError = {
        code: "auth/missing-credentials",
        message: "Email and password are required",
      };
      setError(authError);
      throw authError;
    }

    try {
      setError(null);
      const res = await signInWithEmailAndPassword(auth, trimmedEmail, password);
      const role = await getRoleFromUser(res.user);

      const userData: UserType = {
        uid: res.user.uid,
        email: res.user.email,
        role,
      };

      setUser(userData);
      return userData;
    } catch (err: any) {
      setUser(null);
      const authError: AuthError = {
        code: err?.code || "auth/unknown",
        message: err?.message || "Login failed",
      };
      setError(authError);
      throw authError;
    }
  }, []);

  const logout = useCallback(async () => {
    if (!auth) {
      const authError: AuthError = {
        code: "auth/not-initialized",
        message: "Firebase auth not initialized",
      };
      setError(authError);
      throw authError;
    }
    try {
      await signOut(auth);
      setUser(null);
      setError(null);
      // Clean up local storage
      localStorage.removeItem("samta_chat_messages");
      localStorage.removeItem("samta_interests");
    } catch (err: any) {
      const authError: AuthError = {
        code: err?.code || "auth/logout-failed",
        message: err?.message || "Logout failed",
      };
      setError(authError);
      throw authError;
    }
  }, []);

  const updateUser = useCallback((updates: Partial<UserType>) => {
    setUser((prev) => (prev ? { ...prev, ...updates } : null));
    setError(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        isAuthenticated: !!user,
        isLoading,
        isError: !!error,
        error,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used inside AuthProvider");
  }
  return ctx;
};