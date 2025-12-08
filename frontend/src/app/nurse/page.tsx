"use client"

import { useAuth } from "@/lib/auth-context"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Activity, Heart, Thermometer, Users, Clock, AlertCircle, CheckCircle2, Stethoscope } from "lucide-react"
import Link from "next/link"
import { mockNursingTasks, mockPatientVitals } from "@/lib/mock-data"

function NurseNavigation() {
  const navItems = [
    { href: "/nurse", icon: Activity, label: "Dashboard" },
    { href: "/nurse/tasks", icon: Clock, label: "Tasks" },
    { href: "/nurse/vitals", icon: Heart, label: "Patient Vitals" },
    { href: "/nurse/patients", icon: Users, label: "Assigned Patients" },
    { href: "/nurse/records", icon: Stethoscope, label: "Medical Records" },
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

export default function NurseDashboard() {
  const { user } = useAuth()

  // Filter tasks for current nurse
  const nurseTasks = mockNursingTasks.filter((task) => task.assignedTo === user?.id || task.assignedTo === "n1")
  const pendingTasks = nurseTasks.filter((task) => task.status === "pending")
  const inProgressTasks = nurseTasks.filter((task) => task.status === "in-progress")
  const completedTasks = nurseTasks.filter((task) => task.status === "completed")

  const nurseVitals = mockPatientVitals.filter((vital) => vital.nurseId === user?.id || vital.nurseId === "n1")

  return (
    <DashboardLayout navigation={<NurseNavigation />}>
      <div className="space-y-6">
        {/* Welcome Section */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Welcome, {user?.name}</h1>
          <p className="text-muted-foreground">Manage patient care and nursing tasks</p>
        </div>

        {/* Quick Stats */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Tasks</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{pendingTasks.length}</div>
              <p className="text-xs text-muted-foreground">Awaiting attention</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">In Progress</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{inProgressTasks.length}</div>
              <p className="text-xs text-muted-foreground">Currently working on</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed Today</CardTitle>
              <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{completedTasks.length}</div>
              <p className="text-xs text-muted-foreground">Tasks finished</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Patients Monitored</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{nurseVitals.length}</div>
              <p className="text-xs text-muted-foreground">Under your care</p>
            </CardContent>
          </Card>
        </div>

        {/* Urgent Tasks */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Urgent Tasks</CardTitle>
                <CardDescription>High priority tasks requiring immediate attention</CardDescription>
              </div>
              <Link href="/nurse/tasks">
                <Button>View All Tasks</Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {pendingTasks.length > 0 ? (
              <div className="space-y-4">
                {pendingTasks.map((task) => (
                  <div
                    key={task.id}
                    className={`rounded-lg border-l-4 p-4 ${
                      task.priority === "critical" || task.priority === "high"
                        ? "border-l-destructive bg-destructive/5"
                        : "border-l-warning bg-warning/5"
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <p className="font-medium">{task.description}</p>
                          <Badge
                            variant={
                              task.priority === "critical"
                                ? "destructive"
                                : task.priority === "high"
                                  ? "default"
                                  : "secondary"
                            }
                          >
                            {task.priority}
                          </Badge>
                        </div>
                        <p className="mt-1 text-sm text-muted-foreground">Patient: {task.patientName}</p>
                        <p className="text-sm text-muted-foreground">Type: {task.taskType}</p>
                        {task.notes && <p className="mt-2 text-sm text-muted-foreground">Notes: {task.notes}</p>}
                      </div>
                      <Button size="sm">Start Task</Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <CheckCircle2 className="mb-4 h-12 w-12 text-success" />
                <p className="text-sm text-muted-foreground">No pending tasks</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Vitals */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Recent Patient Vitals</CardTitle>
                <CardDescription>Latest vital signs recorded</CardDescription>
              </div>
              <Link href="/nurse/vitals">
                <Button variant="outline">View All</Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {nurseVitals.slice(0, 3).map((vital) => (
                <div key={vital.id} className="rounded-lg border p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="font-medium">{vital.patientName}</p>
                      <div className="mt-2 grid grid-cols-2 gap-2 text-sm">
                        <div className="flex items-center gap-2">
                          <Thermometer className="h-4 w-4 text-orange-500" />
                          <span>Temp: {vital.temperature}°F</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Heart className="h-4 w-4 text-red-500" />
                          <span>HR: {vital.heartRate} bpm</span>
                        </div>
                        <div className="col-span-2 text-muted-foreground">BP: {vital.bloodPressure}</div>
                      </div>
                      {vital.notes && <p className="mt-2 text-xs text-muted-foreground">Notes: {vital.notes}</p>}
                    </div>
                    <Badge variant="outline">{vital.date}</Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common nursing tasks</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Link href="/nurse/vitals">
                <Button variant="outline" className="h-auto w-full flex-col gap-2 py-4 bg-transparent">
                  <Heart className="h-6 w-6" />
                  <span>Record Vitals</span>
                </Button>
              </Link>
              <Link href="/nurse/tasks">
                <Button variant="outline" className="h-auto w-full flex-col gap-2 py-4 bg-transparent">
                  <Clock className="h-6 w-6" />
                  <span>View Tasks</span>
                </Button>
              </Link>
              <Link href="/nurse/patients">
                <Button variant="outline" className="h-auto w-full flex-col gap-2 py-4 bg-transparent">
                  <Users className="h-6 w-6" />
                  <span>My Patients</span>
                </Button>
              </Link>
              <Link href="/nurse/records">
                <Button variant="outline" className="h-auto w-full flex-col gap-2 py-4 bg-transparent">
                  <AlertCircle className="h-6 w-6" />
                  <span>View Alerts</span>
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
