"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ShieldX, Loader2 } from "lucide-react";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";

export default function RejectButton({ id, isUpdate }: { id: string, isUpdate?: boolean }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleReject = async () => {
    const msg = isUpdate
      ? "Are you sure you want to REJECT these profile updates? The practitioner's active profile will remain unchanged."
      : "Are you sure you want to REJECT and PERMANENTLY DELETE this practitioner application? This action cannot be reversed.";

    let reason = "";
    if (!isUpdate) {
       reason = prompt("Please provide a reason for rejection (this will be stored for clinical records):") || "";
       if (reason === null) return; // User cancelled prompt
    }

    if (!confirm(msg)) return;
    
    setLoading(true);
    try {
      await api.therapists.reject(id, reason || undefined);
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
    <Button 
      variant="destructive"
      onClick={handleReject}
      disabled={loading}
      className="w-full sm:w-auto rounded-lg py-2.5 px-5 h-auto text-xs font-bold uppercase tracking-widest shadow-sm hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 transition-all duration-300 gap-2"
    >
      {loading ? (
        <Loader2 className="w-4 h-4 animate-spin text-destructive-foreground" />
      ) : (
        <>
          <ShieldX className="w-4 h-4" /> {isUpdate ? "Reject Edits" : "Eject from Registry"}
        </>
      )}
    </Button>
  );
}
