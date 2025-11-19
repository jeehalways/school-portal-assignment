import { Router } from "express";
import { authenticate } from "../middleware/auth";
import { requireAdmin } from "../middleware/role";
import db from "../config/db";
import {
  createStudentSchema,
  updateStudentSchema,
  studentIdParamSchema,
} from "../schemas/studentSchema";

const router = Router();

// GET All Students
router.get("/", authenticate, requireAdmin, (_req, res) => {
  const students = db
    .prepare(
      `
      SELECT id, firebase_uid, name, email, year, phone, address
      FROM users
      WHERE role = 'student'
      ORDER BY name
    `
    )
    .all();

  res.json({ students });
});

// GET Student by ID
router.get("/:id", authenticate, requireAdmin, (req, res) => {
  const parsed = studentIdParamSchema.safeParse(req.params);
  if (!parsed.success)
    return res.status(400).json({ error: parsed.error.flatten() });

  const student = db
    .prepare(
      `
      SELECT id, firebase_uid, name, email, year, phone, address
      FROM users
      WHERE id = ?
    `
    )
    .get(parsed.data.id);

  if (!student) return res.status(404).json({ error: "Student not found" });

  res.json(student);
});

// CREATE Student
router.post("/", authenticate, requireAdmin, (req, res) => {
  const parsed = createStudentSchema.safeParse(req.body);
  if (!parsed.success)
    return res.status(400).json({ error: parsed.error.flatten() });

  const s = parsed.data;

  const stmt = db.prepare(`
    INSERT INTO users (firebase_uid, email, name, role, year, phone, address)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  const result = stmt.run(
    s.firebaseUid,
    s.email,
    s.name,
    s.role ?? "student",
    s.year ?? null,
    s.phone ?? null,
    s.address ?? null
  );

  res.status(201).json({ id: result.lastInsertRowid, ...s });
});

// UPDATE Student
router.put("/:id", authenticate, requireAdmin, (req, res) => {
  const idParsed = studentIdParamSchema.safeParse(req.params);
  if (!idParsed.success)
    return res.status(400).json({ error: idParsed.error.flatten() });

  const bodyParsed = updateStudentSchema.safeParse(req.body);
  if (!bodyParsed.success)
    return res.status(400).json({ error: bodyParsed.error.flatten() });

  const { id } = idParsed.data;
  const data = bodyParsed.data;

  const existing = db.prepare("SELECT * FROM users WHERE id = ?").get(id);
  if (!existing) return res.status(404).json({ error: "Student not found" });

  const stmt = db.prepare(`
    UPDATE users
    SET name = COALESCE(@name, name),
        email = COALESCE(@email, email),
        year = COALESCE(@year, year),
        phone = COALESCE(@phone, phone),
        address = COALESCE(@address, address),
        role = COALESCE(@role, role)
    WHERE id = @id
  `);

  stmt.run({ ...data, id });

  res.json({ id, ...data });
});

// DELETE Student
router.delete("/:id", authenticate, requireAdmin, (req, res) => {
  const parsed = studentIdParamSchema.safeParse(req.params);
  if (!parsed.success)
    return res.status(400).json({ error: parsed.error.flatten() });

  const stmt = db.prepare(`DELETE FROM users WHERE id = ?`);
  stmt.run(parsed.data.id);

  res.json({ success: true });
});

export default router;
