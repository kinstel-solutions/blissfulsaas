import { api } from "@/lib/api-server";
import { createClient } from "@/lib/supabase/server";
import MessageHistoryClient from "@/components/MessageHistoryClient";

export default async function MessagesPage() {
  const sessions = await api.sessions.all();
  const conversations = Array.isArray(sessions) ? sessions : [];
  
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <div className="flex flex-col gap-0 md:gap-10 animate-in fade-in duration-700 absolute inset-y-0 left-1 right-1 md:relative md:inset-auto md:h-[calc(100vh-10rem)] z-10 md:z-auto bg-surface md:bg-transparent">
      <header className="hidden md:block text-center md:text-left">
        <h1 className="text-3xl md:text-4xl font-heading font-medium text-foreground leading-none">
          Clinical Messages
        </h1>
        <p className="text-muted-foreground mt-3 text-lg">
          Review your consultation history and previous chats with specialists.
        </p>
      </header>

      <div className="flex-1 min-h-0 flex flex-col">
        <MessageHistoryClient 
          initialSessions={conversations} 
          currentUserId={user?.id || ""} 
        />
      </div>
    </div>
  );
}
