import { pool } from "../config/db";
export async function createUsersRolesTable() {
    // 1️⃣ Create table if it doesn't exist
    await pool.query(`
    CREATE TABLE IF NOT EXISTS user_roles (
      role_id SERIAL PRIMARY KEY, 
      role_name VARCHAR(50) NOT NULL UNIQUE,
      role_description VARCHAR(255),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);
    console.log("✅ user_roles table created");
    // 2️⃣ Insert all hospital roles (without inline comments)
      try {
       await pool.query(`
      INSERT INTO user_roles (role_name, role_description)
      VALUES
        ('super_admin', 'System Super Admin with full permissions'),
        ('admin', 'Hospital Admin'),
        ('receptionist', 'Handles patient appointments and reception'),
        ('accountant', 'Handles billing and financial records'),
        ('it_admin', 'IT Administrator'),
        ('doctor', 'General Doctor'),
        ('surgeon', 'Specialist Surgeon'),
        ('nurse', 'Registered Nurse'),
        ('lab_technician', 'Handles lab tests and samples'),
        ('pharmacist', 'Manages pharmacy and medications'),
        ('radiologist', 'Performs and analyzes radiology scans'),
        ('physiotherapist', 'Provides physiotherapy treatments'),
        ('dietitian', 'Manages patient diet plans'),
        ('ward_incharge', 'Manages patient wards'),
        ('housekeeping', 'Maintains hospital cleanliness'),
        ('security', 'Ensures hospital safety'),
        ('maintenance', 'Handles equipment and facility maintenance'),
        ('research_scientist', 'Conducts medical research'),
        ('medical_educator', 'Trains medical staff'),
        ('clinical_data_analyst', 'Analyzes clinical data'),
        ('training_coordinator', 'Coordinates training programs'),
        ('patient', 'Hospital patient'),
        ('billing_staff', 'Enters and manages patient bills')
      ON CONFLICT (role_name) DO NOTHING;
    `);

    console.log("✅ All hospital roles inserted");
  } catch (err) {
    console.error("❌ Migration failed:", err);
  }
}