"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Video } from "lucide-react";
import { Button } from "@/components/ui/button";

interface JoinCallButtonProps {
  sessionId: string;
  scheduledAt: string;
  status: string;
}

export default function JoinCallButton({ sessionId, scheduledAt, status }: JoinCallButtonProps) {
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

  // If session is not confirmed yet, block joining regardless of time
  if (status === "PENDING") {
    return (
      <div className="w-full flex items-center justify-center gap-2 px-6 h-14 bg-amber-50/50 border border-amber-200/80 rounded-xl text-amber-700 font-bold uppercase tracking-widest text-xs">
        <Video className="w-4 h-4 opacity-60 shrink-0" />
        <span>Awaiting Confirmation</span>
      </div>
    );
  }

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
      <Button
        disabled
        variant="outline"
        className="w-full h-14 rounded-xl font-bold uppercase tracking-widest text-xs flex items-center justify-center gap-2"
        title="Join Call will be available 5 minutes before the session starts"
      >
        <Video className="w-4 h-4 opacity-50 shrink-0" />
        <span>Join Call {countdownText ? `(${countdownText})` : ""}</span>
      </Button>
    );
  }

  return (
    <Link href={`/dashboard/sessions/${sessionId}/call`} className="w-full">
      <Button className="w-full h-14 rounded-xl font-bold uppercase tracking-widest text-xs active:scale-[0.98] flex items-center justify-center gap-2">
        <Video className="w-4 h-4 text-primary-foreground shrink-0" />
        <span>Join Call</span>
      </Button>
    </Link>
  );
}
