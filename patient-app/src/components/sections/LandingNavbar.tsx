"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { AlexButton } from "@/components/ui/AlexButton";

export function LandingNavbar({ portal = "patient" }: { portal?: "patient" | "therapist" }) {
  const [scrolled, setScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const pathname = usePathname();
  const isHome = pathname === "/";

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const closeMenu = () => setIsMenuOpen(false);

  return (
    <>
      <nav
        className={`flex justify-between items-center py-1 md:py-2.5 absolute top-2 left-1/2 -translate-x-1/2 w-[95%] z-[1000] max-w-[1200px] transition-all duration-400 ease-in-out px-4 md:px-8 mx-auto container ${
          scrolled 
            ? "fixed !top-0 !max-w-full !w-full bg-[rgba(255,255,255,0.9)] backdrop-blur-[15px] !py-2 shadow-[0_5px_30px_rgba(0,0,0,0.05)] !rounded-none" 
            : "bg-white md:bg-transparent md:backdrop-blur-none rounded-[20px]"
        } ${isMenuOpen ? "opacity-0 pointer-events-none lg:opacity-100 lg:pointer-events-auto" : "opacity-100"}`}
      >
        <Link
          href="/"
          onClick={(e) => {
            if (isHome) {
              e.preventDefault();
              window.scrollTo({ top: 0, behavior: "smooth" });
            }
            closeMenu();
          }}
          className="text-[1.3rem] md:text-[1.6rem] font-cormorant font-bold text-[var(--primary)] flex items-center gap-2 md:gap-3 no-underline cursor-pointer"
        >
          <div className="w-10 h-10 md:w-11 md:h-11 bg-[var(--primary)] rounded-full flex items-center justify-center text-white font-heading text-xl md:text-2xl shadow-lg shadow-primary/20">
            B
          </div>
          <span className="hidden md:block">Blissful Station</span>
        </Link>

        <div className="flex items-center gap-2 md:gap-4">
          <Link href="/login" className="hidden md:block text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--primary)]/60 hover:text-[var(--primary)] transition-colors">
            {portal === "therapist" ? "Portal Login" : "Login"}
          </Link>
          <AlexButton
            href="/signup"
            size="sm"
            className="text-[14px] md:text-base">
            {portal === "therapist" ? "Join Network" : "Get Started"}
          </AlexButton>

          {/* Mobile Toggle */}
          <button
            onClick={() => setIsMenuOpen(true)}
            className="lg:hidden p-1.5 text-[var(--primary)] focus:outline-none"
            aria-label="Open Menu"
          >
            <Menu size={24} />
          </button>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      <div
        className={`fixed inset-0 z-[10001] bg-white transition-all duration-600 ease-in-out lg:hidden ${
          isMenuOpen ? "translate-y-0 opacity-100" : "-translate-y-full opacity-0"
        }`}
      >
        <div className="flex flex-col h-full p-8">
          <div className="flex justify-between items-center mb-10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[var(--primary)] rounded-full flex items-center justify-center text-white font-heading text-xl shadow-lg shadow-primary/20">
                B
              </div>
              <span className="text-lg font-cormorant font-bold text-[var(--primary)]">
                Blissful Station
              </span>
            </div>
            <button
              onClick={() => setIsMenuOpen(false)}
              className="p-2 text-[var(--primary)] focus:outline-none"
              aria-label="Close Menu"
            >
              <X size={26} />
            </button>
          </div>

          <ul className="flex flex-col gap-6 list-none p-0 mb-10 text-center">
            <li>
              <Link href="/login" onClick={closeMenu} className="text-2xl font-cormorant font-semibold text-[var(--primary)] italic border-b-2 border-[var(--primary)] inline-block">
                {portal === "therapist" ? "Portal Login" : "Login"}
              </Link>
            </li>
          </ul>

          <div className="pt-8 border-t border-gray-100 flex flex-col items-center text-center">
            <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-4 font-outfit">
              Clinical Sanctuary
            </p>
            <AlexButton
              href="/signup"
              size="sm"
              className="shadow-lg text-base">
              {portal === "therapist" ? "Join Network" : "Get Started"}
            </AlexButton>
            <p className="text-[13px] text-gray-500 mt-4 italic font-cormorant">
              Verified Ethical Clinical Therapy & Counseling
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
