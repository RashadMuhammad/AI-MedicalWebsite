"use client"

import type React from "react"
import { useState } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Calendar, Clock, Users, FileText, Activity, Plus, Search } from "lucide-react"
import { mockMedicalRecords } from "@/lib/mock-data"
import { useToast } from "@/hooks/use-toast"
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

export default function DoctorRecordsPage() {
  const { toast } = useToast()
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")

  const [formData, setFormData] = useState({
    patientName: "",
    diagnosis: "",
    symptoms: "",
    prescription: "",
    notes: "",
  })

  const handleCreateRecord = (e: React.FormEvent) => {
    e.preventDefault()
    toast({
      title: "Medical Record Created",
      description: "The medical record has been saved successfully.",
    })
    setIsCreateOpen(false)
    setFormData({ patientName: "", diagnosis: "", symptoms: "", prescription: "", notes: "" })
  }

 const filteredRecords = mockMedicalRecords.filter((record) => {
  const query = searchQuery.toLowerCase()
  
  // Check patient name
  const matchesPatient = record.patientName?.toString().toLowerCase().includes(query)
  
  // Check diagnosis
  const matchesDiagnosis = record.diagnosis.toLowerCase().includes(query)
  
  // Check symptoms
  const matchesSymptoms = record.symptoms.some((symptom) =>
    symptom.toLowerCase().includes(query)
  )
  
  return matchesPatient || matchesDiagnosis || matchesSymptoms
})


  return (
    <DashboardLayout navigation={<DoctorNavigation />}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Medical Records</h1>
            <p className="text-muted-foreground">Patient health records and consultations</p>
          </div>
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Create Record
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create Medical Record</DialogTitle>
                <DialogDescription>Document patient consultation and treatment</DialogDescription>
              </DialogHeader>
              <form onSubmit={handleCreateRecord} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="patientName">Patient Name</Label>
                  <Input
                    id="patientName"
                    placeholder="Select or enter patient name"
                    value={formData.patientName}
                    onChange={(e) => setFormData({ ...formData, patientName: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="diagnosis">Diagnosis</Label>
                  <Input
                    id="diagnosis"
                    placeholder="Primary diagnosis"
                    value={formData.diagnosis}
                    onChange={(e) => setFormData({ ...formData, diagnosis: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="symptoms">Symptoms</Label>
                  <Textarea
                    id="symptoms"
                    placeholder="List patient symptoms (comma separated)"
                    value={formData.symptoms}
                    onChange={(e) => setFormData({ ...formData, symptoms: e.target.value })}
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="prescription">Prescription</Label>
                  <Textarea
                    id="prescription"
                    placeholder="Medication details, dosage, and instructions"
                    value={formData.prescription}
                    onChange={(e) => setFormData({ ...formData, prescription: e.target.value })}
                    rows={4}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">Clinical Notes</Label>
                  <Textarea
                    id="notes"
                    placeholder="Additional observations and recommendations"
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    rows={4}
                  />
                </div>

                <Button type="submit" className="w-full">
                  Save Medical Record
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Search */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <Search className="h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search records by diagnosis..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="max-w-md"
              />
            </div>
          </CardContent>
        </Card>

        {/* Medical Records */}
        <div className="space-y-4">
          {filteredRecords.map((record) => (
            <Card key={record.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle>{record.diagnosis}</CardTitle>
                    <CardDescription className="mt-1 space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">Patient:</span>
                        {record.patientName}
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-3 w-3" />
                        {record.date}
                      </div>
                    </CardDescription>
                  </div>
                  <Button size="sm" variant="outline">
                    Edit Record
                  </Button>
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
                        <p className="font-medium">{rx.medication}</p>
                        <div className="mt-1 grid gap-1 text-sm text-muted-foreground md:grid-cols-3">
                          <p>Dosage: {rx.dosage}</p>
                          <p>Frequency: {rx.frequency}</p>
                          <p>Duration: {rx.duration}</p>
                        </div>
                        <p className="mt-2 text-sm text-muted-foreground">{rx.instructions}</p>
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

                <Separator />

                {/* Notes */}
                <div>
                  <h4 className="mb-2 text-sm font-medium">Clinical Notes</h4>
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
          ))}
        </div>
      </div>
    </DashboardLayout>
  )
}
