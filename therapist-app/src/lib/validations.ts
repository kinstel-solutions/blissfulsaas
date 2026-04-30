import * as z from "zod";

export const therapistProfileSchema = z.object({
  firstName: z.string().min(2, "First name must be at least 2 characters"),
  lastName: z.string().min(2, "Last name must be at least 2 characters"),
  phone: z.string().optional().or(z.literal("")),
  bio: z.string().max(2000, "Bio must be less than 2000 characters").optional().or(z.literal("")),
  qualifications: z.string().optional().or(z.literal("")),
  yearsOfExperience: z.coerce.number().min(0, "Years of experience cannot be negative"),
  hourlyRate: z.coerce.number().min(0, "Hourly rate cannot be negative"),
  specialities: z.array(z.string()).default([]),
  languages: z.array(z.string()).default([]),
  videoUrl: z.string().url("Invalid video URL").optional().or(z.literal("")),
  clinicAddress: z.string().optional().or(z.literal("")),
  profileImageUrl: z.string().url("Invalid profile image URL").optional().or(z.literal("")),
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

export const availabilitySchema = z.object({
  dayOfWeek: z.number().min(0).max(6),
  startTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Invalid start time"),
  endTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Invalid end time"),
  mode: z.enum(["ONLINE", "IN_CLINIC", "BOTH"]),
}).refine((data) => {
  const [startH, startM] = data.startTime.split(":").map(Number);
  const [endH, endM] = data.endTime.split(":").map(Number);
  return (endH * 60 + endM) > (startH * 60 + startM);
}, {
  message: "End time must be after start time",
  path: ["endTime"],
});

export type LoginValues = z.infer<typeof loginSchema>;
export type SignupValues = z.infer<typeof signupSchema>;
export type TherapistProfileValues = z.infer<typeof therapistProfileSchema>;
export type AvailabilityValues = z.infer<typeof availabilitySchema>;
