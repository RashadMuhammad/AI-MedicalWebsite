"use client"

import type React from "react"

import { useState } from "react"
import { useAuth } from "@/lib/auth-context"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Calendar, Clock, Video, User, Plus, Filter } from "lucide-react"
import { mockAppointments } from "@/lib/mock-data"
import { useToast } from "@/hooks/use-toast"
import Link from "next/link"

function PatientNavigation() {
  const navItems = [
    { href: "/patient", icon: Calendar, label: "Dashboard" },
    { href: "/patient/appointments", icon: Calendar, label: "Appointments" },
    { href: "/patient/records", icon: Calendar, label: "Medical Records" },
    { href: "/patient/billing", icon: Calendar, label: "Billing" },
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

export default function AppointmentsPage() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [filterStatus, setFilterStatus] = useState<string>("all")
  const [isBookingOpen, setIsBookingOpen] = useState(false)

  // Form state
  const [formData, setFormData] = useState({
    doctor: "",
    date: "",
    time: "",
    type: "",
    reason: "",
  })

  const patientAppointments = mockAppointments.filter((apt) => apt.patientId === user?.id)

  const filteredAppointments =
    filterStatus === "all" ? patientAppointments : patientAppointments.filter((apt) => apt.status === filterStatus)

  const handleBookAppointment = (e: React.FormEvent) => {
    e.preventDefault()
    toast({
      title: "Appointment Booked",
      description: "Your appointment has been scheduled successfully.",
    })
    setIsBookingOpen(false)
    setFormData({ doctor: "", date: "", time: "", type: "", reason: "" })
  }

  return (
    <DashboardLayout navigation={<PatientNavigation />}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Appointments</h1>
            <p className="text-muted-foreground">Manage your medical appointments</p>
          </div>
          <Dialog open={isBookingOpen} onOpenChange={setIsBookingOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Book Appointment
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Book New Appointment</DialogTitle>
                <DialogDescription>Schedule a consultation with a doctor</DialogDescription>
              </DialogHeader>
              <form onSubmit={handleBookAppointment} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="doctor">Select Doctor</Label>
                  <Select value={formData.doctor} onValueChange={(v) => setFormData({ ...formData, doctor: v })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a doctor" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="d1">Dr. Sarah Smith - Cardiology</SelectItem>
                      <SelectItem value="d2">Dr. Michael Johnson - General Medicine</SelectItem>
                      <SelectItem value="d3">Dr. Emily Brown - Pediatrics</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="date">Date</Label>
                  <Input
                    id="date"
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="time">Time</Label>
                  <Select value={formData.time} onValueChange={(v) => setFormData({ ...formData, time: v })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select time" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="09:00">09:00 AM</SelectItem>
                      <SelectItem value="10:00">10:00 AM</SelectItem>
                      <SelectItem value="11:00">11:00 AM</SelectItem>
                      <SelectItem value="14:00">02:00 PM</SelectItem>
                      <SelectItem value="15:00">03:00 PM</SelectItem>
                      <SelectItem value="16:00">04:00 PM</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="type">Appointment Type</Label>
                  <Select value={formData.type} onValueChange={(v) => setFormData({ ...formData, type: v })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="consultation">Consultation</SelectItem>
                      <SelectItem value="follow-up">Follow-up</SelectItem>
                      <SelectItem value="teleconsultation">Teleconsultation</SelectItem>
                      <SelectItem value="emergency">Emergency</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="reason">Reason for Visit</Label>
                  <Textarea
                    id="reason"
                    placeholder="Describe your symptoms or reason for visit"
                    value={formData.reason}
                    onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                    required
                  />
                </div>

                <Button type="submit" className="w-full">
                  Confirm Booking
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Filter */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Appointments</SelectItem>
                  <SelectItem value="scheduled">Scheduled</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
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
                          <h3 className="font-semibold">{appointment.doctorName}</h3>
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
                    <div className="flex items-center gap-2">
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
                      {appointment.status === "scheduled" && (
                        <div className="flex gap-2">
                          {appointment.type === "teleconsultation" && (
                            <Button size="sm">
                              <Video className="mr-2 h-4 w-4" />
                              Join
                            </Button>
                          )}
                          <Button size="sm" variant="outline">
                            Reschedule
                          </Button>
                          <Button size="sm" variant="destructive">
                            Cancel
                          </Button>
                        </div>
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
                <Button className="mt-4" onClick={() => setIsBookingOpen(true)}>
                  Book Your First Appointment
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}
