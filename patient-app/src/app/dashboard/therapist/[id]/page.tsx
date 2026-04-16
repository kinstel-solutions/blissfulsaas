import { ArrowLeft, Star, MapPin, Calendar, Clock, MessageSquare, Video, ArrowRight, Heart, GraduationCap, Globe } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { api } from "@/lib/api-server";

export default async function TherapistProfilePage({ params }: { params: { id: string } }) {
  const { id } = await params;
  const dbTherapist = await api.therapists.getById(id);

  if (!dbTherapist) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <h2 className="text-2xl font-heading text-foreground">Therapist Not Found</h2>
        <Link href="/dashboard/discover" className="text-primary hover:underline">Return to Marketplace</Link>
      </div>
    );
  }

  // Map db data to UI
  const specialist = {
    id: dbTherapist.id,
    name: `${dbTherapist.firstName} ${dbTherapist.lastName}`,
    role: dbTherapist.qualifications || dbTherapist.specialities?.[0] || "Clinical Psychotherapist",
    rating: 4.9, 
    reviews: 128,
    bio: dbTherapist.bio || "Specializes in comprehensive mental health support.",
    image: `https://ui-avatars.com/api/?name=${dbTherapist.firstName}+${dbTherapist.lastName}&background=f8f9fa&color=5f43b2&size=600`,
    experience: dbTherapist.yearsOfExperience ? `${dbTherapist.yearsOfExperience} Years Experience` : "Highly Experienced",
    qualifications: dbTherapist.qualifications || "Accredited Clinical Specialist",
    languages: (dbTherapist.languages && dbTherapist.languages.length > 0) ? dbTherapist.languages : ["English"],
    rate: dbTherapist.hourlyRate ? `₹${dbTherapist.hourlyRate} / session` : "₹1,500 / session",
    tags: dbTherapist.specialities?.length > 0 ? dbTherapist.specialities : ["Mental Health Support"],
    availability: dbTherapist.slots?.slice(0, 3).map((s: any) => ({
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
             <div className="flex items-center gap-2 mb-2 text-primary">
                <Star className="w-5 h-5 fill-primary" />
                <span className="text-xl font-heading font-medium">{specialist.rating}</span>
                <span className="text-muted-foreground text-sm font-medium">({specialist.reviews} reviews)</span>
             </div>
             <h2 className="text-4xl font-heading text-primary font-medium tracking-tight mt-6 mb-6">{specialist.rate}</h2>
             <div className="flex gap-2 w-full">
                <Link href={`/dashboard/sessions/book/${specialist.id}`} className="flex-1 bg-primary text-primary-foreground py-5 rounded-2xl font-bold uppercase tracking-[0.1em] text-xs shadow-lg hover:shadow-2xl hover:-translate-y-1 transition-all text-center">
                  Book Instant Sanctuary
                </Link>
             </div>
          </div>
        </div>

        {/* Profile Content */}
        <div className="flex-1 space-y-12 px-2">
           <div className="space-y-4">
              <p className="text-xs font-bold uppercase tracking-widest text-primary/60">{specialist.role}</p>
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

           {/* Availability Ticker */}
           <div className="p-4 md:p-8 bg-primary/5 rounded-xl border border-primary/10 group hover:shadow-xl transition-all duration-700 overflow-hidden relative">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" />
              <div className="flex flex-col md:flex-row items-center justify-between gap-8 z-10 relative">
                 <div className="flex flex-col">
                    <h3 className="text-xl font-heading font-normal text-primary">Next Open Sessions</h3>
                    <p className="text-xs text-primary/40 font-bold uppercase mt-1">Book your time slot</p>
                 </div>
                 <div className="flex gap-4">
                    {specialist.availability.map((slot: any) => (
                      <div key={`${slot.day}-${slot.time}`} className="flex flex-col items-center bg-white/50 backdrop-blur-md px-6 py-3 rounded-2xl border border-primary/20 hover:bg-primary hover:text-primary-foreground transition-all cursor-pointer">
                         <span className="text-xs font-bold uppercase tracking-widest opacity-60 mb-1">{slot.day}</span>
                         <span className="text-sm font-bold tracking-tight">{slot.time}</span>
                      </div>
                    ))}
                    {specialist.availability.length === 0 && (
                      <div className="text-sm text-primary/60 italic">No available sessions this week.</div>
                    )}
                 </div>
                 <Link href={`/dashboard/sessions/book/${specialist.id}`} className="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-primary-foreground group-hover:scale-110 transition-transform shadow-lg">
                    <ArrowRight className="w-5 h-5" />
                  </Link>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}
