import { pool } from "../config/db.js";
import bcrypt from "bcryptjs";
import { generateAccessToken, generateRefreshToken } from "../utils/tokenUtils.js";
export const createUser = async (req, res) => {
    try {
        console.log("req.body:", req.body);
        const { email, password, name, role, phone, avatar, specialization, department, dateOfBirth, bloodGroup, address, emergencyContact, } = req.body;
        // 🔹 Basic validation
        if (!email || !password || !name || !role) {
            res.status(400).json({ error: "email, password, name, and role are required" });
            return;
        }
        // 🔹 Check if email already exists
        const existingUser = await pool.query("SELECT id FROM users WHERE email = $1", [email]);
        if (existingUser.rowCount && existingUser.rowCount > 0) {
            res.status(400).json({ error: "Email already exists" });
            return;
        }
        // 🔹 Map role name → role_id
        const roleResult = await pool.query("SELECT role_id FROM user_roles WHERE role_name = $1", [role]);
        if (roleResult.rowCount === 0) {
            res.status(400).json({ error: "Invalid role" });
            return;
        }
        const role_id = Number(roleResult.rows[0].role_id);
        // 🔹 Hash password before saving
        const hashedPassword = await bcrypt.hash(password, 10);
        // 🔹 Insert user into database
        const result = await pool.query(`INSERT INTO users 
        (email, password, name, role_id, phone, avatar, specialization, department, date_of_birth, blood_group, address, emergency_contact, created_at, updated_at)
        VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,CURRENT_TIMESTAMP,CURRENT_TIMESTAMP)
        RETURNING id, email, name, role_id, phone, avatar, specialization, department, date_of_birth, blood_group, address, emergency_contact, created_at, updated_at`, [
            email,
            hashedPassword,
            name,
            role_id,
            phone,
            avatar,
            specialization,
            department,
            dateOfBirth,
            bloodGroup,
            address,
            emergencyContact,
        ]);
        // ✅ Success response
        res.status(201).json({
            message: "✅ User created successfully",
            user: result.rows[0],
        });
    }
    catch (err) {
        console.error("❌ Error creating user:", err.message);
        res.status(500).json({ error: "Server error" });
    }
};
export const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;
        console.log(email, password);
        // Check for user
        const result = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
        const user = result.rows[0];
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        // Compare password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: "Invalid credentials" });
        }
        // Generate tokens
        const accessToken = generateAccessToken(user.id);
        const refreshToken = generateRefreshToken(user.id);
        // (Optional) Save refresh token in DB for session tracking
        await pool.query("UPDATE users SET refresh_token = $1 WHERE id = $2", [refreshToken, user.id]);
        const roleResult = await pool.query("SELECT role_name FROM user_roles WHERE role_id = $1", [user.role_id] // assuming your users table has role_id
        );
        const roleName = roleResult.rows[0]?.role_name || "unknown";
        res.status(200).json({
            message: "Login successful",
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                role: roleName,
            },
            accessToken,
            refreshToken,
        });
    }
    catch (error) {
        console.error("❌ Login error:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};
