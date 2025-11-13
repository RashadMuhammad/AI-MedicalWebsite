import express from "express";
import {
  createAppointment,
  getAppointments,
  getAppointmentById,
  updateAppointment,
  deleteAppointment,
  getDoctorAppointments
} from "../controllers/appointmentsContoller";

const router = express.Router();

// 📅 Create a new appointment
router.post("/", createAppointment);

// 📋 Get all appointments (optionally filter by doctor_id or patient_id)
router.get("/", getAppointments);

// 🧾 Get a single appointment by ID
router.get("/:id", getAppointmentById);

// ✏️ Update an appointment
router.put("/:id", updateAppointment);

// ❌ Delete an appointment
router.delete("/:id", deleteAppointment);
router.get("/doctor/:doctorId", getDoctorAppointments);

export default router;
