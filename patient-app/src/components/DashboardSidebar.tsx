"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  MessageSquare, 
  Calendar, 
  Plus, 
  ClipboardList 
} from "lucide-react";
import { api } from "@/lib/api";
import { createClient } from "@/lib/supabase";

const supabaseClient = createClient();

const NAV_ITEMS = [
  { label: "Overview", icon: LayoutDashboard, href: "/dashboard" },
  { label: "My Sessions", icon: Calendar, href: "/dashboard/sessions" },
  { label: "Messages", icon: MessageSquare, href: "/dashboard/messages" },
  { label: "Book Session", icon: Plus, href: "/dashboard/sessions/book" },
  { label: "My Intake Form", icon: ClipboardList, href: "/dashboard/intake" },
];

export default function DashboardSidebar({ 
  currentUserId 
}: { 
  currentUserId: string
}) {
  const pathname = usePathname();
  const [unreadTotal, setUnreadTotal] = useState(0);

  const fetchTotalUnread = useCallback(async () => {
    try {
      const counts = await api.messages.unreadCounts();
      const total = Object.values(counts as Record<string, number>).reduce((a, b) => a + b, 0);
      setUnreadTotal(total);
    } catch (e) {}
  }, []);

  useEffect(() => {
    fetchTotalUnread();

    const channel = supabaseClient
      .channel('global-nav-notifications')
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

    fetchTotalUnread();

    return () => {
      supabaseClient.removeChannel(channel);
    };
  }, [fetchTotalUnread, currentUserId, pathname]);

  return (
    <div className="px-6 py-8 flex flex-col flex-1 gap-1">
      <p className="px-4 text-xs font-bold uppercase tracking-widest text-muted-foreground/60 mb-2">Workspace</p>
      {NAV_ITEMS.map((item) => {
        const isActive = pathname === item.href;
        const isMessages = item.href === "/dashboard/messages";
        
        return (
          <Link 
            key={item.href}
            href={item.href} 
            className={`flex items-center px-4 py-3 rounded-xl transition-all duration-200 group relative ${
              isActive 
                ? 'bg-primary/10 text-primary' 
                : 'text-foreground/70 hover:bg-surface-container-lowest hover:text-primary'
            }`}
          >
            <item.icon className={`w-5 h-5 mr-3 transition-transform ${isActive ? 'scale-110' : 'group-hover:scale-110'}`} />
            <span className="font-medium text-sm">{item.label}</span>
            
            {isMessages && unreadTotal > 0 && (
              <span className="absolute right-4 w-5 h-5 bg-primary text-white text-[10px] font-bold rounded-full flex items-center justify-center shadow-sm animate-pulse">
                {unreadTotal > 9 ? '9+' : unreadTotal}
              </span>
            )}
          </Link>
        );
      })}
    </div>
  );
}
