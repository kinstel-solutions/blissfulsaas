import { ArrowLeft, Star, MapPin, Calendar, Clock, MessageSquare, Video, ArrowRight, Heart, GraduationCap, Globe } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { api, fetchWithAuthContent } from "@/lib/api-server";
import { LandingNavbar } from "@/components/sections/LandingNavbar";
import { createClient } from "@/lib/supabase/server";

export default async function TherapistProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser().catch(() => ({ data: { user: null } }));

  const dbTherapist = await api.therapists.getById(id);
  const ratingStats = await fetchWithAuthContent(`/feedback/therapist/${id}/stats`).catch(() => null);

  if (!dbTherapist) {
    return (
      <div className="min-h-screen bg-[#F8FAF9]">
        <LandingNavbar portal="patient" initialUser={user} />
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 pt-32">
          <h2 className="text-2xl font-heading text-foreground">Therapist Not Found</h2>
          <Link href="/discover" className="text-primary hover:underline">Return to Marketplace</Link>
        </div>
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
    image: dbTherapist.profileImageUrl || `https://ui-avatars.com/api/?name=${dbTherapist.firstName}+${dbTherapist.lastName}&background=f8f9fa&color=5f43b2&size=600`,
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
    <div className="min-h-screen bg-[#F8FAF9]">
      <LandingNavbar portal="patient" initialUser={user} />
      <div className="space-y-12 pb-24 max-w-7xl mx-auto px-6 pt-32">
        {/* Navigation Header */}
      <header className="flex justify-between items-center bg-surface/50 backdrop-blur-md p-4 px-1 rounded-xl z-10 sticky top-0 border-b border-outline-variant/10">
        <Link href="/discover" className="group flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-primary/60 hover:text-primary transition-colors">
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Marketplace
        </Link>
      </header>

      {/* Profile Editorial Section */}
      <div className="flex flex-col lg:flex-row gap-16 relative">
        {/* Profile Image & Status */}
        <div className="w-full lg:w-2/5 flex flex-col items-center">
          <div className="relative aspect-square w-full rounded-xl overflow-hidden border border-outline-variant/30 shadow-2xl group transition-transform duration-1000 rotate-2 hover:rotate-0">
             <Image 
              src={specialist.image} 
              alt={specialist.name}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-1000"
             />
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
               <p className="text-base text-muted-foreground/50 mb-2">No reviews yet</p>
             )}
             <h2 className="text-4xl font-heading text-primary font-medium tracking-tight mt-6 mb-6">{specialist.rate}</h2>
             <div className="flex flex-col gap-3 w-full">
                <Link 
                  href={`/dashboard/sessions/book/${specialist.id}`} 
                  className="w-full bg-primary text-primary-foreground py-4 rounded-lg font-bold uppercase tracking-[0.15em] text-[10px] shadow-lg shadow-primary/20 hover:shadow-xl hover:-translate-y-1 transition-all text-center flex items-center justify-center gap-2"
                >
                  <Video className="w-3.5 h-3.5" />
                  Book Instant Session
                </Link>
                <p className="text-[10px] text-muted-foreground/60 font-bold uppercase tracking-widest text-center">
                  Secure & Confidential
                </p>
             </div>
          </div>
        </div>

        {/* Profile Content */}
        <div className="flex-1 space-y-12 px-2">
           <div className="space-y-4">
              <div className="flex items-center gap-3">
                <p className="text-base font-bold uppercase tracking-widest text-primary/60">{specialist.role}</p>
                <span className="w-1 h-1 rounded-full bg-outline-variant/30" />
                <p className="text-base font-bold uppercase tracking-widest text-primary/60">{specialist.experience}</p>
              </div>
              <h1 className="text-5xl font-heading font-normal text-foreground leading-[1.1] tracking-tight">{specialist.name}</h1>
              <p className="text-sm font-medium text-muted-foreground italic flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5" /> Verified Therapist
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
                 <p className="text-base font-bold uppercase tracking-widest text-muted-foreground/40 mb-3 flex items-center gap-2">
                   <Clock className="w-3 h-3" /> Experience
                 </p>
                 <p className="text-lg font-heading text-primary font-medium">{specialist.experience}</p>
              </div>
              <div className="p-6 bg-surface-container-low/50 rounded-xl border border-outline-variant/10">
                 <p className="text-base font-bold uppercase tracking-widest text-muted-foreground/40 mb-3 flex items-center gap-2">
                   <GraduationCap className="w-3 h-3" /> Education
                 </p>
                 <p className="text-sm font-medium text-foreground tracking-tight leading-relaxed">{specialist.qualifications}</p>
              </div>
              <div className="p-6 bg-surface-container-low/50 rounded-xl border border-outline-variant/10">
                 <p className="text-base font-bold uppercase tracking-widest text-muted-foreground/40 mb-3 flex items-center gap-2">
                   <Globe className="w-3 h-3" /> Languages
                 </p>
                 <p className="text-sm font-medium text-foreground tracking-tight leading-relaxed break-words">{specialist.languages.join(", ")}</p>
              </div>
           </div>

           {/* Introduction Video */}
           {dbTherapist.videoUrl && (
             <div className="space-y-6">
               <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground/40 pb-2 border-b border-outline-variant/10 w-fit">Clinical Introduction</h3>
               <div className="w-full max-w-2xl aspect-video rounded-3xl overflow-hidden border border-outline-variant/20 shadow-xl bg-surface-container-low">
                 {(() => {
                   const url = dbTherapist.videoUrl;
                   let embedUrl = url;
                   
                   if (url.includes('youtube.com/watch?v=')) {
                     const id = url.split('v=')[1]?.split('&')[0];
                     embedUrl = `https://www.youtube.com/embed/${id}`;
                   } else if (url.includes('youtu.be/')) {
                     const id = url.split('youtu.be/')[1]?.split('?')[0];
                     embedUrl = `https://www.youtube.com/embed/${id}`;
                   } else if (url.includes('vimeo.com/')) {
                     const id = url.split('vimeo.com/')[1]?.split('?')[0];
                     embedUrl = `https://player.vimeo.com/video/${id}`;
                   } else if (url.includes('loom.com/share/')) {
                     const id = url.split('loom.com/share/')[1]?.split('?')[0];
                     embedUrl = `https://www.loom.com/embed/${id}`;
                   }

                   return (
                     <iframe 
                       src={embedUrl}
                       className="w-full h-full"
                       allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                       allowFullScreen
                     />
                   );
                 })()}
               </div>
               <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-[0.2em] ml-2">
                 Watch {dbTherapist.firstName}'s professional introduction
               </p>
             </div>
           )}

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
          </div>
        </div>
      </div>
    </div>
  );
}
