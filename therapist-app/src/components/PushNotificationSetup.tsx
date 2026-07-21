'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase';

function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export default function PushNotificationSetup({ vapidPublicKey }: { vapidPublicKey: string }) {
  const [permission, setPermission] = useState<string>('default');

  useEffect(() => {
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator && 'PushManager' in window) {
      setPermission(Notification.permission);
    }
  }, []);

  const subscribeToPush = async () => {
    try {
      const permissionResult = await Notification.requestPermission();
      setPermission(permissionResult);

      if (permissionResult !== 'granted') return;

      if (!vapidPublicKey) {
        console.error('VAPID public key is missing. Make sure NEXT_PUBLIC_VAPID_PUBLIC_KEY is defined in .env.local and restart the server.');
        return;
      }

      await navigator.serviceWorker.register('/sw.js');
      const registration = await navigator.serviceWorker.ready;
      
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidPublicKey),
      });

      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.access_token) {
        await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/notifications/push-subscription`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`,
          },
          body: JSON.stringify(subscription),
        });
      }
    } catch (error) {
      console.error('Push subscription failed:', error);
    }
  };

  if (permission === 'granted' || permission === 'denied') return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-sm bg-background text-foreground border border-border/80 p-6 rounded-2xl shadow-2xl flex flex-col gap-4">
        <div className="flex flex-col gap-1.5 text-center">
          <h4 className="font-bold text-base text-foreground">Enable Call Notifications</h4>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Receive incoming calls even when the app is closed or running in the background.
          </p>
        </div>
        <div className="flex gap-3 mt-1">
          <button 
            onClick={subscribeToPush}
            className="flex-1 bg-primary text-primary-foreground text-xs font-semibold py-3 rounded-xl hover:bg-primary/90 transition-colors shadow-md"
          >
            Enable
          </button>
          <button 
            onClick={() => setPermission('denied')} // Just hide for now
            className="flex-1 bg-secondary text-secondary-foreground border border-border text-xs font-semibold py-3 rounded-xl hover:bg-secondary/80 transition-colors"
          >
            Not Now
          </button>
        </div>
      </div>
    </div>
  );
}
