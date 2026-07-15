import { fetchWithAuthContent } from "@/lib/api-server";
import { createClient } from "@/lib/supabase/server";
import MessageHistoryClient from "@/components/MessageHistoryClient";

export default async function MessagesPage() {
  const sessions = await fetchWithAuthContent("/sessions/all");
  const conversations = Array.isArray(sessions) ? sessions : [];
  
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <div className="flex flex-col gap-0 md:gap-10 animate-in fade-in duration-700 absolute inset-y-0 left-1 right-1 md:relative md:inset-auto md:h-[calc(100vh-10rem)] z-10 md:z-auto bg-surface md:bg-transparent">
      <header className="hidden md:block text-center md:text-left">
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900 leading-none">
          Message History
        </h1>
        <p className="text-slate-500 mt-2 text-sm">
          Review your consultation history and previous chats with patients.
        </p>
      </header>

      <div className="flex-1 min-h-0 flex flex-col">
        <MessageHistoryClient 
          initialSessions={conversations} 
          currentUserId={user?.id || ""} 
          mode="therapist"
        />
      </div>
    </div>
  );
}
