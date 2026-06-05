"use client";

import { useState } from "react";
import { Trash2 } from "lucide-react";
import { api } from "@/lib/api";
import { useRouter } from "next/navigation";

export default function CancelSessionButton({ id }: { id: string }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleCancel = async () => {
    if (!confirm("Are you sure you want to cancel this session?")) return;
    
    setLoading(true);
    try {
      await api.sessions.cancel(id);
      router.refresh();
    } catch (error: any) {
      alert(error.message || "Failed to cancel session");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button 
      onClick={handleCancel}
      disabled={loading}
      className="flex items-center gap-1.5 px-4 py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 font-bold uppercase tracking-widest text-[10px] rounded-xl transition-all active:scale-95 disabled:opacity-50 disabled:pointer-events-none"
      title="Cancel Session"
    >
      {loading ? (
        <div className="w-3.5 h-3.5 border-2 border-rose-600/30 border-t-rose-600 rounded-full animate-spin" />
      ) : (
        <Trash2 className="w-3.5 h-3.5" />
      )}
      <span>Cancel</span>
    </button>
  );
}
