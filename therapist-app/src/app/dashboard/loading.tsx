"use client";

import { Loader2 } from "lucide-react";

export default function Loading() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 animate-in fade-in duration-700">
      <div className="relative">
        <div className="w-16 h-16 rounded-3xl bg-slate-100 border border-slate-200 flex items-center justify-center">
          <Loader2 className="w-8 h-8 text-slate-400 animate-spin" />
        </div>
        <div className="absolute inset-0 w-16 h-16 rounded-3xl bg-slate-400/5 blur-xl animate-pulse -z-10" />
      </div>
      <div className="text-center space-y-2">
        <h2 className="text-xl font-heading font-medium text-slate-900">Clinical Workstation</h2>
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">Loading Patient Records...</p>
      </div>
    </div>
  );
}
