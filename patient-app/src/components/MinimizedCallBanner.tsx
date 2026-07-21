'use client';

import { Phone, PhoneOff, Maximize2, Video } from 'lucide-react';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase';

interface MinimizedCallBannerProps {
  callData: any;
  onMaximize: () => void;
  onAccept: () => void;
  onDecline: () => void;
}

export default function MinimizedCallBanner({ callData, onMaximize, onAccept, onDecline }: MinimizedCallBannerProps) {
  const [therapistName, setTherapistName] = useState<string>('Your Therapist');
  const [profileImageUrl, setProfileImageUrl] = useState<string | null>(null);

  useEffect(() => {
    const fetchTherapistInfo = async () => {
      if (!callData?.therapistId) return;
      const supabase = createClient();
      const { data } = await supabase
        .from('Therapist')
        .select('firstName, lastName, profileImageUrl')
        .eq('id', callData.therapistId)
        .single();
        
      if (data) {
        setTherapistName(data.firstName ? `Dr. ${data.firstName} ${data.lastName || ''}` : 'Your Therapist');
        if (data.profileImageUrl) {
          setProfileImageUrl(data.profileImageUrl);
        }
      }
    };
    fetchTherapistInfo();
  }, [callData]);

  return (
    <div className="fixed top-6 right-6 z-[100] w-full max-w-sm bg-surface border border-primary/20 rounded-2xl shadow-2xl p-4 flex flex-col gap-4 animate-in slide-in-from-top-4 duration-300">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full overflow-hidden bg-primary/10 flex items-center justify-center shrink-0 border border-primary/20 relative">
             {profileImageUrl ? (
               <Image src={profileImageUrl} alt={therapistName} fill className="object-cover" />
             ) : (
               <Video className="w-6 h-6 text-primary/50" />
             )}
             <div className="absolute inset-0 rounded-full bg-primary/20 animate-ping opacity-75" style={{ animationDuration: '2s' }} />
          </div>
          <div className="flex flex-col">
            <span className="text-xs font-bold text-primary animate-pulse">Incoming Call...</span>
            <span className="text-sm font-bold text-foreground truncate max-w-[180px]">{therapistName}</span>
          </div>
        </div>
        
        <button 
          onClick={onMaximize}
          className="p-2 -mr-2 -mt-2 text-muted-foreground hover:text-foreground hover:bg-surface-container rounded-lg transition-colors"
        >
          <Maximize2 className="w-4 h-4" />
        </button>
      </div>

      <div className="flex items-center gap-3 w-full">
        <button 
          onClick={onDecline}
          className="flex-1 flex items-center justify-center gap-2 py-2 rounded-xl bg-error/10 text-error hover:bg-error hover:text-error-foreground transition-colors font-semibold text-sm"
        >
          <PhoneOff className="w-4 h-4" /> Ignore
        </button>
        <button 
          onClick={onAccept}
          className="flex-1 flex items-center justify-center gap-2 py-2 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20 font-semibold text-sm animate-pulse"
        >
          <Phone className="w-4 h-4 fill-current" /> Answer
        </button>
      </div>
    </div>
  );
}
