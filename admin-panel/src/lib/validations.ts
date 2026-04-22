import * as z from "zod";

export const adminLoginSchema = z.object({
  email: z.string().email("Invalid root email address"),
  password: z.string().min(6, "Security token must be at least 6 characters"),
});

export type AdminLoginValues = z.infer<typeof adminLoginSchema>;
