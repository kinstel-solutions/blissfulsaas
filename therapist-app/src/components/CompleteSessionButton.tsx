"use client";

import { api } from "@/lib/api";
import { useRouter } from "next/navigation";
import { CheckCircle } from "lucide-react";

export default function CompleteSessionButton({ appointmentId }: { appointmentId: string }) {
  const router = useRouter();

  const handleComplete = async () => {
    if (!window.confirm("Are you sure you want to complete this session? This action cannot be undone.")) return;
    try {
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent('session-completing'));
      }
      await api.sessions.complete(appointmentId);
      router.push('/dashboard/appointments');
    } catch (err) {
      console.error("Failed to complete appointment", err);
    }
  };

  return (
    <button 
      onClick={handleComplete}
      className="bg-slate-900 text-white font-bold uppercase tracking-widest text-[10px] md:text-xs rounded-xl px-4 py-2 md:px-6 md:py-2.5 shadow-sm hover:bg-primary transition-all flex items-center gap-2"
    >
      <CheckCircle className="w-3 h-3 md:w-3.5 md:h-3.5" />
      Complete & Close
    </button>
  );
}
