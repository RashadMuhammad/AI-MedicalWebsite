"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { DashboardLayout } from "@/components/dashboard-layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Users,
  UserPlus,
  Search,
  Mail,
  Phone,
  Calendar,
  Activity,
  Settings,
  Building2,
  FileText,
  DollarSign,
  Edit as EditIcon,
} from "lucide-react";
import { apiFetch } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import type { Role, User, Department } from "@/lib/types";

type Status = {
  type: "success" | "warning" | "error";
  message: string;
} | null;

//
// Sidebar Navigation
//
function AdminNavigation() {
  const navItems = [
    { href: "/admin", icon: Activity, label: "Dashboard" },
    { href: "/admin/users", icon: Users, label: "User Management" },
    { href: "/admin/departments", icon: Building2, label: "Departments" },
    { href: "/admin/appointments", icon: Calendar, label: "Appointments" },
    { href: "/admin/billing", icon: DollarSign, label: "Billing & Finance" },
    { href: "/admin/reports", icon: FileText, label: "Reports" },
    { href: "/admin/settings", icon: Settings, label: "Settings" },
  ];
  return (
    <>
      {navItems.map((item) => (
        <Button
          asChild
          key={item.href}
          variant="ghost"
          className="w-full justify-start"
        >
          <Link href={item.href}>
            <item.icon className="mr-2 h-4 w-4" /> {item.label}
          </Link>
        </Button>
      ))}
    </>
  );
}

export default function UsersPage() {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<string>("");
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [usersByRole, setUsersByRole] = useState<Record<string, User[]>>({});
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [roles, setRoles] = useState<Role[]>([]);
  const [selectedRole, setSelectedRole] = useState<string>("");
  const [formData, setFormData] = useState<Partial<User>>({
    role_name: undefined,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState<Status>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [selectedDept, setSelectedDept] = useState<string>(""); // used for add form

  // EDIT state
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editData, setEditData] = useState<Partial<User> | null>(null);

  // Fetch users grouped by role
  const fetchUsersByRole = async (role?: string) => {
    try {
      const query = role ? `?role=${role}` : "";
      const { data } = await apiFetch(`/api/users/by-role${query}`);
      setUsersByRole(data.data || {});
    } catch (err) {
      console.error("Error fetching users by role:", err);
    }
  };

  const fetchCounts = async () => {
    try {
      const { data } = await apiFetch("/api/users/count-by-role");
      const countsObj: Record<string, number> = {};
      data?.data?.forEach((item: any) => {
        countsObj[item.role_name] = Number(item.user_count);
      });
      setCounts(countsObj);
      const firstRole = Object.keys(countsObj)[0];
      if (firstRole && !activeTab) setActiveTab(firstRole);
    } catch (err) {
      console.error("Error fetching counts:", err);
    }
  };

  const fetchRoles = async () => {
    try {
      const { data } = await apiFetch("/api/roles/allroles");
      setRoles(data);
    } catch (err) {
      console.error("Error fetching roles:", err);
    }
  };

  const fetchDepartments = async () => {
    try {
      const { data } = await apiFetch("/api/departments");
      setDepartments(data);
    } catch (err) {
      console.error("Error fetching departments:", err);
    }
  };

  // Auto-refresh all
  useEffect(() => {
    const fetchAll = async () => {
      await fetchCounts();
      await fetchUsersByRole(activeTab);
      await fetchRoles();
      await fetchDepartments();
    };

    // Initial fetch
    fetchAll();

    // Set interval (e.g., every 30 seconds)
    const intervalId = setInterval(() => {
      fetchAll();
    }, 30000); // adjust as needed

    return () => clearInterval(intervalId);
  }, [activeTab]);

  // Handle Add User
  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setStatus(null);
    try {
      const { res, data } = await apiFetch("/api/users/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (res.status === 201) {
        toast({
          title: "✅ User Added",
          description: "New user has been added successfully.",
        });

        setSelectedRole("");
        setIsAddUserOpen(false);
        fetchUsersByRole();
      } else {
        setStatus({ type: "error", message: data.error || "Server error" });
      }
    } catch (err: any) {
      setStatus({
        type: "error",
        message: err.message || "Something went wrong",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const filterUsers = (users: User[]) => {
    return users.filter(
      (user) =>
        user.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  };

  const handleTabChange = async (role: string) => {
    setActiveTab(role);
    await fetchUsersByRole(role);
  };

  const handleUserClick = (user: User) => {
    setSelectedUser(user);
  };

  // --- EDIT handlers ---
  const handleEditClick = (user: User) => {
    const prefillData = {
      ...user,
    };

    console.log("Prefilled editData:", prefillData); // 👈 check what is being set
    setEditData(prefillData);
    setIsEditOpen(true);
  };

  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editData || !editData.id) return;
    setIsSubmitting(true);
    try {
      const { res, data } = await apiFetch(`/api/users/${editData.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editData),
      });
      if (res.ok) {
        toast({
          title: "✅ User Updated",
          description: "User details updated successfully.",
        });
        setIsEditOpen(false);
        setEditData(null);
        fetchUsersByRole();
      } else {
        toast({
          title: "❌ Update failed",
          description: data?.error || "Server error",
        });
      }
    } catch (err) {
      console.error("Update user error:", err);
      toast({ title: "❌ Error", description: "Could not update user" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <DashboardLayout navigation={<AdminNavigation />}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              User Management
            </h1>
            <p className="text-muted-foreground">
              Manage all system users by role
            </p>
          </div>
          <Dialog open={isAddUserOpen} onOpenChange={setIsAddUserOpen}>
            <DialogTrigger asChild>
              <Button>
                <UserPlus className="mr-2 h-4 w-4" /> Add User
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New User</DialogTitle>
                <DialogDescription>Create a new user account</DialogDescription>
              </DialogHeader>

              <form onSubmit={handleAddUser} className="space-y-4">
                <div>
                  <Label>User Role</Label>
                  <Select
                    value={selectedRole}
                    onValueChange={(v) => {
                      setSelectedRole(v);
                      setFormData({
                        ...formData,
                        role_name: v as User["role_name"],
                      });
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                      {roles.map((role) => (
                        <SelectItem key={role.role_name} value={role.role_name}>
                          {role.role_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Full Name</Label>
                  <Input
                    type="text"
                    value={formData.name || ""}
                    placeholder="Enter full name"
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    required
                  />
                </div>

                <div>
                  <Label>Email</Label>
                  <Input
                    type="email"
                    placeholder="user@email.com"
                    value={formData.email || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    required
                  />
                </div>

                <div>
                  <Label>Phone</Label>
                  <Input
                    type="tel"
                    placeholder="+1234567890"
                    value={formData.phone || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, phone: e.target.value })
                    }
                    required
                  />
                </div>

                <div>
                  <Label>Password</Label>
                  <Input
                    type="password"
                    placeholder="Enter password"
                    value={formData.password || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, password: e.target.value })
                    }
                    required
                  />
                </div>

                {formData.role_name === "doctor" && (
                  <div className="space-y-2">
                    <Label htmlFor="specialization">Specialization</Label>
                    <Input
                      id="specialization"
                      placeholder="e.g., Cardiology"
                      value={formData.specialization || ""}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          specialization: e.target.value,
                        })
                      }
                    />
                  </div>
                )}

                {formData.role_name === "patient" && (
                  <>
                    <div>
                      <Label className="block text-gray-700 mb-1 font-medium">
                        Blood Group
                      </Label>
                      <Input
                        type="text"
                        placeholder="e.g., O+, A-, B+, AB+"
                        name="bloodGroup"
                        value={formData.blood_group || ""}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            blood_group: e.target.value,
                          })
                        }
                        className="w-full border border-gray-300 rounded-md p-2 focus:ring focus:ring-blue-200"
                      />
                    </div>
                    <div>
                      <Label className="block text-gray-700 mb-1 font-medium">
                        Address
                      </Label>
                      <Input
                        type="text"
                        name="address"
                        placeholder="Enter full address (House No, Street, City)"
                        value={formData.address || ""}
                        onChange={(e) =>
                          setFormData({ ...formData, address: e.target.value })
                        }
                        className="w-full border border-gray-300 rounded-md p-2 focus:ring focus:ring-blue-200"
                      />
                    </div>
                  </>
                )}

                {["doctor", "nurse"].includes(formData.role_name || "") && (
                  <div>
                    <Label>Department</Label>
                    <Select
                      value={selectedDept}
                      onValueChange={(value) => {
                        setSelectedDept(value);
                        setFormData({
                          ...formData,
                          department_id: Number(value),
                        });
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select Department" />
                      </SelectTrigger>
                      <SelectContent>
                        {departments.map((dept: any) => (
                          <SelectItem
                            key={dept.id ?? dept.department_id}
                            value={String(dept.id ?? dept.department_id)}
                          >
                            {dept.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {formData.role_name === "patient" && (
                  <div>
                    <Label className="block text-gray-700 mb-1 font-medium">
                      Emergency Contact
                    </Label>
                    <Input
                      type="text"
                      name="emergencyContact"
                      placeholder="e.g., +91 9876543210"
                      value={formData.emergency_contact || ""}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          emergency_contact: e.target.value,
                        })
                      }
                      className="w-full border border-gray-300 rounded-md p-2 focus:ring focus:ring-blue-200"
                    />
                  </div>
                )}

                <Button
                  type="submit"
                  className="w-full"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Creating..." : "Create User"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Search */}
        <Card>
          <CardContent className="pt-6 flex items-center gap-2">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search users by name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="max-w-md"
            />
          </CardContent>
        </Card>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={handleTabChange}>
          <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-100">
            <TabsList className="flex w-max min-w-full gap-2 bg-muted rounded-lg p-2">
              {Object.entries(counts).map(([role, count]) => (
                <TabsTrigger
                  key={role}
                  value={role}
                  className="data-[state=active]:bg-background data-[state=active]:shadow-sm px-4 py-2 rounded-md text-sm font-medium whitespace-nowrap border border-transparent hover:bg-background transition-colors"
                >
                  {role.charAt(0).toUpperCase() + role.slice(1)} ({count})
                </TabsTrigger>
              ))}
            </TabsList>
          </div>

          {Object.entries(usersByRole).map(([role_name, users]) => (
            <TabsContent key={role_name} value={role_name} className="mt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filterUsers(users).map((user) => (
                  <Card
                    key={user.id || user.email}
                    className="rounded-xl shadow-sm hover:shadow-md transition"
                  >
                    <CardContent className="flex items-start gap-4 p-6">
                      {/* Avatar */}
                      <Avatar className="h-12 w-12 shrink-0">
                        <AvatarFallback className="bg-teal-600 text-white">
                          {(user.name || "U")
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>

                      {/* User info */}
                      <div className="flex-1 min-w-0 space-y-1 break-words pr-4">
                        <h3
                          className="font-semibold text-lg truncate"
                          title={user.name}
                        >
                          {user.name}
                        </h3>

                        <p
                          className="text-sm text-muted-foreground flex items-center gap-2 overflow-hidden text-ellipsis whitespace-nowrap"
                          title={user.email}
                        >
                          <Mail className="h-4 w-4 shrink-0" /> {user.email}
                        </p>

                        <p
                          className="text-sm text-muted-foreground flex items-center gap-2 overflow-hidden text-ellipsis whitespace-nowrap"
                          title={user.phone}
                        >
                          <Phone className="h-4 w-4 shrink-0" /> {user.phone}
                        </p>

                        <p className="text-sm text-muted-foreground flex items-center gap-2">
                          <Calendar className="h-4 w-4 shrink-0" /> Joined:{" "}
                          {user.created_at || "N/A"}
                        </p>
                      </div>

                      {/* Actions */}
                      <div className="flex flex-col gap-2 shrink-0">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditClick(user)}
                        >
                          <EditIcon className="mr-2 h-4 w-4" /> Edit
                        </Button>
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => handleUserClick(user)}
                        >
                          View
                        </Button>
                        <Button variant="destructive" size="sm">
                          Deactivate
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          ))}
        </Tabs>

        {/* User Details Dialog */}
        {selectedUser && (
          <Dialog
            open={!!selectedUser}
            onOpenChange={() => setSelectedUser(null)}
          >
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {selectedUser.role_name?.toUpperCase()} DETAILS
                </DialogTitle>
                <DialogDescription>
                  Complete profile information
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-3 text-sm">
                <p>
                  <strong>Name:</strong> {selectedUser.name}
                </p>
                <p>
                  <strong>Email:</strong> {selectedUser.email}
                </p>
                <p>
                  <strong>Phone:</strong> {selectedUser.phone}
                </p>
                {selectedUser.specialization && (
                  <p>
                    <strong>Specialization:</strong>{" "}
                    {selectedUser.specialization}
                  </p>
                )}
                <p>
                  <strong>Joined:</strong> {selectedUser.created_at || "N/A"}
                </p>
              </div>
            </DialogContent>
          </Dialog>
        )}

        {/* Edit User Dialog */}
        {/* Edit User Dialog */}
        <Dialog
          open={isEditOpen}
          onOpenChange={(open) => {
            if (!open) {
              setIsEditOpen(false);
              setEditData(null);
            }
          }}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit User</DialogTitle>
            </DialogHeader>

            <form onSubmit={handleUpdateUser} className="space-y-4">
              <div>
                <Label>Full Name</Label>
                <Input
                  value={editData?.name || ""}
                  onChange={(e) =>
                    setEditData((d) => ({ ...(d || {}), name: e.target.value }))
                  }
                />
              </div>

              <div>
                <Label>Email</Label>
                <Input
                  value={editData?.email || ""}
                  onChange={(e) =>
                    setEditData((d) => ({
                      ...(d || {}),
                      email: e.target.value,
                    }))
                  }
                />
              </div>

              <div>
                <Label>Phone</Label>
                <Input
                  value={editData?.phone || ""}
                  onChange={(e) =>
                    setEditData((d) => ({
                      ...(d || {}),
                      phone: e.target.value,
                    }))
                  }
                />
              </div>

              {/* Conditional fields */}
              {editData?.role_name === "doctor" && (
                <div>
                  <Label>Specialization</Label>
                  <Input
                    value={editData?.specialization || ""}
                    onChange={(e) =>
                      setEditData((d) => ({
                        ...(d || {}),
                        specialization: e.target.value,
                      }))
                    }
                  />
                </div>
              )}

              {["doctor", "nurse"].includes(editData?.role_name || "") && (
                <div>
                  <Label>Department</Label>
                  <Select
                    value={String(editData?.department_id ?? "")}
                    onValueChange={(value) =>
                      setEditData((d) => ({
                        ...(d || {}),
                        department_id: Number(value),
                      }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select Department" />
                    </SelectTrigger>
                    <SelectContent>
                      {departments.map((dept) => (
                        <SelectItem
                          key={dept.department_id ?? dept.department_id}
                          value={String(
                            dept.department_id ?? dept.department_id
                          )}
                        >
                          {dept.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {editData?.role_name === "patient" && (
                <>
                  <div>
                    <Label>Blood Group</Label>
                    <Input
                      value={editData?.blood_group || ""}
                      onChange={(e) =>
                        setEditData((d) => ({
                          ...(d || {}),
                          bloodGroup: e.target.value,
                        }))
                      }
                    />
                  </div>
                  <div>
                    <Label>Address</Label>
                    <Input
                      value={editData?.address || ""}
                      onChange={(e) =>
                        setEditData((d) => ({
                          ...(d || {}),
                          address: e.target.value,
                        }))
                      }
                    />
                  </div>
                  <div>
                    <Label>Emergency Contact</Label>
                    <Input
                      value={editData?.emergency_contact || ""}
                      onChange={(e) =>
                        setEditData((d) => ({
                          ...(d || {}),
                          emergencyContact: e.target.value,
                        }))
                      }
                    />
                  </div>
                </>
              )}

              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? "Updating..." : "Save Changes"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
