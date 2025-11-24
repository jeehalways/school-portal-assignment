// Test the Zod schemas for grades and inserting + updating a grade directly in the DB
import { describe, it, expect, beforeAll } from "@jest/globals";
import db from "../src/config/db";
import {
  createGradeSchema,
  updateGradeSchema,
} from "../src/schemas/gradeSchema";

// Setup DB once
beforeAll(async () => {
  const g: any = global;
  if (!g.__DB_INITIALIZED__) {
    await import("../src/migrations/migrate");
    await import("../src/migrations/seed");
    g.__DB_INITIALIZED__ = true;
  }
});

describe("Grade schemas and DB integration", () => {
  it("createGradeSchema validates correct data", () => {
    const valid = createGradeSchema.parse({
      studentId: 1,
      courseId: 1,
      grade: "A",
    });

    expect(valid).toEqual({
      studentId: 1,
      courseId: 1,
      grade: "A",
    });
  });

  it("createGradeSchema rejects invalid data", () => {
    // studentId must be a positive integer number
    expect(() =>
      createGradeSchema.parse({
        studentId: "not-a-number" as any,
        courseId: 1,
        grade: "A",
      })
    ).toThrow();

    // grade too long
    expect(() =>
      createGradeSchema.parse({
        studentId: 1,
        courseId: 1,
        grade: "TOO_LONG",
      })
    ).toThrow();
  });

  it("can insert and update a grade in the database using the schemas", () => {
    // Find any existing student and course
    const studentRow = db
      .prepare("SELECT id FROM users WHERE role = 'student' LIMIT 1")
      .get() as {id: number};
    const courseRow = db.prepare("SELECT id FROM courses LIMIT 1").get() as {id: number};

    expect(studentRow).toBeDefined();
    expect(courseRow).toBeDefined();

    const parsedCreate = createGradeSchema.parse({
      studentId: studentRow.id,
      courseId: courseRow.id,
      grade: "A",
    });

    // Insert grade
    const insertStmt = db.prepare(`
      INSERT INTO grades (student_id, course_id, grade, created_at)
      VALUES (?, ?, ?, datetime('now', 'localtime'))
    `);

    const info: any = insertStmt.run(
      parsedCreate.studentId,
      parsedCreate.courseId,
      parsedCreate.grade
    );

    const gradeId = Number(info.lastInsertRowid);
    expect(gradeId).toBeGreaterThan(0);

    // Update grade using updateGradeSchema
    const parsedUpdate = updateGradeSchema.parse({
      grade: "B",
    });

    const updateStmt = db.prepare(`
      UPDATE grades
      SET grade = @grade
      WHERE id = @id
    `);

    updateStmt.run({
      grade: parsedUpdate.grade,
      id: gradeId,
    });

    const row = db
      .prepare("SELECT grade FROM grades WHERE id = ?")
      .get(gradeId) as {grade: string};

    expect(row).toBeDefined();
    expect(row.grade).toBe("B");
  });
});
