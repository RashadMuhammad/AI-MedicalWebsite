"use client"

import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Users, Calendar, Activity, Settings, Building2, FileText, DollarSign, Clock ,Workflow} from "lucide-react"
import { mockAppointments } from "@/lib/mock-data"
import Link from "next/link"

function AdminNavigation() {
  const navItems = [
    { href: "/admin", icon: Activity, label: "Dashboard" },
    { href: "/admin/users", icon: Users, label: "User Management" },
    { href: "/admin/departments", icon: Building2, label: "Departments" },
    { href: "/admin/appointments", icon: Calendar, label: "Appointments" },
    { href: "/admin/billing", icon: DollarSign, label: "Billing & Finance" },
    { href: "/admin/reports", icon: FileText, label: "Reports" },
    { href: "/admin/services", icon: Workflow, label: "Services" },
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

export default function AdminAppointmentsPage() {
  return (
    <DashboardLayout navigation={<AdminNavigation />} allowedRoles={["admin"]}>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">All Appointments</h1>
          <p className="text-muted-foreground">System-wide appointment overview</p>
        </div>

        <div className="space-y-4">
          {mockAppointments.map((appointment) => (
            <Card key={appointment.appointment_id}>
              <CardContent className="pt-6">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                  <div className="flex items-start gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                      <Calendar className="h-6 w-6 text-primary" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold">{appointment.patientname}</h3>
                        <span className="text-muted-foreground">→</span>
                        <span className="text-sm text-muted-foreground">{appointment.doctor_name}</span>
                      </div>
                      <p className="mt-1 text-sm text-muted-foreground">{appointment.reason}</p>
                      <div className="mt-2 flex flex-wrap gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {appointment.appointment_date}
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {appointment.time}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{appointment.appointment_type}</Badge>
                    <Badge
                      variant={
                        appointment.status === "scheduled"
                          ? "default"
                          : appointment.status === "completed"
                            ? "secondary"
                            : "destructive"
                      }
                    >
                      {appointment.status}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </DashboardLayout>
  )
}
