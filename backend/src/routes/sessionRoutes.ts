import express from "express"
import { getSessionInfo } from "../controllers/sessionControllers";

const router = express.Router()

router.get("/:sessionId", getSessionInfo);

export default router