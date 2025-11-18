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

export async function getMyCourses(req: Request, res: Response) {
  const firebaseUid = (req as any).user.uid;

  // Get student DB row
  const student = db
    .prepare(
      `
    SELECT id FROM users WHERE firebase_uid = ?
  `
    )
    .get(firebaseUid);

  if (!student) {
    return res.status(404).json({ error: "Student not found" });
  }

  // Fetch courses with grades
  const courses = db
    .prepare(
      `
    SELECT 
      c.name AS name,
      c.year AS year,
      g.grade AS grade
    FROM courses c
    LEFT JOIN grades g ON g.course_id = c.id AND g.student_id = ?
    ORDER BY c.year, c.name
  `
    )
    .all(student.id);

  return res.json({ courses });
}
