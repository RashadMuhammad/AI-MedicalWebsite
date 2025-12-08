import express from "express";
import { getDoctors } from "../controllers/commonController";
import { verifySession } from "../middleware/authMiddleware";
import { upload } from "./upload";
const app = express();
app.use(express.json()); 
const router = express.Router();


router.get("/",verifySession,getDoctors);

export default router;
