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

  if (status === 'CANCELLED' || status === 'COMPLETED') return null;

  return (
    <div className="flex items-center justify-end gap-2">
      {status === 'PENDING' && (
        <button 
          onClick={() => handleAction('confirm')}
          disabled={loading}
          className="p-2 text-slate-400 hover:text-primary hover:bg-primary/5 rounded-lg transition-all"
          title="Confirm Appointment"
        >
          <CheckCircle className="w-5 h-5 text-emerald-500" />
        </button>
      )}
      <button 
        onClick={() => handleAction('cancel')}
        disabled={loading}
        className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
        title="Cancel Appointment"
      >
        <XCircle className="w-5 h-5" />
      </button>
      {status === 'CONFIRMED' && (
        <button 
          onClick={() => handleAction('complete')}
          disabled={loading}
          className="p-2 text-slate-400 hover:text-green-500 hover:bg-green-50 rounded-lg transition-all"
          title="Mark as Completed"
        >
          <PlayCircle className="w-5 h-5" />
        </button>
      )}
    </div>
  );
}
