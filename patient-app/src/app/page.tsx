import Link from "next/link";
import { ArrowRight, Sparkles, Shield, Compass } from "lucide-react";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col bg-surface overflow-hidden font-sans antialiased text-foreground">
      {/* Editorial Navigation */}
      <nav className="absolute inset-x-0 top-0 z-50 flex items-center justify-between px-8 py-8 md:px-16 bg-transparent">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-linear-to-br from-primary to-primary-container flex items-center justify-center shadow-2xl">
            <span className="text-primary-foreground font-heading font-bold text-xl leading-none">B</span>
          </div>
          <span className="font-heading font-bold text-2xl text-primary tracking-tighter">Blissful Station</span>
        </div>
        
        <div className="hidden md:flex gap-12 text-[10px] font-bold uppercase tracking-[0.25em] text-primary/40">
          <a href="#marketplace" className="hover:text-primary transition-colors">Marketplace</a>
          <a href="#curation" className="hover:text-primary transition-colors">The Curation</a>
          <a href="#sanctuary" className="hover:text-primary transition-colors">Sanctuary</a>
        </div>

        <div className="flex items-center gap-6">
          <Link href="/login" className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary/60 hover:text-primary transition-colors">
            Portal
          </Link>
          <Link href="/signup" className="text-[10px] font-bold uppercase tracking-[0.2em] bg-primary text-primary-foreground px-8 py-4 rounded-2xl shadow-xl hover:shadow-primary/20 hover:-translate-y-0.5 transition-all duration-300">
            Commence
          </Link>
        </div>
      </nav>

      {/* Hero: The Digital Curator */}
      <section className="relative flex flex-col justify-center min-h-screen px-8 md:px-16 pt-20">
        {/* Architectural Ambient Blurs */}
        <div className="absolute top-0 right-0 w-1/2 h-screen bg-primary/2 rounded-full blur-[120px] -z-10 pointer-events-none transform translate-x-1/4" />
        <div className="absolute bottom-0 left-0 w-1/4 h-1/2 bg-accent/20 rounded-full blur-[100px] -z-10 pointer-events-none transform -translate-x-1/4" />
        
        <div className="max-w-5xl z-10 flex flex-col">
          <div className="inline-flex items-center gap-3 px-5 py-2.5 rounded-full bg-surface-container-lowest border border-outline-variant/10 text-[10px] font-bold uppercase tracking-[0.3em] text-primary/60 mb-12 shadow-sm w-fit animate-fade-in">
             <Sparkles className="w-3 h-3" /> The Curated Sanctuary
          </div>
          
          <h1 className="text-6xl md:text-[5.5rem] font-heading font-normal tracking-tight text-primary leading-[1.05] mb-12 max-w-4xl">
            Where Science Meets <br className="hidden lg:block"/>
            <span className="italic text-primary/40 font-light">Architectural</span> Healing.
          </h1>
          
          <div className="flex flex-col md:flex-row items-end gap-12">
            <p className="text-xl md:text-2xl text-primary/70 max-w-xl leading-relaxed font-light tracking-tight">
              A private ecosystem designed to pair world-class clinical expertise with an environment of profound digital calm.
            </p>
            <div className="flex gap-4">
               <Link href="/signup" className="group bg-primary text-primary-foreground px-12 py-6 rounded-[2rem] font-bold text-[10px] uppercase tracking-[0.25em] shadow-2xl hover:shadow-primary/40 transition-all flex items-center gap-3">
                  Find Your Specialist
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
               </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Editorial Feature Gallery - Asymmetric Grid */}
      <section className="py-32 px-8 md:px-16 bg-surface-container-low/50 relative overflow-hidden">
        <div className="max-w-7xl mx-auto space-y-32">
          
          {/* Card 1: Overlapping Layout */}
          <div className="flex flex-col md:flex-row items-center gap-16 lg:gap-32">
             <div className="w-full md:w-1/2 aspect-[4/5] bg-surface-container-lowest rounded-[3.5rem] border border-outline-variant/10 shadow-2xl overflow-hidden group">
                <img 
                  src="https://images.unsplash.com/photo-1554177255-61502b352de3?auto=format&fit=crop&q=80&w=800&h=1000" 
                  alt="Curated Care" 
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-10000 opacity-80 group-hover:opacity-100"
                />
             </div>
             <div className="w-full md:w-1/2 space-y-8">
                <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-primary/30">Curation 01</span>
                <h2 className="text-4xl md:text-5xl font-heading font-normal leading-tight">Handpicked <br/> Specialist Network.</h2>
                <p className="text-lg text-primary/60 leading-relaxed font-light tracking-tight">
                  We don't just provide access; we provide alignment. Each practioner in the Blissful Sanctuary is vetted for both clinical rigor and human-centric empathy.
                </p>
                <div className="pt-4">
                  <button className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-primary border-b border-primary/20 pb-2 hover:border-primary transition-all">
                    Explore Standards <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
             </div>
          </div>

          {/* Card 2: Flip */}
          <div className="flex flex-col md:flex-row-reverse items-center gap-16 lg:gap-32">
             <div className="w-full md:w-1/2 aspect-[4/5] bg-surface-container-lowest rounded-[3.5rem] border border-outline-variant/10 shadow-2xl overflow-hidden group -rotate-2 hover:rotate-0 transition-transform duration-1000">
                <img 
                  src="https://images.unsplash.com/photo-1523413363574-c3c44439366e?auto=format&fit=crop&q=80&w=800&h=1000" 
                  alt="Architectural Calm" 
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-10000 opacity-80 group-hover:opacity-100"
                />
             </div>
             <div className="w-full md:w-1/2 space-y-8">
                <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-primary/30">Curation 02</span>
                <h2 className="text-4xl md:text-5xl font-heading font-normal leading-tight">Boundaries <br/> Defined by Color.</h2>
                <p className="text-lg text-primary/60 leading-relaxed font-light tracking-tight">
                  A visual sanctuary where structural lines are replaced by tonal depth. No harsh borders. No clinical noise. Just a breathable space for meaningful recovery.
                </p>
                <div className="flex gap-8 pt-6">
                   <div className="flex flex-col gap-2">
                      <Shield className="w-5 h-5 text-primary/20" />
                      <span className="text-[8px] font-bold uppercase tracking-widest opacity-40">Privacy Shield</span>
                   </div>
                   <div className="flex flex-col gap-2">
                      <Compass className="w-5 h-5 text-primary/20" />
                      <span className="text-[8px] font-bold uppercase tracking-widest opacity-40">Guided Path</span>
                   </div>
                </div>
             </div>
          </div>

        </div>
      </section>

      {/* Social Proof / Trust */}
      <section className="py-32 px-8 flex flex-col items-center text-center bg-surface">
         <h2 className="text-[10px] font-bold uppercase tracking-[0.5em] text-primary/20 mb-16">Trusted by world-class institutions</h2>
         <div className="flex flex-wrap justify-center gap-16 md:gap-32 opacity-20 grayscale">
            <span className="text-2xl font-heading font-bold tracking-tighter">YALE MEDICAL</span>
            <span className="text-2xl font-heading font-bold tracking-tighter">STANFORD CARE</span>
            <span className="text-2xl font-heading font-bold tracking-tighter">NIEMEYER HOSP.</span>
         </div>
      </section>
      
      {/* Footer */}
      <footer className="bg-surface-container-low py-20 px-8 md:px-16 border-t border-outline-variant/10">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start gap-12">
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-primary flex items-center justify-center">
                <span className="text-primary-foreground font-heading font-bold text-sm">B</span>
              </div>
              <span className="font-heading font-bold text-xl text-primary tracking-tight">Blissful Station</span>
            </div>
            <p className="text-xs font-medium text-primary/40 leading-relaxed max-w-xs">
              A private ecosystem for high-end mental well-being. Built on the principles of architectural calm and scientific rigor.
            </p>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-16 text-[10px] font-bold uppercase tracking-[0.2em] text-primary/60">
             <div className="flex flex-col gap-4">
                <span className="text-primary/20">The Portal</span>
                <a href="/login" className="hover:text-primary transition-colors">Sign In</a>
                <a href="/signup" className="hover:text-primary transition-colors">Apply</a>
             </div>
             <div className="flex flex-col gap-4">
                <span className="text-primary/20">Legal</span>
                <a href="#" className="hover:text-primary transition-colors">Privacy</a>
                <a href="#" className="hover:text-primary transition-colors">Governance</a>
             </div>
             <div className="flex flex-col gap-4">
                <span className="text-primary/20">Global</span>
                <span className="hover:text-primary transition-colors">Worldwide</span>
             </div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto mt-20 pt-10 border-t border-primary/5 flex justify-between items-center text-[10px] font-bold uppercase tracking-widest text-primary/20">
           <span>© {new Date().getFullYear()} Blissful Station Sanctuary</span>
           <span>SECURE HIPAA END-TO-END</span>
        </div>
      </footer>
    </main>
  );
}
