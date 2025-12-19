import type { Request, Response } from "express";
import { pool } from "../config/db";


export const getServices = async (req: Request, res: Response) => {
  try {
    const result = await pool.query(`
      SELECT * FROM services ORDER BY created_at DESC
    `);
    
    console.log("Fetched services:", result.rows);
    return res.json(result.rows);
  } catch (err) {
    console.error("Error fetching services:", err);
    return res.status(500).json({ error: "Failed to fetch services" });
  }
};


export const getServicesById = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const result = await pool.query("SELECT * FROM services WHERE department_id = $1", [id]);
    if (result.rows.length === 0) return res.status(404).json({ error: "Department not found" });
    res.json(result.rows[0]);
  } catch (err) {
    console.error("Error fetching services:", err);
    res.status(500).json({ error: "Failed to fetch services" });
  }
};

export const addService = async (req: Request, res: Response) => {
  try {
    const {
      name,
      category,
      department_id,
      price,
      price_type,
      duration_value,
      duration_unit,
      taxable,
      tax_rate,
      eligible_for_insurance,
      insurance_codes,
      status,
      doctor_pricing // array of { doctor_id, price } if price_type is DoctorBased
    } = req.body;

    // Safe defaults
    const safeCategory = category || "Consultation";
    const safeDepartmentId = department_id || null;
    const safePrice = price ?? 0;
    const safePriceType = price_type || "Fixed";
    const safeDurationValue = duration_value ?? 0;
    const safeDurationUnit = duration_unit || "Minutes";
    const safeTaxable = taxable ?? false;
    const safeTaxRate = tax_rate ?? 0;
    const safeEligibleForInsurance = eligible_for_insurance ?? false;
    const safeInsuranceCodes = insurance_codes || [];
    const safeStatus = status || "Active";

    // Insert into services table
    const result = await pool.query(
      `INSERT INTO services
        (name, category, department_id, price, price_type, duration_value, duration_unit, taxable, tax_rate, eligible_for_insurance, insurance_codes, status)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)
       RETURNING *`,
      [
        name,
        safeCategory,
        safeDepartmentId,
        safePrice,
        safePriceType,
        safeDurationValue,
        safeDurationUnit,
        safeTaxable,
        safeTaxRate,
        safeEligibleForInsurance,
        safeInsuranceCodes,
        safeStatus
      ]
    );

    const newService = result.rows[0];

    // If DoctorBased pricing, insert into service_doctor_pricing
    if (safePriceType === "DoctorBased" && Array.isArray(doctor_pricing)) {
      for (const dp of doctor_pricing) {
        await pool.query(
          `INSERT INTO service_doctor_pricing (service_id, doctor_id, price)
           VALUES ($1,$2,$3)`,
          [newService.service_id, dp.doctor_id, dp.price]
        );
      }
    }

    res.status(201).json({
      message: "✅ Service created successfully",
      service: newService
    });

  } catch (err) {
    console.error("Error adding service:", err);
    res.status(500).json({ error: "Failed to add service" });
  }
};

  
// ✅ Update department
export const updateService = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { name, head_id, doctors_count, patients_count, revenue, growth_percent, status, is_active } = req.body;

  try {
    const result = await pool.query(
      `UPDATE departments SET
         name = $1,
         head_id = $2,
         doctors_count = $3,
         patients_count = $4,
         revenue = $5,
         growth_percent = $6,
         status = $7,
         is_active = $8,
         updated_at = CURRENT_TIMESTAMP
       WHERE department_id = $9
       RETURNING *`,
      [name, head_id, doctors_count, patients_count, revenue, growth_percent, status, is_active, id]
    );

    if (result.rows.length === 0) return res.status(404).json({ error: "Department not found" });

    res.json(result.rows[0]);
  } catch (err) {
    console.error("Error updating department:", err);
    res.status(500).json({ error: "Failed to update department" });
  }
};


export const deleteService = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const result = await pool.query("DELETE FROM services WHERE department_id = $1 RETURNING *", [id]);
    if (result.rows.length === 0) return res.status(404).json({ error: "Department not found" });

    res.json({ message: "Services deleted successfully" });
  } catch (err) {
    console.error("Error deleting services:", err);
    res.status(500).json({ error: "Failed to delete services" });
  }
};
