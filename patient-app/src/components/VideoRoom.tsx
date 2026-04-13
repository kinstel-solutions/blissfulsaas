"use client";

import { useState } from "react";
import AgoraRTC, {
  AgoraRTCProvider,
  useLocalCameraTrack,
  useLocalMicrophoneTrack,
  useRemoteUsers,
  RemoteUser,
  LocalVideoTrack,
  useJoin,
  usePublish,
} from "agora-rtc-react";
import { Mic, MicOff, Video, VideoOff, PhoneOff, Shield, MessageSquare } from "lucide-react";
import { useRouter } from "next/navigation";
import ChatSidebar from "./ChatSidebar";

const client = AgoraRTC.createClient({ mode: "rtc", codec: "vp8" });

export default function VideoRoom({ appId, channel, token, uid, appointmentId, currentUserId }: any) {
  return (
    <AgoraRTCProvider client={client}>
      <VideoCallInner
        appId={appId}
        channel={channel}
        token={token}
        uid={uid}
        appointmentId={appointmentId}
        currentUserId={currentUserId}
      />
    </AgoraRTCProvider>
  );
}

function VideoCallInner({ appId, channel, token, uid, appointmentId, currentUserId }: any) {
  const router = useRouter();
  const [micOn, setMic] = useState(true);
  const [cameraOn, setCamera] = useState(true);
  const [chatOpen, setChatOpen] = useState(false);

  const { localMicrophoneTrack } = useLocalMicrophoneTrack(micOn);
  const { localCameraTrack } = useLocalCameraTrack(cameraOn);
  
  useJoin({ appid: appId, channel, token, uid: uid || null });
  usePublish([localMicrophoneTrack, localCameraTrack]);

  const remoteUsers = useRemoteUsers();

  return (
    <div className="relative h-full w-full bg-slate-950 rounded-[3rem] overflow-hidden shadow-2xl border border-white/5 flex flex-col group">
      {/* Background Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/60 pointer-events-none z-10" />

      {/* Main Video */}
      <div className="flex-1 relative flex items-center justify-center bg-slate-900">
        {remoteUsers.length > 0 ? (
          <RemoteUser 
            user={remoteUsers[0]} 
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        ) : (
          <div className="flex flex-col items-center gap-6 animate-in fade-in zoom-in duration-1000">
            <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20">
              <div className="w-12 h-12 rounded-full border-4 border-primary/30 border-t-primary animate-spin" />
            </div>
            <p className="text-white/40 text-sm font-bold uppercase tracking-widest animate-pulse">
              Waiting for therapist to join...
            </p>
          </div>
        )}
      </div>

      {/* Self-Feed PiP */}
      <div className="absolute top-8 right-8 w-40 md:w-56 aspect-video rounded-2xl md:rounded-3xl border border-white/20 shadow-2xl overflow-hidden z-30 hover:scale-105 transition-transform bg-slate-800">
        {cameraOn ? (
          <LocalVideoTrack track={localCameraTrack} play style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-white/20 bg-slate-900">
            <VideoOff className="w-8 h-8" />
          </div>
        )}
        <div className="absolute bottom-2 left-3 z-40 px-2 py-0.5 rounded-full bg-black/40 backdrop-blur-md text-xs font-bold uppercase tracking-widest text-white">
          You (Patient)
        </div>
      </div>

      {/* Secure Banner */}
      <div className="absolute top-8 left-8 z-30 flex items-center gap-3 bg-black/20 backdrop-blur-xl px-4 py-2 rounded-full border border-white/10">
        <Shield className="w-3 h-3 text-green-400" />
        <span className="text-xs font-bold uppercase tracking-widest text-white/70">HIPAA Protected</span>
      </div>

      {/* Call Controls HUD */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-30 flex items-center gap-4 animate-in slide-in-from-bottom-10 duration-700">
        <button
          onClick={() => setMic((p) => !p)}
          className={`w-14 h-14 rounded-full flex items-center justify-center transition-all shadow-xl border ${
            micOn ? "bg-white/10 text-white border-white/20 hover:bg-white/20" : "bg-red-500 text-white border-red-400"
          }`}
        >
          {micOn ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
        </button>

        <button
          onClick={() => setCamera((p) => !p)}
          className={`w-14 h-14 rounded-full flex items-center justify-center transition-all shadow-xl border ${
            cameraOn ? "bg-white/10 text-white border-white/20 hover:bg-white/20" : "bg-red-500 text-white border-red-400"
          }`}
        >
          {cameraOn ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
        </button>

        <button
          onClick={() => router.push("/dashboard/sessions")}
          className="w-16 h-16 rounded-2xl bg-red-600 text-white border border-red-400/50 flex items-center justify-center shadow-2xl hover:scale-110 active:scale-95 transition-all mx-4"
        >
          <PhoneOff className="w-7 h-7" />
        </button>

        <button
          onClick={() => setChatOpen((p) => !p)}
          className={`w-14 h-14 rounded-full flex items-center justify-center transition-all shadow-xl border ${
            chatOpen ? "bg-primary text-white border-primary/40" : "bg-white/10 text-white border-white/20 hover:bg-white/20"
          }`}
        >
          <MessageSquare className="w-5 h-5" />
        </button>
      </div>

      {/* Chat Overlay */}
      {currentUserId && (
        <ChatSidebar
          appointmentId={appointmentId}
          currentUserId={currentUserId}
          isOpen={chatOpen}
          onClose={() => setChatOpen(false)}
        />
      )}
    </div>
  );
}
