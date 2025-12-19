import { pool } from "../config/db";

export async function createAvailabilityTable() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS availability (
        id SERIAL PRIMARY KEY,

        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        role_id INTEGER NOT NULL REFERENCES user_roles(role_id) ON DELETE CASCADE,

        day_of_week VARCHAR(20) NOT NULL,
        start_time TIME NOT NULL,
        end_time TIME NOT NULL,

        is_available BOOLEAN DEFAULT TRUE,
        room_number VARCHAR(20),

        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    console.log("✅ availability table created successfully!");
  } catch (error) {
    console.error("❌ Error creating availability table:", error);
  }
}

