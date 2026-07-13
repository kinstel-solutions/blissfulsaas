"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Heart, Brain, Pill, Users, Target, Phone,
  ChevronRight, ChevronLeft, CheckCircle, Loader2,
  AlertCircle, Shield
} from "lucide-react";
import { fetchWithAuth } from "@/lib/api";
import { patientIntakeSchema, type PatientIntakeValues } from "@/lib/validations";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

const CONCERN_OPTIONS = [
  "Anxiety", "Depression", "Stress", "Trauma / PTSD", "Relationship Issues",
  "Grief & Loss", "Anger Management", "Self-Esteem", "Work / Career",
  "Sleep Problems", "Addiction", "Family Conflict", "Loneliness", "OCD",
];

const STEPS = [
  { id: 1, label: "Your Journey", icon: Heart, fields: ["reasonForSeeking", "primaryConcerns"] },
  { id: 2, label: "Health History", icon: Brain, fields: ["previousTherapy"] },
  { id: 3, label: "Goals", icon: Target, fields: ["therapyGoals"] },
  { id: 4, label: "Emergency Contact", icon: Phone, fields: ["emergencyContactName", "emergencyContactPhone"] },
];

export default function IntakeFormClient({ initialData }: { initialData: any }) {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [saving, setSaving] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    trigger,
    formState: { errors, isValid },
  } = useForm<PatientIntakeValues>({
    resolver: zodResolver(patientIntakeSchema),
    mode: "onChange",
    defaultValues: {
      reasonForSeeking: initialData?.reasonForSeeking || "",
      primaryConcerns: initialData?.primaryConcerns || [],
      mentalHealthHistory: initialData?.mentalHealthHistory || "",
      currentMedications: initialData?.currentMedications || "",
      previousTherapy: initialData?.previousTherapy ?? undefined,
      therapyGoals: initialData?.therapyGoals || "",
      emergencyContactName: initialData?.emergencyContactName || "",
      emergencyContactPhone: initialData?.emergencyContactPhone || "",
    },
  });

  const form = watch();

  const toggleConcern = (concern: string) => {
    const current = watch("primaryConcerns");
    const next = current.includes(concern)
      ? current.filter((c: string) => c !== concern)
      : [...current, concern];
    setValue("primaryConcerns", next, { shouldValidate: true });
  };

  const onSubmit = async (data: PatientIntakeValues) => {
    setSaving(true);
    try {
      await fetchWithAuth("/patients/intake", {
        method: "PATCH",
        body: JSON.stringify(data),
      });
      router.push("/dashboard?intake=complete");
      router.refresh();
    } catch (err) {
      console.error("Failed to save intake", err);
    } finally {
      setSaving(false);
    }
  };

  const nextStep = async () => {
    const fields = STEPS[step - 1].fields as any[];
    const result = await trigger(fields);
    if (result) {
      setStep(prev => prev + 1);
    }
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
              <Button
                variant={step === s.id ? "default" : "secondary"}
                onClick={() => step > s.id && setStep(s.id)}
                className={`flex items-center gap-2 rounded-full text-xs font-bold uppercase tracking-widest transition-all h-auto py-2 px-4 ${
                    step > s.id
                      ? 'bg-emerald-500 text-white hover:bg-emerald-600'
                      : step === s.id
                        ? 'shadow-lg shadow-primary/20'
                        : 'text-muted-foreground bg-surface-container-low hover:bg-surface-container'
                  }`}
              >
                {step > s.id ? <CheckCircle className="w-3 h-3" /> : <s.icon className="w-3 h-3" />}
                <span className="hidden sm:block">{s.label}</span>
              </Button>
              {i < STEPS.length - 1 && <div className={`w-6 h-0.5 rounded-full ${step > s.id ? 'bg-emerald-400' : 'bg-outline-variant/30'}`} />}
            </div>
          ))}
        </div>

        {/* Form Card */}
        <Card className="p-5 md:p-10">

          {/* Step 1: Reason & Concerns */}
          {step === 1 && (
            <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
              <div>
                <h2 className="text-2xl font-heading font-medium text-foreground mb-2">Why are you seeking therapy?</h2>
                <p className="text-sm text-muted-foreground">Be as open as you're comfortable with.</p>
              </div>
              <Textarea
                {...register("reasonForSeeking")}
                placeholder="E.g., I've been feeling overwhelmed at work and struggling with anxiety..."
                className={`w-full h-36 resize-none bg-surface-container-low border-outline-variant/30 transition-colors ${errors.reasonForSeeking ? 'border-red-500' : ''}`}
              />
              {errors.reasonForSeeking && <p className="text-base text-red-500 font-bold mt-1 ml-1">{errors.reasonForSeeking.message}</p>}
              <div>
                <p className="text-sm font-bold text-foreground mb-4">Select your primary concerns <span className="text-muted-foreground font-normal">(choose all that apply)</span></p>
                <div className="flex flex-wrap gap-2">
                  {CONCERN_OPTIONS.map(c => (
                    <Button
                      key={c}
                      type="button"
                      variant={form.primaryConcerns.includes(c) ? "default" : "outline"}
                      onClick={() => toggleConcern(c)}
                      className={`h-auto px-4 py-2 rounded-xl text-xs font-bold transition-all ${form.primaryConcerns.includes(c) ? 'shadow-md shadow-primary/20' : ''}`}
                    >
                      {c}
                    </Button>
                  ))}
                </div>
                {errors.primaryConcerns && <p className="text-base text-red-500 font-bold mt-2 ml-1">{errors.primaryConcerns.message}</p>}
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
                <Label className="block text-sm font-bold text-foreground mb-3">Have you seen a therapist before?</Label>
                <div className="flex gap-3">
                  {[{ label: "Yes", val: true }, { label: "No", val: false }].map(opt => (
                    <Button
                      key={opt.label}
                      type="button"
                      variant={form.previousTherapy === opt.val ? "default" : "outline"}
                      onClick={() => setValue("previousTherapy", opt.val, { shouldValidate: true })}
                      className={`flex-1 py-4 h-auto rounded-2xl text-sm font-bold transition-all ${form.previousTherapy !== opt.val ? 'bg-surface-container-low border-outline-variant/30' : ''}`}
                    >
                      {opt.label}
                    </Button>
                  ))}
                </div>
                {errors.previousTherapy && <p className="text-base text-red-500 font-bold mt-2 ml-1">{errors.previousTherapy.message}</p>}
              </div>
              <div>
                <Label className="block text-sm font-bold text-foreground mb-3">Any relevant mental health history? <span className="font-normal text-muted-foreground">(optional)</span></Label>
                <Textarea
                  {...register("mentalHealthHistory")}
                  placeholder="E.g., diagnosed conditions, hospitalizations, significant life events..."
                  className="w-full h-32 resize-none bg-surface-container-low border-outline-variant/30"
                />
              </div>
              <div>
                <Label className="block text-sm font-bold text-foreground mb-3">Current medications? <span className="font-normal text-muted-foreground">(optional)</span></Label>
                <Textarea
                  {...register("currentMedications")}
                  placeholder="List any medications you are currently taking..."
                  className="w-full h-24 resize-none bg-surface-container-low border-outline-variant/30"
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
              <Textarea
                {...register("therapyGoals")}
                placeholder="E.g., I want to learn coping strategies for anxiety, improve my communication in relationships, and feel more confident in daily life..."
                className={`w-full h-48 resize-none bg-surface-container-low border-outline-variant/30 transition-colors ${errors.therapyGoals ? 'border-red-500' : ''}`}
              />
              {errors.therapyGoals && <p className="text-base text-red-500 font-bold mt-1 ml-1">{errors.therapyGoals.message}</p>}
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
                  <Label className="block text-xs font-bold text-muted-foreground uppercase tracking-widest mb-2">Full Name</Label>
                  <Input
                    {...register("emergencyContactName")}
                    placeholder="e.g. Jane Doe"
                    className={`w-full h-14 rounded-2xl px-5 bg-surface-container-low border-outline-variant/30 transition-colors ${errors.emergencyContactName ? 'border-red-500' : ''}`}
                  />
                  {errors.emergencyContactName && <p className="text-base text-red-500 font-bold mt-1 ml-1">{errors.emergencyContactName.message}</p>}
                </div>
                <div>
                  <Label className="block text-xs font-bold text-muted-foreground uppercase tracking-widest mb-2">Phone Number</Label>
                  <Input
                    {...register("emergencyContactPhone")}
                    placeholder="+91 XXXXX XXXXX"
                    className={`w-full h-14 rounded-2xl px-5 bg-surface-container-low border-outline-variant/30 transition-colors ${errors.emergencyContactPhone ? 'border-red-500' : ''}`}
                  />
                  {errors.emergencyContactPhone && <p className="text-base text-red-500 font-bold mt-1 ml-1">{errors.emergencyContactPhone.message}</p>}
                </div>
              </div>
              <div className="p-5 bg-primary/5 rounded-2xl border border-primary/10 flex items-start gap-3">
                <AlertCircle className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                <p className="text-base text-foreground/70 leading-relaxed">
                  This information is only used in genuine clinical emergencies and is never shared or sold to third parties.
                </p>
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="mt-10 flex items-center justify-between">
            <Button
              type="button"
              variant="outline"
              size="lg"
              onClick={() => setStep(prev => prev - 1)}
              className={step === 1 ? 'invisible' : ''}
            >
              <ChevronLeft className="w-4 h-4" /> Back
            </Button>

            {step < 4 ? (
              <Button
                type="button"
                variant="default"
                size="lg"
                onClick={nextStep}
                className="flex items-center gap-2"
              >
                Continue <ChevronRight className="w-4 h-4" />
              </Button>
            ) : (
              <Button
                type="button"
                variant="default"
                size="lg"
                onClick={handleSubmit(onSubmit)}
                disabled={saving}
                className="flex items-center gap-2 bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-40"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                {saving ? "Submitting..." : "Complete Intake"}
              </Button>
            )}
          </div>
        </Card>

        <p className="text-center text-base text-muted-foreground/50 mt-8 uppercase tracking-widest font-bold">
          🔒 Industry-standard AES-256 encryption • Your privacy is our priority
        </p>
      </div>
    </div>
  );
}
