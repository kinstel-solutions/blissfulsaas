"use client";

import { AlertCircle, RotateCcw } from "lucide-react";
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
      <div className="w-20 h-20 rounded-[2rem] bg-red-500/5 border border-red-500/10 flex items-center justify-center text-red-500 shadow-2xl shadow-red-500/10">
        <AlertCircle className="w-10 h-10" />
      </div>
      <div className="text-center max-w-sm space-y-3">
        <h2 className="text-2xl font-heading font-medium text-foreground">Connection Interrupted</h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          We encountered an unexpected issue while retrieving your clinical data. Our technical team has been notified.
        </p>
      </div>
      <button
        onClick={() => reset()}
        className="group flex items-center gap-3 px-8 py-4 bg-foreground text-background rounded-2xl font-bold uppercase tracking-widest text-xs hover:scale-105 active:scale-95 transition-all shadow-xl"
      >
        <RotateCcw className="w-4 h-4 group-hover:rotate-180 transition-transform duration-500" />
        Retry Connection
      </button>
    </div>
  );
}
