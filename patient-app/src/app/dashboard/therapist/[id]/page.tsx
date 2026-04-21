import { ArrowLeft, Star, MapPin, Calendar, Clock, MessageSquare, Video, ArrowRight, Heart, GraduationCap, Globe } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { api, fetchWithAuthContent } from "@/lib/api-server";

export default async function TherapistProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const dbTherapist = await api.therapists.getById(id);
  const ratingStats = await fetchWithAuthContent(`/feedback/therapist/${id}/stats`).catch(() => null);

  if (!dbTherapist) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <h2 className="text-2xl font-heading text-foreground">Therapist Not Found</h2>
        <Link href="/dashboard/discover" className="text-primary hover:underline">Return to Marketplace</Link>
      </div>
    );
  }

  const avgRating: number | null = ratingStats?.average ? Number(ratingStats.average.toFixed(1)) : null;
  const totalReviews: number = ratingStats?.total ?? 0;
  const reviews: { rating: number; comment?: string; createdAt: string }[] = ratingStats?.reviews ?? [];

  // Map db data to UI
  const specialist = {
    id: dbTherapist.id,
    name: `${dbTherapist.firstName} ${dbTherapist.lastName}`,
    role: dbTherapist.qualifications || dbTherapist.specialities?.[0] || "Clinical Psychotherapist",
    rating: avgRating,
    reviews: totalReviews,
    bio: dbTherapist.bio || "Specializes in comprehensive mental health support.",
    image: `https://ui-avatars.com/api/?name=${dbTherapist.firstName}+${dbTherapist.lastName}&background=f8f9fa&color=5f43b2&size=600`,
    experience: dbTherapist.yearsOfExperience ? `${dbTherapist.yearsOfExperience} Years Experience` : "Highly Experienced",
    qualifications: dbTherapist.qualifications || "Accredited Clinical Specialist",
    languages: (dbTherapist.languages && dbTherapist.languages.length > 0) ? dbTherapist.languages : ["English"],
    rate: dbTherapist.hourlyRate ? `₹${dbTherapist.hourlyRate} / session` : "₹1,500 / session",
    tags: dbTherapist.specialities?.length > 0 ? dbTherapist.specialities : ["Mental Health Support"],
    availability: dbTherapist.slots?.slice(0, 3).map((s: any) => ({
      id: s.id,
      day: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][s.dayOfWeek],
      time: s.startTime
    })) || []
  };

  return (
    <div className="space-y-12 pb-24">
      {/* Navigation Header */}
      <header className="flex justify-between items-center bg-surface/50 backdrop-blur-md p-4 px-1 rounded-xl z-10 sticky top-0 border-b border-outline-variant/10">
        <Link href="/dashboard/discover" className="group flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-primary/60 hover:text-primary transition-colors">
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Marketplace
        </Link>
        <div className="flex gap-4">
          <button className="p-3 bg-surface-container-low/50 rounded-2xl hover:bg-surface-container-low transition-colors text-primary/60 hover:text-primary">
            <Heart className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Profile Editorial Section */}
      <div className="flex flex-col lg:flex-row gap-16 relative">
        {/* Profile Image & Status */}
        <div className="w-full lg:w-2/5 flex flex-col items-center">
          <div className="relative aspect-square w-full rounded-2xl overflow-hidden border border-outline-variant/30 shadow-2xl group transition-transform duration-1000 rotate-2 hover:rotate-0">
             <Image 
              src={specialist.image} 
              alt={specialist.name}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-1000"
             />
             <div className="absolute bottom-6 left-6 z-10 px-4 py-2 bg-white/90 backdrop-blur-md rounded-2xl border border-outline-variant/20 shadow-xl flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-primary">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                Available Today
             </div>
          </div>
          <div className="mt-12 flex flex-col items-center text-center">
             {specialist.rating !== null ? (
               <div className="flex items-center gap-2 mb-2">
                 <div className="flex items-center gap-0.5">
                   {[1,2,3,4,5].map(s => (
                     <Star key={s} className={`w-4 h-4 ${s <= Math.round(specialist.rating!) ? "fill-yellow-400 text-yellow-400" : "text-outline-variant/30"}`} />
                   ))}
                 </div>
                 <span className="text-lg font-heading font-medium text-foreground">{specialist.rating}</span>
                 <span className="text-muted-foreground text-sm font-medium">({specialist.reviews} {specialist.reviews === 1 ? "review" : "reviews"})</span>
               </div>
             ) : (
               <p className="text-xs text-muted-foreground/50 mb-2">No reviews yet</p>
             )}
             <h2 className="text-4xl font-heading text-primary font-medium tracking-tight mt-6 mb-6">{specialist.rate}</h2>
             <div className="flex flex-col gap-3 w-full">
                <Link 
                  href={`/dashboard/sessions/book/${specialist.id}`} 
                  className="w-full bg-primary text-primary-foreground py-4 rounded-2xl font-bold uppercase tracking-[0.15em] text-[10px] shadow-lg shadow-primary/20 hover:shadow-xl hover:-translate-y-1 transition-all text-center flex items-center justify-center gap-2"
                >
                  <Video className="w-3.5 h-3.5" />
                  Book Instant Session
                </Link>
                <p className="text-[10px] text-muted-foreground/60 font-bold uppercase tracking-widest text-center">
                  Secure & Confidential Tele-health
                </p>
             </div>
          </div>
        </div>

        {/* Profile Content */}
        <div className="flex-1 space-y-12 px-2">
           <div className="space-y-4">
              <div className="flex items-center gap-3">
                <p className="text-xs font-bold uppercase tracking-widest text-primary/60">{specialist.role}</p>
                <span className="w-1 h-1 rounded-full bg-outline-variant/30" />
                <p className="text-xs font-bold uppercase tracking-widest text-primary/60">{specialist.experience}</p>
              </div>
              <h1 className="text-5xl font-heading font-normal text-foreground leading-[1.1] tracking-tight">{specialist.name}</h1>
              <p className="text-sm font-medium text-muted-foreground italic flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5" /> Virtual Specialist • Tele-health Authorized
              </p>
           </div>

           <div className="space-y-6">
              <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground/40 pb-2 border-b border-outline-variant/10 w-fit">Editorial Bio</h3>
              <p className="text-xl text-foreground font-sans leading-relaxed tracking-tight">
                {specialist.bio}
              </p>
           </div>

           <div className="grid grid-cols-2 lg:grid-cols-3 gap-8">
              <div className="p-6 bg-surface-container-low/50 rounded-xl border border-outline-variant/10">
                 <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground/40 mb-3 flex items-center gap-2">
                   <Clock className="w-3 h-3" /> Experience
                 </p>
                 <p className="text-lg font-heading text-primary font-medium">{specialist.experience}</p>
              </div>
              <div className="p-6 bg-surface-container-low/50 rounded-xl border border-outline-variant/10">
                 <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground/40 mb-3 flex items-center gap-2">
                   <GraduationCap className="w-3 h-3" /> Education
                 </p>
                 <p className="text-sm font-medium text-foreground tracking-tight leading-relaxed">{specialist.qualifications}</p>
              </div>
              <div className="p-6 bg-surface-container-low/50 rounded-xl border border-outline-variant/10">
                 <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground/40 mb-3 flex items-center gap-2">
                   <Globe className="w-3 h-3" /> Languages
                 </p>
                 <p className="text-sm font-medium text-foreground tracking-tight leading-relaxed break-words">{specialist.languages.join(", ")}</p>
              </div>
           </div>

           <div className="space-y-6">
              <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground/40 pb-2 border-b border-outline-variant/10 w-fit">Specializations</h3>
              <div className="flex flex-wrap gap-3">
                 {specialist.tags.map((tag: string) => (
                   <span key={tag} className="px-5 py-2.5 bg-surface-container-lowest text-primary text-xs font-bold tracking-tight rounded-2xl border border-outline-variant/20 hover:border-primary/40 transition-colors cursor-default">
                     {tag}
                   </span>
                 ))}
              </div>
           </div>

           {/* Patient Reviews */}
           {reviews.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground/40 pb-2 border-b border-outline-variant/10 w-fit flex items-center gap-2">
                <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" /> Patient Reviews
              </h3>
              <div className="space-y-3">
                {reviews.map((review, i) => (
                  <div key={i} className="p-4 bg-surface-container-low/50 rounded-xl border border-outline-variant/10">
                    <div className="flex items-center gap-1 mb-2">
                      {[1,2,3,4,5].map(s => (
                        <Star key={s} className={`w-3.5 h-3.5 ${s <= review.rating ? "fill-yellow-400 text-yellow-400" : "text-outline-variant/30"}`} />
                      ))}
                      <span className="ml-2 text-[10px] text-muted-foreground/50">
                        {new Date(review.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                      </span>
                    </div>
                    {review.comment && (
                      <p className="text-sm text-muted-foreground italic leading-relaxed">"{review.comment}"</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
           )}

            {/* Availability Ticker - Optimized Layout */}
            <div className="p-8 bg-primary/[0.03] rounded-[2.5rem] border border-primary/10 group hover:shadow-2xl hover:shadow-primary/5 transition-all duration-700 overflow-hidden relative">
               <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
               <div className="flex flex-col lg:flex-row items-center justify-between gap-10 z-10 relative">
                  <div className="flex flex-col text-center lg:text-left">
                     <div className="flex items-center justify-center lg:justify-start gap-2 mb-2">
                       <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                       <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-primary/60">Live Availability</h3>
                     </div>
                     <h2 className="text-3xl font-heading font-normal text-primary">Next Open Sessions</h2>
                     <p className="text-sm text-muted-foreground mt-2">Reserve your preferred time slot for a personalized consultation.</p>
                  </div>
                  
                  <div className="flex-1 flex flex-wrap justify-center gap-3">
                     {specialist.availability.map((slot: any) => (
                       <Link 
                        key={slot.id} 
                        href={`/dashboard/sessions/book/${specialist.id}`}
                        className="flex flex-col items-center bg-white border border-primary/10 px-8 py-4 rounded-[1.5rem] hover:bg-primary hover:text-white hover:border-primary transition-all duration-300 shadow-sm hover:shadow-xl group/slot"
                       >
                          <span className="text-[10px] font-bold uppercase tracking-widest text-primary/40 group-hover/slot:text-white/60 mb-1">{slot.day}</span>
                          <span className="text-lg font-heading tracking-tight">{slot.time}</span>
                       </Link>
                     ))}
                     {specialist.availability.length === 0 && (
                       <div className="text-sm text-primary/60 italic bg-white/50 backdrop-blur-sm px-6 py-4 rounded-2xl border border-primary/10">
                         No available sessions this week. Please check back later.
                       </div>
                     )}
                  </div>

                  <Link href={`/dashboard/sessions/book/${specialist.id}`} className="shrink-0 w-16 h-16 rounded-full bg-primary flex items-center justify-center text-primary-foreground group-hover:scale-110 transition-transform shadow-xl shadow-primary/20">
                     <ArrowRight className="w-6 h-6" />
                  </Link>
               </div>
            </div>
         </div>
       </div>
     </div>
   );
}
