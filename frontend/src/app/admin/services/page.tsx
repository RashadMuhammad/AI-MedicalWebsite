"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { DashboardLayout } from "@/components/dashboard-layout"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Activity,
  FileText,
  Calendar,
  Building2,
  Users,
  Settings,
  DollarSign,
  Stethoscope,
  Workflow
} from "lucide-react"
import { apiFetch } from "@/lib/api"
import { toast } from "sonner"

type Service = {
  service_id: string
  name: string
  price: number
  category: string
  duration: string
  status: string
}

function AdminNavigation() {
  const navItems = [
    { href: "/admin", icon: Activity, label: "Dashboard" },
    { href: "/admin/users", icon: Users, label: "User Management" },
    { href: "/admin/departments", icon: Building2, label: "Departments" },
    { href: "/admin/appointments", icon: Calendar, label: "Appointments" },
    { href: "/admin/billing", icon: DollarSign, label: "Billing & Finance" },
    { href: "/admin/reports", icon: FileText, label: "Reports" },
    { href: "/admin/services", icon:Workflow , label: "Services" },
    { href: "/admin/settings", icon: Settings, label: "Settings" },
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

export default function ServicesPage() {
  const [services, setServices] = useState<Service[]>([])
  const [open, setOpen] = useState(false)
  const [selectedService, setSelectedService] = useState<Service | null>(null)
  const [newService, setNewService] = useState({
    name: "",
    price: "",
    category: "",
    duration: "",
  })

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const { data } = await apiFetch("/api/services")
        console.log("Fetched services:", data)
        setServices(data)
      } catch (err) {
        console.error("Failed to fetch services:", err)
      }
    }
    fetchServices()
  }, [])

  const handleAddService = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const payload = {
        name: newService.name,
        price: parseFloat(newService.price),
        category: newService.category,
        duration: newService.duration,
        status: "active",
      }

      const { res, data } = await apiFetch("/api/services", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      if (!res.ok) throw new Error(data?.error || "Failed to add service")

      toast.success(`Service "${newService.name}" added successfully!`)

      const { data: updatedList } = await apiFetch("/api/services")
      setServices(updatedList)

      setNewService({ name: "", price: "", category: "", duration: "" })
      setOpen(false)
    } catch (error: any) {
      toast.error(error?.message || "Failed to add service")
    }
  }

  return (
    <DashboardLayout navigation={<AdminNavigation />}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Services</h1>
            <p className="text-muted-foreground">Manage hospital services & pricing</p>
          </div>

          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button>Add Service</Button>
            </DialogTrigger>

            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Service</DialogTitle>
              </DialogHeader>

              <form onSubmit={handleAddService} className="space-y-4">
                <div>
                  <Label htmlFor="name">Service Name</Label>
                  <Input
                    id="name"
                    placeholder="e.g., MRI Scan"
                    value={newService.name}
                    onChange={(e) =>
                      setNewService({ ...newService, name: e.target.value })
                    }
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="price">Price (₹)</Label>
                  <Input
                    id="price"
                    type="number"
                    placeholder="e.g., 4500"
                    value={newService.price}
                    onChange={(e) =>
                      setNewService({ ...newService, price: e.target.value })
                    }
                    required
                  />
                </div>

                <div>
                  <Label>Category</Label>
                  <Select
                    value={newService.category}
                    onValueChange={(v) =>
                      setNewService({ ...newService, category: v })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="consultation">Consultation</SelectItem>
                      <SelectItem value="diagnostic">Diagnostic Test</SelectItem>
                      <SelectItem value="radiology">Radiology</SelectItem>
                      <SelectItem value="lab">Laboratory</SelectItem>
                      <SelectItem value="surgery">Surgery</SelectItem>
                      <SelectItem value="procedure">Procedure</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="duration">Duration (optional)</Label>
                  <Input
                    id="duration"
                    placeholder="e.g., 30 mins"
                    value={newService.duration}
                    onChange={(e) =>
                      setNewService({ ...newService, duration: e.target.value })
                    }
                  />
                </div>

                <Button type="submit" className="w-full">
                  Save Service
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Service Cards */}
        <div className="grid gap-6 md:grid-cols-2">
          {services.map((service) => (
            <Card key={service.service_id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                      <Stethoscope className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <CardTitle>{service.name}</CardTitle>
                      <CardDescription>Category: {service.category}</CardDescription>
                    </div>
                  </div>
                  <Badge variant="secondary">{service.status}</Badge>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Price</p>
                    <p className="text-2xl font-bold">₹{service.price}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Duration</p>
                    <p className="text-xl font-semibold">
                      {service.duration || "—"}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Status</p>
                    <p className="text-xl font-semibold">{service.status}</p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setSelectedService(service)}
                    className="flex-1"
                  >
                    View Details
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* View Details Modal */}
        {selectedService && (
          <Dialog
            open={!!selectedService}
            onOpenChange={(open) => !open && setSelectedService(null)}
          >
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{selectedService.name.toUpperCase()} DETAILS</DialogTitle>
              </DialogHeader>

              <div className="space-y-3 text-sm">
                <p><strong>Name:</strong> {selectedService.name}</p>
                <p><strong>Price:</strong> ₹{selectedService.price}</p>
                <p><strong>Category:</strong> {selectedService.category}</p>
                <p><strong>Duration:</strong> {selectedService.duration || "Not applicable"}</p>
                <p><strong>Status:</strong> {selectedService.status}</p>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </DashboardLayout>
  )
}
