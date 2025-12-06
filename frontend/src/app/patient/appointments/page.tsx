"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import { DashboardLayout } from "@/components/dashboard-layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog";
import { Calendar, Clock, Video, User, Plus, Filter } from "lucide-react";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";
import { apiFetch } from "@/lib/api";
import { Appointment } from "@/lib/types";

function PatientNavigation() {
  const navItems = [
    { href: "/patient", icon: Calendar, label: "Dashboard" },
    { href: "/patient/appointments", icon: Calendar, label: "Appointments" },
    { href: "/patient/records", icon: Calendar, label: "Medical Records" },
    { href: "/patient/billing", icon: Calendar, label: "Billing" },
    { href: "/patient/teleconsult", icon: Video, label: "Teleconsultation" },
  ];
  
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
  );
}

function formatTimeTo12Hour(time24: string) {
  if (!time24) return "";
  const [hourStr, minute] = time24.split(":");
  let hour = parseInt(hourStr, 10);
  const ampm = hour >= 12 ? "PM" : "AM";
  hour = hour % 12;
  if (hour === 0) hour = 12;
  return `${hour}:${minute} ${ampm}`;
}

export default function AppointmentsPage() {
  const { user } = useAuth();
  const { toast } = useToast();

  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [doctors, setDoctors] = useState<any[]>([]);
  const [times, setTimes] = useState<any[]>([]);

  const [formData, setFormData] = useState({
    doctor: "",
    date: "",
    time: "",
    type: "",
    reason: "",
  });

  // Fetch patient appointments (session-based)
  useEffect(() => {
    if (!user?.id) return;

    const fetchAppointments = async () => {
      try {
        const { data } = await apiFetch("/api/appointments");

        if (data.success) {
          const allAppointments = data.data;
          const myAppointments = allAppointments.filter(
            (apt: any) => apt.patient_id === user.id
          );

          setAppointments(myAppointments);
        }
      } catch (error) {
        console.error("Error fetching appointments:", error);
      }
    };

    fetchAppointments();
  }, [user]);

  // Fetch doctors
  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const { data } = await apiFetch("/api/doctor/doctors-with-department");
        if (data.success) setDoctors(data.data);
      } catch (err) {
        console.error("Error fetching doctors:", err);
      }
    };
    fetchDoctors();
  }, []);

  // Fetch available time slots
  useEffect(() => {
    const fetchTimes = async () => {
      if (!formData.doctor) {
        setTimes([]);
        return;
      }

      try {
        const { data } = await apiFetch(`/api/doctor/${formData.doctor}`);

        console.log("koooooooooooooooooooooooooooooooooooooooooooooooooooooooooiiiiiiiiiii",data)

        if (data.success && data.data.length > 0) {
          let filtered = data.data.filter((t: any) => t.is_available);

          if (formData.date) {
            const selectedDate = new Date(formData.date);
            const dayMap: Record<number, string> = {
              0: "Sunday",
              1: "Monday",
              2: "Tuesday",
              3: "Wednesday",
              4: "Thursday",
              5: "Friday",
              6: "Saturday",
            };
            const selectedDay = dayMap[selectedDate.getDay()];
            filtered = filtered.filter(
              (t: any) => t.day_of_week.trim() === selectedDay
            );
          }

          setTimes(filtered);
        } else setTimes([]);
      } catch {
        setTimes([]);
      }
    };

    fetchTimes();
  }, [formData.doctor, formData.date]);

  // Book appointment
  const handleBookAppointment = async (e: React.FormEvent) => {
    e.preventDefault();

    const sessionId = localStorage.getItem("sessionId"); 

    if (!sessionId) {
      toast({
        title: "Unauthorized",
        description: "Please login again.",
        variant: "destructive",
      });
      return;
    }

    if (
      !formData.doctor ||
      !formData.date ||
      !formData.time ||
      !formData.type
    ) {
      toast({
        title: "Missing Information",
        description: "Please fill all required fields",
        variant: "destructive",
      });
      return;
    }

    try {
      const payload = {
        doctor_id: formData.doctor,
        patient_id: user?.id,
        appointment_date: formData.date,
        start_time: formData.time.split("-")[0],
        end_time: formData.time.split("-")[1],
        appointment_type: formData.type,
        reason: formData.reason,
      };

      console.log("payload -> ",payload);
      

      const { res, data } = await apiFetch("/api/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.status === 201) {
        toast({ title: "✅ Appointment Booked" });
        setIsBookingOpen(false);
        setFormData({ doctor: "", date: "", time: "", type: "", reason: "" });
        setTimes([]);

        const { data: newData } = await apiFetch("/api/appointments");
        setAppointments(
          newData.data.filter((apt: any) => apt.patient_id === user?.id)
        );
      } else {
        toast({
          title: "❌ Booking Failed",
          description: data.message || "Try again later.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Something went wrong.",
        variant: "destructive",
      });
    }
  };

  const filteredAppointments =
    filterStatus === "all"
      ? appointments
      : appointments.filter(
          (apt) => apt.status.toLowerCase() === filterStatus.toLowerCase()
        );

  return (
    <DashboardLayout navigation={<PatientNavigation />} allowedRoles={["patient"]}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Appointments</h1>
            <p className="text-muted-foreground">
              Manage your medical appointments
            </p>
          </div>

          <Dialog open={isBookingOpen} onOpenChange={setIsBookingOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" /> Book Appointment
              </Button>
            </DialogTrigger>

            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Book New Appointment</DialogTitle>
                <DialogDescription>Schedule a consultation</DialogDescription>
              </DialogHeader>

              <form onSubmit={handleBookAppointment} className="space-y-4">
                {/* Doctor */}
                <div className="space-y-2">
                  <Label>Select Doctor</Label>
                  <Select
                    value={formData.doctor}
                    onValueChange={(v) =>
                      setFormData({ ...formData, doctor: v, time: "" })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Choose doctor" />
                    </SelectTrigger>
                    <SelectContent>
                      {doctors.map((doc) => (
                        <SelectItem
                          key={doc.doctor_id}
                          value={String(doc.doctor_id)}
                        >
                          {doc.doctor_name} - {doc.department_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Date */}
                <div className="space-y-2">
                  <Label>Date</Label>
                  <Input
                    type="date"
                    value={formData.date}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        date: e.target.value,
                        time: "",
                      })
                    }
                    required
                  />
                </div>

                {/* Time */}
                <div className="space-y-2">
                  <Label>Select Time</Label>
                  <Select
                    value={formData.time}
                    onValueChange={(v) => setFormData({ ...formData, time: v })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select time" />
                    </SelectTrigger>
                    <SelectContent>
                      {times.length > 0 ? (
                        times.map((t) => (
                          <SelectItem
                            key={t.id}
                            value={`${t.start_time}-${t.end_time}`}
                          >
                            {formatTimeTo12Hour(t.start_time)} -{" "}
                            {formatTimeTo12Hour(t.end_time)} ({t.day_of_week})
                          </SelectItem>
                        ))
                      ) : (
                        <SelectItem value="no_slots" disabled>
                          No slots available
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                </div>

                {/* Type */}
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
                      <SelectItem value="teleconsultation">
                        Teleconsultation
                      </SelectItem>
                      <SelectItem value="emergency">Emergency</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Reason */}
                <div className="space-y-2">
                  <Label>Reason</Label>
                  <Textarea
                    value={formData.reason}
                    onChange={(e) =>
                      setFormData({ ...formData, reason: e.target.value })
                    }
                    placeholder="Describe your reason"
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
              <Filter className="h-4 w-4" />
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="scheduled">Scheduled</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Appointment List */}
        <div className="space-y-4">
          {filteredAppointments.length > 0 ? (
            filteredAppointments.map((apt) => (
              <Card key={apt.appointment_id}>
                <CardContent className="pt-6 flex justify-between items-center">
                  <div>
                    <h3 className="font-semibold">{apt.doctor_name}</h3>
                    <Badge variant="outline">{apt.appointment_type}</Badge>
                    <p className="text-sm text-muted-foreground">
                      {apt.reason}
                    </p>

                    <div className="flex gap-4 text-sm text-muted-foreground mt-2">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" /> {apt.appointment_date}
                      </div>

                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />{" "}
                        {formatTimeTo12Hour(apt.start_time)} -{" "}
                        {formatTimeTo12Hour(apt.end_time)}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Badge
                      variant={
                        apt.status === "scheduled"
                          ? "default"
                          : apt.status === "completed"
                          ? "secondary"
                          : "destructive"
                      }
                    >
                      {apt.status}
                    </Badge>

                    {apt.status === "scheduled" && (
                      <div className="flex gap-2">
                        {apt.appointment_type === "teleconsultation" && (
                          <Button size="sm">
                            <Video className="mr-2 h-4 w-4" /> Join
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
  );
}
