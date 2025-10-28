"use client"

import { useState, useEffect } from "react"
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
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog"
import { Calendar, Clock, Video, User, Plus, Filter } from "lucide-react"
import { mockAppointments } from "@/lib/mock-data"
import { useToast } from "@/hooks/use-toast"
import Link from "next/link"
import { apiFetch } from "@/lib/api"

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

  const [formData, setFormData] = useState({
    doctor: "",
    date: "",
    time: "",
    type: "",
    reason: "",
  })

  const [doctors, setDoctors] = useState<any[]>([])
  const [times, setTimes] = useState<any[]>([])

  const dayMap: Record<number, string> = {
    0: "Sunday",
    1: "Monday",
    2: "Tuesday",
    3: "Wednesday",
    4: "Thursday",
    5: "Friday",
    6: "Saturday",
  }

  // Fetch all doctors
  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const { data } = await apiFetch("/api/doctor/doctors-with-department")
        if (data.success) setDoctors(data.data)
      } catch (err) {
        console.error("Error fetching doctors:", err)
      }
    }
    fetchDoctors()
  }, [])

  // Fetch available times when doctor or date changes
 useEffect(() => {
  const fetchTimes = async () => {
    if (!formData.doctor || !formData.date) {
      setTimes([]);
      return;
    }

    try {
      const { data } = await apiFetch("/api/doctor/availability");
 console.log("sbjhfkerf",data)
      if (data.success) {
        const selectedDay = dayMap[new Date(formData.date).getDay()];

        const now = new Date();

        const filtered = data.data.filter((t: any) => {
          const isSameDoctor = t.doctor_id === formData.doctor;
          const isSameDay = t.day_of_week === selectedDay;
          const isAvailable = t.is_available;

          // Convert to full datetime for comparison only if date is today
          const slotStart = new Date(`${formData.date}T${t.start_time}`);

          const isFuture =
            formData.date === now.toISOString().split("T")[0]
              ? slotStart > now // if same day, exclude past times
              : true; // otherwise allow all

          return isSameDoctor && isSameDay && isAvailable && isFuture;
        });

        console.log("Filtered Times →", filtered);
        setTimes(filtered);
      }
    } catch (error) {
      console.error("Error fetching times:", error);
    }
  };

  fetchTimes();
}, [formData.doctor, formData.date]);


  const handleBookAppointment = (e: React.FormEvent) => {
    e.preventDefault()
    toast({
      title: "Appointment Booked",
      description: "Your appointment has been scheduled successfully.",
    })
    setIsBookingOpen(false)
    setFormData({ doctor: "", date: "", time: "", type: "", reason: "" })
    setTimes([])
  }

  const patientAppointments = mockAppointments.filter((apt) => apt.patientId === user?.id)
  const filteredAppointments =
    filterStatus === "all"
      ? patientAppointments
      : patientAppointments.filter((apt) => apt.status === filterStatus)

  return (
    <DashboardLayout navigation={<PatientNavigation />}>
      <div className="space-y-6">
        {/* Header & Book Appointment */}
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
                {/* Doctor Select */}
                <div className="space-y-2">
                  <Label>Select Doctor</Label>
                  <Select
                    value={formData.doctor}
                    onValueChange={(v) => setFormData({ ...formData, doctor: v, time: "" })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a doctor" />
                    </SelectTrigger>
                    <SelectContent>
                      {doctors.length > 0 ? (
                        doctors.map((doc) => (
                          <SelectItem key={doc.doctor_id} value={String(doc.doctor_id)}>
                            {doc.doctor_name} - {doc.department_name}
                          </SelectItem>
                        ))
                      ) : (
                        <SelectItem value="loading" disabled>
                          Loading doctors...
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                </div>

                {/* Date Input */}
                <div className="space-y-2">
                  <Label>Date</Label>
                  <Input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value, time: "" })}
                    required
                  />
                </div>

            <div className="space-y-2">
  <Label>Select Available Time</Label>
  <Select
    value={formData.time}
    onValueChange={(v) => setFormData((prev) => ({ ...prev, time: v }))}
  >
    <SelectTrigger>
      <SelectValue
        placeholder={
          !formData.doctor
            ? "Select a doctor first"
            : !formData.date
            ? "Select a date first"
            : "Select available slot"
        }
      />
    </SelectTrigger>
    <SelectContent>
      {formData.doctor && formData.date ? (
        times.length > 0 ? (
          times.map((t) => (
            <SelectItem
              key={t.id}
              value={`${t.day_of_week}-${t.start_time}-${t.end_time}`}
            >
              🗓 {t.day_of_week} — ⏰ {t.start_time.slice(0, 5)} - {t.end_time.slice(0, 5)}
              {t.room_number ? ` 🏥 (Room ${t.room_number})` : ""}
            </SelectItem>
          ))
        ) : (
          <SelectItem value="no-times" disabled>
            No available times
          </SelectItem>
        )
      ) : (
        <SelectItem value="no-doctor" disabled>
          Select doctor and date first
        </SelectItem>
      )}
    </SelectContent>
  </Select>
</div>



                {/* Appointment Type */}
                <div className="space-y-2">
                  <Label>Appointment Type</Label>
                  <Select
                    value={formData.type}
                    onValueChange={(v) => setFormData({ ...formData, type: v })}
                  >
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

                {/* Reason */}
                <div className="space-y-2">
                  <Label>Reason for Visit</Label>
                  <Textarea
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
