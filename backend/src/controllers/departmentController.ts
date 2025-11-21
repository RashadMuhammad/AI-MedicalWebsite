import type { Request, Response } from "express";
import { pool } from "../config/db";

// ✅ Get all departments
export const getDepartments = async (req: Request, res: Response) => {
  try {
    const result = await pool.query(`
      SELECT 
        d.department_id,
        d.name,
        u.name AS head,
        d.head_id,
        d.doctors_count,
        d.patients_count,
        d.revenue,
        d.growth_percent,
        d.status
      FROM departments d
      LEFT JOIN users u ON u.id = d.head_id
      ORDER BY d.department_id ASC
    `);

    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching departments:", err);
    res.status(500).json({ error: "Failed to fetch departments" });
  }
};


// ✅ Get single department by ID
export const getDepartmentById = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const result = await pool.query("SELECT * FROM departments WHERE department_id = $1", [id]);
    if (result.rows.length === 0) return res.status(404).json({ error: "Department not found" });
    res.json(result.rows[0]);
  } catch (err) {
    console.error("Error fetching department:", err);
    res.status(500).json({ error: "Failed to fetch department" });
  }
};

// ✅ Add new department
export const addDepartment = async (req: Request, res: Response) => {
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
export const updateDepartment = async (req: Request, res: Response) => {
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

// ✅ Delete department
export const deleteDepartment = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const result = await pool.query("DELETE FROM departments WHERE department_id = $1 RETURNING *", [id]);
    if (result.rows.length === 0) return res.status(404).json({ error: "Department not found" });

    res.json({ message: "Department deleted successfully" });
  } catch (err) {
    console.error("Error deleting department:", err);
    res.status(500).json({ error: "Failed to delete department" });
  }
};
export const getDepartmentsWithStaff = async (req: Request, res: Response) => {
  const { id } = req.query; // optional filter by department_id
  console.log("Dept ID:", id);

  try {
    const params: any[] = [];
    let query = `
      SELECT 
          d.department_id,
          d.name AS department_name,
          COALESCE(
              JSON_AGG(
                  JSON_BUILD_OBJECT(
                      'id', u.id,
                      'name', u.name,
                      'role', r.role_name
                  )
              ) FILTER (WHERE u.id IS NOT NULL),
              '[]'
          ) AS staff
      FROM departments d
      LEFT JOIN users u ON u.department_id = d.department_id
      LEFT JOIN user_roles r ON u.role_id = r.role_id
    `; 
    if (id) {
      query += " WHERE d.department_id = $1";
      params.push(id);
    }

    query += " GROUP BY d.department_id, d.name ORDER BY d.name"; // Only one GROUP BY

    const { rows } = await pool.query(query, params);

    res.json({ success: true, data: rows });
  } catch (err) {
    console.error("Error fetching departments with staff:", err);
    res.status(500).json({ success: false, error: "Server error" });
  }
};
