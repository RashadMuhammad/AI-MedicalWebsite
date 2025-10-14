import { pool } from "../config/db.js";
import { createUsersRolesTable } from "./001_create_user_roles.js";
import { createUsersTable } from "./002_create_users.js";
async function runMigrations() {
    try {
        console.log("🚀 Starting migrations...");
        // Create user_roles table
        await createUsersRolesTable();
        // Create users table
        await createUsersTable();
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
