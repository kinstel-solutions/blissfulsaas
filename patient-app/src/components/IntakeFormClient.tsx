"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  Heart, Brain, Pill, Users, Target, Phone, 
  ChevronRight, ChevronLeft, CheckCircle, Loader2,
  AlertCircle, Shield
} from "lucide-react";
import { fetchWithAuth } from "@/lib/api";

const CONCERN_OPTIONS = [
  "Anxiety", "Depression", "Stress", "Trauma / PTSD", "Relationship Issues",
  "Grief & Loss", "Anger Management", "Self-Esteem", "Work / Career", 
  "Sleep Problems", "Addiction", "Family Conflict", "Loneliness", "OCD",
];

const STEPS = [
  { id: 1, label: "Your Journey", icon: Heart },
  { id: 2, label: "Health History", icon: Brain },
  { id: 3, label: "Goals", icon: Target },
  { id: 4, label: "Emergency Contact", icon: Phone },
];

export default function IntakeFormClient({ initialData }: { initialData: any }) {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    reasonForSeeking: initialData?.reasonForSeeking || "",
    primaryConcerns: initialData?.primaryConcerns || [],
    mentalHealthHistory: initialData?.mentalHealthHistory || "",
    currentMedications: initialData?.currentMedications || "",
    previousTherapy: initialData?.previousTherapy ?? null,
    therapyGoals: initialData?.therapyGoals || "",
    emergencyContactName: initialData?.emergencyContactName || "",
    emergencyContactPhone: initialData?.emergencyContactPhone || "",
  });

  const toggleConcern = (concern: string) => {
    setForm(prev => ({
      ...prev,
      primaryConcerns: prev.primaryConcerns.includes(concern)
        ? prev.primaryConcerns.filter((c: string) => c !== concern)
        : [...prev.primaryConcerns, concern]
    }));
  };

  const handleSubmit = async () => {
    setSaving(true);
    try {
      await fetchWithAuth("/patients/intake", {
        method: "PATCH",
        body: JSON.stringify(form),
      });
      router.push("/dashboard?intake=complete");
      router.refresh();
    } catch (err) {
      console.error("Failed to save intake", err);
    } finally {
      setSaving(false);
    }
  };

  const isStepValid = () => {
    if (step === 1) return form.reasonForSeeking.trim().length > 10 && form.primaryConcerns.length > 0;
    if (step === 2) return form.previousTherapy !== null;
    if (step === 3) return form.therapyGoals.trim().length > 10;
    if (step === 4) return form.emergencyContactName.trim().length > 0 && form.emergencyContactPhone.trim().length > 0;
    return true;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-surface via-primary/5 to-surface flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary rounded-full text-xs font-bold uppercase tracking-widest mb-6 border border-primary/10">
            <Shield className="w-3 h-3" /> Private & Confidential
          </div>
          <h1 className="text-4xl font-heading font-medium text-foreground">Clinical Intake Form</h1>
          <p className="text-muted-foreground mt-3 leading-relaxed">
            Help your therapist understand you better. This information is shared only with the therapist you book with.
          </p>
        </div>

        {/* Step indicator */}
        <div className="flex items-center justify-center gap-2 mb-10">
          {STEPS.map((s, i) => (
            <div key={s.id} className="flex items-center gap-2">
              <button
                onClick={() => step > s.id && setStep(s.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest transition-all ${
                  step === s.id 
                    ? 'bg-primary text-white shadow-lg shadow-primary/20' 
                    : step > s.id 
                      ? 'bg-emerald-500 text-white' 
                      : 'bg-surface-container-low text-muted-foreground'
                }`}
              >
                {step > s.id ? <CheckCircle className="w-3 h-3" /> : <s.icon className="w-3 h-3" />}
                <span className="hidden sm:block">{s.label}</span>
              </button>
              {i < STEPS.length - 1 && <div className={`w-6 h-0.5 rounded-full ${step > s.id ? 'bg-emerald-400' : 'bg-outline-variant/30'}`} />}
            </div>
          ))}
        </div>

        {/* Form Card */}
        <div className="bg-surface-container-lowest border border-outline-variant/20 rounded-2xl p-5 md:p-10 shadow-xl">
          
          {/* Step 1: Reason & Concerns */}
          {step === 1 && (
            <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
              <div>
                <h2 className="text-2xl font-heading font-medium text-foreground mb-2">Why are you seeking therapy?</h2>
                <p className="text-sm text-muted-foreground">Be as open as you're comfortable with.</p>
              </div>
              <textarea
                value={form.reasonForSeeking}
                onChange={e => setForm(prev => ({ ...prev, reasonForSeeking: e.target.value }))}
                placeholder="E.g., I've been feeling overwhelmed at work and struggling with anxiety..."
                className="w-full h-36 bg-surface-container-low border border-outline-variant/30 rounded-2xl p-5 text-sm text-foreground placeholder:text-muted-foreground/40 focus:ring-2 focus:ring-primary/20 outline-none resize-none leading-relaxed"
              />
              <div>
                <p className="text-sm font-bold text-foreground mb-4">Select your primary concerns <span className="text-muted-foreground font-normal">(choose all that apply)</span></p>
                <div className="flex flex-wrap gap-2">
                  {CONCERN_OPTIONS.map(c => (
                    <button
                      key={c}
                      onClick={() => toggleConcern(c)}
                      className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border ${
                        form.primaryConcerns.includes(c)
                          ? 'bg-primary text-white border-primary shadow-md shadow-primary/20'
                          : 'bg-surface-container-low text-foreground/70 border-outline-variant/30 hover:border-primary/30'
                      }`}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Mental Health History */}
          {step === 2 && (
            <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
              <div>
                <h2 className="text-2xl font-heading font-medium text-foreground mb-2">Your health background</h2>
                <p className="text-sm text-muted-foreground">This helps your therapist provide better, personalized care.</p>
              </div>
              <div>
                <label className="block text-sm font-bold text-foreground mb-3">Have you seen a therapist before?</label>
                <div className="flex gap-3">
                  {[{ label: "Yes", val: true }, { label: "No", val: false }].map(opt => (
                    <button
                      key={opt.label}
                      onClick={() => setForm(prev => ({ ...prev, previousTherapy: opt.val }))}
                      className={`flex-1 py-4 rounded-2xl text-sm font-bold border transition-all ${
                        form.previousTherapy === opt.val
                          ? 'bg-primary text-white border-primary'
                          : 'bg-surface-container-low border-outline-variant/30 text-foreground/70 hover:border-primary/30'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold text-foreground mb-3">Any relevant mental health history? <span className="font-normal text-muted-foreground">(optional)</span></label>
                <textarea
                  value={form.mentalHealthHistory}
                  onChange={e => setForm(prev => ({ ...prev, mentalHealthHistory: e.target.value }))}
                  placeholder="E.g., diagnosed conditions, hospitalizations, significant life events..."
                  className="w-full h-32 bg-surface-container-low border border-outline-variant/30 rounded-2xl p-5 text-sm text-foreground placeholder:text-muted-foreground/40 focus:ring-2 focus:ring-primary/20 outline-none resize-none leading-relaxed"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-foreground mb-3">Current medications? <span className="font-normal text-muted-foreground">(optional)</span></label>
                <textarea
                  value={form.currentMedications}
                  onChange={e => setForm(prev => ({ ...prev, currentMedications: e.target.value }))}
                  placeholder="List any medications you are currently taking..."
                  className="w-full h-24 bg-surface-container-low border border-outline-variant/30 rounded-2xl p-5 text-sm text-foreground placeholder:text-muted-foreground/40 focus:ring-2 focus:ring-primary/20 outline-none resize-none leading-relaxed"
                />
              </div>
            </div>
          )}

          {/* Step 3: Goals */}
          {step === 3 && (
            <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
              <div>
                <h2 className="text-2xl font-heading font-medium text-foreground mb-2">What do you hope to achieve?</h2>
                <p className="text-sm text-muted-foreground">Setting clear goals helps measure your progress.</p>
              </div>
              <textarea
                value={form.therapyGoals}
                onChange={e => setForm(prev => ({ ...prev, therapyGoals: e.target.value }))}
                placeholder="E.g., I want to learn coping strategies for anxiety, improve my communication in relationships, and feel more confident in daily life..."
                className="w-full h-48 bg-surface-container-low border border-outline-variant/30 rounded-2xl p-5 text-sm text-foreground placeholder:text-muted-foreground/40 focus:ring-2 focus:ring-primary/20 outline-none resize-none leading-relaxed"
              />
            </div>
          )}

          {/* Step 4: Emergency Contact */}
          {step === 4 && (
            <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
              <div>
                <h2 className="text-2xl font-heading font-medium text-foreground mb-2">Emergency contact</h2>
                <p className="text-sm text-muted-foreground">Someone we can reach in case of a clinical emergency.</p>
              </div>
              <div className="space-y-5">
                <div>
                  <label className="block text-xs font-bold text-muted-foreground uppercase tracking-widest mb-2">Full Name</label>
                  <input
                    value={form.emergencyContactName}
                    onChange={e => setForm(prev => ({ ...prev, emergencyContactName: e.target.value }))}
                    placeholder="e.g. Jane Doe"
                    className="w-full h-14 bg-surface-container-low border border-outline-variant/30 rounded-2xl px-5 text-sm text-foreground placeholder:text-muted-foreground/40 focus:ring-2 focus:ring-primary/20 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-muted-foreground uppercase tracking-widest mb-2">Phone Number</label>
                  <input
                    value={form.emergencyContactPhone}
                    onChange={e => setForm(prev => ({ ...prev, emergencyContactPhone: e.target.value }))}
                    placeholder="+91 XXXXX XXXXX"
                    className="w-full h-14 bg-surface-container-low border border-outline-variant/30 rounded-2xl px-5 text-sm text-foreground placeholder:text-muted-foreground/40 focus:ring-2 focus:ring-primary/20 outline-none"
                  />
                </div>
              </div>
              <div className="p-5 bg-primary/5 rounded-2xl border border-primary/10 flex items-start gap-3">
                <AlertCircle className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                <p className="text-xs text-foreground/70 leading-relaxed">
                  This information is only used in genuine clinical emergencies and is never shared or sold to third parties.
                </p>
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="mt-10 flex items-center justify-between">
            <button
              onClick={() => setStep(prev => prev - 1)}
              className={`flex items-center gap-2 px-6 py-3 rounded-2xl text-sm font-bold border border-outline-variant/30 text-foreground/70 hover:bg-surface-container-low transition-all ${step === 1 ? 'invisible' : ''}`}
            >
              <ChevronLeft className="w-4 h-4" /> Back
            </button>

            {step < 4 ? (
              <button
                onClick={() => setStep(prev => prev + 1)}
                disabled={!isStepValid()}
                className="flex items-center gap-2 px-4 md:px-8 py-3 rounded-2xl text-sm font-bold bg-primary text-white shadow-lg shadow-primary/20 hover:shadow-xl hover:-translate-y-0.5 transition-all disabled:opacity-40 disabled:cursor-not-allowed disabled:translate-y-0"
              >
                Continue <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={!isStepValid() || saving}
                className="flex items-center gap-2 px-4 md:px-8 py-3 rounded-2xl text-sm font-bold bg-emerald-600 text-white shadow-lg shadow-emerald-600/20 hover:shadow-xl hover:-translate-y-0.5 transition-all disabled:opacity-40"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                {saving ? "Submitting..." : "Complete Intake"}
              </button>
            )}
          </div>
        </div>

        <p className="text-center text-xs text-muted-foreground/50 mt-8 uppercase tracking-widest font-bold">
          🔒 Industry-standard AES-256 encryption • Your privacy is our priority
        </p>
      </div>
    </div>
  );
}
