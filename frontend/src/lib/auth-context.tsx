"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { useRouter } from "next/navigation"; // ✅ missing import
import type { User, UserRole } from "./types";
import { apiFetch } from "./api";

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<User>;
  logout: () => Promise<void>;
  setUser: (user: User | null) => void; // add this
  isLoading: boolean;
  roles: UserRole[];
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [roles, setRoles] = useState<UserRole[]>([]);
  const router = useRouter();

  // Load session
  useEffect(() => {
    const loadSession = async () => {
      try {
        const sessionId = localStorage.getItem("sessionId");
        if (!sessionId) {
          setIsLoading(false);
          return;
        }

        const { res, data } = await apiFetch(`/api/session/${sessionId}`, {
          method: "GET",
          credentials: "include",
        });

        if (res.ok) {
          setUser(data.user || data);
        } else {
          setUser(null);
        }
      } catch (err) {
        console.error("Session load failed:", err);
      } finally {
        setIsLoading(false);
      }
    };

    loadSession();
  }, []);

  // Fetch roles
  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const { data } = await apiFetch("/api/roles");
        setRoles(data);
      } catch (err) {
        console.error("Error fetching roles:", err);
      }
    };
    fetchRoles();
  }, []);

  // Login
  const login = async (email: string, password: string): Promise<User> => {
    setIsLoading(true);

    try {
      const { res, data } = await apiFetch("/api/users/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) throw new Error(data?.error || "Invalid credentials");

      if (data.sessionId) {
        localStorage.setItem("sessionId", data.sessionId);
      }

      const normalizedUser: User = {
        ...data.user,
        role_name: data.user.role || data.user.role_name,
      };

      setUser(normalizedUser);

      return normalizedUser;
    } finally {
      setIsLoading(false);
    }
  };

  // Logout
  const logout = async () => {
    try {
      await apiFetch("/api/logout", { method: "POST", credentials: "include" });
    } catch (err) {
      console.error(err);
    } finally {
      localStorage.removeItem("sessionId");
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{ user, setUser, login, logout, isLoading, roles }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
