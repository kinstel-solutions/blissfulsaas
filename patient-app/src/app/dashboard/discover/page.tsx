"use client";

import { useEffect, useState } from "react";
import { ArrowRight, Search, Filter, Star, Sparkles, Loader2, GraduationCap, Globe, Clock, ShieldCheck } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { api } from "@/lib/api";

export default function DiscoverPage() {
  const [therapists, setTherapists] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadTherapists() {
      try {
        const data = await api.therapists.getVerified();
        setTherapists(data);
      } catch (err) {
        console.error("Discovery failed:", err);
      } finally {
        setLoading(false);
      }
    }
    loadTherapists();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Loader2 className="w-12 h-12 text-primary animate-spin" />
        <p className="text-muted-foreground font-medium uppercase tracking-widest text-xs">Curating your station...</p>
      </div>
    );
  }

  return (
    <div className="space-y-12 pb-24">
      {/* Editorial Header */}
      <div className="relative pt-8 pb-4">
        <h1 className="text-5xl font-heading font-normal text-foreground mb-4 tracking-tight">
          Find Your <span className="text-primary italic">Specialist.</span>
        </h1>
        <p className="text-muted-foreground text-lg max-w-xl leading-relaxed">
          Select from our curated network of world-class specialists, each handpicked for their empathy and architectural approach to healing.
        </p>
      </div>

      {/* Discovery Search Tray */}
      <div className="bg-surface-container-low/50 backdrop-blur-md p-2 rounded-xl border border-outline-variant/30 flex flex-col md:flex-row gap-2 shadow-sm">
        <div className="flex-1 relative flex items-center">
          <Search className="absolute left-6 w-4 h-4 text-primary/40" />
          <input 
            type="text" 
            placeholder="Search by specialty, name, or concern..." 
            className="w-full h-16 bg-transparent pl-14 pr-6 text-sm font-medium outline-none placeholder:text-muted-foreground/50"
          />
        </div>
        <div className="w-px bg-outline-variant/20 hidden md:block" />
        <button className="h-16 px-4 md:px-8 flex items-center justify-between gap-4 text-xs font-bold uppercase tracking-widest text-primary/60 hover:text-primary transition-colors">
          <Filter className="w-4 h-4" />
          Filters
        </button>
        <button className="h-16 bg-primary text-primary-foreground px-5 md:px-10 rounded-2xl font-bold text-xs uppercase tracking-widest shadow-md hover:shadow-xl hover:-translate-y-0.5 transition-all">
          Search
        </button>
      </div>

      {/* Marketplace Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-10">
        {therapists.map((t) => (
          <div key={t.id} className="group bg-surface-container-lowest border border-outline-variant/30 rounded-2xl overflow-hidden hover:shadow-2xl hover:border-primary/20 transition-all duration-700 flex flex-col relative">
            
            {/* Experience Badge */}
            <div className="absolute top-6 left-6 z-10 px-3 py-1.5 rounded-full bg-white/90 backdrop-blur-md border border-outline-variant/10 text-[10px] font-bold uppercase tracking-widest text-primary flex items-center gap-1.5 shadow-sm">
              <Clock className="w-3 h-3 text-primary/40" /> {t.yearsOfExperience || 5}+ Years Exp
            </div>

            <div className="absolute top-6 right-6 z-10 px-3 py-1 rounded-full bg-white/90 backdrop-blur-md border border-outline-variant/20 text-xs font-bold uppercase tracking-tighter text-primary flex items-center gap-1 shadow-sm">
              <Star className="w-3 h-3 fill-primary" /> 4.9
            </div>
            
            <div className="aspect-[4/3] overflow-hidden relative">
               <Image 
                src={t.profileImageUrl || `https://ui-avatars.com/api/?name=${t.firstName}+${t.lastName}&background=f8f9fa&color=5f43b2&size=400`} 
                alt={`${t.firstName} ${t.lastName}`}
                fill
                className="object-cover group-hover:scale-110 transition-transform duration-1000"
               />
               <div className="absolute inset-0 bg-linear-to-t from-surface-container-lowest via-transparent to-transparent opacity-60" />
            </div>

            <div className="p-4 md:p-8 flex flex-col flex-1">
               <div className="flex items-start justify-between mb-4">
                 <div>
                    <h3 className="text-2xl font-heading font-medium text-foreground">{t.firstName} {t.lastName}</h3>
                    <p className="text-xs font-bold text-primary/60 uppercase tracking-widest flex items-center gap-2 mt-1">
                      <GraduationCap className="w-3 h-3" /> {t.qualifications || "Clinician Specialist"}
                    </p>
                 </div>
               </div>
               
               <p className="text-sm text-muted-foreground line-clamp-2 mb-6 leading-relaxed">
                 {t.bio || "No biographical information provided yet."}
               </p>

               <div className="flex flex-wrap gap-2 mb-8">
                 {t.specialities?.slice(0, 4).map((tag: string) => (
                   <span key={tag} className="px-3 py-1 bg-surface-container-low text-muted-foreground text-[10px] font-bold uppercase tracking-widest rounded-lg border border-outline-variant/10">
                     {tag}
                   </span>
                 ))}
                 {t.specialities?.length > 4 && (
                   <span className="text-[10px] font-bold text-muted-foreground/40 self-center">+{t.specialities.length - 4} more</span>
                 )}
               </div>

               {/* MVP Trust Indicators */}
               <div className="grid grid-cols-2 gap-4 mb-8 py-4 border-y border-outline-variant/10">
                  <div className="flex items-center gap-3">
                    <Clock className="w-4 h-4 text-primary/40" />
                    <div className="flex flex-col">
                      <span className="text-[10px] uppercase font-bold text-muted-foreground/40 leading-none mb-1">Background</span>
                      <span className="text-sm font-bold text-foreground">{t.yearsOfExperience || 5}+ Years</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Globe className="w-4 h-4 text-primary/40" />
                    <div className="flex flex-col">
                      <span className="text-[10px] uppercase font-bold text-muted-foreground/40 leading-none mb-1">Languages</span>
                      <span className="text-sm font-bold text-foreground truncate">{t.languages?.[0] || "English"}{t.languages?.length > 1 ? `, +${t.languages.length - 1}` : ""}</span>
                    </div>
                  </div>
               </div>

               <div className="mt-auto flex items-center justify-between">
                  <div className="flex flex-col">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/40">Session Fee</span>
                    <span className="text-2xl font-heading text-primary">₹{t.hourlyRate || "1,500"}<span className="text-xs font-normal text-muted-foreground">/hr</span></span>
                  </div>
                  <Link href={`/dashboard/therapist/${t.id}`} className="px-6 py-3 rounded-2xl bg-slate-900 text-white text-xs font-bold uppercase tracking-widest flex items-center gap-3 hover:bg-primary transition-all duration-300">
                    Book Now <ArrowRight className="w-4 h-4" />
                  </Link>
               </div>
            </div>
          </div>
        ))}
        {therapists.length === 0 && (
          <div className="col-span-1 md:col-span-3 py-20 text-center bg-surface-container-low/20 rounded-2xl border-2 border-dashed border-outline-variant/30">
            <p className="text-muted-foreground italic">No practitioners have joined this station yet. Check back soon.</p>
          </div>
        )}
      </div>
    </div>
  );
}
