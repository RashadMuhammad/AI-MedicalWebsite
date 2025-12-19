import { Request, Response } from "express";
import { pool } from "../config/db";

// 📅 Create a new appointment
export const createAppointment = async (req: Request, res: Response) => {
  try {
    const patient_id = req.user?.user_id;

    if (!patient_id) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const {
      doctor_id,
      appointment_date,
      start_time,
      end_time,
      appointment_type,
      reason,
      status,
    } = req.body;

    const result = await pool.query(
      `INSERT INTO appointments 
        (patient_id, doctor_id, appointment_date, start_time, end_time, appointment_type, reason, status, is_active)
       VALUES ($1, $2, $3, $4, $5, $6, $7, COALESCE($8, 'Scheduled'), false)
       RETURNING *`,
      [
        patient_id,
        doctor_id,
        appointment_date,
        start_time,
        end_time,
        appointment_type,
        reason,
        status,
      ]
    );

    res.status(201).json({
      message: "Appointment created successfully",
      data: result.rows[0],
    });
  } catch (err: any) {
    console.error("❌ Error creating appointment:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const getAppointments = async (req: Request, res: Response) => {
  try {
    const { doctor_id, patient_id } = req.query;

    console.log("reached...........")

    // Base query
    let query = `
      SELECT 
        a.*, 
        u.name AS doctor_name
      FROM appointments a
      LEFT JOIN users u 
      ON u.id = a.doctor_id
      WHERE u.role_id = (
        SELECT role_id 
        FROM user_roles 
        WHERE role_name = 'doctor'
      )
    `;

    const params: any[] = [];
    let paramIndex = 1;

    // Optional filters
    if (doctor_id) {
      query += ` AND a.doctor_id = $${paramIndex}`;
      params.push(doctor_id);
      paramIndex++;
    }
    if (patient_id) {
      query += ` AND a.patient_id = $${paramIndex}`;
      params.push(patient_id);
      paramIndex++;
    }

    query += " ORDER BY a.appointment_date DESC";

    const result = await pool.query(query, params);
    res.json({ success: true, data: result.rows });
  } catch (err) {
    console.error("❌ Error fetching appointments:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
// 🧾 Get single appointment by ID
export const getAppointmentById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      "SELECT * FROM appointments WHERE appointment_id = $1",
      [id]
    );

    if (result.rowCount === 0)
      return res.status(404).json({ error: "Appointment not found" });

    res.status(200).json(result.rows[0]);
  } catch (err) {
    console.error("❌ Error fetching appointment:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// ✏️ Update appointment status or details
export const updateAppointment = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const {
      appointment_date,
      start_time,
      end_time,
      appointment_type,
      reason,
      status,
    } = req.body;

    const result = await pool.query(
      `UPDATE appointments
       SET 
         appointment_date = COALESCE($1, appointment_date),
         start_time = COALESCE($2, start_time),
         end_time = COALESCE($3, end_time),
         appointment_type = COALESCE($4, appointment_type),
         reason = COALESCE($5, reason),
         status = COALESCE($6, status),
         updated_at = CURRENT_TIMESTAMP
       WHERE appointment_id = $7
       RETURNING *`,
      [
        appointment_date,
        start_time,
        end_time,
        appointment_type,
        reason,
        status,
        id,
      ]
    );

    if (result.rowCount === 0)
      return res.status(404).json({ error: "Appointment not found" });

    res.status(200).json({
      message: "Appointment updated successfully",
      data: result.rows[0],
    });
  } catch (err) {
    console.error("❌ Error updating appointment:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// ❌ Delete an appointment
export const deleteAppointment = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      "DELETE FROM appointments WHERE appointment_id = $1 RETURNING *",
      [id]
    );

    if (result.rowCount === 0)
      return res.status(404).json({ error: "Appointment not found" });

    res.status(200).json({ message: "Appointment deleted successfully" });
  } catch (err) {
    console.error("❌ Error deleting appointment:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// Get all appointments for a doctor
export const getDoctorAppointments = async (req: Request, res: Response) => {
  try {
    let { doctorId } = req.params;
    doctorId = doctorId.trim();

    console.log("doctorId", doctorId);

    const result = await pool.query(
      `SELECT 
          a.appointment_id,
          a.patient_id,
          u.name AS patientName,
          a.doctor_id,
          a.appointment_date,
          a.start_time || '-' || a.end_time AS time,
          a.appointment_type,
          a.reason,
          a.status
       FROM appointments a
       JOIN users u ON u.id = a.patient_id
       WHERE a.doctor_id = $1
       ORDER BY a.appointment_date ASC, a.start_time ASC`,
      [doctorId]
    );

    res.json({ success: true, data: result.rows });
  } catch (error) {
    console.error("Error fetching doctor appointments:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

// ✅ Update Appointment Status
export const updateAppointmentStatus = async (req: Request, res: Response) => {
  try {
    const { appointmentId } = req.params;
    const { status } = req.body;

    const validStatuses = [
      "scheduled",
      "in-progress",
      "completed",
      "cancelled",
    ];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid status value" });
    }

    const result = await pool.query(
      `UPDATE appointments SET status = $1 WHERE appointment_id = $2 RETURNING *`,
      [status, appointmentId]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ message: "Appointment not found" });
    }

    res.json({
      message: "Appointment status updated successfully",
      appointment: result.rows[0],
    });
  } catch (error) {
    console.error("Error updating status:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
