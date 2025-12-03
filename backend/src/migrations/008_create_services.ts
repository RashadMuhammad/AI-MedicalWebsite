import { pool } from "../config/db";

export async function createServicesTable() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS services (
        service_id SERIAL PRIMARY KEY,              
        name VARCHAR(100) NOT NULL,
        department_id INT NULL,
        price DECIMAL(10,2) NOT NULL DEFAULT 0,
        description TEXT,
        status VARCHAR(20) DEFAULT 'active',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    console.log("✅ services table created successfully");
  } catch (err) {
    console.error("❌ Error creating services table:", err);
  }
}
