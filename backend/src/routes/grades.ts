import { Router } from "express";
import { authenticate } from "../middleware/auth";
import { requireAdmin } from "../middleware/role";
import db from "../config/db";
import {
  createGradeSchema,
  updateGradeSchema,
  gradeIdParamSchema,
} from "../schemas/gradeSchema";

const router = Router();

// GET ALL GRADES
router.get("/", authenticate, requireAdmin, (_req, res) => {
  const grades = db
    .prepare(
      `
    SELECT 
      g.id,
      u.name AS studentName,
      c.name AS course,
      c.year AS year,
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

// CREATE GRADE
router.post("/", authenticate, requireAdmin, (req, res) => {
  const parsed = createGradeSchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.flatten() });
  }

  const { studentId, courseId, grade } = parsed.data;

  // Validate course
  const courseRow = db
    .prepare("SELECT id FROM courses WHERE id = ?")
    .get(courseId);
  if (!courseRow) return res.status(404).json({ error: "Course not found" });

  // Validate student
  const studentRow = db
    .prepare("SELECT id FROM users WHERE id = ?")
    .get(studentId);
  if (!studentRow) return res.status(404).json({ error: "Student not found" });

  const stmt = db.prepare(`
      INSERT INTO grades (student_id, course_id, grade, created_at)
      VALUES (?, ?, ?, datetime('now'))
  `);

  const info = stmt.run(studentId, courseId, grade);

  res.status(201).json({
    grade: {
      id: info.lastInsertRowid,
      studentId,
      courseId,
      grade,
      date: new Date().toISOString(),
    },
  });
});

// UPDATE GRADE
router.put("/:id", authenticate, requireAdmin, (req, res) => {
  const idParsed = gradeIdParamSchema.safeParse(req.params);
  if (!idParsed.success)
    return res.status(400).json({ error: idParsed.error.flatten() });

  const bodyParsed = updateGradeSchema.safeParse(req.body);
  if (!bodyParsed.success)
    return res.status(400).json({ error: bodyParsed.error.flatten() });

  const { id } = idParsed.data;
  const data = bodyParsed.data;

  const existing = db.prepare(`SELECT * FROM grades WHERE id = ?`).get(id);
  if (!existing) return res.status(404).json({ error: "Grade not found" });

  const stmt = db.prepare(`
    UPDATE grades
    SET grade = COALESCE(@grade, grade)
    WHERE id = @id
  `);

  stmt.run({ ...data, id });

  res.json({ id, ...data });
});

// DELETE GRADE
router.delete("/:id", authenticate, requireAdmin, (req, res) => {
  const parsed = gradeIdParamSchema.safeParse(req.params);
  if (!parsed.success)
    return res.status(400).json({ error: parsed.error.flatten() });

  db.prepare(`DELETE FROM grades WHERE id = ?`).run(parsed.data.id);

  res.json({ success: true });
});

export default router;
