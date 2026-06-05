"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Video } from "lucide-react";

interface JoinCallButtonProps {
  sessionId: string;
  scheduledAt: string;
}

export default function JoinCallButton({ sessionId, scheduledAt }: JoinCallButtonProps) {
  const [timeLeft, setTimeLeft] = useState<number | null>(null);

  useEffect(() => {
    const checkTime = () => {
      const sessionTime = new Date(scheduledAt).getTime();
      const now = new Date().getTime();
      const diff = sessionTime - now;
      setTimeLeft(diff);
    };

    checkTime();
    // Update every second for highly accurate countdown
    const interval = setInterval(checkTime, 1000);
    return () => clearInterval(interval);
  }, [scheduledAt]);

  // If time is not yet computed, disable to prevent hydration layout shift/mismatch
  const isDisabled = timeLeft === null || timeLeft > 5 * 60 * 1000;

  if (isDisabled) {
    let countdownText = "";
    if (timeLeft !== null && timeLeft > 0) {
      const totalSeconds = Math.floor(timeLeft / 1000);
      const minutes = Math.floor(totalSeconds / 60);
      const seconds = totalSeconds % 60;
      
      if (minutes >= 60) {
        const hours = Math.floor(minutes / 60);
        countdownText = `in ${hours}h`;
      } else {
        countdownText = `in ${minutes}m ${seconds}s`;
      }
    }

    return (
      <button
        disabled
        className="w-full sm:w-auto bg-neutral-100 text-neutral-500 border border-neutral-200 px-6 py-3.5 rounded-xl font-extrabold uppercase tracking-widest text-xs sm:text-sm cursor-not-allowed opacity-80 flex flex-col items-center justify-center min-w-[140px] leading-tight"
        title="Join Call will be available 5 minutes before the session starts"
      >
        <span className="flex items-center gap-2">
          <Video className="w-4.5 h-4.5 opacity-60" />
          Join Call
        </span>
        {countdownText && (
          <span className="text-xs sm:text-xs font-bold lowercase tracking-normal text-neutral-600 mt-1">
            {countdownText}
          </span>
        )}
      </button>
    );
  }

  return (
    <Link href={`/dashboard/sessions/${sessionId}/call`} className="w-full sm:w-auto">
      <button className="w-full sm:w-auto bg-emerald-600 text-white hover:bg-emerald-700 px-6 py-3.5 rounded-xl font-extrabold uppercase tracking-widest text-xs sm:text-sm shadow-md transition-all active:scale-95 flex items-center justify-center gap-2">
        <Video className="w-4.5 h-4.5" />
        Join Call
      </button>
    </Link>
  );
}
