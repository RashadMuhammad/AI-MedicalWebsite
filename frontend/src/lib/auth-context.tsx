"use client"

import React, { createContext, useContext, useState, useEffect } from "react"
import type { User, UserRole } from "./types"

interface AuthContextType {
  user: User | null
  login: (email: string, password: string, role: UserRole) => Promise<void>
  logout: () => void
  isLoading: boolean
  roles: UserRole[]
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [roles, setRoles] = useState<UserRole[]>([])

  // Load stored user session
  useEffect(() => {
    const storedUser = localStorage.getItem("hospital_user")
    if (storedUser) setUser(JSON.parse(storedUser))
    setIsLoading(false)
  }, [])

  // Fetch all roles from backend
  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const res = await fetch("/api/roles") // your SQL Server API endpoint
        const data: UserRole[] = await res.json()
        setRoles(data)
      } catch (err) {
        console.error("Failed to fetch roles:", err)
      }
    }
    fetchRoles()
  }, [])

  const login = async (email: string, password: string, role: UserRole) => {
    setIsLoading(true)
    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, role }),
      })

      if (!res.ok) {
        throw new Error("Invalid credentials or role")
      }

      const loggedUser: User = await res.json()
      setUser(loggedUser)
      localStorage.setItem("hospital_user", JSON.stringify(loggedUser))
    } catch (err) {
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem("hospital_user")
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading, roles }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error("useAuth must be used within an AuthProvider")
  return context
}
