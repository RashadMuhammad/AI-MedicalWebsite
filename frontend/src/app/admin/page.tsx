"use client"

import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Users,
  UserPlus,
  Calendar,
  DollarSign,
  Activity,
  TrendingUp,
  TrendingDown,
  Settings,
  Building2,
  FileText,
  AlertCircle,
  Workflow
} from "lucide-react"
import Link from "next/link"
import { mockAppointments, mockBills } from "@/lib/mock-data"

function AdminNavigation() {
  const navItems = [
    { href: "/admin", icon: Activity, label: "Dashboard" },
    { href: "/admin/users", icon: Users, label: "User Management" },
    { href: "/admin/departments", icon: Building2, label: "Departments" },
    { href: "/admin/appointments", icon: Calendar, label: "Appointments" },
    { href: "/admin/billing", icon: DollarSign, label: "Billing & Finance" },
    { href: "/admin/reports", icon: FileText, label: "Reports" },
    { href: "/admin/services", icon:Workflow , label: "Services" },
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

export default function AdminDashboard() {
  const totalRevenue = mockBills.reduce((sum, bill) => sum + bill.total, 0)
  const paidRevenue = mockBills.filter((b) => b.status === "paid").reduce((sum, b) => sum + b.total, 0)
  const pendingRevenue = totalRevenue - paidRevenue

  const totalAppointments = mockAppointments.length
  const completedAppointments = mockAppointments.filter((a) => a.status === "completed").length
  const scheduledAppointments = mockAppointments.filter((a) => a.status === "scheduled").length

  return (
    <DashboardLayout navigation={<AdminNavigation />} allowedRoles={["admin"]}>
      <div className="space-y-6">
        {/* Welcome Section */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
          <p className="text-muted-foreground">Hospital management and analytics</p>
        </div>

        {/* Key Metrics */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${totalRevenue.toFixed(2)}</div>
              <p className="flex items-center text-xs text-success">
                <TrendingUp className="mr-1 h-3 w-3" />
                +12.5% from last month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Patients</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">1,234</div>
              <p className="flex items-center text-xs text-success">
                <TrendingUp className="mr-1 h-3 w-3" />
                +8.2% from last month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Doctors</CardTitle>
              <UserPlus className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">45</div>
              <p className="flex items-center text-xs text-muted-foreground">
                <TrendingUp className="mr-1 h-3 w-3" />
                +2 new this month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Appointments Today</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{scheduledAppointments}</div>
              <p className="text-xs text-muted-foreground">{completedAppointments} completed</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Financial Overview */}
          <Card>
            <CardHeader>
              <CardTitle>Financial Overview</CardTitle>
              <CardDescription>Revenue and billing statistics</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between rounded-lg border p-4">
                <div>
                  <p className="text-sm text-muted-foreground">Paid Revenue</p>
                  <p className="text-2xl font-bold text-success">${paidRevenue.toFixed(2)}</p>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-success/10">
                  <DollarSign className="h-6 w-6 text-success" />
                </div>
              </div>

              <div className="flex items-center justify-between rounded-lg border p-4">
                <div>
                  <p className="text-sm text-muted-foreground">Pending Revenue</p>
                  <p className="text-2xl font-bold text-warning">${pendingRevenue.toFixed(2)}</p>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-warning/10">
                  <DollarSign className="h-6 w-6 text-warning" />
                </div>
              </div>

              <div className="flex items-center justify-between rounded-lg border p-4">
                <div>
                  <p className="text-sm text-muted-foreground">Total Invoices</p>
                  <p className="text-2xl font-bold">{mockBills.length}</p>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                  <FileText className="h-6 w-6 text-primary" />
                </div>
              </div>

              <Link href="/admin/billing">
                <Button className="w-full bg-transparent" variant="outline">
                  View Full Report
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* System Alerts */}
          <Card>
            <CardHeader>
              <CardTitle>System Alerts</CardTitle>
              <CardDescription>Important notifications and updates</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-3 rounded-lg border border-destructive/50 bg-destructive/5 p-3">
                <AlertCircle className="h-5 w-5 text-destructive" />
                <div className="flex-1">
                  <p className="font-medium">Server Maintenance Required</p>
                  <p className="text-sm text-muted-foreground">Database backup scheduled for tonight at 2 AM</p>
                  <Button size="sm" variant="destructive" className="mt-2">
                    View Details
                  </Button>
                </div>
              </div>

              <div className="flex items-start gap-3 rounded-lg border border-warning/50 bg-warning/5 p-3">
                <AlertCircle className="h-5 w-5 text-warning" />
                <div className="flex-1">
                  <p className="font-medium">License Renewal Due</p>
                  <p className="text-sm text-muted-foreground">3 doctor licenses expiring in 30 days</p>
                  <Button size="sm" variant="outline" className="mt-2 bg-transparent">
                    Manage Licenses
                  </Button>
                </div>
              </div>

              <div className="flex items-start gap-3 rounded-lg border p-3">
                <Activity className="h-5 w-5 text-primary" />
                <div className="flex-1">
                  <p className="font-medium">System Update Available</p>
                  <p className="text-sm text-muted-foreground">New features and security patches ready</p>
                  <Button size="sm" variant="outline" className="mt-2 bg-transparent">
                    Update Now
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Department Performance */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Department Performance</CardTitle>
                <CardDescription>Activity across hospital departments</CardDescription>
              </div>
              <Link href="/admin/departments">
                <Button variant="outline">Manage Departments</Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { name: "Cardiology", patients: 234, revenue: 45600, trend: "up" },
                { name: "Pediatrics", patients: 189, revenue: 32400, trend: "up" },
                { name: "Orthopedics", patients: 156, revenue: 38900, trend: "down" },
                { name: "General Medicine", patients: 445, revenue: 52300, trend: "up" },
              ].map((dept) => (
                <div key={dept.name} className="flex items-center justify-between rounded-lg border p-4">
                  <div className="flex items-center gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                      <Building2 className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">{dept.name}</p>
                      <p className="text-sm text-muted-foreground">{dept.patients} patients</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="font-semibold">${dept.revenue.toLocaleString()}</p>
                      <p className="flex items-center text-xs text-muted-foreground">
                        {dept.trend === "up" ? (
                          <>
                            <TrendingUp className="mr-1 h-3 w-3 text-success" />
                            <span className="text-success">+5.2%</span>
                          </>
                        ) : (
                          <>
                            <TrendingDown className="mr-1 h-3 w-3 text-destructive" />
                            <span className="text-destructive">-2.1%</span>
                          </>
                        )}
                      </p>
                    </div>
                    <Badge variant="secondary">Active</Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common administrative tasks</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Link href="/admin/users">
                <Button variant="outline" className="h-auto w-full flex-col gap-2 py-4 bg-transparent">
                  <Users className="h-6 w-6" />
                  <span>Manage Users</span>
                </Button>
              </Link>
              <Link href="/admin/departments">
                <Button variant="outline" className="h-auto w-full flex-col gap-2 py-4 bg-transparent">
                  <Building2 className="h-6 w-6" />
                  <span>Departments</span>
                </Button>
              </Link>
              <Link href="/admin/reports">
                <Button variant="outline" className="h-auto w-full flex-col gap-2 py-4 bg-transparent">
                  <FileText className="h-6 w-6" />
                  <span>Generate Report</span>
                </Button>
              </Link>
              <Link href="/admin/settings">
                <Button variant="outline" className="h-auto w-full flex-col gap-2 py-4 bg-transparent">
                  <Settings className="h-6 w-6" />
                  <span>System Settings</span>
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
