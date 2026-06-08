import { fetchWithAuthContent } from "@/lib/api-server";
import {
  Calendar,
  Clock,
  Video,
  MessageSquare,
  Building2,
  MapPin,
  ChevronLeft,
  ChevronDown,
  GraduationCap,
  Globe,
  User,
  Activity,
  RefreshCw,
  Star,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import CancelSessionButton from "@/components/CancelSessionButton";
import SessionFeedbackButton from "@/components/SessionFeedbackButton";
import JoinCallButton from "@/components/JoinCallButton";
import { AlexButton } from "@/components/ui/AlexButton";

export default async function SessionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await fetchWithAuthContent(`/sessions/${id}`);

  if (!session || session.error) {
    notFound();
  }

  const therapist = session.therapist;
  const scheduledAt = new Date(session.scheduledAt);
  const isOnline = session.mode === "ONLINE";
  const isClinic = session.mode === "IN_CLINIC";
  const isUpcoming =
    session.status === "PENDING" || session.status === "CONFIRMED";
  const isCompleted = session.status === "COMPLETED";
  const isCancelled =
    session.status === "CANCELLED" ||
    session.status === "NO_SHOW" ||
    session.status === "EXPIRED";

  const dateStr = scheduledAt.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
  const timeStr = scheduledAt.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });
  const shortDate = scheduledAt.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  const profileImage =
    therapist?.profileImageUrl ||
    `https://ui-avatars.com/api/?name=${therapist?.firstName}+${therapist?.lastName}&background=E8F0EE&color=214D3E&size=256&bold=true`;

  let displayStatus = session.status;
  const now = new Date();
  const sessionEndTime = new Date(scheduledAt.getTime() + session.duration * 60000);
  if (session.status === "CONFIRMED" && now >= scheduledAt && now < sessionEndTime) {
    displayStatus = "ACTIVE";
  }

  const statusConfig: Record<
    string,
    { bg: string; text: string; label: string }
  > = {
    CONFIRMED: {
      bg: "bg-emerald-50 border-emerald-200",
      text: "text-emerald-700",
      label: "Confirmed",
    },
    ACTIVE: {
      bg: "bg-blue-50 border-blue-200",
      text: "text-blue-700",
      label: "Active Now",
    },
    PENDING: {
      bg: "bg-amber-50 border-amber-200",
      text: "text-amber-700",
      label: "Pending Confirmation",
    },
    COMPLETED: {
      bg: "bg-blue-50 border-blue-200",
      text: "text-blue-700",
      label: "Completed",
    },
    CANCELLED: {
      bg: "bg-red-50 border-red-200",
      text: "text-red-600",
      label: "Cancelled",
    },
    NO_SHOW: {
      bg: "bg-slate-50 border-slate-200",
      text: "text-slate-500",
      label: "No Show",
    },
    EXPIRED: {
      bg: "bg-slate-50 border-slate-200",
      text: "text-slate-400",
      label: "Expired",
    },
  };

  const status = statusConfig[displayStatus] || statusConfig.PENDING;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* ── Back Navigation ──────────────────────────────────────── */}
      <Link
        href="/dashboard/sessions"
        className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors group w-fit"
      >
        <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
        <span className="text-[10px] lg:text-xs font-bold uppercase tracking-[0.15em] lg:tracking-widest">
          My Sessions
        </span>
      </Link>

      {/* ── Status Banner ────────────────────────────────────────── */}
      <div
        className={`flex items-center gap-3 px-5 py-3.5 rounded-2xl border ${status.bg}`}
      >
        <div
          className={`w-2.5 h-2.5 rounded-full ${
            displayStatus === "ACTIVE"
              ? "bg-blue-500 animate-pulse"
              : isUpcoming
              ? "bg-emerald-500 animate-pulse"
              : isCompleted
                ? "bg-blue-500"
                : "bg-slate-400"
          }`}
        />
        <span
          className={`text-xs font-bold uppercase tracking-[0.15em] ${status.text}`}
        >
          {status.label}
        </span>
        <span className="text-xs text-muted-foreground/50 ml-auto font-medium">
          {isOnline ? "Online Session" : "In-Clinic Visit"}
        </span>
      </div>

      {/* ── Main Content Grid ────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* ──── Left Column: Therapist Info ────────────────────── */}
        <div className="lg:col-span-5 space-y-6">
          {/* Therapist Hero Card */}
          <details className="bg-surface-container-lowest border border-outline-variant/30 rounded-3xl overflow-hidden shadow-lg shadow-primary/5 group">
            {/* Profile Header */}
            <summary className="relative p-6 cursor-pointer list-none [&::-webkit-details-marker]:hidden flex justify-between items-start">
              <div className="flex items-start gap-5">
                <div className="relative w-20 h-20 lg:w-24 lg:h-24 rounded-2xl overflow-hidden border-2 border-primary/10 shadow-xl shadow-primary/10 shrink-0">
                  <Image
                    src={profileImage}
                    alt={`Dr. ${therapist?.firstName} ${therapist?.lastName}`}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0 pt-1">
                  <h1 className="text-xl lg:text-2xl font-heading font-medium text-foreground truncate">
                    Dr. {therapist?.firstName} {therapist?.lastName}
                  </h1>
                  <p className="text-xs font-bold uppercase tracking-widest text-primary/60 mt-1">
                    {therapist?.qualifications ||
                      therapist?.specialities?.[0] ||
                      "Clinical Psychotherapist"}
                  </p>
                  {therapist?.gender && (
                    <div className="flex items-center gap-1.5 mt-2">
                      <User className="w-3 h-3 text-muted-foreground/40" />
                      <span className="text-xs text-muted-foreground font-medium capitalize">
                        {therapist.gender}
                      </span>
                    </div>
                  )}
                </div>
              </div>
              <div className="text-primary/40 group-open:rotate-180 transition-transform mt-2 shrink-0">
                <ChevronDown className="w-5 h-5" />
              </div>
            </summary>

            {/* Info Grid */}
            <div className="p-6 pt-4 space-y-4 border-t border-outline-variant/10">
              {/* Experience */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3.5 bg-surface-container-low/50 rounded-xl border border-outline-variant/10">
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <Clock className="w-3 h-3 text-primary/40" />
                    <span className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground/40">
                      Experience
                    </span>
                  </div>
                  <p className="text-sm font-bold text-primary tracking-tight">
                    {therapist?.yearsOfExperience
                      ? `${therapist.yearsOfExperience} Years`
                      : "Experienced"}
                  </p>
                </div>
                <div className="p-3.5 bg-surface-container-low/50 rounded-xl border border-outline-variant/10">
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <Globe className="w-3 h-3 text-primary/40" />
                    <span className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground/40">
                      Languages
                    </span>
                  </div>
                  <p className="text-sm font-bold text-foreground tracking-tight truncate">
                    {therapist?.languages?.length > 0
                      ? therapist.languages.join(", ")
                      : "English"}
                  </p>
                </div>
              </div>

              {/* Qualifications */}
              {therapist?.qualifications && (
                <div className="p-3.5 bg-surface-container-low/50 rounded-xl border border-outline-variant/10">
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <GraduationCap className="w-3 h-3 text-primary/40" />
                    <span className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground/40">
                      Qualifications
                    </span>
                  </div>
                  <p className="text-sm font-medium text-foreground tracking-tight leading-relaxed">
                    {therapist.qualifications}
                  </p>
                </div>
              )}

              {/* Specializations */}
              {therapist?.specialities?.length > 0 && (
                <div>
                  <p className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground/40 mb-2.5 px-1">
                    Specializations
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {therapist.specialities.map((tag: string) => (
                      <span
                        key={tag}
                        className="px-3 py-1.5 bg-primary/5 text-primary text-[10px] font-bold tracking-tight rounded-lg border border-primary/10"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* View Full Profile Link */}
            <div className="px-6 pb-5">
              <Link
                href={`/therapist/${therapist?.id}`}
                className="text-[10px] font-bold uppercase tracking-widest text-primary/50 hover:text-primary transition-colors"
              >
                View Full Profile →
              </Link>
            </div>
          </details>
        </div>

        {/* ──── Right Column: Appointment Details + CTAs ──────── */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          {/* Appointment Details Card */}
          <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-3xl overflow-hidden shadow-lg shadow-primary/5 order-2">
            <div className="p-5 lg:p-6 bg-surface-container-low/30 border-b border-outline-variant/10">
              <h2 className="text-xs font-bold text-foreground uppercase tracking-widest flex items-center gap-2">
                <Activity className="w-3.5 h-3.5 text-primary" />
                Appointment Details
              </h2>
            </div>

            <div className="p-5 lg:p-6 space-y-5">
              {/* Date & Time Row */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                    <Calendar className="w-4.5 h-4.5 text-primary" />
                  </div>
                  <div>
                    <p className="text-[9px] font-bold text-muted-foreground/40 uppercase tracking-widest">
                      Date
                    </p>
                    <p className="text-sm font-semibold text-foreground">
                      {shortDate}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                    <Clock className="w-4.5 h-4.5 text-primary" />
                  </div>
                  <div>
                    <p className="text-[9px] font-bold text-muted-foreground/40 uppercase tracking-widest">
                      Time
                    </p>
                    <p className="text-sm font-semibold text-foreground">
                      {timeStr}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-violet-100/50 flex items-center justify-center shrink-0">
                    <Activity className="w-4.5 h-4.5 text-violet-600" />
                  </div>
                  <div>
                    <p className="text-[9px] font-bold text-muted-foreground/40 uppercase tracking-widest">
                      Duration
                    </p>
                    <p className="text-sm font-semibold text-foreground">
                      {session.duration} Min
                    </p>
                  </div>
                </div>
              </div>

              {/* Full Date */}
              <div className="px-4 py-3 bg-primary/5 rounded-xl border border-primary/10">
                <p className="text-sm text-primary font-medium">{dateStr}</p>
              </div>

              {/* Mode & Location */}
              <div
                className={`flex items-start gap-3 p-4 rounded-2xl border ${
                  isClinic
                    ? "bg-primary/5 border-primary/15"
                    : "bg-primary/5 border-primary/10"
                }`}
              >
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                    isClinic
                      ? "bg-primary/10 text-primary"
                      : "bg-primary/10 text-primary"
                  }`}
                >
                  {isClinic ? (
                    <Building2 className="w-5 h-5" />
                  ) : (
                    <Video className="w-5 h-5" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold uppercase tracking-widest text-primary/70 mb-0.5">
                    {isClinic ? "In-Clinic Visit" : "Online Video Consultation"}
                  </p>
                  {isClinic && therapist?.clinicAddress && (
                    <div className="mt-2 flex items-start gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-primary/50 flex-shrink-0 mt-0.5" />
                      {therapist.mapLink ? (
                        <a
                          href={therapist.mapLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-foreground font-medium hover:text-primary hover:underline transition-colors"
                        >
                          {therapist.clinicAddress}
                          <span className="ml-2 text-[8px] bg-primary/10 text-primary px-1.5 py-0.5 rounded uppercase font-bold tracking-widest">
                            Open Map
                          </span>
                        </a>
                      ) : (
                        <span className="text-sm text-foreground font-medium">
                          {therapist.clinicAddress}
                        </span>
                      )}
                    </div>
                  )}
                  {isOnline && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Join from anywhere via secure video call
                    </p>
                  )}
                </div>
              </div>

              {/* Payment Info */}
              {session.amountPaid && (
                <div className="flex items-center justify-between px-4 py-3 bg-surface-container-low/50 rounded-xl border border-outline-variant/10">
                  <span className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground/40">
                    Session Fee
                  </span>
                  <span className="text-lg font-heading font-medium text-primary">
                    ₹{session.amountPaid.toLocaleString("en-IN")}
                  </span>
                </div>
              )}

              {/* Feedback (for completed) */}
              {isCompleted && session.feedback && (
                <div className="p-4 bg-amber-50/50 rounded-2xl border border-amber-100/50">
                  <p className="text-[9px] font-bold uppercase tracking-widest text-amber-600/60 mb-2">
                    Your Rating
                  </p>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-0.5">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`w-4 h-4 ${
                            star <= session.feedback.rating
                              ? "fill-yellow-400 text-yellow-400"
                              : "text-neutral-200"
                          }`}
                        />
                      ))}
                    </div>
                    {session.feedback.comment && (
                      <span className="text-xs text-muted-foreground italic ml-2 truncate">
                        &ldquo;{session.feedback.comment}&rdquo;
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* ── BIG CTAs ──────────────────────────────────────────── */}
          <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-3xl overflow-hidden shadow-lg shadow-primary/5 order-1">
            <div className="p-5 lg:p-6 bg-surface-container-low/30 border-b border-outline-variant/10">
              <h2 className="text-xs font-bold text-foreground uppercase tracking-widest">
                Quick Actions
              </h2>
            </div>

            <div className="p-5 lg:p-6 space-y-4">
              {/* ─── Upcoming Session CTAs ───────────────────────── */}
              {isUpcoming && (
                <>
                  {/* Primary CTA: Join Call or In-Person Badge */}
                  {isOnline ? (
                    <div className="w-full">
                      <JoinCallButton
                        sessionId={session.id}
                        scheduledAt={session.scheduledAt}
                      />
                    </div>
                  ) : (
                    <div className="flex items-center gap-3 w-full px-6 py-5 bg-primary/5 text-primary rounded-2xl border border-primary/15 font-bold">
                      <Building2 className="w-6 h-6" />
                      <div>
                        <p className="text-sm font-bold uppercase tracking-widest">
                          In-Person Visit
                        </p>
                        {therapist?.clinicAddress && (
                          <p className="text-xs font-medium text-primary/70 mt-0.5">
                            {therapist.clinicAddress}
                          </p>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Secondary CTA: Message Therapist */}
                  <Link
                    href={`/dashboard/messages?sessionId=${session.id}`}
                    className="flex items-center justify-center gap-3 w-full px-6 py-4.5 bg-surface-container-low hover:bg-surface-container-low/70 text-foreground rounded-2xl border border-outline-variant/30 hover:border-primary/30 font-bold uppercase tracking-widest text-xs transition-all group"
                  >
                    <MessageSquare className="w-5 h-5 text-primary group-hover:scale-110 transition-transform" />
                    <span>Message Therapist</span>
                  </Link>

                  {/* Destructive: Cancel Session */}
                  <div className="pt-2 border-t border-outline-variant/10">
                    <div className="flex justify-center">
                      <CancelSessionButton id={session.id} />
                    </div>
                  </div>
                </>
              )}

              {/* ─── Completed Session CTAs ──────────────────────── */}
              {isCompleted && (
                <>
                  {/* Feedback CTA */}
                  <div className="w-full">
                    <SessionFeedbackButton session={session} />
                  </div>

                  {/* Message Therapist */}
                  <Link
                    href={`/dashboard/messages?sessionId=${session.id}`}
                    className="flex items-center justify-center gap-3 w-full px-6 py-4.5 bg-surface-container-low hover:bg-surface-container-low/70 text-foreground rounded-2xl border border-outline-variant/30 hover:border-primary/30 font-bold uppercase tracking-widest text-xs transition-all group"
                  >
                    <MessageSquare className="w-5 h-5 text-primary group-hover:scale-110 transition-transform" />
                    <span>Message Therapist</span>
                  </Link>

                  {/* Book Again */}
                  <Link
                    href={`/dashboard/sessions/book/${therapist?.id}`}
                    className="flex items-center justify-center gap-3 w-full px-6 py-4.5 bg-primary text-primary-foreground rounded-2xl font-bold uppercase tracking-widest text-xs shadow-lg shadow-primary/20 hover:shadow-xl hover:-translate-y-0.5 transition-all active:scale-[0.98]"
                  >
                    <RefreshCw className="w-4.5 h-4.5" />
                    <span>Book Again with Dr. {therapist?.firstName}</span>
                  </Link>
                </>
              )}

              {/* ─── Cancelled / Expired CTAs ────────────────────── */}
              {isCancelled && (
                <>
                  <div className="text-center py-4">
                    <p className="text-sm text-muted-foreground mb-6">
                      This session was{" "}
                      {session.status === "EXPIRED" ? "expired" : "cancelled"}.
                      You can book a new session with the same therapist.
                    </p>
                  </div>

                  {/* Rebook */}
                  <Link
                    href={`/dashboard/sessions/book/${therapist?.id}`}
                    className="flex items-center justify-center gap-3 w-full px-6 py-5 bg-primary text-primary-foreground rounded-2xl font-bold uppercase tracking-widest text-xs shadow-lg shadow-primary/20 hover:shadow-xl hover:-translate-y-0.5 transition-all active:scale-[0.98]"
                  >
                    <RefreshCw className="w-4.5 h-4.5" />
                    <span>
                      Rebook with Dr. {therapist?.firstName}
                    </span>
                  </Link>

                  {/* Or discover */}
                  <div className="text-center">
                    <AlexButton href="/discover" size="sm">
                      Browse Other Therapists
                    </AlexButton>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
