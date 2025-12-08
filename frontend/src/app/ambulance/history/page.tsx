"use client"

import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Navigation } from "../navigation"
import { mockAmbulanceTrips } from "@/lib/mock-data"
import { MapPin, Clock, DollarSign, NavigationIcon } from "lucide-react"

export default function TripHistory() {
  const { user } = useAuth()
  const router = useRouter()

  // if (user?.role !== "ambulance_driver") {
  //   router.push("/login")
  //   return null
  // }

  const trips = mockAmbulanceTrips.filter((t) => t.driverId === user.id)
  const totalDistance = trips.reduce((sum, t) => sum + t.distance, 0).toFixed(1)
  const totalEarnings = trips.reduce((sum, t) => sum + t.fare, 0).toFixed(2)

  return (
    <DashboardLayout navigation={<Navigation />}>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Trip History</h1>
          <p className="text-muted-foreground">View your completed ambulance trips</p>
        </div>

        {/* Summary Stats */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Trips</CardTitle>
              <NavigationIcon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{trips.length}</div>
              <p className="text-xs text-muted-foreground">Completed trips</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Distance</CardTitle>
              <MapPin className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalDistance} km</div>
              <p className="text-xs text-muted-foreground">Miles covered</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Earnings</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${totalEarnings}</div>
              <p className="text-xs text-muted-foreground">Trip fares</p>
            </CardContent>
          </Card>
        </div>

        {/* Trips List */}
        <div className="space-y-4">
          {trips.length === 0 ? (
            <Card>
              <CardContent className="pt-6 text-center">
                <p className="text-muted-foreground">No trip history found</p>
              </CardContent>
            </Card>
          ) : (
            trips.map((trip) => (
              <Card key={trip.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle>{trip.patientName}</CardTitle>
                      <CardDescription>Trip ID: {trip.id}</CardDescription>
                    </div>
                    <Badge variant="outline">COMPLETED</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-3">
                      <p className="flex items-center gap-2 text-sm">
                        <MapPin className="h-4 w-4 text-primary" />
                        <span>
                          <strong>From:</strong> {trip.pickupLocation}
                        </span>
                      </p>
                      <p className="flex items-center gap-2 text-sm">
                        <MapPin className="h-4 w-4 text-green-600" />
                        <span>
                          <strong>To:</strong> {trip.dropLocation}
                        </span>
                      </p>
                    </div>
                    <div className="space-y-3">
                      <p className="flex items-center gap-2 text-sm">
                        <Clock className="h-4 w-4" />
                        <span>
                          <strong>Duration:</strong> {trip.startTime} to {trip.endTime}
                        </span>
                      </p>
                      <p className="flex items-center gap-2 text-sm">
                        <NavigationIcon className="h-4 w-4" />
                        <span>
                          <strong>Distance:</strong> {trip.distance} km
                        </span>
                      </p>
                    </div>
                  </div>
                  <div className="flex justify-between border-t pt-4">
                    <span className="font-semibold">Fare Amount:</span>
                    <span className="text-xl font-bold text-green-600">${trip.fare.toFixed(2)}</span>
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
