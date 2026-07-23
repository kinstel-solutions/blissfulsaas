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
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

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
  const [activeTab, setActiveTab] = useState<'chat' | 'notes'>('chat');
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
    const handleSessionCompleting = () => {
      setSessionEnded(true);
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    document.addEventListener("webkitfullscreenchange", handleFullscreenChange);
    window.addEventListener("session-completing", handleSessionCompleting);

    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
      document.removeEventListener("webkitfullscreenchange", handleFullscreenChange);
      window.removeEventListener("session-completing", handleSessionCompleting);
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

      const mediaStreamTrack = localCameraTrack.getMediaStreamTrack();
      if (mediaStreamTrack) {
        await mediaStreamTrack.applyConstraints({
          width: { ideal: config.width },
          height: { ideal: config.height }
        }).catch(console.error);
      }
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



    client.on("token-privilege-will-expire", handleTokenWillExpire);
    client.on("token-privilege-did-expire", handleTokenExpired);


    return () => {
      client.off("token-privilege-will-expire", handleTokenWillExpire);
      client.off("token-privilege-did-expire", handleTokenExpired);

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
    <div className="h-full min-h-0 lg:min-h-[600px] lg:h-[calc(100vh-220px)] flex flex-col lg:flex-row gap-4 lg:gap-8 pb-4 lg:pb-6 -mx-5 sm:mx-0 animate-in fade-in duration-1000">
      <div className="flex flex-col flex-[2] relative gap-4 lg:gap-6 h-[45vh] sm:h-[55vh] min-h-[450px] lg:h-auto lg:min-h-0">
        <div
          ref={containerRef}
          className={`flex-1 bg-slate-950 border border-white/5 overflow-hidden relative shadow-2xl flex flex-col group ${isFullscreen ? "rounded-none" : "rounded-xl"
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
                <p className="text-white/60 text-base">Could not connect to the secure room. Please try refreshing.</p>
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
          <div className="absolute top-4 right-4 md:top-5 md:right-5 w-44 sm:w-64 md:w-80 aspect-video rounded-xl border border-white/20 shadow-2xl overflow-hidden z-20 group/pip hover:scale-105 transition-transform bg-slate-800">
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

          <div className="absolute top-4 left-4 md:top-5 md:left-5 z-20 flex flex-col bg-transparent px-2 md:px-4 py-2 md:py-3 rounded-2xl text-left">
            <span className="text-[10px] md:text-xs font-bold uppercase tracking-widest text-white leading-tight">The</span>
            <span className="text-[10px] md:text-xs font-bold uppercase tracking-widest text-white leading-tight">Blissful</span>
            <span className="text-[10px] md:text-xs font-bold uppercase tracking-widest text-white leading-tight">Station</span>
          </div>

          {/* Call Controls HUD */}
          <div className="absolute bottom-4 md:bottom-5 left-1/2 -translate-x-1/2 z-30 flex items-center justify-center gap-1.5 sm:gap-3 w-max max-w-[96%] px-2 sm:px-4 py-2.5 bg-white/5 backdrop-blur-md border border-white/10 rounded-[2rem] shadow-2xl animate-in slide-in-from-bottom-10 duration-700">
            <Button
              variant="ghost"
              onClick={() => setMic(p => !p)}
              className={`w-12 h-12 sm:w-14 sm:h-14 shrink-0 rounded-full flex items-center justify-center transition-all shadow-lg border p-0 ${micOn ? "bg-white/10 text-white border-white/10 hover:bg-white/20 hover:border-white/30" : "bg-red-500/90 text-white border-red-400 hover:bg-red-500"
                }`}
            >
              {micOn ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
            </Button>

            <Button
              variant="ghost"
              onClick={() => setCamera(p => !p)}
              className={`w-12 h-12 sm:w-14 sm:h-14 shrink-0 rounded-full flex items-center justify-center transition-all shadow-lg border p-0 ${cameraOn ? "bg-white/10 text-white border-white/10 hover:bg-white/20 hover:border-white/30" : "bg-red-500/90 text-white border-red-400 hover:bg-red-500"
                }`}
            >
              {cameraOn ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
            </Button>

            {/* Video Quality Selector */}
            <div className="relative shrink-0">
              <Button
                variant="ghost"
                onClick={() => setShowQualityMenu(prev => !prev)}
                className="w-12 h-12 sm:w-14 sm:h-14 rounded-full flex flex-col items-center justify-center gap-0.5 transition-all shadow-lg border bg-white/10 text-white border-white/10 hover:bg-white/20 hover:border-white/30 shrink-0"
                title="Video Quality"
              >
                <Settings2 className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" />
                <span className="text-[8px] sm:text-[9px] font-bold uppercase tracking-wide opacity-80 leading-none whitespace-nowrap">
                  {videoQuality}
                </span>
              </Button>
              {showQualityMenu && (
                <div className="absolute bottom-[4.5rem] left-1/2 -translate-x-1/2 bg-slate-900/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden min-w-[140px] animate-in fade-in zoom-in-95 duration-200">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-white/50 px-4 pt-3 pb-2 border-b border-white/10">Resolution</p>
                  {(["360p", "480p", "720p", "1080p"] as const).map((q) => (
                    <Button
                      variant="ghost"
                      key={q}
                      onClick={() => handleQualityChange(q)}
                      className={`w-full px-4 py-2.5 text-left text-sm font-semibold tracking-wide transition-colors rounded-none h-auto justify-start border-none ${videoQuality === q
                        ? "text-primary bg-primary/10"
                        : "text-white hover:bg-white/10 hover:text-white"
                        }`}
                    >
                      {q === "720p" ? `${q} ★` : q}
                    </Button>
                  ))}
                  <p className="text-[10px] font-bold uppercase tracking-widest text-white/50 px-4 pt-3 pb-2 border-b border-white/10 border-t mt-1">Frame Rate</p>
                  {([15, 24, 30] as const).map((fps) => (
                    <Button
                      variant="ghost"
                      key={fps}
                      onClick={() => handleFrameRateChange(fps)}
                      className={`w-full px-4 py-2.5 text-left text-sm font-semibold tracking-wide transition-colors rounded-none h-auto justify-start border-none ${frameRate === fps
                        ? "text-primary bg-primary/10"
                        : "text-white hover:bg-white/10 hover:text-white"
                        }`}
                    >
                      {fps} fps{fps === 30 ? " ★" : ""}
                    </Button>
                  ))}
                </div>
              )}
            </div>

            <Button
              variant="ghost"
              onClick={toggleFullscreen}
              className={`w-12 h-12 sm:w-14 sm:h-14 shrink-0 rounded-full flex items-center justify-center transition-all shadow-lg border p-0 ${isFullscreen ? "bg-primary text-white border-primary/45 hover:bg-primary/80" : "bg-white/10 text-white border-white/10 hover:bg-white/20 hover:border-white/30"
                }`}
              title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
            >
              {isFullscreen ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
            </Button>

            <div className="w-px h-8 sm:h-10 bg-white/20 mx-1 sm:mx-2 block"></div>

            <Button
              variant="ghost"
              onClick={handleDisconnect}
              className="w-14 h-12 sm:w-16 sm:h-14 shrink-0 rounded-2xl sm:rounded-[1.2rem] bg-red-600 hover:bg-red-500 text-white border border-red-500 flex items-center justify-center shadow-lg shadow-red-600/20 hover:scale-105 active:scale-95 transition-all ml-1 sm:ml-2 p-0"
              title="End Session"
            >
              <PhoneOff className="w-5 h-5 sm:w-6 sm:h-6" />
            </Button>
          </div>
        </div>
      </div>

      {/* Persistence / Sidebar (Integrated Chat & Notes) */}
      <aside className="w-full lg:w-96 flex flex-col gap-4 lg:gap-8 h-[480px] sm:h-[520px] lg:h-full min-h-0 lg:max-h-[calc(100vh-220px)]">
        <Card className="p-4 md:p-6 flex flex-col overflow-hidden min-h-0 h-full flex-1">

          <div className="flex p-1 bg-slate-100 rounded-xl mb-4 shrink-0">
            <Button
              variant="ghost"
              onClick={() => setActiveTab('chat')}
              className={`flex-1 py-3 text-xs font-bold uppercase tracking-widest rounded-lg transition-all shadow-none h-auto ${activeTab === 'chat' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200'
                }`}
            >
              Session Chat
            </Button>
            <Button
              variant="ghost"
              onClick={() => setActiveTab('notes')}
              className={`flex-1 py-3 text-xs font-bold uppercase tracking-widest rounded-lg transition-all shadow-none h-auto ${activeTab === 'notes' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200'
                }`}
            >
              Clinical Notes
            </Button>
          </div>

          <div className="flex-1 flex flex-col min-h-0 h-full overflow-hidden">
            {activeTab === 'chat' ? (
              <ChatSidebar
                appointmentId={appointmentId}
                currentUserId={currentUserId}
              />
            ) : (
              <NotesSidebar appointmentId={appointmentId} />
            )}
          </div>
        </Card>
      </aside>
    </div>
  );
}
