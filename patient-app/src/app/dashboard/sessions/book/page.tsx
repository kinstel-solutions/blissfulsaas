import { Star, Shield, ArrowRight, User, Clock, GraduationCap } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { fetchWithAuthContent } from "@/lib/api-server";

interface Therapist {
  id: string;
  firstName: string;
  lastName: string;
  profileImageUrl?: string;
  bio?: string;
  specialities?: string[];
  yearsOfExperience?: number;
  qualifications?: string;
  hourlyRate?: number;
}

export default async function BookingPage() {
  const response = await fetchWithAuthContent("/therapists/verified");
  const therapistList: Therapist[] = response?.data && Array.isArray(response.data) ? response.data : [];

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-heading font-medium text-foreground">
            Book a Session
          </h1>
          <p className="text-muted-foreground mt-2 text-lg">
            Select a verified clinical specialist to begin your consultation.
          </p>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {therapistList.length === 0 ? (
          <div className="col-span-full py-20 text-center bg-surface-container-lowest rounded-xl border-2 border-dashed border-outline-variant/30">
            <User className="w-16 h-16 text-primary/10 mx-auto mb-4" />
            <p className="text-muted-foreground">No verified therapists are available for booking at this time.</p>
          </div>
        ) : (
          therapistList.map((therapist) => (
            <div key={therapist.id} className="bg-surface-container-low/50 backdrop-blur-md border border-outline-variant/30 rounded-xl overflow-hidden hover:shadow-2xl hover:-translate-y-1 hover:border-primary/20 transition-all duration-500 group flex flex-col relative">
              <div className="p-4 md:p-8 flex-1">
                <div className="flex items-start justify-between mb-6">
                  <div className="w-20 h-20 rounded-[2rem] bg-surface-container-lowest border border-outline-variant/50 flex items-center justify-center text-primary font-bold overflow-hidden p-0.5 shadow-inner">
                    <Image 
                      src={therapist.profileImageUrl || `https://ui-avatars.com/api/?name=${therapist.firstName}+${therapist.lastName}&background=f8f9fa&color=5f43b2&size=200`}
                      alt={therapist.firstName}
                      width={80}
                      height={80}
                      className="w-full h-full object-cover rounded-[1.8rem]"
                    />
                  </div>
                  <div className="flex items-center gap-1 bg-primary/10 px-3 py-1.5 rounded-full text-primary text-xs font-bold uppercase tracking-widest">
                    <Star className="w-3 h-3 fill-primary" />
                    Verified
                  </div>
                </div>

                <h3 className="text-2xl font-heading font-medium text-foreground mb-2 group-hover:text-primary transition-colors">
                  Dr. {therapist.firstName} {therapist.lastName}
                </h3>
                <p className="text-sm text-muted-foreground mb-6 line-clamp-2">
                   {therapist.bio || "Specialized in providing clinical support and personalized growth strategies."}
                </p>

                <div className="flex flex-wrap gap-2 mb-6">
                  {therapist.specialities?.slice(0, 3).map((spec: string) => (
                    <span key={spec} className="px-3 py-1 bg-surface-container-lowest border border-outline-variant/50 rounded-full text-xs font-medium text-primary/80">
                      {spec}
                    </span>
                  ))}
                  {therapist.specialities && therapist.specialities.length > 3 && (
                    <span className="text-xs font-bold text-muted-foreground/60 ml-1">+{therapist.specialities.length - 3} more</span>
                  )}
                </div>

                <div className="flex flex-col gap-2 pt-4 border-t border-outline-variant/10">
                   <div className="flex items-center gap-2 text-xs text-muted-foreground/70">
                      <Clock className="w-3 h-3" />
                      <span className="font-bold uppercase tracking-widest">{therapist.yearsOfExperience || 5}+ Years Experience</span>
                   </div>
                   <div className="flex items-center gap-2 text-xs text-muted-foreground/70">
                      <GraduationCap className="w-3 h-3" />
                      <span className="font-medium">{therapist.qualifications || "Verified Specialist"}</span>
                   </div>
                </div>
              </div>

              <div className="p-4 md:p-8 pt-0 border-t border-outline-variant/10 bg-surface-container-lowest/50">
                <div className="flex items-center justify-between mb-6">
                   <div>
                     <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground/60">Standard Rate</p>
                     <p className="text-lg font-heading font-medium text-foreground text-primary/80">₹{therapist.hourlyRate || "1,500"}/hr</p>
                   </div>
                   <div className="flex items-center gap-2 text-primary/60">
                      <span className="text-xs font-bold uppercase tracking-widest">Confidential</span>
                   </div>
                </div>
                <Link href={`/dashboard/sessions/book/${therapist.id}`} className="after:absolute after:inset-0 after:z-[1]">
                  <button className="w-full bg-primary text-primary-foreground py-4 rounded-2xl font-bold uppercase tracking-widest text-xs shadow-lg shadow-primary/20 group-hover:shadow-2xl group-hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 group/btn">
                    Check Availability
                    <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                  </button>
                </Link>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
