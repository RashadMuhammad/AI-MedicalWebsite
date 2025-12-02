import express from "express"
import { 
  createAvailability, 
  getDoctorsWithDepartments ,getDoctorAvailability,getAllDoctorAvailability,
  updateAvailability,
  deleteAvailability
} from "../controllers/doctorContoller"
import { allowRoles } from "../middleware/roleMiddleware";

const router = express.Router()

router.post("/", createAvailability);
router.get("/availability",allowRoles("doctor"), getAllDoctorAvailability);
router.get("/doctors-with-department", getDoctorsWithDepartments);
router.get("/:doctor_id", getDoctorAvailability);
router.put("/:id", updateAvailability);
router.delete("/:id", deleteAvailability);

export default router
