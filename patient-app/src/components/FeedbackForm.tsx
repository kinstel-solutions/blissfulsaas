"use client";

import { useState } from "react";
import { Star, MessageSquare, Send, CheckCircle2, Loader2, X } from "lucide-react";

interface FeedbackFormProps {
  appointmentId: string;
  therapistName: string;
  onClose: () => void;
  onSubmitted: () => void;
}

export default function FeedbackForm({
  appointmentId,
  therapistName,
  onClose,
  onSubmitted,
}: FeedbackFormProps) {
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");


  const getRatingLabel = (r: number) => {
    switch (r) {
      case 1: return "Poor";
      case 2: return "Fair";
      case 3: return "Good";
      case 4: return "Very Good";
      case 5: return "Excellent";
      default: return "Select rating";
    }
  };

  const getRatingColor = (r: number) => {
    if (r <= 1) return "text-red-500";
    if (r <= 2) return "text-orange-400";
    if (r <= 3) return "text-yellow-500";
    if (r <= 4) return "text-lime-500";
    return "text-emerald-500";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) {
      setError("Please select a rating before submitting.");
      return;
    }
    setLoading(true);
    setError("");

    try {
      // Get auth token from cookie via the API route
      const res = await fetch(`/api/feedback/${appointmentId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rating, comment: comment.trim() || undefined }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.message || "Failed to submit feedback");
      }

      setSubmitted(true);
      setTimeout(() => {
        onSubmitted();
      }, 2000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-4 animate-in fade-in duration-300">
        <div className="bg-white border border-outline-variant/20 rounded-[2.5rem] p-10 max-w-sm w-full text-center shadow-[0_20px_50px_rgba(0,0,0,0.2)] animate-in zoom-in-95 duration-300">
          <div className="w-20 h-20 bg-primary/5 rounded-[2rem] flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-10 h-10 text-primary" />
          </div>
          <h3 className="text-2xl font-heading font-medium text-foreground mb-2">Thank you!</h3>
          <p className="text-muted-foreground text-sm">
            Your feedback helps our therapists grow and supports others in finding the right care.
          </p>
        </div>
      </div>
    );
  }

  const displayRating = hoveredRating || rating;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-4 animate-in fade-in duration-300">
      <div className="bg-white border border-outline-variant/20 rounded-[2.5rem] p-8 md:p-12 max-w-xl w-full shadow-[0_20px_50px_rgba(0,0,0,0.2)] animate-in zoom-in-95 duration-300 relative">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-surface-container transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="mb-8">
          <div className="w-14 h-14 bg-primary/5 rounded-2xl flex items-center justify-center mb-4">
            <Star className="w-7 h-7 text-primary" />
          </div>
          <h2 className="text-2xl font-heading font-medium text-foreground">
            How was your session?
          </h2>
          <p className="text-muted-foreground mt-1 text-sm">
            Share your experience with <span className="font-semibold text-foreground">{therapistName}</span>
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Star rating */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-muted-foreground mb-3">
              Your Rating
            </label>
            <div className="flex items-center gap-2 mb-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  id={`star-${star}`}
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoveredRating(star)}
                  onMouseLeave={() => setHoveredRating(0)}
                  className="transition-all duration-100 hover:scale-110 focus:outline-none"
                >
                  <Star
                    className={`w-10 h-10 transition-colors duration-100 ${
                      star <= displayRating
                        ? "fill-yellow-400 text-yellow-400"
                        : "text-outline-variant/30"
                    }`}
                  />
                </button>
              ))}
              {displayRating > 0 && (
                <span className={`ml-2 text-sm font-bold ${getRatingColor(displayRating)}`}>
                  {getRatingLabel(displayRating)}
                </span>
              )}
            </div>
          </div>

          {/* Comment */}
          <div>
            <label
              htmlFor="feedback-comment"
              className="block text-xs font-bold uppercase tracking-widest text-muted-foreground mb-3 flex items-center gap-2"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              Written Review <span className="font-normal normal-case tracking-normal text-muted-foreground/60">(optional)</span>
            </label>
            <textarea
              id="feedback-comment"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Share what made this session helpful, or how it could be improved..."
              rows={4}
              maxLength={1000}
              className="w-full bg-surface-container-low border border-outline-variant/30 rounded-2xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/40 resize-none focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
            />
            <p className="text-right text-[10px] text-muted-foreground/50 mt-1">{comment.length}/1000</p>
          </div>

          {/* Error */}
          {error && (
            <p className="text-destructive text-sm font-medium bg-destructive/5 border border-destructive/10 rounded-xl px-4 py-2">
              {error}
            </p>
          )}

          {/* Privacy note */}
          <p className="text-[11px] text-muted-foreground/60 bg-surface-container-low rounded-xl px-4 py-2.5">
            🔒 Your identity remains confidential. Reviews help therapists improve their practice.
          </p>

          {/* Submit */}
          <button
            type="submit"
            id="submit-feedback-btn"
            disabled={loading || rating === 0}
            className="w-full bg-primary text-primary-foreground py-4 rounded-2xl font-bold uppercase tracking-widest text-xs shadow-lg shadow-primary/20 hover:shadow-xl hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:pointer-events-none"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
            {loading ? "Submitting..." : "Submit Review"}
          </button>
        </form>
      </div>
    </div>
  );
}
