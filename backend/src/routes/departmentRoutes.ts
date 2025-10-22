import express from "express";
import {
  getDepartments,
  getDepartmentById,
  addDepartment,
  updateDepartment,
  deleteDepartment,
  getDepartmentsWithStaff
} from "../controllers/departmentController";

const router = express.Router();

// 1️⃣ Specific routes first
router.get("/departments-with-staff", getDepartmentsWithStaff);

// 2️⃣ General routes next
router.get("/", getDepartments);
router.get("/:id", getDepartmentById);
router.post("/", addDepartment);
router.put("/:id", updateDepartment);
router.delete("/:id", deleteDepartment);

export default router;
