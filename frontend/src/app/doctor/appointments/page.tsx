"use client"

import { useState } from "react"
import { useAuth } from "@/lib/auth-context"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar, Clock, Video, Users, FileText, Activity, Filter, CheckCircle } from "lucide-react"
import { mockAppointments } from "@/lib/mock-data"
import { useToast } from "@/hooks/use-toast"
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

export default function DoctorAppointmentsPage() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [filterStatus, setFilterStatus] = useState<string>("all")
  const [filterDate, setFilterDate] = useState<string>("all")

  const doctorAppointments = mockAppointments.filter((apt) => apt.doctorId === user?.id)

  const filteredAppointments = doctorAppointments.filter((apt) => {
    if (filterStatus !== "all" && apt.status !== filterStatus) return false
    if (filterDate !== "all") {
      const today = new Date().toISOString().split("T")[0]
      if (filterDate === "today" && apt.date !== today) return false
      if (filterDate === "upcoming" && apt.date <= today) return false
    }
    return true
  })

  const handleCompleteAppointment = (appointmentId: string) => {
    toast({
      title: "Appointment Completed",
      description: "The appointment has been marked as completed.",
    })
  }

  return (
    <DashboardLayout navigation={<DoctorNavigation />}>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Appointments</h1>
          <p className="text-muted-foreground">Manage your patient appointments</p>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-wrap items-center gap-4">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="scheduled">Scheduled</SelectItem>
                  <SelectItem value="in-progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>

              <Select value={filterDate} onValueChange={setFilterDate}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by date" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Dates</SelectItem>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="upcoming">Upcoming</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Appointments List */}
        <div className="space-y-4">
          {filteredAppointments.length > 0 ? (
            filteredAppointments.map((appointment) => (
              <Card key={appointment.id}>
                <CardContent className="pt-6">
                  <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div className="flex items-start gap-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                        <Calendar className="h-6 w-6 text-primary" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold">{appointment.patientName}</h3>
                          <Badge variant="outline">{appointment.type}</Badge>
                        </div>
                        <p className="mt-1 text-sm text-muted-foreground">{appointment.reason}</p>
                        <div className="mt-2 flex flex-wrap gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {appointment.date}
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {appointment.time}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col gap-2">
                      <Badge
                        variant={
                          appointment.status === "scheduled"
                            ? "default"
                            : appointment.status === "completed"
                              ? "secondary"
                              : appointment.status === "in-progress"
                                ? "default"
                                : "destructive"
                        }
                      >
                        {appointment.status}
                      </Badge>
                      {appointment.status === "scheduled" && (
                        <div className="flex gap-2">
                          {appointment.type === "teleconsultation" && (
                            <Button size="sm">
                              <Video className="mr-2 h-4 w-4" />
                              Start Call
                            </Button>
                          )}
                          <Button size="sm" variant="outline" onClick={() => handleCompleteAppointment(appointment.id)}>
                            <CheckCircle className="mr-2 h-4 w-4" />
                            Complete
                          </Button>
                        </div>
                      )}
                      {appointment.status === "completed" && (
                        <Link href="/doctor/records">
                          <Button size="sm" variant="outline">
                            <FileText className="mr-2 h-4 w-4" />
                            View Record
                          </Button>
                        </Link>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Calendar className="mb-4 h-12 w-12 text-muted-foreground" />
                <p className="text-muted-foreground">No appointments found</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}
