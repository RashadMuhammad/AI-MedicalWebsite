"use client"

import { useAuth } from "@/lib/auth-context"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Users, Activity, Heart, AlertCircle, Clock, Stethoscope, AlertTriangle } from "lucide-react"
import Link from "next/link"
import { mockPatientVitals } from "@/lib/mock-data"

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

export default function PatientsPage() {
  const { user } = useAuth()

  // Get unique patients
  const uniquePatients = Array.from(new Map(mockPatientVitals.map((vital) => [vital.patientId, vital])).values())

  return (
    <DashboardLayout navigation={<NurseNavigation />} allowedRoles={["nurse"]}>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Assigned Patients</h1>
          <p className="text-muted-foreground">Monitor your assigned patients</p>
        </div>

        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Patients</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{uniquePatients.length}</div>
              <p className="text-xs text-muted-foreground">Under your care</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Stable</CardTitle>
              <Heart className="h-4 w-4 text-success" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{uniquePatients.length - 1}</div>
              <p className="text-xs text-muted-foreground">Good condition</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Monitoring</CardTitle>
              <AlertCircle className="h-4 w-4 text-warning" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">1</div>
              <p className="text-xs text-muted-foreground">Close observation</p>
            </CardContent>
          </Card>
        </div>

        {/* Patients List */}
        <Card>
          <CardHeader>
            <CardTitle>Patient List</CardTitle>
            <CardDescription>Your assigned patients and their status</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {uniquePatients.map((patient) => (
                <div key={patient.patientId} className="rounded-lg border p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                      <Avatar>
                        <AvatarFallback className="bg-primary text-primary-foreground">
                          {patient.patientName
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <p className="font-semibold">{patient.patientName}</p>
                        <p className="text-sm text-muted-foreground">Patient ID: {patient.patientId}</p>
                        <div className="mt-2 flex flex-wrap gap-2">
                          <Badge variant="outline">Temp: {patient.temperature}°F</Badge>
                          <Badge variant="outline">HR: {patient.heartRate} bpm</Badge>
                          <Badge variant="outline">BP: {patient.bloodPressure}</Badge>
                        </div>
                        {patient.notes && <p className="mt-2 text-sm text-muted-foreground">Notes: {patient.notes}</p>}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" className="bg-transparent">
                        View Record
                      </Button>
                      <Button size="sm">Update Vitals</Button>
                    </div>
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
