"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { useRouter } from "next/navigation";
import { UserRecord, DEFAULT_USER } from "@/lib/user-service";

interface AuthContextType {
  user: UserRecord | null;
  initials: string;
  loading: boolean;
  error: string | null;
  login: (identifier: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  updateProfile: (
    nameOrData: string | { name: string; agencyDivision?: string },
    agencyDivision?: string
  ) => Promise<{ success: boolean; error?: string }>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function getInitials(name: string): string {
  if (!name || typeof name !== "string") return "AS";
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) {
    return parts[0].substring(0, 2).toUpperCase();
  }
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<UserRecord | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUser = useCallback(async () => {
    try {
      const res = await fetch("/api/auth/me", {
        method: "GET",
        headers: { "Cache-Control": "no-cache" },
      });

      if (res.ok) {
        const data = await res.json();
        if (data.success && data.user) {
          setUser(data.user);
          setError(null);
          return;
        }
      }

      // If no valid session exists, set user to null
      setUser(null);
    } catch (err: any) {
      console.error("[Auth Context] Error fetching current user:", err);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  const login = async (identifier: string, password: string) => {
    setLoading(true);
    setError(null);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier, password }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      let data: any;
      try {
        data = await res.json();
      } catch {
        data = { success: false, error: "Authentication service returned an invalid response." };
      }

      if (!res.ok || !data.success) {
        const errMessage =
          data.error || "Invalid credentials. Please verify your email and password.";
        setError(errMessage);
        return { success: false, error: errMessage };
      }

      setUser(data.user);
      return { success: true, user: data.user };
    } catch (err: any) {
      clearTimeout(timeoutId);
      let errMessage = "Authentication service unavailable. Please try again.";
      if (err.name === "AbortError") {
        errMessage = "Authentication service is taking too long to respond. Please try again.";
      }
      setError(errMessage);
      return { success: false, error: errMessage };
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
      });
    } catch (err) {
      console.error("[Auth Context] Logout error:", err);
    } finally {
      setUser(null);
      router.push("/login");
    }
  };

  const updateProfile = async (
    nameOrData: string | { name: string; agencyDivision?: string },
    divisionArg?: string
  ) => {
    try {
      const targetName =
        typeof nameOrData === "string" ? nameOrData : nameOrData.name;
      const targetDivision =
        typeof nameOrData === "string" ? divisionArg : nameOrData.agencyDivision;

      const res = await fetch("/api/users/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: targetName, agencyDivision: targetDivision }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        return {
          success: false,
          error: data.error || "Failed to update profile. Please try again.",
        };
      }

      // Immediately update local state so all headers and sidebars reflect the change
      setUser(data.user);
      return { success: true };
    } catch (err: any) {
      console.error("[Auth Context] Update profile error:", err);
      return {
        success: false,
        error: "Network error occurred while saving profile.",
      };
    }
  };

  // Compute initials fallback
  const initials = user ? getInitials(user.name) : "AS";

  return (
    <AuthContext.Provider
      value={{
        user,
        initials,
        loading,
        error,
        login,
        logout,
        updateProfile,
        refreshUser: fetchUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
