"use server";

import { createClient, createAdminClient } from "@/lib/supabase/server";

export async function signUpTherapist(formData: any) {
  const { email, password, firstName, lastName } = formData;
  
  const supabase = await createClient();
  const adminClient = await createAdminClient();

  // 1. Sign up the user
  const { data: authData, error: signupError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        first_name: firstName,
        last_name: lastName,
        role: "THERAPIST"
      }
    }
  });

  if (signupError) return { error: signupError.message };
  if (!authData.user) return { error: "Signup failed - no user returned" };

  // 2. Create the Therapist profile using the ADMIN client (bypasses RLS)
  const { error: profileError } = await adminClient
    .from("Therapist")
    .insert({
      userId: authData.user.id,
      firstName,
      lastName,
      isVerified: false,
      hourlyRate: 0 // Therapists will need to set this in their profile
    });

  if (profileError) {
    console.error("Profile creation error:", profileError);
    return { error: "Created account, but failed to create profile. Admin will need to sync." };
  }

  return { success: true };
}
