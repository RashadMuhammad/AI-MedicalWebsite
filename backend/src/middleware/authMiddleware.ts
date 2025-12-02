// middleware/verifySession.ts
import type { Request, Response, NextFunction } from "express";
import { pool } from "../config/db";

declare global {
  namespace Express {
    interface Request {
      user?: {
        session_id: string;
        user_id: number;
        name: string;
        email: string;
        role_name: string;
      };
    }
  }
}

export const verifySession = async (req: Request, res: Response, next: NextFunction) => {
  try {
    console.log("VERIFY SESSION");

    const sessionId =
      (req.headers["x-session-id"] as string) ||
      (req.query.sessionId as string);

    if (!sessionId) {
      return res.status(401).json({ error: "Unauthorized: Missing session" });
    }

    const result = await pool.query(
      `
      SELECT 
        s.session_id,
        u.id AS user_id,
        u.name,
        u.email,
        r.role_name
      FROM sessions s
      JOIN users u ON s.user_id = u.id
      JOIN user_roles r ON u.role_id = r.role_id
      WHERE s.session_id = $1
      `,
      [sessionId]
    );

    if (result.rowCount === 0) {
      return res.status(401).json({ error: "Unauthorized: Invalid session" });
    }

    req.user = result.rows[0];
    next();
  } catch (err) {
    console.error("verifySession ERROR:", err);
    return res.status(500).json({ error: "Server error" });
  }
};
