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
import { Calendar, Clock, Users, FileText, Activity, Heart, Stethoscope, AlertTriangle } from "lucide-react";
import * as Dialog from "@radix-ui/react-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/lib/auth-context";
import { apiFetch } from "@/lib/api";
import { toast } from "react-toastify";

function NurseNavigation() {
  const navItems = [
    { href: "/nurse", icon: Activity, label: "Dashboard" },
    { href: "/nurse/tasks", icon: AlertTriangle, label: "Tasks" },
    { href: "/nurse/vitals", icon: Heart, label: "Patient Vitals" },
    { href: "/nurse/patients", icon: Users, label: "Assigned Patients" },
    { href: "/nurse/records", icon: Stethoscope, label: "Medical Records" },
    { href: "/nurse/schedule", icon: Clock, label: "Schedule" },
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

export default function SchedulePage() {
  const { user, isLoading: userLoading } = useAuth();

  const [appointments, setAppointments] = useState<any[]>([]);
  const [availability, setAvailability] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [formData, setFormData] = useState({
    day: "Monday",
    start: "09:00",
    end: "17:00",
    room_number: "",
    available: true,
  });

  const [editId, setEditId] = useState<number | null>(null);

  useEffect(() => {
    if (userLoading) return;

    const userId = user?.user_id ?? user?.id;
    if (!userId) {
      setLoading(false);
      return;
    }

    const sessionId = localStorage.getItem("sessionId");
    if (!sessionId) {
      setLoading(false);
      return;
    }

    const load = async () => {
      try {
        setLoading(true);

        const availRes = await apiFetch("/api/availability");
        if (availRes.data?.success) {
          setAvailability(availRes.data.data || []);
        }

        const aptRes = await apiFetch(`/api/appointments/doctor/${userId}`, {
          headers: { Authorization: `Bearer ${sessionId}` },
        });

        if (aptRes.data?.success) {
          setAppointments(aptRes.data.data || []);
        }
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [userLoading, user?.id, user?.user_id]);

  const handleFormSubmit = async () => {
    try {
      const sessionId = localStorage.getItem("sessionId");
      if (!sessionId) {
        alert("Session expired. Login again.");
        return;
      }

      const newSlot = {
        day_of_week: formData.day,
        start_time: formData.start,
        end_time: formData.end,
        room_number: formData.room_number,
      };

      if (hasConflict(newSlot, availability)) {
        toast.error("This time slot conflicts with an existing schedule.");
        return;
      }

      const payload = {
        user_id: user?.user_id ?? user?.id,
        ...newSlot,
        is_available: formData.available,
      };

      const response = await apiFetch("/api/availability", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (response.data?.success) {
        setAvailability((prev) => [...prev, response.data.data]);
        toast.success("Availability saved");
      }
    } catch {
      toast.error("Error saving availability");
    }
  };

  // ------------ UPDATE AVAILABILITY ------------
  const handleUpdate = async () => {
    if (!editId) return;

    try {
      const updatedSlot = {
        day_of_week: formData.day,
        start_time: formData.start,
        end_time: formData.end,
        room_number: formData.room_number,
      };

      if (hasConflictForUpdate(updatedSlot, availability, editId)) {
        toast.error("This time slot overlaps with another availability.");
        return;
      }

      const response = await apiFetch(`/api/availability/${editId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...updatedSlot,
          is_available: formData.available,
        }),
      });

      if (response.data?.success) {
        setAvailability((prev) =>
          prev.map((a) => (a.id === editId ? response.data.data : a))
        );
        toast.success("Availability Updated");

        setEditId(null);

        const btn = document.querySelector(
          "[data-edit-dialog-btn]"
        ) as HTMLElement | null;
        btn?.click();
      }
    } catch {
      toast.error("Error updating availability");
    }
  };

  // ------------ DELETE AVAILABILITY ------------
  const handleDelete = async (id: number) => {
    try {
      const response = await apiFetch(`/api/availability/${id}`, {
        method: "DELETE",
      });

      if (response.data?.success) {
        setAvailability((prev) => prev.filter((a) => a.id !== id));
        toast.success("Availability Deleted");
      }
    } catch {
      toast.error("Delete failed");
    }
  };

  // ------------------ FORMAT TIME ------------------
  const formatTime = (t: string) => {
    if (!t) return "";
    const [h, m] = t.split(":");
    const hour = parseInt(h);
    const ampm = hour >= 12 ? "PM" : "AM";
    const display = hour % 12 || 12;
    return `${display}:${m} ${ampm}`;
  };

  // ------------ GROUP APPOINTMENTS BY DATE -------------
  const appointmentsByDate: Record<string, any[]> = appointments.reduce(
    (acc, a) => {
      if (!acc[a.appointment_date]) acc[a.appointment_date] = [];
      acc[a.appointment_date].push(a);
      return acc;
    },
    {} as Record<string, any[]>
  );

  const hasConflict = (newSlot: any, existing: any[]) => {
    return existing.some((a) => {
      // Only same day
      if (a.day_of_week !== newSlot.day_of_week) return false;

      const startA = a.start_time;
      const endA = a.end_time;
      const startB = newSlot.start_time;
      const endB = newSlot.end_time;

      // TIME OVERLAP CONDITION
      const overlap = startB < endA && endB > startA;

      // Time conflict
      if (overlap) return true;

      // Room conflict (same room + overlap)
      if (overlap && a.room_number === newSlot.room_number) return true;

      return false;
    });
  };

  const hasConflictForUpdate = (
    newSlot: any,
    existing: any[],
    editId: number
  ) => {
    return existing.some((a) => {
      if (a.id === editId) return false;

      if (a.day_of_week !== newSlot.day_of_week) return false;

      const startA = a.start_time;
      const endA = a.end_time;
      const startB = newSlot.start_time;
      const endB = newSlot.end_time;

      const overlap = startB < endA && endB > startA;

      if (overlap) return true;

      if (overlap && a.room_number === newSlot.room_number) return true;

      return false;
    });
  };

  if (userLoading || loading) {
    return (
      <DashboardLayout navigation={<NurseNavigation />}>
        <p>Loading...</p>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout navigation={<NurseNavigation />}>
      <div className="space-y-6">
        {/* HEADER */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Schedule</h1>
            <p className="text-muted-foreground">
              Your availability & appointments
            </p>
          </div>

          <Dialog.Root>
            <Dialog.Trigger asChild>
              <Button variant="outline">Set Availability</Button>
            </Dialog.Trigger>

            {/* Hidden trigger for edit */}
            <Dialog.Trigger data-edit-dialog-btn className="hidden" />

            <Dialog.Portal>
              <Dialog.Overlay className="fixed inset-0 bg-black/30" />
              <Dialog.Content className="fixed top-1/2 left-1/2 w-[400px] -translate-x-1/2 -translate-y-1/2 rounded-md bg-white p-6 shadow-lg dark:bg-neutral-900">
                <Dialog.Title className="text-lg font-bold">
                  {editId ? "Edit Availability" : "Set Availability"}
                </Dialog.Title>

                <div className="space-y-4 mt-4">
                  {/* DAY */}
                  <div>
                    <Label>Day</Label>
                    <select
                      className="w-full border rounded p-2"
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
                        <option key={d}>{d}</option>
                      ))}
                    </select>
                  </div>

                  {/* TIME */}
                  <div className="flex gap-2">
                    <div className="flex-1">
                      <Label>Start Time</Label>
                      <Input
                        type="time"
                        value={formData.start}
                        onChange={(e) =>
                          setFormData({ ...formData, start: e.target.value })
                        }
                      />
                    </div>

                    <div className="flex-1">
                      <Label>End Time</Label>
                      <Input
                        type="time"
                        value={formData.end}
                        onChange={(e) =>
                          setFormData({ ...formData, end: e.target.value })
                        }
                      />
                    </div>
                  </div>

                  {/* ROOM */}
                  <div>
                    <Label>Room</Label>
                    <Input
                      type="text"
                      value={formData.room_number}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          room_number: e.target.value,
                        })
                      }
                    />
                  </div>

                  {/* AVAILABLE CHECK */}
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
                    <span>Available</span>
                  </div>

                  {editId ? (
                    <Button className="w-full" onClick={handleUpdate}>
                      Update
                    </Button>
                  ) : (
                    <Button className="w-full" onClick={handleFormSubmit}>
                      Save
                    </Button>
                  )}
                </div>

                <Dialog.Close className="absolute top-2 right-2">
                  ✕
                </Dialog.Close>
              </Dialog.Content>
            </Dialog.Portal>
          </Dialog.Root>
        </div>

        {/* AVAILABILITY LIST */}
        <Card>
          <CardHeader>
            <CardTitle>My Availability</CardTitle>
            <CardDescription>Manage your weekly timings</CardDescription>
          </CardHeader>
          <CardContent>
            {availability.length === 0 && <p>No availability set.</p>}

            {availability.map((a) => (
              <div
                key={a.id}
                className="flex items-center justify-between p-2 border rounded mb-2"
              >
                <div>
                  <strong>{a.day_of_week}</strong>: {formatTime(a.start_time)} -{" "}
                  {formatTime(a.end_time)}
                  <div className="text-sm text-gray-500">
                    Room: {a.room_number}
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setEditId(a.id);
                      setFormData({
                        day: a.day_of_week,
                        start: a.start_time,
                        end: a.end_time,
                        room_number: a.room_number,
                        available: a.is_available,
                      });
                      setTimeout(() => {
                        (
                          document.querySelector(
                            "[data-edit-dialog-btn]"
                          ) as HTMLElement | null
                        )?.click();
                      }, 50);
                    }}
                  >
                    ✏️
                  </Button>

                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleDelete(a.id)}
                  >
                    🗑️
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* WEEKLY APPOINTMENTS */}
        <Card>
          <CardHeader>
            <CardTitle>Your Appointments</CardTitle>
            <CardDescription>Upcoming schedule</CardDescription>
          </CardHeader>
          <CardContent>
            {Object.entries(appointmentsByDate).map(([date, list]) => (
              <div key={date}>
                <div className="mb-3 flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-primary" />
                  <h3 className="font-semibold">
                    {new Date(date).toLocaleDateString()}
                  </h3>
                  <Badge>{list.length} appointments</Badge>
                </div>

                <div className="pl-6 space-y-2">
                  {list.map((apt: any) => (
                    <div
                      key={apt.id}
                      className="flex justify-between border rounded p-3"
                    >
                      <div className="flex items-center gap-3">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="font-medium">
                            {apt.time
                              .split("-")
                              .map((t: string) => t.slice(0, 5))
                              .join(" - ")}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Patient Name: {apt.patientname}
                          </p>
                        </div>
                      </div>
                      <Badge>{apt.type}</Badge>
                    </div>
                  ))}
                </div>
                <br></br>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
