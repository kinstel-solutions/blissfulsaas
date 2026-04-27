import { createClient } from "@/lib/supabase/server";
import { Calendar, ArrowRight, Shield, Star, Clock } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { fetchWithAuthContent } from "@/lib/api-server";

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();

  const firstName = data?.user?.user_metadata?.first_name || "Doctor";
  
  // Fetch real upcoming sessions from the backend
  const upcomingSessions = await fetchWithAuthContent("/sessions/upcoming");
  const nextSession = Array.isArray(upcomingSessions) && upcomingSessions.length > 0 ? upcomingSessions[0] : null;

  // Fetch all sessions for filtering and insights
  const allSessions = await fetchWithAuthContent("/sessions/all");
  const pendingSessions = Array.isArray(allSessions) 
    ? allSessions.filter((s: any) => s.status === 'PENDING') 
    : [];

  // Calculate insights
  const completedSessionsCount = Array.isArray(allSessions) 
    ? allSessions.filter((s: any) => s.status === 'COMPLETED').length 
    : 0;
    
  const uniquePatientsCount = Array.isArray(allSessions)
    ? new Set(allSessions.map((s: any) => s.patientId)).size
    : 0;

  // Fetch therapist profile to get their ID for rating stats
  const profile = await fetchWithAuthContent("/therapists/profile");
  const ratingStats = profile?.id
    ? await fetchWithAuthContent(`/feedback/therapist/${profile.id}/stats`)
    : null;

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
        <div className="bg-amber-500/10 border border-amber-500/20 p-6 rounded-[2rem] flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4 text-center md:text-left">
            <div className="w-12 h-12 bg-amber-500/20 rounded-2xl flex items-center justify-center text-amber-600 shrink-0">
               <Shield className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <p className="text-sm font-bold text-amber-900 uppercase tracking-widest">Application Pending Review</p>
              <p className="text-xs text-amber-800/60 font-medium mt-1">Your profile is currently private. An administrator will review your credentials before publishing you to the marketplace.</p>
            </div>
          </div>
          <Link href="/dashboard/profile">
            <button className="px-6 py-3 bg-amber-600 text-white text-[10px] font-bold uppercase tracking-widest rounded-xl hover:bg-amber-700 transition-colors shadow-lg shadow-amber-600/20">
              Complete Your Profile
            </button>
          </Link>
        </div>
      )}

      {/* Welcome Banner */}
      <div className="relative group bg-primary border border-primary/20 p-4 md:p-8 md:p-12 rounded-[2rem] shadow-2xl shadow-primary/20 overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary-container/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:scale-125 transition-transform duration-1000" />
        <div className="relative z-10 flex flex-col md:flex-row items-center gap-8 md:gap-12">
          {/* Profile Image */}
          <div className="shrink-0">
             <div className="w-32 h-32 md:w-40 md:h-40 rounded-[3rem] border-4 border-white/10 shadow-2xl overflow-hidden group-hover:scale-105 transition-transform duration-500 bg-white/5 p-1">
                <Image 
                  src={profile?.profileImageUrl || `https://ui-avatars.com/api/?name=${firstName}&background=EAF4F3&color=214D3E&size=400`}
                  alt="Therapist Profile"
                  width={160}
                  height={160}
                  className="w-full h-full object-cover rounded-[2.5rem]"
                />
             </div>
          </div>

          <div className="max-w-xl text-center md:text-left">
             <h1 className="text-3xl md:text-[2.75rem] font-heading font-medium text-primary-foreground mb-4 md:mb-6 leading-tight" suppressHydrationWarning>
               {greeting}, {firstName}
             </h1>
             <p className="text-primary-foreground/70 text-base md:text-lg leading-relaxed mb-6 md:mb-8">
               You have <span className="text-primary-foreground font-bold">{upcomingSessions?.length || 0} session(s)</span> scheduled for today.
             </p>
             <div className="mb-0 flex justify-center md:justify-start">
               <div className={`px-4 py-2 rounded-xl border text-white/90 text-[10px] md:text-xs font-bold uppercase tracking-widest flex items-center gap-2 ${profile?.isVerified ? 'bg-white/10 border-white/20' : 'bg-amber-500/20 border-amber-500/30'}`}>
                 <Shield className={`w-4 h-4 ${profile?.isVerified ? 'text-green-300' : 'text-amber-300 animate-pulse'}`} />
                  Clinic Status: <span>
                    {profile?.isVerified ? 'Verified & Public' : 'Private & Pending'}
                  </span>
               </div>
             </div>
          </div>
        </div>
      </div>

      {/* Appointments Section */}
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-2">
          <h3 className="text-xl md:text-2xl font-bold tracking-tight text-foreground flex flex-wrap items-center gap-3">
            {pendingSessions.length > 0 ? "Pending Sessions" : "Appointments"}
            {pendingSessions.length > 0 && (
              <span className="bg-amber-500/10 text-amber-600 text-[10px] font-bold px-3 py-1 rounded-full border border-amber-500/20 uppercase tracking-wider whitespace-nowrap">
                {pendingSessions.length} Action Required
              </span>
            )}
          </h3>
          <Link href="/dashboard/appointments" className="text-[10px] md:text-xs font-bold uppercase tracking-widest text-primary/60 hover:text-primary transition-all flex items-center group whitespace-nowrap">
            Full Schedule <ArrowRight className="w-3 h-3 ml-1.5 md:ml-2 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {pendingSessions.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {pendingSessions.map((session: any) => (
              <div key={session.id} className="bg-white p-8 rounded-[2rem] border border-slate-100 hover:border-amber-200 hover:shadow-2xl hover:shadow-amber-500/10 transition-all group relative overflow-hidden flex flex-col justify-between h-full">
                <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" />
                
                <div>
                  <div className="flex items-center gap-5 mb-6">
                    <div className="w-16 h-16 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center text-primary font-bold overflow-hidden p-1 shrink-0">
                      <Image 
                        src={`https://ui-avatars.com/api/?name=${session.patient?.firstName}+${session.patient?.lastName}&background=EAF4F3&color=214D3E&size=128`}
                        alt="Patient"
                        width={64}
                        height={64}
                        className="w-full h-full object-cover rounded-xl"
                      />
                    </div>
                    <div>
                      <h4 className="text-slate-900 font-bold text-lg leading-tight group-hover:text-primary transition-colors font-sans">
                        {session.patient?.firstName} {session.patient?.lastName}
                      </h4>
                      <div className="flex items-center gap-2 mt-1.5">
                        <span className={`px-2 py-0.5 rounded-full text-[8px] border font-bold uppercase tracking-widest ${
                          session.mode === 'IN_CLINIC' 
                            ? 'bg-emerald-50 text-emerald-600 border-emerald-100' 
                            : 'bg-blue-50 text-blue-600 border-blue-100'
                        }`}>
                          {session.mode === 'IN_CLINIC' ? 'In-Clinic' : 'Online'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3 mb-8">
                    <div className="flex items-center gap-3 text-slate-500">
                      <Calendar className="w-4 h-4 text-primary/40" />
                      <span className="text-xs font-bold uppercase tracking-widest">
                        {new Date(session.scheduledAt).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-slate-500">
                      <Clock className="w-4 h-4 text-primary/40" />
                      <span className="text-xs font-bold uppercase tracking-widest">
                        {new Date(session.scheduledAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="pt-6 border-t border-slate-50">
                  <Link href={`/dashboard/appointments/${session.id}`} className="block">
                    <button className="w-full py-4 bg-slate-50 hover:bg-primary hover:text-white rounded-2xl text-[10px] font-bold uppercase tracking-[0.2em] text-primary transition-all flex items-center justify-center gap-2">
                      Review Appointment <ArrowRight className="w-4 h-4" />
                    </button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-surface/50 p-12 rounded-[2rem] border border-dashed border-outline-variant/30 text-center">
            <Calendar className="w-10 h-10 text-primary/20 mx-auto mb-4" />
            <p className="text-sm text-muted-foreground font-medium">All caught up! No pending sessions at the moment.</p>
            <Link href="/dashboard/appointments" className="text-primary font-bold text-[10px] uppercase tracking-widest mt-4 inline-block hover:underline">
              View your schedule
            </Link>
          </div>
        )}
      </div>

      {/* Metrics Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-10">
        
        {/* Patient Reviews Widget - Now more prominent */}
        <div className="col-span-1 md:col-span-2">
           <div className="bg-surface-container-low rounded-[2rem] p-6 md:p-10 border border-outline-variant/20 flex flex-col md:flex-row items-center gap-8 md:gap-16 shadow-sm relative overflow-hidden group h-full">
            <div className="absolute -bottom-10 -right-10 w-64 h-64 bg-yellow-400/5 rounded-full blur-3xl -z-0 pointer-events-none group-hover:scale-125 transition-transform duration-700" />
            
            <div className="flex flex-col items-center md:items-start text-center md:text-left z-10">
              <p className="text-[10px] md:text-xs font-bold uppercase tracking-widest text-primary/60 mb-4">Clinical Performance</p>
              {avgRating !== null ? (
                <>
                  <div className="text-7xl md:text-8xl font-bold font-sans text-foreground drop-shadow-xl mb-2">
                    {avgRating}
                  </div>
                  <div className="flex items-center gap-1 mb-4">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star
                        key={s}
                        className={`w-6 h-6 ${
                          s <= Math.round(avgRating)
                            ? "fill-yellow-400 text-yellow-400"
                            : "text-outline-variant/30"
                        }`}
                      />
                    ))}
                  </div>
                  <p className="text-sm text-muted-foreground mb-4">
                    Based on <span className="font-bold text-foreground">{totalReviews}</span> patient reviews
                  </p>
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary/40 mt-4">
                    Verified Performance
                  </p>
                </>
              ) : (
                <div className="py-8">
                  <div className="text-5xl mb-4">⭐</div>
                  <h4 className="text-xl font-bold text-foreground/60 mb-2">No reviews yet</h4>
                  <p className="text-xs text-muted-foreground/60 max-w-xs">
                    Complete your first session to start receiving feedback from your patients.
                  </p>
                </div>
              )}
            </div>

            {avgRating !== null && (
              <div className="flex-1 w-full max-w-sm z-10">
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-4">Rating Distribution</p>
                <div className="space-y-3">
                  {[5, 4, 3, 2, 1].map((star) => {
                    const count = (distribution as Record<number, number>)[star] ?? 0;
                    const pct = totalReviews > 0 ? Math.round((count / totalReviews) * 100) : 0;
                    return (
                      <div key={star} className="flex items-center gap-4">
                        <span className="text-xs font-bold text-muted-foreground w-4">{star}</span>
                        <div className="flex-1 h-2 bg-surface-container-lowest rounded-full overflow-hidden border border-outline-variant/10">
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
            )}
          </div>
        </div>

        {/* Practice Insights Card */}
        <div className="col-span-1 space-y-6">
           <div className="bg-primary/5 rounded-[2rem] p-8 border border-primary/10 h-full flex flex-col justify-between relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" />
              
              <div>
                <p className="text-[10px] md:text-xs font-bold uppercase tracking-widest text-primary/60 mb-8">Practice Insights</p>
                
                <div className="space-y-8">
                  <div className="flex items-center gap-5">
                    <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary shrink-0">
                      <Image 
                        src="https://api.iconify.design/heroicons:users-solid.svg?color=%235f43b2" 
                        alt="Patients" 
                        width={24} 
                        height={24} 
                      />
                    </div>
                    <div>
                      <p className="text-2xl font-bold font-sans text-foreground">{uniquePatientsCount}</p>
                      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Total Patients</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-5">
                    <div className="w-12 h-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center text-emerald-600 shrink-0">
                      <Image 
                        src="https://api.iconify.design/heroicons:check-badge-solid.svg?color=%23059669" 
                        alt="Sessions" 
                        width={24} 
                        height={24} 
                      />
                    </div>
                    <div>
                      <p className="text-2xl font-bold font-sans text-foreground">{completedSessionsCount}</p>
                      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Sessions Completed</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-primary/10">
                <div className="flex items-center gap-2 text-[10px] font-bold text-primary/40 uppercase tracking-widest">
                  <Shield className="w-3.5 h-3.5" />
                  <span>End-to-End Encrypted Data</span>
                </div>
              </div>
           </div>
        </div>

      </div>
    </div>
  );
}
