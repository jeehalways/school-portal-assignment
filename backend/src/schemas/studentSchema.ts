import { z } from "zod";

export const createStudentSchema = z.object({
  firebaseUid: z.string().min(1),
  email: z.string().email(),
  name: z.string().min(1),
  role: z.enum(["student", "admin"]).optional().default("student"),
  year: z.number().int().min(1).max(3).optional().nullable(),
  phone: z.string().optional().nullable(),
  address: z.string().optional().nullable(),
});

export const updateStudentSchema = z.object({
  name: z.string().min(1).optional(),
  email: z.string().email().optional(),
  year: z.number().int().min(1).max(3).optional().nullable(),
  phone: z.string().optional().nullable(),
  address: z.string().optional().nullable(),
  role: z.enum(["student", "admin"]).optional(),
});

export const studentIdParamSchema = z.object({
  id: z.string().regex(/^\d+$/).transform(Number),
});

export type CreateStudentInput = z.infer<typeof createStudentSchema>;
export type UpdateStudentInput = z.infer<typeof updateStudentSchema>;
export type StudentIdParam = z.infer<typeof studentIdParamSchema>;
