"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import type { User, UserRole } from "./types";
import { apiFetch } from "./api";

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string, role: UserRole) => Promise<void>;
  logout: () => Promise<void>;
  isLoading: boolean;
  roles: UserRole[];
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [roles, setRoles] = useState<UserRole[]>([]);

useEffect(() => {
  const loadSession = async () => {
    try {
      const sessionId = localStorage.getItem("sessionId");

      if (!sessionId) {
        setIsLoading(false);
        return;
      }

      console.log("Session ID:", sessionId);

      // 🔥 Correct API call
      const { res, data } = await apiFetch(`/api/session/${sessionId}`, {
        method: "GET",
        credentials: "include",
      });

      console.log("Session Data From Backend:", data);

      if (res.ok) {
        setUser(data); 
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



  // ------------------------------
  // Fetch available roles
  // ------------------------------
  useEffect(() => {
      const fetchRoles = async () => {
    try {
      const { data } = await apiFetch("/api/roles");
      console.log("rashadddddd",data)
      setRoles(data);
    } catch (err) {
      console.error("Error fetching roles:", err);
    }
  };

    fetchRoles();
  }, []);

  // ------------------------------
  // Login
  // ------------------------------
  const login = async (email: string, password: string, role: UserRole) => {
    setIsLoading(true);

    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, password, role }),
      });

      if (!res.ok) {
        throw new Error("Invalid email, password, or role.");
      }

      const loginData = await res.json();

      // save session
      if (loginData.sessionId) {
        localStorage.setItem("sessionId", loginData.sessionId);
      }

      setUser(loginData.user);
    } finally {
      setIsLoading(false);
    }
  };

  // ------------------------------
  // Logout
  // ------------------------------
  const logout = async () => {
    await fetch("/api/logout", {
      method: "POST",
      credentials: "include",
    });

    localStorage.removeItem("sessionId");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading, roles }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
