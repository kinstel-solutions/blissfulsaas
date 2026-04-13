"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  MessageSquare, 
  Calendar, 
  Plus, 
  UserCircle 
} from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import { api } from "@/lib/api";
import { createClient } from "@/lib/supabase";

const supabaseClient = createClient();

const NAV_ITEMS = [
  { label: "Home", icon: LayoutDashboard, href: "/dashboard" },
  { label: "Book", icon: Plus, href: "/dashboard/sessions/book" },
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
      console.error('MobileNav - Unread fetch error:', e);
    }
  }, []);

  useEffect(() => {
    fetchTotalUnread();

    const channelId = `mobile-nav-patient-${currentUserId}`;
    const channel = supabaseClient
      .channel(channelId)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "Message",
        },
        () => fetchTotalUnread()
      )
      .subscribe();

    return () => {
      supabaseClient.removeChannel(channel);
    };
  }, [fetchTotalUnread, currentUserId, pathname]);

  return (
    <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[92%] max-w-md z-[100] lg:hidden">
      <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-3xl border border-white/20 dark:border-white/10 rounded-[2.5rem] p-3 shadow-[0_20px_50px_rgba(0,0,0,0.2)] flex justify-between items-center ring-1 ring-black/5">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href;
          const isMessages = item.href?.includes("/messages");
          
          return (
            <Link 
              key={item.href}
              href={item.href}
              className={`flex-1 flex flex-col items-center justify-center gap-1 group relative h-12 transition-all duration-300 ${
                isActive ? 'text-primary scale-110' : 'text-slate-400 hover:text-slate-600 dark:text-slate-500'
              }`}
            >
              <div className={`relative p-2 rounded-2xl transition-all duration-300 ${
                isActive ? 'bg-primary/15' : 'group-active:scale-90 group-hover:bg-slate-100 dark:group-hover:bg-slate-800'
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
