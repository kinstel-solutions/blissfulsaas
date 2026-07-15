"use client";

import { useState } from "react";
import { Star } from "lucide-react";
import FeedbackForm from "./FeedbackForm";
import { Button } from "@/components/ui/button";

interface Session {
  id: string;
  status: string;
  therapist?: {
    firstName?: string;
    lastName?: string;
  };
  feedback?: { rating: number; comment?: string } | null;
}

interface SessionFeedbackButtonProps {
  session: Session;
  fullWidth?: boolean;
  variant?: "card" | "detail";
}

export default function SessionFeedbackButton({ session, fullWidth, variant = "card" }: SessionFeedbackButtonProps) {
  const [showForm, setShowForm] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  if (session.status !== "COMPLETED") return null;

  const hasExistingFeedback = !!session.feedback;
  const therapistName = `${session.therapist?.firstName ?? ""} ${session.therapist?.lastName ?? ""}`.trim();

  const baseStyles = variant === "detail" 
    ? "h-14 rounded-xl bg-surface-container-low hover:bg-surface-container-low/70 text-foreground border-outline-variant/30 hover:border-primary/30" 
    : "py-3 rounded-xl bg-primary/5 text-primary border-primary/10 hover:bg-primary/10 h-auto sm:min-w-[160px]";

  if (hasExistingFeedback || submitted) {
    const rating = session.feedback?.rating ?? 5;
    return (
      <div className={`flex items-center justify-center gap-1.5 px-5 border ${baseStyles} ${fullWidth ? 'w-full' : ''}`}>
        <div className="flex items-center gap-0.5">
          {[1, 2, 3, 4, 5].map((star) => (
            <Star
              key={star}
              className={`w-3.5 h-3.5 ${
                star <= rating
                  ? "fill-primary text-primary"
                  : "text-outline-variant/30"
              }`}
            />
          ))}
        </div>
        <span className="text-xs font-bold uppercase tracking-widest text-primary/60">
          Reviewed
        </span>
      </div>
    );
  }

  return (
    <>
      <Button
        variant="outline"
        id={`leave-review-btn-${session.id}`}
        onClick={() => setShowForm(true)}
        className={`font-bold uppercase tracking-widest text-xs transition-all flex items-center justify-center gap-1.5 px-5 ${baseStyles} ${fullWidth ? 'w-full' : ''}`}
      >
        <Star className="w-3.5 h-3.5" />
        Rate Session
      </Button>

      {showForm && (
        <FeedbackForm
          appointmentId={session.id}
          therapistName={therapistName}
          onClose={() => setShowForm(false)}
          onSubmitted={() => {
            setSubmitted(true);
            setShowForm(false);
          }}
        />
      )}
    </>
  );
}
