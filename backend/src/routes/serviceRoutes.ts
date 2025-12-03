import express from "express";
import {
  getServices,
  getServicesById,
  addService,
  updateService,
  deleteService
} from "../controllers/serviceController";


const router = express.Router();

//router.get("/departments-with-staff", getDepartmentsWithStaff);

// 2️⃣ General routes next
router.get("/", getServices);
router.get("/:id", getServicesById);
router.post("/", addService);
router.put("/:id", updateService);
router.delete("/:id", deleteService);

export default router;
