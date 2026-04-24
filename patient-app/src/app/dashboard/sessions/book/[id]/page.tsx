import { api, fetchWithAuthContent } from "@/lib/api-server";
import SlotSelectionClient from "./SlotSelectionClient";
import { notFound } from "next/navigation";

export default async function SlotSelectionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: therapistId } = await params;
  
  // Fetch therapist details (verified only)
  // Re-using verified check server side or directly fetching if needed
  const therapist = await api.therapists.getById(therapistId);

  if (!therapist) {
    notFound();
  }

  // Fetch slots
  const slots = await fetchWithAuthContent(`/availability/therapist/${therapistId}`);
  const slotList = Array.isArray(slots) ? slots : [];

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-5 duration-700">
      <header>
        <h1 className="text-4xl font-heading font-medium text-foreground">
          Schedule with Dr. {therapist.firstName}
        </h1>
        <p className="text-muted-foreground mt-2 text-lg">
          Choose a recurring time that works best for your weekly sessions.
        </p>
      </header>

      <SlotSelectionClient 
        therapist={therapist} 
        slots={slotList} 
      />
    </div>
  );
}
