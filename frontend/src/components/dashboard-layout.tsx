"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Activity, LogOut, User, Menu, X } from "lucide-react"
import type { ReactNode } from "react"

interface DashboardLayoutProps {
  children: ReactNode
  navigation: ReactNode
}

export function DashboardLayout({ children, navigation }: DashboardLayoutProps) {
  const { user, logout } = useAuth()
  const router = useRouter()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const [userInfo, setUserInfo] = useState<{ name: string; email: string; role: string } | null>(null)

  const handleLogout = () => {
    logout()
    localStorage.removeItem("name")
    localStorage.removeItem("email")
    localStorage.removeItem("userRole")
    router.push("/login")
  }

useEffect(() => {
  // Fetch user info from localStorage if exists
  const name = localStorage.getItem("name") ?? ""  // fallback to empty string
  const email = localStorage.getItem("email") ?? ""
  const role = localStorage.getItem("userRole") ?? ""

  console.log("tesdd",name,email,role)

  if (name && email && role) {
    setUserInfo({ name, email, role })
  } else if (user) {
    // fallback to auth context and ensure strings
    const safeName = user.name ?? ""
    const safeEmail = user.email ?? ""
    const safeRole = user.role ?? ""

    setUserInfo({ name: safeName, email: safeEmail, role: safeRole })

    localStorage.setItem("userName", safeName)
    localStorage.setItem("userEmail", safeEmail)
    localStorage.setItem("userRole", safeRole)
  }
}, [user])


  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
  }

  const handleAvatarClick = (e: React.MouseEvent) => {
    e.stopPropagation() // Prevent dropdown from toggling
    if (userInfo) {
      router.push("/profile")
    }
  }

  return (
    <div className="flex min-h-screen flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-card">
        <div className="flex h-16 items-center justify-between px-4 md:px-6">
          <div className="flex items-center gap-2">
            {/* Mobile Menu Button */}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="md:hidden mr-2 rounded-md p-2 hover:bg-accent"
            >
              {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>

            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <Activity className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-lg font-semibold">MediMind AI</h1>
              <p className="text-xs text-muted-foreground">
                {userInfo?.role === "patient" && "Patient Portal"}
                {userInfo?.role === "doctor" && "Doctor Dashboard"}
              </p>
            </div>
          </div>

          {/* Profile Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <div>
                <Avatar
                  onClick={handleAvatarClick}
                  className="cursor-pointer h-10 w-10"
                >
                  <AvatarFallback className="bg-primary text-primary-foreground flex items-center justify-center">
                    {userInfo ? getInitials(userInfo.name) : "U"}
                  </AvatarFallback>
                </Avatar>
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium">{userInfo?.name}</p>
                  <p className="text-xs text-muted-foreground">{userInfo?.email}</p>
                  <p className="text-xs font-medium capitalize text-primary">{userInfo?.role}</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => router.push("/profile")}>
                <User className="mr-2 h-4 w-4" />
                Profile
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      {/* Layout Body */}
      <div className="flex flex-1">
        {/* Desktop Sidebar */}
        <aside className="hidden w-64 border-r bg-card md:block">
          <nav className="space-y-1 p-4">{navigation}</nav>
        </aside>

        {/* Mobile Sidebar (Drawer) */}
        <>
          {sidebarOpen && (
            <div
              className="fixed inset-0 z-40 bg-black/40 md:hidden"
              onClick={() => setSidebarOpen(false)}
            />
          )}
          <div
            className={`fixed top-0 left-0 z-50 h-full w-64 bg-card border-r shadow-lg transform transition-transform duration-300 md:hidden ${
              sidebarOpen ? "translate-x-0" : "-translate-x-full"
            }`}
          >
            <div className="flex items-center justify-between px-4 py-3 border-b">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                  <Activity className="h-5 w-5 text-primary-foreground" />
                </div>
                <h2 className="text-base font-semibold">MediMind AI</h2>
              </div>
              <button
                onClick={() => setSidebarOpen(false)}
                className="rounded-md p-1 hover:bg-accent"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <nav className="space-y-1 p-4">{navigation}</nav>
          </div>
        </>

        {/* Main Content */}
        <main className="flex-1 overflow-auto p-4 md:p-6">{children}</main>
      </div>
    </div>
  )
}
