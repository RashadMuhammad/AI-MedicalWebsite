"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
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
import { apiFetch } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"
import type { Role, User } from "@/lib/types"

type Status =
  | {
      type: "success" | "warning" | "error"
      message: string
    }
  | null

//
// Sidebar Navigation
//
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
        <Button asChild key={item.href} variant="ghost" className="w-full justify-start">
          <Link href={item.href}>
            <item.icon className="mr-2 h-4 w-4" /> {item.label}
          </Link>
        </Button>
      ))}
    </>
  )
}

export default function UsersPage() {
  const { toast } = useToast()
  const [searchQuery, setSearchQuery] = useState("")
  const [activeTab, setActiveTab] = useState<string>("")
  const [counts, setCounts] = useState<Record<string, number>>({})
  const [usersByRole, setUsersByRole] = useState<Record<string, User[]>>({})
  const [isAddUserOpen, setIsAddUserOpen] = useState(false)
  const [roles, setRoles] = useState<Role[]>([])
  const [selectedRole, setSelectedRole] = useState<string>("")
  const [formData, setFormData] = useState<Partial<User>>({ role: undefined })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [status, setStatus] = useState<Status>(null)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)

  // Fetch users grouped by role
  const fetchUsersByRole = async (role?: string) => {
    try {
      const query = role ? `?role=${role}` : ""
      const { data } = await apiFetch(`/api/users/by-role${query}`)
      setUsersByRole(data.data || {})
    } catch (err) {
      console.error("Error fetching users by role:", err)
    }
  }

  // Fetch counts per role
  useEffect(() => {
    const fetchCounts = async () => {
      try {
        const { data } = await apiFetch("/api/users/count-by-role")
        const countsObj: Record<string, number> = {}
        data?.data?.forEach((item: any) => {
          countsObj[item.role_name] = Number(item.user_count)
        })
        setCounts(countsObj)
        const firstRole = Object.keys(countsObj)[0]
        if (firstRole) setActiveTab(firstRole)
      } catch (err) {
        console.error("Error fetching counts:", err)
      }
    }
    fetchCounts()
  }, [])

  // Fetch all users initially
  useEffect(() => {
    fetchUsersByRole()
  }, [])

  // Fetch all roles
  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const { data } = await apiFetch("/api/roles/allroles")
        setRoles(data)
      } catch (err) {
        console.error("Error fetching roles:", err)
      }
    }
    fetchRoles()
  }, [])

  // Handle Add User
  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setStatus(null)
    try {
      const { res, data } = await apiFetch("/api/users/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })
      if (res.status === 201) {
        toast({
          title: "✅ User Added",
          description: "New user has been added successfully.",
        })
        setFormData({ role: undefined, name: "", email: "", phone: "", password: "" })
        setSelectedRole("")
        setIsAddUserOpen(false)
        fetchUsersByRole()
      } else {
        setStatus({ type: "error", message: data.error || "Server error" })
      }
    } catch (err: any) {
      setStatus({ type: "error", message: err.message || "Something went wrong" })
    } finally {
      setIsSubmitting(false)
    }
  }

  const filterUsers = (users: User[]) => {
    return users.filter(
      (user) =>
        user.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchQuery.toLowerCase())
    )
  }

  const handleTabChange = async (role: string) => {
    setActiveTab(role)
    await fetchUsersByRole(role)
  }

  const handleUserClick = (user: User) => {
    setSelectedUser(user)
  }

  return (
    <DashboardLayout navigation={<AdminNavigation />}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">User Management</h1>
            <p className="text-muted-foreground">Manage all system users by role</p>
          </div>
          <Dialog open={isAddUserOpen} onOpenChange={setIsAddUserOpen}>
            <DialogTrigger asChild>
              <Button>
                <UserPlus className="mr-2 h-4 w-4" /> Add User
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New User</DialogTitle>
                <DialogDescription>Create a new user account</DialogDescription>
              </DialogHeader>

              <form onSubmit={handleAddUser} className="space-y-4">
                <div>
                  <Label>User Role</Label>
                  <Select
                    value={selectedRole}
                    onValueChange={(v) => {
                      setSelectedRole(v)
                      setFormData({ ...formData, role: v as User["role"] })
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                      {roles.map((role) => (
                        <SelectItem key={role.role_name} value={role.role_name}>
                          {role.role_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Full Name</Label>
                  <Input
                    type="text"
                    value={formData.name || ""}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <Label>Email</Label>
                  <Input
                    type="email"
                    value={formData.email || ""}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <Label>Phone</Label>
                  <Input
                    type="tel"
                    value={formData.phone || ""}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <Label>Password</Label>
                  <Input
                    type="password"
                    value={formData.password || ""}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    required
                  />
                </div>

                <Button type="submit" className="w-full" disabled={isSubmitting}>
                  {isSubmitting ? "Creating..." : "Create User"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Search */}
        <Card>
          <CardContent className="pt-6 flex items-center gap-2">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search users by name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="max-w-md"
            />
          </CardContent>
        </Card>

        {/* ===== Scrollable Tabs ===== */}
        <Tabs value={activeTab} onValueChange={handleTabChange}>
          <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-100">
            <TabsList className="flex w-max min-w-full gap-2 bg-muted rounded-lg p-2">
              {Object.entries(counts).map(([role, count]) => (
                <TabsTrigger
                  key={role}
                  value={role}
                  className="data-[state=active]:bg-background data-[state=active]:shadow-sm 
                  px-4 py-2 rounded-md text-sm font-medium whitespace-nowrap border border-transparent 
                  hover:bg-background transition-colors"
                >
                  {role.charAt(0).toUpperCase() + role.slice(1)} ({count})
                </TabsTrigger>
              ))}
            </TabsList>
          </div>

          {Object.entries(usersByRole).map(([role_name, users]) => (
            <TabsContent key={role_name} value={role_name} className="mt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filterUsers(users).map((user) => (
                  <Card key={user.id || user.email} className="rounded-xl shadow-sm hover:shadow-md transition">
                    <CardContent className="flex items-start gap-4 p-6">
                      <Avatar className="h-12 w-12">
                        <AvatarFallback className="bg-teal-600 text-white">
                          {(user.name || "U").split(" ").map((n) => n[0]).join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 space-y-1">
                        <h3 className="font-semibold text-lg">{user.name}</h3>
                        <p className="text-sm text-muted-foreground flex items-center gap-2">
                          <Mail className="h-4 w-4" /> {user.email}
                        </p>
                        <p className="text-sm text-muted-foreground flex items-center gap-2">
                          <Phone className="h-4 w-4" /> {user.phone}
                        </p>
                        <p className="text-sm text-muted-foreground flex items-center gap-2">
                          <Calendar className="h-4 w-4" /> Joined: {user.created_at || "N/A"}
                        </p>
                      </div>
                      <div className="flex flex-col gap-2">
                        <Button variant="outline" size="sm">Edit</Button>
                        <Button variant="secondary" size="sm" onClick={() => handleUserClick(user)}>View</Button>
                        <Button variant="destructive" size="sm">Deactivate</Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          ))}
        </Tabs>

        {/* ===== User Details Dialog ===== */}
        {selectedUser && (
          <Dialog open={!!selectedUser} onOpenChange={() => setSelectedUser(null)}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{selectedUser.role?.toUpperCase()} DETAILS</DialogTitle>
                <DialogDescription>Complete profile information</DialogDescription>
              </DialogHeader>
              <div className="space-y-3 text-sm">
                <p><strong>Name:</strong> {selectedUser.name}</p>
                <p><strong>Email:</strong> {selectedUser.email}</p>
                <p><strong>Phone:</strong> {selectedUser.phone}</p>
                {selectedUser.specialization && <p><strong>Specialization:</strong> {selectedUser.specialization}</p>}
                <p><strong>Joined:</strong> {selectedUser.created_at || "N/A"}</p>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </DashboardLayout>
  )
}
