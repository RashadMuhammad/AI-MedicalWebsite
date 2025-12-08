"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { DashboardLayout } from "@/components/dashboard-layout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Activity,
  FileText,
  Calendar,
  Building2,
  Users,
  Settings,
  DollarSign,
  Stethoscope,
  Workflow,
} from "lucide-react";
import { apiFetch } from "@/lib/api";
import { toast } from "sonner";

type Service = {
  service_id: string;
  name: string;
  category:
    | "Consultation"
    | "Procedure"
    | "Lab Test"
    | "Radiology"
    | "Pharmacy"
    | "Package"
    | "Room";
  department_id?: string;

  price: number;
  price_type: "Fixed" | "Variable" | "DoctorBased" | "Insurance";
  doctor_pricing?: Array<{
    doctor_id: string;
    price: number;
  }>;

  duration: {
    value: number;
    unit: "Minutes" | "Hours" | "Days";
  };

  taxable: boolean;
  tax_rate?: number;

  eligible_for_insurance: boolean;
  insurance_codes?: string[];

  status: "Active" | "Inactive";
};

type Doctor = {
  doctor_id: string;
  name: string;
};
function AdminNavigation() {
  const navItems = [
    { href: "/admin", icon: Activity, label: "Dashboard" },
    { href: "/admin/users", icon: Users, label: "User Management" },
    { href: "/admin/departments", icon: Building2, label: "Departments" },
    { href: "/admin/appointments", icon: Calendar, label: "Appointments" },
    { href: "/admin/billing", icon: DollarSign, label: "Billing & Finance" },
    { href: "/admin/reports", icon: FileText, label: "Reports" },
    { href: "/admin/services", icon: Workflow, label: "Services" },
    { href: "/admin/settings", icon: Settings, label: "Settings" },
  ];

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
  );
}

export default function ServicesPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [open, setOpen] = useState(false);
  const [selectedService, setSelectedService] = useState<Service | null>(null);

  const [selectedDoctorId, setSelectedDoctorId] = useState<string>("");
  const [selectedDoctorPrice, setSelectedDoctorPrice] = useState<number>(0);

  const [newService, setNewService] = useState<Service>({
    service_id: "",
    name: "",
    category: "Consultation",
    department_id: "",
    price: 0,
    price_type: "Fixed",
    doctor_pricing: [],
    duration: { value: 0, unit: "Minutes" },
    taxable: false,
    tax_rate: 0,
    eligible_for_insurance: false,
    insurance_codes: [],
    status: "Active",
  });

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const { data } = await apiFetch("/api/services");
        setServices(data);
      } catch (err) {
        console.error("Failed to fetch services:", err);
      }
    };
    fetchServices();
  }, []);

  // Fetch doctors for DoctorBased pricing
  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const { data } = await apiFetch("/api/doctors");
        // Expect data to be array of { doctor_id, name }
        setDoctors(data || []);
      } catch (err) {
        console.error("Failed to fetch doctors:", err);
      }
    };

    fetchDoctors();
  }, []);

  const handleAddService = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        name: newService.name,
        category: newService.category,
        department_id: newService.department_id,
        price: newService.price,
        price_type: newService.price_type,
        doctor_pricing: newService.doctor_pricing,
        duration: newService.duration,
        taxable: newService.taxable,
        tax_rate: newService.tax_rate,
        eligible_for_insurance: newService.eligible_for_insurance,
        insurance_codes: newService.insurance_codes,
        status: newService.status,
      };

      await apiFetch("/api/services", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      toast.success(`Service "${newService.name}" added successfully!`);

      const { data } = await apiFetch("/api/services");
      setServices(data);

      setNewService({
        service_id: "",
        name: "",
        category: "Consultation",
        department_id: "",
        price: 0,
        price_type: "Fixed",
        doctor_pricing: [],
        duration: { value: 0, unit: "Minutes" },
        taxable: false,
        tax_rate: 0,
        eligible_for_insurance: false,
        insurance_codes: [],
        status: "Active",
      });

      setOpen(false);
    } catch (error: any) {
      toast.error(error?.message || "Failed to add service");
    }
  };
  console.log(doctors, "  ValueOf doctors");
  return (
    <DashboardLayout navigation={<AdminNavigation />}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Services</h1>
            <p className="text-muted-foreground">
              Manage hospital services & pricing
            </p>
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
                {/* Name */}
                <div>
                  <Label>Service Name</Label>
                  <Input
                    placeholder="e.g., MRI Scan"
                    value={newService.name}
                    onChange={(e) =>
                      setNewService({ ...newService, name: e.target.value })
                    }
                    required
                  />
                </div>

                {/* Price */}
                <div>
                  <Label>Price (₹)</Label>
                  <Input
                    type="number"
                    placeholder="e.g., 4500"
                    value={newService.price}
                    onChange={(e) =>
                      setNewService({
                        ...newService,
                        price: Number(e.target.value),
                      })
                    }
                    required
                  />
                </div>

                {/* Category */}
                <div>
                  <Label>Category</Label>
                  <Select
                    value={newService.category}
                    onValueChange={(v) =>
                      setNewService({
                        ...newService,
                        category: v as Service["category"],
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Consultation">Consultation</SelectItem>
                      <SelectItem value="Procedure">Procedure</SelectItem>
                      <SelectItem value="Lab Test">Lab Test</SelectItem>
                      <SelectItem value="Radiology">Radiology</SelectItem>
                      <SelectItem value="Pharmacy">Pharmacy</SelectItem>
                      <SelectItem value="Package">Package</SelectItem>
                      <SelectItem value="Room">Room</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
         

                {/* Price Type */}
                <div>
                  <Label>Price Type</Label>
                  <Select
                    value={newService.price_type}
                    onValueChange={(v) =>
                      setNewService({
                        ...newService,
                        price_type: v as Service["price_type"],
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Fixed">Fixed</SelectItem>
                      <SelectItem value="Variable">Variable</SelectItem>
                      <SelectItem value="DoctorBased">Doctor Based</SelectItem>
                      <SelectItem value="Insurance">Insurance</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Doctor Based Pricing */}
                {newService.price_type === "DoctorBased" && (
                  <div className="space-y-3">
                    <Label>Doctor Based Pricing</Label>

                    <div className="flex gap-2">
                      <div className="flex-1">
                        <Select
                          value={selectedDoctorId}
                          onValueChange={(v) => setSelectedDoctorId(v)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select doctor" />
                          </SelectTrigger>
                          <SelectContent>
                            {doctors?.map((d) => (
                              <SelectItem key={d.doctor_id} value={d.doctor_id}>
                                {d.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <Input
                        type="number"
                        placeholder="Price"
                        value={selectedDoctorPrice}
                        onChange={(e) =>
                          setSelectedDoctorPrice(Number(e.target.value))
                        }
                      />

                      <Button
                        type="button"
                        onClick={() => {
                          if (!selectedDoctorId) {
                            toast.error("Please select a doctor");
                            return;
                          }

                          if (!selectedDoctorPrice || selectedDoctorPrice <= 0) {
                            toast.error("Please enter a valid price");
                            return;
                          }

                          setNewService((prev) => {
                            const existing = prev.doctor_pricing || [];
                            // If doctor already exists, replace price
                            const filtered = existing.filter(
                              (dp) => dp.doctor_id !== selectedDoctorId
                            );
                            return {
                              ...prev,
                              doctor_pricing: [
                                ...filtered,
                                { doctor_id: selectedDoctorId, price: selectedDoctorPrice },
                              ],
                            };
                          });

                          // clear inputs
                          setSelectedDoctorId("");
                          setSelectedDoctorPrice(0);
                        }}
                      >
                        Add
                      </Button>
                    </div>

                    {/* List of added doctor pricing entries */}
                    {(newService.doctor_pricing ?? []).length > 0 && (
                      <div className="space-y-2">
                        {(newService.doctor_pricing ?? []).map((dp) => {
                          const doc = doctors.find((d) => d.doctor_id === dp.doctor_id);
                          return (
                            <div
                              key={dp.doctor_id}
                              className="flex items-center justify-between rounded-md border p-2"
                            >
                              <div>
                                <p className="text-sm font-medium">
                                  {doc ? doc.name : `Doctor ${dp.doctor_id}`}
                                </p>
                                <p className="text-xs text-muted-foreground">₹{dp.price}</p>
                              </div>

                              <div>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => {
                                    setNewService((prev) => ({
                                      ...prev,
                                      doctor_pricing: (prev.doctor_pricing || []).filter(
                                        (x) => x.doctor_id !== dp.doctor_id
                                      ),
                                    }));
                                  }}
                                >
                                  Remove
                                </Button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}
                {/* Duration */}
                <div>
                  <Label>Duration</Label>
                  <div className="flex gap-2">
                    <Input
                      type="number"
                      placeholder="Value"
                      value={newService.duration.value}
                      onChange={(e) =>
                        setNewService({
                          ...newService,
                          duration: {
                            ...newService.duration,
                            value: Number(e.target.value),
                          },
                        })
                      }
                    />
                    <Select
                      value={newService.duration.unit}
                      onValueChange={(v) =>
                        setNewService({
                          ...newService,
                          duration: {
                            ...newService.duration,
                            unit: v as "Minutes" | "Hours" | "Days",
                          },
                        })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Minutes">Minutes</SelectItem>
                        <SelectItem value="Hours">Hours</SelectItem>
                        <SelectItem value="Days">Days</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Taxable */}
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={newService.taxable}
                    onChange={() =>
                      setNewService({
                        ...newService,
                        taxable: !newService.taxable,
                      })
                    }
                  />
                  <Label>Taxable Service</Label>
                </div>

                {newService.taxable && (
                  <div>
                    <Label>Tax Rate (%)</Label>
                    <Input
                      type="number"
                      placeholder="e.g., 18"
                      value={newService.tax_rate}
                      onChange={(e) =>
                        setNewService({
                          ...newService,
                          tax_rate: Number(e.target.value),
                        })
                      }
                    />
                  </div>
                )}

                {/* Insurance */}
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={newService.eligible_for_insurance}
                    onChange={() =>
                      setNewService({
                        ...newService,
                        eligible_for_insurance:
                          !newService.eligible_for_insurance,
                      })
                    }
                  />
                  <Label>Eligible for Insurance</Label>
                </div>

                {/* Status */}
                <div>
                  <Label>Status</Label>
                  <Select
                    value={newService.status}
                    onValueChange={(v) =>
                      setNewService({
                        ...newService,
                        status: v as Service["status"],
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Active">Active</SelectItem>
                      <SelectItem value="Inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button type="submit" className="w-full">
                  Save Service
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Service Cards */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
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
                      <CardDescription>{service.category}</CardDescription>
                    </div>
                  </div>
                  <Badge>{service.status}</Badge>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <p className="text-xs text-muted-foreground">Price</p>
                    <p className="text-xl font-semibold">₹{service.price}</p>
                  </div>

                  <div>
                    <p className="text-xs text-muted-foreground">Duration</p>
                    <p className="font-medium">
                      {service.duration?.value
                        ? `${service.duration.value} ${service.duration.unit}`
                        : "—"}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-muted-foreground">Price Type</p>
                    <p className="font-medium">{service.price_type}</p>
                  </div>
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedService(service)}
                  className="w-full"
                >
                  View Details
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* VIEW DETAILS MODAL */}
        {selectedService && (
          <Dialog
            open={!!selectedService}
            onOpenChange={(open) => !open && setSelectedService(null)}
          >
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{selectedService.name}</DialogTitle>
              </DialogHeader>

              <div className="space-y-3 text-sm">
                <p>
                  <strong>Category:</strong> {selectedService.category}
                </p>

                <p>
                  <strong>Price:</strong> ₹{selectedService.price}
                </p>

                <p>
                  <strong>Price Type:</strong> {selectedService.price_type}
                </p>

                {selectedService.price_type === "DoctorBased" &&
                  (selectedService.doctor_pricing ?? []).length > 0 && (
                    <div>
                      <strong>Doctor Pricing:</strong>
                      <ul className="list-disc ml-6 mt-1 space-y-1">
                        {(selectedService.doctor_pricing ?? []).map((dp, idx) => (
                          <li key={idx}>
                            Doctor {dp.doctor_id}: ₹{dp.price}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                <p>
                  <strong>Duration:</strong>{" "}
                  {selectedService.duration?.value
                    ? `${selectedService.duration.value} ${selectedService.duration.unit}`
                    : "Not applicable"}
                </p>

                <p>
                  <strong>Taxable:</strong>{" "}
                  {selectedService.taxable
                    ? `Yes (${selectedService.tax_rate}%)`
                    : "No"}
                </p>

                <p>
                  <strong>Insurance:</strong>{" "}
                  {selectedService.eligible_for_insurance
                    ? "Eligible"
                    : "Not eligible"}
                </p>

                {selectedService.eligible_for_insurance &&
                  (selectedService.insurance_codes?.length ?? 0) > 0 && (
                    <p>
                      <strong>Insurance Codes:</strong>{" "}
                      {(selectedService.insurance_codes ?? []).join(", ")}
                    </p>
                  )}

                <p>
                  <strong>Status:</strong> {selectedService.status}
                </p>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </DashboardLayout>
  );
}
