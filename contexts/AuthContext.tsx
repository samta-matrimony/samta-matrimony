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

  // Helper function to extract role from custom claims only (secure)
  const getRoleFromUser = useCallback(async (firebaseUser: FirebaseUser): Promise<"admin" | "user"> => {
    try {
      const idTokenResult = await getIdTokenResult(firebaseUser);
      // Get role from custom claims set in Firebase Admin SDK (server-side only)
      const customRole = idTokenResult.claims?.role as string | undefined;
      if (customRole === "admin") {
        return "admin";
      }
    } catch (err) {
      console.error("Error fetching custom claims:", err);
      // Do not fallback to insecure client-side checks
    }
    // Default to user role if no admin claim or error
    return "user";
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
            // In production, fetch user profile from Firestore/database
            // For demo purposes, construct basic profile from Firebase user
            const userData: UserProfile = {
              uid: firebaseUser.uid,
              email: firebaseUser.email || "",
              id: firebaseUser.uid,
              role,
              // Default values - in production, load from database
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

  const login = useCallback(async (email: string, password: string): Promise<UserProfile> => {
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

    // Basic email format validation (Firebase will validate further)
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
      // Use ref.current to avoid stale closure when getRoleFromUser updates
      if (!getRoleFromUserRef.current) {
        throw new Error("Auth role resolver not initialized");
      }
      const role = await getRoleFromUserRef.current(res.user);

      // In production, fetch complete user profile from Firestore
      // For demo, construct basic profile
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
      // Log full error details in dev (console removed in prod build)
      if (import.meta.env.DEV) {
        console.error("Login error details:", {
          errorCode: err?.code,
          errorMessage: err?.message,
          fullError: err,
        });
      }
      const authError: AuthError = {
        code: err?.code || "auth/unknown",
        message: mapFirebaseErrorToMessage(err?.code || err?.message),
      };
      setError(authError);
      throw authError;
    }
  }, []);

  const logout = useCallback(async (): Promise<void> => {
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
      // Clean up local storage on logout (app-specific data)
      try {
        localStorage.removeItem("samta_chat_messages");
        localStorage.removeItem("samta_interests");
        localStorage.removeItem("samta_users_registry_v1");
        localStorage.removeItem("samta_user_subscription");
      } catch (storageErr) {
        console.warn("Failed to clear localStorage on logout:", storageErr);
      }
    } catch (err: any) {
      const authError: AuthError = {
        code: err?.code || "auth/logout-failed",
        message: err?.message || "Logout failed",
      };
      setError(authError);
      throw authError;
    }
  }, []);

  const updateUser = useCallback((updates: Partial<UserProfile>): void => {
    setUser((prev) => (prev ? { ...prev, ...updates } : null));
    setError(null);
    // In production, persist to Firestore/database
  }, []);

  const upgradePlan = useCallback(async (planType: "Silver" | "Gold" | "Platinum", months: number): Promise<void> => {
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

    if (months <= 0 || months > 120) { // Reasonable limit
      const authError: AuthError = {
        code: "auth/invalid-duration",
        message: "Duration must be between 1 and 120 months",
      };
      setError(authError);
      throw authError;
    }

    try {
      setError(null);
      // In production, handle plan upgrade server-side with payment processing
      // For demo purposes, simulate in localStorage
      const updatedUser: UserProfile = {
        ...user,
        subscription: {
          plan: planType,
          expiryDate: new Date(Date.now() + months * 30 * 24 * 60 * 60 * 1000).toISOString(),
          interestsSentCount: user.subscription?.interestsSentCount || 0,
        },
      };
      setUser(updatedUser);

      // Persist to localStorage (demo only - not secure for production)
      try {
        localStorage.setItem("samta_user_subscription", JSON.stringify(updatedUser.subscription));
      } catch (storageErr) {
        console.warn("Failed to persist subscription to localStorage:", storageErr);
      }
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
export const mapFirebaseErrorToMessage = (errorCodeOrMessage: string | undefined): string => {
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
    "auth/not-initialized": "Firebase not properly configured. Contact support.",
    "auth/missing-credentials": "Email and password are required.",
  };

  if (!errorCodeOrMessage) {
    return "Authentication failed. Please try again.";
  }

  // Return mapped error if available
  const mappedError = errorMap[errorCodeOrMessage];
  if (mappedError) {
    return mappedError;
  }

  // If error message is already user-friendly (starts with capital), use it
  if (errorCodeOrMessage.charAt(0) === errorCodeOrMessage.charAt(0).toUpperCase()) {
    return errorCodeOrMessage;
  }

  // Default fallback
  return "Authentication failed. Please try again.";
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used inside AuthProvider");
  }
  return ctx;
};
