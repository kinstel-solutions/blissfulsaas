"use client";

import { useEffect, useState } from "react";
import { Clock } from "lucide-react";

interface SessionCountdownLabelProps {
  scheduledAt: string;
}

export default function SessionCountdownLabel({ scheduledAt }: SessionCountdownLabelProps) {
  const [timeLeft, setTimeLeft] = useState<number | null>(null);

  useEffect(() => {
    const tick = () => {
      const diff = new Date(scheduledAt).getTime() - Date.now();
      setTimeLeft(diff);
    };
    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [scheduledAt]);

  if (timeLeft === null || timeLeft <= 0) return null;

  const totalSeconds = Math.floor(timeLeft / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  let label: string;
  if (hours >= 24) {
    const days = Math.floor(hours / 24);
    label = `in ${days}d ${hours % 24}h`;
  } else if (hours >= 1) {
    label = `in ${hours}h ${minutes}m`;
  } else if (minutes >= 1) {
    label = `in ${minutes}m ${seconds}s`;
  } else {
    label = `in ${seconds}s`;
  }

  const isImminent = timeLeft <= 5 * 60 * 1000; // within 5 min

  return (
    <span
      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border ${
        isImminent
          ? "bg-emerald-50 text-emerald-700 border-emerald-200 animate-pulse"
          : "bg-amber-50 text-amber-700 border-amber-200"
      }`}
    >
      <Clock className="w-3 h-3" />
      {label}
    </span>
  );
}
