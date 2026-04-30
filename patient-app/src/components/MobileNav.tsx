"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  MessageSquare, 
  Calendar, 
  Compass, 
  UserCircle 
} from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import { api } from "@/lib/api";
import { createClient } from "@/lib/supabase";

const supabaseClient = createClient();

const NAV_ITEMS = [
  { label: "Discover", icon: Compass, href: "/dashboard/discover" },
  { label: "Sessions", icon: Calendar, href: "/dashboard/sessions" },
  { label: "Chats", icon: MessageSquare, href: "/dashboard/messages" },
  { label: "Account", icon: UserCircle, href: "/dashboard/account" },
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

    const channelId = `mobile-nav-patient-updates-${currentUserId}`;
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
    <nav className="fixed bottom-0 left-0 right-0 w-full z-[100] lg:hidden">
      <div className="bg-surface/95 backdrop-blur-3xl border-t border-primary/10 rounded-t-[1rem] py-2 flex justify-between items-center shadow-[0_-10px_40px_rgba(0,0,0,0.05)] ring-1 ring-primary/5">
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
