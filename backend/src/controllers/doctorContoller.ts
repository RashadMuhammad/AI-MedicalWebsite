import { Request, Response } from "express";
import { pool } from "../config/db";

// Create new availability
// export const createAvailability = async (req: Request, res: Response) => {
//   const data = req.body;

//   if (
//     !data.doctor_id ||
//     !data.day_of_week ||
//     !data.start_time ||
//     !data.end_time
//   ) {
//     return res
//       .status(400)
//       .json({ success: false, error: "Missing required fields" });
//   }

//   try {
//     const result = await pool.query(
//       `INSERT INTO doctor_availability
//         (doctor_id,role_id, day_of_week, start_time, end_time, room_number, is_available)
//        VALUES ($1,$2,$3,$4,$5,$6)
//        RETURNING *`,
//       [
//         data.doctor_id,
//         data.role_id,
//         data.day_of_week,
//         data.start_time,
//         data.end_time,
//         data.room_number || null,
//         data.is_available ?? true,
//       ]
//     );

//     res.status(201).json({ success: true, data: result.rows[0] });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ success: false, error: "Database error" });
//   }
// };
// // Get all availability for a doctor
export const getDoctorAvailability = async (req: Request, res: Response) => {
  let doctor_id = req.params.doctor_id?.trim();

  if (!doctor_id) {
    return res
      .status(400)
      .json({ success: false, error: "Doctor ID is required" });
  }

  try {
    const result = await pool.query(
      `SELECT 
        id,
        user_id,
        day_of_week,
        start_time,
        end_time,
        room_number,
        is_available
      FROM availability
      WHERE user_id = $1
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

export const getDoctorsWithDepartments = async (
  req: Request,
  res: Response
) => {
  try {
    const result = await pool.query(`
      SELECT 
        u.id AS user_id,
        u.name AS doctor_name,
        d.name AS department_name
      FROM users u
      JOIN departments d ON u.department_id = d.department_id
      WHERE u.role_id = (
        SELECT role_id FROM user_roles WHERE role_name = 'doctor'
      )
      ORDER BY u.name;
    `);

    console.log("✅ Doctors fetched:", result.rows);

    return res.status(200).json({
      success: true,
      data: result.rows,
    });
  } catch (error: any) {
    console.error("❌ Error fetching doctors:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch doctors",
      error: error.message,
    });
  }
};

export const getAllDoctorAvailability = async (req: Request, res: Response) => {
  try {
    const query = `
      SELECT 
        id,
        user_id,
        day_of_week,
        start_time,
        end_time,
        room_number,
        is_available
      FROM availability
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
    `;

    const result = await pool.query(query);
    console.log("✅ Doctorsfrfrfrfrfrfrfrfr fetched:", result.rows);
    return res.status(200).json({ success: true, data: result.rows });
  } catch (error) {
    console.error("Error fetching doctor availability:", error);
    return res
      .status(500)
      .json({ success: false, error: "Internal Server Error" });
  }
};

export const updateAvailability = async (req: Request, res: Response) => {
  const id = req.params.id;
  const data = req.body;

  try {
    const result = await pool.query(
      `UPDATE availability
       SET day_of_week=$1,
           start_time=$2,
           end_time=$3,
           room_number=$4,
           is_available=$5
       WHERE id=$6
       RETURNING *`,
      [
        data.day_of_week,
        data.start_time,
        data.end_time,
        data.room_number,
        data.is_available,
        id,
      ]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ success: false, message: "Not found" });
    }

    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    console.error("Error updating:", err);
    res.status(500).json({ success: false, error: "Database error" });
  }
};

export const deleteAvailability = async (req: Request, res: Response) => {
  const id = req.params.id;
  console.log("deleting id......................", id);
  try {
    const result = await pool.query(
      `DELETE FROM availability WHERE id=$1 RETURNING *`,
      [id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ success: false, message: "Not found" });
    }

    res.json({ success: true, message: "Deleted" });
  } catch (err) {
    console.error("Error deleting:", err);
    res.status(500).json({ success: false, error: "Database error" });
  }
};

export const getDoctorPatients = async (req: Request, res: Response) => {
  try {
    const doctorId = req.user?.user_id;

    console.log(doctorId, "ddddddddddddddddd");

    if (!doctorId) {
      return res
        .status(400)
        .json({ success: false, error: "Doctor not logged in" });
    }

    const result = await pool.query(
      `
SELECT 
  u.id AS patient_id,
  u.name,
  u.email,
  u.phone,
  u.blood_group,
  u.created_at::date AS created_at,
  MAX(a.appointment_date)::date AS last_visit,

  -- Get next upcoming appointment of patient for this doctor
  (
    SELECT MIN(a2.appointment_date)::date
    FROM appointments a2
    WHERE a2.patient_id = u.id
      AND a2.doctor_id = $1
      AND a2.status = 'Scheduled'
      AND a2.appointment_date::date > CURRENT_DATE
  ) AS next_appointment

FROM appointments a
JOIN users u ON a.patient_id = u.id
JOIN user_roles r ON u.role_id = r.role_id

WHERE a.doctor_id = $1
  AND r.role_name = 'patient'

GROUP BY 
  u.id, u.name, u.email, u.phone, u.blood_group, u.created_at

ORDER BY u.name;

      `,
      [doctorId]
    );

    console.log(result);

    return res.status(200).json({
      success: true,
      data: result.rows,
    });
  } catch (err) {
    console.error("Error fetching doctor patients:", err);
    return res.status(500).json({
      success: false,
      error: "Database error",
    });
  }
};

export const getPatientMedicalRecords = async (req: Request, res: Response) => {
  const patientId = req.query.patientId as string | undefined;
  const doctorId = req.user?.user_id;

  console.log(doctorId, "docttttttttttttttttt");

  try {
    let query = `
      SELECT 
          a.appointment_id AS id,
          a.patient_id,
          u.name AS patient_name,

          a.appointment_date AS date,
          a.created_at
      FROM appointments a
      JOIN users u ON a.patient_id = u.id
      WHERE a.doctor_id = $1
    `;

    const params: any[] = [doctorId];

    // Filter by patient
    if (patientId) {
      query += ` AND a.patient_id = $2`;
      params.push(patientId);
    }

    query += ` ORDER BY a.created_at DESC`;

    const result = await pool.query(query, params);

    return res.status(200).json({
      success: true,
      data: result.rows,
    });
  } catch (err) {
    console.error("Error fetching medical records:", err);
    return res.status(500).json({
      success: false,
      error: "Database error",
    });
  }
};

export const createMedicalRecord = async (req: Request, res: Response) => {
  const { patientId, patientName, diagnosis, symptoms, prescription, notes } =
    req.body;

  try {
    const result = await pool.query(
      `INSERT INTO appointments 
        (patient_id, doctor_id, appointment_date, diagnosis, symptoms, prescription, notes)
       VALUES ($1, $2, CURRENT_DATE, $3, $4, $5, $6)
       RETURNING *`,
      [patientId, req.user?.user_id, diagnosis, symptoms, prescription, notes]
    );

    return res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    console.error("Medical record insert error", err);
    return res.status(500).json({ success: false });
  }
};
