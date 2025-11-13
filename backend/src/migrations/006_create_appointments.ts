import { pool } from "../config/db";

export async function createAppointmentsTable() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS appointments (
        appointment_id UUID DEFAULT gen_random_uuid() PRIMARY KEY,

        patient_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        doctor_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

        appointment_date DATE NOT NULL,
        start_time TIME,
        end_time TIME,

        appointment_type VARCHAR(100) NOT NULL,
        reason TEXT,                             

        status VARCHAR(20) DEFAULT 'Scheduled',  
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    console.log("✅ appointments table created successfully");
  } catch (err) {
    console.error("❌ Error creating appointments table:", err);
  }
}
