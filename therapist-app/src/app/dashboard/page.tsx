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
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8 md:gap-10">
          <div className="max-w-xl text-center md:text-left">
             <h1 className="text-3xl md:text-[2.75rem] font-heading font-medium text-primary-foreground mb-4 md:mb-6 leading-tight" suppressHydrationWarning>
               {greeting}, {firstName}
             </h1>
             <p className="text-primary-foreground/70 text-base md:text-lg leading-relaxed mb-6 md:mb-8">
               Your private practice is flourishing. You have <span className="text-primary-foreground font-bold">{upcomingSessions?.length || 0} session(s)</span> scheduled for today.
             </p>
             <div className="mb-6 md:mb-8 flex justify-center md:justify-start">
               <div className={`px-4 py-2 rounded-xl border text-white/90 text-[10px] md:text-xs font-bold uppercase tracking-widest flex items-center gap-2 ${profile?.isVerified ? 'bg-white/10 border-white/20' : 'bg-amber-500/20 border-amber-500/30'}`}>
                 <Shield className={`w-4 h-4 ${profile?.isVerified ? 'text-green-300' : 'text-amber-300 animate-pulse'}`} />
                  Clinic Status: <span>
                    {profile?.isVerified ? 'Verified & Public' : 'Private & Pending'}
                  </span>
               </div>
             </div>
             <div className="flex flex-col sm:flex-row gap-4 w-full">
                {nextSession && (
                  <Link href={`/dashboard/sessions/${nextSession.id}/call`} className="w-full sm:w-auto">
                    <button className="w-full bg-primary-container text-primary-foreground px-4 md:px-8 py-4 rounded-2xl font-bold uppercase tracking-widest text-xs shadow-lg hover:shadow-2xl hover:-translate-y-1 transition-all">
                      Launch Virtual Room
                    </button>
                  </Link>
                )}
             </div>
          </div>
          <div className="hidden lg:flex flex-col items-end gap-2 text-right">
             <div className="bg-white/5 px-6 py-4 rounded-2xl border border-white/10">
               <p className="text-white/40 text-[10px] font-bold uppercase tracking-widest mb-1">Clinic Status</p>
                <p className="text-white font-bold flex items-center gap-2 text-sm">
                  <Shield className={`w-4 h-4 ${profile?.isVerified ? 'text-primary-container' : 'text-amber-300'}`} /> 
                  {profile?.isVerified ? 'Public & Encrypted' : 'Private & Encrypted'}
                </p>
             </div>
          </div>
        </div>
      </div>

      {/* Roster & Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-10">
        
        {/* Next Session Spotlight */}
        <div className="col-span-1 md:col-span-2 space-y-6">
          <div className="flex items-center justify-between px-2">
            <h3 className="text-xl md:text-2xl font-heading font-normal text-foreground">Next Session</h3>
            <Link href="/dashboard/appointments" className="text-[10px] md:text-xs font-bold uppercase tracking-widest text-primary/60 hover:text-primary transition-all flex items-center group">
              Full Schedule <ArrowRight className="w-3 h-3 ml-1.5 md:ml-2 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
          
          {nextSession ? (
            <div className="bg-surface p-6 md:p-10 rounded-[2rem] md:rounded-xl border border-outline-variant/30 flex flex-col md:flex-row items-center justify-between gap-6 md:gap-8 hover:shadow-xl hover:border-primary/20 transition-all duration-500 relative group">
              <div className="flex flex-col sm:flex-row items-center gap-4 md:gap-6 text-center sm:text-left w-full sm:w-auto">
                <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl md:rounded-[2rem] bg-surface-container-low border border-outline-variant/50 flex items-center justify-center text-primary font-bold overflow-hidden p-0.5 shadow-inner group-hover:scale-105 transition-transform shrink-0">
                  <Image 
                    src={`https://ui-avatars.com/api/?name=${nextSession.patient?.firstName}+${nextSession.patient?.lastName}&background=f8f9fa&color=5f43b2&size=200`}
                    alt="Patient"
                    width={80}
                    height={80}
                    className="w-full h-full object-cover rounded-[1.4rem] md:rounded-[1.8rem]"
                  />
                </div>
                <div className="text-left w-full sm:w-auto">
                  <h4 className="text-foreground font-heading font-medium text-lg md:text-xl mb-1">{nextSession.patient?.firstName} {nextSession.patient?.lastName}</h4>
                  <div className="flex flex-wrap items-center gap-2 md:gap-3">
                    <span className="px-2 py-0.5 rounded-full bg-primary/5 text-primary text-[10px] font-bold uppercase">Booking Active</span>
                    <span className="text-[10px] font-medium text-muted-foreground">• Video Session</span>
                  </div>
                </div>
              </div>
              <div className="text-center md:text-right">
                <p className="text-foreground font-bold text-base md:text-lg mb-0.5 md:mb-1" suppressHydrationWarning>
                  {new Date(nextSession.scheduledAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                </p>
                <div className="flex items-center justify-center md:justify-end gap-2 text-muted-foreground/60">
                   <Clock className="w-3.5 h-3.5" />
                   <span className="text-[10px] font-bold uppercase tracking-widest">{nextSession.duration} Min Session</span>
                </div>
              </div>
              <Link href={`/dashboard/appointments/${nextSession.id}`} className="w-full md:w-auto">
                <button className="w-full md:w-auto px-4 md:px-8 py-3 md:py-3.5 bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground text-[10px] md:text-xs font-bold uppercase tracking-widest rounded-xl md:rounded-2xl transition-all duration-300">
                  Prepare Notes
                </button>
              </Link>
            </div>
          ) : (
            <div className="bg-surface p-4 md:p-10 rounded-[2rem] md:rounded-xl border border-outline-variant/30 text-center py-16 md:py-20">
              <Calendar className="w-10 h-10 md:w-12 md:h-12 text-primary/20 mx-auto mb-4" />
              <p className="text-sm md:text-base text-muted-foreground">No sessions scheduled for today.</p>
              <Link href="/dashboard/availability" className="text-primary font-bold text-[10px] md:text-xs uppercase tracking-widest mt-4 inline-block hover:underline">
                Update your availability
              </Link>
            </div>
          )}
        </div>

        {/* Rating & Reviews Widget */}
        <div className="space-y-6">
           <div className="hidden md:block px-2 h-8" />
           <div className="bg-surface-container-low rounded-[2rem] md:rounded-xl p-4 md:p-8 border border-outline-variant/20 flex flex-col justify-between shadow-sm relative overflow-hidden group min-h-[300px] h-full">
            <div className="absolute -bottom-10 -right-10 w-48 h-48 bg-yellow-400/5 rounded-full blur-3xl -z-0 pointer-events-none group-hover:scale-125 transition-transform duration-700" />
            <div className="flex items-center justify-between z-10">
               <p className="text-[10px] md:text-xs font-bold uppercase tracking-widest text-primary/60">Patient Reviews</p>
               <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
            </div>
            <div className="flex-1 flex flex-col items-center justify-center py-6 z-10">
              {avgRating !== null ? (
                <>
                  {/* Big average */}
                  <div className="text-6xl md:text-7xl font-heading font-normal text-foreground drop-shadow-xl mb-1">
                    {avgRating}
                  </div>
                  {/* Star row */}
                  <div className="flex items-center gap-1 mb-2">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star
                        key={s}
                        className={`w-5 h-5 ${
                          s <= Math.round(avgRating)
                            ? "fill-yellow-400 text-yellow-400"
                            : "text-outline-variant/30"
                        }`}
                      />
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground mb-4">
                    Based on <span className="font-bold text-foreground">{totalReviews}</span> {totalReviews === 1 ? "review" : "reviews"}
                  </p>
                  {/* Distribution bars */}
                  <div className="w-full space-y-1.5">
                    {[5, 4, 3, 2, 1].map((star) => {
                      const count = (distribution as Record<number, number>)[star] ?? 0;
                      const pct = totalReviews > 0 ? Math.round((count / totalReviews) * 100) : 0;
                      return (
                        <div key={star} className="flex items-center gap-2">
                          <span className="text-[10px] font-bold text-muted-foreground w-3">{star}</span>
                          <div className="flex-1 h-1.5 bg-surface-container-lowest rounded-full overflow-hidden">
                            <div
                              className="h-full bg-yellow-400 rounded-full transition-all duration-700"
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                          <span className="text-[10px] text-muted-foreground/60 w-5 text-right">{count}</span>
                        </div>
                      );
                    })}
                  </div>
                </>
              ) : (
                <>
                  <div className="text-5xl mb-3">⭐</div>
                  <p className="text-sm font-heading text-foreground/60 text-center">No reviews yet</p>
                  <p className="text-[10px] text-muted-foreground/50 text-center mt-1">
                    Complete your first session to start receiving feedback.
                  </p>
                </>
              )}
            </div>
            {totalReviews > 0 && (
              <Link
                href="/dashboard/profile"
                className="text-[10px] font-bold uppercase tracking-widest text-primary/60 hover:text-primary transition-colors text-center z-10"
              >
                View on Profile →
              </Link>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
