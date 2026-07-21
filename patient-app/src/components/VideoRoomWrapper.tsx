"use client";

import dynamic from "next/dynamic";

const VideoRoom = dynamic(() => import("@/components/VideoRoom"), { 
  ssr: false,
  loading: () => (
    <div className="flex-1 bg-slate-900 rounded-2xl flex items-center justify-center border border-white/5 shadow-2xl min-h-[500px]">
      <div className="flex flex-col items-center gap-6">
        <div className="w-12 h-12 rounded-full border-4 border-primary/30 border-t-primary animate-spin" />
        <p className="text-white/40 text-base font-bold uppercase tracking-widest animate-pulse">
          Connecting to private consultation...
        </p>
      </div>
    </div>
  )
});

import { useEffect } from "react";
import { fetchWithAuth } from "@/lib/api";

export default function VideoRoomWrapper(props: any) {
  useEffect(() => {
    if (!props.appointmentId) return;
    
    // Initial ping
    fetchWithAuth(`/sessions/${props.appointmentId}/ping`, { method: "POST" }).catch(() => {});
    
    // Ping every 10 seconds to maintain presence
    const interval = setInterval(() => {
      fetchWithAuth(`/sessions/${props.appointmentId}/ping`, { method: "POST" }).catch(() => {});
    }, 10000);
    
    return () => clearInterval(interval);
  }, [props.appointmentId]);

  return <VideoRoom {...props} />;
}
