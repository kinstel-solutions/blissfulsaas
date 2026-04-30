"use client";

import { useEffect, useState } from "react";
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
import { Mic, MicOff, Video, VideoOff, PhoneOff, Shield, CheckCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import ChatSidebar from "./ChatSidebar";
import NotesSidebar from "./NotesSidebar";
import { uuidToUid } from "@/lib/utils";

export default function VideoRoom({ appId, channel, token, appointmentId, patientName, currentUserId }: any) {
  // Initialize the Agora client inside the component to avoid module scope issues in Next.js
  const [client] = useState(() => AgoraRTC.createClient({ mode: "rtc", codec: "vp8" }));

  // Use a fixed UID derived from the user's ID
  const numericUid = uuidToUid(currentUserId);

  return (
    <AgoraRTCProvider client={client}>
      <VideoCallInner
        appId={appId}
        channel={channel}
        token={token}
        uid={numericUid}
        appointmentId={appointmentId}
        patientName={patientName}
        currentUserId={currentUserId}
      />
    </AgoraRTCProvider>
  );
}

function VideoCallInner({ appId, channel, token, uid, appointmentId, patientName, currentUserId }: any) {
  const router = useRouter();
  const [micOn, setMic] = useState(true);
  const [cameraOn, setCamera] = useState(true);
  const [activeTab, setActiveTab] = useState<'chat' | 'notes'>('notes');

  const { localMicrophoneTrack } = useLocalMicrophoneTrack(true);
  const { localCameraTrack } = useLocalCameraTrack(true);
  
  useJoin({
    appid: appId,
    channel: channel,
    token: token,
    uid: uid,
  });

  usePublish([localMicrophoneTrack, localCameraTrack]);

  // Handle Dynamic Muting/Disabling
  useEffect(() => {
    if (localMicrophoneTrack) {
      localMicrophoneTrack.setMuted(!micOn);
    }
  }, [micOn, localMicrophoneTrack]);

  useEffect(() => {
    if (localCameraTrack) {
      localCameraTrack.setMuted(!cameraOn);
    }
  }, [cameraOn, localCameraTrack]);

  const remoteUsers = useRemoteUsers();

  const handleDisconnect = () => {
    // Navigate back to sessions list
    router.push("/dashboard/appointments");
  };

  const handleComplete = async () => {
    if (!confirm("Are you sure you want to mark this session as completed?")) return;
    try {
      const { api } = await import("@/lib/api");
      await api.sessions.complete(appointmentId);
      router.push("/dashboard/appointments");
      router.refresh();
    } catch (error: any) {
      alert(error.message || "Failed to complete session");
    }
  };

  return (
    <div className="h-full min-h-[600px] lg:h-[calc(100vh-220px)] flex flex-col lg:flex-row gap-4 lg:gap-8 pb-10 lg:pb-0 animate-in fade-in duration-1000">
      <div className="flex flex-col flex-[2] relative gap-4 lg:gap-6 min-h-[400px]">
        <div className="flex-1 bg-slate-950 rounded-3xl lg:rounded-[3.5rem] border border-white/5 overflow-hidden relative shadow-2xl flex flex-col group">
          {/* Background Overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/60 pointer-events-none z-10" />

          {/* Main Video View (Remote User or Placeholder) */}
          <div className="flex-1 relative flex items-center justify-center bg-slate-900">
            {remoteUsers.length > 0 ? (
              <RemoteUser 
                user={remoteUsers[0]} 
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            ) : (
              <div className="flex flex-col items-center gap-6 animate-in fade-in zoom-in duration-1000">
                <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20">
                  <div className="w-12 h-12 rounded-full border-4 border-primary/30 border-t-primary animate-spin" />
                </div>
                <p className="text-white/40 text-sm font-bold uppercase tracking-widest animate-pulse">
                  Waiting for patient to join...
                </p>
              </div>
            )}
          </div>

          {/* Self-Feed (Local Video) */}
          <div className="absolute top-4 right-4 md:top-10 md:right-10 w-28 md:w-48 aspect-video rounded-xl border border-white/20 shadow-2xl overflow-hidden z-20 group/pip hover:scale-105 transition-transform bg-slate-800">
            {localCameraTrack ? (
               <div className={`w-full h-full relative ${!cameraOn ? 'hidden' : 'block'}`}>
                  <LocalVideoTrack track={localCameraTrack} play style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
               </div>
            ) : null}
            {!cameraOn && (
              <div className="w-full h-full flex items-center justify-center text-white/20 bg-slate-900">
                <VideoOff className="w-8 h-8" />
              </div>
            )}
            <div className="absolute bottom-2 left-3 z-30 px-2 py-0.5 rounded-full bg-black/40 backdrop-blur-md text-xs font-bold uppercase tracking-widest text-white">
              You
            </div>
          </div>

          {/* Session Header Overlay */}
          <div className="absolute top-4 left-4 md:top-10 md:left-10 z-20 flex flex-col gap-0.5 md:gap-2 max-w-[60%] md:max-w-none">
            <p className="text-[10px] md:text-xs font-bold uppercase tracking-widest text-white/60">
              Active Consultation
            </p>
            <h2 className="text-lg md:text-3xl font-heading text-white truncate leading-none">
              {patientName || "Joint Session"}
            </h2>
            <div className="flex items-center gap-2 md:gap-3 bg-black/20 backdrop-blur-xl px-2.5 py-1 md:px-4 md:py-2 rounded-full border border-white/10 w-fit">
              <span className="text-[8px] md:text-xs font-bold uppercase tracking-widest text-white/70">Private Consultation Room</span>
            </div>
          </div>

          {/* Call Controls HUD */}
          <div className="absolute bottom-6 md:bottom-12 left-1/2 -translate-x-1/2 z-20 flex items-center gap-3 md:gap-4">
            <button 
              onClick={() => setMic(p => !p)}
              className={`w-12 h-12 md:w-14 md:h-14 rounded-full flex items-center justify-center transition-all shadow-xl border ${
                micOn ? "bg-white/10 text-white border-white/20 hover:bg-white/20" : "bg-red-500 text-white border-red-400"
              }`}
            >
              {micOn ? <Mic className="w-5 h-5 md:w-6 md:h-6" /> : <MicOff className="w-5 h-5 md:w-6 md:h-6" />}
            </button>
            <button 
              onClick={() => setCamera(p => !p)}
              className={`w-12 h-12 md:w-14 md:h-14 rounded-full flex items-center justify-center transition-all shadow-xl border ${
                cameraOn ? "bg-white/10 text-white border-white/20 hover:bg-white/20" : "bg-red-500 text-white border-red-400"
              }`}
            >
              {cameraOn ? <Video className="w-5 h-5 md:w-6 md:h-6" /> : <VideoOff className="w-5 h-5 md:w-6 md:h-6" />}
            </button>
            <button 
              onClick={handleDisconnect}
              className="w-14 h-14 md:w-16 md:h-16 rounded-2xl bg-red-600 text-white border border-red-400/50 flex items-center justify-center shadow-2xl hover:scale-110 active:scale-95 transition-all mx-2 md:mx-4"
            >
              <PhoneOff className="w-6 h-6 md:w-7 md:h-7" />
            </button>
          </div>
        </div>
      </div>

      {/* Persistence / Sidebar (Integrated Chat & Notes) */}
      <aside className="w-full lg:w-96 flex flex-col gap-4 lg:gap-8 h-auto lg:h-full min-h-0 lg:max-h-[calc(100vh-220px)]">
        <div className="bg-white rounded-2xl border border-slate-200 p-4 md:p-10 flex flex-col shadow-sm lg:overflow-hidden min-h-0">
          
          <div className="flex p-1 bg-slate-100 rounded-2xl mb-6">
            <button 
              onClick={() => setActiveTab('notes')}
              className={`flex-1 py-3 text-xs font-bold uppercase tracking-widest rounded-xl transition-all ${
                activeTab === 'notes' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200'
              }`}
            >
              Clinical Notes
            </button>
            <button 
              onClick={() => setActiveTab('chat')}
              className={`flex-1 py-3 text-xs font-bold uppercase tracking-widest rounded-xl transition-all ${
                activeTab === 'chat' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200'
              }`}
            >
              Session Chat
            </button>
          </div>

          <div className="flex-1 flex flex-col min-h-[400px] lg:min-h-0">
            {activeTab === 'chat' ? (
              <ChatSidebar 
                appointmentId={appointmentId}
                currentUserId={currentUserId}
              />
            ) : (
              <NotesSidebar appointmentId={appointmentId} />
            )}
          </div>

          <div className="mt-6 md:mt-10 pt-6 md:pt-10 border-t border-slate-100">
            <button 
              onClick={handleComplete}
              className="w-full h-14 bg-slate-900 text-white font-bold uppercase tracking-widest text-xs rounded-2xl shadow-lg hover:bg-primary transition-all"
            >
              Complete and Close
            </button>
          </div>
        </div>
      </aside>
    </div>
  );
}
