import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { pool } from "./config/db";
import userRoutes from "./routes/userRoutes";
import userRoleRoutes from "./routes/userRoleRoutes";
import departmentRoutes from "./routes/departmentRoutes"
import doctorRoutes from "./routes/doctorRoutes"
import appointmentsRoutes from "./routes/appointmentsRoutes"


dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;
// Middlewares
app.use(cors());
app.use(express.json()); // parses application/json
app.use(express.text()); // parses text/plain
// Routes
app.get("/", async (_req, res) => {
    const result = await pool.query("SELECT current_database(), current_user");
    res.json({ message: "Backend running ✅", db: result.rows[0] });
});
app.use("/api/users", userRoutes);
app.use("/api/roles", userRoleRoutes);
app.use("/api/departments", departmentRoutes);
app.use("/api/doctor",doctorRoutes);
app.use("/api/appointments",appointmentsRoutes);
// Start server
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
