"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ShieldX, Loader2 } from "lucide-react";

export default function RejectButton({ id }: { id: string }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleReject = async () => {
    if (!confirm("Are you sure you want to REJECT and PERMANENTLY DELETE this practitioner application? This action cannot be reversed.")) return;
    
    setLoading(true);
    try {
      const res = await fetch(`/api/therapists/${id}/reject`, { method: "DELETE" });
      if (res.ok) {
        router.push("/dashboard/therapists");
        router.refresh();
      } else {
        alert("Ejection sequence failed. Access restricted.");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button 
      onClick={handleReject}
      disabled={loading}
      className="h-14 px-8 bg-surface border border-destructive/20 text-destructive rounded-2xl font-bold uppercase tracking-widest text-[10px] hover:bg-destructive hover:text-white transition-all disabled:opacity-50 flex items-center gap-3"
    >
      {loading ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : (
        <>
          <ShieldX className="w-4 h-4" /> Eject from Registry
        </>
      )}
    </button>
  );
}
