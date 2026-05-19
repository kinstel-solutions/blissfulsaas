"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Loader2 } from "lucide-react";
import { api } from "@/lib/api";
import { AlexButton } from "@/components/ui/AlexButton";

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
    <AlexButton 
      onClick={handleApprove}
      disabled={loading}
      size="lg"
      icon={loading ? <Loader2 className="w-4 h-4 animate-spin text-primary group-hover:text-white" /> : undefined}
      className="shadow-xl shadow-primary/20 w-full sm:w-auto"
    >
      {isUpdate ? "Approve Edits" : "Verify Credentials"}
    </AlexButton>
  );
}
