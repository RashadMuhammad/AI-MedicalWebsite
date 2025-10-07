"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"
import { Activity, Loader2 } from "lucide-react"
import type { UserRole } from "@/lib/types"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [activeRole, setActiveRole] = useState<UserRole>("patient")
  const { login } = useAuth()
  const router = useRouter()
  const { toast } = useToast()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      await login(email, password, activeRole)
      toast({
        title: "Login successful",
        description: `Welcome back!`,
      })
      router.push(`/${activeRole}`)
    } catch (error) {
      toast({
        title: "Login failed",
        description: error instanceof Error ? error.message : "Invalid credentials",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const fillDemoCredentials = (role: UserRole) => {
    const credentials = {
      patient: { email: "patient@hospital.com", password: "patient123" },
      doctor: { email: "doctor@hospital.com", password: "doctor123" },
      admin: { email: "admin@hospital.com", password: "admin123" },
    }
    setEmail(credentials[role].email)
    setPassword(credentials[role].password)
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-primary/5 via-background to-accent/5 p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="space-y-1 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary">
            <Activity className="h-6 w-6 text-primary-foreground" />
          </div>
          <CardTitle className="text-2xl font-bold">MediMind AI</CardTitle>
          <CardDescription>Intelligent Hospital Management System</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeRole} onValueChange={(v) => setActiveRole(v as UserRole)}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="patient">Patient</TabsTrigger>
              <TabsTrigger value="doctor">Doctor</TabsTrigger>
              <TabsTrigger value="admin">Admin</TabsTrigger>
            </TabsList>

            <TabsContent value="patient" className="space-y-4">
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="patient@hospital.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Signing in...
                    </>
                  ) : (
                    "Sign in as Patient"
                  )}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="w-full bg-transparent"
                  onClick={() => fillDemoCredentials("patient")}
                >
                  Use Demo Credentials
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="doctor" className="space-y-4">
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email-doctor">Email</Label>
                  <Input
                    id="email-doctor"
                    type="email"
                    placeholder="doctor@hospital.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password-doctor">Password</Label>
                  <Input
                    id="password-doctor"
                    type="password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Signing in...
                    </>
                  ) : (
                    "Sign in as Doctor"
                  )}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="w-full bg-transparent"
                  onClick={() => fillDemoCredentials("doctor")}
                >
                  Use Demo Credentials
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="admin" className="space-y-4">
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email-admin">Email</Label>
                  <Input
                    id="email-admin"
                    type="email"
                    placeholder="admin@hospital.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password-admin">Password</Label>
                  <Input
                    id="password-admin"
                    type="password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Signing in...
                    </>
                  ) : (
                    "Sign in as Admin"
                  )}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="w-full bg-transparent"
                  onClick={() => fillDemoCredentials("admin")}
                >
                  Use Demo Credentials
                </Button>
              </form>
            </TabsContent>
          </Tabs>

          <div className="mt-6 text-center text-sm text-muted-foreground">
            <p>Demo Credentials:</p>
            <p className="mt-1">Patient: patient@hospital.com / patient123</p>
            <p>Doctor: doctor@hospital.com / doctor123</p>
            <p>Admin: admin@hospital.com / admin123</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
