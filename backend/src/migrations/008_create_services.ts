import { pool } from "../config/db";

export async function createServicesTable() {
  try {
    await pool.query(`
        CREATE TABLE services (
          service_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          
          name VARCHAR(200) NOT NULL,

          category VARCHAR(50) NOT NULL
              CHECK (category IN ('Consultation','Procedure','Lab Test','Radiology','Pharmacy','Package','Room')),

          department_id UUID NULL ,

          price NUMERIC(12,2) NOT NULL,

          price_type VARCHAR(20) NOT NULL
              CHECK (price_type IN ('Fixed', 'Variable', 'DoctorBased', 'Insurance')),

          duration_value INT NOT NULL,
          duration_unit VARCHAR(20) NOT NULL
              CHECK (duration_unit IN ('Minutes','Hours','Days')),

          taxable BOOLEAN NOT NULL DEFAULT false,
          tax_rate NUMERIC(5,2) NULL 
              CHECK (tax_rate >= 0),

          eligible_for_insurance BOOLEAN NOT NULL DEFAULT false,
          insurance_codes TEXT[] NULL, -- Array of insurance codes (ex: CPT / ICD / TPA codes)

          status VARCHAR(10) NOT NULL 
              CHECK (status IN ('Active','Inactive')),

          created_at TIMESTAMP DEFAULT NOW(),
          updated_at TIMESTAMP DEFAULT NOW()
    );

    `);

    console.log("✅ services table created successfully");
  } catch (err) {
    console.error("❌ Error creating services table:", err);
  }
}

export async function CreateDoctorServiceTable() {
  try {
    await pool.query(`
      CREATE TABLE service_doctor_pricing (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        service_id UUID NOT NULL REFERENCES services(service_id) ON DELETE CASCADE,
        doctor_id UUID NOT NULL ,
        price NUMERIC(12,2) NOT NULL,
        UNIQUE(service_id, doctor_id) 
      );


    `);

    console.log("✅ services table created successfully");
  } catch (err) {
    console.error("❌ Error creating services table:", err);
  }
}
