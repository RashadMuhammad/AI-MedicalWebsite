import { pool } from "../config/db";

export async function createDoctorAvailabilityTable() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS doctor_availability (
        id SERIAL PRIMARY KEY,
        doctor_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        day_of_week VARCHAR(20) NOT NULL,       -- e.g., Monday, Tuesday
        start_time TIME NOT NULL,               -- Start of shift
        end_time TIME NOT NULL,                 -- End of shift
        is_available BOOLEAN DEFAULT TRUE,      -- Availability flag
        room_number VARCHAR(20),                -- Optional: Room or cabin number
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    console.log("✅ doctor_availability table created successfully!");
  } catch (error) {
    console.error("❌ Error creating doctor_availability table:", error);
  }
}
