import { fetchWithAuthContent } from "@/lib/api-server";
import PatientDetailView from "@/components/PatientDetailView";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Patient Details | Therapist App",
};

export default async function PatientPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const [patients, allSessions] = await Promise.all([
    fetchWithAuthContent("/therapists/my-patients"),
    fetchWithAuthContent("/sessions/all")
  ]);
  
  const roster = Array.isArray(patients) ? patients : [];
  const patient = roster.find((p: any) => p.id === resolvedParams.id);
  
  if (!patient) {
    return notFound();
  }

  const sessions = Array.isArray(allSessions) ? allSessions : [];
  const patientSessions = sessions.filter((s: any) => s.patientId === resolvedParams.id);

  return (
    <div className="py-4">
      <PatientDetailView patient={patient} sessions={patientSessions} currentUserId={user?.id || ""} />
    </div>
  );
}
