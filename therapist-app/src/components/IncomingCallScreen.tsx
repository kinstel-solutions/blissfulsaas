'use client';

import { Phone, PhoneOff, Minimize2, Video } from 'lucide-react';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase';

interface IncomingCallScreenProps {
  callData: any;
  onAccept: () => void;
  onDecline: () => void;
  onMinimize: () => void;
}

export default function IncomingCallScreen({ callData, onAccept, onDecline, onMinimize }: IncomingCallScreenProps) {
  const [callerName, setCallerName] = useState<string>('Your Patient');
  const [profileImageUrl, setProfileImageUrl] = useState<string | null>(null);

  useEffect(() => {
    const fetchCallerInfo = async () => {
      if (!callData?.patientId) return;
      const supabase = createClient();
      const { data } = await supabase
        .from('Patient')
        .select('firstName, lastName')
        .eq('id', callData.patientId)
        .single();
        
      if (data) {
        setCallerName(data.firstName ? `${data.firstName} ${data.lastName || ''}` : 'Your Patient');
      }
    };
    fetchCallerInfo();
  }, [callData]);

  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-background text-foreground animate-in fade-in duration-300">
      {/* Minimize Button */}
      <button 
        onClick={onMinimize}
        className="absolute top-8 right-8 p-3 rounded-full bg-surface-container hover:bg-surface-container-high transition-colors text-foreground"
      >
        <Minimize2 className="w-6 h-6" />
      </button>

      {/* Call Info */}
      <div className="flex flex-col items-center gap-6 mb-12">
        <div className="relative">
          <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-primary/20 shadow-2xl relative z-10 bg-primary/10 flex items-center justify-center">
             {profileImageUrl ? (
               <Image src={profileImageUrl} alt={callerName} fill className="object-cover" />
             ) : (
               <Video className="w-12 h-12 text-primary/50" />
             )}
          </div>
          {/* Ripples */}
          <div className="absolute inset-0 rounded-full bg-primary/20 animate-ping opacity-75" style={{ animationDuration: '2s' }} />
          <div className="absolute inset-[-1rem] rounded-full border border-primary/30 animate-pulse" />
        </div>
        
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-black font-heading tracking-tight text-foreground">{callerName}</h2>
          <p className="text-lg text-primary animate-pulse font-medium">Incoming video session...</p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-12">
        <button 
          onClick={onDecline}
          className="flex flex-col items-center gap-3 group"
        >
          <div className="w-16 h-16 rounded-full bg-error/10 text-error flex items-center justify-center group-hover:bg-error group-hover:text-error-foreground transition-all duration-300 transform group-hover:scale-110 shadow-lg">
            <PhoneOff className="w-7 h-7" />
          </div>
          <span className="text-sm font-semibold text-foreground/70">Ignore</span>
        </button>

        <button 
          onClick={onAccept}
          className="flex flex-col items-center gap-3 group"
        >
          <div className="w-20 h-20 rounded-full bg-primary text-primary-foreground flex items-center justify-center hover:bg-primary/90 transition-all duration-300 transform group-hover:scale-110 shadow-xl shadow-primary/30 animate-bounce" style={{ animationDuration: '2s' }}>
            <Phone className="w-9 h-9 fill-current" />
          </div>
          <span className="text-sm font-semibold text-primary">Accept</span>
        </button>
      </div>
    </div>
  );
}
