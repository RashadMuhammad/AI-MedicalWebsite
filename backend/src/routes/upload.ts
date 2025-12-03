import multer from "multer";

// Use memory storage → image stored as buffer → saved to PostgreSQL BYTEA
export const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB max
  },
});
