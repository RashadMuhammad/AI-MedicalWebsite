import express from "express";
import { createUser } from "../controllers/userController.js";
const router = express.Router();
console.log("bh");
router.post("/register", createUser);
//router.get("/", getUsers);
router.get("/test", (req, res) => {
    res.json({ message: "✅ user route working" });
});
export default router;
