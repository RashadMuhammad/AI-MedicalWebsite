"use client"

import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Navigation } from "../navigation"
import { mockAmbulanceRequests } from "@/lib/mock-data"
import { MapPin, Phone, Clock, AlertTriangle } from "lucide-react"
import { useState } from "react"

export default function ActiveRequests() {
  const { user } = useAuth()
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState<string>("all")

  // if (user?.role !== "ambulance_driver") {
  //   router.push("/login")
  //   return null
  // }

  const requests = mockAmbulanceRequests.filter((r) => {
    const matchesSearch =
      r.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.pickupLocation.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = filterStatus === "all" || r.status === filterStatus

    return matchesSearch && matchesStatus && r.status !== "cancelled"
  })

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "critical":
        return "destructive"
      case "high":
        return "secondary"
      default:
        return "outline"
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "en-route":
        return "bg-blue-100 text-blue-800"
      case "arrived":
        return "bg-green-100 text-green-800"
      case "requested":
        return "bg-yellow-100 text-yellow-800"
      case "assigned":
        return "bg-purple-100 text-purple-800"
      case "completed":
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <DashboardLayout navigation={<Navigation />}>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Active Ambulance Requests</h1>
          <p className="text-muted-foreground">Monitor and respond to emergency requests</p>
        </div>

        {/* Filters */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <Input
            placeholder="Search by patient name or location..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="md:w-64"
          />
          <div className="flex gap-2">
            <Button
              variant={filterStatus === "all" ? "default" : "outline"}
              onClick={() => setFilterStatus("all")}
              size="sm"
            >
              All Requests
            </Button>
            <Button
              variant={filterStatus === "requested" ? "default" : "outline"}
              onClick={() => setFilterStatus("requested")}
              size="sm"
            >
              Requested
            </Button>
            <Button
              variant={filterStatus === "assigned" ? "default" : "outline"}
              onClick={() => setFilterStatus("assigned")}
              size="sm"
            >
              Assigned
            </Button>
            <Button
              variant={filterStatus === "en-route" ? "default" : "outline"}
              onClick={() => setFilterStatus("en-route")}
              size="sm"
            >
              En Route
            </Button>
          </div>
        </div>

        {/* Requests List */}
        <div className="space-y-4">
          {requests.length === 0 ? (
            <Card>
              <CardContent className="pt-6 text-center">
                <p className="text-muted-foreground">No requests found</p>
              </CardContent>
            </Card>
          ) : (
            requests.map((request) => (
              <Card key={request.id} className={request.priority === "critical" ? "border-red-300 bg-red-50" : ""}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-xl">{request.patientName}</CardTitle>
                      <CardDescription>{request.reason}</CardDescription>
                    </div>
                    <div className="flex gap-2">
                      <Badge variant={getPriorityColor(request.priority)}>{request.priority.toUpperCase()}</Badge>
                      <Badge className={getStatusColor(request.status)}>{request.status.toUpperCase()}</Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-3 md:grid-cols-2">
                    <div className="space-y-2">
                      <p className="flex items-center gap-2 text-sm">
                        <MapPin className="h-4 w-4 text-primary" />
                        <span className="font-semibold">Pickup:</span>
                      </p>
                      <p className="text-sm text-muted-foreground ml-6">{request.pickupLocation}</p>
                    </div>
                    <div className="space-y-2">
                      <p className="flex items-center gap-2 text-sm">
                        <MapPin className="h-4 w-4 text-green-600" />
                        <span className="font-semibold">Drop:</span>
                      </p>
                      <p className="text-sm text-muted-foreground ml-6">{request.dropLocation}</p>
                    </div>
                  </div>

                  <div className="grid gap-3 md:grid-cols-3">
                    <p className="flex items-center gap-2 text-sm">
                      <Phone className="h-4 w-4" />
                      <span>{request.patientPhone}</span>
                    </p>
                    <p className="flex items-center gap-2 text-sm">
                      <Clock className="h-4 w-4" />
                      <span>Requested: {request.requestedAt}</span>
                    </p>
                    {request.estimatedArrival && (
                      <p className="flex items-center gap-2 text-sm font-semibold text-blue-600">
                        <Clock className="h-4 w-4" />
                        ETA: {request.estimatedArrival}
                      </p>
                    )}
                  </div>

                  {request.notes && (
                    <div className="rounded-lg bg-yellow-50 p-3 text-sm">
                      <p className="flex items-start gap-2">
                        <AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5" />
                        <span>
                          <strong>Notes:</strong> {request.notes}
                        </span>
                      </p>
                    </div>
                  )}

                  <div className="flex gap-2 pt-2">
                    {request.status === "requested" && <Button className="flex-1">Accept Request</Button>}
                    {request.status === "assigned" && <Button className="flex-1">Mark En Route</Button>}
                    {request.status === "en-route" && <Button className="flex-1">Mark Arrived</Button>}
                    {request.status === "arrived" && <Button className="flex-1">Complete Pickup</Button>}
                    <Button variant="outline">Call Patient</Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}
