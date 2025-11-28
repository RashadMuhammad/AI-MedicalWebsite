import { pool } from "../config/db";

export async function createSessionsTable() {
  try {
    console.log("session hi")
    await pool.query(`
      CREATE TABLE sessions (
      session_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID  REFERENCES users(id),
      access_token TEXT NOT NULL,
      refresh_token TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      expires_at TIMESTAMP DEFAULT (CURRENT_TIMESTAMP + INTERVAL '7 days'));

    `);

    console.log("✅ Session table created successfully");
  } catch (err) {
    console.error("❌ Error creating session table:", err);
  }
}
