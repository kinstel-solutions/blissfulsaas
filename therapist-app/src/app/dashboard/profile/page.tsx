"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { Loader2, Save, UserCircle2, Activity } from "lucide-react";

export default function ProfilePage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    bio: "",
    hourlyRate: 150,
    specialities: [] as string[],
    videoUrl: ""
  });

  const [specialityInput, setSpecialityInput] = useState("");

  useEffect(() => {
    async function loadProfile() {
      try {
        const data = await api.therapists.getProfile();
        setFormData({
          firstName: data.firstName || "",
          lastName: data.lastName || "",
          bio: data.bio || "",
          hourlyRate: data.hourlyRate || 0,
          specialities: data.specialities || [],
          videoUrl: data.videoUrl || ""
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
      [name]: name === "hourlyRate" ? Number(value) : value,
    }));
  };

  const handleAddSpeciality = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && specialityInput.trim()) {
      e.preventDefault();
      if (!formData.specialities.includes(specialityInput.trim())) {
        setFormData((prev) => ({
          ...prev,
          specialities: [...prev.specialities, specialityInput.trim()]
        }));
      }
      setSpecialityInput("");
    }
  };

  const handleRemoveSpeciality = (tag: string) => {
    setFormData((prev) => ({
      ...prev,
      specialities: prev.specialities.filter(t => t !== tag)
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
          <p className="text-sm font-medium text-muted-foreground mt-1">Manage our public marketplace presence and biographical information.</p>
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

        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">First Name</label>
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
              <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">Last Name</label>
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
            <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">Editorial Bio</label>
            <textarea
              name="bio"
              value={formData.bio}
              onChange={handleInputChange}
              rows={5}
              className="w-full bg-surface-container-lowest border border-outline-variant/30 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary/50 transition-colors resize-none"
              placeholder="Describe your unique therapeutic approach..."
            />
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">Hourly Rate (USD)</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground font-medium">$</span>
                <input
                  type="number"
                  name="hourlyRate"
                  value={formData.hourlyRate}
                  onChange={handleInputChange}
                  className="w-full bg-surface-container-lowest border border-outline-variant/30 rounded-xl pl-8 pr-4 py-3 text-sm focus:outline-none focus:border-primary/50 transition-colors"
                  min="0"
                  required
                />
              </div>
            </div>
            {/* Future Video URL if needed 
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">Introductory Video URL</label>
              <input
                type="url"
                name="videoUrl"
                value={formData.videoUrl}
                onChange={handleInputChange}
                className="w-full bg-surface-container-lowest border border-outline-variant/30 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary/50 transition-colors"
                placeholder="https://youtube.com/..."
              />
            </div>
            */}
          </div>

          <div className="space-y-3">
            <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">Specialities</label>
            <div className="p-4 bg-surface-container-lowest border border-outline-variant/30 rounded-2xl min-h-[100px] flex gap-2 flex-wrap items-start focus-within:border-primary/50 transition-colors">
              {formData.specialities.map(tag => (
                <span key={tag} className="flex items-center gap-2 bg-primary/10 text-primary px-3 py-1.5 rounded-lg text-xs font-bold tracking-tight">
                  {tag}
                  <button type="button" onClick={() => handleRemoveSpeciality(tag)} className="hover:bg-primary/20 rounded-full w-4 h-4 flex items-center justify-center -mr-1">
                    &times;
                  </button>
                </span>
              ))}
              <input
                type="text"
                value={specialityInput}
                onChange={(e) => setSpecialityInput(e.target.value)}
                onKeyDown={handleAddSpeciality}
                placeholder="Type and press Enter..."
                className="flex-1 min-w-[200px] bg-transparent outline-none text-sm placeholder:text-muted-foreground/50 py-1.5"
              />
            </div>
            <p className="text-xs text-muted-foreground/60 font-medium">Add tags like &quot;Anxiety&quot;, &quot;CBT&quot;, or &quot;Trauma&quot; to help patients find you.</p>
          </div>
        </div>

        <div className="flex justify-end pt-6 border-t border-outline-variant/20">
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 bg-primary text-primary-foreground px-8 py-4 rounded-2xl text-sm font-bold uppercase tracking-widest disabled:opacity-50 hover:-translate-y-0.5 transition-transform"
          >
            {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
            Save Profile
          </button>
        </div>
      </form>
    </div>
  );
}
