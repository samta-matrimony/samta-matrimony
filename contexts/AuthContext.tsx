import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from "react";
import { signInWithEmailAndPassword, signOut, onAuthStateChanged, User as FirebaseUser, getIdTokenResult } from "firebase/auth";
import { auth } from "../firebase.config";
import { UserProfile } from "../types";

type AuthError = {
  code: string;
  message: string;
};

type AuthContextType = {
  user: UserProfile | null;
  login: (email: string, password: string) => Promise<UserProfile>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
  isLoading: boolean;
  isError: boolean;
  error: AuthError | null;
  updateUser: (updates: Partial<UserProfile>) => void;
  upgradePlan: (planType: "Silver" | "Gold" | "Platinum", months: number) => Promise<void>;
};

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<AuthError | null>(null);
  const getRoleFromUserRef = useRef<(firebaseUser: FirebaseUser) => Promise<"admin" | "user"> | null>(null);

  // Helper function to extract role from custom claims or fallback
  const getRoleFromUser = useCallback(async (firebaseUser: FirebaseUser): Promise<"admin" | "user"> => {
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
  }, []);

  // Store in ref to avoid stale closures
  useEffect(() => {
    getRoleFromUserRef.current = getRoleFromUser;
  }, [getRoleFromUser]);

  // Restore session on mount
  useEffect(() => {
    if (!auth) {
      setIsLoading(false);
      setError({
        code: "auth/not-initialized",
        message: "Firebase not configured",
      });
      return;
    }

    const unsubscribe = onAuthStateChanged(
      auth,
      async (firebaseUser: FirebaseUser | null) => {
        try {
          if (firebaseUser) {
            const role = await getRoleFromUser(firebaseUser);
            const userData: UserProfile = {
              uid: firebaseUser.uid,
              email: firebaseUser.email || "",
              id: firebaseUser.uid,
              role,
              // These will be populated from actual user profile data
              name: firebaseUser.displayName || "User",
              gender: "Other" as const,
              age: 0,
              photoUrl: firebaseUser.photoURL || "",
              isVerified: firebaseUser.emailVerified,
              status: "active",
              mobileNumber: "",
              height: "",
              dateOfBirth: "",
              maritalStatus: "Never Married",
              motherTongue: "English",
              religion: "Hindu",
              caste: "",
              city: "",
              district: "",
              state: "",
              country: "",
              education: "",
              college: "",
              occupation: "",
              industry: "",
              income: "",
              nriStatus: "Resident",
              lifestyle: [],
              familyBackground: "",
              familyValues: "Moderate",
              familyType: "Nuclear",
              familyStatus: "Middle Class",
              bio: "",
              isPremium: false,
              lastActive: new Date().toISOString(),
              joinedDate: new Date().toISOString(),
              moderationStatus: "pending",
              declarationAccepted: false,
              declarationTimestamp: new Date().toISOString(),
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
      },
      (error) => {
        // Handle Firebase auth state listener errors
        console.error("Auth state listener error:", error);
        setError({
          code: "auth/state-listener-error",
          message: "Failed to monitor authentication state",
        });
        setIsLoading(false);
      }
    );

    return () => unsubscribe();
  }, [getRoleFromUser]);

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

    // Validate email format
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      const authError: AuthError = {
        code: "auth/invalid-email",
        message: "Invalid email format",
      };
      setError(authError);
      throw authError;
    }

    try {
      setError(null);
      const res = await signInWithEmailAndPassword(auth, trimmedEmail, password);
      const role = await getRoleFromUser(res.user);

      const userData: UserProfile = {
        id: res.user.uid,
        uid: res.user.uid,
        email: res.user.email || "",
        name: res.user.displayName || "User",
        mobileNumber: "",
        gender: "Other" as const,
        age: 0,
        height: "",
        dateOfBirth: "",
        maritalStatus: "Never Married",
        motherTongue: "English",
        religion: "Hindu",
        caste: "",
        city: "",
        district: "",
        state: "",
        country: "",
        education: "",
        college: "",
        occupation: "",
        industry: "",
        income: "",
        nriStatus: "Resident",
        lifestyle: [],
        familyBackground: "",
        familyValues: "Moderate",
        familyType: "Nuclear",
        familyStatus: "Middle Class",
        bio: "",
        photoUrl: res.user.photoURL || "",
        isVerified: res.user.emailVerified,
        isPremium: false,
        lastActive: new Date().toISOString(),
        joinedDate: new Date().toISOString(),
        role,
        status: "active",
        moderationStatus: "pending",
        declarationAccepted: false,
        declarationTimestamp: new Date().toISOString(),
      };

      setUser(userData);
      return userData;
    } catch (err: any) {
      setUser(null);
      const authError: AuthError = {
        code: err?.code || "auth/unknown",
        message: mapFirebaseErrorToMessage(err?.code),
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
      // Clean up local storage on logout
      localStorage.removeItem("samta_chat_messages");
      localStorage.removeItem("samta_interests");
      localStorage.removeItem("samta_users_registry_v1");
    } catch (err: any) {
      const authError: AuthError = {
        code: err?.code || "auth/logout-failed",
        message: err?.message || "Logout failed",
      };
      setError(authError);
      throw authError;
    }
  }, []);

  const updateUser = useCallback((updates: Partial<UserProfile>) => {
    setUser((prev) => (prev ? { ...prev, ...updates } : null));
    setError(null);
  }, []);

  const upgradePlan = useCallback(async (planType: "Silver" | "Gold" | "Platinum", months: number) => {
    if (!user) {
      const authError: AuthError = {
        code: "auth/user-not-authenticated",
        message: "User must be authenticated to upgrade plan",
      };
      setError(authError);
      throw authError;
    }

    if (!["Silver", "Gold", "Platinum"].includes(planType)) {
      const authError: AuthError = {
        code: "auth/invalid-plan",
        message: "Invalid plan type",
      };
      setError(authError);
      throw authError;
    }

    if (months <= 0) {
      const authError: AuthError = {
        code: "auth/invalid-duration",
        message: "Duration must be greater than 0",
      };
      setError(authError);
      throw authError;
    }

    try {
      setError(null);
      // Simulate plan upgrade in localStorage
      const updatedUser: UserProfile = {
        ...user,
        subscription: {
          plan: planType,
          expiryDate: new Date(Date.now() + months * 30 * 24 * 60 * 60 * 1000).toISOString(),
          interestsSentCount: user.subscription?.interestsSentCount || 0,
        },
      };
      setUser(updatedUser);
      
      // Persist to localStorage
      localStorage.setItem("samta_user_subscription", JSON.stringify(updatedUser.subscription));
    } catch (err: any) {
      const authError: AuthError = {
        code: err?.code || "auth/upgrade-failed",
        message: err?.message || "Failed to upgrade plan",
      };
      setError(authError);
      throw authError;
    }
  }, [user]);

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
        upgradePlan,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Helper function to map Firebase error codes to user-friendly messages
export const mapFirebaseErrorToMessage = (errorCode: string | undefined): string => {
  const errorMap: Record<string, string> = {
    "auth/user-not-found": "Account not found. Please check your email.",
    "auth/wrong-password": "Incorrect password. Please try again.",
    "auth/invalid-email": "Invalid email format.",
    "auth/email-already-in-use": "This email is already registered.",
    "auth/weak-password": "Password must be at least 6 characters.",
    "auth/user-disabled": "This account has been disabled.",
    "auth/too-many-requests": "Too many login attempts. Please try again later.",
    "auth/invalid-credential": "Invalid email or password.",
    "auth/network-request-failed": "Network error. Please check your connection.",
  };

  return errorMap[errorCode || "unknown"] || "Authentication failed. Please try again.";
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used inside AuthProvider");
  }
  return ctx;
};