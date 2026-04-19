import { Calendar, Clock, User, ArrowRight, CheckCircle2, Video, Plus, Trash2, MessageSquare } from "lucide-react";
import Link from "next/link";
import { fetchWithAuthContent } from "@/lib/api-server";
import CancelSessionButton from "@/components/CancelSessionButton";

export default async function SessionsPage() {
  const sessions = await fetchWithAuthContent("/sessions/upcoming");
  const upcoming = Array.isArray(sessions) ? sessions : [];

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-heading font-medium text-foreground">
            My Sessions
          </h1>
          <p className="text-muted-foreground mt-2 text-lg">
            Track and join your scheduled consultations.
          </p>
        </div>
        <Link href="/dashboard/sessions/book">
          <button className="bg-primary text-primary-foreground px-4 md:px-8 py-4 rounded-2xl font-bold uppercase tracking-widest text-xs shadow-lg shadow-primary/20 hover:shadow-2xl hover:-translate-y-1 transition-all flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Book New Session
          </button>
        </Link>
      </header>

      <div className="grid grid-cols-1 gap-6">
        {upcoming.length === 0 ? (
          <div className="py-32 text-center bg-surface-container-low/30 rounded-2xl border border-outline-variant/30 px-6">
            <div className="w-20 h-20 bg-surface-container-lowest rounded-xl flex items-center justify-center mx-auto mb-6 text-primary/10">
              <Calendar className="w-10 h-10" />
            </div>
            <h3 className="text-2xl font-heading font-medium text-foreground mb-4">No sessions scheduled</h3>
            <p className="text-muted-foreground max-w-sm mx-auto mb-8">
              Take the first step towards your wellbeing by booking a session with one of our clinical experts.
            </p>
            <Link href="/dashboard/sessions/book" className="text-primary font-bold text-xs uppercase tracking-widest hover:underline">
               Explore Therapists
            </Link>
          </div>
        ) : (
          upcoming.map((session) => (
            <div key={session.id} className="bg-surface-container-lowest border border-outline-variant/30 rounded-xl p-4 md:p-8 flex flex-col md:flex-row items-center justify-between gap-8 hover:shadow-xl transition-all group border-l-4 border-l-primary/50">
              <div className="flex items-center gap-6">
                <div className="w-20 h-20 rounded-[2rem] bg-primary-container/20 flex items-center justify-center text-primary font-bold overflow-hidden">
                  <Video className="w-8 h-8" />
                </div>
                <div>
                  <h4 className="text-xl font-heading font-medium text-foreground mb-1">Dr. {session.therapist?.firstName} {session.therapist?.lastName}</h4>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground font-medium">
                    <span className="flex items-center gap-1.5"><Calendar className="w-4 h-4 opacity-40" /> {new Date(session.scheduledAt).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}</span>
                    <span className="flex items-center gap-1.5"><Clock className="w-4 h-4 opacity-40" /> {new Date(session.scheduledAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</span>
                    <span className={`lg:hidden px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest ${
                      session.status === 'CONFIRMED' ? 'bg-green-100 text-green-700' :
                      session.status === 'PENDING' ? 'bg-amber-100 text-amber-700' :
                      session.status === 'CANCELLED' ? 'bg-red-100 text-red-700' :
                      session.status === 'COMPLETED' ? 'bg-blue-100 text-blue-700' :
                      'bg-primary/10 text-primary'
                    }`}>
                      {session.status}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                  <div className="hidden lg:flex flex-col items-end mr-6">
                    <span className="text-xs font-bold uppercase tracking-widest text-primary/40 block mb-1">Status</span>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest ${
                      session.status === 'CONFIRMED' ? 'bg-green-100 text-green-700' :
                      session.status === 'PENDING' ? 'bg-amber-100 text-amber-700' :
                      session.status === 'CANCELLED' ? 'bg-red-100 text-red-700' :
                      session.status === 'COMPLETED' ? 'bg-blue-100 text-blue-700' :
                      'bg-primary/10 text-primary'
                    }`}>
                      {session.status}
                    </span>
                  </div>
                  {(session.status === 'PENDING' || session.status === 'CONFIRMED') && (
                    <CancelSessionButton id={session.id} />
                  )}
                  <div className="flex items-center gap-3">
                    <Link href={`/dashboard/messages?sessionId=${session.id}`}>
                      <button className="bg-primary/5 text-primary border border-primary/20 px-4 md:px-6 py-4 rounded-2xl font-bold uppercase tracking-widest text-xs hover:bg-primary/10 transition-all flex items-center gap-2">
                        <MessageSquare className="w-4 h-4" />
                        Chat
                      </button>
                    </Link>
                    <Link href={`/dashboard/sessions/${session.id}/call`}>
                      <button className="bg-foreground text-surface px-5 md:px-10 py-4 rounded-2xl font-bold uppercase tracking-widest text-xs shadow-lg hover:bg-primary transition-all">
                        Join Call
                      </button>
                    </Link>
                  </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
