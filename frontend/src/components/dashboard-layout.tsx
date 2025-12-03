"use client";

import { useState, useEffect, ReactNode } from "react";
import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuItem,
  DropdownMenuContent,
} from "@/components/ui/dropdown-menu";

import { Menu, X, Activity, Sun, Moon } from "lucide-react";
import ProtectedRoute from "./auth/ProtectedRoute";

interface Props {
  children: ReactNode;
  navigation: ReactNode;
  allowedRoles?: string[];
}

export function DashboardLayout({ children, navigation, allowedRoles }: Props) {
  const { user, logout } = useAuth();
  const router = useRouter();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [theme, setTheme] = useState<"light" | "dark">("light");

  // Theme detection
  useEffect(() => {
    const saved = localStorage.getItem("theme") as "light" | "dark" | null;
    const detected =
      saved ?? (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");

    setTheme(detected);
    document.documentElement.classList.toggle("dark", detected === "dark");
  }, []);

  const toggleTheme = () => {
    const next = theme === "light" ? "dark" : "light";
    setTheme(next);
    localStorage.setItem("theme", next);
    document.documentElement.classList.toggle("dark", next === "dark");
  };

  // Safe user info
  const userInfo = user
    ? {
        name: user.name || "User",
        email: user.email || "",
        role: user.role_name || "",
        avatar: user.avatar || null,
      }
    : null;

  const initials = userInfo?.name
    ? userInfo.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
    : "U";

  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };

  return (
    <ProtectedRoute allowedRoles={allowedRoles}>
      <div className="flex min-h-screen flex-col">
        {/* Header */}
        <header className="sticky top-0 z-50 h-16 border-b bg-card flex items-center justify-between px-4 md:px-6">
          {/* LEFT */}
          <div className="flex items-center gap-3">
            <button
              className="md:hidden rounded-md p-2 hover:bg-accent"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              {sidebarOpen ? <X /> : <Menu />}
            </button>

            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <Activity className="h-5 w-5 text-primary-foreground" />
            </div>

            <div>
              <h1 className="text-lg font-semibold">MediMind AI</h1>
              <p className="text-xs text-muted-foreground capitalize">
                {userInfo?.role || ""}
              </p>
            </div>
          </div>

          {/* RIGHT */}
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={toggleTheme}>
              {theme === "dark" ? <Sun /> : <Moon />}
            </Button>

            {/* Profile Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  className="rounded-full h-10 w-10 flex items-center justify-center"
                >
                  <Avatar className="h-10 w-10 cursor-pointer">
                    {userInfo?.avatar ? (
                      <AvatarImage src={userInfo.avatar} alt={userInfo?.name || "User Avatar"} />
                    ) : (
                      <AvatarFallback>{initials}</AvatarFallback>
                    )}
                  </Avatar>
                </button>
              </DropdownMenuTrigger>

              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium">{userInfo?.name}</p>
                    <p className="text-xs text-muted-foreground">{userInfo?.email}</p>
                  </div>
                </DropdownMenuLabel>

                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => router.push("/profile")}>
                  Profile
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleLogout}>Logout</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* BODY */}
        <div className="flex flex-1">
          {/* Desktop Sidebar */}
          <aside className="hidden md:block w-64 border-r bg-card p-4">{navigation}</aside>

          {/* Mobile Sidebar overlay */}
          {sidebarOpen && (
            <div
              className="fixed inset-0 bg-black/40 z-40 md:hidden"
              onClick={() => setSidebarOpen(false)}
            />
          )}

          {/* Mobile Sidebar */}
          <div
            className={`fixed top-0 left-0 z-50 h-full w-64 bg-card border-r shadow-lg p-4 transform transition-transform md:hidden ${
              sidebarOpen ? "translate-x-0" : "-translate-x-full"
            }`}
          >
            {navigation}
          </div>

          {/* Main Content */}
          <main className="flex-1 p-4 md:p-6">{children}</main>
        </div>
      </div>
    </ProtectedRoute>
  );
}
