import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ appointmentId: string }> }
) {
  const { appointmentId } = await params;
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();

  const res = await fetch(`${BACKEND_URL}/feedback/${appointmentId}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${session.access_token}`,
    },
    body: JSON.stringify(body),
  });

  const data = await res.json().catch(() => ({}));
  return NextResponse.json(data, { status: res.status });
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ appointmentId: string }> }
) {
  const { appointmentId } = await params;
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const res = await fetch(
    `${BACKEND_URL}/feedback/appointment/${appointmentId}`,
    {
      headers: { Authorization: `Bearer ${session.access_token}` },
      cache: "no-store",
    }
  );

  const data = await res.json().catch(() => null);
  return NextResponse.json(data, { status: res.ok ? 200 : res.status });
}
