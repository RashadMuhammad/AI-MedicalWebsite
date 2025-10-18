// backend/src/routes/userRoleRoutes.ts
import express from "express";
import { getRoles, addRole } from "../controllers/userRoleController.js";

const router = express.Router();

// GET all roles
router.get("/allroles", getRoles);

// POST a new role
router.post("/", addRole);

export default router;
