import { Calendar, Clock, Video, Plus, MessageSquare, Building2, MapPin, Star } from "lucide-react";
import Link from "next/link";
import { fetchWithAuthContent } from "@/lib/api-server";
import CancelSessionButton from "@/components/CancelSessionButton";
import SessionFeedbackButton from "@/components/SessionFeedbackButton";

export default async function SessionsPage() {
  // Fetch ALL sessions (upcoming + past) so patients can review completed ones
  const sessions = await fetchWithAuthContent("/sessions/all");
  const allSessions = Array.isArray(sessions) ? sessions : [];

  const upcoming = allSessions.filter(
    (s) => s.status === "PENDING" || s.status === "CONFIRMED"
  );
  const completed = allSessions.filter((s) => s.status === "COMPLETED");
  const cancelled = allSessions.filter((s) => s.status === "CANCELLED" || s.status === "NO_SHOW");

  const SessionCard = ({ session }: { session: any }) => {
    const isClinic = session.mode === "IN_CLINIC";
    const clinicAddress = session.therapist?.clinicAddress;
    const isCompleted = session.status === "COMPLETED";
    const isCancelled = session.status === "CANCELLED" || session.status === "NO_SHOW";

    return (
      <div
        className={`bg-surface-container-lowest border border-outline-variant/30 rounded-xl p-4 md:p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 hover:shadow-lg transition-all group border-l-4 ${
          isCompleted
            ? "border-l-blue-400/50 bg-blue-50/10"
            : isCancelled
            ? "border-l-destructive/30 opacity-60"
            : isClinic
            ? "border-l-primary/50"
            : "border-l-primary/30"
        }`}
      >
        <div className="flex items-start gap-5">
          <div
            className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 ${
              isCompleted
                ? "bg-blue-50 text-blue-500"
                : isCancelled
                ? "bg-destructive/5 text-destructive/40"
                : isClinic
                ? "bg-primary/5 text-primary"
                : "bg-primary-container/20 text-primary"
            }`}
          >
            {isClinic ? <Building2 className="w-6 h-6" /> : <Video className="w-6 h-6" />}
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <h4 className="text-lg font-heading font-medium text-foreground">
                Dr. {session.therapist?.firstName} {session.therapist?.lastName}
              </h4>
              <span
                className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-widest border ${
                  isClinic
                    ? "bg-primary/5 text-primary border-primary/20"
                    : "bg-primary/5 text-primary border-primary/20"
                }`}
              >
                {isClinic ? "In-Clinic" : "Online"}
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-sm text-muted-foreground font-medium">
              <span className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 opacity-40" />
                {new Date(session.scheduledAt).toLocaleDateString("en-US", {
                  weekday: "long",
                  month: "short",
                  day: "numeric",
                })}
              </span>
              <span className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 opacity-40" />
                {new Date(session.scheduledAt).toLocaleTimeString("en-US", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </div>
            {isClinic && clinicAddress && (
              <div className="flex items-center gap-1.5 mt-1.5 text-xs text-primary/70 font-medium">
                <MapPin className="w-3 h-3 flex-shrink-0" />
                {clinicAddress}
              </div>
            )}
            {/* Existing feedback stars inline */}
            {isCompleted && session.feedback && (
              <div className="flex items-center gap-0.5 mt-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`w-3 h-3 ${
                      star <= session.feedback.rating
                        ? "fill-yellow-400 text-yellow-400"
                        : "text-outline-variant/30"
                    }`}
                  />
                ))}
                {session.feedback.comment && (
                  <span className="ml-2 text-xs text-muted-foreground italic truncate max-w-[200px]">
                    "{session.feedback.comment}"
                  </span>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 ml-0 md:ml-auto shrink-0">
          {/* Status badge */}
          <span
            className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${
              session.status === "CONFIRMED"
                ? "bg-primary/10 text-primary"
                : session.status === "PENDING"
                ? "bg-amber-100 text-amber-700"
                : session.status === "CANCELLED"
                ? "bg-red-100 text-red-700"
                : session.status === "COMPLETED"
                ? "bg-blue-100 text-blue-700"
                : "bg-primary/10 text-primary"
            }`}
          >
            {session.status}
          </span>

          {/* Active session actions */}
          {(session.status === "PENDING" || session.status === "CONFIRMED") && (
            <>
              <CancelSessionButton id={session.id} />
              <Link href={`/dashboard/messages?sessionId=${session.id}`}>
                <button className="bg-primary/5 text-primary border border-primary/20 px-4 py-3 rounded-2xl font-bold uppercase tracking-widest text-[10px] hover:bg-primary/10 transition-all flex items-center gap-1.5">
                  <MessageSquare className="w-3.5 h-3.5" />
                  Chat
                </button>
              </Link>
              {!isClinic ? (
                <Link href={`/dashboard/sessions/${session.id}/call`}>
                  <button className="bg-foreground text-surface px-5 py-3 rounded-2xl font-bold uppercase tracking-widest text-[10px] shadow-md hover:bg-primary transition-all">
                    Join Call
                  </button>
                </Link>
              ) : (
                <div className="px-4 py-3 rounded-2xl font-bold uppercase tracking-widest text-[10px] bg-primary/5 text-primary border border-primary/20 flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5" />
                  In-Person
                </div>
              )}
            </>
          )}

          {/* Completed: feedback button */}
          {isCompleted && (
            <SessionFeedbackButton session={session} />
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-heading font-medium text-foreground">My Sessions</h1>
          <p className="text-muted-foreground mt-2 text-lg">
            Track, join, and review your consultations.
          </p>
        </div>
        <Link href="/dashboard/sessions/book">
          <button className="bg-primary text-primary-foreground px-4 md:px-8 py-4 rounded-2xl font-bold uppercase tracking-widest text-xs shadow-lg shadow-primary/20 hover:shadow-2xl hover:-translate-y-1 transition-all flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Book New Session
          </button>
        </Link>
      </header>

      {allSessions.length === 0 ? (
        <div className="py-32 text-center bg-surface-container-low/30 rounded-2xl border border-outline-variant/30 px-6">
          <div className="w-20 h-20 bg-surface-container-lowest rounded-xl flex items-center justify-center mx-auto mb-6 text-primary/10">
            <Calendar className="w-10 h-10" />
          </div>
          <h3 className="text-2xl font-heading font-medium text-foreground mb-4">No sessions yet</h3>
          <p className="text-muted-foreground max-w-sm mx-auto mb-8">
            Take the first step towards your wellbeing by booking a session with one of our clinical experts.
          </p>
          <Link
            href="/dashboard/sessions/book"
            className="text-primary font-bold text-xs uppercase tracking-widest hover:underline"
          >
            Explore Therapists
          </Link>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Upcoming */}
          {upcoming.length > 0 && (
            <section>
              <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground/60 mb-4">
                Upcoming ({upcoming.length})
              </h2>
              <div className="grid grid-cols-1 gap-4">
                {upcoming.map((session) => (
                  <SessionCard key={session.id} session={session} />
                ))}
              </div>
            </section>
          )}

          {/* Completed */}
          {completed.length > 0 && (
            <section>
              <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground/60 mb-4 flex items-center gap-2">
                Completed ({completed.length})
                <span className="text-yellow-500 font-normal normal-case tracking-normal">— Rate to share your experience</span>
              </h2>
              <div className="grid grid-cols-1 gap-4">
                {completed.map((session) => (
                  <SessionCard key={session.id} session={session} />
                ))}
              </div>
            </section>
          )}

          {/* Cancelled */}
          {cancelled.length > 0 && (
            <section>
              <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground/60 mb-4">
                Cancelled ({cancelled.length})
              </h2>
              <div className="grid grid-cols-1 gap-4">
                {cancelled.map((session) => (
                  <SessionCard key={session.id} session={session} />
                ))}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  );
}
