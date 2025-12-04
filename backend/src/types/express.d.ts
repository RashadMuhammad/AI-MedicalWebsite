import "express";

declare module "express-serve-static-core" {
  interface Request {
    user?: {
      session_id: string;
      user_id: string; // <-- ADD THIS
      id?: string;
      name?: string;
      email?: string;
      role_name?: string;
      phone?: string;
      avatar?: string | null;
      specialization?: string | null;
      emergency_contact?: string | null;
    };
  }
}
