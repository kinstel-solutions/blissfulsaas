"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { api } from "@/lib/api";
import { therapistProfileSchema, type TherapistProfileValues } from "@/lib/validations";
import { Loader2, Save, UserCircle2, GraduationCap, Globe, Clock, Tag, MapPin, Shield, Video, AlertCircle } from "lucide-react";
import { ImageUpload } from "@/components/ImageUpload";

const COMMON_SPECIALITIES = [
  "Anxiety", "Depression", "Trauma", "ADHD", "Couples Therapy", 
  "LGBTQ+", "Bipolar Disorder", "Eating Disorders", "Grief", 
  "Self-Esteem", "Workplace Stress", "Mindfulness", "Family Therapy",
  "Addiction", "Sleep Disorders", "OCD"
];

const COMMON_LANGUAGES = [
  "English", "Hindi", "Bengali", "Spanish", "French", "German", 
  "Arabic", "Mandarin", "Urdu", "Tamil", "Telegu", "Marathi"
];

export default function ProfilePage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<TherapistProfileValues>({
    resolver: zodResolver(therapistProfileSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      bio: "",
      qualifications: "",
      yearsOfExperience: 0,
      hourlyRate: 150,
      specialities: [],
      languages: [],
      videoUrl: "",
      clinicAddress: "",
      profileImageUrl: "",
      phone: "",
    },
  });

  const formData = watch();
  const [specialityInput, setSpecialityInput] = useState("");
  const [languageInput, setLanguageInput] = useState("");
  const [isVerified, setIsVerified] = useState(false);

  useEffect(() => {
    async function loadProfile() {
      try {
        const data = await api.therapists.getProfile();
        reset({
          firstName: data.firstName || "",
          lastName: data.lastName || "",
          bio: data.bio || "",
          qualifications: data.qualifications || "",
          yearsOfExperience: data.yearsOfExperience || 0,
          hourlyRate: data.hourlyRate || 150,
          specialities: data.specialities || [],
          languages: data.languages || [],
          videoUrl: data.videoUrl || "",
          clinicAddress: data.clinicAddress || "",
          profileImageUrl: data.profileImageUrl || "",
          phone: data.phone || "",
        });
        setIsVerified(data.isVerified);
      } catch (err: any) {
        setError(err.message || "Failed to load profile");
      } finally {
        setLoading(false);
      }
    }
    loadProfile();
  }, [reset]);

  const handleAddItem = (e: React.KeyboardEvent<HTMLInputElement>, field: 'specialities' | 'languages', input: string, setInput: (v: string) => void) => {
    if (e.key === "Enter" && input.trim()) {
      e.preventDefault();
      const currentItems = watch(field);
      if (!currentItems.includes(input.trim())) {
        setValue(field, [...currentItems, input.trim()], { shouldDirty: true });
      }
      setInput("");
    }
  };

  const handleRemoveItem = (tag: string, field: 'specialities' | 'languages') => {
    const currentItems = watch(field);
    setValue(field, currentItems.filter(t => t !== tag), { shouldDirty: true });
  };

  const onSubmit = async (data: TherapistProfileValues) => {
    setSaving(true);
    setError(null);
    setSuccessMessage(null);

    try {
      await api.therapists.updateProfile(data);
      setSuccessMessage(isVerified 
        ? "Profile updated successfully. Changes are now live on the marketplace."
        : "Profile updated successfully. Changes will be visible once your application is approved."
      );
    } catch (err: any) {
      setError(err.message || "Failed to save profile");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-32 max-w-4xl mx-auto px-4 md:px-0">
      <div className="flex items-center gap-6 border-b border-outline-variant/20 pb-8">
        <div className="w-20 h-20 bg-primary/5 flex items-center justify-center rounded-xl text-primary overflow-hidden border border-primary/10 shadow-inner">
          {formData.profileImageUrl ? (
            <img src={formData.profileImageUrl} alt="Profile" className="w-full h-full object-cover" />
          ) : (
            <UserCircle2 className="w-8 h-8" />
          )}
        </div>
        <div>
          <h1 className="text-xl md:text-2xl font-heading font-medium text-foreground tracking-tight">Clinical Profile</h1>
          <p className="text-[11px] md:text-xs font-medium text-muted-foreground/70 mt-0.5 max-w-xl leading-relaxed">Refine your public presence and manage clinical credentials.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-12">
        {error && (
          <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-600 rounded-2xl text-sm font-medium">
            {error}
          </div>
        )}
        {successMessage && (
          <div className="p-4 bg-green-500/10 border border-green-500/20 text-green-600 rounded-2xl text-sm font-medium">
            {successMessage}
          </div>
        )}
        
        {/* Verification Alert */}
        {!isVerified && (
          <div className="p-5 md:p-6 bg-amber-500/5 border border-amber-500/10 rounded-[2.5rem] flex items-center gap-5 md:gap-6 relative overflow-hidden group">
             <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/[0.03] rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
             <div className="w-12 h-12 bg-amber-500/10 rounded-2xl flex items-center justify-center text-amber-600 shrink-0 shadow-inner border border-amber-500/5">
               <Shield className="w-6 h-6" />
             </div>
             <div className="space-y-1">
               <p className="text-sm font-bold text-amber-900/80">Pending Clinical Verification</p>
               <p className="text-[11px] md:text-xs font-medium text-amber-800/60 leading-relaxed">
                 Your credentials are currently being reviewed by our clinical board. Complete your profile now to expedite the process.
               </p>
             </div>
          </div>
        )}

        <div className="space-y-10">
          <div className="flex flex-col md:flex-row gap-12 items-center">
            <div className="w-full md:w-2/5">
              <ImageUpload
                label="Profile Photo"
                value={formData.profileImageUrl}
                onChange={(url) => setValue("profileImageUrl", url, { shouldDirty: true })}
                description="Professional headshot."
              />
            </div>

            <div className="flex-1 space-y-6 w-full">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground/60">First Name</label>
                <input
                  type="text"
                  {...register("firstName")}
                  className={`w-full bg-surface-container-lowest border rounded-xl px-4 py-3 text-sm focus:outline-none transition-colors ${
                    errors.firstName ? 'border-red-500 focus:border-red-500' : 'border-outline-variant/30 focus:border-primary/50'
                  }`}
                />
                {errors.firstName && <p className="text-[10px] text-red-500 font-bold uppercase tracking-wider mt-1 ml-1">{errors.firstName.message}</p>}
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground/60">Last Name</label>
                <input
                  type="text"
                  {...register("lastName")}
                  className={`w-full bg-surface-container-lowest border rounded-xl px-4 py-3 text-sm focus:outline-none transition-colors ${
                    errors.lastName ? 'border-red-500 focus:border-red-500' : 'border-outline-variant/30 focus:border-primary/50'
                  }`}
                />
                {errors.lastName && <p className="text-[10px] text-red-500 font-bold uppercase tracking-wider mt-1 ml-1">{errors.lastName.message}</p>}
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground/60">Phone Number</label>
                <input
                  type="tel"
                  {...register("phone")}
                  placeholder="e.g. +1 (555) 000-0000"
                  className={`w-full bg-surface-container-lowest border rounded-xl px-4 py-3 text-sm focus:outline-none transition-colors ${
                    errors.phone ? 'border-red-500 focus:border-red-500' : 'border-outline-variant/30 focus:border-primary/50'
                  }`}
                />
                {errors.phone && <p className="text-[10px] text-red-500 font-bold uppercase tracking-wider mt-1 ml-1">{errors.phone.message}</p>}
              </div>

              </div>
            </div>

          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground/60">Editorial Bio</label>
            <textarea
              {...register("bio")}
              rows={5}
              className={`w-full bg-surface-container-lowest border rounded-xl px-4 py-3 text-sm focus:outline-none transition-colors resize-none leading-relaxed ${
                errors.bio ? 'border-red-500 focus:border-red-500' : 'border-outline-variant/30 focus:border-primary/50'
              }`}
              placeholder="Describe your unique therapeutic approach..."
            />
            {errors.bio && <p className="text-[10px] text-red-500 font-bold uppercase tracking-wider mt-1 ml-1">{errors.bio.message}</p>}
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground/60">Qualifications</label>
            <div className="relative">
              <GraduationCap className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/40" />
              <input
                type="text"
                {...register("qualifications")}
                placeholder="e.g. M.Phil in Clinical Psychology, Yale University"
                className={`w-full bg-surface-container-lowest border rounded-xl pl-12 pr-4 py-3 text-sm focus:outline-none transition-colors ${
                  errors.qualifications ? 'border-red-500 focus:border-red-500' : 'border-outline-variant/30 focus:border-primary/50'
                }`}
              />
              {errors.qualifications && <p className="text-[10px] text-red-500 font-bold uppercase tracking-wider mt-1 ml-1">{errors.qualifications.message}</p>}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground/60">Introduction Video URL</label>
            <div className="relative">
              <Video className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/40" />
              <input
                type="url"
                {...register("videoUrl")}
                placeholder="e.g. https://www.youtube.com/watch?v=..."
                className={`w-full bg-surface-container-lowest border rounded-xl pl-12 pr-4 py-3 text-sm focus:outline-none transition-colors ${
                  errors.videoUrl ? 'border-red-500 focus:border-red-500' : 'border-outline-variant/30 focus:border-primary/50'
                }`}
              />
              {errors.videoUrl && <p className="text-[10px] text-red-500 font-bold uppercase tracking-wider mt-1 ml-1">{errors.videoUrl.message}</p>}
            </div>
            <p className="text-[10px] text-muted-foreground/50 font-medium">
              Share a brief video introduction (YouTube, Vimeo, or Loom link).
            </p>
          </div>

          {/* Clinic Address */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground/60">Clinic Address (for in-clinic visits)</label>
            <div className="relative">
              <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/40" />
              <input
                type="text"
                {...register("clinicAddress")}
                placeholder="e.g. 24 MG Road, Bengaluru, Karnataka 560001"
                className={`w-full bg-surface-container-lowest border rounded-xl pl-12 pr-4 py-3 text-sm focus:outline-none transition-colors ${
                  errors.clinicAddress ? 'border-red-500 focus:border-red-500' : 'border-outline-variant/30 focus:border-emerald-500/50'
                }`}
              />
              {errors.clinicAddress && <p className="text-[10px] text-red-500 font-bold uppercase tracking-wider mt-1 ml-1">{errors.clinicAddress.message}</p>}
            </div>
            <p className="text-[10px] text-muted-foreground/50 font-medium">
              Only shown to patients who book an in-clinic appointment with you.
            </p>
          </div>

          {/* Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground/60">Hourly Rate (USD)</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground font-medium">$</span>
                <input
                  type="number"
                  {...register("hourlyRate", { valueAsNumber: true })}
                  className={`w-full bg-surface-container-lowest border rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none transition-colors ${
                    errors.hourlyRate ? 'border-red-500 focus:border-red-500' : 'border-outline-variant/30 focus:border-primary/50'
                  }`}
                  min="0"
                />
                {errors.hourlyRate && <p className="text-[10px] text-red-500 font-bold uppercase tracking-wider mt-1 ml-1">{errors.hourlyRate.message}</p>}
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground/60">Years of Experience</label>
              <div className="relative">
                <Clock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/40" />
                <input
                  type="number"
                  {...register("yearsOfExperience", { valueAsNumber: true })}
                  className={`w-full bg-surface-container-lowest border rounded-xl pl-12 pr-4 py-3 text-sm focus:outline-none transition-colors ${
                    errors.yearsOfExperience ? 'border-red-500 focus:border-red-500' : 'border-outline-variant/30 focus:border-primary/50'
                  }`}
                  min="0"
                />
                {errors.yearsOfExperience && <p className="text-[10px] text-red-500 font-bold uppercase tracking-wider mt-1 ml-1">{errors.yearsOfExperience.message}</p>}
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground/60">Languages</label>
              <div className="relative">
                <Globe className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/40" />
                <div className="w-full bg-surface-container-lowest border border-outline-variant/30 rounded-xl pl-12 pr-4 py-3 min-h-[48px] flex flex-wrap gap-2 items-center">
                  {formData.languages.map(lang => (
                    <span key={lang} className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded text-[10px] font-bold uppercase flex items-center gap-1">
                      {lang}
                      <button type="button" onClick={() => handleRemoveItem(lang, 'languages')} className="hover:text-red-500">&times;</button>
                    </span>
                  ))}
                  <input
                    type="text"
                    value={languageInput}
                    onChange={(e) => setLanguageInput(e.target.value)}
                    onKeyDown={(e) => handleAddItem(e, 'languages', languageInput, setLanguageInput)}
                    placeholder="Add language..."
                    className="flex-1 min-w-[80px] bg-transparent outline-none text-sm"
                  />
                </div>
              </div>
              {/* Language Selection */}
              <div className="flex flex-wrap gap-2 pt-2">
                {COMMON_LANGUAGES.map(lang => {
                  const isSelected = formData.languages.includes(lang);
                  return (
                    <button
                      key={lang}
                      type="button"
                      onClick={() => {
                        if (isSelected) {
                          handleRemoveItem(lang, 'languages');
                        } else {
                          setValue("languages", [...formData.languages, lang], { shouldDirty: true });
                        }
                      }}
                      className={`px-3 py-1.5 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all duration-300 border ${
                        isSelected 
                          ? 'bg-primary text-primary-foreground border-primary' 
                          : 'bg-surface-container-low text-primary/40 border-outline-variant/30 hover:border-primary/40 hover:text-primary'
                      }`}
                    >
                      {lang}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Tags */}
          <div className="space-y-3">
            <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground/60">Focus Specialities</label>
            <div className="p-5 bg-surface-container-lowest border border-outline-variant/30 rounded-[2rem] min-h-[120px] flex gap-3 flex-wrap items-start focus-within:border-primary/50 transition-colors shadow-inner">
              <Tag className="w-4 h-4 text-primary/40 mt-1" />
              {formData.specialities.map(tag => (
                <span key={tag} className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-xl text-xs font-bold tracking-tight shadow-sm hover:scale-105 transition-transform">
                  {tag}
                  <button type="button" onClick={() => handleRemoveItem(tag, 'specialities')} className="hover:bg-white/20 rounded-full w-4 h-4 flex items-center justify-center -mr-1">
                    &times;
                  </button>
                </span>
              ))}
              <input
                type="text"
                value={specialityInput}
                onChange={(e) => setSpecialityInput(e.target.value)}
                onKeyDown={(e) => handleAddItem(e, 'specialities', specialityInput, setSpecialityInput)}
                placeholder="Type speciality and press Enter..."
                className="flex-1 min-w-[200px] bg-transparent outline-none text-sm placeholder:text-muted-foreground/50 py-2"
              />
            </div>
            <div className="space-y-4">
              <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground/60">Common Specialities</label>
              <div className="flex flex-wrap gap-2">
                {COMMON_SPECIALITIES.map(spec => {
                  const isSelected = formData.specialities.includes(spec);
                  return (
                    <button
                      key={spec}
                      type="button"
                      onClick={() => {
                        if (isSelected) {
                          handleRemoveItem(spec, 'specialities');
                        } else {
                          setValue("specialities", [...formData.specialities, spec], { shouldDirty: true });
                        }
                      }}
                      className={`px-4 py-2 rounded-xl text-xs font-bold tracking-tight transition-all duration-300 border ${
                        isSelected 
                          ? 'bg-primary text-primary-foreground border-primary shadow-lg scale-105' 
                          : 'bg-surface-container-lowest text-primary/60 border-outline-variant/30 hover:border-primary/40 hover:text-primary'
                      }`}
                    >
                      {spec}
                    </button>
                  );
                })}
              </div>
              <p className="text-[10px] text-muted-foreground/40 font-bold uppercase tracking-widest">Or type your own above</p>
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-10 border-t border-outline-variant/20">
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 bg-slate-900 text-white px-5 md:px-10 py-5 rounded-[2rem] text-xs font-bold uppercase tracking-widest disabled:opacity-50 hover:bg-primary transition-all shadow-xl hover:-translate-y-1"
          >
            {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
            {isVerified ? "Publish Updates" : "Submit for Approval"}
          </button>
        </div>
      </form>
    </div>
  );
}
