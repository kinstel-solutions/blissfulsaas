"use client";

import { useEffect, useState, useRef } from "react";
import {
  ArrowRight, Search, Star, Sparkles, Loader2, GraduationCap,
  Globe, Clock, ShieldCheck, ChevronLeft, ChevronRight, Brain, Heart,
  Smile, Users, Flame, Sun, CloudRain, Shield, Compass, X
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { api } from "@/lib/api";
import { LandingNavbar } from "@/components/sections/LandingNavbar";
import { BreathingLoader } from "@/components/BreathingLoader";
import { AlexButton } from "@/components/ui/AlexButton";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";


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

const getNextSlot = (id: string, index: number) => {
  const slots = [
    "Today, 03:00 PM",
    "Today, 03:00 PM",
    "Today, 03:15 PM",
    "Today, 03:30 PM",
    "Today, 03:45 PM",
    "Today, 04:00 PM",
    "Tomorrow, 10:00 AM",
    "Tomorrow, 11:30 AM",
    "Tomorrow, 02:00 PM",
  ];
  return slots[index % slots.length];
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
  const [activeVideoUrl, setActiveVideoUrl] = useState<string | null>(null);

  const getEmbedUrl = (url: string) => {
    if (!url) return "";
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
    return embedUrl;
  };

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
      <div className="space-y-12 pb-24 max-w-6xl mx-auto px-6 pt-32">
        {/* Editorial Header */}
        <div className="relative pt-8 pb-4">
          <h1 className="text-5xl font-heading font-normal text-foreground mb-4 tracking-tight">
            Find Your <span className="text-primary italic">Specialist.</span>
          </h1>
          <p className="text-muted-foreground text-lg max-w-xl leading-relaxed">
            Select from our carefully curated network of highly qualified and experienced specialists, chosen for their clinical expertise, evidence-based approach, and commitment to personalized care.
          </p>
        </div>

        {/* Discovery Search Tray */}
        <div className="bg-surface-container-low/50 backdrop-blur-md p-1 rounded-xl border border-outline-variant/30 flex flex-row gap-1 shadow-sm items-center">
          <div className="flex-1 relative flex items-center">
            <Search className="absolute left-2.5 sm:left-3.5 w-3.5 h-3.5 text-primary/40" />
            <input
              type="text"
              className="w-full h-8 sm:h-10 bg-transparent pl-8 sm:pl-10 pr-2 sm:pr-4 text-[12px] sm:text-sm font-heading font-semibold outline-none tracking-wider text-foreground"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {!searchQuery && (
              <span className="absolute left-8 sm:left-10 text-[12px] sm:text-sm font-heading font-semibold text-slate-700 sm:text-muted-foreground/80 pointer-events-none flex gap-1 items-center tracking-wider">
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
              className="shadow-md shrink-0 h-8 sm:h-10 !py-0 text-[12px] sm:text-sm gap-1 sm:gap-2.5 pl-1 sm:pl-1.5 pr-2 sm:pr-3.5 [&_.cta-icon-circle]:w-6 [&_.cta-icon-circle]:h-6 sm:[&_.cta-icon-circle]:w-8 sm:[&_.cta-icon-circle]:h-8 [&_svg]:w-2.5 [&_svg]:h-2.5 sm:[&_svg]:w-3.5 sm:[&_svg]:h-3.5"
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
                <Button
                  variant="link"
                  onClick={() => setSelectedSpeciality(null)}
                  className="text-xs font-bold text-primary hover:text-primary/80 transition-colors underline decoration-2 underline-offset-4 cursor-pointer p-0 h-auto hover:no-underline"
                >
                  Show All Specialists
                </Button>
              )}
            </div>

            <div className="relative group/carousel">
              {/* Left fade overlay */}
              <div className="absolute left-0 top-0 bottom-0 w-4 bg-gradient-to-r from-[#F8FAF9] to-transparent pointer-events-none z-10" />

              {/* Right fade overlay */}
              <div className="absolute right-0 top-0 bottom-0 w-4 bg-gradient-to-l from-[#F8FAF9] to-transparent pointer-events-none z-10" />

              {/* Left Scroll Button */}
              <Button
                variant="outline"
                onClick={scrollLeft}
                className="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white border border-outline-variant/30 text-primary shadow-md hover:bg-primary hover:text-white transition-all duration-300 flex items-center justify-center z-20 opacity-0 group-hover/carousel:opacity-100 hover:scale-110 cursor-pointer p-0"
                aria-label="Scroll left"
              >
                <ChevronLeft className="w-5 h-5" />
              </Button>

              {/* Right Scroll Button */}
              <Button
                variant="outline"
                onClick={scrollRight}
                className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white border border-outline-variant/30 text-primary shadow-md hover:bg-primary hover:text-white transition-all duration-300 flex items-center justify-center z-20 opacity-0 group-hover/carousel:opacity-100 hover:scale-110 cursor-pointer p-0"
                aria-label="Scroll right"
              >
                <ChevronRight className="w-5 h-5" />
              </Button>

              {/* Horizontally scrollable list */}
              <div
                ref={carouselRef}
                className="flex gap-4 overflow-x-auto [&::-webkit-scrollbar]:hidden py-3 px-1 scroll-smooth snap-x"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
              >
                {/* All Option Card */}
                <div
                  onClick={() => setSelectedSpeciality(null)}
                  className={`snap-start flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all duration-300 cursor-pointer select-none shrink-0 ${selectedSpeciality === null
                    ? "bg-primary border-primary text-white shadow-xl shadow-primary/10 -translate-y-0.5"
                    : "bg-white/80 border border-outline-variant/30 text-muted-foreground/80 hover:border-primary/30 hover:bg-white hover:-translate-y-0.5 hover:shadow-md"
                    }`}
                >
                  <Compass className="w-4 h-4" />
                  <span className="text-sm font-semibold tracking-tight">All Specialties</span>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold transition-colors ${selectedSpeciality === null
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
                      className={`snap-start flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all duration-300 cursor-pointer select-none shrink-0 ${isSelected
                        ? "bg-primary border-primary text-white shadow-xl shadow-primary/10 -translate-y-0.5"
                        : "bg-white/80 border border-outline-variant/30 text-muted-foreground/80 hover:border-primary/30 hover:bg-white hover:-translate-y-0.5 hover:shadow-md"
                        }`}
                    >
                      {getSpecialityIcon(spec)}
                      <span className="text-sm font-semibold tracking-tight">{spec}</span>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold transition-colors ${isSelected
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredTherapists.map((t, index) => (
            <Card
              key={t.id}
              className="group bg-white border border-[#E8F0EE] rounded-[16px] p-4 sm:p-5 shadow-xs hover:shadow-md hover:border-primary/20 transition-all duration-300 flex flex-col justify-between relative ring-0"
            >
              {/* Absolute overlay link to make whole card clickable */}
              <Link
                href={`/therapist/${t.id}`}
                className="absolute inset-0 z-0 rounded-[16px]"
                aria-label={`View profile of ${t.firstName} ${t.lastName}`}
              />

              {/* Upper Section: Side-by-side row */}
              <div className="flex flex-row gap-4 sm:gap-5 items-start relative z-10 pointer-events-none">
                {/* Left Column: Image Box */}
                <div className="flex flex-col items-center shrink-0 pointer-events-auto">
                  {/* Image Container with absolute overlay */}
                  <div className="relative w-24 h-28 shrink-0">
                    <div className="relative w-full h-[96px] rounded-xl overflow-hidden border border-gray-100 bg-gray-50">
                      <Image
                        src={t.profileImageUrl || `https://ui-avatars.com/api/?name=${t.firstName}+${t.lastName}&background=f8f9fa&color=214D3E&size=200`}
                        alt={`${t.firstName} ${t.lastName}`}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      {t.videoUrl && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setActiveVideoUrl(t.videoUrl);
                          }}
                          className="absolute top-2 left-2 bg-white/95 hover:bg-slate-50 hover:scale-105 active:scale-95 rounded-full p-1 shadow-xs border border-gray-100 flex items-center justify-center cursor-pointer transition-all z-20 pointer-events-auto"
                          title="Watch clinical introduction video"
                        >
                          <div className="w-4 h-4 rounded-full bg-[#214D3E]/10 flex items-center justify-center text-[#214D3E]">
                            <svg className="w-2.5 h-2.5 fill-current" viewBox="0 0 24 24">
                              <path d="M8 5v14l11-7z" />
                            </svg>
                          </div>
                        </button>
                      )}
                    </div>
                    {/* View Profile pill button overlapping bottom boundary */}
                    <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 z-10">
                      <Link
                        href={`/therapist/${t.id}`}
                        className="px-2.5 py-1 rounded-full border border-gray-200 bg-white text-[10px] font-semibold text-[#214D3E] hover:bg-slate-50 transition-colors shadow-xs whitespace-nowrap block"
                      >
                        View Profile
                      </Link>
                    </div>
                  </div>
                </div>

                {/* Right Column: Profile Info */}
                <div className="flex-1 min-w-0 space-y-1">
                  <CardHeader className="p-0 border-0 flex flex-col gap-1">
                    {/* Name and Rating */}
                    <div className="flex items-start justify-between w-full gap-2">
                      <CardTitle className="text-lg sm:text-xl font-bold tracking-wide leading-snug text-gray-800">
                        {t.firstName} {t.lastName}
                      </CardTitle>
                      <div className="flex items-center gap-1 text-sm text-[#EAB308] font-bold shrink-0 ml-1">
                        <Star className="w-4 h-4 fill-[#EAB308] text-[#EAB308]" />
                        <span>{Number(t.averageRating || 4.5).toFixed(1)}</span>
                        <span className="underline text-gray-400 font-normal hover:text-[#214D3E] transition-colors cursor-pointer text-xs ml-0.5 pointer-events-auto">
                          ({t.totalReviews || Math.floor((t.yearsOfExperience || 5) * 6.5) + 3})
                        </span>
                      </div>
                    </div>

                    {/* Subtitle: Qualifications & Exp */}
                    <CardDescription className="text-sm text-gray-500 font-medium">
                      {t.qualifications || "Clinical Psychologist"} ({t.yearsOfExperience || 4}+yrs exp)
                    </CardDescription>
                  </CardHeader>

                  {/* Languages */}
                  <p className="text-sm text-gray-500 font-medium">
                    {t.languages?.join(", ") || "English"}
                  </p>

                  {/* Specialities/Concerns badges */}
                  <div className="flex flex-wrap gap-1.5 pt-1.5">
                    {(t.specialities || []).slice(0, 3).map((tag: string) => (
                      <span
                        key={tag}
                        className="px-2 py-0.5 bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider rounded-md"
                      >
                        {tag}
                      </span>
                    ))}
                    {(t.specialities || []).length > 3 && (
                      <span className="text-xs font-semibold text-slate-400 self-center ml-0.5">
                        +{(t.specialities || []).length - 3} more
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Lower Section: Action & Price */}
              <div className="flex items-center justify-between mt-4 w-full relative z-10">
                <div className="flex flex-col">
                  <p className="text-sm text-gray-600 font-medium">
                    <span className="text-lg sm:text-xl font-bold text-gray-800">₹ {t.hourlyRate || "1,500"}</span>{" "}
                    <span className="text-gray-400 font-normal text-xm">for 60 min consultation</span>
                  </p>
                </div>
                <AlexButton
                  href={`/dashboard/sessions/book/${t.id}`}
                  size="sm"
                  className="shrink-0 text-sm shadow-xs relative z-10"
                >
                  Book Session
                </AlexButton>
              </div>
            </Card>
          ))}
          {filteredTherapists.length === 0 && (
            <div className="col-span-1 md:col-span-2 py-20 text-center bg-surface-container-low/20 rounded-xl border-2 border-dashed border-outline-variant/30 flex flex-col items-center justify-center gap-4">
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

      {/* Video Player Modal */}
      {activeVideoUrl && (
        <div 
          className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-50 p-4 transition-opacity duration-300 animate-in fade-in"
          onClick={() => setActiveVideoUrl(null)}
        >
          <div 
            className="bg-surface rounded-2xl overflow-hidden w-full max-w-3xl aspect-video relative border border-outline-variant/20 shadow-2xl animate-in zoom-in duration-300"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setActiveVideoUrl(null)}
              className="absolute top-4 right-4 bg-black/60 hover:bg-black/80 text-white rounded-full p-2 hover:scale-105 active:scale-95 transition-all z-30 cursor-pointer"
              title="Close video"
            >
              <X className="w-5 h-5" />
            </button>
            <iframe
              src={getEmbedUrl(activeVideoUrl)}
              className="w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        </div>
      )}
    </div>
  );
}
