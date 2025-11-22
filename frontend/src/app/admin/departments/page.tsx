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
  Building2,
  TrendingUp,
  Users,
  Calendar,
  Activity,
  Settings,
  FileText,
  DollarSign,
} from "lucide-react"
import { apiFetch } from "@/lib/api"
import { toast } from "sonner";
import { Department, Staff } from "@/lib/types"

function AdminNavigation() {
  const navItems = [
    { href: "/admin", icon: Activity, label: "Dashboard" },
    { href: "/admin/users", icon: Users, label: "User Management" },
    { href: "/admin/departments", icon: Building2, label: "Departments" },
    { href: "/admin/appointments", icon: Calendar, label: "Appointments" },
    { href: "/admin/billing", icon: DollarSign, label: "Billing & Finance" },
    { href: "/admin/reports", icon: FileText, label: "Reports" },
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

export default function DepartmentsPage() {
  const [departments, setDepartments] = useState<Department[]>([])
  const [staffUsers, setStaffUsers] = useState<Staff[]>([])
  const [loadingStaff, setLoadingStaff] = useState(true)
  const [newDept, setNewDept] = useState({
    name: "",
    head_id: "",
    doctors_count: "",
    patients_count: "",
    revenue: "",
  })
  const [open, setOpen] = useState(false)
  const [selectedDept, setSelectedDept] = useState<Department | null>(null)
  const [selectedStaffDept, setSelectedStaffDept] = useState<Department | null>(null)

  // Fetch Departments and Staff
  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const { data } = await apiFetch("/api/departments")
        setDepartments(data)
      } catch (err) {
        console.error("Failed to fetch departments:", err)
      }
    }

    const fetchDoctors = async () => {
      try {
        setLoadingStaff(true)
        const { data } = await apiFetch("/api/users/doctors")
        setStaffUsers(data)
      } catch (err) {
        console.error("Failed to fetch doctors:", err)
        setStaffUsers([])
      } finally {
        setLoadingStaff(false)
      }
    }

    fetchDepartments()
    fetchDoctors()
  }, [])

  // Add new department
const handleAddDepartment = async (e: React.FormEvent) => {
  e.preventDefault();

  try {
    const payload = {
      name: newDept.name,
      head_id: newDept.head_id || null,
      doctors_count: parseInt(newDept.doctors_count) || 0,
      patients_count: parseInt(newDept.patients_count) || 0,
      revenue: parseFloat(newDept.revenue) || 0,
      status: "active",
    };

    const { res, data } = await apiFetch("/api/departments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) throw new Error(data?.error || "Something went wrong");

    // ✅ Success toast
    toast.success(`Department "${newDept.name}" added successfully!`);

    const { data: updatedList } = await apiFetch("/api/departments");
    setDepartments(updatedList); 


    // Clear form values
    setNewDept({
      name: "",
      head_id: "",
      doctors_count: "",
      patients_count: "",
      revenue: "",
    });

    // Close dialog
    setOpen(false);

  } catch (error: any) {
    console.error("Error adding department:", error);

    // ❌ Error toast
    toast.error(error?.message || "Failed to add department");
  }
};



  // Fetch staff for a department
const handleManageStaffClick = async (deptId: string) => {
  try {
    // 1️⃣ Fetch from API
    const { data: apiData } = await apiFetch(`/api/departments/departments-with-staff?id=${deptId}`);
    console.log("Raw API response:", apiData);

    const departmentsArray = apiData?.data;
    if (!departmentsArray || departmentsArray.length === 0) {
      console.warn("No department data found for ID:", deptId);

      setSelectedStaffDept({
        department_id: deptId,
        name: "",
        head: "",
        doctors_count: 0,
        patients_count: 0,
        revenue: 0,
        status: "unknown",
        staff: [],
      });
      return;
    }
    const departmentWithStaff = departmentsArray[0];
    console.log("Department object:", departmentWithStaff);
    const normalizedDept = {
      department_id: departmentWithStaff.department_id,
      name: departmentWithStaff.department_name,
      head: departmentWithStaff.head || "",
      doctors_count: departmentWithStaff.doctors_count || 0,
      patients_count: departmentWithStaff.patients_count || 0,
      revenue: departmentWithStaff.revenue || 0,
      status: departmentWithStaff.status || "active",
      staff: departmentWithStaff.staff || [],
    };

    console.log("Normalized department:", normalizedDept);

    setSelectedStaffDept(normalizedDept);

  } catch (err) {
    console.error("Failed to fetch staff for department:", err);

    const fallbackDept = departments.find(
      (d) => d.department_id.toString() === deptId.toString()
    );

    setSelectedStaffDept(fallbackDept
      ? { ...fallbackDept, staff: [] }
      : {
          department_id: deptId,
          name: "",
          head: "",
          doctors_count: 0,
          patients_count: 0,
          revenue: 0,
          status: "unknown",
          staff: [],
        });
  }
};



  return (
    <DashboardLayout navigation={<AdminNavigation />}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Departments</h1>
            <p className="text-muted-foreground">Manage hospital departments</p>
          </div>

          {/* Add Department Dialog */}
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button>Add Department</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Department</DialogTitle>
              </DialogHeader>

              <form onSubmit={handleAddDepartment} className="space-y-4">
                <div>
                  <Label htmlFor="name">Department Name</Label>
                  <Input
                    id="name"
                    placeholder="e.g., Neurology"
                    value={newDept.name}
                    onChange={(e) => setNewDept({ ...newDept, name: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="head">Head of Department</Label>
                  <Select
                    value={newDept.head_id}
                    onValueChange={(value) => setNewDept({ ...newDept, head_id: value })}
                    disabled={loadingStaff || staffUsers.length === 0}
                  >
                    <SelectTrigger>
                      <SelectValue
                        placeholder={
                          loadingStaff
                            ? "Loading doctors..."
                            : staffUsers.length === 0
                              ? "No doctors available"
                              : "Select a doctor"
                        }
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {staffUsers.length > 0 ? (
                        staffUsers.map((user) => (
                          <SelectItem key={user.head_id} value={String(user.head_id)}>
                            {user.name}
                          </SelectItem>
                        ))
                      ) : (
                        <SelectItem value="no-doctors" disabled>No doctors available</SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                </div>

                {/* <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="doctors">Doctors</Label>
                    <Input
                      id="doctors"
                      type="number"
                      value={newDept.doctors_count}
                      onChange={(e) => setNewDept({ ...newDept, doctors_count: e.target.value })}
                    />
                  </div>

                  <div>
                    <Label htmlFor="patients">Patients</Label>
                    <Input
                      id="patients"
                      type="number"
                      value={newDept.patients_count}
                      onChange={(e) => setNewDept({ ...newDept, patients_count: e.target.value })}
                    />
                  </div>

                  <div>
                    <Label htmlFor="revenue">Revenue ($)</Label>
                    <Input
                      id="revenue"
                      type="number"
                      value={newDept.revenue}
                      onChange={(e) => setNewDept({ ...newDept, revenue: e.target.value })}
                    />
                  </div>
                </div> */}

                <Button type="submit" className="w-full">Save Department</Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Department Cards */}
        <div className="grid gap-6 md:grid-cols-2">
          {departments.map((dept) => (
            <Card key={dept.department_id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                      <Building2 className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <CardTitle>{dept.name}</CardTitle>
                      <CardDescription>Head: {dept.head}</CardDescription>
                    </div>
                  </div>
                  <Badge variant="secondary">{dept.status}</Badge>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Doctors</p>
                    <p className="text-2xl font-bold">{dept.doctors_count}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Patients</p>
                    <p className="text-2xl font-bold">{dept.patients_count}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Revenue</p>
                    <p className="text-2xl font-bold">${(dept.revenue / 1000).toFixed(0)}k</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-sm text-success">
                  <TrendingUp className="h-4 w-4" />
                  <span>+5.2% from last month</span>
                </div>

                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1 bg-transparent"
                    onClick={() => setSelectedDept(dept)}
                  >
                    View Details
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1 bg-transparent"
                    onClick={() => handleManageStaffClick(String(dept.department_id))}
                  >
                    Manage Staff
                  </Button>

                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* View Details Modal */}
        {selectedDept && (
          <Dialog
            open={!!selectedDept}
            onOpenChange={(open) => !open && setSelectedDept(null)}
          >
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{selectedDept.name.toUpperCase()} DETAILS</DialogTitle>
              </DialogHeader>
              <div className="space-y-3 text-sm">
                <p><strong>Name:</strong> {selectedDept.name}</p>
                <p><strong>Head:</strong> {selectedDept.head}</p>
                <p><strong>Doctors:</strong> {selectedDept.doctors_count}</p>
                <p><strong>Patients:</strong> {selectedDept.patients_count}</p>
                <p><strong>Revenue:</strong> ${selectedDept.revenue}</p>
                <p><strong>Status:</strong> {selectedDept.status}</p>
              </div>
            </DialogContent>
          </Dialog>
        )}

        {/* Manage Staff Modal */}
        {selectedStaffDept && (
          <Dialog
            open={!!selectedStaffDept}
            onOpenChange={(open) => !open && setSelectedStaffDept(null)}
          >
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{selectedStaffDept.name} STAFF</DialogTitle>
              </DialogHeader>
              <div className="space-y-2 text-sm">
                {selectedStaffDept?.staff?.length > 0 ? (
                  selectedStaffDept.staff.map((staff) => (
                    <div key={staff.id} className="flex justify-between border-b py-1">
                      <span>{staff.name}</span>
                      <span className="text-muted-foreground">{staff.role}</span>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">No staff assigned.</p>
                )}
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </DashboardLayout>
  )
}
