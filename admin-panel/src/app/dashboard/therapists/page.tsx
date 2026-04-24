import { createAdminClient } from "@/lib/supabase/server";
import Link from "next/link";
import { 
  Search, 
  Filter, 
  MoreHorizontal, 
  CheckCircle2, 
  Clock, 
  ExternalLink,
  ChevronRight
} from "lucide-react";

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
  const hasPendingUpdates = (therapist: any) => {
    if (!therapist.pendingFields) return false;
    try {
      const fields = typeof therapist.pendingFields === 'string' 
        ? JSON.parse(therapist.pendingFields) 
        : therapist.pendingFields;
      return fields && Object.keys(fields).length > 0;
    } catch (e) {
      return false;
    }
  };

  // Sort therapists in memory to prioritize those needing attention
  const therapists = [...(rawTherapists || [])].sort((a, b) => {
    const aHasUpdates = hasPendingUpdates(a);
    const bHasUpdates = hasPendingUpdates(b);
    
    const aNeedsAttention = !a.isVerified || aHasUpdates;
    const bNeedsAttention = !b.isVerified || bHasUpdates;

    // 1. Prioritize anything that needs attention (New Apps or Updates)
    if (aNeedsAttention && !bNeedsAttention) return -1;
    if (!aNeedsAttention && bNeedsAttention) return 1;

    // 2. If both need attention, prioritize New Applications over Updates to existing ones
    if (aNeedsAttention && bNeedsAttention) {
      if (!a.isVerified && b.isVerified) return -1;
      if (a.isVerified && !b.isVerified) return 1;
    }

    // 3. Finally sort by registration date (newest first)
    return new Date((b.user as any)?.createdAt).getTime() - new Date((a.user as any)?.createdAt).getTime();
  });

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-heading font-medium text-primary">Provider Network</h1>
          <p className="text-muted-foreground text-sm font-medium mt-1">Manage all mental health specialists and applications</p>
        </div>
      </div>

      <div className="bg-surface-container-lowest border border-outline-variant/20 rounded-xl shadow-xl overflow-hidden relative group">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-outline-variant/10 text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground/50 bg-primary/[0.01]">
                <th className="px-5 md:px-10 py-6">Practitioner</th>
                <th className="px-4 md:px-8 py-6">Status</th>
                <th className="px-4 md:px-8 py-6">Rate</th>
                <th className="px-4 md:px-8 py-6">Registration</th>
                <th className="px-4 md:px-8 py-6 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/5">
              {therapists?.map((therapist) => {
                const hasUpdates = hasPendingUpdates(therapist);
                
                return (
                  <tr key={therapist.id} className="group/row hover:bg-primary/[0.01] transition-colors">
                    <td className="px-5 md:px-10 py-4 md:py-8">
                      <div className="flex items-center gap-5">
                        <div className="w-12 h-12 rounded-2xl bg-primary/5 flex items-center justify-center text-primary font-bold shadow-inner border border-primary/5 text-lg overflow-hidden">
                          {therapist.profileImageUrl ? (
                            <img src={therapist.profileImageUrl} alt={therapist.firstName} className="w-full h-full object-cover" />
                          ) : (
                            therapist.firstName?.[0] || "?"
                          )}
                        </div>
                        <div>
                          <p className="font-heading font-medium text-foreground text-lg leading-tight">
                            {therapist.firstName} {therapist.lastName}
                          </p>
                          <p className="text-xs text-muted-foreground/60 mt-0.5 tracking-tight">{(therapist.user as any)?.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 md:px-8 py-4 md:py-8">
                      <div className="flex flex-col gap-2">
                        {therapist.isVerified ? (
                          <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/5 text-emerald-600 border border-emerald-500/10 rounded-full text-[10px] font-bold uppercase tracking-widest w-fit">
                            <CheckCircle2 className="w-3 h-3" /> Verified
                          </div>
                        ) : (
                          <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-500/5 text-amber-600 border border-amber-500/10 rounded-full text-[10px] font-bold uppercase tracking-widest w-fit">
                            <Clock className="w-3 h-3" /> New Application
                          </div>
                        )}
                        
                        {hasUpdates && (
                          <div className="inline-flex items-center gap-2 px-3 py-1 bg-yellow-100 text-yellow-700 border border-yellow-200 rounded-full text-[10px] font-bold uppercase tracking-widest w-fit shadow-sm">
                            <Clock className="w-3 h-3" /> Updates Pending
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-4 md:px-8 py-4 md:py-8">
                      <p className="text-sm font-bold text-primary">${therapist.hourlyRate || 0}/hr</p>
                      <p className="text-xs text-muted-foreground/40 font-bold uppercase tracking-tighter">Market Value</p>
                    </td>
                    <td className="px-4 md:px-8 py-4 md:py-8">
                      <p className="text-sm font-medium text-foreground/70">
                        {new Date((therapist.user as any)?.createdAt).toLocaleDateString('en-US')}
                      </p>
                    </td>
                    <td className="px-4 md:px-8 py-4 md:py-8 text-right">
                      <Link 
                        href={`/dashboard/therapists/${therapist.id}`}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-surface hover:bg-primary hover:text-white rounded-xl border border-outline-variant/30 hover:border-primary transition-all text-xs font-bold uppercase tracking-widest group/btn"
                      >
                        Inspect <ChevronRight className="w-3 h-3 group-hover/btn:translate-x-1 transition-transform" />
                      </Link>
                    </td>
                  </tr>
                );
              })}
              {(!therapists || therapists.length === 0) && (
                <tr>
                  <td colSpan={5} className="px-5 md:px-10 py-20 text-center">
                     <p className="text-muted-foreground italic text-sm">No practitioners registered in the database yet.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
