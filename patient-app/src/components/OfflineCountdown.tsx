"use client";

import { useEffect, useState } from "react";
import { Building2 } from "lucide-react";

interface OfflineCountdownProps {
  scheduledAt: string;
  status: string;
  clinicAddress?: string;
}

export default function OfflineCountdown({ scheduledAt, status, clinicAddress }: OfflineCountdownProps) {
  const [timeLeft, setTimeLeft] = useState<number | null>(null);

  useEffect(() => {
    const checkTime = () => {
      const sessionTime = new Date(scheduledAt).getTime();
      const now = new Date().getTime();
      const diff = sessionTime - now;
      setTimeLeft(diff);
    };

    checkTime();
    const interval = setInterval(checkTime, 1000);
    return () => clearInterval(interval);
  }, [scheduledAt]);

  if (status === "PENDING") {
    return (
      <div className="flex items-center gap-3">
        <Building2 className="w-6 h-6 shrink-0" />
        <div>
          <p className="text-sm font-bold uppercase tracking-widest">
            In-Person Visit
          </p>
          <p className="text-xs font-semibold text-amber-600 mt-1 uppercase tracking-wider">
            Awaiting Confirmation
          </p>
        </div>
      </div>
    );
  }

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
  } else if (timeLeft !== null && timeLeft <= 0) {
    countdownText = "Happening Now";
  }

  return (
    <div className="flex items-center gap-3">
      <Building2 className="w-6 h-6 shrink-0" />
      <div>
        <p className="text-sm font-bold uppercase tracking-widest flex flex-wrap items-center gap-2">
          <span>In-Person Visit</span>
          {countdownText && (
            <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full font-bold uppercase tracking-wider shrink-0 normal-case">
              {countdownText}
            </span>
          )}
        </p>
        {clinicAddress && (
          <p className="text-sm font-medium text-primary/70 mt-1">
            {clinicAddress}
          </p>
        )}
      </div>
    </div>
  );
}
