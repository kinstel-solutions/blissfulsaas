"use client";

import { useState } from "react";
import { XCircle, CheckCircle, PlayCircle } from "lucide-react";
import { api } from "@/lib/api";
import { useRouter } from "next/navigation";
import { revalidateDashboard } from "@/app/actions";
import { Button } from "@/components/ui/button";

export default function AppointmentActions({ id, status }: { id: string, status: string }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleAction = async (action: 'cancel' | 'complete' | 'confirm') => {
    const messages = {
      cancel: "Are you sure you want to cancel this appointment?",
      complete: "Mark this session as completed?",
      confirm: "Confirm this appointment request?"
    };
    
    if (!confirm(messages[action])) return;
    
    setLoading(true);
    try {
      if (action === 'cancel') {
        await api.sessions.cancel(id);
      } else if (action === 'complete') {
        await api.sessions.complete(id);
      } else if (action === 'confirm') {
        await api.sessions.confirm(id);
      }
      
      // Revalidate dashboard paths on the server
      await revalidateDashboard();
      
      // Refresh current client-side view
      router.refresh();
    } catch (error: any) {
      alert(error.message || `Failed to ${action} appointment`);
    } finally {
      setLoading(false);
    }
  };

  if (status === 'CANCELLED' || status === 'COMPLETED' || status === 'EXPIRED') return null;

  return (
    <div className="contents lg:flex lg:items-center lg:justify-end lg:gap-2.5">
      {status === 'PENDING' && (
        <Button 
          onClick={() => handleAction('confirm')}
          disabled={loading}
          className="flex items-center justify-center gap-1.5 flex-1 lg:flex-initial lg:w-auto px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold uppercase tracking-widest text-[10px] rounded-xl shadow-sm transition-all hover:shadow active:scale-95 disabled:opacity-50 disabled:pointer-events-none h-auto whitespace-nowrap shrink-0"
        >
          <CheckCircle className="w-3.5 h-3.5 shrink-0" />
          Confirm
        </Button>
      )}
      
      {status === 'CONFIRMED' && (
        <Button 
          onClick={() => handleAction('complete')}
          disabled={loading}
          className="flex items-center justify-center gap-1.5 flex-1 lg:flex-initial lg:w-auto px-4 py-2.5 bg-primary text-white hover:bg-primary/90 font-bold uppercase tracking-widest text-[10px] rounded-xl shadow-sm transition-all hover:shadow active:scale-95 disabled:opacity-50 disabled:pointer-events-none h-auto whitespace-nowrap shrink-0"
        >
          <PlayCircle className="w-3.5 h-3.5 shrink-0" />
          Complete
        </Button>
      )}

      <Button 
        variant="ghost"
        onClick={() => handleAction('cancel')}
        disabled={loading}
        className="flex items-center justify-center gap-1.5 flex-1 lg:flex-initial lg:w-auto px-4 py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 font-bold uppercase tracking-widest text-[10px] rounded-xl transition-all active:scale-95 disabled:opacity-50 disabled:pointer-events-none h-auto whitespace-nowrap shrink-0"
      >
        <XCircle className="w-3.5 h-3.5 shrink-0" />
        Cancel
      </Button>
    </div>
  );
}
