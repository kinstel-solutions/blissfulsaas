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
  IndianRupee,
  User,
  Activity,
  Award,
  Clock,
  GraduationCap,
  Globe,
  MapPin,
  Tag,
  Video,
  Phone,
  ExternalLink
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
    <div className="space-y-12 pb-24 max-w-5xl mx-auto animate-in fade-in slide-in-from-bottom-8 duration-1000">
      {/* Header Slot */}
      <div className="bg-surface-container-lowest border border-outline-variant/10 rounded-[2.5rem] p-6 md:p-10 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/[0.02] rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        
        <div className="flex flex-col gap-8 relative z-10">
          <Link 
            href="/dashboard/therapists" 
            className="group inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-primary/40 hover:text-primary transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform" />
            Back to Registry
          </Link>

          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8">
            <div className="flex flex-col md:flex-row items-center md:items-start gap-6 text-center md:text-left">
              <div className="w-24 h-24 md:w-32 md:h-32 rounded-[2.5rem] md:rounded-[3rem] bg-primary/5 flex items-center justify-center text-primary font-bold shadow-inner border border-primary/10 text-4xl md:text-5xl overflow-hidden shrink-0">
                {therapist.profileImageUrl ? (
                  <img src={therapist.profileImageUrl} alt={therapist.firstName} className="w-full h-full object-cover" />
                ) : (
                  therapist.firstName?.[0]
                )}
              </div>
              <div className="space-y-4">
                <h1 className="text-3xl md:text-5xl font-heading font-medium text-primary leading-tight">
                  {therapist.firstName} {therapist.lastName}
                </h1>
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
                  <div className="flex items-center gap-2 px-4 py-1.5 bg-primary/[0.03] text-primary/70 rounded-full border border-primary/10 shadow-sm">
                     <Activity className="w-3.5 h-3.5 opacity-50" />
                     <span className="text-[10px] md:text-xs font-bold uppercase tracking-widest">Clinical Practitioner</span>
                  </div>
                  {therapist.isVerified ? (
                    <div className="flex items-center gap-2 px-4 py-1.5 bg-emerald-500/[0.03] text-emerald-600 rounded-full border border-emerald-500/10 shadow-sm">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span className="text-[10px] md:text-xs font-bold uppercase tracking-widest">Verified</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 px-4 py-1.5 bg-amber-500/[0.03] text-amber-600 rounded-full border border-amber-500/10 shadow-sm">
                      <Clock className="w-3.5 h-3.5" />
                      <span className="text-[10px] md:text-xs font-bold uppercase tracking-widest">Pending Review</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto">
               {!therapist.isVerified && <ApproveButton id={therapist.id} />}
               <RejectButton id={therapist.id} />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-12">
        {/* Core Profile Info */}
        <div className="space-y-10">
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
             <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground/40">Professional Qualifications</label>
                <div className="relative group">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-primary/5 rounded-xl flex items-center justify-center text-primary/40 group-hover:text-primary group-hover:bg-primary/10 transition-all">
                    <GraduationCap className="w-5 h-5" />
                  </div>
                  <div className="w-full bg-surface-container-lowest border border-outline-variant/20 rounded-[1.5rem] pl-16 pr-6 py-5 text-sm font-medium text-foreground shadow-sm">
                    {therapist.qualifications || "No qualifications listed."}
                  </div>
                </div>
             </div>

             <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground/40">Verified Email</label>
                <div className="relative group">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-primary/5 rounded-xl flex items-center justify-center text-primary/40 group-hover:text-primary group-hover:bg-primary/10 transition-all">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div className="w-full bg-surface-container-lowest border border-outline-variant/20 rounded-[1.5rem] pl-16 pr-6 py-5 text-sm font-medium text-foreground shadow-sm">
                    {(therapist.user as any)?.email}
                  </div>
                </div>
             </div>

             <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground/40">Phone Number</label>
                <div className="relative group">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-primary/5 rounded-xl flex items-center justify-center text-primary/40 group-hover:text-primary group-hover:bg-primary/10 transition-all">
                    <Phone className="w-5 h-5" />
                  </div>
                  <div className="w-full bg-surface-container-lowest border border-outline-variant/20 rounded-[1.5rem] pl-16 pr-6 py-5 text-sm font-medium text-foreground shadow-sm">
                    {therapist.phone || "Not provided"}
                  </div>
                </div>
             </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground/40">Clinical Biography</label>
            <div className="bg-surface-container-lowest border border-outline-variant/20 rounded-[2rem] px-8 py-8 text-lg italic serif leading-relaxed text-foreground/80 shadow-sm relative overflow-hidden">
               <div className="absolute top-0 right-0 w-32 h-32 bg-primary/[0.02] rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
               <FileText className="w-8 h-8 text-primary/10 mb-4" />
               "{therapist.bio || "No biography provided by the practitioner."}"
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground/40">Clinical Introduction</label>
            {therapist.videoUrl ? (
              <div className="w-full max-w-2xl aspect-video rounded-3xl overflow-hidden border border-outline-variant/20 shadow-lg bg-surface-container-low">
                {(() => {
                  const url = therapist.videoUrl;
                  let embedUrl = url;
                  
                  if (url.includes('youtube.com/watch?v=')) {
                    const id = url.split('v=')[1]?.split('&')[0];
                    embedUrl = `https://www.youtube.com/embed/${id}`;
                  } else if (url.includes('youtu.be/')) {
                    const id = url.split('youtu.be/')[1]?.split('?')[0];
                    embedUrl = `https://www.youtube.com/embed/${id}`;
                  } else if (url.includes('vimeo.com/')) {
                    const id = url.split('vimeo.com/')[1]?.split('?')[0];
                    embedUrl = `https://player.vimeo.com/video/${id}`;
                  } else if (url.includes('loom.com/share/')) {
                    const id = url.split('loom.com/share/')[1]?.split('?')[0];
                    embedUrl = `https://www.loom.com/embed/${id}`;
                  }

                  return (
                    <iframe 
                      src={embedUrl}
                      className="w-full h-full"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  );
                })()}
              </div>
            ) : (
              <div className="w-full bg-surface-container-lowest border border-outline-variant/20 rounded-[1.5rem] px-6 py-5 text-sm font-medium text-muted-foreground/40 italic shadow-sm">
                No introduction video provided.
              </div>
            )}
          </div>

          {/* Metrics Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
             <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground/40">Hourly Rate</label>
                <div className="bg-surface-container-low border border-outline-variant/10 rounded-[1.5rem] p-6 flex items-center gap-5 shadow-sm group hover:border-emerald-500/20 transition-all">
                   <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-emerald-600 shadow-inner border border-emerald-500/5 group-hover:scale-110 transition-transform">
                      <IndianRupee className="w-7 h-7" />
                   </div>
                   <div>
                      <p className="text-2xl font-bold text-foreground">₹{therapist.hourlyRate || 0}.00</p>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/50">Consultation Fee</p>
                   </div>
                </div>
             </div>

             <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground/40">Experience</label>
                <div className="bg-surface-container-low border border-outline-variant/10 rounded-[1.5rem] p-6 flex items-center gap-5 shadow-sm group hover:border-primary/20 transition-all">
                   <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-primary shadow-inner border border-primary/5 group-hover:scale-110 transition-transform">
                      <Clock className="w-7 h-7" />
                   </div>
                   <div>
                      <p className="text-2xl font-bold text-foreground">{therapist.yearsOfExperience || 0} Years</p>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/50">Practice Duration</p>
                   </div>
                </div>
             </div>

             <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground/40">Languages</label>
                <div className="bg-surface-container-low border border-outline-variant/10 rounded-[1.5rem] p-6 flex items-center gap-5 shadow-sm group hover:border-primary/20 transition-all">
                   <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-primary shadow-inner border border-primary/5 group-hover:scale-110 transition-transform">
                      <Globe className="w-7 h-7" />
                   </div>
                   <div className="flex flex-wrap gap-1.5 max-w-[150px]">
                      {therapist.languages?.map((lang: string, i: number) => (
                        <span key={i} className="text-[10px] font-bold uppercase text-primary/60">{lang}{i < therapist.languages.length - 1 ? ',' : ''}</span>
                      )) || <span className="text-[10px] font-bold uppercase text-muted-foreground/40">English</span>}
                   </div>
                </div>
             </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Clinic Address */}
            <div className="space-y-2">
               <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground/40">Clinic Address</label>
               <div className="relative group">
                 <div className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-emerald-500/5 rounded-xl flex items-center justify-center text-emerald-600/40 group-hover:text-emerald-600 group-hover:bg-emerald-500/10 transition-all">
                   <MapPin className="w-5 h-5" />
                 </div>
                 <div className="w-full bg-surface-container-lowest border border-outline-variant/20 rounded-[1.5rem] pl-16 pr-6 py-5 text-sm font-medium text-foreground shadow-sm">
                   {therapist.clinicAddress || "No clinic address provided."}
                 </div>
               </div>
            </div>

            {/* Registration Date */}
            <div className="space-y-2">
               <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground/40">System Enrollment</label>
               <div className="relative group">
                 <div className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-primary/5 rounded-xl flex items-center justify-center text-primary/40 group-hover:text-primary group-hover:bg-primary/10 transition-all">
                   <Calendar className="w-5 h-5" />
                 </div>
                 <div className="w-full bg-surface-container-lowest border border-outline-variant/20 rounded-[1.5rem] pl-16 pr-6 py-5 text-sm font-medium text-foreground shadow-sm">
                   {new Date((therapist.user as any)?.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                 </div>
               </div>
            </div>
          </div>

          {/* Specialities */}
          <div className="space-y-4">
             <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground/40">Clinical Focus Areas</label>
             <div className="p-8 bg-surface-container-lowest border border-outline-variant/20 rounded-[2.5rem] flex flex-wrap gap-3 shadow-inner">
                <Tag className="w-5 h-5 text-primary/20 mt-1 mr-2" />
                {therapist.specialities?.map((spec: string, i: number) => (
                  <span key={i} className="px-5 py-2.5 bg-primary/5 text-primary rounded-2xl text-xs font-bold tracking-tight border border-primary/10 hover:bg-primary hover:text-white transition-all cursor-default">
                    {spec}
                  </span>
                )) || <span className="text-sm text-muted-foreground italic">General Practice Provider</span>}
             </div>
          </div>

          {/* Compliance Footer */}
          <div className="pt-10 border-t border-outline-variant/10 flex flex-col md:flex-row items-center justify-between gap-6">
             <div className="flex items-center gap-4 text-destructive/60">
                <ShieldX className="w-6 h-6" />
                <p className="text-xs font-medium max-w-md">
                  Verify all clinical credentials manually before granting verified status. 
                  Verification assumes legal compliance on behalf of Blissful Station.
                </p>
             </div>
          </div>

        </div>
      </div>
    </div>
  );
}
