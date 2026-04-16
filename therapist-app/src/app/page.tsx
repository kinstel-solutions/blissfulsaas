import Link from "next/link";
import { ArrowRight, ShieldCheck, Globe, Briefcase, Zap } from "lucide-react";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col bg-surface overflow-hidden font-sans antialiased text-foreground">
      {/* Provider Portal Navigation */}
      <nav className="absolute inset-x-0 top-0 z-50 flex items-center justify-between px-6 py-6 md:px-16 bg-transparent">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 md:w-10 md:h-10 rounded-2xl bg-linear-to-br from-primary to-primary-container flex items-center justify-center shadow-2xl">
            <span className="text-primary-foreground font-heading font-bold text-lg md:text-xl leading-none">B</span>
          </div>
          <div className="flex flex-col leading-none">
             <span className="font-heading font-bold text-xl md:text-2xl text-primary tracking-tighter">Blissful Station</span>
             <span className="text-[10px] md:text-xs font-bold uppercase tracking-[0.25em] text-primary/30">Provider Ecosystem</span>
          </div>
        </div>
        
        <div className="flex items-center gap-4 md:gap-6">
          <Link href="/login" className="text-xs font-bold uppercase tracking-[0.2em] text-primary/60 hover:text-primary transition-colors">
            Login
          </Link>
          <Link href="/signup" className="text-xs font-bold uppercase tracking-[0.2em] bg-primary text-primary-foreground px-5 md:px-8 py-3 md:py-4 rounded-xl md:rounded-2xl shadow-xl hover:shadow-primary/20 hover:-translate-y-0.5 transition-all duration-300">
            Apply
          </Link>
        </div>
      </nav>

      {/* Hero: The Clinical Architect */}
      <section className="relative flex flex-col justify-center min-h-screen px-6 md:px-16 pt-32 md:pt-20">
        {/* Architectural Ambient Blurs */}
        <div className="absolute top-0 right-0 w-full md:w-1/2 h-screen bg-primary/2 rounded-full blur-[120px] -z-10 pointer-events-none transform translate-x-1/4" />
        <div className="absolute bottom-0 left-0 w-full md:w-1/4 h-1/2 bg-accent/20 rounded-full blur-[100px] -z-10 pointer-events-none transform -translate-x-1/4" />
        
        <div className="max-w-5xl z-10 flex flex-col text-center md:text-left items-center md:items-start">
          <div className="inline-flex items-center gap-3 px-4 md:px-5 py-2 md:py-2.5 rounded-full bg-surface-container-lowest border border-outline-variant/10 text-[10px] md:text-xs font-bold uppercase tracking-[0.3em] text-primary/60 mb-8 md:mb-12 shadow-sm w-fit animate-fade-in">
             <Briefcase className="w-3 h-3" /> Elevating Private Practice
          </div>
          
          <h1 className="text-4xl md:text-6xl lg:text-[5.5rem] font-heading font-normal tracking-tight text-primary leading-[1.1] mb-8 md:mb-12 max-w-4xl">
            A Workspace Built for <br className="hidden lg:block"/>
            <span className="italic text-primary/40 font-light">Clinical Mastery.</span>
          </h1>
          
          <div className="flex flex-col md:flex-row items-center md:items-end gap-8 md:gap-12">
            <p className="text-lg md:text-xl lg:text-2xl text-primary/70 max-w-xl leading-relaxed font-light tracking-tight">
              A private ecosystem designed to unify your clinical rigor with an environment of profound digital calm.
            </p>
            <div className="flex gap-4 w-full md:w-auto">
               <Link href="/signup" className="group w-full md:w-auto bg-primary text-primary-foreground px-4 md:px-8 md:px-12 py-5 md:py-6 rounded-2xl md:rounded-[2rem] font-bold text-xs uppercase tracking-[0.25em] shadow-2xl hover:shadow-primary/40 transition-all flex items-center justify-center gap-3">
                  Join the Network
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
               </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Editorial Feature Gallery - Asymmetric Grid */}
      <section className="py-20 md:py-32 px-6 md:px-16 bg-surface-container-low/50 relative overflow-hidden">
        <div className="max-w-7xl mx-auto space-y-20 md:space-y-32">
          
          {/* Card 1: Overlapping Layout */}
          <div className="flex flex-col md:flex-row items-center gap-12 md:gap-16 lg:gap-32 text-center md:text-left">
             <div className="w-full md:w-1/2 aspect-[4/3] bg-surface-container-lowest rounded-xl md:rounded-[3.5rem] border border-outline-variant/10 shadow-2xl overflow-hidden group">
                <img 
                  src="https://images.unsplash.com/photo-1549221544-77cc6770fa45?auto=format&fit=crop&q=80&w=800&h=600" 
                  alt="Clinical Focus" 
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-10000 opacity-80 group-hover:opacity-100"
                />
             </div>
             <div className="w-full md:w-1/2 space-y-6 md:space-y-8">
                <span className="text-[10px] md:text-xs font-bold uppercase tracking-[0.4em] text-primary/30">Network 01</span>
                <h2 className="text-3xl md:text-4xl lg:text-5xl font-heading font-normal leading-tight">Focus on <br className="hidden md:block"/> Healing Alone.</h2>
                <p className="text-base md:text-lg text-primary/60 leading-relaxed font-light tracking-tight">
                  We handle the administrative overhead, from billing to digital privacy, so you can dedicate your full presence to the patient journey.
                </p>
                <div className="flex flex-wrap justify-center md:justify-start gap-6 md:gap-8 pt-4 md:pt-6">
                   <div className="flex flex-col gap-2 items-center md:items-start">
                      <ShieldCheck className="w-6 h-6 text-primary/30" />
                      <span className="text-[10px] md:text-xs font-bold uppercase tracking-widest opacity-40">Privacy Shield</span>
                   </div>
                   <div className="flex flex-col gap-2 items-center md:items-start">
                      <Globe className="w-6 h-6 text-primary/30" />
                      <span className="text-[10px] md:text-xs font-bold uppercase tracking-widest opacity-40">GLOBAL ACCESS</span>
                   </div>
                   <div className="flex flex-col gap-2 items-center md:items-start">
                      <Zap className="w-6 h-6 text-primary/30" />
                      <span className="text-[10px] md:text-xs font-bold uppercase tracking-widest opacity-40">INSTANT ROOMS</span>
                   </div>
                </div>
             </div>
          </div>

        </div>
      </section>

      {/* Footer */}
      <footer className="bg-surface-container-low py-16 md:py-20 px-6 md:px-16 border-t border-outline-variant/10">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start gap-12">
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-primary flex items-center justify-center">
                <span className="text-primary-foreground font-heading font-bold text-sm">B</span>
              </div>
              <span className="font-heading font-bold text-xl text-primary tracking-tight">Blissful Station</span>
            </div>
            <p className="text-[10px] md:text-xs font-medium text-primary/40 leading-relaxed max-w-xs">
              A private ecosystem for high-end mental well-being. Built on the principles of architectural calm and scientific rigor.
            </p>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-8 md:gap-16 text-[10px] md:text-xs font-bold uppercase tracking-[0.2em] text-primary/60">
             <div className="flex flex-col gap-4">
                <span className="text-primary/20">The Portal</span>
                <a href="/login" className="hover:text-primary transition-colors">Login</a>
                <a href="/signup" className="hover:text-primary transition-colors">Apply</a>
             </div>
             <div className="flex flex-col gap-4">
                <span className="text-primary/20">Resources</span>
                <a href="#" className="hover:text-primary transition-colors">Clinical Tech</a>
                <a href="#" className="hover:text-primary transition-colors">Help</a>
             </div>
             <div className="flex flex-col gap-4">
                <span className="text-primary/20">Legal</span>
                <a href="#" className="hover:text-primary transition-colors">Terms</a>
             </div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto mt-16 md:mt-20 pt-8 md:pt-10 border-t border-primary/5 flex flex-col md:flex-row justify-between items-center gap-4 text-[10px] md:text-xs font-bold uppercase tracking-widest text-primary/20 text-center md:text-left">
           <span>© {new Date().getFullYear()} Blissful Station Provider Network</span>
            <span>PRIVATE & ENCRYPTED CLINIC</span>
        </div>
      </footer>
    </main>
  );
}
