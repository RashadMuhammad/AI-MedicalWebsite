import type { Request, Response } from "express";
import { pool } from "../config/db";

// Get all roles
export const getRoles = async (req: Request, res: Response) => {
  try {
    console.log("etghetrhetrhfrherth")
    const result = await pool.query("SELECT role_name, role_description FROM user_roles ORDER BY role_name ASC");
    res.status(200).json(result.rows);
  } catch (error) {
    console.error("Error fetching roles:", error);
    res.status(500).json({ error: "Failed to fetch roles" });
  }
};

// Add a new role
export const addRole = async (req: Request, res: Response) => {
  const { role_name, role_description } = req.body;
  if (!role_name || !role_description) {
    return res.status(400).json({ error: "role_name and role_description are required" });
  }

  try {
    const result = await pool.query(
      "INSERT INTO roles (role_name, role_description) VALUES ($1, $2) RETURNING *",
      [role_name, role_description]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error("Error adding role:", error);
    res.status(500).json({ error: "Failed to add role" });
  }
};
