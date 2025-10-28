import { pool } from "../config/db";
import { createUsersRolesTable } from "./001_create_user_roles";
import { createUsersTable } from "./002_create_users";
import { createDepartmentsTable } from './003_create_departments'
import { createDoctorAvailabilityTable } from "./004_create_doctor_availability";
import { addForeignKeyToUsers } from "./005_add_fk";
async function runMigrations() {
    try {
        console.log("🚀 Starting migrations...");
        // Create user_roles table
        await createUsersRolesTable();          // 1️⃣ roles
        await createDepartmentsTable();         // 2️⃣ departments first
        await createUsersTable();               // 3️⃣ users next (can reference departments)
        await createDoctorAvailabilityTable();  // 4️⃣ doctor availability
        await addForeignKeyToUsers();           // 5️⃣ any post-fk setup

        console.log("✅ All migrations completed successfully");
        process.exit(0);
    }
    catch (err) {
        console.error("❌ Migration failed:", err);
        process.exit(1);
    }
    finally {
        await pool.end();
    }
}
runMigrations();
