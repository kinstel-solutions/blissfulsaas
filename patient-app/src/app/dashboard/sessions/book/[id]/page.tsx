import { api } from "@/lib/api-server";
import SlotSelectionClient from "./SlotSelectionClient";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";

export default async function SlotSelectionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: therapistId } = await params;
  
  // Fetch therapist details (verified only)
  const therapist = await api.therapists.getById(therapistId);

  if (!therapist) {
    notFound();
  }

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-5 duration-700">
      <Link
        href={`/therapist/${therapistId}`}
        className="inline-flex items-center gap-2 px-4 py-2.5 text-[10px] lg:text-xs font-bold uppercase tracking-widest text-muted-foreground hover:text-foreground bg-surface-container-low hover:bg-surface-container border border-outline-variant/30 rounded-xl transition-all shadow-sm hover:shadow group w-fit"
      >
        <ChevronLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
        <span>Back to Profile</span>
      </Link>

      <header>
        <h1 className="text-4xl font-heading font-medium text-foreground">
          Schedule with {therapist.firstName}
        </h1>
        <p className="text-muted-foreground mt-2 text-lg">
          Pick a date and choose a time slot that works best for you.
        </p>
      </header>

      <SlotSelectionClient 
        therapist={therapist} 
      />
    </div>
  );
}
