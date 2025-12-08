import type { Request, Response } from "express";
import { pool } from "../config/db";

export const getDoctors = async (req: Request, res: Response) => {
  try {
    const result = await pool.query(
      `	SELECT u.id as doctor_id, u.name FROM users u JOIN user_roles r ON u.role_id = r.role_id WHERE r.role_name = 'doctor' ORDER BY u.name;`
    );
    console.log("Fetched doctors:", result.rows);
    res.status(200).json(result.rows);
  } catch (error) {
    console.error("Error fetching doctor details:", error);
    res.status(500).json({ error: "Failed to fetch  doctor" });
  }
};