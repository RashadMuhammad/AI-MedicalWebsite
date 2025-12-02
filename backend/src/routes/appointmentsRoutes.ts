import express from "express";
import {
  createAppointment,
  getAppointments,
  getAppointmentById,
  updateAppointment,
  deleteAppointment,
  getDoctorAppointments,
  updateAppointmentStatus
} from "../controllers/appointmentsContoller";

const router = express.Router();

// 📅 Create a new appointment
router.post("/", createAppointment);

router.get("/", getAppointments);

router.get("/:id", getAppointmentById);

router.put("/:id", updateAppointment);

router.delete("/:id", deleteAppointment);
router.get("/doctor/:doctorId", getDoctorAppointments);
router.put("/:appointmentId/status", updateAppointmentStatus);

export default router;
