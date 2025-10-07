"use client"

import { useAuth } from "@/lib/auth-context"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Calendar, FileText, CreditCard, Video, Activity, Clock, User } from "lucide-react"
import Link from "next/link"
import { mockAppointments, mockMedicalRecords, mockBills } from "@/lib/mock-data"

function PatientNavigation() {
  const navItems = [
    { href: "/patient", icon: Activity, label: "Dashboard" },
    { href: "/patient/appointments", icon: Calendar, label: "Appointments" },
    { href: "/patient/records", icon: FileText, label: "Medical Records" },
    { href: "/patient/billing", icon: CreditCard, label: "Billing" },
    { href: "/patient/teleconsult", icon: Video, label: "Teleconsultation" },
    { href: "/patient/profile", icon: User, label: "Profile" },
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

export default function PatientDashboard() {
  const { user } = useAuth()

  // Filter data for current patient
  const patientAppointments = mockAppointments.filter((apt) => apt.patientId === user?.id)
  const upcomingAppointments = patientAppointments.filter((apt) => apt.status === "scheduled")
  const patientRecords = mockMedicalRecords.filter((record) => record.patientId === user?.id)
  const patientBills = mockBills.filter((bill) => bill.patientId === user?.id)
  const pendingBills = patientBills.filter((bill) => bill.status === "pending" || bill.status === "overdue")

  return (
    <DashboardLayout navigation={<PatientNavigation />}>
      <div className="space-y-6">
        {/* Welcome Section */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Welcome back, {user?.name?.split(" ")[0]}</h1>
          <p className="text-muted-foreground">Here's your health overview</p>
        </div>

        {/* Quick Stats */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Upcoming Appointments</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{upcomingAppointments.length}</div>
              <p className="text-xs text-muted-foreground">Next: {upcomingAppointments[0]?.date || "None scheduled"}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Medical Records</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{patientRecords.length}</div>
              <p className="text-xs text-muted-foreground">Total records available</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Bills</CardTitle>
              <CreditCard className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{pendingBills.length}</div>
              <p className="text-xs text-muted-foreground">
                {pendingBills.length > 0 ? "Action required" : "All paid"}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Health Score</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">85%</div>
              <p className="text-xs text-success">Good health status</p>
            </CardContent>
          </Card>
        </div>

        {/* Upcoming Appointments */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Upcoming Appointments</CardTitle>
                <CardDescription>Your scheduled consultations</CardDescription>
              </div>
              <Link href="/patient/appointments">
                <Button>Book New</Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {upcomingAppointments.length > 0 ? (
              <div className="space-y-4">
                {upcomingAppointments.slice(0, 3).map((appointment) => (
                  <div key={appointment.id} className="flex items-center justify-between rounded-lg border p-4">
                    <div className="flex items-center gap-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                        <Calendar className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">{appointment.doctorName}</p>
                        <p className="text-sm text-muted-foreground">{appointment.reason}</p>
                        <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          {appointment.date} at {appointment.time}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={appointment.type === "teleconsultation" ? "default" : "secondary"}>
                        {appointment.type}
                      </Badge>
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
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <Calendar className="mb-4 h-12 w-12 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">No upcoming appointments</p>
                <Link href="/patient/appointments">
                  <Button className="mt-4 bg-transparent" variant="outline">
                    Schedule Appointment
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Medical Records */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Recent Medical Records</CardTitle>
                <CardDescription>Your latest health records</CardDescription>
              </div>
              <Link href="/patient/records">
                <Button variant="outline">View All</Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {patientRecords.length > 0 ? (
              <div className="space-y-4">
                {patientRecords.slice(0, 2).map((record) => (
                  <div key={record.id} className="rounded-lg border p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="font-medium">{record.diagnosis}</p>
                        <p className="mt-1 text-sm text-muted-foreground">Date: {record.date}</p>
                        <div className="mt-2 flex flex-wrap gap-1">
                          {record.symptoms.slice(0, 3).map((symptom, idx) => (
                            <Badge key={idx} variant="outline">
                              {symptom}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <Link href="/patient/records">
                        <Button variant="ghost" size="sm">
                          View Details
                        </Button>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <FileText className="mb-4 h-12 w-12 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">No medical records yet</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common tasks and features</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Link href="/patient/appointments">
                <Button variant="outline" className="h-auto w-full flex-col gap-2 py-4 bg-transparent">
                  <Calendar className="h-6 w-6" />
                  <span>Book Appointment</span>
                </Button>
              </Link>
              <Link href="/patient/teleconsult">
                <Button variant="outline" className="h-auto w-full flex-col gap-2 py-4 bg-transparent">
                  <Video className="h-6 w-6" />
                  <span>Start Teleconsult</span>
                </Button>
              </Link>
              <Link href="/patient/records">
                <Button variant="outline" className="h-auto w-full flex-col gap-2 py-4 bg-transparent">
                  <FileText className="h-6 w-6" />
                  <span>View Records</span>
                </Button>
              </Link>
              <Link href="/patient/billing">
                <Button variant="outline" className="h-auto w-full flex-col gap-2 py-4 bg-transparent">
                  <CreditCard className="h-6 w-6" />
                  <span>Pay Bills</span>
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
