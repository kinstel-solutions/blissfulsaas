"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Heart, Brain, Users, Phone,
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

const STEPS = [
  { id: 1, label: "About You", icon: Users, fields: ["fullName", "age", "pronouns", "city"] },
  { id: 2, label: "Your Journey", icon: Heart, fields: ["reasonForSeeking"] },
  { id: 3, label: "Health History", icon: Brain, fields: ["mentalHealthHistory", "currentMedications"] },
  { id: 4, label: "Emergency Contact", icon: Phone, fields: ["emergencyContactName", "emergencyContactPhone", "consent"] },
];

export default function IntakeFormClient({ initialData, sessionId }: { initialData: any; sessionId?: string }) {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [saving, setSaving] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    trigger,
    formState: { errors },
  } = useForm<PatientIntakeValues>({
    resolver: zodResolver(patientIntakeSchema),
    mode: "onChange",
    defaultValues: {
      fullName: initialData?.fullName || "",
      age: initialData?.age || "",
      pronouns: initialData?.pronouns || "",
      city: initialData?.city || "",
      reasonForSeeking: initialData?.reasonForSeeking || "",
      mentalHealthHistory: initialData?.mentalHealthHistory || "",
      currentMedications: initialData?.currentMedications || "",
      emergencyContactName: initialData?.emergencyContactName || "",
      emergencyContactPhone: initialData?.emergencyContactPhone || "",
      consent: initialData?.intakeCompleted ? true : undefined as any,
    },
  });

  const onSubmit = async (data: PatientIntakeValues) => {
    setSaving(true);
    try {
      const { consent, ...payload } = data;
      await fetchWithAuth("/patients/intake", {
        method: "PATCH",
        body: JSON.stringify(payload),
      });
      if (sessionId) {
        router.push(`/dashboard/sessions/${sessionId}`);
      } else {
        router.push("/dashboard?intake=complete");
      }
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
            {sessionId
              ? "Almost there! Fill out this form and your session will be confirmed."
              : "Help your therapist understand you better. This information is shared only with the therapist you book with."}
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

          {/* Step 1: About You */}
          {step === 1 && (
            <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
              <div>
                <h2 className="text-2xl font-heading font-medium text-foreground mb-2">About You</h2>
                <p className="text-sm text-muted-foreground">Let's start with some basic information.</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <Label className="block text-xs font-bold text-muted-foreground uppercase tracking-widest mb-2">Full Name</Label>
                  <Input
                    {...register("fullName")}
                    placeholder="e.g. Jane Doe"
                    className={`w-full h-14 rounded-2xl px-5 bg-surface-container-low border-outline-variant/30 transition-colors ${errors.fullName ? 'border-red-500' : ''}`}
                  />
                  {errors.fullName && <p className="text-base text-red-500 font-bold mt-1 ml-1">{errors.fullName.message}</p>}
                </div>
                <div>
                  <Label className="block text-xs font-bold text-muted-foreground uppercase tracking-widest mb-2">Age</Label>
                  <Input
                    {...register("age")}
                    placeholder="e.g. 28"
                    className={`w-full h-14 rounded-2xl px-5 bg-surface-container-low border-outline-variant/30 transition-colors ${errors.age ? 'border-red-500' : ''}`}
                  />
                  {errors.age && <p className="text-base text-red-500 font-bold mt-1 ml-1">{errors.age.message}</p>}
                </div>
                <div>
                  <Label className="block text-xs font-bold text-muted-foreground uppercase tracking-widest mb-2">Pronouns</Label>
                  <Input
                    {...register("pronouns")}
                    placeholder="she/her, he/him, they/them"
                    className={`w-full h-14 rounded-2xl px-5 bg-surface-container-low border-outline-variant/30 transition-colors`}
                  />
                </div>
                <div>
                  <Label className="block text-xs font-bold text-muted-foreground uppercase tracking-widest mb-2">City</Label>
                  <Input
                    {...register("city")}
                    placeholder="Online"
                    className={`w-full h-14 rounded-2xl px-5 bg-surface-container-low border-outline-variant/30 transition-colors`}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Reason */}
          {step === 2 && (
            <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
              <div>
                <h2 className="text-2xl font-heading font-medium text-foreground mb-2">What brings you here?</h2>
                <p className="text-sm text-muted-foreground">Be as open as you're comfortable with.</p>
              </div>
              <Textarea
                {...register("reasonForSeeking")}
                placeholder="E.g., I've been feeling overwhelmed at work and struggling with anxiety..."
                className={`w-full h-36 resize-none bg-surface-container-low border-outline-variant/30 transition-colors ${errors.reasonForSeeking ? 'border-red-500' : ''}`}
              />
              {errors.reasonForSeeking && <p className="text-base text-red-500 font-bold mt-1 ml-1">{errors.reasonForSeeking.message}</p>}
            </div>
          )}

          {/* Step 3: Mental Health History */}
          {step === 3 && (
            <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
              <div>
                <h2 className="text-2xl font-heading font-medium text-foreground mb-2">Your health background</h2>
                <p className="text-sm text-muted-foreground">This helps your therapist provide better, personalized care.</p>
              </div>
              <div>
                <Label className="block text-sm font-bold text-foreground mb-3">Past therapy or mental-health history <span className="font-normal text-muted-foreground">(optional)</span></Label>
                <Textarea
                  {...register("mentalHealthHistory")}
                  placeholder="E.g., diagnosed conditions, hospitalizations, significant life events..."
                  className="w-full h-32 resize-none bg-surface-container-low border-outline-variant/30"
                />
              </div>
              <div>
                <Label className="block text-sm font-bold text-foreground mb-3">Current medications (if any) <span className="font-normal text-muted-foreground">(optional)</span></Label>
                <Input
                  {...register("currentMedications")}
                  placeholder="List any medications you are currently taking..."
                  className="w-full h-14 rounded-2xl px-5 bg-surface-container-low border-outline-variant/30 transition-colors"
                />
              </div>
            </div>
          )}

          {/* Step 4: Emergency Contact & Consent */}
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

              <div className={`p-5 rounded-2xl border flex items-center gap-4 ${errors.consent ? 'border-red-300 bg-red-50/50' : 'bg-surface-container-low border-outline-variant/30'}`}>
                <input
                  type="checkbox"
                  id="consent"
                  {...register("consent")}
                  className="w-5 h-5 rounded border-outline-variant/50 text-primary focus:ring-primary cursor-pointer shrink-0"
                />
                <label htmlFor="consent" className="text-sm font-medium text-foreground leading-tight flex-1 cursor-pointer">
                  I consent to the secure sharing of this form with my therapist and to the platform's privacy policy.
                </label>
              </div>
              {errors.consent && <p className="text-base text-red-500 font-bold mt-1 ml-1">{errors.consent.message}</p>}

              <div className="p-5 bg-primary/5 rounded-2xl border border-primary/10 flex items-start gap-3">
                <AlertCircle className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                <p className="text-base text-foreground/70 leading-relaxed">
                  This information is only used in genuine clinical emergencies and is never shared or sold to third parties.
                </p>
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="mt-10 flex items-center justify-between gap-3 sm:gap-4">
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setStep(prev => prev - 1)}
                className={`h-10 px-3 sm:px-5 text-sm ${step === 1 ? 'hidden' : ''}`}
              >
                <ChevronLeft className="w-4 h-4" /> Back
              </Button>

              <Button
                type="button"
                variant="ghost"
                onClick={() => {
                  if (sessionId) {
                    router.push(`/dashboard/sessions/${sessionId}`);
                  } else {
                    router.push("/dashboard");
                  }
                }}
                className="text-amber-600 hover:text-amber-700 hover:bg-amber-50 h-10 px-3 sm:px-5 text-sm"
              >
                Skip
              </Button>
            </div>

            {step < 4 ? (
              <Button
                type="button"
                variant="default"
                onClick={nextStep}
                className="flex items-center gap-2 h-10 px-3 sm:px-5 text-sm"
              >
                Continue <ChevronRight className="w-4 h-4" />
              </Button>
            ) : (
              <Button
                type="button"
                variant="default"
                onClick={handleSubmit(onSubmit)}
                disabled={saving}
                className="flex items-center gap-2 bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-40 h-10 px-3 sm:px-5 text-sm"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                {saving ? "Submitting..." : sessionId ? "Confirm Booking" : "Complete Intake"}
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
