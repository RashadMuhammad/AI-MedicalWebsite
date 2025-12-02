// middleware/roleMiddleware.ts
import type { Request, Response, NextFunction } from "express";

export const allowRoles = (...allowedRoles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    if (!allowedRoles.includes(req.user.role_name)) {
      return res.status(403).json({ error: "Forbidden: Access denied" });
    }

    next();
  };
};
