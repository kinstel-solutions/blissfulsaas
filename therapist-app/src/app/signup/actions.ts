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

  // 1.2 Manually create the User record in the public schema
  // This ensures the foreign key exists for the Therapist profile
  const { error: userError } = await adminClient
    .from("User")
    .upsert({
      id: authData.user.id,
      email: authData.user.email,
      role: "THERAPIST",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });

  if (userError) {
    console.error("User sync error:", userError);
    return { error: "Created account, but failed to sync user record. Admin will need to sync." };
  }

  // 1.5 Auto-confirm the email using Admin Client (for immediate access)
  await adminClient.auth.admin.updateUserById(authData.user.id, {
    email_confirm: true
  });

  // 2. Create the Therapist profile using the ADMIN client (bypasses RLS)
  const { error: profileError } = await adminClient
    .from("Therapist")
    .upsert({
      userId: authData.user.id,
      firstName,
      lastName,
      isVerified: false,
      hourlyRate: 0 
    }, { onConflict: 'userId' });

  if (profileError) {
    console.error("Profile creation error:", profileError);
    return { error: "Created account, but failed to create profile. Admin will need to sync." };
  }

  // 3. Perform immediate login to establish session
  const { error: loginError } = await supabase.auth.signInWithPassword({
    email,
    password
  });

  if (loginError) {
    return { error: "Account created, but failed to auto-login: " + loginError.message };
  }

  return { success: true };
}
