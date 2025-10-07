"use client"

import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Calendar, Clock, Users, FileText, Activity } from "lucide-react"
import { mockAppointments } from "@/lib/mock-data"
import { useAuth } from "@/lib/auth-context"
import Link from "next/link"

function DoctorNavigation() {
  const navItems = [
    { href: "/doctor", icon: Activity, label: "Dashboard" },
    { href: "/doctor/appointments", icon: Calendar, label: "Appointments" },
    { href: "/doctor/patients", icon: Users, label: "Patients" },
    { href: "/doctor/records", icon: FileText, label: "Medical Records" },
    { href: "/doctor/prescriptions", icon: FileText, label: "Prescriptions" },
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

export default function SchedulePage() {
  const { user } = useAuth()
  const doctorAppointments = mockAppointments.filter((apt) => apt.doctorId === user?.id)

  // Group appointments by date
  const appointmentsByDate = doctorAppointments.reduce(
    (acc, apt) => {
      if (!acc[apt.date]) {
        acc[apt.date] = []
      }
      acc[apt.date].push(apt)
      return acc
    },
    {} as Record<string, typeof doctorAppointments>,
  )

  return (
    <DashboardLayout navigation={<DoctorNavigation />}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Schedule</h1>
            <p className="text-muted-foreground">Your appointment calendar</p>
          </div>
          <Button variant="outline">Set Availability</Button>
        </div>

        {/* Weekly Overview */}
        <Card>
          <CardHeader>
            <CardTitle>Weekly Overview</CardTitle>
            <CardDescription>Your appointments for the week</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {Object.entries(appointmentsByDate).map(([date, appointments]) => (
                <div key={date}>
                  <div className="mb-3 flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-primary" />
                    <h3 className="font-semibold">{date}</h3>
                    <Badge variant="secondary">{appointments.length} appointments</Badge>
                  </div>
                  <div className="space-y-2 pl-6">
                    {appointments.map((apt) => (
                      <div key={apt.id} className="flex items-center justify-between rounded-lg border p-3">
                        <div className="flex items-center gap-3">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <p className="font-medium">{apt.time}</p>
                            <p className="text-sm text-muted-foreground">{apt.patientName}</p>
                          </div>
                        </div>
                        <Badge variant={apt.type === "teleconsultation" ? "default" : "secondary"}>{apt.type}</Badge>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
