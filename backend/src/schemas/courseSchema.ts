import { z } from "zod";

export const createCourseSchema = z.object({
  name: z.string().min(1, "Course name required"),
  year: z.number().int().positive().min(1).max(3),
});

export const updateCourseSchema = z.object({
  name: z.string().min(1).optional(),
  year: z.number().int().positive().min(1).max(3).optional(),
});

export const courseIdParamSchema = z.object({
  id: z.string().regex(/^\d+$/).transform(Number),
});

export type CreateCourseInput = z.infer<typeof createCourseSchema>;
export type UpdateCourseInput = z.infer<typeof updateCourseSchema>;
