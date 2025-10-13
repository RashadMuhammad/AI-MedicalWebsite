import { pool } from "../config/db.js";
export async function createUsersTable() {
    await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      email VARCHAR(100) UNIQUE NOT NULL,
      name VARCHAR(100) NOT NULL,
      role VARCHAR(20) NOT NULL,  -- 'patient', 'doctor', 'admin'
      phone VARCHAR(15),
      avatar TEXT,
      specialization VARCHAR(100),    -- For doctors
      department VARCHAR(100),        -- For doctors/admin
      date_of_birth DATE,             -- For patients
      blood_group VARCHAR(5),         -- For patients
      address TEXT,
      emergency_contact VARCHAR(15),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);
    console.log("✅ Users table created");
}
