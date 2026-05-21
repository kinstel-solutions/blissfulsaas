"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, CheckCircle2 } from "lucide-react";
import { api } from "@/lib/api";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function ApproveButton({ id, isUpdate }: { id: string, isUpdate?: boolean }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleApprove = async () => {
    const msg = isUpdate 
      ? "Confirm approval of these profile updates? They will go live immediately."
      : "Confirm practioner verification? This will grant them full access to the medical marketplace.";
      
    if (!confirm(msg)) return;
    
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
      className={cn(
        buttonVariants({ variant: "default" }),
        "w-full sm:w-auto rounded-lg py-2.5 px-5 h-auto text-xs font-bold uppercase tracking-widest shadow-sm hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 transition-all duration-300 gap-2"
      )}
    >
      {loading ? (
        <Loader2 className="w-4 h-4 animate-spin text-primary-foreground" />
      ) : (
        <>
          <CheckCircle2 className="w-4 h-4" />
          {isUpdate ? "Approve Edits" : "Verify Credentials"}
        </>
      )}
    </button>
  );
}
