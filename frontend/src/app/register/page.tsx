"use client"

import React, { useState, useEffect } from "react"
import type { User } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"
import { apiFetch } from "@/lib/api"

type Status = {
  type: "success" | "warning" | "error";
  message: string;
} | null;

export default function RegisterPage() {
  const [formData, setFormData] = useState<Partial<User>>({ role: "patient" })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [status, setStatus] = useState<Status>(null)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setStatus(null)

    try {
      const { res, data } = await apiFetch("/api/users/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      console.log("Response:", data, "Status:", res.status)

      if (res.status === 201) {
        setStatus({ type: "success", message: data.message || "User created!" })
        setFormData({
          role: "patient",
          name: "",
          email: "",
          password: "",
          phone: "",
          dateOfBirth: "",
          bloodGroup: "",
          address: "",
          emergencyContact: "",
          avatar: "",
          specialization: "",
          department: "",
        })
      } else if (res.status === 400) {
        setStatus({ type: "warning", message: data.error || "Invalid input" })
      } else {
        setStatus({ type: "error", message: data.error || "Server error" })
      }
    } catch (err: any) {
      setStatus({ type: "error", message: err.message || "Something went wrong" })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Optional: auto-hide status popup after 4 seconds
  useEffect(() => {
    if (status) {
      const timer = setTimeout(() => setStatus(null), 4000)
      return () => clearTimeout(timer)
    }
  }, [status])

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 p-6">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 rounded-xl shadow-md w-full max-w-md space-y-4"
      >
        {/* Status Popup */}
        {status && (
          <div
            className={`p-3 rounded-md mb-4 text-white ${
              status.type === "success"
                ? "bg-green-500"
                : status.type === "warning"
                ? "bg-yellow-500"
                : "bg-red-500"
            }`}
          >
            {status.message}
          </div>
        )}

        {/* Full Name */}
        <div>
          <label className="block text-gray-700 mb-1 font-medium">Full Name</label>
          <input
            type="text"
            name="name"
            value={formData.name || ""}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-md p-2 focus:ring focus:ring-blue-200"
            required
          />
        </div>

        {/* Email */}
        <div>
          <label className="block text-gray-700 mb-1 font-medium">Email</label>
          <input
            type="email"
            name="email"
            value={formData.email || ""}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-md p-2 focus:ring focus:ring-blue-200"
            required
          />
        </div>

        {/* Password */}
        <div>
          <label className="block text-gray-700 mb-1 font-medium">Password</label>
          <input
            type="password"
            name="password"
            value={formData.password || ""}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-md p-2 focus:ring focus:ring-blue-200"
            required
          />
        </div>

        {/* Phone */}
        <div>
          <label className="block text-gray-700 mb-1 font-medium">Phone</label>
          <input
            type="tel"
            name="phone"
            value={formData.phone || ""}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-md p-2 focus:ring focus:ring-blue-200"
          />
        </div>

        {/* Date of Birth */}
        <div>
          <label className="block text-gray-700 mb-1 font-medium">Date of Birth</label>
          <input
            type="date"
            name="dateOfBirth"
            value={formData.dateOfBirth || ""}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-md p-2 focus:ring focus:ring-blue-200"
          />
        </div>

        {/* Blood Group */}
        <div>
          <label className="block text-gray-700 mb-1 font-medium">Blood Group</label>
          <input
            type="text"
            name="bloodGroup"
            value={formData.bloodGroup || ""}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-md p-2 focus:ring focus:ring-blue-200"
          />
        </div>

        {/* Address */}
        <div>
          <label className="block text-gray-700 mb-1 font-medium">Address</label>
          <input
            type="text"
            name="address"
            value={formData.address || ""}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-md p-2 focus:ring focus:ring-blue-200"
          />
        </div>

        {/* Emergency Contact */}
        <div>
          <label className="block text-gray-700 mb-1 font-medium">Emergency Contact</label>
          <input
            type="text"
            name="emergencyContact"
            value={formData.emergencyContact || ""}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-md p-2 focus:ring focus:ring-blue-200"
          />
        </div>

        {/* Submit */}
        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Registering...
            </>
          ) : (
            "Register"
          )}
        </Button>
      </form>
    </div>
  )
}
