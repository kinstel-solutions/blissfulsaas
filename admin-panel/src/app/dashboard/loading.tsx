"use client";

import { Loader2, ShieldCheck } from "lucide-react";

export default function Loading() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 animate-in fade-in duration-700">
      <div className="relative">
        <div className="w-16 h-16 rounded-3xl bg-primary/5 border border-primary/10 flex items-center justify-center">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
        </div>
        <div className="absolute -top-1 -right-1 w-6 h-6 bg-emerald-500 rounded-full border-4 border-surface flex items-center justify-center">
          <ShieldCheck className="w-3 h-3 text-white" />
        </div>
      </div>
      <div className="text-center space-y-2">
        <h2 className="text-xl font-heading font-medium text-foreground">Registry Access</h2>
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground/40">Fetching System Telemetry...</p>
      </div>
    </div>
  );
}
