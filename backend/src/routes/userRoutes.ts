import express from "express";
import { createUser, loginUser, getCountByRole,getAllUsers,getUsersByRole,getAllDoctor,updateUser } from "../controllers/userController";
import { verifySession } from "../middleware/authMiddleware";

const router = express.Router();

// Routes
router.post("/register", createUser);
router.post("/login",loginUser)

// Fetch user statistics
router.get("/count-by-role",verifySession, getCountByRole);
// Fetch all users
router.get("/alluser",verifySession,getAllUsers );
router.get("/by-role",verifySession,getUsersByRole);
router.get("/doctors",verifySession,getAllDoctor);
router.put("/:id", verifySession,updateUser);

export default router;
