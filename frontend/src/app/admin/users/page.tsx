"use client"

import type React from "react"

import { useState } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Users,
  UserPlus,
  Search,
  Mail,
  Phone,
  Calendar,
  Activity,
  Settings,
  Building2,
  FileText,
  DollarSign,
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import Link from "next/link"

function AdminNavigation() {
  const navItems = [
    { href: "/admin", icon: Activity, label: "Dashboard" },
    { href: "/admin/users", icon: Users, label: "User Management" },
    { href: "/admin/departments", icon: Building2, label: "Departments" },
    { href: "/admin/appointments", icon: Calendar, label: "Appointments" },
    { href: "/admin/billing", icon: DollarSign, label: "Billing & Finance" },
    { href: "/admin/reports", icon: FileText, label: "Reports" },
    { href: "/admin/settings", icon: Settings, label: "Settings" },
  ]

  return (
    <>
      {navItems.map((item) => (
        <Link key={item.href} href={item.href}>
          <Button variant="ghost" className="w-full justify-start">
            <item.icon className="mr-2 h-4 w-4" />
            {item.label}
          </Button>
        </Link>
      ))}
    </>
  )
}

// Mock user data
const mockUsers = {
  patients: [
    {
      id: "p1",
      name: "John Doe",
      email: "john.doe@email.com",
      phone: "+1234567890",
      status: "active",
      joinDate: "2024-01-15",
    },
    {
      id: "p2",
      name: "Jane Smith",
      email: "jane.smith@email.com",
      phone: "+1234567891",
      status: "active",
      joinDate: "2024-02-20",
    },
  ],
  doctors: [
    {
      id: "d1",
      name: "Dr. Sarah Smith",
      email: "sarah.smith@hospital.com",
      phone: "+1234567892",
      specialization: "Cardiology",
      status: "active",
      joinDate: "2023-06-10",
    },
    {
      id: "d2",
      name: "Dr. Michael Johnson",
      email: "michael.j@hospital.com",
      phone: "+1234567893",
      specialization: "General Medicine",
      status: "active",
      joinDate: "2023-08-15",
    },
  ],
  staff: [
    {
      id: "s1",
      name: "Admin User",
      email: "admin@hospital.com",
      phone: "+1234567894",
      role: "Administrator",
      status: "active",
      joinDate: "2023-01-01",
    },
  ],
}

export default function UsersPage() {
  const { toast } = useToast()
  const [searchQuery, setSearchQuery] = useState("")
  const [isAddUserOpen, setIsAddUserOpen] = useState(false)
  const [activeTab, setActiveTab] = useState("patients")

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    role: "",
    specialization: "",
  })

  const handleAddUser = (e: React.FormEvent) => {
    e.preventDefault()
    toast({
      title: "User Added",
      description: "New user has been added successfully.",
    })
    setIsAddUserOpen(false)
    setFormData({ name: "", email: "", phone: "", role: "", specialization: "" })
  }

  const filterUsers = (users: any[]) => {
    return users.filter(
      (user) =>
        user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase()),
    )
  }

  return (
    <DashboardLayout navigation={<AdminNavigation />}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">User Management</h1>
            <p className="text-muted-foreground">Manage patients, doctors, and staff</p>
          </div>
          <Dialog open={isAddUserOpen} onOpenChange={setIsAddUserOpen}>
            <DialogTrigger asChild>
              <Button>
                <UserPlus className="mr-2 h-4 w-4" />
                Add User
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New User</DialogTitle>
                <DialogDescription>Create a new user account</DialogDescription>
              </DialogHeader>
              <form onSubmit={handleAddUser} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="role">User Role</Label>
                  <Select value={formData.role} onValueChange={(v) => setFormData({ ...formData, role: v })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="patient">Patient</SelectItem>
                      <SelectItem value="doctor">Doctor</SelectItem>
                      <SelectItem value="staff">Staff</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    placeholder="Enter full name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="user@email.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    placeholder="+1234567890"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    required
                  />
                </div>

                {formData.role === "doctor" && (
                  <div className="space-y-2">
                    <Label htmlFor="specialization">Specialization</Label>
                    <Input
                      id="specialization"
                      placeholder="e.g., Cardiology"
                      value={formData.specialization}
                      onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
                    />
                  </div>
                )}

                <Button type="submit" className="w-full">
                  Create User
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Search */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <Search className="h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search users by name or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="max-w-md"
              />
            </div>
          </CardContent>
        </Card>

        {/* User Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="patients">Patients ({mockUsers.patients.length})</TabsTrigger>
            <TabsTrigger value="doctors">Doctors ({mockUsers.doctors.length})</TabsTrigger>
            <TabsTrigger value="staff">Staff ({mockUsers.staff.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="patients" className="space-y-4">
            {filterUsers(mockUsers.patients).map((user) => (
              <Card key={user.id}>
                <CardContent className="pt-6">
                  <div className="flex items-start gap-4">
                    <Avatar className="h-12 w-12">
                      <AvatarFallback className="bg-primary text-primary-foreground">
                        {user.name
  .split(" ")
  .map((n: string) => n[0])
  .join("")}

                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold">{user.name}</h3>
                        <Badge variant={user.status === "active" ? "secondary" : "destructive"}>{user.status}</Badge>
                      </div>
                      <div className="mt-2 space-y-1 text-sm text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <Mail className="h-3 w-3" />
                          {user.email}
                        </div>
                        <div className="flex items-center gap-2">
                          <Phone className="h-3 w-3" />
                          {user.phone}
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-3 w-3" />
                          Joined: {user.joinDate}
                        </div>
                      </div>
                      <div className="mt-4 flex gap-2">
                        <Button size="sm" variant="outline">
                          Edit
                        </Button>
                        <Button size="sm" variant="outline">
                          View Details
                        </Button>
                        <Button size="sm" variant="destructive">
                          Deactivate
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="doctors" className="space-y-4">
            {filterUsers(mockUsers.doctors).map((user) => (
              <Card key={user.id}>
                <CardContent className="pt-6">
                  <div className="flex items-start gap-4">
                    <Avatar className="h-12 w-12">
                      <AvatarFallback className="bg-primary text-primary-foreground">
                        {user.name
  .split(" ")
  .map((n: string) => n[0])
  .join("")}

                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold">{user.name}</h3>
                        <Badge variant="outline">{user.specialization}</Badge>
                        <Badge variant={user.status === "active" ? "secondary" : "destructive"}>{user.status}</Badge>
                      </div>
                      <div className="mt-2 space-y-1 text-sm text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <Mail className="h-3 w-3" />
                          {user.email}
                        </div>
                        <div className="flex items-center gap-2">
                          <Phone className="h-3 w-3" />
                          {user.phone}
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-3 w-3" />
                          Joined: {user.joinDate}
                        </div>
                      </div>
                      <div className="mt-4 flex gap-2">
                        <Button size="sm" variant="outline">
                          Edit
                        </Button>
                        <Button size="sm" variant="outline">
                          View Schedule
                        </Button>
                        <Button size="sm" variant="destructive">
                          Deactivate
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="staff" className="space-y-4">
            {filterUsers(mockUsers.staff).map((user) => (
              <Card key={user.id}>
                <CardContent className="pt-6">
                  <div className="flex items-start gap-4">
                    <Avatar className="h-12 w-12">
                      <AvatarFallback className="bg-primary text-primary-foreground">
                       {user.name
  .split(" ")
  .map((n: string) => n[0])
  .join("")}

                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold">{user.name}</h3>
                        <Badge variant="outline">{user.role}</Badge>
                        <Badge variant={user.status === "active" ? "secondary" : "destructive"}>{user.status}</Badge>
                      </div>
                      <div className="mt-2 space-y-1 text-sm text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <Mail className="h-3 w-3" />
                          {user.email}
                        </div>
                        <div className="flex items-center gap-2">
                          <Phone className="h-3 w-3" />
                          {user.phone}
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-3 w-3" />
                          Joined: {user.joinDate}
                        </div>
                      </div>
                      <div className="mt-4 flex gap-2">
                        <Button size="sm" variant="outline">
                          Edit
                        </Button>
                        <Button size="sm" variant="outline">
                          Permissions
                        </Button>
                        <Button size="sm" variant="destructive">
                          Deactivate
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  )
}
