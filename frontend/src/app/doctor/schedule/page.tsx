"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { DashboardLayout } from "@/components/dashboard-layout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, Users, FileText, Activity } from "lucide-react";
import * as Dialog from "@radix-ui/react-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/lib/auth-context";
import { apiFetch } from "@/lib/api";

// ------------------ MOCK DATA ------------------
const mockAppointments = [
  {
    id: "apt1",
    doctorId: "a47a268d-cab1-4a7e-9e43-eccb9bb016a0",
    patientName: "John Doe",
    date: "2025-10-22",
    time: "09:00 - 09:30",
    type: "in-person",
  },
  {
    id: "apt2",
    doctorId: "a47a268d-cab1-4a7e-9e43-eccb9bb016a0",
    patientName: "Sarah Lee",
    date: "2025-10-22",
    time: "10:00 - 10:30",
    type: "teleconsultation",
  },
  {
    id: "apt3",
    doctorId: "a47a268d-cab1-4a7e-9e43-eccb9bb016a0",
    patientName: "Michael Brown",
    date: "2025-10-23",
    time: "11:00 - 11:30",
    type: "in-person",
  },
  {
    id: "apt4",
    doctorId: "a47a268d-cab1-4a7e-9e43-eccb9bb016a0",
    patientName: "Emma Watson",
    date: "2025-10-24",
    time: "14:00 - 14:30",
    type: "teleconsultation",
  },
  {
    id: "apt5",
    doctorId: "a47a268d-cab1-4a7e-9e43-eccb9bb016a0",
    patientName: "David Miller",
    date: "2025-10-25",
    time: "16:00 - 16:30",
    type: "in-person",
  },
];

// ------------------ NAVIGATION ------------------
function DoctorNavigation() {
  const navItems = [
    { href: "/doctor", icon: Activity, label: "Dashboard" },
    { href: "/doctor/appointments", icon: Calendar, label: "Appointments" },
    { href: "/doctor/patients", icon: Users, label: "Patients" },
    { href: "/doctor/records", icon: FileText, label: "Medical Records" },
    { href: "/doctor/prescriptions", icon: FileText, label: "Prescriptions" },
    { href: "/doctor/schedule", icon: Clock, label: "Schedule" },
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

// ------------------ MAIN COMPONENT ------------------
export default function SchedulePage() {
  const { user } = useAuth();
  const doctorId = localStorage.getItem("userId");

  // Filter appointments for logged-in doctor
  const doctorAppointments = mockAppointments.filter(
    (apt) => apt.doctorId === doctorId
  );

  // Group appointments by date
  const appointmentsByDate = doctorAppointments.reduce((acc, apt) => {
    if (!acc[apt.date]) acc[apt.date] = [];
    acc[apt.date].push(apt);
    return acc;
  }, {} as Record<string, typeof doctorAppointments>);

  // ------------------ AVAILABILITY ------------------
  const [availability, setAvailability] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    day: "Monday",
    start: "09:00",
    end: "17:00",
    room: "",
    available: true,
  });

  // Fetch availability from backend
  useEffect(() => {
    const fetchAvailability = async () => {
      try {
        const doctorId = localStorage.getItem("userId");
        if (!doctorId) return;

        const response = await apiFetch(`/api/doctor/${doctorId}`);
        if (response.data?.success) {
          setAvailability(response.data.data || []);
        }
      } catch (error) {
        console.error("Error fetching availability:", error);
      }
    };

    fetchAvailability();
  }, []);

  // Save new availability
  const handleFormSubmit = async () => {
    try {
      const doctorId = localStorage.getItem("userId");
      if (!doctorId) {
        alert("Doctor ID not found — please login again.");
        return;
      }

      const payload = {
        doctor_id: doctorId,
        day_of_week: formData.day,
        start_time: formData.start,
        end_time: formData.end,
        room_number: formData.room,
        is_available: formData.available,
      };

      console.log("Sending:", payload);

      const response = await apiFetch("/api/doctor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (response.data?.success) {
        setAvailability((prev) => [...prev, response.data.data]);
      } else {
        alert("Failed to save availability");
      }
    } catch (err) {
      console.error("Error saving availability:", err);
      alert("Error saving availability");
    }
  };

  // Format time as AM/PM
  const formatTime = (timeString: string) => {
    if (!timeString) return "";
    const [hours, minutes] = timeString.split(":");
    const h = parseInt(hours, 10);
    const ampm = h >= 12 ? "PM" : "AM";
    const formattedHour = h % 12 || 12;
    return `${formattedHour}:${minutes} ${ampm}`;
  };

  // ------------------ JSX ------------------
  return (
    <DashboardLayout navigation={<DoctorNavigation />}>
      <div className="space-y-6">
        {/* Header + Set Availability */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Schedule</h1>
            <p className="text-muted-foreground">Your appointment calendar</p>
          </div>

          <Dialog.Root>
            <Dialog.Trigger asChild>
              <Button variant="outline">Set Availability</Button>
            </Dialog.Trigger>
            <Dialog.Portal>
              <Dialog.Overlay
                className="    fixed inset-0
    bg-gradient-to-b from-black/10 to-black/30
    z-[9998]"
              />
              <Dialog.Content
                className="
    fixed top-1/2 left-1/2 w-[400px]
    -translate-x-1/2 -translate-y-1/2
    rounded-md
    bg-white dark:bg-neutral-900
    text-black dark:text-white
    p-6 shadow-lg
    z-[9999]
  "
              >
                <Dialog.Title className="text-lg font-bold">
                  Set Availability
                </Dialog.Title>

                <div className="space-y-4 mt-4">
                  <div>
                    <Label className="dark:text-white">Day</Label>
                    <select
                      className="
          w-full border rounded p-2
          bg-white dark:bg-neutral-800
          text-black dark:text-white
          border-gray-300 dark:border-neutral-700
        "
                      value={formData.day}
                      onChange={(e) =>
                        setFormData({ ...formData, day: e.target.value })
                      }
                    >
                      {[
                        "Monday",
                        "Tuesday",
                        "Wednesday",
                        "Thursday",
                        "Friday",
                        "Saturday",
                        "Sunday",
                      ].map((d) => (
                        <option
                          key={d}
                          value={d}
                          className="bg-white dark:bg-neutral-800 text-black dark:text-white"
                        >
                          {d}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="flex gap-2">
                    <div className="flex-1">
                      <Label className="dark:text-white">Start Time</Label>
                      <Input
                        type="time"
                        className="bg-white dark:bg-neutral-800 text-black dark:text-white"
                        value={formData.start}
                        onChange={(e) =>
                          setFormData({ ...formData, start: e.target.value })
                        }
                      />
                    </div>

                    <div className="flex-1">
                      <Label className="dark:text-white">End Time</Label>
                      <Input
                        type="time"
                        className="bg-white dark:bg-neutral-800 text-black dark:text-white"
                        value={formData.end}
                        onChange={(e) =>
                          setFormData({ ...formData, end: e.target.value })
                        }
                      />
                    </div>
                  </div>

                  <div>
                    <Label className="dark:text-white">Room</Label>
                    <Input
                      type="text"
                      className="bg-white dark:bg-neutral-800 text-black dark:text-white"
                      value={formData.room}
                      onChange={(e) =>
                        setFormData({ ...formData, room: e.target.value })
                      }
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formData.available}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          available: e.target.checked,
                        })
                      }
                    />
                    <span className="dark:text-white">Available</span>
                  </div>

                  <Button className="w-full" onClick={handleFormSubmit}>
                    Save
                  </Button>
                </div>

                <Dialog.Close className="absolute top-2 right-2 dark:text-white">
                  ✕
                </Dialog.Close>
              </Dialog.Content>
            </Dialog.Portal>
          </Dialog.Root>
        </div>

        {/* My Availability */}
        <Card>
          <CardHeader>
            <CardTitle>My Availability</CardTitle>
            <CardDescription>
              Set days and times you are available
            </CardDescription>
          </CardHeader>
          <CardContent>
            {availability.length === 0 ? (
              <p>No availability set yet.</p>
            ) : (
              availability.map((a, idx) => (
                <div
                  key={idx}
                  className="
  flex items-center justify-between p-2 border rounded mb-2 
  bg-gray-50 dark:bg-gray-800 dark:border-gray-700
"
                >
                  <div>
                    <strong>{a.day_of_week}</strong>: {formatTime(a.start_time)}{" "}
                    - {formatTime(a.end_time)}
                  </div>
                  <div>
                    {a.is_available ? "✅ Available" : "❌ Unavailable"} | Room:{" "}
                    {a.room_number}
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Weekly Overview */}
        <Card>
          <CardHeader>
            <CardTitle>Weekly Overview</CardTitle>
            <CardDescription>Your appointments for the week</CardDescription>
          </CardHeader>
          <CardContent>
            {Object.entries(appointmentsByDate).map(([date, appointments]) => (
              <div key={date}>
                <div className="mb-3 flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-primary" />
                  <h3 className="font-semibold">{date}</h3>
                  <Badge variant="secondary">
                    {appointments.length} appointments
                  </Badge>
                </div>
                <div className="space-y-2 pl-6">
                  {appointments.map((apt) => (
                    <div
                      key={apt.id}
                      className="flex items-center justify-between rounded-lg border p-3"
                    >
                      <div className="flex items-center gap-3">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="font-medium">{apt.time}</p>
                          <p className="text-sm text-muted-foreground">
                            {apt.patientName}
                          </p>
                        </div>
                      </div>
                      <Badge
                        variant={
                          apt.type === "teleconsultation"
                            ? "default"
                            : "secondary"
                        }
                      >
                        {apt.type}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
