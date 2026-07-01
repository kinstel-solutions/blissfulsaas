"use client";

import { useEffect, useState, useRef } from "react";
import { 
  ArrowRight, Search, Star, Sparkles, Loader2, GraduationCap, 
  Globe, Clock, ShieldCheck, ChevronLeft, ChevronRight, Brain, Heart, 
  Smile, Users, Flame, Sun, CloudRain, Shield, Compass 
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { api } from "@/lib/api";
import { LandingNavbar } from "@/components/sections/LandingNavbar";
import { BreathingLoader } from "@/components/BreathingLoader";
import { AlexButton } from "@/components/ui/AlexButton";

// Helper to get custom Lucide icon based on speciality name
const getSpecialityIcon = (spec: string) => {
  const s = spec.toLowerCase();
  if (s.includes("anxiety") || s.includes("stress")) return <Sparkles className="w-4 h-4" />;
  if (s.includes("depress") || s.includes("grief") || s.includes("bipolar") || s.includes("mood")) return <CloudRain className="w-4 h-4" />;
  if (s.includes("trauma") || s.includes("ptsd") || s.includes("abuse")) return <Shield className="w-4 h-4" />;
  if (s.includes("relation") || s.includes("couple") || s.includes("love") || s.includes("lgbtq") || s.includes("family")) return <Heart className="w-4 h-4" />;
  if (s.includes("child") || s.includes("parent") || s.includes("teen")) return <Users className="w-4 h-4" />;
  if (s.includes("mindful") || s.includes("meditat") || s.includes("peace")) return <Sun className="w-4 h-4" />;
  if (s.includes("adhd") || s.includes("ocd") || s.includes("focus") || s.includes("hyper")) return <Brain className="w-4 h-4" />;
  if (s.includes("work") || s.includes("burnout") || s.includes("career")) return <Flame className="w-4 h-4" />;
  return <Smile className="w-4 h-4" />; // fallback
};

export default function DiscoverPage() {
  const [therapists, setTherapists] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [selectedSpeciality, setSelectedSpeciality] = useState<string | null>(null);
  const [currentWordIdx, setCurrentWordIdx] = useState(0);
  const [animationClass, setAnimationClass] = useState("translate-y-0 opacity-100 transition-all duration-200");

  const words = ["Specialty...", "Name...", "Concern..."];

  useEffect(() => {
    const interval = setInterval(() => {
      // Step 1: Slide down and fade out
      setAnimationClass("translate-y-2 opacity-0 transition-all duration-200");
      
      setTimeout(() => {
        // Step 2: Swap text and position it above (instantly, no transition)
        setCurrentWordIdx((prev) => (prev + 1) % words.length);
        setAnimationClass("translate-y-[-8px] opacity-0");
        
        // Step 3: Slide down to center and fade in
        setTimeout(() => {
          setAnimationClass("translate-y-0 opacity-100 transition-all duration-200");
        }, 20);
      }, 200);
    }, 1500);
    return () => clearInterval(interval);
  }, []);

  const carouselRef = useRef<HTMLDivElement>(null);

  const scrollLeft = () => {
    if (carouselRef.current) {
      carouselRef.current.scrollBy({ left: -280, behavior: "smooth" });
    }
  };

  const scrollRight = () => {
    if (carouselRef.current) {
      carouselRef.current.scrollBy({ left: 280, behavior: "smooth" });
    }
  };

  const getSpecialityCount = (spec: string) => {
    return therapists.filter(t => 
      (t.specialities || []).some((s: string) => s.toLowerCase() === spec.toLowerCase())
    ).length;
  };

  useEffect(() => {
    loadTherapists(1);
  }, []);

  async function loadTherapists(pageNum: number, isMore: boolean = false) {
    if (isMore) setLoadingMore(true);
    else setLoading(true);

    try {
      const response = await api.therapists.getVerified(pageNum, 12);
      if (isMore) {
        setTherapists(prev => [...prev, ...response.data]);
      } else {
        setTherapists(response.data);
      }
      setHasMore(pageNum < response.totalPages);
      setPage(pageNum);
    } catch (err) {
      console.error("Discovery failed:", err);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }

  const handleLoadMore = () => {
    loadTherapists(page + 1, true);
  };

  const activeSpecialities = Array.from(
    new Set(therapists.flatMap((t) => t.specialities || []))
  ).filter((s): s is string => typeof s === "string" && s.trim() !== "");

  const filteredTherapists = therapists.filter((t) => {
    if (selectedSpeciality) {
      const hasSpeciality = (t.specialities || []).some((s: string) =>
        s.toLowerCase() === selectedSpeciality.toLowerCase()
      );
      if (!hasSpeciality) return false;
    }

    const search = searchQuery.toLowerCase().trim();
    if (!search) return true;

    const fullName = `${t.firstName} ${t.lastName}`.toLowerCase();
    const bio = (t.bio || "").toLowerCase();
    const specialities = (t.specialities || []).some((s: string) =>
      s.toLowerCase().includes(search)
    );

    return fullName.includes(search) || bio.includes(search) || specialities;
  });

  if (loading) {
    return <BreathingLoader subtext="Curating specialists..." />;
  }


  return (
    <div className="min-h-screen bg-[#F8FAF9]">
      <LandingNavbar portal="patient" />
      <div className="space-y-12 pb-24 max-w-7xl mx-auto px-6 pt-32">
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
      <div className="bg-surface-container-low/50 backdrop-blur-md p-1.5 rounded-xl border border-outline-variant/30 flex flex-row gap-1 shadow-sm items-center">
        <div className="flex-1 relative flex items-center">
          <Search className="absolute left-3 sm:left-4 w-4 h-4 text-primary/40" />
          <input
            type="text"
            className="w-full h-10 sm:h-12 bg-transparent pl-9 sm:pl-11 pr-2 sm:pr-4 text-[13px] sm:text-base font-heading font-semibold outline-none tracking-wider text-foreground"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {!searchQuery && (
            <span className="absolute left-9 sm:left-11 text-[13px] sm:text-base font-heading font-semibold text-slate-700 sm:text-muted-foreground/80 pointer-events-none flex gap-1 items-center tracking-wider">
              <span>Search by</span>
              <span
                className={`text-primary italic inline-block ${animationClass}`}
              >
                {words[currentWordIdx]}
              </span>
            </span>
          )}
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          <AlexButton
            size="md"
            className="shadow-md shrink-0 h-10 sm:h-12 !py-0 text-[13px] sm:text-lg gap-1.5 sm:gap-3 pl-1 sm:pl-2 pr-2.5 sm:pr-4 [&_.cta-icon-circle]:w-7 [&_.cta-icon-circle]:h-7 sm:[&_.cta-icon-circle]:w-9 sm:[&_.cta-icon-circle]:h-9 [&_svg]:w-3 [&_svg]:h-3 sm:[&_svg]:w-4 sm:[&_svg]:h-4"
          >
            Search
          </AlexButton>
        </div>
      </div>

      {/* Specialisations Carousel */}
      {activeSpecialities.length > 0 && (
        <div className="space-y-4 pt-2">
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-primary" />
              <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-primary/60">Explore Areas of Expertise</h2>
            </div>
            {selectedSpeciality && (
              <button 
                onClick={() => setSelectedSpeciality(null)}
                className="text-xs font-bold text-primary hover:text-primary/80 transition-colors underline decoration-2 underline-offset-4 cursor-pointer"
              >
                Show All Specialists
              </button>
            )}
          </div>
          
          <div className="relative group/carousel">
            {/* Left fade overlay */}
            <div className="absolute left-0 top-0 bottom-0 w-4 bg-gradient-to-r from-[#F8FAF9] to-transparent pointer-events-none z-10" />
            
            {/* Right fade overlay */}
            <div className="absolute right-0 top-0 bottom-0 w-4 bg-gradient-to-l from-[#F8FAF9] to-transparent pointer-events-none z-10" />

            {/* Left Scroll Button */}
            <button 
              onClick={scrollLeft}
              className="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white border border-outline-variant/30 text-primary shadow-md hover:bg-primary hover:text-white transition-all duration-300 flex items-center justify-center z-20 opacity-0 group-hover/carousel:opacity-100 hover:scale-110 cursor-pointer"
              aria-label="Scroll left"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            {/* Right Scroll Button */}
            <button 
              onClick={scrollRight}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white border border-outline-variant/30 text-primary shadow-md hover:bg-primary hover:text-white transition-all duration-300 flex items-center justify-center z-20 opacity-0 group-hover/carousel:opacity-100 hover:scale-110 cursor-pointer"
              aria-label="Scroll right"
            >
              <ChevronRight className="w-5 h-5" />
            </button>

            {/* Horizontally scrollable list */}
            <div 
              ref={carouselRef}
              className="flex gap-4 overflow-x-auto [&::-webkit-scrollbar]:hidden py-3 px-1 scroll-smooth snap-x"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              {/* All Option Card */}
              <div
                onClick={() => setSelectedSpeciality(null)}
                className={`snap-start flex items-center gap-3 px-6 py-4 rounded-[1.5rem] transition-all duration-300 cursor-pointer select-none shrink-0 ${
                  selectedSpeciality === null
                    ? "bg-primary border-primary text-white shadow-xl shadow-primary/10 -translate-y-0.5"
                    : "bg-white/80 border border-outline-variant/30 text-muted-foreground/80 hover:border-primary/30 hover:bg-white hover:-translate-y-0.5 hover:shadow-md"
                }`}
              >
                <Compass className="w-4 h-4" />
                <span className="text-sm font-semibold tracking-tight">All Specialties</span>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold transition-colors ${
                  selectedSpeciality === null 
                    ? "bg-white/20 text-white" 
                    : "bg-primary/5 text-primary"
                }`}>
                  {therapists.length}
                </span>
              </div>

              {/* Dynamic Speciality Cards */}
              {activeSpecialities.map((spec) => {
                const count = getSpecialityCount(spec);
                const isSelected = selectedSpeciality?.toLowerCase() === spec.toLowerCase();
                return (
                  <div
                    key={spec}
                    onClick={() => setSelectedSpeciality(isSelected ? null : spec)}
                    className={`snap-start flex items-center gap-3 px-6 py-4 rounded-[1.5rem] transition-all duration-300 cursor-pointer select-none shrink-0 ${
                      isSelected
                        ? "bg-primary border-primary text-white shadow-xl shadow-primary/10 -translate-y-0.5"
                        : "bg-white/80 border border-outline-variant/30 text-muted-foreground/80 hover:border-primary/30 hover:bg-white hover:-translate-y-0.5 hover:shadow-md"
                    }`}
                  >
                    {getSpecialityIcon(spec)}
                    <span className="text-sm font-semibold tracking-tight">{spec}</span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold transition-colors ${
                      isSelected 
                        ? "bg-white/20 text-white" 
                        : "bg-primary/5 text-primary"
                    }`}>
                      {count}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Marketplace Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-10">
        {filteredTherapists.map((t) => (
          <div key={t.id} className="group bg-surface-container-lowest border border-outline-variant/30 rounded-xl overflow-hidden hover:shadow-2xl hover:border-primary/20 transition-all duration-700 flex flex-col relative">

            {/* Experience Badge */}
            <div className="absolute top-6 left-6 z-10 px-3 py-1.5 rounded-full bg-white/90 backdrop-blur-md border border-outline-variant/10 text-[10px] font-bold uppercase tracking-widest text-primary flex items-center gap-1.5 shadow-sm">
              <Clock className="w-3 h-3 text-primary/40" /> {t.yearsOfExperience || 5}+ Years Exp
            </div>

            <div className="absolute top-6 right-6 z-10 px-3 py-1 rounded-full bg-white/90 backdrop-blur-md border border-outline-variant/20 text-xs font-bold uppercase tracking-tighter text-primary flex items-center gap-1 shadow-sm">
              <Star className={`w-3 h-3 ${t.averageRating ? "fill-primary" : "text-primary/20"}`} />
              {t.averageRating ? t.averageRating : "New"}
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
                <Link
                  href={`/therapist/${t.id}`}
                  className="px-6 py-3 rounded-xl bg-slate-900 text-white text-xs font-bold uppercase tracking-widest flex items-center gap-3 group-hover:bg-primary transition-all duration-300 after:absolute after:inset-0 after:z-[1]"
                >
                  Book Now <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        ))}
        {filteredTherapists.length === 0 && (
          <div className="col-span-1 md:col-span-3 py-20 text-center bg-surface-container-low/20 rounded-xl border-2 border-dashed border-outline-variant/30 flex flex-col items-center justify-center gap-4">
            <p className="text-muted-foreground italic">
              {therapists.length === 0 
                ? "No practitioners have joined this station yet. Check back soon." 
                : "No practitioners match your current search or specialty filter."}
            </p>
            {(searchQuery || selectedSpeciality) && (
              <button
                onClick={() => {
                  setSearchQuery("");
                  setSelectedSpeciality(null);
                }}
                className="px-6 py-2.5 bg-primary text-white text-xs font-bold uppercase tracking-widest rounded-xl hover:bg-primary/95 transition-all shadow-md cursor-pointer"
              >
                Reset Filters
              </button>
            )}
          </div>
        )}
      </div>

      {hasMore && (
        <div className="flex justify-center mt-16">
          <button
            onClick={handleLoadMore}
            disabled={loadingMore}
            className="px-12 py-5 rounded-xl bg-white border border-outline-variant/30 text-primary font-bold uppercase tracking-widest text-xs shadow-sm hover:shadow-xl hover:border-primary/20 hover:-translate-y-1 transition-all flex items-center gap-3 disabled:opacity-50"
          >
            {loadingMore ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              "Load More Specialists"
            )}
          </button>
        </div>
        )}
      </div>
    </div>
  );
}
