"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import type { User, UserRole } from "./types"

interface AuthContextType {
  user: User | null
  login: (email: string, password: string, role: UserRole) => Promise<void>
  logout: () => void
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Mock users for demonstration
const MOCK_USERS: Record<string, { password: string; user: User }> = {
  "patient@hospital.com": {
    password: "patient123",
    user: {
      id: "p1",
      email: "patient@hospital.com",
      name: "John Doe",
      role: "patient",
      phone: "+1234567890",
      dateOfBirth: "1990-05-15",
      bloodGroup: "O+",
      address: "123 Main St, City, State",
      emergencyContact: "+1234567899",
    },
  },
  "doctor@hospital.com": {
    password: "doctor123",
    user: {
      id: "d1",
      email: "doctor@hospital.com",
      name: "Dr. Sarah Smith",
      role: "doctor",
      phone: "+1234567891",
      specialization: "Cardiology",
      department: "Cardiology",
    },
  },
  "admin@hospital.com": {
    password: "admin123",
    user: {
      id: "a1",
      email: "admin@hospital.com",
      name: "Admin User",
      role: "admin",
      phone: "+1234567892",
      department: "Administration",
    },
  },
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check for stored user session
    const storedUser = localStorage.getItem("hospital_user")
    if (storedUser) {
      setUser(JSON.parse(storedUser))
    }
    setIsLoading(false)
  }, [])

  const login = async (email: string, password: string, role: UserRole) => {
    setIsLoading(true)

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))

    const userRecord = MOCK_USERS[email]

    if (!userRecord || userRecord.password !== password || userRecord.user.role !== role) {
      setIsLoading(false)
      throw new Error("Invalid credentials or role")
    }

    setUser(userRecord.user)
    localStorage.setItem("hospital_user", JSON.stringify(userRecord.user))
    setIsLoading(false)
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem("hospital_user")
  }

  return <AuthContext.Provider value={{ user, login, logout, isLoading }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
