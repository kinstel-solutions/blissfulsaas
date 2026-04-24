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

  const pendingEdits = (therapist.pendingFields as Record<string, any>) || {};

  const getFieldInfo = (key: keyof typeof therapist) => {
    const pendingValue = pendingEdits[key as string];
    const originalValue = therapist[key];
    
    let hasChanged = false;
    if (key in pendingEdits) {
      // Handle deep comparison for arrays (specialities, languages)
      if (Array.isArray(pendingValue) || Array.isArray(originalValue)) {
        hasChanged = JSON.stringify(pendingValue || []) !== JSON.stringify(originalValue || []);
      } else {
        // Strict comparison for primitives
        // Note: use != instead of !== if we want to treat null/undefined/"" as similar, 
        // but here it's safer to be explicit.
        hasChanged = pendingValue !== originalValue;
        
        // Special case: if both are falsy (null, "", 0, undefined), it's not a "change"
        if (!pendingValue && !originalValue) {
          hasChanged = false;
        }
      }
    }

    const value = hasChanged ? pendingValue : originalValue;
    return { hasPending: hasChanged, value, originalValue };
  };

  const firstNameInfo = getFieldInfo("firstName");
  const lastNameInfo = getFieldInfo("lastName");
  const profileImageInfo = getFieldInfo("profileImageUrl");
  const qualificationsInfo = getFieldInfo("qualifications");
  const phoneInfo = getFieldInfo("phone");
  const bioInfo = getFieldInfo("bio");
  const videoUrlInfo = getFieldInfo("videoUrl");
  const hourlyRateInfo = getFieldInfo("hourlyRate");
  const yearsOfExperienceInfo = getFieldInfo("yearsOfExperience");
  const languagesInfo = getFieldInfo("languages");
  const clinicAddressInfo = getFieldInfo("clinicAddress");
  const specialitiesInfo = getFieldInfo("specialities");

  const PendingLabel = () => (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-yellow-100 text-yellow-700 rounded-md text-[9px] font-bold uppercase tracking-[0.1em] border border-yellow-200 ml-2 shadow-sm">
      <Clock className="w-2.5 h-2.5" /> Updated
    </span>
  );

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
              <div className={`w-24 h-24 md:w-32 md:h-32 rounded-[2.5rem] md:rounded-[3rem] bg-primary/5 flex items-center justify-center text-primary font-bold shadow-inner border border-primary/10 text-4xl md:text-5xl overflow-hidden shrink-0 transition-all`}>
                {profileImageInfo.value ? (
                  <img src={profileImageInfo.value} alt={firstNameInfo.value} className="w-full h-full object-cover" />
                ) : (
                  firstNameInfo.value?.[0]
                )}
              </div>
              <div className="space-y-4">
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
                  <h1 className="text-3xl md:text-5xl font-heading font-medium text-primary leading-tight">
                    {firstNameInfo.value} {lastNameInfo.value}
                  </h1>
                  {(firstNameInfo.hasPending || lastNameInfo.hasPending) && <PendingLabel />}
                </div>
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
               {(!therapist.isVerified || therapist.pendingFields) && (
                 <ApproveButton id={therapist.id} isUpdate={!!therapist.pendingFields} />
               )}
               <RejectButton id={therapist.id} isUpdate={!!therapist.pendingFields} />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-12">
        {/* Core Profile Info */}
        <div className="space-y-10">
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
             <div className="space-y-2">
                <div className="flex items-center">
                  <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground/40">Professional Qualifications</label>
                  {qualificationsInfo.hasPending && <PendingLabel />}
                </div>
                <div className="relative group">
                  <div className={`absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-xl flex items-center justify-center transition-all bg-primary/5 text-primary/40 group-hover:text-primary group-hover:bg-primary/10`}>
                    <GraduationCap className="w-5 h-5" />
                  </div>
                  <div className={`w-full border rounded-[1.5rem] pl-16 pr-6 py-5 text-sm font-medium shadow-sm transition-all bg-surface-container-lowest border-outline-variant/20 text-foreground`}>
                    {qualificationsInfo.value || "No qualifications listed."}
                    {qualificationsInfo.hasPending && (
                      <div className="mt-2 pt-2 border-t border-outline-variant/10 text-[10px] text-muted-foreground/40 italic">
                        Original: {qualificationsInfo.originalValue || "Empty"}
                      </div>
                    )}
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
                <div className="flex items-center">
                  <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground/40">Phone Number</label>
                  {phoneInfo.hasPending && <PendingLabel />}
                </div>
                <div className="relative group">
                  <div className={`absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-xl flex items-center justify-center transition-all bg-primary/5 text-primary/40 group-hover:text-primary group-hover:bg-primary/10`}>
                    <Phone className="w-5 h-5" />
                  </div>
                  <div className={`w-full border rounded-[1.5rem] pl-16 pr-6 py-5 text-sm font-medium shadow-sm transition-all bg-surface-container-lowest border-outline-variant/20 text-foreground`}>
                    {phoneInfo.value || "Not provided"}
                    {phoneInfo.hasPending && (
                      <div className="mt-2 pt-2 border-t border-outline-variant/10 text-[10px] text-muted-foreground/40 italic">
                        Original: {phoneInfo.originalValue || "Empty"}
                      </div>
                    )}
                  </div>
                </div>
             </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center">
              <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground/40">Clinical Biography</label>
              {bioInfo.hasPending && <PendingLabel />}
            </div>
            <div className={`border rounded-[2rem] px-8 py-8 text-lg italic serif leading-relaxed shadow-sm relative overflow-hidden transition-all bg-surface-container-lowest border-outline-variant/20 text-foreground/80`}>
               <div className={`absolute top-0 right-0 w-32 h-32 bg-primary/[0.02] rounded-full blur-3xl -translate-y-1/2 translate-x-1/2`} />
               <FileText className={`w-8 h-8 mb-4 text-primary/10`} />
               "{bioInfo.value || "No biography provided by the practitioner."}"
               {bioInfo.hasPending && (
                <div className="mt-4 pt-4 border-t border-outline-variant/10 text-xs text-muted-foreground/40 italic leading-relaxed">
                  <span className="font-bold uppercase tracking-widest text-[10px] block mb-1 opacity-50">Original Biography:</span>
                  "{bioInfo.originalValue || "Empty"}"
                </div>
               )}
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center">
              <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground/40">Clinical Introduction</label>
              {videoUrlInfo.hasPending && <PendingLabel />}
            </div>
            {videoUrlInfo.value ? (
              <div className={`w-full max-w-2xl aspect-video rounded-3xl overflow-hidden border shadow-lg transition-all border-outline-variant/20 bg-surface-container-low`}>
                {(() => {
                  const url = videoUrlInfo.value;
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
              <div className={`w-full border rounded-[1.5rem] px-6 py-5 text-sm font-medium italic shadow-sm transition-all bg-surface-container-lowest border-outline-variant/20 text-muted-foreground/40`}>
                No introduction video provided.
              </div>
            )}
            {videoUrlInfo.hasPending && (
              <p className="text-[10px] text-muted-foreground/40 font-medium mt-1 ml-2">Original URL: {videoUrlInfo.originalValue || "Empty"}</p>
            )}
          </div>

          {/* Metrics Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
             <div className="space-y-2">
                <div className="flex items-center">
                  <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground/40">Hourly Rate</label>
                  {hourlyRateInfo.hasPending && <PendingLabel />}
                </div>
                <div className={`border rounded-[1.5rem] p-6 flex flex-col gap-4 shadow-sm group transition-all bg-surface-container-low border-outline-variant/10 hover:border-emerald-500/20`}>
                   <div className="flex items-center gap-5">
                     <div className={`w-14 h-14 bg-white rounded-2xl flex items-center justify-center shadow-inner border group-hover:scale-110 transition-transform text-emerald-600 border-emerald-500/5`}>
                        <IndianRupee className="w-7 h-7" />
                     </div>
                     <div>
                        <p className={`text-2xl font-bold text-foreground`}>₹{hourlyRateInfo.value || 0}.00</p>
                        <p className={`text-[10px] font-bold uppercase tracking-widest text-muted-foreground/50`}>Consultation Fee</p>
                     </div>
                   </div>
                   {hourlyRateInfo.hasPending && (
                    <div className="pt-2 border-t border-outline-variant/10 text-[10px] text-muted-foreground/40 italic">
                      Original: ₹{hourlyRateInfo.originalValue || 0}
                    </div>
                   )}
                </div>
             </div>

             <div className="space-y-2">
                <div className="flex items-center">
                  <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground/40">Experience</label>
                  {yearsOfExperienceInfo.hasPending && <PendingLabel />}
                </div>
                <div className={`border rounded-[1.5rem] p-6 flex flex-col gap-4 shadow-sm group transition-all bg-surface-container-low border-outline-variant/10 hover:border-primary/20`}>
                   <div className="flex items-center gap-5">
                     <div className={`w-14 h-14 bg-white rounded-2xl flex items-center justify-center shadow-inner border group-hover:scale-110 transition-transform text-primary border-primary/5`}>
                        <Clock className="w-7 h-7" />
                     </div>
                     <div>
                        <p className={`text-2xl font-bold text-foreground`}>{yearsOfExperienceInfo.value || 0} Years</p>
                        <p className={`text-[10px] font-bold uppercase tracking-widest text-muted-foreground/50`}>Practice Duration</p>
                     </div>
                   </div>
                   {yearsOfExperienceInfo.hasPending && (
                    <div className="pt-2 border-t border-outline-variant/10 text-[10px] text-muted-foreground/40 italic">
                      Original: {yearsOfExperienceInfo.originalValue || 0} Years
                    </div>
                   )}
                </div>
             </div>

             <div className="space-y-2">
                <div className="flex items-center">
                  <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground/40">Languages</label>
                  {languagesInfo.hasPending && <PendingLabel />}
                </div>
                <div className={`border rounded-[1.5rem] p-6 flex flex-col gap-4 shadow-sm group transition-all bg-surface-container-low border-outline-variant/10 hover:border-primary/20`}>
                   <div className="flex items-center gap-5">
                     <div className={`w-14 h-14 bg-white rounded-2xl flex items-center justify-center shadow-inner border group-hover:scale-110 transition-transform text-primary border-primary/5`}>
                        <Globe className="w-7 h-7" />
                     </div>
                     <div className="flex flex-wrap gap-1.5 max-w-[150px]">
                        {languagesInfo.value?.map((lang: string, i: number) => (
                          <span key={i} className={`text-[10px] font-bold uppercase text-primary/60`}>{lang}{i < languagesInfo.value.length - 1 ? ',' : ''}</span>
                        )) || <span className="text-[10px] font-bold uppercase text-muted-foreground/40">English</span>}
                     </div>
                   </div>
                   {languagesInfo.hasPending && (
                    <div className="pt-2 border-t border-outline-variant/10 text-[10px] text-muted-foreground/40 italic">
                      Original: {languagesInfo.originalValue?.join(', ') || "English"}
                    </div>
                   )}
                </div>
             </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Clinic Address */}
            <div className="space-y-2">
               <div className="flex items-center">
                <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground/40">Clinic Address</label>
                {clinicAddressInfo.hasPending && <PendingLabel />}
               </div>
               <div className="relative group">
                 <div className={`absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-xl flex items-center justify-center transition-all bg-emerald-500/5 text-emerald-600/40 group-hover:text-emerald-600 group-hover:bg-emerald-500/10`}>
                   <MapPin className="w-5 h-5" />
                 </div>
                 <div className={`w-full border rounded-[1.5rem] pl-16 pr-6 py-5 text-sm font-medium shadow-sm transition-all bg-surface-container-lowest border-outline-variant/20 text-foreground`}>
                   {clinicAddressInfo.value || "No clinic address provided."}
                   {clinicAddressInfo.hasPending && (
                    <div className="mt-2 pt-2 border-t border-outline-variant/10 text-[10px] text-muted-foreground/40 italic">
                      Original: {clinicAddressInfo.originalValue || "Empty"}
                    </div>
                   )}
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
             <div className="flex items-center">
              <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground/40">Clinical Focus Areas</label>
              {specialitiesInfo.hasPending && <PendingLabel />}
             </div>
             <div className={`p-8 border rounded-[2.5rem] flex flex-wrap gap-3 shadow-inner transition-all bg-surface-container-lowest border-outline-variant/20`}>
                <Tag className={`w-5 h-5 mt-1 mr-2 text-primary/20`} />
                <div className="flex-1">
                  <div className="flex flex-wrap gap-3 mb-4">
                    {specialitiesInfo.value?.map((spec: string, i: number) => (
                      <span key={i} className={`px-5 py-2.5 rounded-2xl text-xs font-bold tracking-tight border transition-all cursor-default bg-primary/5 text-primary border-primary/10 hover:bg-primary hover:text-white`}>
                        {spec}
                      </span>
                    )) || <span className="text-sm text-muted-foreground italic">General Practice Provider</span>}
                  </div>
                  {specialitiesInfo.hasPending && (
                    <div className="pt-4 border-t border-outline-variant/10 text-[10px] text-muted-foreground/40 italic">
                      Original Areas: {specialitiesInfo.originalValue?.join(', ') || "None"}
                    </div>
                  )}
                </div>
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
