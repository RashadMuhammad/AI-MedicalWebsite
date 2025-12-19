import express from "express";
import { createAvailability, getMyAvailability } from "../controllers/availabilityController";
import { verifySession } from "../middleware/authMiddleware";
import { deleteAvailability, updateAvailability } from "../controllers/doctorContoller";

const router = express.Router();

router.get("/", verifySession, getMyAvailability);
router.post("/", createAvailability);
router.put("/:id", verifySession, updateAvailability);
router.delete("/:id", verifySession, deleteAvailability);

export default router;
