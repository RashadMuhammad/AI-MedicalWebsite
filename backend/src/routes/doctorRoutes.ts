import express from "express"
import { 
  // createAvailability, 
  getDoctorsWithDepartments,
  getDoctorAvailability,
  getAllDoctorAvailability,
  updateAvailability,
  deleteAvailability,
  getDoctorPatients,
  getPatientMedicalRecords,
  createMedicalRecord
} from "../controllers/doctorContoller"
import { allowRoles } from "../middleware/roleMiddleware";

const router = express.Router()

router.get("/patients", allowRoles("doctor"), getDoctorPatients);
router.get("/availability",allowRoles("doctor"), getAllDoctorAvailability);
router.get("/doctors-with-department", getDoctorsWithDepartments);
router.get("/records", allowRoles("doctor"), getPatientMedicalRecords)
router.get("/:doctor_id", getDoctorAvailability);

// router.post("/", createAvailability);
router.post("/records",allowRoles("doctor"),createMedicalRecord)

router.put("/:id", updateAvailability);

router.delete("/:id", deleteAvailability);

export default router
