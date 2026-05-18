import { createAdminClient } from "@/lib/supabase/server";
import TherapistsList, { TherapistWithUser } from "./TherapistsList";

export default async function TherapistsPage() {
  const supabase = await createAdminClient();

  // Fetch therapists with their user data
  const { data: rawTherapists, error } = await supabase
    .from("Therapist")
    .select(`
      *,
      user:User (
        email,
        createdAt
      )
    `);

  if (error) {
    console.error("Error fetching therapists:", error);
  }

  // Robust check for pending fields
  const hasPendingUpdates = (therapist: { pendingFields?: unknown }) => {
    if (!therapist.pendingFields) return false;
    try {
      const fields = typeof therapist.pendingFields === 'string' 
        ? JSON.parse(therapist.pendingFields) 
        : therapist.pendingFields;
      return fields && typeof fields === 'object' && Object.keys(fields).length > 0;
    } catch {
      return false;
    }
  };

  // Precompute hasUpdates and sort therapists in memory to prioritize those needing attention
  const therapists: TherapistWithUser[] = [...(rawTherapists || [])]
    .map((therapist) => ({
      ...therapist,
      hasUpdates: hasPendingUpdates(therapist)
    }))
    .sort((a, b) => {
      const aNeedsAttention = !a.isVerified || a.hasUpdates;
      const bNeedsAttention = !b.isVerified || b.hasUpdates;

      // 1. Prioritize anything that needs attention (New Apps or Updates)
      if (aNeedsAttention && !bNeedsAttention) return -1;
      if (!aNeedsAttention && bNeedsAttention) return 1;

      // 2. If both need attention, prioritize New Applications over Updates to existing ones
      if (aNeedsAttention && bNeedsAttention) {
        if (!a.isVerified && b.isVerified) return -1;
        if (a.isVerified && !b.isVerified) return 1;
      }

      // 3. Finally sort by registration date (newest first)
      const dateA = a.user?.createdAt ? new Date(a.user.createdAt).getTime() : 0;
      const dateB = b.user?.createdAt ? new Date(b.user.createdAt).getTime() : 0;
      return dateB - dateA;
    });

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div>
        <h1 className="text-3xl font-heading font-medium text-primary">Provider Network</h1>
        <p className="text-muted-foreground text-sm font-medium mt-1">Manage all mental health specialists and applications</p>
      </div>

      <TherapistsList initialTherapists={therapists} />
    </div>
  );
}
