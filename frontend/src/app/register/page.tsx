"use client"

import React, { useState, useEffect } from "react"
import type { User } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Link, Loader2, Moon, Sun } from "lucide-react"
import { apiFetch } from "@/lib/api"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"

type Status = {
  type: "success" | "warning" | "error";
  message: string;
} | null;

export default function RegisterPage() {
  const [formData, setFormData] = useState<Partial<User>>({ role_name: "patient" })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [status, setStatus] = useState<Status>(null)
  const [theme, setTheme] = useState<"light" | "dark">("light")

  // --- Theme Persistence ---
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") as "light" | "dark" | null
    if (savedTheme) {
      setTheme(savedTheme)
      document.documentElement.classList.toggle("dark", savedTheme === "dark")
    } else {
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches
      const initialTheme = prefersDark ? "dark" : "light"
      setTheme(initialTheme)
      document.documentElement.classList.toggle("dark", prefersDark)
    }
  }, [])

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light"
    setTheme(newTheme)
    localStorage.setItem("theme", newTheme)
    document.documentElement.classList.toggle("dark", newTheme === "dark")
  }

  // --- Handle Input ---
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  // --- Submit Form ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setStatus(null)

    try {
      const { res, data } = await apiFetch("/api/users/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      console.log("Response:", data, "Status:", res.status)

      if (res.status === 201) {
        setStatus({ type: "success", message: data.message || "User created!" })
        setFormData({
          role_name: "patient",
          name: "",
          email: "",
          password: "",
          phone: "",
          dateOfBirth: "",
          blood_group: "",
          address: "",
          emergency_contact: "",
          avatar: "",
          specialization: "",
        })
      } else if (res.status === 400) {
        setStatus({ type: "warning", message: data.error || "Invalid input" })
      } else {
        setStatus({ type: "error", message: data.error || "Server error" })
      }
    } catch (err: any) {
      setStatus({ type: "error", message: err.message || "Something went wrong" })
    } finally {
      setIsSubmitting(false)
    }
  }

  // --- Auto-hide Status ---
  useEffect(() => {
    if (status) {
      const timer = setTimeout(() => setStatus(null), 4000)
      return () => clearTimeout(timer)
    }
  }, [status])

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-primary/5 via-background to-accent/5 p-4 transition-colors duration-300">
      {/* Top-right Theme Toggle */}
      <div className="absolute top-4 right-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleTheme}
          aria-label="Toggle theme"
          className="rounded-full"
        >
          {theme === "dark" ? (
            <Sun className="h-5 w-5" />
          ) : (
            <Moon className="h-5 w-5" />
          )}
        </Button>
      </div>

      <Card className="w-full max-w-md shadow-lg transition-all">
        <CardHeader className="text-center space-y-1">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary">
            <Loader2 className="h-6 w-6 text-primary-foreground animate-spin" />
          </div>
          <CardTitle className="text-2xl font-bold">MediMind AI</CardTitle>
          <CardDescription>Register as a new user</CardDescription>
        </CardHeader>

        <CardContent>
          {status && (
            <div
              className={`p-3 rounded-md mb-4 text-white text-center ${
                status.type === "success"
                  ? "bg-green-500"
                  : status.type === "warning"
                  ? "bg-yellow-500"
                  : "bg-red-500"
              }`}
            >
              {status.message}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label>Full Name</Label>
              <Input
                name="name"
                value={formData.name || ""}
                onChange={handleChange}
                required
              />
            </div>

            <div>
              <Label>Email</Label>
              <Input
                type="email"
                name="email"
                value={formData.email || ""}
                onChange={handleChange}
                required
              />
            </div>

            <div>
              <Label>Password</Label>
              <Input
                type="password"
                name="password"
                value={formData.password || ""}
                onChange={handleChange}
                required
              />
            </div>

            <div>
              <Label>Phone</Label>
              <Input
                type="tel"
                name="phone"
                value={formData.phone || ""}
                onChange={handleChange}
              />
            </div>

            <div>
              <Label>Date of Birth</Label>
              <Input
                type="date"
                name="dateOfBirth"
                value={formData.dateOfBirth || ""}
                onChange={handleChange}
              />
            </div>

            <div>
              <Label>Blood Group</Label>
              <Input
                name="blood_group"
                value={formData.blood_group || ""}
                onChange={handleChange}
              />
            </div>

            <div>
              <Label>Address</Label>
              <Input
                name="address"
                value={formData.address || ""}
                onChange={handleChange}
              />
            </div>

            <div>
              <Label>Emergency Contact</Label>
              <Input
                name="emergency_contact"
                value={formData.emergency_contact || ""}
                onChange={handleChange}
              />
            </div>

            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Registering...
                </>
              ) : (
                "Register"
              )}
            </Button>
            <div className="mt-6 text-center text-sm text-muted-foreground">
            <p>
               Already have an account?{" "}
              <Link href="/login" className="text-blue-600 hover:underline">
                Login
              </Link>
            </p>
          </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
