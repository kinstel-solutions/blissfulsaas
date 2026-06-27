"use client";

import { useState } from "react";
import { Star } from "lucide-react";
import FeedbackForm from "./FeedbackForm";

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
}

export default function SessionFeedbackButton({ session, fullWidth }: SessionFeedbackButtonProps) {
  const [showForm, setShowForm] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  if (session.status !== "COMPLETED") return null;

  const hasExistingFeedback = !!session.feedback;
  const therapistName = `${session.therapist?.firstName ?? ""} ${session.therapist?.lastName ?? ""}`.trim();

  if (hasExistingFeedback || submitted) {
    const rating = session.feedback?.rating ?? 5;
    return (
      <div className={`flex items-center justify-center gap-1.5 px-4 h-14 bg-primary/5 border border-primary/10 rounded-2xl ${fullWidth ? 'w-full' : ''}`}>
        <div className="flex items-center gap-0.5">
          {[1, 2, 3, 4, 5].map((star) => (
            <Star
              key={star}
              className={`w-4 h-4 ${
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
      <button
        id={`leave-review-btn-${session.id}`}
        onClick={() => setShowForm(true)}
        className={`bg-primary/5 text-primary border border-primary/10 rounded-2xl font-bold uppercase tracking-widest text-xs hover:bg-primary/10 transition-all flex items-center justify-center gap-1.5 h-14 ${fullWidth ? 'w-full' : 'px-4'}`}
      >
        <Star className="w-4 h-4" />
        Rate Session
      </button>

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
