import { Router } from "express";
import { authenticate } from "../middleware/auth";
import { requireAdmin } from "../middleware/role";
import db from "../config/db";

const router = Router();

// GET ALL STUDENTS
router.get("/students", authenticate, requireAdmin, (_req, res) => {
  const students = db
    .prepare(
      `
      SELECT id, name, email, year, phone, address
      FROM users
      WHERE role = 'student'
      ORDER BY name
    `
    )
    .all();

  res.json({ students });
});

// GET ALL COURSES
router.get("/courses", authenticate, requireAdmin, (_req, res) => {
  const courses = db
    .prepare(
      `
      SELECT id, name, year
      FROM courses
      ORDER BY year, name
    `
    )
    .all();

  res.json({ courses });
});

// GET GRADES LOG
router.get("/grades", authenticate, requireAdmin, (_req, res) => {
  const grades = db
    .prepare(
      `
      SELECT
        g.id,
        u.name AS studentName,
        c.name AS course,
        g.grade,
        g.created_at AS date,
        c.year
      FROM grades g
      JOIN users u ON u.id = g.student_id
      JOIN courses c ON c.id = g.course_id
      ORDER BY g.created_at DESC
    `
    )
    .all();

  res.json({ grades });
});

// INSERT NEW GRADE
router.post("/grades", authenticate, requireAdmin, (req, res) => {
  const { studentId, course, grade } = req.body;

  if (!studentId || !course || !grade) {
    return res.status(400).json({ error: "Missing fields" });
  }

  // Get course ID
  const courseRow = db
    .prepare(`SELECT id FROM courses WHERE name = ?`)
    .get(course);

  if (!courseRow) {
    return res.status(400).json({ error: "Course not found" });
  }

  const stmt = db.prepare(
    `
    INSERT INTO grades (student_id, course_id, grade, created_by)
    VALUES (?, ?, ?, ?)
  `
  );

  const result = stmt.run(studentId, courseRow.id, grade, (req as any).user.id);

  return res.json({
    grade: {
      id: result.lastInsertRowid,
      studentId,
      course,
      grade,
      date: new Date().toISOString(),
    },
  });
});

export default router;
