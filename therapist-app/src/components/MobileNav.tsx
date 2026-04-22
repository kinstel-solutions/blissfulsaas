"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  MessageSquare, 
  Calendar, 
  Users, 
  UserCircle 
} from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import { api } from "@/lib/api";
import { createClient } from "@/lib/supabase";

const supabaseClient = createClient();

const NAV_ITEMS = [
  { label: "Home", icon: LayoutDashboard, href: "/dashboard" },
  { label: "Patients", icon: Users, href: "/dashboard/patients" },
  { label: "Schedule", icon: Calendar, href: "/dashboard/appointments" },
  { label: "Chats", icon: MessageSquare, href: "/dashboard/messages" },
  { label: "Profile", icon: UserCircle, href: "/dashboard/account" },
];

export default function MobileNav({ currentUserId }: { currentUserId: string }) {
  const pathname = usePathname();
  const [unreadTotal, setUnreadTotal] = useState(0);

  const fetchTotalUnread = useCallback(async () => {
    try {
      const counts = await api.messages.unreadCounts();
      const total = Object.values(counts as Record<string, number>).reduce((a, b) => a + b, 0);
      setUnreadTotal(total);
    } catch (e) {
    }
  }, []);

  useEffect(() => {
    fetchTotalUnread();

    const handleRefresh = () => {
      fetchTotalUnread();
    };

    window.addEventListener('refresh-unread-counts', handleRefresh);

    const channelId = `mobile-nav-therapist-updates-${currentUserId}`;
    const channel = supabaseClient
      .channel(channelId)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "Message" },
        () => {
          setTimeout(() => fetchTotalUnread(), 500);
        }
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "Notification", filter: `userId=eq.${currentUserId}` },
        () => {
          setTimeout(() => fetchTotalUnread(), 500);
        }
      )
      .subscribe();

    return () => {
      window.removeEventListener('refresh-unread-counts', handleRefresh);
      supabaseClient.removeChannel(channel);
    };
  }, [fetchTotalUnread, currentUserId]);

  return (
    <nav className="fixed bottom-2 left-1/2 -translate-x-1/2 w-[92%] max-w-md z-[100] lg:hidden">
      <div className="bg-surface/80 backdrop-blur-3xl border border-primary/5 rounded-[2.5rem] p-3 shadow-[0_20px_50px_rgba(0,0,0,0.15)] flex justify-between items-center ring-1 ring-primary/5">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href;
          const isMessages = item.href?.includes("/messages");
          
          return (
            <Link 
              key={item.href}
              href={item.href}
              className={`flex-1 flex flex-col items-center justify-center gap-1 group relative h-12 transition-all duration-300 ${
                isActive ? 'text-primary scale-110' : 'text-primary/30 hover:text-primary/60'
              }`}
            >
              <div className={`relative p-2 rounded-2xl transition-all duration-300 ${
                isActive ? 'bg-primary/10' : 'group-active:scale-90 group-hover:bg-primary/5'
              }`}>
                <item.icon className={`w-5 h-5 transition-all duration-300 ${isActive ? 'stroke-[2.5px]' : 'stroke-[1.8px]'}`} />
                
                {isMessages && unreadTotal > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-primary text-white text-[10px] font-bold rounded-full flex items-center justify-center shadow-md animate-pulse z-50">
                    {unreadTotal > 9 ? '9+' : unreadTotal}
                  </span>
                )}
              </div>
              
              {isActive && (
                <div className="absolute -top-1 w-1 h-1 bg-primary rounded-full blur-[1px] animate-pulse" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
