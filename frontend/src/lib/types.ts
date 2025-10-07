// User roles in the hospital system
export type UserRole = "patient" | "doctor" | "admin"

// User interface
export interface User {
  id: string
  email: string
  name: string
  role: UserRole
  phone?: string
  avatar?: string
  specialization?: string // For doctors
  department?: string // For doctors and admin
  dateOfBirth?: string // For patients
  bloodGroup?: string // For patients
  address?: string
  emergencyContact?: string
}

// Appointment interface
export interface Appointment {
  id: string
  patientId: string
  patientName: string
  doctorId: string
  doctorName: string
  date: string
  time: string
  type: "consultation" | "follow-up" | "emergency" | "teleconsultation"
  status: "scheduled" | "completed" | "cancelled" | "in-progress"
  reason: string
  notes?: string
}

// Medical Record interface
export interface MedicalRecord {
  id: string
  patientId: string
  doctorId: string
  date: string
  diagnosis: string
  symptoms: string[]
  prescription: Prescription[]
  labResults?: LabResult[]
  notes: string
  followUpDate?: string
}

// Prescription interface
export interface Prescription {
  id: string
  medication: string
  dosage: string
  frequency: string
  duration: string
  instructions: string
}

// Lab Result interface
export interface LabResult {
  id: string
  testName: string
  result: string
  normalRange: string
  date: string
  status: "normal" | "abnormal" | "critical"
}

// Billing interface
export interface Bill {
  id: string
  patientId: string
  patientName: string
  date: string
  items: BillItem[]
  subtotal: number
  tax: number
  total: number
  status: "paid" | "pending" | "overdue"
  paymentMethod?: string
}

export interface BillItem {
  id: string
  description: string
  quantity: number
  unitPrice: number
  total: number
}
