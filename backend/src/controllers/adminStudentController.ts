import { Request, Response } from "express";
import db from "../config/db";
import {
  createStudentSchema,
  updateStudentSchema,
  studentIdParamSchema,
} from "../schemas/studentSchema";

// GET All Students
export function getAllStudents(_req: Request, res: Response) {
  const students = db
    .prepare(
      `
      SELECT id, firebase_uid, name, email, year, phone, address, role
      FROM users
      WHERE role = 'student'
      ORDER BY name
    `
    )
    .all();

  res.json({ students });
}

// GET One Student
export function getStudent(req: Request, res: Response) {
  const parsedId = studentIdParamSchema.safeParse(req.params);
  if (!parsedId.success)
    return res.status(400).json({ error: parsedId.error.flatten() });

  const { id } = parsedId.data;

  const student = db
    .prepare(
      `
      SELECT id, firebase_uid, name, email, year, phone, address, role
      FROM users
      WHERE id = ?
    `
    )
    .get(id);

  if (!student) return res.status(404).json({ error: "Student not found" });

  res.json({ student });
}

// CREATE New Student
export function createStudent(req: Request, res: Response) {
  const parsed = createStudentSchema.safeParse(req.body);

  if (!parsed.success)
    return res.status(400).json({ error: parsed.error.flatten() });

  const data = parsed.data;

  const insert = db.prepare(
    `
      INSERT INTO users (firebase_uid, email, name, role, year, phone, address)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `
  );

  const result = insert.run(
    data.firebaseUid,
    data.email,
    data.name,
    data.role ?? "student",
    data.year ?? null,
    data.phone ?? null,
    data.address ?? null
  );

  res.status(201).json({
    student: {
      id: result.lastInsertRowid,
      ...data,
    },
  });
}

// UPDATE Student
export function updateStudent(req: Request, res: Response) {
  const parsedId = studentIdParamSchema.safeParse(req.params);
  if (!parsedId.success)
    return res.status(400).json({ error: parsedId.error.flatten() });

  const parsedBody = updateStudentSchema.safeParse(req.body);
  if (!parsedBody.success)
    return res.status(400).json({ error: parsedBody.error.flatten() });

  const { id } = parsedId.data;
  const data = parsedBody.data;

  // Build dynamic SQL for updates
  const fields = Object.keys(data)
    .map((col) => `${col} = ?`)
    .join(", ");

  const values = Object.values(data);

  const stmt = db.prepare(`UPDATE users SET ${fields} WHERE id = ?`);
  stmt.run(...values, id);

  return res.json({ message: "Student updated" });
}

// DELETE Student
export function deleteStudent(req: Request, res: Response) {
  const parsedId = studentIdParamSchema.safeParse(req.params);
  if (!parsedId.success)
    return res.status(400).json({ error: parsedId.error.flatten() });

  const { id } = parsedId.data;

  db.prepare(`DELETE FROM users WHERE id = ?`).run(id);

  res.json({ message: "Student deleted" });
}
