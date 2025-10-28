import express from "express"
import { 
  createAvailability, 
  getDoctorsWithDepartments ,getDoctorAvailability,getAllDoctorAvailability
} from "../controllers/doctorContoller"

const router = express.Router()

router.post("/", createAvailability);
router.get("/availability", getAllDoctorAvailability);
router.get("/doctors-with-department", getDoctorsWithDepartments);
router.get("/:doctor_id", getDoctorAvailability);

export default router
