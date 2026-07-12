import { createClient } from "@/lib/supabase/server";
import { Calendar, ArrowRight, Shield, Star, Clock, Users, Activity } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { fetchWithAuthContent } from "@/lib/api-server";
import MiniCalendar from "@/components/MiniCalendar";
import { AlexButton } from "@/components/ui/AlexButton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

interface Session {
  id: string;
  status: string;
  patientId: string;
  scheduledAt: string;
  mode: string;
  patient?: {
    firstName: string;
    lastName: string;
  };
}

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();

  const firstName = data?.user?.user_metadata?.first_name || "Doctor";

  // Fetch real upcoming sessions from the backend
  const upcomingSessions = await fetchWithAuthContent("/sessions/upcoming") as Session[];

  // Fetch all sessions for filtering and insights
  const allSessions = await fetchWithAuthContent("/sessions/all") as Session[];
  const pendingSessions = Array.isArray(allSessions)
    ? allSessions.filter((s: Session) => s.status === 'PENDING')
    : [];

  // Calculate insights
  const completedSessionsCount = Array.isArray(allSessions)
    ? allSessions.filter((s: Session) => s.status === 'COMPLETED').length
    : 0;
  const uniquePatients = Array.isArray(allSessions)
    ? Array.from(new Set(allSessions.map((s: Session) => s.patientId)))
    : [];

  const uniquePatientsCount = uniquePatients.length;

  let activeCount = 0;
  let pendingCount = 0;
  let completedCount = 0;
  let cancelledCount = 0;

  if (Array.isArray(allSessions)) {
    uniquePatients.forEach((patientId) => {
      const patientSessions = allSessions.filter((s: Session) => s.patientId === patientId);
      const hasConfirmed = patientSessions.some((s: Session) => s.status === 'CONFIRMED');
      const hasPending = patientSessions.some((s: Session) => s.status === 'PENDING');
      const hasCompleted = patientSessions.some((s: Session) => s.status === 'COMPLETED');

      if (hasConfirmed) {
        activeCount++;
      } else if (hasPending) {
        pendingCount++;
      } else if (hasCompleted) {
        completedCount++;
      } else {
        cancelledCount++;
      }
    });
  }

  // Strictly dynamic client statuses based on real database entries:
  const finalActiveCount = activeCount;
  const finalPendingCount = pendingCount;
  const finalCompletedCount = completedCount;
  const finalCancelledCount = cancelledCount;
  const totalCount = finalActiveCount + finalPendingCount + finalCompletedCount + finalCancelledCount;

  const activePct = totalCount > 0 ? (finalActiveCount / totalCount) * 100 : 0;
  const pendingPct = totalCount > 0 ? (finalPendingCount / totalCount) * 100 : 0;
  const completedPct = totalCount > 0 ? (finalCompletedCount / totalCount) * 100 : 0;

  const seg1 = activePct;
  const seg2 = seg1 + pendingPct;
  const seg3 = seg2 + completedPct;

  // Calculate Today's Sessions count (sessions scheduled for today in Asia/Kolkata timezone, excluding cancelled)
  const todayKolkata = new Date().toLocaleDateString('en-US', { timeZone: 'Asia/Kolkata' });
  const todaysSessionsCount = Array.isArray(allSessions)
    ? allSessions.filter((s: Session) => {
      if (s.status === 'CANCELLED') return false;
      const sessionDateKolkata = new Date(s.scheduledAt).toLocaleDateString('en-US', { timeZone: 'Asia/Kolkata' });
      return sessionDateKolkata === todayKolkata;
    }).length
    : 0;

  // Calculate dynamic follow-ups count (patients with more than 1 session history):
  const followUpsCount = Array.isArray(allSessions)
    ? Array.from(new Set(allSessions.map((s: Session) => s.patientId))).filter((patientId) => {
      const patientSessions = allSessions.filter((s: Session) => s.patientId === patientId);
      return patientSessions.length > 1;
    }).length
    : 0;

  // Calculate dynamic new clients count (patients with exactly 1 session history):
  const newClientsCount = Array.isArray(allSessions)
    ? Array.from(new Set(allSessions.map((s: Session) => s.patientId))).filter((patientId) => {
      const patientSessions = allSessions.filter((s: Session) => s.patientId === patientId);
      return patientSessions.length === 1;
    }).length
    : 0;

  // Filter out cancelled sessions for the calendar
  const calendarSessions = Array.isArray(allSessions)
    ? allSessions.filter((s: Session) => s.status !== 'CANCELLED')
    : [];


  // Fetch therapist profile to get their ID for rating stats
  const profile = await fetchWithAuthContent("/therapists/profile");
  const ratingStats = profile?.id
    ? await fetchWithAuthContent(`/feedback/therapist/${profile.id}/stats`)
    : null;

  // Fetch availability to see if they have set up their schedule
  const availabilitySlots = await fetchWithAuthContent("/availability");
  const hasSchedule = Array.isArray(availabilitySlots) && availabilitySlots.length > 0;

  const now = new Date();
  const hour = now.getHours();
  let greeting = "Good evening";
  if (hour < 12) greeting = "Good morning";
  else if (hour < 17) greeting = "Good afternoon";

  const avgRating = ratingStats?.average ? Number(ratingStats.average.toFixed(1)) : null;
  const totalReviews = ratingStats?.total ?? 0;
  const distribution = ratingStats?.distribution ?? {};

  return (
    <div className="space-y-8 md:space-y-6 pb-24 px-4 md:px-0">
      {/* Welcome Heading */}
      <div className="space-y-1 py-2">
        <h1 className="text-2xl md:text-3xl font-heading font-bold tracking-tight flex items-center gap-2">
          {greeting}, {firstName} 👋
        </h1>
        <p className="text-muted-foreground text-sm font-medium">
          Here&apos;s what&apos;s happening in your practice today.
        </p>
      </div>

      {/* Verification Notice */}
      {!profile?.isVerified && (
        <div className="bg-amber-500/10 border border-amber-500/20 p-5 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4 text-center md:text-left">
            <div className="w-12 h-12 bg-amber-500/20 rounded-xl flex items-center justify-center text-amber-600 shrink-0">
              <Shield className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <p className="text-sm font-bold text-amber-900 uppercase tracking-widest">Application Pending Review</p>
              <p className="text-xs text-amber-800/60 font-medium mt-1">Your profile is currently private. An administrator will review your credentials before publishing you to the marketplace.</p>
            </div>
          </div>
          <AlexButton href="/dashboard/profile" size="md" className="shadow-lg shadow-amber-600/20 bg-amber-600 border-amber-600 hover:bg-amber-700 hover:border-amber-700">
            View Profile
          </AlexButton>
        </div>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8">
        {/* Today's Sessions */}
        <Link href="/dashboard/appointments" className="group bg-surface-container-lowest border border-outline-variant/20 p-4 md:p-6 lg:p-8 rounded-xl shadow-sm hover:shadow-xl hover:-translate-y-1.5 transition-all duration-500 cursor-pointer relative overflow-hidden block">
          <div className="absolute top-0 right-0 w-24 h-24 sm:w-32 sm:h-32 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:scale-125 transition-transform duration-700" />
          <div className="w-10 h-10 sm:w-12 sm:h-12 lg:w-14 lg:h-14 bg-primary/5 text-primary rounded-xl flex items-center justify-center mb-4 lg:mb-6 border border-current/10 shadow-inner group-hover:rotate-6 transition-transform">
            <Calendar className="w-5 h-5 sm:w-6 sm:h-6 lg:w-7 lg:h-7" />
          </div>
          <div>
            <p className="text-[9px] sm:text-[10px] md:text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground/60 mb-1 lg:mb-2">Today&apos;s Sessions</p>
            <h3 className="text-2xl sm:text-3xl md:text-4xl font-heading font-normal text-primary">{todaysSessionsCount}</h3>
          </div>
        </Link>

        {/* Pending Requests */}
        <Link href="/dashboard/appointments" className="group bg-surface-container-lowest border border-outline-variant/20 p-4 md:p-6 lg:p-8 rounded-xl shadow-sm hover:shadow-xl hover:-translate-y-1.5 transition-all duration-500 cursor-pointer relative overflow-hidden block">
          <div className="absolute top-0 right-0 w-24 h-24 sm:w-32 sm:h-32 bg-amber-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:scale-125 transition-transform duration-700" />
          <div className="w-10 h-10 sm:w-12 sm:h-12 lg:w-14 lg:h-14 bg-amber-500/5 text-amber-600 rounded-xl flex items-center justify-center mb-4 lg:mb-6 border border-current/10 shadow-inner group-hover:rotate-6 transition-transform">
            <Clock className="w-5 h-5 sm:w-6 sm:h-6 lg:w-7 lg:h-7" />
          </div>
          <div>
            <p className="text-[9px] sm:text-[10px] md:text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground/60 mb-1 lg:mb-2">Pending Requests</p>
            <h3 className="text-2xl sm:text-3xl md:text-4xl font-heading font-normal text-primary">{pendingSessions?.length || 0}</h3>
          </div>
        </Link>

        {/* Follow-ups */}
        <Link href="/dashboard/appointments" className="group bg-surface-container-lowest border border-outline-variant/20 p-4 md:p-6 lg:p-8 rounded-xl shadow-sm hover:shadow-xl hover:-translate-y-1.5 transition-all duration-500 cursor-pointer relative overflow-hidden block">
          <div className="absolute top-0 right-0 w-24 h-24 sm:w-32 sm:h-32 bg-blue-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:scale-125 transition-transform duration-700" />
          <div className="w-10 h-10 sm:w-12 sm:h-12 lg:w-14 lg:h-14 bg-blue-500/5 text-blue-600 rounded-xl flex items-center justify-center mb-4 lg:mb-6 border border-current/10 shadow-inner group-hover:rotate-6 transition-transform">
            <Activity className="w-5 h-5 sm:w-6 sm:h-6 lg:w-7 lg:h-7" />
          </div>
          <div>
            <p className="text-[9px] sm:text-[10px] md:text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground/60 mb-1 lg:mb-2">Follow-ups</p>
            <h3 className="text-2xl sm:text-3xl md:text-4xl font-heading font-normal text-primary">{followUpsCount}</h3>
          </div>
        </Link>

        {/* New Clients */}
        <Link href="/dashboard/patients" className="group bg-surface-container-lowest border border-outline-variant/20 p-4 md:p-6 lg:p-8 rounded-xl shadow-sm hover:shadow-xl hover:-translate-y-1.5 transition-all duration-500 cursor-pointer relative overflow-hidden block">
          <div className="absolute top-0 right-0 w-24 h-24 sm:w-32 sm:h-32 bg-emerald-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:scale-125 transition-transform duration-700" />
          <div className="w-10 h-10 sm:w-12 sm:h-12 lg:w-14 lg:h-14 bg-emerald-500/5 text-emerald-600 rounded-xl flex items-center justify-center mb-4 lg:mb-6 border border-current/10 shadow-inner group-hover:rotate-6 transition-transform">
            <Users className="w-5 h-5 sm:w-6 sm:h-6 lg:w-7 lg:h-7" />
          </div>
          <div>
            <p className="text-[9px] sm:text-[10px] md:text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground/60 mb-1 lg:mb-2">New Clients</p>
            <h3 className="text-2xl sm:text-3xl md:text-4xl font-heading font-normal text-primary">{newClientsCount}</h3>
          </div>
        </Link>
      </div>

      {/* 2-Column Main Content Grid matching Reference Image */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* Left 2 Columns: Schedule (Calendar) */}
        <div className="lg:col-span-2">
          <MiniCalendar sessions={calendarSessions} />
        </div>

        {/* Right 1 Column: Client Overview & Clinical Performance */}
        <div className="lg:col-span-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 gap-8 lg:space-y-8 lg:gap-0">
          {/* Client Overview Card */}
          <Card className="min-h-[280px] lg:h-[280px] h-auto p-5 flex flex-col relative overflow-hidden group justify-between">
            <div className="flex items-center justify-between mb-2 shrink-0">
              <p className="text-xs font-bold text-slate-800 uppercase tracking-widest">Client Overview</p>
              <Link href="/dashboard/patients" className="text-[10px] font-black text-primary hover:underline uppercase tracking-wider">
                View All Clients
              </Link>
            </div>

            <div className="flex-1 flex items-center justify-center py-4 lg:py-0">
              <div className="flex flex-col sm:flex-row items-center gap-6 w-full justify-center">
                {/* Doughnut Chart */}
                <div
                  className="relative w-32 h-32 rounded-full flex items-center justify-center shrink-0 shadow-xs border border-slate-100/30"
                  style={{
                    background: `conic-gradient(#5f43b2 0% ${seg1}%, #f59e0b ${seg1}% ${seg2}%, #10b981 ${seg2}% ${seg3}%, #94a3b8 ${seg3}% 100%)`
                  }}
                >
                  {/* Center cutout (smaller cutout w-20 h-20 increases doughnut ring thickness) */}
                  <div className="w-20 h-20 rounded-full bg-white flex flex-col items-center justify-center text-center p-2 shadow-xs animate-in zoom-in duration-300">
                    <span className="text-3xl font-black font-sans text-slate-900 leading-none">
                      {totalCount}
                    </span>
                    <span className="text-[7.5px] font-bold text-slate-400 uppercase tracking-widest mt-1.5 leading-tight max-w-[60px]">
                      Total Clients
                    </span>
                  </div>
                </div>

                {/* Legend */}
                <div className="flex-1 space-y-2.5 w-full max-w-[200px] sm:max-w-none">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#5f43b2] shrink-0" />
                      <span className="text-[11px] font-bold text-slate-500">Active</span>
                    </div>
                    <span className="text-xs font-black text-slate-850">{finalActiveCount}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#f59e0b] shrink-0" />
                      <span className="text-[11px] font-bold text-slate-500">Pending</span>
                    </div>
                    <span className="text-xs font-black text-slate-850">{finalPendingCount}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#10b981] shrink-0" />
                      <span className="text-[11px] font-bold text-slate-500">Completed</span>
                    </div>
                    <span className="text-xs font-black text-slate-850">{finalCompletedCount}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#94a3b8] shrink-0" />
                      <span className="text-[11px] font-bold text-slate-500">Cancelled</span>
                    </div>
                    <span className="text-xs font-black text-slate-850">{finalCancelledCount}</span>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* Patient Reviews Widget */}
          <Card className="min-h-[280px] lg:h-[280px] h-auto p-5 flex flex-col relative overflow-hidden group justify-between">
            <div className="absolute -bottom-10 -right-10 w-64 h-64 bg-yellow-400/5 rounded-full blur-3xl pointer-events-none" />

            <div className="z-10 flex flex-col flex-1 justify-between">
              <p className="text-xs font-bold text-slate-800 uppercase tracking-widest shrink-0">Clinical Performance</p>
              {avgRating !== null ? (
                <div className="flex-1 flex flex-col justify-center space-y-4">
                  <div className="flex items-end gap-3 shrink-0">
                    <span className="text-6xl font-bold font-sans text-foreground leading-none">
                      {avgRating}
                    </span>
                    <div className="flex flex-col gap-1 mb-1">
                      <div className="flex items-center gap-0.5">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <Star
                            key={s}
                            className={`w-4 h-4 ${s <= Math.round(avgRating)
                              ? "fill-yellow-400 text-yellow-400"
                              : "text-outline-variant/30"
                              }`}
                          />
                        ))}
                      </div>
                      <p className="text-[10px] text-muted-foreground font-semibold">
                        Based on {totalReviews} reviews
                      </p>
                    </div>
                  </div>

                  <div className="border-t border-outline-variant/10 pt-3 space-y-1.5">
                    {[5, 4, 3, 2, 1].map((star) => {
                      const count = (distribution as Record<number, number>)[star] ?? 0;
                      const pct = totalReviews > 0 ? Math.round((count / totalReviews) * 100) : 0;
                      return (
                        <div key={star} className="flex items-center gap-3">
                          <span className="text-xs font-bold text-muted-foreground w-3">{star}</span>
                          <div className="flex-1 h-1.5 bg-surface-container-lowest rounded-full overflow-hidden border border-outline-variant/10">
                            <div
                              className="h-full bg-yellow-400 rounded-full transition-all duration-1000"
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                          <span className="text-[10px] font-bold text-muted-foreground/60 w-8 text-right">{pct}%</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <div className="py-6 text-center">
                  <div className="text-3xl mb-2">⭐</div>
                  <h4 className="text-sm font-bold text-foreground/60 mb-1">No reviews yet</h4>
                  <p className="text-[10px] text-muted-foreground/60 max-w-xs mx-auto">
                    Feedback will appear here once you complete sessions.
                  </p>
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>

      {/* Row 2: Pending Confirmations or Practice hours prompt (Full Width of Dashboard) */}
      {pendingSessions.length > 0 ? (
        <div className="space-y-4 pt-4 shrink-0">
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-2">
              <h3 className="headline-md text-foreground">
                Pending Confirmations
              </h3>
              <span className="bg-amber-500 text-white text-[9px] font-black px-2 py-0.5 rounded-full shadow-sm animate-pulse">
                {pendingSessions.length}
              </span>
            </div>
            <Link href="/dashboard/appointments" className="text-[10px] md:text-xs font-bold uppercase tracking-widest text-primary/60 hover:text-primary transition-all flex items-center group">
              Schedule <ArrowRight className="w-3 h-3 ml-1 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          <div className="flex flex-wrap gap-6 w-full">
            {pendingSessions.map((session: Session) => (
              <Card
                key={session.id}
                className="w-full md:w-[300px] p-5 hover:border-amber-200 transition-all group relative overflow-hidden flex flex-col justify-between h-48"
              >
                <div className="absolute top-0 right-0 w-20 h-20 bg-amber-500/5 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" />

                <div>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-primary font-bold overflow-hidden p-0.5 shrink-0 shadow-inner">
                      <Image
                        src={`https://ui-avatars.com/api/?name=${session.patient?.firstName}+${session.patient?.lastName}&background=EAF4F3&color=214D3E&size=128`}
                        alt="Patient"
                        width={48}
                        height={48}
                        className="w-full h-full object-cover rounded-md"
                      />
                    </div>
                    <div className="overflow-hidden">
                      <h4 className="text-slate-900 font-bold text-sm leading-tight group-hover:text-primary transition-colors font-sans truncate capitalize">
                        {session.patient?.firstName} {session.patient?.lastName}
                      </h4>
                      <div className="flex items-center gap-1 mt-1">
                        <span className={`px-2 py-0.5 rounded-md text-[9px] border font-black uppercase tracking-widest ${session.mode === 'IN_CLINIC'
                          ? 'bg-emerald-50 text-emerald-600 border-emerald-100'
                          : 'bg-blue-50 text-blue-600 border-blue-100'
                          }`}>
                          {session.mode === 'IN_CLINIC' ? 'Clinic' : 'Online'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1.5 mb-3">
                    <div className="flex items-center gap-2 text-slate-500">
                      <Calendar className="w-3.5 h-3.5 text-primary/40 shrink-0" />
                      <span className="text-[11px] font-bold uppercase tracking-wider text-slate-600">
                        {new Date(session.scheduledAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-500">
                      <Clock className="w-3.5 h-3.5 text-primary/40 shrink-0" />
                      <span className="text-[11px] font-bold uppercase tracking-wider text-slate-600">
                        {new Date(session.scheduledAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-50">
                  <Link href={`/dashboard/appointments/${session.id}`} className="block">
                    <Button variant="ghost" className="w-full py-2 group-hover:bg-primary group-hover:text-white group-hover:shadow-lg group-hover:shadow-primary/20 text-[10px] font-bold uppercase tracking-widest text-primary transition-all flex items-center justify-center gap-2 h-auto hover:text-inherit">
                      Review Request <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </Link>
                </div>
              </Card>
            ))}
          </div>
        </div>
      ) : (
        !hasSchedule ? (
          <div className="pt-4 shrink-0">
            <Card className="bg-slate-900 border border-slate-800 p-5 md:p-8 rounded-xl shadow-2xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:scale-110 transition-transform duration-700" />
              <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
                <div className="space-y-4 text-center md:text-left">
                  <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/20 rounded-lg border border-primary/30">
                    <Clock className="w-3.5 h-3.5 text-primary-foreground" />
                    <span className="text-[10px] font-bold text-primary-foreground uppercase tracking-widest">Action Required</span>
                  </div>
                  <h3 className="headline-lg text-white tracking-tight">Set your practice hours</h3>
                  <p className="text-white/60 text-sm max-w-md leading-relaxed">
                    You haven&apos;t added your clinical availability yet. Set your working hours so patients can start booking sessions.
                  </p>
                </div>
                <AlexButton href="/dashboard/availability" size="lg" className="shadow-xl">
                  Configure Schedule
                </AlexButton>
              </div>
            </Card>
          </div>
        ) : null
      )}
    </div>
  );
}
