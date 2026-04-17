import React from "react";
import { AlexButton } from "@/components/ui/AlexButton";
import { ShieldCheck } from "lucide-react";

export function HeroSection() {
  return (
    <section
      id="hero"
      className="relative overflow-hidden pt-[120px] md:pt-[190px] pb-[15vw] container mx-auto px-6 md:px-8 max-w-[1300px]">
      <div className="absolute bottom-0 right-0 w-[50vw] h-[50vw] bg-[radial-gradient(circle,rgba(33,77,62,0.03)_0%,rgba(252,250,255,0)_70%)] -z-10"></div>

      <div className="grid grid-cols-1 lg:grid-cols-[0.9fr_1.1fr] items-center gap-8 md:gap-16 text-center md:text-left">
        <div className="flex flex-col items-center md:items-start animate-in fade-in slide-in-from-left duration-1000">
          <div className="inline-flex items-center bg-[#E8F5E9] text-[var(--primary)] text-[10px] font-bold tracking-[1.2px] px-3 py-1 rounded-full uppercase mb-2 font-outfit">
            Premium Practice Management
          </div>

          <h1 className="text-4xl md:text-5xl lg:text-[64px] leading-[1.1] mb-4 md:mb-8 font-cormorant font-bold text-[var(--text-dark)] tracking-[-1.5px]">
            Elevate your practice with <br className="hidden lg:block" />
            <span className="simmer-text italic font-bold">
              ethical mastery.
            </span>
          </h1>

          <p className="text-lg md:text-xl text-[var(--text-light)] mb-4 md:mb-10 max-w-[540px] leading-relaxed">
            <span className="hidden md:inline">
              Join a curated sanctuary of expert clinical providers.{" "}
            </span>
            Our platform handles the clinical overhead—from automated billing to secure video consultations—so you can focus on profound patient recovery.
          </p>

          <div>
            <AlexButton
              href="/signup"
              size="md"
              className="shadow-lg hover:shadow-xl">
              List Your Practice
            </AlexButton>
          </div>
        </div>

        <div className="relative mt-4 lg:mt-0 animate-in fade-in slide-in-from-right duration-1000">
          <img
            src="https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=1200&h=800"
            alt="The Blissful Station - Clinical Workspace"
            className="w-full rounded-[30px] shadow-[0_20px_50px_rgba(0,0,0,0.1)] animate-float"
          />
          <div className="hidden md:flex absolute bottom-0 -left-10 bg-[rgba(255,255,255,0.9)] backdrop-blur-[15px] p-6 rounded-[24px] border border-[rgba(33,77,62,0.1)] shadow-[0_15px_45px_rgba(33,77,62,0.1)] items-center gap-5 z-10 transition-transform hover:scale-105 duration-300">
            <div className="w-12 h-12 bg-[var(--primary)] text-white rounded-full flex items-center justify-center text-xl">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div className="text-left">
              <strong className="block text-[var(--primary)] font-cormorant text-xl font-semibold leading-tight">
                Clinical Mastery
              </strong>
              <p className="text-[var(--text-light)] text-sm">
                Seamless Management
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
