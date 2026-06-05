"use client";

import { useState } from "react";
import { XCircle, CheckCircle, PlayCircle } from "lucide-react";
import { api } from "@/lib/api";
import { useRouter } from "next/navigation";
import { revalidateDashboard } from "@/app/actions";

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
    <div className="flex items-center justify-end gap-2.5">
      {status === 'PENDING' && (
        <button 
          onClick={() => handleAction('confirm')}
          disabled={loading}
          className="flex items-center gap-1.5 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold uppercase tracking-widest text-[10px] rounded-xl shadow-sm transition-all hover:shadow active:scale-95 disabled:opacity-50 disabled:pointer-events-none"
        >
          <CheckCircle className="w-3.5 h-3.5" />
          Confirm
        </button>
      )}
      
      {status === 'CONFIRMED' && (
        <button 
          onClick={() => handleAction('complete')}
          disabled={loading}
          className="flex items-center gap-1.5 px-4 py-2.5 bg-primary text-white hover:bg-primary-dark font-bold uppercase tracking-widest text-[10px] rounded-xl shadow-sm transition-all hover:shadow active:scale-95 disabled:opacity-50 disabled:pointer-events-none"
        >
          <PlayCircle className="w-3.5 h-3.5" />
          Complete
        </button>
      )}

      <button 
        onClick={() => handleAction('cancel')}
        disabled={loading}
        className="flex items-center gap-1.5 px-4 py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 font-bold uppercase tracking-widest text-[10px] rounded-xl transition-all active:scale-95 disabled:opacity-50 disabled:pointer-events-none"
      >
        <XCircle className="w-3.5 h-3.5" />
        Cancel
      </button>
    </div>
  );
}
