"use client";

import { useEffect, useState, useRef } from "react";
import AgoraRTC, {
  AgoraRTCProvider,
  useLocalCameraTrack,
  useLocalMicrophoneTrack,
  useRemoteUsers,
  RemoteUser,
  LocalVideoTrack,
  useJoin,
  usePublish,
  useRTCClient,
} from "agora-rtc-react";
import { Mic, MicOff, Video, VideoOff, PhoneOff, Shield, CheckCircle, Maximize2, Minimize2, Settings2 } from "lucide-react";
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

const getEncoderConfig = (quality: "360p" | "480p" | "720p" | "1080p", fps: number) => {
  switch (quality) {
    case "360p":
      return { width: 640, height: 360, frameRate: fps, bitrateMax: 600, bitrateMin: 150 };
    case "480p":
      return { width: 848, height: 480, frameRate: fps, bitrateMax: 1000, bitrateMin: 250 };
    case "720p":
      return { width: 1280, height: 720, frameRate: fps, bitrateMax: 1500, bitrateMin: 500 };
    case "1080p":
      return { width: 1920, height: 1080, frameRate: fps, bitrateMax: 2500, bitrateMin: 800 };
    default:
      return { width: 1280, height: 720, frameRate: fps, bitrateMax: 1500, bitrateMin: 500 };
  }
};

function VideoCallInner({ appId, channel, token, uid, appointmentId, patientName, currentUserId }: any) {
  const router = useRouter();
  const [micOn, setMic] = useState(true);
  const [cameraOn, setCamera] = useState(true);
  const [activeTab, setActiveTab] = useState<'chat' | 'notes'>('notes');
  const [sessionEnded, setSessionEnded] = useState(false);
  const [showEndingWarning, setShowEndingWarning] = useState(false);
  const [videoQuality, setVideoQuality] = useState<"360p" | "480p" | "720p" | "1080p">("720p");
  const [frameRate, setFrameRate] = useState<15 | 24 | 30>(30);
  const [showQualityMenu, setShowQualityMenu] = useState(false);
  const client = useRTCClient();

  const [isFullscreen, setIsFullscreen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!(document.fullscreenElement || (document as any).webkitFullscreenElement));
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    document.addEventListener("webkitfullscreenchange", handleFullscreenChange);
    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
      document.removeEventListener("webkitfullscreenchange", handleFullscreenChange);
    };
  }, []);

  const toggleFullscreen = async () => {
    if (!containerRef.current) return;
    try {
      const elem = containerRef.current;
      if (!document.fullscreenElement && !(document as any).webkitFullscreenElement) {
        if (elem.requestFullscreen) {
          await elem.requestFullscreen();
        } else if ((elem as any).webkitRequestFullscreen) {
          await (elem as any).webkitRequestFullscreen();
        }
      } else {
        if (document.exitFullscreen) {
          await document.exitFullscreen();
        } else if ((document as any).webkitExitFullscreen) {
          await (document as any).webkitExitFullscreen();
        }
      }
    } catch (err) {
      console.error("Error attempting to toggle fullscreen:", err);
    }
  };

  const { localMicrophoneTrack, error: micError } = useLocalMicrophoneTrack(!sessionEnded);
  const encoderConfig = getEncoderConfig(videoQuality, frameRate);
  const { localCameraTrack, error: camError } = useLocalCameraTrack(!sessionEnded, {
    encoderConfig,
  });

  const { isConnected, error: joinError } = useJoin(
    {
      appid: appId,
      channel: channel,
      token: token,
      uid: uid,
    },
    !sessionEnded
  );

  usePublish([localMicrophoneTrack, localCameraTrack]);

  // Explicitly close tracks when session ends or component unmounts
  useEffect(() => {
    if (sessionEnded) {
      localCameraTrack?.stop();
      localCameraTrack?.close();
      localMicrophoneTrack?.stop();
      localMicrophoneTrack?.close();
    }
  }, [sessionEnded, localCameraTrack, localMicrophoneTrack]);

  useEffect(() => {
    return () => {
      localCameraTrack?.stop();
      localCameraTrack?.close();
      localMicrophoneTrack?.stop();
      localMicrophoneTrack?.close();
    };
  }, [localCameraTrack, localMicrophoneTrack]);

  // Handle Dynamic Muting/Disabling - Use setEnabled to turn off hardware instead of just muting
  useEffect(() => {
    if (localMicrophoneTrack) {
      localMicrophoneTrack.setEnabled(micOn).catch(console.error);
    }
  }, [micOn, localMicrophoneTrack]);

  useEffect(() => {
    if (localCameraTrack) {
      localCameraTrack.setEnabled(cameraOn).catch(console.error);
    }
  }, [cameraOn, localCameraTrack]);

  // Live quality switching — no track recreation needed
  const handleQualityChange = async (quality: "360p" | "480p" | "720p" | "1080p") => {
    setVideoQuality(quality);
    if (localCameraTrack) {
      const config = getEncoderConfig(quality, frameRate);
      await localCameraTrack.setEncoderConfiguration(config as any).catch(console.error);
    }
  };

  const handleFrameRateChange = async (fps: 15 | 24 | 30) => {
    setFrameRate(fps);
    setShowQualityMenu(false);
    if (localCameraTrack) {
      const config = getEncoderConfig(videoQuality, fps);
      await localCameraTrack.setEncoderConfiguration(config as any).catch(console.error);
      
      const mediaStreamTrack = localCameraTrack.getMediaStreamTrack();
      if (mediaStreamTrack) {
        await mediaStreamTrack.applyConstraints({
          frameRate: { ideal: fps }
        }).catch(console.error);
      }
    }
  };

  // Auto-Complete: Listen for Agora token expiry events
  useEffect(() => {
    if (!client) return;

    const handleTokenWillExpire = () => {
      setShowEndingWarning(true);
    };

    const handleTokenExpired = () => {
      setShowEndingWarning(false);
      setSessionEnded(true);
      setTimeout(() => router.push(`/dashboard/appointments/${appointmentId}`), 3000);
    };

    const handleUserLeft = (user: any, reason: string) => {
      if (reason === "Quit") {
        setSessionEnded(true);
        setTimeout(() => router.push(`/dashboard/appointments/${appointmentId}`), 3000);
      }
    };

    client.on("token-privilege-will-expire", handleTokenWillExpire);
    client.on("token-privilege-did-expire", handleTokenExpired);
    client.on("user-left", handleUserLeft);

    return () => {
      client.off("token-privilege-will-expire", handleTokenWillExpire);
      client.off("token-privilege-did-expire", handleTokenExpired);
      client.off("user-left", handleUserLeft);
    };
  }, [client, router, appointmentId]);

  const remoteUsers = useRemoteUsers();

  const handleDisconnect = () => {
    // Navigate back to sessions list
    setSessionEnded(true);
    router.push(`/dashboard/appointments/${appointmentId}`);
  };

  // --- Session Ended Screen ---
  if (sessionEnded) {
    return (
      <div className="h-full min-h-[600px] lg:h-[calc(100vh-220px)] flex items-center justify-center">
        <div className="flex flex-col items-center gap-6 text-center">
          <div className="w-20 h-20 rounded-full bg-green-500/10 flex items-center justify-center border border-green-500/30">
            <CheckCircle className="w-10 h-10 text-green-400" />
          </div>
          <p className="text-white font-bold text-xl tracking-tight">Session Time Elapsed</p>
          <p className="text-white/50 text-sm">The allotted session time has ended. Redirecting you to appointments...</p>
        </div>
      </div>
    );
  }

  const handleComplete = async () => {
    if (!confirm("Are you sure you want to mark this session as completed?")) return;
    try {
      const { api } = await import("@/lib/api");
      await api.sessions.complete(appointmentId);
      setSessionEnded(true);
      router.push("/dashboard/appointments");
      router.refresh();
    } catch (error: any) {
      alert(error.message || "Failed to complete session");
    }
  };

  return (
    <div className="h-full min-h-[600px] lg:h-[calc(100vh-220px)] flex flex-col lg:flex-row gap-4 lg:gap-8 pb-10 lg:pb-8 animate-in fade-in duration-1000">
      <div className="flex flex-col flex-[2] relative gap-4 lg:gap-6 h-[60vh] min-h-[500px] lg:h-auto lg:min-h-0">
        <div
          ref={containerRef}
          className={`flex-1 bg-slate-950 border border-white/5 overflow-hidden relative shadow-2xl flex flex-col group ${isFullscreen ? "rounded-none" : "rounded-3xl lg:rounded-[3.5rem]"
            }`}
        >
          {/* Background Overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/60 pointer-events-none z-10" />

          {/* Session Ending Warning Banner */}
          {showEndingWarning && (
            <div className="absolute top-0 inset-x-0 z-50 bg-amber-500/90 backdrop-blur-sm text-white text-center text-xs font-bold uppercase tracking-widest py-3 animate-in slide-in-from-top duration-500">
              ⚠️ Session ending in 30 seconds
            </div>
          )}

          {/* Main Video View (Remote User or Placeholder) */}
          <div className="flex-1 relative flex items-center justify-center bg-slate-900">
            {joinError ? (
              <div className="flex flex-col items-center gap-4 text-center">
                <Shield className="w-12 h-12 text-red-500 mb-2" />
                <p className="text-red-400 font-bold uppercase tracking-widest text-sm">Connection Failed</p>
                <p className="text-white/60 text-xs">Could not connect to the secure room. Please try refreshing.</p>
              </div>
            ) : (isConnected && !sessionEnded && remoteUsers.length > 0) ? (
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
                  {isConnected ? "Waiting for patient to join..." : "Connecting to secure room..."}
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
            {camError && (
              <div className="absolute inset-0 bg-slate-900/90 flex items-center justify-center text-center p-2">
                <span className="text-[10px] text-red-400 font-bold uppercase tracking-wider">Camera Denied</span>
              </div>
            )}
            <div className="absolute bottom-2 left-3 z-30 px-2 py-0.5 rounded-full bg-black/40 backdrop-blur-md text-xs font-bold uppercase tracking-widest text-white">
              You
            </div>
          </div>

          <div className="absolute top-4 left-4 md:top-10 md:left-10 z-20 flex flex-col bg-transparent px-3 py-2 md:px-4 md:py-3 rounded-2xl  w-fit text-left">
            <span className="text-[10px] md:text-xs font-bold uppercase tracking-widest text-white">The</span>
            <span className="text-[10px] md:text-xs font-bold uppercase tracking-widest text-white">Blissful</span>
            <span className="text-[10px] md:text-xs font-bold uppercase tracking-widest text-white">Station</span>
          </div>

          {/* Call Controls HUD */}
          <div className="absolute bottom-6 md:bottom-12 left-1/2 -translate-x-1/2 z-20 flex items-center gap-3 md:gap-4">
            <button
              onClick={() => setMic(p => !p)}
              className={`w-12 h-12 md:w-14 md:h-14 rounded-full flex items-center justify-center transition-all shadow-xl border ${micOn ? "bg-white/10 text-white border-white/20 hover:bg-white/20" : "bg-red-500 text-white border-red-400"
                }`}
            >
              {micOn ? <Mic className="w-5 h-5 md:w-6 md:h-6" /> : <MicOff className="w-5 h-5 md:w-6 md:h-6" />}
            </button>
            <button
              onClick={() => setCamera(p => !p)}
              className={`w-12 h-12 md:w-14 md:h-14 rounded-full flex items-center justify-center transition-all shadow-xl border ${cameraOn ? "bg-white/10 text-white border-white/20 hover:bg-white/20" : "bg-red-500 text-white border-red-400"
                }`}
            >
              {cameraOn ? <Video className="w-5 h-5 md:w-6 md:h-6" /> : <VideoOff className="w-5 h-5 md:w-6 md:h-6" />}
            </button>

            {/* Video Quality Selector */}
            <div className="relative">
              <button
                onClick={() => setShowQualityMenu(prev => !prev)}
                className="w-12 h-12 md:w-14 md:h-14 rounded-full flex flex-col items-center justify-center gap-0.5 transition-all shadow-xl border bg-white/10 text-white border-white/20 hover:bg-white/20"
                title="Video Quality"
              >
                <Settings2 className="w-4 h-4" />
                <span className="text-[9px] font-bold uppercase tracking-wide opacity-80">
                  {videoQuality}·{frameRate}
                </span>
              </button>
              {showQualityMenu && (
                <div className="absolute bottom-16 left-1/2 -translate-x-1/2 bg-slate-900/95 backdrop-blur-md border border-white/10 rounded-2xl shadow-2xl overflow-hidden min-w-[130px] animate-in fade-in zoom-in-95 duration-200">
                  <p className="text-[9px] font-bold uppercase tracking-widest text-white/40 px-4 pt-3 pb-1">Resolution</p>
                  {(["360p", "480p", "720p", "1080p"] as const).map((q) => (
                    <button
                      key={q}
                      onClick={() => handleQualityChange(q)}
                      className={`w-full px-4 py-2.5 text-left text-sm font-bold tracking-wide transition-colors ${
                        videoQuality === q
                          ? "text-primary bg-primary/10"
                          : "text-white hover:bg-white/10"
                      }`}
                    >
                      {q === "720p" ? `${q} ★` : q}
                    </button>
                  ))}
                  <div className="border-t border-white/10 mt-1" />
                  <p className="text-[9px] font-bold uppercase tracking-widest text-white/40 px-4 pt-2 pb-1">Frame Rate</p>
                  {([15, 24, 30] as const).map((fps) => (
                    <button
                      key={fps}
                      onClick={() => handleFrameRateChange(fps)}
                      className={`w-full px-4 py-2.5 text-left text-sm font-bold tracking-wide transition-colors ${
                        frameRate === fps
                          ? "text-primary bg-primary/10"
                          : "text-white hover:bg-white/10"
                      }`}
                    >
                      {fps} fps{fps === 30 ? " ★" : ""}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <button
              onClick={toggleFullscreen}
              className={`w-12 h-12 md:w-14 md:h-14 rounded-full flex items-center justify-center transition-all shadow-xl border ${isFullscreen ? "bg-primary text-white border-primary/45 hover:bg-primary/80" : "bg-white/10 text-white border-white/20 hover:bg-white/20"
                }`}
              title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
            >
              {isFullscreen ? <Minimize2 className="w-5 h-5 md:w-6 md:h-6" /> : <Maximize2 className="w-5 h-5 md:w-6 md:h-6" />}
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
              className={`flex-1 py-3 text-xs font-bold uppercase tracking-widest rounded-xl transition-all ${activeTab === 'notes' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200'
                }`}
            >
              Clinical Notes
            </button>
            <button
              onClick={() => setActiveTab('chat')}
              className={`flex-1 py-3 text-xs font-bold uppercase tracking-widest rounded-xl transition-all ${activeTab === 'chat' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200'
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
        </div>
      </aside>
    </div>
  );
}
