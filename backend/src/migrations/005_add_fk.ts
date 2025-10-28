import { pool } from "../config/db";

export async function addForeignKeyToUsers() {
  await pool.query(`
    DO $$
    BEGIN
      IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints
        WHERE constraint_name = 'users_department_id_fkey'
      ) THEN
        ALTER TABLE users
        ADD CONSTRAINT users_department_id_fkey
        FOREIGN KEY (department_id)
        REFERENCES departments(department_id)
        ON DELETE SET DEFAULT;
      END IF;
    END $$;
  `);

  console.log("✅ users.department_id foreign key added successfully!");
}
