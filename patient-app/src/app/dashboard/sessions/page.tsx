import { Calendar, Clock, Video, Building2, MapPin, Star, RefreshCw, ArrowRight } from "lucide-react";
import Link from "next/link";
import { fetchWithAuthContent } from "@/lib/api-server";
import SessionFeedbackButton from "@/components/SessionFeedbackButton";
import SessionCountdownLabel from "@/components/SessionCountdownLabel";
import { AlexButton } from "@/components/ui/AlexButton";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default async function SessionsPage() {
  // Fetch ALL sessions (upcoming + past) so patients can review completed ones
  const sessions = await fetchWithAuthContent("/sessions/all");
  const allSessions = Array.isArray(sessions) ? sessions : [];

  const upcoming = allSessions
    .filter((s) => s.status === "PENDING" || s.status === "CONFIRMED")
    .sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime());

  const completed = allSessions
    .filter((s) => s.status === "COMPLETED")
    .sort((a, b) => new Date(b.scheduledAt).getTime() - new Date(a.scheduledAt).getTime());

  const cancelled = allSessions
    .filter((s) => s.status === "CANCELLED" || s.status === "NO_SHOW" || s.status === "EXPIRED")
    .sort((a, b) => new Date(b.scheduledAt).getTime() - new Date(a.scheduledAt).getTime());

  const SessionCard = ({ session }: { session: any }) => {
    const isClinic = session.mode === "IN_CLINIC";
    const clinicAddress = session.therapist?.clinicAddress;
    const isCompleted = session.status === "COMPLETED";
    const isCancelled = session.status === "CANCELLED" || session.status === "NO_SHOW" || session.status === "EXPIRED";

    return (
      <Card
        className={`relative p-4 md:p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 transition-all border-l-4 group ${isCompleted
            ? "border-l-blue-400/50 bg-blue-50/10"
            : isCancelled
              ? "border-l-destructive/30 opacity-60"
              : isClinic
                ? "border-l-primary/50"
                : "border-l-primary/30"
          }`}
      >
        {/* Absolute link to make the entire card clickable */}
        <Link
          href={`/dashboard/sessions/${session.id}`}
          className="absolute inset-0 z-0"
        />

        <div className="flex items-start gap-5 relative z-10 pointer-events-none">
          <div
            className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-105 ${isCompleted
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
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <h4 className="text-lg font-heading font-medium text-foreground group-hover:text-primary transition-colors">
                  {session.therapist?.firstName} {session.therapist?.lastName}
                </h4>
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-widest border ${isClinic
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
                     timeZone: "Asia/Kolkata",
                  })}
                </span>
                <span className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 opacity-40" />
                  {new Date(session.scheduledAt).toLocaleTimeString("en-US", {
                    hour: "2-digit",
                    minute: "2-digit",
                    timeZone: "Asia/Kolkata",
                  })}
                </span>
              </div>
            </div>
            {isClinic && clinicAddress && (
              <div className="flex items-center gap-1.5 mt-1.5 text-xs text-primary/70 font-medium pointer-events-auto">
                <MapPin className="w-3 h-3 flex-shrink-0" />
                {session.therapist?.mapLink ? (
                  <a
                    href={session.therapist.mapLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:underline hover:text-primary flex items-center gap-1 font-bold"
                  >
                    {clinicAddress}
                    <span className="text-[8px] bg-primary/10 text-primary px-1.5 py-0.5 rounded uppercase font-bold tracking-widest ml-1">Open Map</span>
                  </a>
                ) : (
                  <span>{clinicAddress}</span>
                )}
              </div>
            )}
            {/* Existing feedback stars inline */}
            {isCompleted && session.feedback && (
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 mt-3 p-3 bg-neutral-50 rounded-xl border border-neutral-100/50 w-full sm:w-auto">
                <div className="flex items-center gap-0.5 shrink-0">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`w-3.5 h-3.5 ${star <= session.feedback.rating
                          ? "fill-yellow-400 text-yellow-400"
                          : "text-neutral-200"
                        }`}
                    />
                  ))}
                </div>
                {session.feedback.comment && (
                  <span className="text-xs text-muted-foreground italic break-words line-clamp-2 sm:line-clamp-none max-w-full sm:max-w-[400px]">
                    {`"${session.feedback.comment}"`}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto ml-0 md:ml-auto shrink-0 mt-4 md:mt-0 relative z-10">
          {/* Status badge */}
          <span
            className={`self-start sm:self-auto text-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${session.status === "CONFIRMED"
                ? "bg-primary/10 text-primary"
                : session.status === "PENDING"
                  ? "bg-amber-100 text-amber-700"
                  : session.status === "CANCELLED"
                    ? "bg-red-100 text-red-700"
                    : session.status === "COMPLETED"
                      ? "bg-blue-100 text-blue-700"
                      : session.status === "EXPIRED"
                        ? "bg-neutral-100 text-neutral-600"
                        : "bg-primary/10 text-primary"
              }`}
          >
            {session.status}
          </span>

          {/* Countdown label for upcoming sessions */}
          {(session.status === "PENDING" || session.status === "CONFIRMED") && (
            <SessionCountdownLabel scheduledAt={session.scheduledAt} />
          )}

          {/* Feedback badge for completed sessions */}
          {isCompleted && (
            <div className="w-full sm:w-auto">
              <SessionFeedbackButton session={session} fullWidth />
            </div>
          )}

          {/* Book Again for completed/cancelled */}
          {(isCompleted || isCancelled) && session.therapist?.id && (
            <Link href={`/dashboard/sessions/book/${session.therapist.id}`} className="w-full sm:w-auto pointer-events-auto">
              <Button className="w-full sm:w-auto sm:min-w-[160px] px-5 py-3 font-bold uppercase tracking-widest text-xs transition-all flex items-center justify-center gap-1.5 active:scale-[0.98] h-auto">
                <RefreshCw className="w-3.5 h-3.5" />
                Book Again
              </Button>
            </Link>
          )}

          {/* View Session button for upcoming */}
          {(session.status === "PENDING" || session.status === "CONFIRMED") && (
            <Link href={`/dashboard/sessions/${session.id}`} className="w-full sm:w-auto pointer-events-auto">
              <Button className="w-full sm:w-auto sm:min-w-[160px] px-5 py-3 font-bold uppercase tracking-widest text-xs transition-all flex items-center justify-center gap-1.5 active:scale-[0.98] h-auto">
                <ArrowRight className="w-3.5 h-3.5" />
                View Session
              </Button>
            </Link>
          )}
        </div>
      </Card>
    );
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      <header className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-4xl font-heading font-medium text-foreground">My Sessions</h1>
          <p className="text-muted-foreground mt-2 text-sm sm:text-lg">
            Track, join, and review your consultations.
          </p>
        </div>
        <div className="hidden sm:block shrink-0">
          <AlexButton href="/discover" size="md" className="shadow-lg">
            Book New Session
          </AlexButton>
        </div>
        <div className="sm:hidden shrink-0">
          <AlexButton href="/discover" size="sm" className="shadow-lg">
            Book New Session
          </AlexButton>
        </div>
      </header>

      {allSessions.length === 0 ? (
        <Card className="py-32 flex flex-col items-center justify-center text-center px-6">
          <div className="w-20 h-20 bg-surface-container-lowest rounded-xl flex items-center justify-center mx-auto mb-6 text-primary/10">
            <Calendar className="w-10 h-10" />
          </div>
          <h3 className="text-2xl font-heading font-medium text-foreground mb-4">No sessions yet</h3>
          <p className="text-muted-foreground max-w-sm mx-auto mb-8">
            Take the first step towards your wellbeing by booking a session with one of our clinical experts.
          </p>
          <Link
            href="/discover"
            className="text-primary font-bold text-xs uppercase tracking-widest hover:underline"
          >
            Explore Therapists
          </Link>
        </Card>
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
