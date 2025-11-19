// Grade CRUD + filtering
// GET /grades

import { Router } from "express";
import { authenticate } from "../middleware/auth";
import { requireAdmin } from "../middleware/role";
import db from "../config/db";
import { createGradeSchema } from "../schemas/courseSchema";

const router = Router();

// GET GRADES LOG 
router.get("/", authenticate, requireAdmin, (req, res) => {
  const grades = db
    .prepare(
      `
      SELECT 
        g.id,
        u.name AS studentName,
        c.name AS course,
        g.grade,
        g.created_at AS date
      FROM grades g
      JOIN users u ON u.id = g.student_id
      JOIN courses c ON c.id = g.course_id
      ORDER BY g.created_at DESC
    `
    )
    .all();

  res.json({ grades });
});

// ADD NEW GRADE 
router.post("/", authenticate, requireAdmin, (req, res) => {
  const parsed = createGradeSchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({
      error: parsed.error.flatten(),
    });
  }

  const { studentId, course, grade } = parsed.data;

  // Get course_id
  const courseRow = db
    .prepare("SELECT id FROM courses WHERE name = ?")
    .get(course);

  if (!courseRow) {
    return res.status(404).json({ error: "Course not found" });
  }

  const stmt = db.prepare(`
      INSERT INTO grades (student_id, course_id, grade, created_at)
      VALUES (?, ?, ?, datetime('now'))
  `);

  const info = stmt.run(studentId, courseRow.id, grade);

  const newGrade = {
    id: info.lastInsertRowid,
    studentId,
    course,
    grade,
    date: new Date().toISOString(),
  };

  res.status(201).json({ grade: newGrade });
});

export default router;
