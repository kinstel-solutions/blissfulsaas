import { createAdminClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import { 
  ArrowLeft, 
  ShieldCheck, 
  ShieldX, 
  Mail, 
  Calendar, 
  FileText,
  DollarSign,
  User,
  Activity,
  Award
} from "lucide-react";
import ApproveButton from "./ApproveButton";
import RejectButton from "./RejectButton";

export default async function TherapistDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createAdminClient();

  const { data: therapist, error } = await supabase
    .from("Therapist")
    .select(`
      *,
      user:User (
        email,
        createdAt
      )
    `)
    .eq("id", id)
    .single();

  if (!therapist || error) {
    notFound();
  }

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-8 duration-700">
      {/* Header Slot */}
      <div className="flex justify-between items-start">
        <div className="flex flex-col gap-4">
          <Link 
            href="/dashboard/therapists" 
            className="group inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-primary/40 hover:text-primary transition-colors mb-2"
          >
            <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform" />
            Back to Registry
          </Link>
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 rounded-[2rem] bg-primary/5 flex items-center justify-center text-primary font-bold shadow-inner border border-primary/5 text-3xl">
              {therapist.firstName?.[0]}
            </div>
            <div>
              <h1 className="text-4xl font-heading font-medium text-primary leading-tight">
                {therapist.firstName} {therapist.lastName}
              </h1>
              <div className="flex items-center gap-4 mt-2">
                <div className="flex items-center gap-2 px-3 py-1 bg-surface-container-low rounded-full border border-outline-variant/10">
                   <Activity className="w-3 h-3 text-primary/40" />
                   <span className="text-xs font-bold uppercase tracking-widest text-primary/60">Psychotherapist</span>
                </div>
                {therapist.isVerified && (
                  <div className="flex items-center gap-2 px-3 py-1 bg-emerald-500/5 text-emerald-600 border border-emerald-500/10 rounded-full font-bold uppercase tracking-[0.1em] text-xs">
                    <ShieldCheck className="w-3 h-3" /> Legitimacy Verified
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex gap-4">
           {!therapist.isVerified && <ApproveButton id={therapist.id} />}
           <RejectButton id={therapist.id} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Profile Card */}
        <div className="lg:col-span-2 space-y-8">
           <div className="bg-surface-container-lowest border border-outline-variant/20 rounded-2xl p-6 md:p-12 shadow-sm relative overflow-hidden">
             <div className="absolute top-0 right-0 w-64 h-64 bg-primary/[0.02] rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
             <h3 className="text-xl font-heading font-medium text-primary mb-8 flex items-center gap-3">
                <FileText className="w-5 h-5 text-primary/30" /> Clinical Biography
             </h3>
             <p className="text-foreground/80 leading-relaxed text-lg italic serif">
               "{therapist.bio || "No biography provided by the practitioner."}"
             </p>
             
             <div className="mt-12 pt-10 border-t border-outline-variant/5 grid grid-cols-2 gap-10">
                <div>
                   <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground/40 mb-3">Specialities</p>
                   <div className="flex flex-wrap gap-2">
                      {therapist.specialities?.map((spec: string, i: number) => (
                        <span key={i} className="px-3 py-1.5 bg-surface-container-low rounded-xl text-xs font-medium text-primary/70">
                          {spec}
                        </span>
                      )) || <span className="text-sm text-muted-foreground italic">General Practice</span>}
                   </div>
                </div>
                <div>
                   <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground/40 mb-3">Professional Stance</p>
                   <div className="flex items-center gap-3 p-4 bg-primary/5 rounded-2xl border border-primary/10">
                      <Award className="w-5 h-5 text-primary" />
                      <span className="text-sm font-bold text-primary uppercase tracking-widest">Board Eligible</span>
                   </div>
                </div>
             </div>
           </div>

           <div className="bg-surface-container-lowest border border-outline-variant/20 rounded-2xl p-6 md:p-12 shadow-sm">
              <h3 className="text-xl font-heading font-medium text-primary mb-8 flex items-center gap-3">
                 <Activity className="w-5 h-5 text-primary/30" /> Platform Configuration
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                 <div className="p-6 bg-surface-container-low rounded-xl flex items-center gap-6">
                    <div className="w-12 h-12 bg-surface-container-lowest rounded-2xl flex items-center justify-center border border-outline-variant/10 shadow-sm">
                       <DollarSign className="w-6 h-6 text-emerald-600" />
                    </div>
                    <div>
                       <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground/50">Hourly Rate</p>
                       <p className="text-xl font-bold text-foreground">${therapist.hourlyRate || 0}.00</p>
                    </div>
                 </div>
                 <div className="p-6 bg-surface-container-low rounded-xl flex items-center gap-6">
                    <div className="w-12 h-12 bg-surface-container-lowest rounded-2xl flex items-center justify-center border border-outline-variant/10 shadow-sm">
                       <User className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                       <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground/50">Provider ID</p>
                       <p className="text-sm font-mono text-foreground/60 overflow-hidden text-ellipsis">{therapist.id.substring(0, 13)}...</p>
                    </div>
                 </div>
              </div>
           </div>
        </div>

        {/* Sidebar Data */}
        <div className="space-y-8">
           <div className="bg-primary border border-primary/20 rounded-2xl p-5 md:p-10 shadow-2xl relative overflow-hidden">
             <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/5 rounded-full blur-2xl z-0" />
             <div className="relative z-10 flex flex-col gap-8">
                <h3 className="text-white text-lg font-heading font-normal">Contact Registry</h3>
                <div className="space-y-6">
                   <div className="flex gap-4">
                      <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-white/60">
                         <Mail className="w-5 h-5" />
                      </div>
                      <div className="flex-1 overflow-hidden">
                         <p className="text-xs font-bold uppercase tracking-widest text-white/40">Verified Email</p>
                         <p className="text-sm font-medium text-white truncate">{(therapist.user as any)?.email}</p>
                      </div>
                   </div>
                   <div className="flex gap-4">
                      <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-white/60">
                         <Calendar className="w-5 h-5" />
                      </div>
                      <div>
                         <p className="text-xs font-bold uppercase tracking-widest text-white/40">Enrolled Since</p>
                         <p className="text-sm font-medium text-white">
                           {new Date((therapist.user as any)?.createdAt).toLocaleDateString('en-US')}
                         </p>
                      </div>
                   </div>
                </div>
                <div className="mt-4 pt-10 border-t border-white/10">
                   <button className="w-full h-14 bg-white/10 hover:bg-white/20 text-white rounded-2xl font-bold uppercase tracking-widest text-xs transition-all border border-white/5">
                      Open Communication Channel
                   </button>
                </div>
             </div>
           </div>

           <div className="bg-destructive/5 border border-destructive/10 rounded-xl p-4 md:p-8">
              <div className="flex items-center gap-3 text-destructive mb-4">
                 <ShieldX className="w-5 h-5" />
                 <h4 className="text-sm font-bold uppercase tracking-widest">Compliance Warnings</h4>
              </div>
              <p className="text-xs text-destructive/70 leading-relaxed font-medium">
                Verify all license credentials manually before proceeding with verified status. Blissful Station assumes legal liability upon verification.
              </p>
           </div>
        </div>
      </div>
    </div>
  );
}
