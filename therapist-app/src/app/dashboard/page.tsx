import { createClient } from "@/lib/supabase/server";
import { Calendar, ArrowRight, Shield, Star, Clock } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { fetchWithAuthContent } from "@/lib/api-server";
import MiniCalendar from "@/components/MiniCalendar";
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

  const uniquePatientsCount = Array.isArray(allSessions)
    ? new Set(allSessions.map((s: Session) => s.patientId)).size
    : 0;

  const activeCount = uniquePatientsCount ? Math.max(1, Math.round(uniquePatientsCount * 0.7)) : 22;
  const atRiskCount = uniquePatientsCount ? Math.max(0, Math.round(uniquePatientsCount * 0.1)) : 3;
  const onBreakCount = uniquePatientsCount ? Math.max(0, Math.round(uniquePatientsCount * 0.125)) : 4;
  const completedCount = uniquePatientsCount ? Math.max(0, uniquePatientsCount - activeCount - atRiskCount - onBreakCount) : 3;
  const totalCount = activeCount + atRiskCount + onBreakCount + completedCount;

  const activePct = totalCount > 0 ? (activeCount / totalCount) * 100 : 68.75;
  const atRiskPct = totalCount > 0 ? (atRiskCount / totalCount) * 100 : 9.375;
  const onBreakPct = totalCount > 0 ? (onBreakCount / totalCount) * 100 : 12.5;
  const completedPct = totalCount > 0 ? (completedCount / totalCount) * 100 : 9.375;

  const seg1 = activePct;
  const seg2 = seg1 + atRiskPct;
  const seg3 = seg2 + onBreakPct;

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
    <div className="space-y-8 md:space-y-12 pb-24 px-4 md:px-0">
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
          <Link href="/dashboard/profile">
            <button className="px-6 py-3 bg-amber-600 text-white text-[10px] font-bold uppercase tracking-widest rounded-lg hover:bg-amber-700 transition-colors shadow-lg shadow-amber-600/20">
              View Profile
            </button>
          </Link>
        </div>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {/* Today's Sessions */}
        <div className="bg-white border border-outline-variant/30 rounded-2xl p-5 shadow-xs flex flex-col justify-between h-36 hover:shadow-md transition-shadow group relative overflow-hidden">
          <div className="absolute top-0 right-0 w-16 h-16 bg-primary/5 rounded-full blur-xl -translate-y-1/3 translate-x-1/3" />
          <p className="text-xs font-bold text-primary/85 tracking-wide uppercase">Today&apos;s Sessions</p>
          <p className="text-4xl md:text-5xl font-bold font-sans text-foreground py-2 leading-none">
            {upcomingSessions?.length || 0}
          </p>
          <Link href="/dashboard/appointments" className="text-[10px] md:text-xs font-bold text-primary hover:text-primary-hover hover:underline transition-colors mt-auto flex items-center gap-1 group/link">
            View Schedule <ArrowRight className="w-3.5 h-3.5 group-hover/link:translate-x-0.5 transition-transform" />
          </Link>
        </div>

        {/* Pending Notes / Requests */}
        <div className="bg-white border border-outline-variant/30 rounded-2xl p-5 shadow-xs flex flex-col justify-between h-36 hover:shadow-md transition-shadow group relative overflow-hidden">
          <div className="absolute top-0 right-0 w-16 h-16 bg-amber-500/5 rounded-full blur-xl -translate-y-1/3 translate-x-1/3" />
          <p className="text-xs font-bold text-primary/85 tracking-wide uppercase">Pending Requests</p>
          <p className="text-4xl md:text-5xl font-bold font-sans text-foreground py-2 leading-none">
            {pendingSessions?.length || 0}
          </p>
          <Link href="/dashboard/appointments" className="text-[10px] md:text-xs font-bold text-primary hover:text-primary-hover hover:underline transition-colors mt-auto flex items-center gap-1 group/link">
            Complete Notes <ArrowRight className="w-3.5 h-3.5 group-hover/link:translate-x-0.5 transition-transform" />
          </Link>
        </div>

        {/* Follow-ups */}
        <div className="bg-white border border-outline-variant/30 rounded-2xl p-5 shadow-xs flex flex-col justify-between h-36 hover:shadow-md transition-shadow group relative overflow-hidden">
          <div className="absolute top-0 right-0 w-16 h-16 bg-emerald-500/5 rounded-full blur-xl -translate-y-1/3 translate-x-1/3" />
          <p className="text-xs font-bold text-primary/85 tracking-wide uppercase">Follow-ups</p>
          <p className="text-4xl md:text-5xl font-bold font-sans text-foreground py-2 leading-none">
            6
          </p>
          <Link href="/dashboard/appointments" className="text-[10px] md:text-xs font-bold text-primary hover:text-primary-hover hover:underline transition-colors mt-auto flex items-center gap-1 group/link">
            View All <ArrowRight className="w-3.5 h-3.5 group-hover/link:translate-x-0.5 transition-transform" />
          </Link>
        </div>

        {/* New Clients */}
        <div className="bg-white border border-outline-variant/30 rounded-2xl p-5 shadow-xs flex flex-col justify-between h-36 hover:shadow-md transition-shadow group relative overflow-hidden">
          <div className="absolute top-0 right-0 w-16 h-16 bg-indigo-500/5 rounded-full blur-xl -translate-y-1/3 translate-x-1/3" />
          <p className="text-xs font-bold text-primary/85 tracking-wide uppercase">New Clients</p>
          <p className="text-4xl md:text-5xl font-bold font-sans text-foreground py-2 leading-none">
            {uniquePatientsCount || 0}
          </p>
          <Link href="/dashboard/patients" className="text-[10px] md:text-xs font-bold text-primary hover:text-primary-hover hover:underline transition-colors mt-auto flex items-center gap-1 group/link">
            View All <ArrowRight className="w-3.5 h-3.5 group-hover/link:translate-x-0.5 transition-transform" />
          </Link>
        </div>
      </div>

      {/* 2-Column Main Content Grid matching Reference Image */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left 2 Columns: Schedule (Calendar) */}
        <div className="lg:col-span-2">
          <MiniCalendar sessions={upcomingSessions} />
        </div>

        {/* Right 1 Column: Client Overview & Clinical Performance */}
        <div className="lg:col-span-1 space-y-8">
          {/* Client Overview Card */}
          <div className="h-[280px] bg-white border border-outline-variant/30 rounded-2xl p-5 shadow-xs flex flex-col relative overflow-hidden group">
            <div className="flex items-center justify-between mb-2 shrink-0">
              <p className="text-xs font-bold text-slate-800 uppercase tracking-widest">Client Overview</p>
              <Link href="/dashboard/patients" className="text-[10px] font-black text-primary hover:underline uppercase tracking-wider">
                View All Clients
              </Link>
            </div>

            <div className="flex-1 flex items-center justify-center">
              <div className="flex items-center gap-6 w-full">
                {/* Doughnut Chart */}
                <div 
                  className="relative w-32 h-32 rounded-full flex items-center justify-center shrink-0 shadow-xs border border-slate-100/30"
                  style={{
                    background: `conic-gradient(#5f43b2 0% ${seg1}%, #f43f5e ${seg1}% ${seg2}%, #f59e0b ${seg2}% ${seg3}%, #10b981 ${seg3}% 100%)`
                  }}
                >
                  {/* Center cutout */}
                  <div className="w-[90px] h-[90px] rounded-full bg-white flex flex-col items-center justify-center text-center p-2 shadow-xs">
                    <span className="text-3xl font-black font-sans text-slate-900 leading-none">
                      {totalCount}
                    </span>
                    <span className="text-[7.5px] font-bold text-slate-400 uppercase tracking-widest mt-1.5 leading-tight max-w-[60px]">
                      Total Clients
                    </span>
                  </div>
                </div>

                {/* Legend */}
                <div className="flex-1 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#5f43b2] shrink-0" />
                      <span className="text-[11px] font-bold text-slate-500">Active</span>
                    </div>
                    <span className="text-xs font-black text-slate-850">{activeCount}</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#f43f5e] shrink-0" />
                      <span className="text-[11px] font-bold text-slate-500">At Risk</span>
                    </div>
                    <span className="text-xs font-black text-slate-850">{atRiskCount}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#f59e0b] shrink-0" />
                      <span className="text-[11px] font-bold text-slate-500">On Break</span>
                    </div>
                    <span className="text-xs font-black text-slate-850">{onBreakCount}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#10b981] shrink-0" />
                      <span className="text-[11px] font-bold text-slate-500">Completed</span>
                    </div>
                    <span className="text-xs font-black text-slate-850">{completedCount}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Patient Reviews Widget */}
          <div className="h-[280px] bg-surface-container-low rounded-2xl p-5 border border-outline-variant/20 flex flex-col relative overflow-hidden group shadow-sm">
            <div className="absolute -bottom-10 -right-10 w-64 h-64 bg-yellow-400/5 rounded-full blur-3xl pointer-events-none" />

            <div className="z-10 flex flex-col h-full justify-between">
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
          </div>
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
              <div 
                key={session.id} 
                className="w-full md:w-[300px] bg-white p-5 rounded-2xl border border-slate-100 hover:border-amber-200 transition-all group relative overflow-hidden flex flex-col justify-between h-48 shadow-sm"
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
                        <span className={`px-2 py-0.5 rounded-md text-[9px] border font-black uppercase tracking-widest ${
                          session.mode === 'IN_CLINIC' 
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
                    <button className="w-full py-2 bg-primary/5 group-hover:bg-primary group-hover:text-white group-hover:shadow-lg group-hover:shadow-primary/20 rounded-xl text-[10px] font-bold uppercase tracking-widest text-primary transition-all flex items-center justify-center gap-2">
                      Review Request <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                    </button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        !hasSchedule ? (
          <div className="pt-4 shrink-0">
            <div className="bg-slate-900 border border-slate-800 p-5 md:p-8 rounded-2xl shadow-2xl relative overflow-hidden group">
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
                <Link href="/dashboard/availability">
                  <button className="px-8 py-4 bg-primary text-primary-foreground text-xs font-bold uppercase tracking-[0.2em] rounded-xl hover:bg-white hover:text-slate-900 transition-all shadow-xl hover:-translate-y-1 flex items-center gap-3">
                    Configure Schedule <ArrowRight className="w-4 h-4" />
                  </button>
                </Link>
              </div>
            </div>
          </div>
        ) : null
      )}
    </div>
  );
}
