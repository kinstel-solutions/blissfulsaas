"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ShieldX, Loader2 } from "lucide-react";
import { api } from "@/lib/api";

export default function RejectButton({ id, isUpdate }: { id: string, isUpdate?: boolean }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleReject = async () => {
    const msg = isUpdate
      ? "Are you sure you want to REJECT these profile updates? The practitioner's active profile will remain unchanged."
      : "Are you sure you want to REJECT and PERMANENTLY DELETE this practitioner application? This action cannot be reversed.";

    if (!confirm(msg)) return;
    
    setLoading(true);
    try {
      await api.therapists.reject(id);
      if (!isUpdate) {
        router.push("/dashboard/therapists");
      }
      router.refresh();
    } catch (err: any) {
      console.error(err);
      alert(err.message || "Ejection sequence failed. Access restricted.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button 
      onClick={handleReject}
      disabled={loading}
      className="h-14 px-8 bg-surface border border-destructive/20 text-destructive rounded-full font-bold uppercase tracking-widest text-[10px] md:text-xs shadow-sm hover:shadow-destructive/10 hover:bg-destructive/5 hover:-translate-y-1 active:translate-y-0.5 flex items-center justify-center gap-3 transition-all disabled:opacity-50 w-full sm:w-auto"
    >
      {loading ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : (
        <>
          <ShieldX className="w-4 h-4" /> {isUpdate ? "Reject Edits" : "Eject from Registry"}
        </>
      )}
    </button>
  );
}
