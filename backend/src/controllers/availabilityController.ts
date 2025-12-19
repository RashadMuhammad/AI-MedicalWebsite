import type { Request, Response } from "express";
import { pool } from "../config/db";

export const getMyAvailability = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.user_id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: "Unauthorized",
      });
    }

    const result = await pool.query(
      `SELECT 
        id,
        day_of_week,
        start_time,
        end_time,
        room_number,
        is_available,
        created_at
       FROM availability
       WHERE user_id = $1
       ORDER BY day_of_week, start_time`,
      [userId]
    );

    return res.json({
      success: true,
      data: result.rows,
    });
  } catch (err) {
    console.error("Get availability error:", err);
    return res.status(500).json({
      success: false,
      error: "Server error",
    });
  }
};

export const createAvailability = async (req: Request, res: Response) => {
  const {
    user_id,
    day_of_week,
    start_time,
    end_time,
    room_number,
    is_available,
  } = req.body;

  if (!user_id || !day_of_week || !start_time || !end_time) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    const result = await pool.query(
      `
      INSERT INTO availability
      (user_id, role_id, day_of_week, start_time, end_time, room_number, is_available)
      SELECT id, role_id, $2, $3, $4, $5, $6
      FROM users
      WHERE id = $1
      RETURNING *
      `,
      [
        user_id,
        day_of_week,
        start_time,
        end_time,
        room_number || null,
        is_available ?? true,
      ]
    );

    res.status(201).json({ success: true, data: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Database error" });
  }
};

export const updateAvailability = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.user_id;
    const availabilityId = req.params.id;

    if (!userId) {
      return res.status(401).json({ success: false, error: "Unauthorized" });
    }

    const {
      day_of_week,
      start_time,
      end_time,
      room_number,
      is_available,
    } = req.body;

    const result = await pool.query(
      `UPDATE availability
       SET day_of_week = $1,
           start_time = $2,
           end_time = $3,
           room_number = $4,
           is_available = $5,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $6 AND user_id = $7
       RETURNING *`,
      [
        day_of_week,
        start_time,
        end_time,
        room_number,
        is_available,
        availabilityId,
        userId,
      ]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({
        success: false,
        error: "Availability not found or not allowed",
      });
    }

    return res.json({
      success: true,
      data: result.rows[0],
    });
  } catch (err) {
    console.error("Update availability error:", err);
    res.status(500).json({ success: false, error: "Server error" });
  }
};

export const deleteAvailability = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.user_id;
    const availabilityId = req.params.id;

    if (!userId) {
      return res.status(401).json({ success: false, error: "Unauthorized" });
    }

    const result = await pool.query(
      `DELETE FROM availability
       WHERE id = $1 AND user_id = $2`,
      [availabilityId, userId]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({
        success: false,
        error: "Availability not found or not allowed",
      });
    }

    return res.json({
      success: true,
      message: "Availability deleted",
    });
  } catch (err) {
    console.error("Delete availability error:", err);
    res.status(500).json({ success: false, error: "Server error" });
  }
};
