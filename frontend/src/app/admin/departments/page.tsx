"use client"

import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Users, Calendar, Activity, Settings, Building2, FileText, DollarSign, TrendingUp } from "lucide-react"
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

const departments = [
  {
    id: 1,
    name: "Cardiology",
    head: "Dr. Sarah Smith",
    doctors: 8,
    patients: 234,
    revenue: 45600,
    status: "active",
  },
  {
    id: 2,
    name: "Pediatrics",
    head: "Dr. Emily Brown",
    doctors: 6,
    patients: 189,
    revenue: 32400,
    status: "active",
  },
  {
    id: 3,
    name: "Orthopedics",
    head: "Dr. Robert Wilson",
    doctors: 5,
    patients: 156,
    revenue: 38900,
    status: "active",
  },
  {
    id: 4,
    name: "General Medicine",
    head: "Dr. Michael Johnson",
    doctors: 12,
    patients: 445,
    revenue: 52300,
    status: "active",
  },
]

export default function DepartmentsPage() {
  return (
    <DashboardLayout navigation={<AdminNavigation />}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Departments</h1>
            <p className="text-muted-foreground">Manage hospital departments</p>
          </div>
          <Button>Add Department</Button>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {departments.map((dept) => (
            <Card key={dept.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                      <Building2 className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <CardTitle>{dept.name}</CardTitle>
                      <CardDescription>Head: {dept.head}</CardDescription>
                    </div>
                  </div>
                  <Badge variant="secondary">{dept.status}</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Doctors</p>
                    <p className="text-2xl font-bold">{dept.doctors}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Patients</p>
                    <p className="text-2xl font-bold">{dept.patients}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Revenue</p>
                    <p className="text-2xl font-bold">${(dept.revenue / 1000).toFixed(0)}k</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-sm text-success">
                  <TrendingUp className="h-4 w-4" />
                  <span>+5.2% from last month</span>
                </div>

                <div className="flex gap-2">
                  <Button size="sm" variant="outline" className="flex-1 bg-transparent">
                    View Details
                  </Button>
                  <Button size="sm" variant="outline" className="flex-1 bg-transparent">
                    Manage Staff
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </DashboardLayout>
  )
}
