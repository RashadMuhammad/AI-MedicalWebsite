import express from "express";
import { createUser, loginUser, getCountByRole, getAllUsers, getUsersByRole } from "../controllers/userController.js";
const router = express.Router();
// Routes
router.post("/register", createUser);
router.post("/login", loginUser);
// Fetch user statistics
router.get("/count-by-role", getCountByRole);
// Fetch all users
router.get("/alluser", getAllUsers);
router.get("/by-role", getUsersByRole);
export default router;
