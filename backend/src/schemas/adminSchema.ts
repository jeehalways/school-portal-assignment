import { z } from "zod";

export const adminIdParamSchema = z.object({
  id: z.string().regex(/^\d+$/).transform(Number),
});

export type AdminIdParam = z.infer<typeof adminIdParamSchema>;
