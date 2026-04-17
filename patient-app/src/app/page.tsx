import React from "react";
import { HeroSection } from "@/components/sections/HeroSection";
import { TestimonialsSection } from "@/components/sections/TestimonialsSection";
import { ServicesSection } from "@/components/sections/ServicesSection";
import { WhyChooseUsSection } from "@/components/sections/WhyChooseUsSection";
import { StatsSection } from "@/components/sections/StatsSection";
import Link from "next/link";
import { LandingNavbar } from "@/components/sections/LandingNavbar";
import { AlexButton } from "@/components/ui/AlexButton";

export default function Home() {
  return (
    <main className="min-h-screen bg-[#F8FAF9]">
      <LandingNavbar portal="patient" />

      <HeroSection />
      <ServicesSection />
      <WhyChooseUsSection />
      <StatsSection />
      <TestimonialsSection />

      {/* Footer */}
      <footer className="py-20 bg-white border-t border-[rgba(33,77,62,0.05)] text-center">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col items-center gap-8">
            <div className="text-2xl font-cormorant font-bold text-[var(--primary)] flex items-center gap-3">
              <div className="w-10 h-10 bg-[var(--primary)] rounded-full flex items-center justify-center text-white font-heading text-xl">B</div>
              <span>Blissful Station</span>
            </div>
            <p className="text-[var(--text-light)] max-w-md">
               The premier digital sanctuary for expert, ethical clinical therapy and counseling.
            </p>
            <div className="flex gap-8 text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--primary)]/40">
              <Link href="/privacy" className="hover:text-[var(--primary)] transition-colors">Privacy</Link>
              <Link href="/terms" className="hover:text-[var(--primary)] transition-colors">Terms</Link>
              <Link href="/about" className="hover:text-[var(--primary)] transition-colors">About</Link>
            </div>
            <div className="pt-8 border-t border-[rgba(33,77,62,0.05)] w-full text-[10px] font-bold uppercase tracking-widest text-[var(--primary)]/20">
              © {new Date().getFullYear()} Blissful Station • Private • Encrypted • Secure
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}
