"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  MessageSquare, 
  Calendar, 
  Users, 
  Clock, 
  Activity 
} from "lucide-react";
import { api } from "@/lib/api";
import { createClient } from "@/lib/supabase";

const supabaseClient = createClient();

const NAV_ITEMS = [
  { label: "Overview", icon: LayoutDashboard, href: "/dashboard" },
  { label: "My Patients", icon: Users, href: "/dashboard/patients" },
  { label: "Appointments", icon: Calendar, href: "/dashboard/appointments" },
  { label: "Clinical Messages", icon: MessageSquare, href: "/dashboard/messages" },
  { label: "Availability", icon: Clock, href: "/dashboard/availability" },
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

    const handleRefresh = () => {
      fetchTotalUnread();
    };

    window.addEventListener('refresh-unread-counts', handleRefresh);

    const channel = supabaseClient
      .channel(`sidebar-updates-${currentUserId}`)
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
    <div className="px-6 py-6 flex flex-col flex-1 gap-2">
      {NAV_ITEMS.map((item) => {
        const isActive = pathname === item.href;
        const isMessages = item.href === "/dashboard/messages";
        
        return (
          <Link 
            key={item.href}
            href={item.href} 
            className={`flex items-center px-4 py-3.5 rounded-lg transition-all duration-300 group relative overflow-hidden ${
              isActive 
                ? 'bg-primary/10 text-primary font-semibold shadow-xs' 
                : 'text-foreground/80 hover:bg-surface-container-lowest hover:text-primary'
            }`}
          >
            {/* Active Vertical Indicator Bar */}
            {isActive && (
              <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-primary rounded-r-md" />
            )}

            <item.icon className={`w-5 h-5 mr-4 group-hover:scale-110 transition-transform ${isActive ? 'text-primary' : 'text-primary/50 group-hover:text-primary'}`} />
            <span className="text-base font-medium">{item.label}</span>
            
            {isMessages && unreadTotal > 0 && (
              <span className="absolute right-6 w-5 h-5 bg-primary text-white text-[11px] font-bold rounded-full flex items-center justify-center shadow-md animate-pulse">
                {unreadTotal > 9 ? '9+' : unreadTotal}
              </span>
            )}
          </Link>
        );
      })}
    </div>
  );
}
