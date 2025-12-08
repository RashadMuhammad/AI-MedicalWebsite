"use client"

import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Navigation } from "./navigation"
import { mockAmbulanceRequests, mockAmbulances } from "@/lib/mock-data"
import { AlertCircle, AlertTriangle, MapPin, Phone, Clock, Truck, Activity } from "lucide-react"

export default function AmbulanceDashboard() {
  const { user } = useAuth()
  const router = useRouter()

  // if (user?.role !== "ambulance_driver") {
  //   router.push("/login")
  //   return null
  // }

  const driverAmbulances = mockAmbulances.filter((a) => a.driverId === user?.id)
  const driverAmbulance = driverAmbulances[0]
  const activeRequests = mockAmbulanceRequests.filter(
    (r) => r.driverId === user?.id && r.status !== "completed" && r.status !== "cancelled",
  )
  const criticalRequests = mockAmbulanceRequests.filter((r) => r.priority === "critical" && r.status === "requested")

  const stats = [
    {
      label: "Total Trips",
      value: driverAmbulance?.totalTrips || 0,
      icon: <Truck className="h-4 w-4" />,
      color: "bg-blue-100 text-blue-700",
    },
    {
      label: "Active Requests",
      value: activeRequests.length,
      icon: <AlertCircle className="h-4 w-4" />,
      color: "bg-orange-100 text-orange-700",
    },
    {
      label: "Fuel Level",
      value: `${driverAmbulance?.fuelLevel || 0}%`,
      icon: <Activity className="h-4 w-4" />,
      color: "bg-green-100 text-green-700",
    },
    {
      label: "Critical Calls",
      value: criticalRequests.length,
      icon: <AlertTriangle className="h-4 w-4" />,
      color: "bg-red-100 text-red-700",
    },
  ]

  return (
    <DashboardLayout navigation={<Navigation />}>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold">Ambulance Dashboard</h1>
          <p className="text-muted-foreground">Track active requests and manage emergency responses</p>
        </div>

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-4">
          {stats.map((stat) => (
            <Card key={stat.label}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{stat.label}</CardTitle>
                <div className={`rounded-lg p-2 ${stat.color}`}>{stat.icon}</div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Ambulance Status */}
        {driverAmbulance && (
          <Card className="border-2 border-primary">
            <CardHeader>
              <CardTitle>My Ambulance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <p className="flex items-center gap-2 text-sm">
                    <span className="font-semibold">Ambulance Number:</span>
                    <Badge variant="outline">{driverAmbulance.ambulanceNumber}</Badge>
                  </p>
                  <p className="flex items-center gap-2 text-sm">
                    <MapPin className="h-4 w-4" />
                    <span>Location: {driverAmbulance.location}</span>
                  </p>
                  <p className="flex items-center gap-2 text-sm">
                    <Badge variant={driverAmbulance.status === "available" ? "default" : "secondary"}>
                      {driverAmbulance.status.toUpperCase()}
                    </Badge>
                  </p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm">
                    <span className="font-semibold">Fuel Level:</span> {driverAmbulance.fuelLevel}%
                  </p>
                  <p className="text-sm">
                    <span className="font-semibold">Next Service:</span> {driverAmbulance.nextServiceDate}
                  </p>
                  <p className="text-sm">
                    <span className="font-semibold">Capacity:</span> {driverAmbulance.capacity} patients
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Active Requests */}
        <Card>
          <CardHeader>
            <CardTitle>Active Requests</CardTitle>
            <CardDescription>Your assigned ambulance requests</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {activeRequests.length === 0 ? (
              <p className="text-sm text-muted-foreground">No active requests</p>
            ) : (
              activeRequests.map((request) => (
                <div key={request.id} className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-semibold">{request.patientName}</p>
                      <p className="text-sm text-muted-foreground">{request.reason}</p>
                    </div>
                    <Badge variant={request.priority === "critical" ? "destructive" : "secondary"}>
                      {request.priority.toUpperCase()}
                    </Badge>
                  </div>
                  <div className="grid gap-2 text-sm">
                    <p className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-primary" />
                      From: {request.pickupLocation}
                    </p>
                    <p className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-green-600" />
                      To: {request.dropLocation}
                    </p>
                    <p className="flex items-center gap-2">
                      <Phone className="h-4 w-4" />
                      {request.patientPhone}
                    </p>
                    {request.estimatedArrival && (
                      <p className="flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        ETA: {request.estimatedArrival}
                      </p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline">
                      Call Patient
                    </Button>
                    <Button size="sm">View Details</Button>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Critical Requests */}
        {criticalRequests.length > 0 && (
          <Card className="border-red-200 bg-red-50">
            <CardHeader>
              <CardTitle className="text-red-900">Critical Emergency Calls</CardTitle>
              <CardDescription className="text-red-700">Unassigned critical priority requests</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {criticalRequests.map((request) => (
                <div key={request.id} className="border border-red-200 rounded-lg p-4 space-y-3 bg-white">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-semibold">{request.patientName}</p>
                      <p className="text-sm text-red-700 font-medium">{request.reason}</p>
                    </div>
                    <Badge variant="destructive">CRITICAL</Badge>
                  </div>
                  <div className="grid gap-2 text-sm">
                    <p className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-red-600" />
                      {request.pickupLocation}
                    </p>
                    <p className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-red-600" />
                      {request.patientPhone}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="destructive">
                      Accept & Respond
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  )
}
