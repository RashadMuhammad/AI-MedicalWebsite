import express from "express";
import type { Application, Request, Response } from "express";

import dotenv from "dotenv";
import cors from "cors";
import { pool } from "./config/db.js";

import userRoutes from "./routes/userRoutes.js";



dotenv.config();
const app: Application = express();
const PORT = process.env.PORT || 5000;

// Middlewares
app.use(cors());
app.use(express.json());      // parses application/json
app.use(express.text());      // parses text/plain

// Routes
app.get("/", async (_req: Request, res: Response) => {
  const result = await pool.query("SELECT current_database(), current_user");
  res.json({ message: "Backend running ✅", db: result.rows[0] });
});


app.use("/api/users", userRoutes);


// Start server
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
