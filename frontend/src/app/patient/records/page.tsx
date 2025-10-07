"use client"

import { useAuth } from "@/lib/auth-context"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { FileText, Calendar, User, Video, Download, Eye } from "lucide-react"
import { mockMedicalRecords } from "@/lib/mock-data"
import Link from "next/link"

function PatientNavigation() {
  const navItems = [
    { href: "/patient", icon: Calendar, label: "Dashboard" },
    { href: "/patient/appointments", icon: Calendar, label: "Appointments" },
    { href: "/patient/records", icon: FileText, label: "Medical Records" },
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

export default function MedicalRecordsPage() {
  const { user } = useAuth()
  const patientRecords = mockMedicalRecords.filter((record) => record.patientId === user?.id)

  return (
    <DashboardLayout navigation={<PatientNavigation />}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Medical Records</h1>
            <p className="text-muted-foreground">Your complete health history</p>
          </div>
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export All
          </Button>
        </div>

        {/* Health Summary */}
        <Card>
          <CardHeader>
            <CardTitle>Health Summary</CardTitle>
            <CardDescription>Quick overview of your health information</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Blood Group</p>
                <p className="text-lg font-semibold">{user?.bloodGroup || "Not specified"}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Date of Birth</p>
                <p className="text-lg font-semibold">{user?.dateOfBirth || "Not specified"}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Total Records</p>
                <p className="text-lg font-semibold">{patientRecords.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Medical Records */}
        <div className="space-y-4">
          {patientRecords.length > 0 ? (
            patientRecords.map((record) => (
              <Card key={record.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle>{record.diagnosis}</CardTitle>
                      <CardDescription className="mt-1">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-3 w-3" />
                          {record.date}
                        </div>
                      </CardDescription>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline">
                        <Eye className="mr-2 h-4 w-4" />
                        View
                      </Button>
                      <Button size="sm" variant="outline">
                        <Download className="mr-2 h-4 w-4" />
                        Download
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Symptoms */}
                  <div>
                    <h4 className="mb-2 text-sm font-medium">Symptoms</h4>
                    <div className="flex flex-wrap gap-2">
                      {record.symptoms.map((symptom, idx) => (
                        <Badge key={idx} variant="secondary">
                          {symptom}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <Separator />

                  {/* Prescription */}
                  <div>
                    <h4 className="mb-3 text-sm font-medium">Prescription</h4>
                    <div className="space-y-3">
                      {record.prescription.map((rx) => (
                        <div key={rx.id} className="rounded-lg border p-3">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <p className="font-medium">{rx.medication}</p>
                              <div className="mt-1 grid gap-1 text-sm text-muted-foreground md:grid-cols-3">
                                <p>Dosage: {rx.dosage}</p>
                                <p>Frequency: {rx.frequency}</p>
                                <p>Duration: {rx.duration}</p>
                              </div>
                              <p className="mt-2 text-sm text-muted-foreground">{rx.instructions}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Lab Results */}
                  {record.labResults && record.labResults.length > 0 && (
                    <>
                      <Separator />
                      <div>
                        <h4 className="mb-3 text-sm font-medium">Lab Results</h4>
                        <div className="space-y-2">
                          {record.labResults.map((lab) => (
                            <div key={lab.id} className="flex items-center justify-between rounded-lg border p-3">
                              <div>
                                <p className="font-medium">{lab.testName}</p>
                                <p className="text-sm text-muted-foreground">
                                  Result: {lab.result} (Normal: {lab.normalRange})
                                </p>
                              </div>
                              <Badge
                                variant={
                                  lab.status === "normal"
                                    ? "secondary"
                                    : lab.status === "abnormal"
                                      ? "default"
                                      : "destructive"
                                }
                              >
                                {lab.status}
                              </Badge>
                            </div>
                          ))}
                        </div>
                      </div>
                    </>
                  )}

                  {/* Notes */}
                  <Separator />
                  <div>
                    <h4 className="mb-2 text-sm font-medium">Doctor's Notes</h4>
                    <p className="text-sm text-muted-foreground">{record.notes}</p>
                  </div>

                  {/* Follow-up */}
                  {record.followUpDate && (
                    <>
                      <Separator />
                      <div className="flex items-center justify-between rounded-lg bg-primary/5 p-3">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-primary" />
                          <span className="text-sm font-medium">Follow-up scheduled</span>
                        </div>
                        <span className="text-sm text-muted-foreground">{record.followUpDate}</span>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            ))
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <FileText className="mb-4 h-12 w-12 text-muted-foreground" />
                <p className="text-muted-foreground">No medical records available</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}
