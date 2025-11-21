import { Request, Response } from "express";
import db from "../config/db";
import {
  createCourseSchema,
  updateCourseSchema,
  courseIdParamSchema,
} from "../schemas/courseSchema";

// GET ALL COURSES
export const getCourses = (_req: Request, res: Response) => {
  const courses = db
    .prepare(`SELECT id, name, year FROM courses ORDER BY year, name`)
    .all();

  res.json({ courses });
};

// GET COURSE BY ID
export const getCourseById = (req: Request, res: Response) => {
  const parsed = courseIdParamSchema.safeParse(req.params);
  if (!parsed.success)
    return res.status(400).json({ error: parsed.error.flatten() });

  const course = db
    .prepare(`SELECT id, name, year FROM courses WHERE id = ?`)
    .get(parsed.data.id);

  if (!course) return res.status(404).json({ error: "Course not found" });

  res.json(course);
};

// CREATE COURSE
export const createCourse = (req: Request, res: Response) => {
  const parsed = createCourseSchema.safeParse(req.body);
  if (!parsed.success)
    return res.status(400).json({ error: parsed.error.flatten() });

  const { name, year } = parsed.data;

  const stmt = db.prepare(`INSERT INTO courses (name, year) VALUES (?, ?)`);
  const result = stmt.run(name, year);

  res.status(201).json({ id: result.lastInsertRowid, name, year });
};

// UPDATE COURSE
export const updateCourse = (req: Request, res: Response) => {
  const idParsed = courseIdParamSchema.safeParse(req.params);
  if (!idParsed.success)
    return res.status(400).json({ error: idParsed.error.flatten() });

  const bodyParsed = updateCourseSchema.safeParse(req.body);
  if (!bodyParsed.success)
    return res.status(400).json({ error: bodyParsed.error.flatten() });

  const existing = db
    .prepare(`SELECT * FROM courses WHERE id = ?`)
    .get(idParsed.data.id);

  if (!existing) return res.status(404).json({ error: "Course not found" });

  db.prepare(
    `
    UPDATE courses
    SET name = COALESCE(@name, name),
        year = COALESCE(@year, year)
    WHERE id = @id
  `
  ).run({ ...bodyParsed.data, id: idParsed.data.id });

  res.json({ id: idParsed.data.id, ...bodyParsed.data });
};

// DELETE COURSE
export const deleteCourse = (req: Request, res: Response) => {
  const parsed = courseIdParamSchema.safeParse(req.params);
  if (!parsed.success)
    return res.status(400).json({ error: parsed.error.flatten() });

  db.prepare(`DELETE FROM courses WHERE id = ?`).run(parsed.data.id);

  res.json({ success: true });
};
