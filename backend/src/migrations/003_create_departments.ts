import { pool } from "../config/db";

export async function createDepartmentsTable() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS departments (
      department_id SERIAL PRIMARY KEY,
      name VARCHAR(100) UNIQUE NOT NULL,
      head_id UUID,
      doctors_count INT DEFAULT 0,
      patients_count INT DEFAULT 0,
      revenue NUMERIC(12, 2) DEFAULT 0.00,
      growth_percent NUMERIC(5, 2) DEFAULT 0.00,
      status VARCHAR(20) DEFAULT 'active',
      is_active BOOLEAN DEFAULT TRUE,         -- ✅ Added column
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);

  console.log("✅ Departments table created with is_active column");
}
