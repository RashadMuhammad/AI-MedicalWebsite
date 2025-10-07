import type { Appointment, MedicalRecord, Bill } from "./types"

// Mock appointments data
export const mockAppointments: Appointment[] = [
  {
    id: "apt1",
    patientId: "p1",
    patientName: "John Doe",
    doctorId: "d1",
    doctorName: "Dr. Sarah Smith",
    date: "2025-10-05",
    time: "10:00 AM",
    type: "consultation",
    status: "scheduled",
    reason: "Regular checkup",
  },
  {
    id: "apt2",
    patientId: "p1",
    patientName: "John Doe",
    doctorId: "d2",
    doctorName: "Dr. Michael Johnson",
    date: "2025-10-10",
    time: "2:00 PM",
    type: "follow-up",
    status: "scheduled",
    reason: "Follow-up on blood pressure",
  },
  {
    id: "apt3",
    patientId: "p2",
    patientName: "Jane Smith",
    doctorId: "d1",
    doctorName: "Dr. Sarah Smith",
    date: "2025-09-28",
    time: "11:00 AM",
    type: "consultation",
    status: "completed",
    reason: "Chest pain evaluation",
  },
]

// Mock medical records
export const mockMedicalRecords: MedicalRecord[] = [
  {
    id: "mr1",
    patientId: "p1",
    doctorId: "d1",
    date: "2025-09-15",
    diagnosis: "Hypertension Stage 1",
    symptoms: ["Headache", "Dizziness", "Fatigue"],
    prescription: [
      {
        id: "rx1",
        medication: "Lisinopril",
        dosage: "10mg",
        frequency: "Once daily",
        duration: "30 days",
        instructions: "Take in the morning with water",
      },
    ],
    labResults: [
      {
        id: "lab1",
        testName: "Blood Pressure",
        result: "145/92 mmHg",
        normalRange: "120/80 mmHg",
        date: "2025-09-15",
        status: "abnormal",
      },
    ],
    notes: "Patient advised to reduce sodium intake and increase physical activity.",
    followUpDate: "2025-10-15",
  },
]

// Mock billing data
export const mockBills: Bill[] = [
  {
    id: "bill1",
    patientId: "p1",
    patientName: "John Doe",
    date: "2025-09-15",
    items: [
      {
        id: "item1",
        description: "Consultation Fee",
        quantity: 1,
        unitPrice: 100,
        total: 100,
      },
      {
        id: "item2",
        description: "Blood Pressure Test",
        quantity: 1,
        unitPrice: 25,
        total: 25,
      },
    ],
    subtotal: 125,
    tax: 12.5,
    total: 137.5,
    status: "paid",
    paymentMethod: "Credit Card",
  },
]
