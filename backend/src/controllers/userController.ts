import { pool } from "../config/db.js";
import type { Request, Response } from "express";
import bcrypt from "bcryptjs";
import type { QueryResult } from "pg"; // ✅ Type import for query result

export const createUser = async (req: Request, res: Response) => {
  try {
    console.log("req.body:", req.body);

    const {
      email,
      password,
      name,
      role,
      phone,
      avatar,
      specialization,
      department,
      dateOfBirth,
      bloodGroup,
      address,
      emergencyContact,
    } = req.body;

    // 🔹 Basic validation
    if (!email || !password || !name || !role) {
      return res
        .status(400)
        .json({ error: "email, password, name, and role are required" });
    }

    // 🔹 Check if email already exists
    const existingUser: QueryResult = await pool.query(
      "SELECT id FROM users WHERE email = $1",
      [email]
    );

    if (existingUser && existingUser.rowCount && existingUser.rowCount > 0) {
      return res.status(400).json({ error: "Email already exists" });
    }


    // 🔹 Map role name → role_id
    const roleResult: QueryResult = await pool.query(
      "SELECT role_id FROM user_roles WHERE role_name = $1",
      [role]
    );

    if (roleResult.rowCount === 0) {
      return res.status(400).json({ error: "Invalid role" });
    }

    const role_id: number = Number(roleResult.rows[0].role_id);

    // 🔹 Hash password before saving
    const hashedPassword = await bcrypt.hash(password, 10);

    // 🔹 Insert into database
    const result: QueryResult = await pool.query(
      `INSERT INTO users 
        (email, password, name, role_id, phone, avatar, specialization, department, date_of_birth, blood_group, address, emergency_contact, created_at, updated_at)
        VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,CURRENT_TIMESTAMP,CURRENT_TIMESTAMP)
        RETURNING id, email, name, role_id, phone, avatar, specialization, department, date_of_birth, blood_group, address, emergency_contact, created_at, updated_at`,
      [
        email,
        hashedPassword,
        name,
        role_id,
        phone,
        avatar,
        specialization,
        department,
        dateOfBirth,
        bloodGroup,
        address,
        emergencyContact,
      ]
    );

    // 🔹 Success response
    res.status(201).json({
      message: "✅ User created successfully",
      user: result.rows[0],
    });
  } catch (err: any) {
    console.error("❌ Error creating user:", err.message);
    res.status(500).json({ error: "Server error" });
  }
};
