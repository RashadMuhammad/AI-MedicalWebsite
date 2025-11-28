import type { Request, Response } from "express";
import { pool } from "../config/db";

export const getSessionInfo = async (req: Request, res: Response) => {
  console.log("Session lookup started");

  const { sessionId } = req.params;
  console.log("Received Session ID:", sessionId);

  try {
    const result = await pool.query(
      `SELECT 
        s.session_id,
        u.id,
        u.name,
        u.email,
        r.role_name,
        s.created_at
      FROM sessions s
      JOIN users u ON s.user_id = u.id
      JOIN user_roles r ON u.role_id = r.role_id
      WHERE s.session_id = $1`,
      [sessionId]
    );

    console.log("DB Result:", result.rows);
    console.log("Row Count:", result.rowCount);

    if (result.rowCount === 0) {
      return res.status(404).json({ error: "Invalid session" });
    }

    return res.json(result.rows[0]); 
  } catch (err) {
    console.error("Session lookup error:", err);
    return res.status(500).json({ error: "Server error" });
  }
};
