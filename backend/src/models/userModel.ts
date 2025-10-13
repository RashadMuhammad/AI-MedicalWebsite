export interface User {
  id: string
  email: string
  password?: string // for authentication (optional when fetched)
  name: string
  roleId: number // FK to user_roles table
  phone?: string
  avatar?: string
  specialization?: string // for doctors
  department?: string // for doctors/admin
  dateOfBirth?: string // for patients
  bloodGroup?: string // for patients
  address?: string
  emergencyContact?: string
  createdAt?: string
  updatedAt?: string
}
