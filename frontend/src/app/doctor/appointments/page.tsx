"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth-context"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Calendar, Clock, FileText, Filter } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import Link from "next/link"
import { apiFetch } from "@/lib/api"
import { Appointment } from "@/lib/types"

function DoctorNavigation() {
  const navItems = [
    { href: "/doctor", icon: Calendar, label: "Dashboard" },
    { href: "/doctor/appointments", icon: Calendar, label: "Appointments" },
    { href: "/doctor/patients", icon: Calendar, label: "Patients" },
    { href: "/doctor/records", icon: FileText, label: "Medical Records" },
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

// ✅ Status transition rules
const getNextStatuses = (currentStatus: string) => {
  const status = currentStatus.toLowerCase()
  switch (status) {
    case "scheduled":
      return ["in-progress", "cancelled"]
    case "in-progress":
      return ["completed", "cancelled"]
    default:
      return []
  }
}

export default function DoctorAppointmentsPage() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [filterStatus, setFilterStatus] = useState<string>("all")
  const [filterDate, setFilterDate] = useState<string>("all")

  // ✅ Fetch appointments for doctor
  useEffect(() => {
    const fetchAppointments = async () => {
      const userID = localStorage.getItem("userId")
      if (!userID) return
      try {
        const { data } = await apiFetch(`/api/appointments/doctor/${userID}`)
        if (data.success) setAppointments(data.data)
      } catch (error) {
        console.error("Error fetching appointments:", error)
        toast({
          title: "Error",
          description: "Failed to fetch appointments",
          variant: "destructive",
        })
      }
    }
    fetchAppointments()
  }, [user?.id])

  // ✅ Handle status change
  const handleStatusChange = async (
    appointmentId: string,
    newStatus: Appointment["status"]
  ) => {
    try {
      const { res, data } = await apiFetch(`/api/appointments/${appointmentId}/status`, {
        method: "PUT",
        body: JSON.stringify({ status: newStatus }),
      })

      if (res.ok) {
        const updatedAppointment = data.data

        toast({
          title: "Status Updated",
          description: `Appointment marked as ${updatedAppointment.status}.`,
        })

        setAppointments((prev) =>
          prev.map((apt) =>
            apt.appointment_id === appointmentId
              ? { ...apt, status: updatedAppointment.status }
              : apt
          )
        )
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to update status.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Status change error:", error)
      toast({
        title: "Error",
        description: "Something went wrong while updating status.",
        variant: "destructive",
      })
    }
  }

  // ✅ Filter Appointments
  const filteredAppointments = appointments.filter((apt) => {
    const status = apt.status.toLowerCase()
    if (filterStatus !== "all" && status !== filterStatus) return false

    if (filterDate !== "all") {
      const today = new Date().toISOString().split("T")[0]
      if (filterDate === "today" && apt.appointment_date !== today) return false
      if (filterDate === "upcoming" && apt.appointment_date <= today) return false
    }
    return true
  })

  return (
    <DashboardLayout navigation={<DoctorNavigation />}>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Appointments</h1>
          <p className="text-muted-foreground">Manage your patient appointments</p>
        </div>

        {/* ✅ Filters */}
        <Card>
          <CardContent className="pt-6 flex flex-wrap items-center gap-4">
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
          </CardContent>
        </Card>

        {/* ✅ Appointment List */}
        <div className="space-y-4">
          {filteredAppointments.length > 0 ? (
            filteredAppointments.map((appointment) => {
              const nextStatuses = getNextStatuses(appointment.status)
              return (
                <Card key={appointment.appointment_id}>
                  <CardContent className="pt-6">
                    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                      <div className="flex items-start gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                          <Calendar className="h-6 w-6 text-primary" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold">
                              {appointment.patientname}
                            </h3>
                            <Badge variant="outline">
                              {appointment.appointment_type}
                            </Badge>
                          </div>
                          <p className="mt-1 text-sm text-muted-foreground">
                            {appointment.reason}
                          </p>
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

                      {/* ✅ Status & Actions */}
                      <div className="flex flex-col gap-2 items-end">
                        <Badge
                          variant={
                            appointment.status.toLowerCase() === "scheduled"
                              ? "default"
                              : appointment.status.toLowerCase() === "completed"
                              ? "secondary"
                              : appointment.status.toLowerCase() === "in-progress"
                              ? "outline"
                              : "destructive"
                          }
                        >
                          {appointment.status}
                        </Badge>

                        {/* ✅ Status Change Dropdown */}
                        {nextStatuses.length > 0 && (
                          <Select
                            onValueChange={(newStatus) =>
                              handleStatusChange(
                                appointment.appointment_id,
                                newStatus as Appointment["status"]
                              )
                            }
                          >
                            <SelectTrigger className="w-[160px]">
                              <SelectValue placeholder="Change status" />
                            </SelectTrigger>
                            <SelectContent>
                              {nextStatuses.map((status) => (
                                <SelectItem key={status} value={status}>
                                  {status === "in-progress"
                                    ? "In Progress"
                                    : status.charAt(0).toUpperCase() + status.slice(1)}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}

                        {appointment.status.toLowerCase() === "completed" && (
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
              )
            })
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
