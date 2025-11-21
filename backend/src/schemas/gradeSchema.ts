import { z } from "zod";

export const createGradeSchema = z.object({
  studentId: z.number().int().positive(),
  courseId: z.number().int().positive(),
  grade: z.string().min(1).max(2), // A–F
});

export const updateGradeSchema = z.object({
  grade: z.string().min(1).max(2).optional(),
});

export const gradeIdParamSchema = z.object({
  id: z.string().regex(/^\d+$/).transform(Number),
});

export type CreateGradeInput = z.infer<typeof createGradeSchema>;
export type UpdateGradeInput = z.infer<typeof updateGradeSchema>;
