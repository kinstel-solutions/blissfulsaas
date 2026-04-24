"use client";

import { ShieldAlert, RotateCcw } from "lucide-react";
import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-8 animate-in fade-in zoom-in duration-700">
      <div className="w-20 h-20 rounded-[2.5rem] bg-amber-500/5 border border-amber-500/10 flex items-center justify-center text-amber-600 shadow-2xl shadow-amber-500/5">
        <ShieldAlert className="w-10 h-10" />
      </div>
      <div className="text-center max-w-sm space-y-3">
        <h2 className="text-2xl font-heading font-medium text-foreground">Registry Error</h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          The administrative portal encountered a secure exception. Registry access has been restricted until restoration.
        </p>
      </div>
      <button
        onClick={() => reset()}
        className="group flex items-center gap-3 px-8 py-4 bg-primary text-white rounded-2xl font-bold uppercase tracking-widest text-xs hover:scale-105 transition-all shadow-xl shadow-primary/20"
      >
        <RotateCcw className="w-4 h-4 group-hover:rotate-180 transition-transform duration-500" />
        Restore Admin Registry
      </button>
    </div>
  );
}
