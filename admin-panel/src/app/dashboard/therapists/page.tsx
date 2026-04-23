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
  // Using a join via foreign keys
  const { data: therapists, error } = await supabase
    .from("Therapist")
    .select(`
      *,
      user:User (
        email,
        createdAt
      )
    `)
    .order("isVerified", { ascending: true });

  if (error) {
    console.error("Error fetching therapists:", error);
  }

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-heading font-medium text-primary">Provider Network</h1>
          <p className="text-muted-foreground text-sm font-medium mt-1">Manage all mental health specialists and applications</p>
        </div>
        <div className="flex gap-3">
          {/* Search and Filter removed as requested */}
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
              {therapists?.map((therapist) => (
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
                    {therapist.isVerified ? (
                      <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/5 text-emerald-600 border border-emerald-500/10 rounded-full text-xs font-bold uppercase tracking-widest">
                        <CheckCircle2 className="w-3 h-3" /> Verified
                      </div>
                    ) : (
                      <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-500/5 text-amber-600 border border-amber-500/10 rounded-full text-xs font-bold uppercase tracking-widest">
                        <Clock className="w-3 h-3" /> Pending
                      </div>
                    )}
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
              ))}
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
