import { ArrowLeft, Shield, AlertCircle } from "lucide-react";
import Link from "next/link";
import { fetchWithAuthContent } from "@/lib/api-server";
import { createClient } from "@/lib/supabase/server";
import VideoRoomWrapper from "@/components/VideoRoomWrapper";
import CompleteSessionButton from "@/components/CompleteSessionButton";
import { Button } from "@/components/ui/button";

export default async function SessionRoomPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  // Get current user ID for chat sidebar
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Fetch Agora token + patient name
  const tokenData = await fetchWithAuthContent(`/sessions/${id}/token`);
  const sessions = await fetchWithAuthContent("/sessions/upcoming");

  if (!tokenData || !user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 animate-in fade-in duration-700">
        <div className="w-20 h-20 rounded-full bg-red-100 flex items-center justify-center text-red-600 border border-red-200">
          <AlertCircle className="w-10 h-10" />
        </div>
        <div className="text-center">
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Access Denied</h2>
          <p className="text-slate-500 max-w-sm mx-auto mb-8 font-medium">
            You don't have permission to join this room, or the session has expired.
          </p>
          <Link href="/dashboard/appointments">
            <Button variant="ghost" className="bg-slate-100 text-slate-900 border border-slate-200 px-4 md:px-8 py-3 rounded-lg font-bold uppercase tracking-widest text-xs hover:bg-white transition-all h-auto">
              Back to Appointments
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const currentSession = Array.isArray(sessions) ? sessions.find((s: any) => s.id === id) : null;
  const patientDisplayName = currentSession
    ? `${currentSession.patient?.firstName} ${currentSession.patient?.lastName}`
    : "Patient Session";

  return (
    <div className="h-full lg:h-[calc(100vh-120px)] flex flex-col gap-4 lg:gap-6">
      <header className="flex justify-between items-center bg-white/70 backdrop-blur-xl p-3 md:p-4 rounded-2xl z-10 border border-slate-100 shadow-sm mx-1">
        <div className="flex items-center gap-4 md:gap-8">
          <Link
            href="/dashboard"
            className="group flex items-center gap-2 text-[10px] md:text-xs font-bold uppercase tracking-widest text-slate-400 hover:text-primary transition-colors pl-2 md:pl-4">
            <ArrowLeft className="w-3 h-3 md:w-3.5 md:h-3.5 group-hover:-translate-x-1 transition-transform" />
            Dashboard
          </Link>
        </div>
        <div className="pr-2 md:pr-4">
          <CompleteSessionButton appointmentId={id} />
        </div>
      </header>

      <div className="flex justify-end items-center gap-1.5 px-6 -mt-2 lg:-mt-3">
        <div className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-red-500 animate-pulse" />
        <p className="text-[8px] md:text-[10px] font-bold uppercase tracking-widest text-slate-400">
          Private & Encrypted Session
        </p>
      </div>

      <div className="flex-1">
        <VideoRoomWrapper
          appId={tokenData.appId}
          channel={tokenData.channel}
          token={tokenData.token}
          uid={tokenData.uid}
          appointmentId={id}
          patientName={patientDisplayName}
          currentUserId={user.id}
        />
      </div>
    </div>
  );
}
