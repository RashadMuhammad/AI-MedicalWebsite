"use client"

import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Calendar, User, Video, FileText, CreditCard, VideoIcon } from "lucide-react"
import Link from "next/link"

function PatientNavigation() {
  const navItems = [
    { href: "/patient", icon: Calendar, label: "Dashboard" },
    { href: "/patient/appointments", icon: Calendar, label: "Appointments" },
    { href: "/patient/records", icon: FileText, label: "Medical Records" },
    { href: "/patient/billing", icon: CreditCard, label: "Billing" },
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

export default function TeleconsultPage() {
  return (
    <DashboardLayout navigation={<PatientNavigation />}>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Teleconsultation</h1>
          <p className="text-muted-foreground">Connect with doctors remotely</p>
        </div>

        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <VideoIcon className="mb-4 h-16 w-16 text-muted-foreground" />
            <h3 className="mb-2 text-xl font-semibold">Teleconsultation Coming Soon</h3>
            <p className="mb-4 text-center text-muted-foreground">
              Video consultation features will be available in the next update
            </p>
            <Link href="/patient/appointments">
              <Button>Book Regular Appointment</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
