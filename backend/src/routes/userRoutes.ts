import express from "express";
import { createUser, loginUser, getCountByRole,getAllUsers,getUsersByRole,getAllDoctor,updateUser, logoutUser } from "../controllers/userController";
import { verifySession } from "../middleware/authMiddleware";
import { upload } from "./upload";
const app = express();
app.use(express.json()); 
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
router.put("/:id", verifySession, upload.single("avatar"), updateUser);

router.post("/logout",logoutUser)

export default router;
