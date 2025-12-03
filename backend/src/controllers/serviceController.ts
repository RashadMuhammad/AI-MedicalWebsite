import type { Request, Response } from "express";
import { pool } from "../config/db";


export const getServices = async (req: Request, res: Response) => {
  try {
    const result = await pool.query(`
      SELECT * FROM services ORDER BY created_at DESC
    `);
    
    console.log("Fetched services:", result.rows);
    return res.json(result.rows);
    console.log("Fetched services:", result.rows);
  } catch (err) {
    console.error("Error fetching services:", err);
    return res.status(500).json({ error: "Failed to fetch services" });
  }
};


export const getServicesById = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const result = await pool.query("SELECT * FROM servicess WHERE department_id = $1", [id]);
    if (result.rows.length === 0) return res.status(404).json({ error: "Department not found" });
    res.json(result.rows[0]);
  } catch (err) {
    console.error("Error fetching services:", err);
    res.status(500).json({ error: "Failed to fetch services" });
  }
};

export const addService = async (req: Request, res: Response) => {
  try {
    const {
      name,
      head_id,
      doctors_count,
      patients_count,
      revenue,
      growth_percent,
      status,
    } = req.body;

    console.log("Incoming request body:", req.body);

    // Ensure all optional fields have safe default values
    const safeHeadId = head_id || null;                 // UUID column can be null
    const safeDoctorsCount = doctors_count ?? 0;
    const safePatientsCount = patients_count ?? 0;
    const safeRevenue = revenue ?? 0;
    const safeGrowthPercent = growth_percent ?? 0;
    const safeStatus = status || "active";

    console.log("Safe values to insert:");
    console.log({
      name,
      head_id: safeHeadId,
      doctors_count: safeDoctorsCount,
      patients_count: safePatientsCount,
      revenue: safeRevenue,
      growth_percent: safeGrowthPercent,
      status: safeStatus,
    });

    const result = await pool.query(
      `INSERT INTO departments
        (name, head_id, doctors_count, patients_count, revenue, growth_percent, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [
        name,
        safeHeadId,
        safeDoctorsCount,
        safePatientsCount,
        safeRevenue,
        safeGrowthPercent,
        safeStatus,
      ]
    );

    res.status(201).json({
      message: "✅ Department created successfully",
      department: result.rows[0], // return inserted department
    });

  } catch (err) {
    console.error("Error adding department:", err);
    res.status(500).json({ error: "Failed to add department" });
  }
};
  
// ✅ Update department
export const updateService = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { name, head_id, doctors_count, patients_count, revenue, growth_percent, status, is_active } = req.body;

  try {
    const result = await pool.query(
      `UPDATE departments SET
         name = $1,
         head_id = $2,
         doctors_count = $3,
         patients_count = $4,
         revenue = $5,
         growth_percent = $6,
         status = $7,
         is_active = $8,
         updated_at = CURRENT_TIMESTAMP
       WHERE department_id = $9
       RETURNING *`,
      [name, head_id, doctors_count, patients_count, revenue, growth_percent, status, is_active, id]
    );

    if (result.rows.length === 0) return res.status(404).json({ error: "Department not found" });

    res.json(result.rows[0]);
  } catch (err) {
    console.error("Error updating department:", err);
    res.status(500).json({ error: "Failed to update department" });
  }
};


export const deleteService = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const result = await pool.query("DELETE FROM services WHERE department_id = $1 RETURNING *", [id]);
    if (result.rows.length === 0) return res.status(404).json({ error: "Department not found" });

    res.json({ message: "Services deleted successfully" });
  } catch (err) {
    console.error("Error deleting services:", err);
    res.status(500).json({ error: "Failed to delete services" });
  }
};
