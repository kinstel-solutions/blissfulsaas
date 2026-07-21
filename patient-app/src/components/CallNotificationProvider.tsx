'use client';

import { createContext, useContext, useEffect, useRef, useState } from 'react';
import { fetchWithAuth } from '@/lib/api';
import IncomingCallScreen from './IncomingCallScreen';
import MinimizedCallBanner from './MinimizedCallBanner';
import { usePathname, useRouter } from 'next/navigation';

export const CallContext = createContext<any>(null);

export function CallNotificationProvider({ children, userId }: { children: React.ReactNode; userId: string }) {
  const [incomingCall, setIncomingCall] = useState<any>(null);
  const [isMinimized, setIsMinimized] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  // Store current pathname in a ref to prevent stale closures in BroadcastChannel listener
  const pathnameRef = useRef(pathname);
  useEffect(() => {
    pathnameRef.current = pathname;
  }, [pathname]);

  const stopRingtone = () => {
    const audio = (window as any)._currentRingtone;
    if (audio) {
      audio.pause();
      audio.currentTime = 0;
      (window as any)._currentRingtone = null;
    }
  };

  const playRingtone = () => {
    try {
      stopRingtone(); // Stop any existing ringtone instance before starting a new one
      const audio = new Audio('/ringtone.mp3');
      audio.loop = true;
      audio.play().catch((err) => {
        console.warn('Autoplay blocked. User needs to interact with the page first.', err);
      });
      
      // Stop ringing after 3 minutes (180,000 ms)
      setTimeout(() => {
        audio.pause();
        audio.currentTime = 0;
      }, 180000);
      
      (window as any)._currentRingtone = audio;
    } catch (e) {
      console.error('Audio playback error', e);
    }
  };

  useEffect(() => {
    if (!userId) return;

    // 1. Setup BroadcastChannel listener (Wakes up via Service Worker Push!)
    const broadcast = new BroadcastChannel('call-notifications');
    
    broadcast.onmessage = async (event) => {
      console.log("[CallNotification] Received Broadcast message:", event.data);
      if (event.data.type === 'INCOMING_CALL' && event.data.url) {
        // Extract the UUID from the URL (e.g. /dashboard/sessions/[id]/call)
        const match = event.data.url.match(/\/sessions\/([a-f0-9\-]+)\/call/);
        console.log("[CallNotification] Regex match result:", match);
        
        if (match && match[1]) {
          const appointmentId = match[1];
          console.log("[CallNotification] Extracted Appointment ID:", appointmentId);

          try {
            const data = await fetchWithAuth(`/sessions/${appointmentId}`);
            console.log("[CallNotification] Fetched appointment data:", data);

            if (data) {
              const currentPathname = pathnameRef.current;
              const isOnCallPage = currentPathname.includes(`/sessions/${data.id}/call`);
              console.log("[CallNotification] Is user already on call page?", isOnCallPage, "Current pathname:", currentPathname);
              
              if (!isOnCallPage) {
                console.log("[CallNotification] Triggered via Service Worker Push!", data);
                setIncomingCall(data);
                setIsMinimized(false);
                playRingtone();
              }
            }
          } catch (error) {
            console.error("[CallNotification] Failed to fetch session:", error);
          }
        } else {
           console.log("[CallNotification] Regex failed to match UUID from URL");
        }
      }
    };

    // 2. Initial check (in a safe try/catch)
    (async () => {
      try {
        console.log("[CallNotification] Running initial fetch check...");
        const sessions = await fetchWithAuth("/sessions/all");
        
        if (Array.isArray(sessions)) {
           const fiveMinsAgo = Date.now() - 5 * 60 * 1000;
           const activeSession = sessions.find((s: any) => {
             if (s.actualEndedAt) return false;
             if (!s.actualStartedAt) return false;
             const updatedTime = new Date(s.updatedAt?.endsWith('Z') ? s.updatedAt : `${s.updatedAt}Z`).getTime();
             return updatedTime > fiveMinsAgo;
           });

           console.log("[CallNotification] Active session found on initial load:", activeSession);

           if (activeSession && !pathnameRef.current.includes(`/sessions/${activeSession.id}/call`)) {
             setIncomingCall(activeSession);
           }
        }
      } catch (err) {
        console.error("[CallNotification] Initial fetch failed:", err);
      }
    })();

    return () => {
      broadcast.close();
    };
  }, [userId]);

  const handleAccept = () => {
    stopRingtone();
    if (incomingCall?.id) {
      router.push(`/dashboard/sessions/${incomingCall.id}/call`);
    }
    setIncomingCall(null);
  };

  const handleDecline = () => {
    stopRingtone();
    setIncomingCall(null);
  };

  // Pre-warm audio to get around autoplay restrictions on first interaction
  useEffect(() => {
    const unlockAudio = () => {
      const audio = new Audio("data:audio/wav;base64,UklGRigAAABXQVZFZm10IBIAAAABAAEARKwAAIhYAQACABAAAABkYXRhAgAAAAEA"); // Silent short wav
      audio.play().catch(() => {});
      document.removeEventListener('click', unlockAudio);
    };
    document.addEventListener('click', unlockAudio);
    return () => document.removeEventListener('click', unlockAudio);
  }, []);

  return (
    <CallContext.Provider value={{ incomingCall, setIncomingCall }}>
      {children}
      
      {incomingCall && !isMinimized && (
        <IncomingCallScreen 
          callData={incomingCall} 
          onAccept={handleAccept}
          onDecline={handleDecline}
          onMinimize={() => setIsMinimized(true)}
        />
      )}

      {incomingCall && isMinimized && (
        <MinimizedCallBanner 
          callData={incomingCall} 
          onMaximize={() => setIsMinimized(false)}
          onAccept={handleAccept}
          onDecline={handleDecline}
        />
      )}
    </CallContext.Provider>
  );
}

export const useCallNotification = () => useContext(CallContext);
