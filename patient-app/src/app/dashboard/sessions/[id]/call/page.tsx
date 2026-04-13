import { fetchWithAuthContent } from "@/lib/api-server";
import { createClient } from "@/lib/supabase/server";
import { ArrowLeft, AlertCircle } from "lucide-react";
import Link from "next/link";
import VideoRoomWrapper from "@/components/VideoRoomWrapper";

export default async function PatientCallPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  
  // Get the current user's ID for the chat sidebar
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  // Fetch Agora Token from backend
  const data = await fetchWithAuthContent(`/sessions/${id}/token`);

  if (!data || !user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 animate-in fade-in duration-700">
        <div className="w-20 h-20 rounded-full bg-error/10 flex items-center justify-center text-error border border-error/20">
          <AlertCircle className="w-10 h-10" />
        </div>
        <div className="text-center">
          <h2 className="text-2xl font-heading font-medium text-foreground mb-2">Access Denied</h2>
          <p className="text-muted-foreground max-w-sm mx-auto mb-8 font-medium">
            You don't have permission to join this room, or the session has expired.
          </p>
          <Link href="/dashboard/sessions">
            <button className="bg-surface-container-low text-foreground border border-outline-variant/50 px-8 py-3 rounded-2xl font-bold uppercase tracking-widest text-xs hover:bg-surface transition-all">
              Back to Sessions
            </button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="h-[85vh] flex flex-col gap-6 animate-in fade-in duration-1000">
      <header className="flex items-center justify-between px-2">
        <div className="flex items-center gap-6">
          <Link 
            href="/dashboard/sessions" 
            className="w-12 h-12 rounded-2xl bg-surface-container-low flex items-center justify-center text-foreground/40 hover:text-primary hover:bg-primary/5 transition-all border border-outline-variant/30"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-heading font-medium text-foreground">
              Clinical Consultation
            </h1>
            <p className="text-xs uppercase font-bold tracking-[0.2em] text-primary/60">
              Live Session Room
            </p>
          </div>
        </div>
      </header>

      <div className="flex-1 min-h-0">
        <VideoRoomWrapper 
          appId={data.appId}
          channel={data.channel}
          token={data.token}
          uid={data.uid}
          appointmentId={id}
          currentUserId={user.id}
        />
      </div>
    </div>
  );
}
