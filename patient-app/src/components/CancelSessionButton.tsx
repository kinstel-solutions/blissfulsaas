"use client";

import { useState } from "react";
import { Trash2 } from "lucide-react";
import { api } from "@/lib/api";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

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
    <Button 
      variant="ghost"
      onClick={handleCancel}
      disabled={loading}
      className="flex items-center justify-center gap-2 w-full h-14 bg-rose-50/50 hover:bg-rose-50 text-rose-600 border border-rose-100/80 font-bold uppercase tracking-widest text-xs rounded-2xl transition-all active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none"
      title="Cancel Session"
    >
      {loading ? (
        <div className="w-4 h-4 border-2 border-rose-600/30 border-t-rose-600 rounded-full animate-spin" />
      ) : (
        <Trash2 className="w-4 h-4" />
      )}
      <span>Cancel Session</span>
    </Button>
  );
}
