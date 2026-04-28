"use client";

import { useState, useEffect } from "react";
import Image from "next/image";

interface BreathingLoaderProps {
  text?: string;
  subtext?: string;
}

export function BreathingLoader({ 
  text, 
  subtext = "Preparing your space" 
}: BreathingLoaderProps) {
  const [isBreathingIn, setIsBreathingIn] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setIsBreathingIn((prev) => !prev);
    }, 4000); // 4 seconds per breath phase
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-8 animate-in fade-in duration-1000">
      <div className="relative">
        <div className={`w-24 h-24 transition-all duration-[4000ms] ease-in-out transform ${isBreathingIn ? 'scale-110' : 'scale-90'}`}>
          <Image
            src="/breathing.png"
            alt="Breathing illustration"
            width={96}
            height={96}
            className="rounded-full object-cover shadow-xl"
          />
        </div>
        <div className={`absolute inset-0 w-24 h-24 rounded-full bg-primary/20 blur-2xl -z-10 transition-all duration-[4000ms] ease-in-out transform ${isBreathingIn ? 'scale-150 opacity-60' : 'scale-75 opacity-20'}`} />
      </div>

      
      <div className="text-center space-y-4">
        <h2 className="text-2xl font-heading font-medium text-primary transition-all duration-1000 ease-in-out min-h-[2rem]">
          {text ? text : (isBreathingIn ? "Breathing in..." : "Breathing out...")}
        </h2>
        <p className="text-xs font-bold uppercase tracking-[0.3em] text-muted-foreground/40 animate-pulse">
          {subtext}
        </p>
      </div>
    </div>
  );
}
