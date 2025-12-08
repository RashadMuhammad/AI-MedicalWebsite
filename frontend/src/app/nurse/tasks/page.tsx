"use client"

import { useAuth } from "@/lib/auth-context"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Clock, CheckCircle2, Activity } from "lucide-react"
import Link from "next/link"
import { mockNursingTasks } from "@/lib/mock-data"
import { useState } from "react"

function NurseNavigation() {
  const navItems = [
    { href: "/nurse", icon: Activity, label: "Dashboard" },
    { href: "/nurse/tasks", icon: Clock, label: "Tasks" },
    { href: "/nurse/vitals", icon: "Heart", label: "Patient Vitals" },
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

export default function NurseTasksPage() {
  const { user } = useAuth()
  const [filter, setFilter] = useState<"all" | "pending" | "in-progress" | "completed">("pending")

  const nurseTasks = mockNursingTasks.filter((task) => task.assignedTo === user?.id || task.assignedTo === "n1")
  const filteredTasks = filter === "all" ? nurseTasks : nurseTasks.filter((task) => task.status === filter)

  const tasksByStatus = {
    pending: nurseTasks.filter((t) => t.status === "pending").length,
    inProgress: nurseTasks.filter((t) => t.status === "in-progress").length,
    completed: nurseTasks.filter((t) => t.status === "completed").length,
  }

  return (
    <DashboardLayout navigation={<NurseNavigation />}>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Nursing Tasks</h1>
          <p className="text-muted-foreground">Manage and track your assigned tasks</p>
        </div>

        {/* Task Stats */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{tasksByStatus.pending}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">In Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{tasksByStatus.inProgress}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{tasksByStatus.completed}</div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle>Filter Tasks</CardTitle>
            <CardDescription>View tasks by status</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              {(["all", "pending", "in-progress", "completed"] as const).map((status) => (
                <Button
                  key={status}
                  variant={filter === status ? "default" : "outline"}
                  onClick={() => setFilter(status)}
                  className={filter === status ? "" : "bg-transparent"}
                >
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Tasks List */}
        <Card>
          <CardHeader>
            <CardTitle>Your Tasks</CardTitle>
            <CardDescription>Showing {filteredTasks.length} task(s)</CardDescription>
          </CardHeader>
          <CardContent>
            {filteredTasks.length > 0 ? (
              <div className="space-y-4">
                {filteredTasks.map((task) => (
                  <div key={task.id} className="rounded-lg border p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <h3 className="font-semibold">{task.description}</h3>
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
                          <Badge
                            variant={
                              task.status === "pending"
                                ? "outline"
                                : task.status === "in-progress"
                                  ? "default"
                                  : "secondary"
                            }
                          >
                            {task.status}
                          </Badge>
                        </div>
                        <p className="mt-2 text-sm text-muted-foreground">Patient: {task.patientName}</p>
                        <p className="text-sm text-muted-foreground">Type: {task.taskType}</p>
                        <p className="text-sm text-muted-foreground">
                          Due: {task.dueDate} at {task.dueTime}
                        </p>
                        {task.notes && (
                          <div className="mt-2 rounded-md bg-muted p-2">
                            <p className="text-sm">Notes: {task.notes}</p>
                          </div>
                        )}
                      </div>
                      <div className="flex gap-2">
                        {task.status !== "completed" && (
                          <Button size="sm" variant="default">
                            {task.status === "pending" ? "Start" : "Complete"}
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <CheckCircle2 className="mb-4 h-12 w-12 text-success" />
                <p className="text-muted-foreground">No tasks in this category</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
