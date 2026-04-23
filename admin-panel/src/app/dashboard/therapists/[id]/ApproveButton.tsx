"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Loader2 } from "lucide-react";
import { api } from "@/lib/api";

export default function ApproveButton({ id }: { id: string }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleApprove = async () => {
    if (!confirm("Confirm practioner verification? This will grant them full access to the medical marketplace.")) return;
    
    setLoading(true);
    try {
      await api.therapists.verify(id);
      router.refresh();
    } catch (err: any) {
      console.error(err);
      alert(err.message || "Verification sequence failed. System error.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button 
      onClick={handleApprove}
      disabled={loading}
      className="h-14 px-8 bg-primary text-white rounded-full font-bold uppercase tracking-widest text-[10px] md:text-xs shadow-xl shadow-primary/20 hover:shadow-primary/40 hover:-translate-y-1 active:translate-y-0.5 flex items-center justify-center gap-3 transition-all disabled:opacity-50 w-full sm:w-auto"
    >
      {loading ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : (
        <>
          <CheckCircle2 className="w-4 h-4" /> Verify Credentials
        </>
      )}
    </button>
  );
}
