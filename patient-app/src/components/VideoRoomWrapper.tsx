"use client";

import dynamic from "next/dynamic";

const VideoRoom = dynamic(() => import("@/components/VideoRoom"), { 
  ssr: false,
  loading: () => (
    <div className="flex-1 bg-slate-900 rounded-2xl flex items-center justify-center border border-white/5 shadow-2xl min-h-[500px]">
      <div className="flex flex-col items-center gap-6">
        <div className="w-12 h-12 rounded-full border-4 border-primary/30 border-t-primary animate-spin" />
        <p className="text-white/40 text-xs font-bold uppercase tracking-widest animate-pulse">
          Connecting to private consultation...
        </p>
      </div>
    </div>
  )
});

export default function VideoRoomWrapper(props: any) {
  return <VideoRoom {...props} />;
}
