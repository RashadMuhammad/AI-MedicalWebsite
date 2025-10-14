import express from "express";
import { createUser, loginUser } from "../controllers/userController.js";
const router = express.Router();
console.log("bh");
router.post("/register", createUser);
router.post("/login", loginUser);
export default router;
