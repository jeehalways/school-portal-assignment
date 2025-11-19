import { z } from "zod";

export const createGradeSchema = z.object({
  studentId: z.number().int().positive(),
  course: z.string().min(1),
  grade: z.string().min(1).max(1), // A-F
});

export const gradeIdParamSchema = z.object({
  id: z.string().regex(/^\d+$/).transform(Number),
});

export type CreateGradeInput = z.infer<typeof createGradeSchema>;
