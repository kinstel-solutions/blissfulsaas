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
}

export default function SessionFeedbackButton({ session }: SessionFeedbackButtonProps) {
  const [showForm, setShowForm] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  if (session.status !== "COMPLETED") return null;

  const hasExistingFeedback = !!session.feedback;
  const therapistName = `Dr. ${session.therapist?.firstName ?? ""} ${session.therapist?.lastName ?? ""}`.trim();

  if (hasExistingFeedback || submitted) {
    const rating = session.feedback?.rating ?? 5;
    return (
      <div className="flex items-center gap-1.5 px-4 py-2 bg-primary/5 border border-primary/10 rounded-xl">
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
        <span className="text-[10px] font-bold uppercase tracking-widest text-primary/60">
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
        className="px-4 py-3 bg-primary/5 text-primary border border-primary/10 rounded-2xl font-bold uppercase tracking-widest text-[10px] hover:bg-primary/10 transition-all flex items-center gap-1.5"
      >
        <Star className="w-3.5 h-3.5" />
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
