"use client"

import { useAuth } from "@/lib/auth-context"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { CreditCard, Calendar, Download, DollarSign, User, Video, FileText } from "lucide-react"
import { mockBills } from "@/lib/mock-data"
import { useToast } from "@/hooks/use-toast"
import Link from "next/link"

function PatientNavigation() {
  const navItems = [
    { href: "/patient", icon: Calendar, label: "Dashboard" },
    { href: "/patient/appointments", icon: Calendar, label: "Appointments" },
    { href: "/patient/records", icon: FileText, label: "Medical Records" },
    { href: "/patient/billing", icon: CreditCard, label: "Billing" },
    { href: "/patient/teleconsult", icon: Video, label: "Teleconsultation" },
    { href: "/patient/profile", icon: User, label: "Profile" },
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

export default function BillingPage() {
  const { user } = useAuth()
  const { toast } = useToast()
  const patientBills = mockBills.filter((bill) => bill.patientId === user?.id)

  const totalPaid = patientBills.filter((b) => b.status === "paid").reduce((sum, b) => sum + b.total, 0)
  const totalPending = patientBills.filter((b) => b.status !== "paid").reduce((sum, b) => sum + b.total, 0)

  const handlePayment = (billId: string) => {
    toast({
      title: "Payment Processed",
      description: "Your payment has been processed successfully.",
    })
  }

  return (
    <DashboardLayout navigation={<PatientNavigation />} allowedRoles={["patient"]}>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Billing & Payments</h1>
          <p className="text-muted-foreground">Manage your medical bills and payments</p>
        </div>

        {/* Financial Summary */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Paid</CardTitle>
              <DollarSign className="h-4 w-4 text-success" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${totalPaid.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground">All time payments</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Amount</CardTitle>
              <DollarSign className="h-4 w-4 text-warning" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${totalPending.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground">Outstanding balance</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Bills</CardTitle>
              <CreditCard className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{patientBills.length}</div>
              <p className="text-xs text-muted-foreground">All invoices</p>
            </CardContent>
          </Card>
        </div>

        {/* Bills List */}
        <div className="space-y-4">
          {patientBills.length > 0 ? (
            patientBills.map((bill) => (
              <Card key={bill.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <CardTitle>Invoice #{bill.id}</CardTitle>
                        <Badge
                          variant={
                            bill.status === "paid" ? "secondary" : bill.status === "pending" ? "default" : "destructive"
                          }
                        >
                          {bill.status}
                        </Badge>
                      </div>
                      <CardDescription className="mt-1">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-3 w-3" />
                          {bill.date}
                        </div>
                      </CardDescription>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold">${bill.total.toFixed(2)}</p>
                      {bill.paymentMethod && (
                        <p className="text-sm text-muted-foreground">Paid via {bill.paymentMethod}</p>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Bill Items */}
                  <div className="space-y-2">
                    {bill.items.map((item) => (
                      <div key={item.id} className="flex items-center justify-between text-sm">
                        <div className="flex-1">
                          <p className="font-medium">{item.description}</p>
                          <p className="text-muted-foreground">
                            Qty: {item.quantity} × ${item.unitPrice.toFixed(2)}
                          </p>
                        </div>
                        <p className="font-medium">${item.total.toFixed(2)}</p>
                      </div>
                    ))}
                  </div>

                  <Separator />

                  {/* Bill Summary */}
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Subtotal</span>
                      <span>${bill.subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Tax</span>
                      <span>${bill.tax.toFixed(2)}</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between font-semibold">
                      <span>Total</span>
                      <span>${bill.total.toFixed(2)}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      <Download className="mr-2 h-4 w-4" />
                      Download Invoice
                    </Button>
                    {bill.status !== "paid" && (
                      <Button size="sm" onClick={() => handlePayment(bill.id)}>
                        <CreditCard className="mr-2 h-4 w-4" />
                        Pay Now
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <CreditCard className="mb-4 h-12 w-12 text-muted-foreground" />
                <p className="text-muted-foreground">No billing records available</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}
