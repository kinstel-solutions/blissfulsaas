"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Loader2 } from "lucide-react";

export default function ApproveButton({ id }: { id: string }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleApprove = async () => {
    if (!confirm("Confirm practioner verification? This will grant them full access to the medical marketplace.")) return;
    
    setLoading(true);
    try {
      const res = await fetch(`/api/therapists/${id}/approve`, { method: "PATCH" });
      if (res.ok) {
        router.refresh();
      } else {
        alert("Verification sequence failed. Terminal error.");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button 
      onClick={handleApprove}
      disabled={loading}
      className="h-14 px-8 bg-emerald-600 text-white rounded-2xl font-bold uppercase tracking-widest text-[10px] shadow-lg shadow-emerald-600/20 hover:shadow-emerald-600/40 hover:-translate-y-1 active:translate-y-0.5 flex items-center gap-3 transition-all disabled:opacity-50"
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
