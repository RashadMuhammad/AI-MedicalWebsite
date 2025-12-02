import type { Request, Response } from "express";
import { pool } from "../config/db";
import bcrypt from "bcryptjs";
import { generateAccessToken, generateRefreshToken } from "../utils/tokenUtils";
import crypto from "crypto";
import { error } from "console";

export const createUser = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    console.log("req.body:", req.body);

    const {
      email,
      password,
      name,
      role_name,
      phone,
      avatar,
      specialization,
      department_id,
      dateOfBirth,
      blood_group,
      address,
      emergency_contact,
    } = req.body;

    if (!email || !password || !name || !role_name) {
      res
        .status(400)
        .json({ error: "email, password, name, and role are required" });
      return;
    }

    const existingUser = await pool.query(
      "SELECT id FROM users WHERE email = $1",
      [email]
    );
    if (existingUser.rowCount && existingUser.rowCount > 0) {
      res.status(400).json({ error: "Email already exists" });
      return;
    }

    const roleResult = await pool.query(
      "SELECT role_id FROM user_roles WHERE role_name = $1",
      [role_name]
    );
    if (roleResult.rowCount === 0) {
      res.status(400).json({ error: "Invalid role" });
      return;
    }

    const role_id = Number(roleResult.rows[0].role_id);
    const hashedPassword = await bcrypt.hash(password, 10);

    // ✅ Use correct column name: department_id
    const result = await pool.query(
      `INSERT INTO users 
        (email, password, name, role_id, phone, avatar, specialization, department_id, date_of_birth, blood_group, address, emergency_contact, created_at, updated_at)
        VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,CURRENT_TIMESTAMP,CURRENT_TIMESTAMP)
        RETURNING id, email, name, role_id, phone, avatar, specialization, department_id, date_of_birth, blood_group, address, emergency_contact, created_at, updated_at`,
      [
        email,
        hashedPassword,
        name,
        role_id,
        phone,
        avatar,
        specialization,
        department_id,
        dateOfBirth,
        blood_group,
        address,
        emergency_contact,
      ]
    );

    if (role_name.toLowerCase() === "doctor" && department_id) {
      await pool.query(
        `UPDATE departments
         SET doctors_count = (
           SELECT COUNT(*)
           FROM users u
           JOIN user_roles r ON u.role_id = r.role_id
           WHERE u.department_id = $1
             AND r.role_name = 'doctor'
         )
         WHERE department_id = $1`,
        [department_id]
      );
    }

    res.status(201).json({
      message: "✅ User created successfully",
      user: result.rows[0],
    });
  } catch (err: any) {
    console.error("❌ Error creating user:", err.message);
    res.status(500).json({ error: "Server error" });
  }
};

export const loginUser = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  console.log("Reached login");

  try {
    const userResult = await pool.query(
      `SELECT u.*, r.role_name 
       FROM users u 
       JOIN user_roles r ON u.role_id = r.role_id
       WHERE email = $1`,
      [email]
    );

    if (userResult.rowCount === 0) {
      return res.status(400).json({ error: "Invalid email or password" });
    }

    const user = userResult.rows[0];

    // 2️⃣ Compare encrypted password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: "Invalid email or password" });
    }

    await pool.query("DELETE FROM sessions WHERE user_id = $1", [user.id]);

    const accessToken = generateAccessToken(user.id);
    const refreshToken = generateRefreshToken(user.id);

    // 5️⃣ Store NEW session in DB
    const newSession = await pool.query(
      `INSERT INTO sessions (user_id, access_token, refresh_token)
       VALUES ($1, $2, $3)
       RETURNING session_id`,
      [user.id, accessToken, refreshToken]
    );

    const sessionId = newSession.rows[0].session_id;

    return res.status(200).json({
      message: "Login successful",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role_name,
      },
      accessToken,
      refreshToken,
      sessionId, 
    });
  } catch (err) {
    console.error("Login error:", err); 
    return res.status(500).json({ error: "Server error" });
  }
};

// GET /api/users/count-by-role
export const getCountByRole = async (req: Request, res: Response) => {
  try {
    const query = `
      SELECT 
        r.role_name,
        COUNT(u.id) AS user_count
      FROM users u
      JOIN user_roles r ON u.role_id = r.role_id
      GROUP BY r.role_name
      ORDER BY r.role_name;
    `;

    const { rows } = await pool.query(query);
    res.json({ success: true, data: rows });
  } catch (error) {
    console.error("Error fetching user counts:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

export const getAllUsers = async (req: Request, res: Response) => {
  try {
    const query = `
      SELECT *
      FROM users
      ORDER BY created_at DESC
    `;

    const { rows } = await pool.query(query);
    res.json({ success: true, data: rows });
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

export const getUsersByRole = async (req: Request, res: Response) => {
  try {
    const { role } = req.query;

    // 1️⃣ Build base query
    let query = `
        SELECT  r.role_name,u.*
      FROM users u
      JOIN user_roles r ON u.role_id = r.role_id
    `;

    // 2️⃣ Add role filter if provided
    const params: any[] = [];
    if (role) {
      query += ` WHERE r.role_name = $1`;
      params.push(role);
    }

    query += ` ORDER BY u.created_at`;

    const { rows } = await pool.query(query, params);

    // 3️⃣ Group users by role
    const usersByRole: Record<string, any[]> = {};
    rows.forEach((user) => {
      const roleName = user.role_name || "unknown";
      if (!usersByRole[roleName]) usersByRole[roleName] = [];
      usersByRole[roleName].push(user);
    });

    res.json({ success: true, data: usersByRole });
  } catch (error) {
    console.error("Error fetching users by role:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};
export const getAllDoctor = async (req: Request, res: Response) => {
  try {
    const result = await pool.query(
      `	SELECT u.id as head_id, u.name FROM users u JOIN user_roles r ON u.role_id = r.role_id WHERE r.role_name = 'doctor' ORDER BY u.name;`
    );
    res.status(200).json(result.rows);
  } catch (error) {
    console.error("Error fetching doctor details:", error);
    res.status(500).json({ error: "Failed to fetch  doctor" });
  }
};

// ✅ Update user (PUT /api/users/:id)
export const updateUser = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { name, email, role_id, department_id } = req.body;

  // 🔹 Debug logging
  console.log("Params ID:", id);
  console.log("Request body:", req.body);
  console.log("Extracted fields:", { name, email, role_id, department_id });

  try {
    const result = await pool.query(
      `UPDATE users
       SET name = $1, email = $2, role_id = $3, department_id = $4
       WHERE id = $5
       RETURNING *`,
      [name, email, role_id, department_id, id]
    );

    if (result.rows.length === 0)
      return res.status(404).json({ message: "User not found" });

    res.json({ message: "User updated successfully", user: result.rows[0] });
  } catch (error) {
    console.error("Error updating user:", error);
    res.status(500).json({ error: "Server error" });
  }
};
