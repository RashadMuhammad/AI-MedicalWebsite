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
        u.id AS user_id,
        u.name,
        u.email,
        u.phone,
        u.avatar,
        u.specialization,
        u.department_id,
        u.date_of_birth,
        u.blood_group,
        u.address,
        u.emergency_contact,
        r.role_id,
        r.role_name
      FROM sessions s
      JOIN users u ON s.user_id = u.id
      JOIN user_roles r ON u.role_id = r.role_id
      WHERE s.session_id = $1`,
      [sessionId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Session not found" });
    }

    const user = result.rows[0];

    // Convert avatar BYTEA to Base64 if exists
    const avatarBase64 = user.avatar
      ? Buffer.from(user.avatar).toString("base64")
      : null;

    // Build the user object
    req.user = {
      session_id: user.session_id,
      user_id: user.user_id,
      role_id: user.role_id,
      name: user.name,
      email: user.email,
      role_name: user.role_name,
      phone: user.phone,
      avatar: avatarBase64 ? `data:image/jpeg;base64,${avatarBase64}` : null,
      specialization: user.specialization,
      department_id: user.department_id,
      dateOfBirth: user.date_of_birth,
      blood_group: user.blood_group,
      address: user.address,
      emergency_contact: user.emergency_contact,
    };

    return res.json({ user: req.user });
  } catch (err) {
    console.error("Session lookup error:", err);
    return res.status(500).json({ error: "Server error" });
  }
};
