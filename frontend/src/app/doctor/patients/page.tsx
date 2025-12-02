"use client"

import { useState } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Calendar, Clock, Users, FileText, Activity, Search, Phone, Mail } from "lucide-react"
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

// Mock patient data
const mockPatients = [
  {
    id: "p1",
    name: "John Doe",
    email: "john.doe@email.com",
    phone: "+1234567890",
    bloodGroup: "O+",
    lastVisit: "2025-09-15",
    nextAppointment: "2025-10-05",
    status: "active",
  },
  {
    id: "p2",
    name: "Jane Smith",
    email: "jane.smith@email.com",
    phone: "+1234567891",
    bloodGroup: "A+",
    lastVisit: "2025-09-28",
    nextAppointment: null,
    status: "active",
  },
  {
    id: "p3",
    name: "Robert Johnson",
    email: "robert.j@email.com",
    phone: "+1234567892",
    bloodGroup: "B+",
    lastVisit: "2025-08-20",
    nextAppointment: "2025-10-12",
    status: "active",
  },
]

export default function PatientsPage() {
  const [searchQuery, setSearchQuery] = useState("")

  const filteredPatients = mockPatients.filter(
    (patient) =>
      patient.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      patient.email.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  return (
    <DashboardLayout navigation={<DoctorNavigation />} allowedRoles={["doctor"]}>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Patients</h1>
          <p className="text-muted-foreground">Manage your patient records</p>
        </div>

        {/* Search */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <Search className="h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search patients by name or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="max-w-md"
              />
            </div>
          </CardContent>
        </Card>

        {/* Patients List */}
        <div className="grid gap-4 md:grid-cols-2">
          {filteredPatients.map((patient) => (
            <Card key={patient.id}>
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  <Avatar className="h-12 w-12">
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      {patient.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold">{patient.name}</h3>
                      <Badge variant="secondary">{patient.status}</Badge>
                    </div>
                    <div className="mt-2 space-y-1 text-sm text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <Mail className="h-3 w-3" />
                        {patient.email}
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="h-3 w-3" />
                        {patient.phone}
                      </div>
                      <div className="flex items-center gap-2">
                        <Activity className="h-3 w-3" />
                        Blood Group: {patient.bloodGroup}
                      </div>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2 text-xs text-muted-foreground">
                      <span>Last Visit: {patient.lastVisit}</span>
                      {patient.nextAppointment && <span>• Next: {patient.nextAppointment}</span>}
                    </div>
                    <div className="mt-4 flex gap-2">
                      <Link href="/doctor/records">
                        <Button size="sm" variant="outline">
                          <FileText className="mr-2 h-4 w-4" />
                          View Records
                        </Button>
                      </Link>
                      <Link href="/doctor/appointments">
                        <Button size="sm" variant="outline">
                          <Calendar className="mr-2 h-4 w-4" />
                          Schedule
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredPatients.length === 0 && (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Users className="mb-4 h-12 w-12 text-muted-foreground" />
              <p className="text-muted-foreground">No patients found</p>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  )
}
