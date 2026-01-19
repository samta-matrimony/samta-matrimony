// src/contexts/AuthContext.tsx
import React, { createContext, useContext, useEffect, useState } from "react";

type UserRole = "admin" | "user" | "guest";

export type UserProfile = {
  id: string;
  name?: string;
  email: string;
  role?: UserRole;
  status?: string;
  joinedDate?: string;
  [k: string]: any;
};

type AuthContextValue = {
  currentUser: UserProfile | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ ok: boolean; user?: UserProfile; reason?: string }>;
  signOut: () => void;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const AUTH_STORAGE_KEY = "auth_user";
const MOCK_DB_KEY = "mock_db"; // If your app previously stored users in localStorage

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // Read master admin from Vite env (exposed with VITE_ prefix)
  // WARNING: VITE_ env vars are exposed client-side. Do not store sensitive data like passwords in client env vars.
  // For production, use server-side authentication.
  const MASTER_ADMIN_EMAIL = (import.meta.env.VITE_MASTER_ADMIN_EMAIL || "").toString().trim();
  const MASTER_ADMIN_PASSWORD = (import.meta.env.VITE_MASTER_ADMIN_PASSWORD || "").toString();

  useEffect(() => {
    // Try to restore user from storage on start
    try {
      const raw = localStorage.getItem(AUTH_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && parsed.email) {
          setCurrentUser(parsed);
        }
      }
    } catch (e) {
      // ignore parse errors
      // eslint-disable-next-line no-console
      console.warn("AuthContext: failed to restore auth_user", e);
    } finally {
      setLoading(false);
    }
  }, []);

  // Helper: minimal mock-db reader — keeps compatibility with simple local mock DB
  // WARNING: Storing user passwords in localStorage is insecure. This is for mock purposes only.
  // In production, use proper authentication with hashed passwords on the server.
  const readMockDb = (): Array<any> => {
    try {
      const raw = localStorage.getItem(MOCK_DB_KEY);
      if (!raw) return [];
      return JSON.parse(raw);
    } catch (e) {
      return [];
    }
  };

  // Primary sign-in function
  async function signIn(email: string, password: string) {
    if (!email || !password) {
      return { ok: false, reason: "email_and_password_required" };
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return { ok: false, reason: "invalid_email_format" };
    }
    const normalized = (email || "").toString().trim().toLowerCase();

    // 1) Check master admin env credentials first (explicit, authoritative)
    if (MASTER_ADMIN_EMAIL && MASTER_ADMIN_PASSWORD) {
      if (normalized === MASTER_ADMIN_EMAIL.toLowerCase() && password === MASTER_ADMIN_PASSWORD) {
        const adminUser: UserProfile = {
          id: "master-admin",
          name: "Master Admin",
          email: MASTER_ADMIN_EMAIL,
          role: "admin",
          status: "active",
          joinedDate: new Date().toISOString(),
        };
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(adminUser));
        setCurrentUser(adminUser);
        return { ok: true, user: adminUser };
      }
    }

    // 2) Fallback: check local mock DB (if any)
    try {
      const db = readMockDb();
      if (Array.isArray(db) && db.length > 0) {
        const found = db.find((u: any) => {
          if (!u) return false;
          const ue = (u.email || "").toString().trim().toLowerCase();
          // Some mock users store password plaintext in property 'password'
          return ue === normalized && (u.password === password || u.pass === password || u.pw === password);
        });
        if (found) {
          const profile: UserProfile = {
            id: found.profile?.id || found.id || `user-${Date.now()}`,
            name: found.profile?.name || found.name || found.email,
            email: found.email,
            role: found.profile?.role || "user",
            status: found.profile?.status || "active",
            joinedDate: found.profile?.joinedDate || new Date().toISOString(),
          };
          localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(profile));
          setCurrentUser(profile);
          return { ok: true, user: profile };
        }
      }
    } catch (e) {
      // eslint-disable-next-line no-console
      console.warn("AuthContext: error reading mock DB", e);
    }

    // 3) Not found -> invalid
    return { ok: false, reason: "invalid_credentials" };
  }

  function signOut() {
    try {
      localStorage.removeItem(AUTH_STORAGE_KEY);
    } catch (e) {
      // ignore
    }
    setCurrentUser(null);
  }

  const value: AuthContextValue = {
    currentUser,
    loading,
    signIn,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Hook to use in components
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}

export default AuthProvider;
