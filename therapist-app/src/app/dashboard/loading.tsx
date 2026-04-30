"use client";

import { useState, useEffect } from "react";

export default function Loading() {
  const [isBreathingIn, setIsBreathingIn] = useState(true);

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    
    const cycle = () => {
      // Inhale phase: 35% of 5s = 1750ms
      setIsBreathingIn(true);
      timeoutId = setTimeout(() => {
        // Exhale phase: 65% of 5s = 3250ms
        setIsBreathingIn(false);
        timeoutId = setTimeout(cycle, 3250);
      }, 1750);
    };

    cycle();
    return () => clearTimeout(timeoutId);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-12 animate-in fade-in duration-1000">
      <div className="relative flex items-center justify-center w-32 h-32">
        {/* Breathing Animation Container */}
        <div className="relative w-24 h-24 animate-breathe flex items-center justify-center">
          {/* The Single "Inside-Out" Ring */}
          <div className="w-full h-full rounded-full border-[6px] border-primary shadow-[0_0_20px_rgba(33,77,62,0.3)]" />
          
          {/* Optional soft inner glow for premium feel */}
          <div className="absolute inset-4 rounded-full bg-primary/10 blur-sm" />
        </div>
      </div>

      <div className="text-center space-y-4">
        <h2 className="text-2xl font-heading font-medium text-primary transition-all duration-700 ease-in-out min-h-[2rem]">
          {isBreathingIn ? "Breathing in..." : "Breathing out..."}
        </h2>
        <p className="text-xs font-bold uppercase tracking-[0.3em] text-muted-foreground/60 animate-pulse">
          Setting up your workstation
        </p>
      </div>
    </div>
  );
}

