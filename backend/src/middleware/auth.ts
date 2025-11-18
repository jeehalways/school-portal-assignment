// Verifies Firebase token for each request
// If token is missing/invalid return 401 Unauthorized
import { Request, Response, NextFunction } from "express";
import admin from "../config/firebase";
import db from "../config/db";

export async function authenticate(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith("Bearer ")) {
    return res.status(401).json({ error: "No token" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = await admin.auth().verifyIdToken(token);
    const firebaseUid = decoded.uid;

    // Load user from DB
    const user = db
      .prepare(
        `
        SELECT id, name, email, role, year
        FROM users
        WHERE firebase_uid = ?
      `
      )
      .get(firebaseUid);

    if (!user) {
      return res.status(401).json({ error: "User not found in database" });
    }

    // Attach to req.user
    (req as any).user = {
      ...decoded,
      ...user, // includes id, role, year, etc.
    };

    next();
  } catch (err) {
    console.error(err);
    return res.status(401).json({ error: "Invalid token" });
  }
}
