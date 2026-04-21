"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { Loader2, Save, UserCircle2, GraduationCap, Globe, Clock, Tag, MapPin } from "lucide-react";

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

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    bio: "",
    qualifications: "",
    yearsOfExperience: 0,
    hourlyRate: 150,
    specialities: [] as string[],
    languages: [] as string[],
    videoUrl: "",
    clinicAddress: "",
  });

  const [specialityInput, setSpecialityInput] = useState("");
  const [languageInput, setLanguageInput] = useState("");

  useEffect(() => {
    async function loadProfile() {
      try {
        const data = await api.therapists.getProfile();
        setFormData({
          firstName: data.firstName || "",
          lastName: data.lastName || "",
          bio: data.bio || "",
          qualifications: data.qualifications || "",
          yearsOfExperience: data.yearsOfExperience || 0,
          hourlyRate: data.hourlyRate || 0,
          specialities: data.specialities || [],
          languages: data.languages || [],
          videoUrl: data.videoUrl || "",
          clinicAddress: data.clinicAddress || "",
        });
      } catch (err: any) {
        setError(err.message || "Failed to load profile");
      } finally {
        setLoading(false);
      }
    }
    loadProfile();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: (name === "hourlyRate" || name === "yearsOfExperience") ? Number(value) : value,
    }));
  };

  const handleAddItem = (e: React.KeyboardEvent<HTMLInputElement>, field: 'specialities' | 'languages', input: string, setInput: (v: string) => void) => {
    if (e.key === "Enter" && input.trim()) {
      e.preventDefault();
      if (!formData[field].includes(input.trim())) {
        setFormData((prev) => ({
          ...prev,
          [field]: [...prev[field], input.trim()]
        }));
      }
      setInput("");
    }
  };

  const handleRemoveItem = (tag: string, field: 'specialities' | 'languages') => {
    setFormData((prev) => ({
      ...prev,
      [field]: prev[field].filter(t => t !== tag)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccessMessage(null);

    try {
      await api.therapists.updateProfile(formData);
      setSuccessMessage("Profile updated successfully. Changes will be reflected in the Patient Marketplace.");
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
    <div className="space-y-8 pb-12 max-w-4xl mx-auto">
      <div className="flex items-center gap-4 border-b border-outline-variant/20 pb-6">
        <div className="w-12 h-12 bg-primary/10 flex items-center justify-center rounded-2xl text-primary">
          <UserCircle2 className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-3xl font-heading font-medium text-foreground">Clinical Profile</h1>
          <p className="text-sm font-medium text-muted-foreground mt-1">Manage our public marketplace presence and trust-building credentials.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-12">
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

        <div className="space-y-10">
          {/* Core Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground/60">First Name</label>
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleInputChange}
                className="w-full bg-surface-container-lowest border border-outline-variant/30 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary/50 transition-colors"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground/60">Last Name</label>
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleInputChange}
                className="w-full bg-surface-container-lowest border border-outline-variant/30 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary/50 transition-colors"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground/60">Professional Headline / Qualifications</label>
            <div className="relative">
              <GraduationCap className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/40" />
              <input
                type="text"
                name="qualifications"
                value={formData.qualifications}
                onChange={handleInputChange}
                placeholder="e.g. M.Phil in Clinical Psychology, Yale University"
                className="w-full bg-surface-container-lowest border border-outline-variant/30 rounded-xl pl-12 pr-4 py-3 text-sm focus:outline-none focus:border-primary/50 transition-colors"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground/60">Editorial Bio</label>
            <textarea
              name="bio"
              value={formData.bio}
              onChange={handleInputChange}
              rows={5}
              className="w-full bg-surface-container-lowest border border-outline-variant/30 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary/50 transition-colors resize-none leading-relaxed"
              placeholder="Describe your unique therapeutic approach..."
            />
          </div>

          {/* Clinic Address */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground/60">Clinic Address (for in-clinic visits)</label>
            <div className="relative">
              <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/40" />
              <input
                type="text"
                name="clinicAddress"
                value={formData.clinicAddress}
                onChange={handleInputChange}
                placeholder="e.g. 24 MG Road, Bengaluru, Karnataka 560001"
                className="w-full bg-surface-container-lowest border border-outline-variant/30 rounded-xl pl-12 pr-4 py-3 text-sm focus:outline-none focus:border-emerald-500/50 transition-colors"
              />
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
                  name="hourlyRate"
                  value={formData.hourlyRate}
                  onChange={handleInputChange}
                  className="w-full bg-surface-container-lowest border border-outline-variant/30 rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:border-primary/50 transition-colors"
                  min="0"
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground/60">Years of Experience</label>
              <div className="relative">
                <Clock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/40" />
                <input
                  type="number"
                  name="yearsOfExperience"
                  value={formData.yearsOfExperience}
                  onChange={handleInputChange}
                  className="w-full bg-surface-container-lowest border border-outline-variant/30 rounded-xl pl-12 pr-4 py-3 text-sm focus:outline-none focus:border-primary/50 transition-colors"
                  min="0"
                />
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
                          setFormData(prev => ({
                            ...prev,
                            languages: [...prev.languages, lang]
                          }));
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
                          setFormData(prev => ({
                            ...prev,
                            specialities: [...prev.specialities, spec]
                          }));
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
            Publish to Marketplace
          </button>
        </div>
      </form>
    </div>
  );
}
