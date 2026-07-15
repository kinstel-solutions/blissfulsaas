import * as z from "zod";

export const patientIntakeSchema = z.object({
  fullName: z.string().min(2, "Full name is required"),
  age: z.string().min(1, "Age is required"),
  pronouns: z.string().optional().or(z.literal("")),
  city: z.string().optional().or(z.literal("")),
  reasonForSeeking: z.string().min(10, "Please provide a bit more detail (at least 10 characters)"),
  mentalHealthHistory: z.string().optional().or(z.literal("")),
  currentMedications: z.string().optional().or(z.literal("")),
  emergencyContactName: z.string().optional().or(z.literal("")),
  emergencyContactPhone: z.string().optional().or(z.literal("")),
  consent: z.literal(true, { message: "You must consent to proceed" }),
});

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const signupSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string(),
  firstName: z.string().min(2, "First name is required"),
  lastName: z.string().min(2, "Last name is required"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export type LoginValues = z.infer<typeof loginSchema>;
export type SignupValues = z.infer<typeof signupSchema>;
export type PatientIntakeValues = z.infer<typeof patientIntakeSchema>;
