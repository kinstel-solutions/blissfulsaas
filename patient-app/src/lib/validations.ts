import * as z from "zod";

export const patientIntakeSchema = z.object({
  reasonForSeeking: z.string().min(10, "Please provide a bit more detail (at least 10 characters)"),
  primaryConcerns: z.array(z.string()).min(1, "Please select at least one concern"),
  mentalHealthHistory: z.string().optional().or(z.literal("")),
  currentMedications: z.string().optional().or(z.literal("")),
  previousTherapy: z.boolean({
    required_error: "Please select an option",
    invalid_type_error: "Please select an option",
  }),
  therapyGoals: z.string().min(10, "Please provide a bit more detail about your goals"),
  emergencyContactName: z.string().min(2, "Emergency contact name is required"),
  emergencyContactPhone: z.string().min(10, "Valid emergency contact phone is required"),
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
