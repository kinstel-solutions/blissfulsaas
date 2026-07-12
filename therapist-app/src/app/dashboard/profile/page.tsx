"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { api } from "@/lib/api";
import { therapistProfileSchema, type TherapistProfileValues } from "@/lib/validations";
import { Loader2, Save, UserCircle2, GraduationCap, Globe, Clock, Tag, MapPin, Shield, Video, AlertCircle, ChevronDown, FileCheck, Landmark, CreditCard, Fingerprint } from "lucide-react";
import { ImageUpload } from "@/components/ImageUpload";
import { AlexButton } from "@/components/ui/AlexButton";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

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
  const router = useRouter();
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
    resolver: zodResolver(therapistProfileSchema) as any,
    defaultValues: {
      firstName: "",
      lastName: "",
      gender: "",
      bio: "",
      qualifications: "",
      yearsOfExperience: 0,
      hourlyRate: 1500,
      specialities: [],
      languages: [],
      videoUrl: "",
      clinicAddress: "",
      mapLink: "",
      profileImageUrl: "",
      phone: "",
      rciNumber: "",
      licenceCertificateUrl: "",
      bankName: "",
      bankAccountNumber: "",
      bankIfscCode: "",
      bankAccountHolderName: "",
      panNumber: "",
      aadhaarNumber: "",
    },
  });

  const formData = watch();
  const [specialityInput, setSpecialityInput] = useState("");
  const [languageInput, setLanguageInput] = useState("");
  const [isVerified, setIsVerified] = useState(false);
  const [hasPendingEdits, setHasPendingEdits] = useState(false);
  const [genderOpen, setGenderOpen] = useState(false);

  useEffect(() => {
    async function loadProfile() {
      try {
        const data = await api.therapists.getProfile();
        const profileData = { ...data, ...(data.pendingFields || {}) };

        reset({
          firstName: profileData.firstName || "",
          lastName: data.lastName || "",
          gender: data.gender || "",
          bio: data.bio || "",
          qualifications: data.qualifications || "",
          yearsOfExperience: data.yearsOfExperience || 0,
          hourlyRate: data.hourlyRate || 1500,
          specialities: data.specialities || [],
          languages: data.languages || [],
          videoUrl: data.videoUrl || "",
          clinicAddress: data.clinicAddress || "",
          mapLink: profileData.mapLink || "",
          profileImageUrl: profileData.profileImageUrl || "",
          phone: profileData.phone || "",
          rciNumber: profileData.rciNumber || "",
          licenceCertificateUrl: profileData.licenceCertificateUrl || "",
          bankName: profileData.bankName || "",
          bankAccountNumber: profileData.bankAccountNumber || "",
          bankIfscCode: profileData.bankIfscCode || "",
          bankAccountHolderName: profileData.bankAccountHolderName || "",
          panNumber: profileData.panNumber || "",
          aadhaarNumber: profileData.aadhaarNumber || "",
        });
        setIsVerified(data.isVerified);
        setHasPendingEdits(!!data.pendingFields);
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
        ? "Profile updates submitted successfully and are pending review by the admin board."
        : "Profile updated successfully. Changes will be visible once your application is approved."
      );
      if (isVerified) {
        setHasPendingEdits(true);
      } else {
        // Redirect new therapists to dashboard after a short delay
        setTimeout(() => {
          router.push("/dashboard");
        }, 1500);
      }
    } catch (err: any) {
      setError(err.message || "Failed to save profile");
    } finally {
      setSaving(false);
      const scrollContainer = document.getElementById('main-content-area');
      if (scrollContainer) {
        scrollContainer.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
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

        {isVerified && hasPendingEdits && (
          <div className="p-5 md:p-6 bg-amber-500/5 border border-amber-500/10 rounded-[2.5rem] flex items-center gap-5 md:gap-6 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/[0.03] rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
            <div className="w-12 h-12 bg-amber-500/10 rounded-2xl flex items-center justify-center text-amber-600 shrink-0 shadow-inner border border-amber-500/5">
              <Clock className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-bold text-amber-900/80">Pending Profile Edits</p>
              <p className="text-[11px] md:text-xs font-medium text-amber-800/60 leading-relaxed">
                You have submitted changes that are awaiting review by our clinical board. Your previously verified profile remains live until these are approved.
              </p>
            </div>
          </div>
        )}

        <div className="space-y-10">
          <div className="flex flex-col md:flex-row gap-12 items-center">
            <div className="w-full md:w-2/5">
              <ImageUpload
                label="Profile Photo (Optional)"
                value={formData.profileImageUrl}
                onChange={(url) => setValue("profileImageUrl", url, { shouldDirty: true })}
                description="Professional headshot."
              />
            </div>

            <div className="flex-1 space-y-6 w-full">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground/60">First Name</label>
                <Input
                  type="text"
                  {...register("firstName")}
                  className={`w-full bg-surface-container-lowest border rounded-xl px-4 py-3 text-sm focus:outline-none transition-colors focus-visible:ring-0 focus-visible:ring-offset-0 ${errors.firstName ? 'border-red-500 focus:border-red-500' : 'border-outline-variant/30 focus:border-primary/50'
                    }`}
                />
                {errors.firstName && <p className="text-[10px] text-red-500 font-bold uppercase tracking-wider mt-1 ml-1">{errors.firstName.message}</p>}
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground/60">Last Name</label>
                <Input
                  type="text"
                  {...register("lastName")}
                  className={`w-full bg-surface-container-lowest border rounded-xl px-4 py-3 text-sm focus:outline-none transition-colors focus-visible:ring-0 focus-visible:ring-offset-0 ${errors.lastName ? 'border-red-500 focus:border-red-500' : 'border-outline-variant/30 focus:border-primary/50'
                    }`}
                />
                {errors.lastName && <p className="text-[10px] text-red-500 font-bold uppercase tracking-wider mt-1 ml-1">{errors.lastName.message}</p>}
              </div>

              <div className="space-y-2 relative">
                <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground/60">Gender</label>
                <div
                  className={`w-full bg-surface-container-lowest border rounded-xl px-4 py-3 text-sm transition-all duration-300 cursor-pointer flex justify-between items-center group hover:border-primary/40 focus-within:ring-4 focus-within:ring-primary/10 ${errors.gender ? 'border-red-500' : 'border-outline-variant/30'
                    }`}
                  onClick={() => setGenderOpen(!genderOpen)}
                >
                  <span className={formData.gender ? "text-foreground font-medium" : "text-muted-foreground"}>
                    {formData.gender || "Select Gender"}
                  </span>
                  <div className={`w-8 h-8 rounded-lg bg-surface-container-low flex items-center justify-center text-muted-foreground/50 transition-all duration-300 border border-outline-variant/10 ${genderOpen ? 'rotate-180 text-primary border-primary/20 bg-primary/5' : 'group-hover:text-primary'
                    }`}>
                    <ChevronDown className="w-4 h-4" />
                  </div>
                </div>

                {genderOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setGenderOpen(false)} />
                    <div className="absolute top-full left-0 w-full z-50 mt-2 bg-surface-container-lowest border border-outline-variant/20 rounded-2xl shadow-xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                      {["Male", "Female", "Non-binary", "Other", "Prefer not to say"].map(option => (
                        <div
                          key={option}
                          className={`px-5 py-3.5 text-sm cursor-pointer transition-all duration-200 hover:bg-primary/5 hover:text-primary border-b border-outline-variant/5 last:border-0 ${formData.gender === option ? 'bg-primary/10 font-bold text-primary' : 'text-foreground/80 font-medium'
                            }`}
                          onClick={() => {
                            setValue("gender", option, { shouldDirty: true, shouldValidate: true });
                            setGenderOpen(false);
                          }}
                        >
                          {option}
                        </div>
                      ))}
                    </div>
                  </>
                )}
                {/* Hidden input to keep react-hook-form integration intact */}
                <input type="hidden" {...register("gender")} />
                {errors.gender && <p className="text-[10px] text-red-500 font-bold uppercase tracking-wider mt-1 ml-1">{errors.gender.message}</p>}
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground/60">Phone Number</label>
                <Input
                  type="tel"
                  {...register("phone")}
                  placeholder="e.g. +1 (555) 000-0000"
                  className={`w-full bg-surface-container-lowest border rounded-xl px-4 py-3 text-sm focus:outline-none transition-colors focus-visible:ring-0 focus-visible:ring-offset-0 ${errors.phone ? 'border-red-500 focus:border-red-500' : 'border-outline-variant/30 focus:border-primary/50'
                    }`}
                />
                {errors.phone && <p className="text-[10px] text-red-500 font-bold uppercase tracking-wider mt-1 ml-1">{errors.phone.message}</p>}
              </div>

            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground/60">Editorial Bio (Optional)</label>
            <Textarea
              {...register("bio")}
              rows={5}
              className={`w-full bg-surface-container-lowest border rounded-xl px-4 py-3 text-sm focus:outline-none transition-colors resize-none leading-relaxed focus-visible:ring-0 focus-visible:ring-offset-0 ${errors.bio ? 'border-red-500 focus:border-red-500' : 'border-outline-variant/30 focus:border-primary/50'
                }`}
              placeholder="Describe your unique therapeutic approach..."
            />
            {errors.bio && <p className="text-[10px] text-red-500 font-bold uppercase tracking-wider mt-1 ml-1">{errors.bio.message}</p>}
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground/60">Qualifications</label>
            <div className="relative">
              <GraduationCap className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/40 z-10" />
              <Input
                type="text"
                {...register("qualifications")}
                placeholder="e.g. M.Phil in Clinical Psychology, Yale University"
                className={`w-full bg-surface-container-lowest border rounded-xl pl-12 pr-4 py-3 text-sm focus:outline-none transition-colors focus-visible:ring-0 focus-visible:ring-offset-0 ${errors.qualifications ? 'border-red-500 focus:border-red-500' : 'border-outline-variant/30 focus:border-primary/50'
                  }`}
              />
              {errors.qualifications && <p className="text-[10px] text-red-500 font-bold uppercase tracking-wider mt-1 ml-1">{errors.qualifications.message}</p>}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground/60">Introduction Video URL (Optional)</label>
            <div className="relative">
              <Video className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/40 z-10" />
              <Input
                type="url"
                {...register("videoUrl")}
                placeholder="e.g. https://www.youtube.com/watch?v=..."
                className={`w-full bg-surface-container-lowest border rounded-xl pl-12 pr-4 py-3 text-sm focus:outline-none transition-colors focus-visible:ring-0 focus-visible:ring-offset-0 ${errors.videoUrl ? 'border-red-500 focus:border-red-500' : 'border-outline-variant/30 focus:border-primary/50'
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
              <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/40 z-10" />
              <Input
                type="text"
                {...register("clinicAddress")}
                placeholder="e.g. 24 MG Road, Bengaluru, Karnataka 560001"
                className={`w-full bg-surface-container-lowest border rounded-xl pl-12 pr-4 py-3 text-sm focus:outline-none transition-colors focus-visible:ring-0 focus-visible:ring-offset-0 ${errors.clinicAddress ? 'border-red-500 focus:border-red-500' : 'border-outline-variant/30 focus:border-emerald-500/50'
                  }`}
              />
              {errors.clinicAddress && <p className="text-[10px] text-red-500 font-bold uppercase tracking-wider mt-1 ml-1">{errors.clinicAddress.message}</p>}
            </div>
            <p className="text-[10px] text-muted-foreground/50 font-medium">
              Only shown to patients who book an in-clinic appointment with you.
            </p>
          </div>

          {/* Map Link */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground/60">Google Maps Link</label>
            <div className="relative">
              <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/40 z-10" />
              <Input
                type="url"
                {...register("mapLink")}
                placeholder="e.g. https://maps.google.com/?q=..."
                className={`w-full bg-surface-container-lowest border rounded-xl pl-12 pr-4 py-3 text-sm focus:outline-none transition-colors focus-visible:ring-0 focus-visible:ring-offset-0 ${errors.mapLink ? 'border-red-500 focus:border-red-500' : 'border-outline-variant/30 focus:border-emerald-500/50'
                  }`}
              />
              {errors.mapLink && <p className="text-[10px] text-red-500 font-bold uppercase tracking-wider mt-1 ml-1">{errors.mapLink.message}</p>}
            </div>
            <p className="text-[10px] text-muted-foreground/50 font-medium">
              Optional link to your clinic location on Google Maps.
            </p>
          </div>

          {/* Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground/60">Hourly Rate (INR)</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground font-medium z-10">₹</span>
                <Input
                  type="number"
                  {...register("hourlyRate", { valueAsNumber: true })}
                  className={`w-full bg-surface-container-lowest border rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none transition-colors focus-visible:ring-0 focus-visible:ring-offset-0 ${errors.hourlyRate ? 'border-red-500 focus:border-red-500' : 'border-outline-variant/30 focus:border-primary/50'
                    }`}
                  min="0"
                />
                {errors.hourlyRate && <p className="text-[10px] text-red-500 font-bold uppercase tracking-wider mt-1 ml-1">{errors.hourlyRate.message}</p>}
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground/60">Years of Experience</label>
              <div className="relative">
                <Clock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/40 z-10" />
                <Input
                  type="number"
                  {...register("yearsOfExperience", { valueAsNumber: true })}
                  className={`w-full bg-surface-container-lowest border rounded-xl pl-12 pr-4 py-3 text-sm focus:outline-none transition-colors focus-visible:ring-0 focus-visible:ring-offset-0 ${errors.yearsOfExperience ? 'border-red-500 focus:border-red-500' : 'border-outline-variant/30 focus:border-primary/50'
                    }`}
                  min="0"
                />
                {errors.yearsOfExperience && <p className="text-[10px] text-red-500 font-bold uppercase tracking-wider mt-1 ml-1">{errors.yearsOfExperience.message}</p>}
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground/60">Languages</label>
              <div className="relative">
                <Globe className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/40 z-10" />
                <div className="w-full bg-surface-container-lowest border border-outline-variant/30 rounded-xl pl-12 pr-4 py-3 min-h-[48px] flex flex-wrap gap-2 items-center">
                  {formData.languages.map(lang => (
                    <span key={lang} className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded text-[10px] font-bold uppercase flex items-center gap-1">
                      {lang}
                      <Button type="button" variant="ghost" onClick={() => handleRemoveItem(lang, 'languages')} className="hover:text-red-500 p-0 h-auto w-auto hover:bg-transparent">&times;</Button>
                    </span>
                  ))}
                  <Input
                    type="text"
                    value={languageInput}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setLanguageInput(e.target.value)}
                    onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => handleAddItem(e, 'languages', languageInput, setLanguageInput)}
                    placeholder="Add language..."
                    className="flex-1 min-w-[80px] bg-transparent outline-none text-sm border-0 focus-visible:ring-0 focus-visible:ring-offset-0 p-0 h-auto shadow-none"
                  />
                </div>
              </div>
              {/* Language Selection */}
              <div className="flex flex-wrap gap-2 pt-2">
                {COMMON_LANGUAGES.map(lang => {
                  const isSelected = formData.languages.includes(lang);
                  return (
                    <Button
                      key={lang}
                      type="button"
                      variant="ghost"
                      onClick={() => {
                        if (isSelected) {
                          handleRemoveItem(lang, 'languages');
                        } else {
                          setValue("languages", [...formData.languages, lang], { shouldDirty: true });
                        }
                      }}
                      className={`px-3 py-1.5 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all duration-300 border h-auto w-auto hover:bg-transparent ${isSelected
                          ? 'bg-primary text-primary-foreground border-primary'
                          : 'bg-surface-container-low text-primary/40 border-outline-variant/30 hover:border-primary/40 hover:text-primary'
                        }`}
                    >
                      {lang}
                    </Button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Tags */}
          <div className="space-y-3">
            <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground/60">Focus Specialities</label>
            <Card className="p-5 min-h-[120px] flex gap-3 flex-wrap items-start focus-within:border-primary/50 transition-colors">
              <Tag className="w-4 h-4 text-primary/40 mt-1" />
              {formData.specialities.map(tag => (
                <span key={tag} className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-xl text-xs font-bold tracking-tight shadow-sm hover:scale-105 transition-transform">
                  {tag}
                  <Button type="button" variant="ghost" onClick={() => handleRemoveItem(tag, 'specialities')} className="hover:bg-white/20 rounded-full w-4 h-4 flex items-center justify-center -mr-1 p-0 hover:bg-transparent text-current">
                    &times;
                  </Button>
                </span>
              ))}
              <Input
                type="text"
                value={specialityInput}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSpecialityInput(e.target.value)}
                onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => handleAddItem(e, 'specialities', specialityInput, setSpecialityInput)}
                placeholder="Type speciality and press Enter..."
                className="flex-1 min-w-[200px] bg-transparent outline-none text-sm placeholder:text-muted-foreground/50 py-2 border-0 focus-visible:ring-0 focus-visible:ring-offset-0 p-0 h-auto shadow-none"
              />
            </Card>
            <div className="space-y-4">
              <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground/60">Common Specialities</label>
              <div className="flex flex-wrap gap-2">
                {COMMON_SPECIALITIES.map(spec => {
                  const isSelected = formData.specialities.includes(spec);
                  return (
                    <Button
                      key={spec}
                      type="button"
                      variant="ghost"
                      onClick={() => {
                        if (isSelected) {
                          handleRemoveItem(spec, 'specialities');
                        } else {
                          setValue("specialities", [...formData.specialities, spec], { shouldDirty: true });
                        }
                      }}
                      className={`px-4 py-2 rounded-xl text-xs font-bold tracking-tight transition-all duration-300 border h-auto w-auto hover:bg-transparent ${isSelected
                          ? 'bg-primary text-primary-foreground border-primary shadow-lg scale-105'
                          : 'bg-surface-container-lowest text-primary/60 border-outline-variant/30 hover:border-primary/40 hover:text-primary'
                        }`}
                    >
                      {spec}
                    </Button>
                  );
                })}
              </div>
              <p className="text-[10px] text-muted-foreground/40 font-bold uppercase tracking-widest">Or type your own above</p>
            </div>
          </div>
        </div>

        {/* ─── Registration & Credentials ─── */}
        <div className="space-y-8 pt-4">
          <div className="flex items-center gap-4 border-b border-outline-variant/20 pb-5">
            <div className="w-10 h-10 bg-indigo-500/10 rounded-xl flex items-center justify-center text-indigo-500 shadow-inner border border-indigo-500/10">
              <FileCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-heading font-medium text-foreground">Registration & Credentials</h2>
              <p className="text-[10px] text-muted-foreground/50 font-medium mt-0.5">Regulatory licence information required for clinical verification.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground/60">RCI / MCI Registration Number</label>
              <div className="relative">
                <FileCheck className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/40 z-10" />
                <Input
                  type="text"
                  {...register("rciNumber")}
                  placeholder="e.g. A12345"
                  className={`w-full bg-surface-container-lowest border rounded-xl pl-12 pr-4 py-3 text-sm focus:outline-none transition-colors focus-visible:ring-0 focus-visible:ring-offset-0 ${errors.rciNumber ? 'border-red-500 focus:border-red-500' : 'border-outline-variant/30 focus:border-primary/50'
                    }`}
                />
                {errors.rciNumber && <p className="text-[10px] text-red-500 font-bold uppercase tracking-wider mt-1 ml-1">{errors.rciNumber.message}</p>}
              </div>
              <p className="text-[10px] text-muted-foreground/50 font-medium">
                Your Rehabilitation Council of India or Medical Council of India registration number.
              </p>
            </div>

            <div className="space-y-2">
              <ImageUpload
                label="Licence / Certificate Upload"
                value={formData.licenceCertificateUrl}
                onChange={(url) => setValue("licenceCertificateUrl", url, { shouldDirty: true })}
                description="Upload a scanned copy of your clinical licence or degree certificate (PNG, JPG)."
              />
            </div>
          </div>
        </div>

        {/* ─── Bank / Payout & Identity Details ─── */}
        <div className="space-y-8 pt-4">
          <div className="flex items-center gap-4 border-b border-outline-variant/20 pb-5">
            <div className="w-10 h-10 bg-emerald-500/10 rounded-xl flex items-center justify-center text-emerald-500 shadow-inner border border-emerald-500/10">
              <Landmark className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-heading font-medium text-foreground">Bank & Identity Verification</h2>
              <p className="text-[10px] text-muted-foreground/50 font-medium mt-0.5">Required for payouts and regulatory compliance. This data is securely stored and never shared publicly.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground/60">Bank Name</label>
              <div className="relative">
                <Landmark className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/40 z-10" />
                <Input
                  type="text"
                  {...register("bankName")}
                  placeholder="e.g. State Bank of India"
                  className={`w-full bg-surface-container-lowest border rounded-xl pl-12 pr-4 py-3 text-sm focus:outline-none transition-colors focus-visible:ring-0 focus-visible:ring-offset-0 ${errors.bankName ? 'border-red-500 focus:border-red-500' : 'border-outline-variant/30 focus:border-primary/50'
                    }`}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground/60">Account Holder Name</label>
              <Input
                type="text"
                {...register("bankAccountHolderName")}
                placeholder="Full name as on bank account"
                className={`w-full bg-surface-container-lowest border rounded-xl px-4 py-3 text-sm focus:outline-none transition-colors focus-visible:ring-0 focus-visible:ring-offset-0 ${errors.bankAccountHolderName ? 'border-red-500 focus:border-red-500' : 'border-outline-variant/30 focus:border-primary/50'
                  }`}
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground/60">Account Number</label>
              <div className="relative">
                <CreditCard className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/40 z-10" />
                <Input
                  type="text"
                  {...register("bankAccountNumber")}
                  placeholder="e.g. 1234567890123456"
                  className={`w-full bg-surface-container-lowest border rounded-xl pl-12 pr-4 py-3 text-sm focus:outline-none transition-colors focus-visible:ring-0 focus-visible:ring-offset-0 ${errors.bankAccountNumber ? 'border-red-500 focus:border-red-500' : 'border-outline-variant/30 focus:border-primary/50'
                    }`}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground/60">IFSC Code</label>
              <Input
                type="text"
                {...register("bankIfscCode")}
                placeholder="e.g. SBIN0001234"
                className={`w-full bg-surface-container-lowest border rounded-xl px-4 py-3 text-sm focus:outline-none transition-colors uppercase focus-visible:ring-0 focus-visible:ring-offset-0 ${errors.bankIfscCode ? 'border-red-500 focus:border-red-500' : 'border-outline-variant/30 focus:border-primary/50'
                  }`}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground/60">PAN Card Number</label>
              <div className="relative">
                <CreditCard className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/40 z-10" />
                <Input
                  type="text"
                  {...register("panNumber")}
                  placeholder="e.g. ABCDE1234F"
                  className={`w-full bg-surface-container-lowest border rounded-xl pl-12 pr-4 py-3 text-sm focus:outline-none transition-colors uppercase focus-visible:ring-0 focus-visible:ring-offset-0 ${errors.panNumber ? 'border-red-500 focus:border-red-500' : 'border-outline-variant/30 focus:border-primary/50'
                    }`}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground/60">Aadhaar Number</label>
              <div className="relative">
                <Fingerprint className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/40 z-10" />
                <Input
                  type="text"
                  {...register("aadhaarNumber")}
                  placeholder="e.g. 1234 5678 9012"
                  className={`w-full bg-surface-container-lowest border rounded-xl pl-12 pr-4 py-3 text-sm focus:outline-none transition-colors focus-visible:ring-0 focus-visible:ring-offset-0 ${errors.aadhaarNumber ? 'border-red-500 focus:border-red-500' : 'border-outline-variant/30 focus:border-primary/50'
                    }`}
                />
              </div>
            </div>
          </div>

          <div className="p-4 bg-emerald-500/5 border border-emerald-500/10 rounded-2xl">
            <p className="text-[10px] text-emerald-700/60 font-bold uppercase tracking-widest">
              🔒 All financial and identity data is encrypted at rest and in transit. It is only accessible to verified admins for payout processing.
            </p>
          </div>
        </div>

        <div className="flex justify-end pt-6 border-t border-outline-variant/20">
          <AlexButton
            type="submit"
            disabled={saving}
            size="md"
            icon={saving ? <Loader2 className="w-4 h-4 animate-spin text-primary group-hover:text-white" /> : undefined}
            className="shadow-xl"
          >
            {isVerified ? "Submit" : "Submit for Approval"}
          </AlexButton>
        </div>
      </form>
    </div>
  );
}
