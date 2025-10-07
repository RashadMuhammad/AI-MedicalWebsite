"use client"

import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Users, Calendar, Activity, Settings, Building2, FileText, DollarSign } from "lucide-react"
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

export default function ReportsPage() {
  return (
    <DashboardLayout navigation={<AdminNavigation />}>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Reports</h1>
          <p className="text-muted-foreground">Generate and view system reports</p>
        </div>

        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <FileText className="mb-4 h-16 w-16 text-muted-foreground" />
            <h3 className="mb-2 text-xl font-semibold">Reports Coming Soon</h3>
            <p className="text-center text-muted-foreground">
              Advanced reporting features will be available in the next update
            </p>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
