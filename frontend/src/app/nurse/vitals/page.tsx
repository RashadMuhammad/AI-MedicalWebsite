"use client"

import { useAuth } from "@/lib/auth-context"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Thermometer, Heart, Activity } from "lucide-react"
import Link from "next/link"
import { mockPatientVitals } from "@/lib/mock-data"
import { useState } from "react"

function NurseNavigation() {
  const navItems = [
    { href: "/nurse", icon: Activity, label: "Dashboard" },
    { href: "/nurse/tasks", icon: "Clock", label: "Tasks" },
    { href: "/nurse/vitals", icon: Heart, label: "Patient Vitals" },
    { href: "/nurse/patients", icon: "Users", label: "Assigned Patients" },
    { href: "/nurse/records", icon: "Stethoscope", label: "Medical Records" },
  ]

  return (
    <>
      {navItems.map((item) => (
        <Link key={item.href} href={item.href}>
          <Button variant="ghost" className="w-full justify-start">
            {item.label}
          </Button>
        </Link>
      ))}
    </>
  )
}

export default function VitalsPage() {
  const { user } = useAuth()
  const [searchTerm, setSearchTerm] = useState("")

  const nurseVitals = mockPatientVitals.filter((vital) => vital.nurseId === user?.id || vital.nurseId === "n1")
  const filteredVitals = nurseVitals.filter((vital) =>
    vital.patientName.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  return (
    <DashboardLayout navigation={<NurseNavigation />}>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Patient Vitals</h1>
          <p className="text-muted-foreground">Record and monitor patient vital signs</p>
        </div>

        {/* Search and Add */}
        <Card>
          <CardHeader>
            <CardTitle>Search & Record</CardTitle>
          </CardHeader>
          <CardContent className="flex gap-2">
            <Input
              placeholder="Search patient by name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1"
            />
            <Button>+ Record New Vitals</Button>
          </CardContent>
        </Card>

        {/* Vitals Grid */}
        <div className="grid gap-4">
          {filteredVitals.length > 0 ? (
            filteredVitals.map((vital) => (
              <Card key={vital.id}>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle>{vital.patientName}</CardTitle>
                      <CardDescription>
                        {vital.date} at {vital.time}
                      </CardDescription>
                    </div>
                    <Badge variant="secondary">{vital.date}</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-3">
                    <div className="rounded-lg bg-muted p-4">
                      <div className="flex items-center gap-2">
                        <Thermometer className="h-5 w-5 text-orange-500" />
                        <p className="text-sm text-muted-foreground">Temperature</p>
                      </div>
                      <p className="mt-2 text-2xl font-bold">{vital.temperature}°F</p>
                    </div>

                    <div className="rounded-lg bg-muted p-4">
                      <div className="flex items-center gap-2">
                        <Heart className="h-5 w-5 text-red-500" />
                        <p className="text-sm text-muted-foreground">Heart Rate</p>
                      </div>
                      <p className="mt-2 text-2xl font-bold">{vital.heartRate} bpm</p>
                    </div>

                    <div className="rounded-lg bg-muted p-4">
                      <p className="text-sm text-muted-foreground">Blood Pressure</p>
                      <p className="mt-2 text-2xl font-bold">{vital.bloodPressure}</p>
                    </div>

                    <div className="rounded-lg bg-muted p-4">
                      <p className="text-sm text-muted-foreground">Respiratory Rate</p>
                      <p className="mt-2 text-2xl font-bold">{vital.respiratoryRate}/min</p>
                    </div>

                    <div className="rounded-lg bg-muted p-4">
                      <p className="text-sm text-muted-foreground">Oxygen Saturation</p>
                      <p className="mt-2 text-2xl font-bold">{vital.bloodOxygen}%</p>
                    </div>

                    <div className="rounded-lg bg-muted p-4">
                      <p className="text-sm text-muted-foreground">BMI</p>
                      <p className="mt-2 text-2xl font-bold">{vital.bmi?.toFixed(1)}</p>
                    </div>
                  </div>

                  {vital.notes && (
                    <div className="mt-4 rounded-lg bg-blue-50 p-3">
                      <p className="text-sm text-muted-foreground">Notes: {vital.notes}</p>
                    </div>
                  )}

                  <div className="mt-4 flex gap-2">
                    <Button size="sm">Edit</Button>
                    <Button size="sm" variant="outline" className="bg-transparent">
                      View Patient Record
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                <Heart className="mb-4 h-12 w-12 text-muted-foreground" />
                <p className="text-muted-foreground">No vitals found</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}
