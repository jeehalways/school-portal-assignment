import { Request, Response } from "express";
import db from "../config/db";

export const getMe = (req: Request, res: Response) => {
  const firebaseUid = (req as any).user.uid;

  const stmt = db.prepare(`
    SELECT id, name, email, role, year
    FROM users
    WHERE firebase_uid = ?
  `);

  const user = stmt.get(firebaseUid);

  if (!user) {
    return res.status(404).json({ error: "User not found in database" });
  }

  return res.json(user);
};
