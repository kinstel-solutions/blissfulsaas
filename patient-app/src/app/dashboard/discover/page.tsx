import { ArrowRight, Search, Filter, MapPin, Star, Calendar, Sparkles } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default function DiscoverPage() {
  const therapists = [
    {
      id: 1,
      name: "Dr. Elena Vance",
      specialty: "Cognitive Behavioral Therapy",
      rating: 4.9,
      reviews: 124,
      image: "https://images.unsplash.com/photo-1594824476967-48c8b964273f?auto=format&fit=crop&q=80&w=300&h=300",
      price: "$150",
      location: "Virtual • London, UK",
      tags: ["Anxiety", "Depression", "LGBTQ+"]
    },
    {
      id: 2,
      name: "Marcus Aurelius",
      specialty: "Stoic Psychotherapy",
      rating: 5.0,
      reviews: 89,
      image: "https://images.unsplash.com/photo-1566492031773-4f4e44671857?auto=format&fit=crop&q=80&w=300&h=300",
      price: "$200",
      location: "Virtual • Rome, IT",
      tags: ["Resilience", "Grief", "Mindfulness"]
    },
    {
      id: 3,
      name: "Dr. Sarah Jenkins",
      specialty: "Clinical Psychotherapist",
      rating: 4.8,
      reviews: 215,
      image: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=300&h=300",
      price: "$175",
      location: "Virtual • New York, US",
      tags: ["Family", "Trauma", "CBT"]
    }
  ];

  return (
    <div className="space-y-12 pb-24">
      {/* Editorial Header */}
      <div className="relative pt-8 pb-4">
        <h1 className="text-5xl font-heading font-normal text-foreground mb-4 tracking-tight">
          Find Your <span className="text-primary italic">Sanctuary.</span>
        </h1>
        <p className="text-muted-foreground text-lg max-w-xl leading-relaxed">
          Select from our curated network of world-class specialists, each handpicked for their empathy and architectural approach to healing.
        </p>
      </div>

      {/* Discovery Search Tray */}
      <div className="bg-surface-container-low/50 backdrop-blur-md p-2 rounded-3xl border border-outline-variant/30 flex flex-col md:flex-row gap-2 shadow-sm">
        <div className="flex-1 relative flex items-center">
          <Search className="absolute left-6 w-4 h-4 text-primary/40" />
          <input 
            type="text" 
            placeholder="Search by specialty, name, or concern..." 
            className="w-full h-16 bg-transparent pl-14 pr-6 text-sm font-medium outline-none placeholder:text-muted-foreground/50"
          />
        </div>
        <div className="w-px bg-outline-variant/20 hidden md:block" />
        <button className="h-16 px-8 flex items-center justify-between gap-4 text-xs font-bold uppercase tracking-widest text-primary/60 hover:text-primary transition-colors">
          <Filter className="w-4 h-4" />
          Filters
        </button>
        <button className="h-16 bg-primary text-primary-foreground px-10 rounded-2xl font-bold text-xs uppercase tracking-widest shadow-md hover:shadow-xl hover:-translate-y-0.5 transition-all">
          Discovery
        </button>
      </div>

      {/* Marketplace Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
        {therapists.map((t) => (
          <div key={t.id} className="group bg-surface-container-lowest border border-outline-variant/30 rounded-[2.5rem] overflow-hidden hover:shadow-2xl hover:border-primary/20 transition-all duration-700 flex flex-col relative">
            <div className="absolute top-4 right-4 z-10 px-3 py-1 rounded-full bg-white/80 backdrop-blur-md border border-outline-variant/20 text-[10px] font-bold uppercase tracking-tighter text-primary flex items-center gap-1 shadow-sm">
              <Star className="w-3 h-3 fill-primary" /> {t.rating}
            </div>
            
            <div className="aspect-[4/3] overflow-hidden relative">
               <Image 
                src={t.image} 
                alt={t.name}
                fill
                className="object-cover group-hover:scale-110 transition-transform duration-1000"
               />
               <div className="absolute inset-0 bg-linear-to-t from-surface-container-lowest via-transparent to-transparent opacity-60" />
            </div>

            <div className="p-8 flex flex-col flex-1">
               <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary/60 mb-2">{t.specialty}</p>
               <h3 className="text-2xl font-heading font-medium text-foreground mb-4">{t.name}</h3>
               
               <div className="flex flex-wrap gap-2 mb-6">
                 {t.tags.map(tag => (
                   <span key={tag} className="px-3 py-1 bg-surface-container-low text-muted-foreground text-[10px] font-bold uppercase tracking-widest rounded-lg border border-outline-variant/10">
                     {tag}
                   </span>
                 ))}
               </div>

               <div className="mt-auto pt-6 border-t border-outline-variant/10 flex items-center justify-between">
                  <div className="flex flex-col">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/40">Starts at</span>
                    <span className="text-xl font-heading text-primary">{t.price}</span>
                  </div>
                  <Link href={`/dashboard/therapist/${t.id}`} className="w-12 h-12 rounded-2xl bg-primary/5 flex items-center justify-center text-primary hover:bg-primary hover:text-primary-foreground transition-all duration-300">
                    <ArrowRight className="w-5 h-5" />
                  </Link>
               </div>
            </div>
          </div>
        ))}
      </div>

      {/* Featured Recommendation - Asymmetric Intentional Grid */}
      <div className="relative mt-20 pt-16 bg-surface-container-low/30 rounded-[3rem] p-12 border border-outline-variant/10 overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="flex flex-col md:flex-row items-center gap-12 relative z-10">
          <div className="w-full md:w-1/3 aspect-square rounded-[3rem] bg-surface-container-lowest border border-outline-variant/30 flex items-center justify-center p-4 shadow-xl -rotate-3 hover:rotate-0 transition-transform duration-700">
            <Image 
              src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=400&h=400" 
              alt="Recommendation"
              width={400}
              height={400}
              className="w-full h-full object-cover rounded-[2.5rem]"
            />
          </div>
          <div className="flex-1 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary text-primary-foreground text-[10px] font-bold uppercase tracking-widest rounded-full">
              <Sparkles className="w-3 h-3" /> AI Personalized Match
            </div>
            <h2 className="text-4xl font-heading font-normal text-foreground leading-tight">
              Based on your wellness journey, we recommend <span className="text-primary italic underline decoration-primary/20">Dr. Sarah Jenkins</span>.
            </h2>
            <p className="text-muted-foreground text-lg leading-relaxed max-w-xl">
              Dr. Jenkins specializes in the architectural restoration of mental space, a perfect alignment with your goal of mindful professional balance.
            </p>
            <button className="bg-primary text-primary-foreground px-10 py-5 rounded-2xl font-bold text-xs uppercase tracking-widest shadow-xl hover:-translate-y-1 transition-all">
              Book Consultation
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
