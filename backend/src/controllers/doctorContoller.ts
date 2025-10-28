import { Request, Response } from "express"
import { pool } from "../config/db"

// Create new availability
export const createAvailability = async (req: Request, res: Response) => {
  const data = req.body // <-- get data from request body

  // Validate required fields
  if (!data.doctor_id || !data.day_of_week || !data.start_time || !data.end_time) {
    return res.status(400).json({ success: false, error: "Missing required fields" })
  }

  try {
    const result = await pool.query(
      `INSERT INTO doctor_availability
        (doctor_id, day_of_week, start_time, end_time, room_number, is_available)
       VALUES ($1,$2,$3,$4,$5,$6)
       RETURNING *`,
      [
        data.doctor_id,
        data.day_of_week,
        data.start_time,
        data.end_time,
        data.room_number || null,
        data.is_available ?? true // default to true if not provided
      ]
    )

    res.status(201).json({ success: true, data: result.rows[0] })
  } catch (err) {
    console.error(err)
    res.status(500).json({ success: false, error: "Database error" })
  }
}

// Get all availability for a doctor
export const getDoctorAvailability = async (req: Request, res: Response) => {
  let doctor_id = req.params.doctor_id?.trim(); // ✅ Remove spaces or newlines

  if (!doctor_id) {
    return res.status(400).json({ success: false, error: "Doctor ID is required" });
  }

  try {
    const result = await pool.query(
      `SELECT 
        id,
        doctor_id,
        day_of_week,
        start_time,
        end_time,
        room_number,
        is_available
      FROM doctor_availability
      WHERE doctor_id = $1
      ORDER BY 
        CASE
          WHEN day_of_week = 'Monday' THEN 1
          WHEN day_of_week = 'Tuesday' THEN 2
          WHEN day_of_week = 'Wednesday' THEN 3
          WHEN day_of_week = 'Thursday' THEN 4
          WHEN day_of_week = 'Friday' THEN 5
          WHEN day_of_week = 'Saturday' THEN 6
          WHEN day_of_week = 'Sunday' THEN 7
        END,
        start_time;`,
      [doctor_id]
    );

    res.status(200).json({ success: true, data: result.rows });
  } catch (err) {
    console.error("Error fetching doctor availability:", err);
    res.status(500).json({ success: false, error: "Database error" });
  }
};
export const getDoctorsWithDepartments = async (req: Request, res: Response) => {
  try {
    const result = await pool.query(`
      SELECT 
        u.id AS doctor_id,
        u.name AS doctor_name,
        d.name AS department_name
      FROM users u
      JOIN departments d ON u.department_id = d.department_id
      WHERE u.role_id = (
        SELECT role_id FROM user_roles WHERE role_name = 'doctor'
      )
      ORDER BY u.name;
    `)

    console.log("✅ Doctors fetched:", result.rows)

    return res.status(200).json({
      success: true,
      data: result.rows,
    })
  } catch (error: any) {
    console.error("❌ Error fetching doctors:", error)
    return res.status(500).json({
      success: false,
      message: "Failed to fetch doctors",
      error: error.message,
    })
  }
};
export const getAllDoctorAvailability = async (req: Request, res: Response) => {
  try {
    const query = `
      SELECT 
        id,
        doctor_id,
        day_of_week,
        start_time,
        end_time,
        room_number,
        is_available
      FROM doctor_availability
      ORDER BY 
        CASE
          WHEN day_of_week = 'Monday' THEN 1
          WHEN day_of_week = 'Tuesday' THEN 2
          WHEN day_of_week = 'Wednesday' THEN 3
          WHEN day_of_week = 'Thursday' THEN 4
          WHEN day_of_week = 'Friday' THEN 5
          WHEN day_of_week = 'Saturday' THEN 6
          WHEN day_of_week = 'Sunday' THEN 7
        END,
        start_time;
    `

    const result = await pool.query(query)
        console.log("✅ Doctorsfrfrfrfrfrfrfrfr fetched:", result.rows)
    return res.status(200).json({ success: true, data: result.rows })
  } catch (error) {
    console.error("Error fetching doctor availability:", error)
    return res.status(500).json({ success: false, error: "Internal Server Error" })
  }
}
