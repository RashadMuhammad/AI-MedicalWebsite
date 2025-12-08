// User roles in the hospital system
export type UserRole = "patient" | "doctor" | "admin1"

// User interface
export interface User {
  id: string
  user_id?: string
  email: string
  password?: string 
  name: string
  roleId: number 
  role_name?: string 
  phone?: string
  avatar?: string
  specialization?: string 
  department_id?: number 
  dateOfBirth?: string 
  blood_group?: string 
  address?: string
  emergency_contact?: string
  created_at?: string
  updated_At?: string
}
 export interface Role {
  role_name: string;
  role_description?: string; 
}

// Appointment interface
export interface Appointment {
  appointment_id: string
  patientId: string
  patientname: string
  doctorId: string
  doctor_name: string
  appointment_date: string
  time: string
  appointment_type: "consultation" | "follow-up" | "emergency" | "teleconsultation"
  status: "scheduled" | "completed" | "cancelled" | "in-progress"
  reason: string
  notes?: string
  start_time:string
  end_time:string
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
  patientName?: string
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


 export interface Staff {
  id: number | string
  name: string
  role: string
  head_id:string
}

 export interface Department {
  department_id: number | string
  name: string
  head: string
  head_id?: number | string
  doctors_count: number
  patients_count: number
  revenue: number
  status: string
  staff: Staff[]
}

export interface DoctorAvailability {
  id?: number            
  doctor_id: string      
  day_of_week: string    
  start_time: string     
  end_time: string   
  room_number?: string
  is_available: boolean
  created_at?: string
  updated_at?: string
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

// Medication interface for pharmacy module
export interface Medication {
  id: string
  name: string
  genericName: string
  dosage: string
  form: "tablet" | "capsule" | "liquid" | "injection" | "cream" | "patch"
  quantity: number
  manufacturer: string
  batchNumber: string
  expiryDate: string
  price: number
  instructions: string
  sideEffects?: string[]
  contraindications?: string[]
}

// PatientVitals interface for nurse module
export interface PatientVitals {
  id: string
  patientId: string
  patientName: string
  nurseId: string
  nurseName: string
  date: string
  time: string
  temperature: number
  bloodPressure: string
  heartRate: number
  respiratoryRate: number
  bloodOxygen: number
  weight: number
  height: number
  bmi?: number
  notes?: string
}

// NursingTask interface
export interface NursingTask {
  id: string
  patientId: string
  patientName: string
  taskType: "medication" | "vitals" | "wound-care" | "catheter-care" | "post-op" | "other"
  description: string
  priority: "low" | "medium" | "high" | "critical"
  status: "pending" | "in-progress" | "completed"
  assignedTo: string
  dueDate: string
  dueTime: string
  notes?: string
  completedAt?: string
}

// PharmacyOrder interface
export interface PharmacyOrder {
  id: string
  prescriptionId: string
  medicationId: string
  medicationName: string
  quantity: number
  refills: number
  status: "pending" | "ready" | "dispensed" | "cancelled"
  prescribedDate: string
  dispensedDate?: string
  expiryDate?: string
  pharmacistId: string
  patientId: string
  patientName: string
  price: number
}

// AmbulanceRequest interface for ambulance module
export interface AmbulanceRequest {
  id: string
  patientId: string
  patientName: string
  patientPhone: string
  pickupLocation: string
  dropLocation: string
  reason: string
  priority: "low" | "medium" | "high" | "critical"
  status: "requested" | "assigned" | "en-route" | "arrived" | "completed" | "cancelled"
  requestedAt: string
  estimatedArrival?: string
  completedAt?: string
  driverId?: string
  driverName?: string
  ambulanceId?: string
  ambulanceNumber?: string
  notes?: string
}

// Ambulance interface
export interface Ambulance {
  id: string
  ambulanceNumber: string
  driverId: string
  driverName: string
  driverPhone: string
  location: string
  status: "available" | "en-route" | "at-location" | "maintenance"
  equipment: string[]
  lastServiceDate: string
  nextServiceDate: string
  capacity: number
  fuelLevel: number
  totalTrips: number
}

// AmbulanceTrip interface
export interface AmbulanceTrip {
  id: string
  ambulanceId: string
  ambulanceNumber: string
  driverId: string
  driverName: string
  patientId: string
  patientName: string
  pickupLocation: string
  dropLocation: string
  startTime: string
  endTime?: string
  distance: number
  fare: number
  status: "completed" | "in-progress"
}


