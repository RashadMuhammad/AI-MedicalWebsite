"use client"

import { useAuth } from "@/lib/auth-context"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  Calendar,
  Users,
  FileText,
  Clock,
  Video,
  Activity,
  ClipboardList,
  Stethoscope,
  AlertCircle,
} from "lucide-react"
import Link from "next/link"
import { mockAppointments, mockMedicalRecords } from "@/lib/mock-data"

function DoctorNavigation() {
  const navItems = [
    { href: "/doctor", icon: Activity, label: "Dashboard" },
    { href: "/doctor/appointments", icon: Calendar, label: "Appointments" },
    { href: "/doctor/patients", icon: Users, label: "Patients" },
    { href: "/doctor/records", icon: FileText, label: "Medical Records" },
    { href: "/doctor/prescriptions", icon: ClipboardList, label: "Prescriptions" },
    { href: "/doctor/schedule", icon: Clock, label: "Schedule" },
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

export default function DoctorDashboard() {
  const { user } = useAuth()

  // Filter data for current doctor
  const doctorAppointments = mockAppointments.filter((apt) => apt.doctorId === user?.id)
  const todayAppointments = doctorAppointments.filter((apt) => apt.status === "scheduled")
  const completedToday = doctorAppointments.filter((apt) => apt.status === "completed")

  // Get unique patients
  const uniquePatients = new Set(doctorAppointments.map((apt) => apt.patientId))

  return (
    <DashboardLayout navigation={<DoctorNavigation />}>
      <div className="space-y-6">
        {/* Welcome Section */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Welcome, {user?.name}</h1>
          <p className="text-muted-foreground">
            {user?.specialization} • {user?.department}
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Today's Appointments</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{todayAppointments.length}</div>
              <p className="text-xs text-muted-foreground">{completedToday.length} completed</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Patients</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{uniquePatients.size}</div>
              <p className="text-xs text-muted-foreground">Active patients</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Reviews</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">3</div>
              <p className="text-xs text-muted-foreground">Lab results to review</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg. Consultation</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">25 min</div>
              <p className="text-xs text-muted-foreground">Per patient</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Today's Schedule */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Today's Schedule</CardTitle>
                  <CardDescription>Your appointments for today</CardDescription>
                </div>
                <Link href="/doctor/appointments">
                  <Button variant="outline" size="sm">
                    View All
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              {todayAppointments.length > 0 ? (
                <div className="space-y-4">
                  {todayAppointments.slice(0, 4).map((appointment) => (
                    <div key={appointment.id} className="flex items-center gap-4 rounded-lg border p-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                        <Clock className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">{appointment.patientName}</p>
                        <p className="text-sm text-muted-foreground">{appointment.reason}</p>
                        <p className="text-xs text-muted-foreground">{appointment.time}</p>
                      </div>
                      <div className="flex gap-2">
                        <Badge variant={appointment.type === "teleconsultation" ? "default" : "secondary"}>
                          {appointment.type === "teleconsultation" ? <Video className="mr-1 h-3 w-3" /> : null}
                          {appointment.type}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <Calendar className="mb-4 h-12 w-12 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">No appointments scheduled for today</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Urgent Alerts */}
          <Card>
            <CardHeader>
              <CardTitle>Urgent Alerts</CardTitle>
              <CardDescription>Patients requiring immediate attention</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start gap-4 rounded-lg border border-destructive/50 bg-destructive/5 p-3">
                  <AlertCircle className="h-5 w-5 text-destructive" />
                  <div className="flex-1">
                    <p className="font-medium">Critical Lab Result</p>
                    <p className="text-sm text-muted-foreground">Patient: Jane Smith - Abnormal blood work</p>
                    <Button size="sm" variant="destructive" className="mt-2">
                      Review Now
                    </Button>
                  </div>
                </div>

                <div className="flex items-start gap-4 rounded-lg border border-warning/50 bg-warning/5 p-3">
                  <AlertCircle className="h-5 w-5 text-warning" />
                  <div className="flex-1">
                    <p className="font-medium">Follow-up Required</p>
                    <p className="text-sm text-muted-foreground">Patient: John Doe - Post-surgery checkup overdue</p>
                    <Button size="sm" variant="outline" className="mt-2 bg-transparent">
                      Schedule Follow-up
                    </Button>
                  </div>
                </div>

                <div className="flex items-start gap-4 rounded-lg border p-3">
                  <Stethoscope className="h-5 w-5 text-primary" />
                  <div className="flex-1">
                    <p className="font-medium">Prescription Renewal</p>
                    <p className="text-sm text-muted-foreground">3 patients need prescription renewals</p>
                    <Link href="/doctor/prescriptions">
                      <Button size="sm" variant="outline" className="mt-2 bg-transparent">
                        View Requests
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Patient Records */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Recent Patient Records</CardTitle>
                <CardDescription>Latest consultations and updates</CardDescription>
              </div>
              <Link href="/doctor/records">
                <Button variant="outline">View All Records</Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mockMedicalRecords.slice(0, 3).map((record) => (
                <div key={record.id} className="flex items-center gap-4 rounded-lg border p-4">
                  <Avatar>
                    <AvatarFallback>
                      {record.patientId
                        .split("")
                        .filter((c) => c.toUpperCase() !== c.toLowerCase())
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <p className="font-medium">{record.diagnosis}</p>
                    <p className="text-sm text-muted-foreground">Date: {record.date}</p>
                    <div className="mt-1 flex flex-wrap gap-1">
                      {record.symptoms.slice(0, 2).map((symptom, idx) => (
                        <Badge key={idx} variant="outline">
                          {symptom}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <Link href="/doctor/records">
                    <Button variant="ghost" size="sm">
                      View Details
                    </Button>
                  </Link>
                </div>
              ))}
            </div>
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
              <Link href="/doctor/records">
                <Button variant="outline" className="h-auto w-full flex-col gap-2 py-4 bg-transparent">
                  <FileText className="h-6 w-6" />
                  <span>Create Record</span>
                </Button>
              </Link>
              <Link href="/doctor/prescriptions">
                <Button variant="outline" className="h-auto w-full flex-col gap-2 py-4 bg-transparent">
                  <ClipboardList className="h-6 w-6" />
                  <span>Write Prescription</span>
                </Button>
              </Link>
              <Link href="/doctor/patients">
                <Button variant="outline" className="h-auto w-full flex-col gap-2 py-4 bg-transparent">
                  <Users className="h-6 w-6" />
                  <span>View Patients</span>
                </Button>
              </Link>
              <Link href="/doctor/schedule">
                <Button variant="outline" className="h-auto w-full flex-col gap-2 py-4 bg-transparent">
                  <Calendar className="h-6 w-6" />
                  <span>Manage Schedule</span>
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
