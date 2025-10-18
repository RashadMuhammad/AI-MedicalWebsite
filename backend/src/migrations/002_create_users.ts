import { pool } from "../config/db.js";

export async function createUsersTable() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      email VARCHAR(100) UNIQUE NOT NULL,
      password VARCHAR(255) NOT NULL,
      name VARCHAR(100) NOT NULL,
      role_id INTEGER NOT NULL REFERENCES user_roles(role_id),
      phone VARCHAR(15),
      avatar TEXT,
      specialization VARCHAR(100),
      department VARCHAR(100),
      date_of_birth DATE,
      blood_group VARCHAR(5),
      address TEXT,
      emergency_contact VARCHAR(15),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);
  console.log("✅ Users table created with role_id");

  // ✅ Add refresh_token only if it doesn’t exist
  await pool.query(`
    DO $$
    BEGIN
      IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' AND column_name = 'refresh_token'
      ) THEN
        ALTER TABLE users ADD COLUMN refresh_token TEXT;
      END IF;
    END $$;
  `);
  console.log("✅ refresh_token column ensured");

  // ✅ Update department to department_id safely
  await pool.query(`
    DO $$
    BEGIN
      IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' AND column_name = 'department'
      ) THEN
        ALTER TABLE users DROP COLUMN department;
      END IF;

      IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' AND column_name = 'department_id'
      ) THEN
        ALTER TABLE users ADD COLUMN department_id INT REFERENCES departments(department_id) ON DELETE SET NULL;
      END IF;
    END $$;
  `);
  console.log("✅ Users table updated with department_id foreign key");

  // ✅ Add is_active column safely
  await pool.query(`
    DO $$
    BEGIN
      IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' AND column_name = 'is_active'
      ) THEN
        ALTER TABLE users ADD COLUMN is_active BOOLEAN DEFAULT TRUE;
      END IF;
    END $$;
  `);
  console.log("✅ is_active column ensured");
}
