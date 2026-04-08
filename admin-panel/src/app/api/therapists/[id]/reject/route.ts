import { createAdminClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createAdminClient();

  // First get the therapist to find the userId
  const { data: therapist } = await supabase
    .from("Therapist")
    .select("userId")
    .eq("id", id)
    .single();

  if (therapist) {
    // We delete the Therapist profile
    const { error: profileError } = await supabase
      .from("Therapist")
      .delete()
      .eq("id", id);

    if (profileError) {
      return NextResponse.json({ error: profileError.message }, { status: 500 });
    }
  }

  return NextResponse.json({ success: true });
}
