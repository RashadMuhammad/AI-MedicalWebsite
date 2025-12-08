"use client"

import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Navigation } from "../navigation"
import { mockAmbulances } from "@/lib/mock-data"
import { Bell, Lock } from "lucide-react"
import { useState } from "react"

export default function AmbulanceSettings() {
  const { user } = useAuth()
  const router = useRouter()
  const [isEditing, setIsEditing] = useState(false)
  const [notificationsEnabled, setNotificationsEnabled] = useState(true)

  // if (user?.role !== "ambulance_driver") {
  //   router.push("/login")
  //   return null
  // }

  const ambulance = mockAmbulances.find((a) => a.driverId === user.id)

  return (
    <DashboardLayout navigation={<Navigation />}>
      <div className="space-y-6 max-w-2xl">
        <div>
          <h1 className="text-3xl font-bold">Settings</h1>
          <p className="text-muted-foreground">Manage your ambulance and profile settings</p>
        </div>

        {/* Profile Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Profile Information</CardTitle>
            <CardDescription>Update your personal details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Full Name</label>
              <Input value={user?.name} disabled={!isEditing} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Email</label>
              <Input value={user?.email} disabled={!isEditing} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Phone</label>
              <Input value={user?.phone || "+1-555-1001"} disabled={!isEditing} />
            </div>
            <div className="flex gap-2">
              {!isEditing ? (
                <Button onClick={() => setIsEditing(true)}>Edit Profile</Button>
              ) : (
                <>
                  <Button>Save Changes</Button>
                  <Button variant="outline" onClick={() => setIsEditing(false)}>
                    Cancel
                  </Button>
                </>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Ambulance Details */}
        {ambulance && (
          <Card>
            <CardHeader>
              <CardTitle>Ambulance Details</CardTitle>
              <CardDescription>Your assigned ambulance information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Ambulance Number</label>
                  <Input value={ambulance.ambulanceNumber} disabled />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Capacity</label>
                  <Input value={`${ambulance.capacity} patients`} disabled />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Equipment</label>
                <div className="flex flex-wrap gap-2">
                  {ambulance.equipment.map((item) => (
                    <span key={item} className="bg-secondary text-secondary-foreground px-3 py-1 rounded-full text-sm">
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Notification Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Notifications
            </CardTitle>
            <CardDescription>Manage your notification preferences</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Emergency Alerts</p>
                <p className="text-sm text-muted-foreground">Receive critical ambulance calls</p>
              </div>
              <Button
                variant={notificationsEnabled ? "default" : "outline"}
                onClick={() => setNotificationsEnabled(!notificationsEnabled)}
              >
                {notificationsEnabled ? "Enabled" : "Disabled"}
              </Button>
            </div>
            <div className="flex items-center justify-between pt-4 border-t">
              <div>
                <p className="font-medium">SMS Notifications</p>
                <p className="text-sm text-muted-foreground">Receive SMS for new requests</p>
              </div>
              <input type="checkbox" defaultChecked className="h-5 w-5" />
            </div>
            <div className="flex items-center justify-between pt-4 border-t">
              <div>
                <p className="font-medium">Push Notifications</p>
                <p className="text-sm text-muted-foreground">Receive app notifications</p>
              </div>
              <input type="checkbox" defaultChecked className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        {/* Security Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="h-5 w-5" />
              Security
            </CardTitle>
            <CardDescription>Update your security preferences</CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" className="w-full bg-transparent">
              Change Password
            </Button>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
