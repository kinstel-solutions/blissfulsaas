"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Bell, Check, CheckCheck, Trash2, X } from "lucide-react";
import { api } from "@/lib/api";
import { createClient } from "@/lib/supabase";

const supabaseClient = createClient();

interface Notification {
  id: string;
  type: string;
  title: string;
  body: string;
  isRead: boolean;
  metadata?: Record<string, any>;
  createdAt: string;
}

const TYPE_ICON: Record<string, string> = {
  BOOKING_CONFIRMED: "📅",
  BOOKING_CANCELLED: "❌",
  SESSION_COMPLETED: "✅",
  PAYMENT_SUCCESS: "💳",
  THERAPIST_APPROVED: "🎉",
  NEW_MESSAGE: "💬",
  GENERAL: "🔔",
};

const TYPE_COLOR: Record<string, string> = {
  BOOKING_CONFIRMED: "bg-emerald-500/10 border-emerald-500/20 text-emerald-600",
  BOOKING_CANCELLED: "bg-red-500/10 border-red-500/20 text-red-600",
  SESSION_COMPLETED: "bg-blue-500/10 border-blue-500/20 text-blue-600",
  PAYMENT_SUCCESS: "bg-violet-500/10 border-violet-500/20 text-violet-600",
  THERAPIST_APPROVED: "bg-amber-500/10 border-amber-500/20 text-amber-600",
  NEW_MESSAGE: "bg-sky-500/10 border-sky-500/20 text-sky-600",
  GENERAL: "bg-primary/10 border-primary/20 text-primary",
};

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

export default function NotificationBell({ currentUserId }: { currentUserId: string }) {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unread, setUnread] = useState(0);
  const [loading, setLoading] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  const fetchNotifications = useCallback(async () => {
    console.log("[NotificationBell] Fetching notifications...");
    try {
      const data = await api.notifications.getAll();
      console.log("[NotificationBell] Received notifications:", data);
      setNotifications(data);
      setUnread(data.filter((n: Notification) => !n.isRead).length);
    } catch (e) {
      console.error("[NotificationBell] Failed to fetch:", e);
    }
  }, []);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Initial fetch
  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  // Real-time via Supabase
  useEffect(() => {
    const channel = supabaseClient
      .channel(`notifications-${currentUserId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "Notification",
          filter: `userId=eq.${currentUserId}`,
        },
        () => fetchNotifications()
      )
      .subscribe();

    return () => {
      supabaseClient.removeChannel(channel);
    };
  }, [currentUserId, fetchNotifications]);

  const handleOpen = async () => {
    setOpen((prev) => !prev);
  };

  const markOne = async (id: string) => {
    try {
      await api.notifications.markRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
      );
      setUnread((prev) => Math.max(0, prev - 1));
    } catch (e) {}
  };

  const markAll = async () => {
    setLoading(true);
    try {
      await api.notifications.markAllRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnread(0);
    } catch (e) {}
    setLoading(false);
  };

  const deleteOne = async (id: string, wasRead: boolean) => {
    try {
      await api.notifications.delete(id);
      setNotifications((prev) => prev.filter((n) => n.id !== id));
      if (!wasRead) setUnread((prev) => Math.max(0, prev - 1));
    } catch (e) {}
  };

  return (
    <div className="relative" ref={panelRef}>
      {/* Bell Button */}
      <button
        id="notification-bell-btn"
        onClick={handleOpen}
        className="relative w-10 h-10 rounded-xl bg-surface-container-low border border-outline-variant/30 flex items-center justify-center hover:bg-surface-container hover:border-primary/30 transition-all duration-200 group"
        aria-label={`Notifications${unread > 0 ? ` (${unread} unread)` : ""}`}
      >
        <Bell className="w-4 h-4 text-foreground/60 group-hover:text-primary transition-colors" />
        {unread > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 bg-primary text-primary-foreground text-[10px] font-bold rounded-full flex items-center justify-center shadow-md animate-bounce-once">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>

      {/* Dropdown Panel */}
      {open && (
        <div
          id="notification-panel"
          className="absolute right-0 top-12 w-[360px] max-w-[calc(100vw-2rem)] bg-surface border border-outline-variant/30 rounded-2xl shadow-2xl shadow-black/20 z-50 overflow-hidden"
          style={{ animation: "slideDown 0.2s ease-out" }}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-outline-variant/20">
            <div className="flex items-center gap-2">
              <Bell className="w-4 h-4 text-primary" />
              <h3 className="font-heading font-semibold text-sm text-foreground">Notifications</h3>
              {unread > 0 && (
                <span className="px-2 py-0.5 bg-primary/10 text-primary text-[10px] font-bold rounded-full">
                  {unread} new
                </span>
              )}
            </div>
            <div className="flex items-center gap-1">
              {unread > 0 && (
                <button
                  onClick={markAll}
                  disabled={loading}
                  title="Mark all as read"
                  className="p-1.5 rounded-lg hover:bg-surface-container text-muted-foreground hover:text-primary transition-colors"
                >
                  <CheckCheck className="w-3.5 h-3.5" />
                </button>
              )}
              <button
                onClick={() => setOpen(false)}
                className="p-1.5 rounded-lg hover:bg-surface-container text-muted-foreground transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* List */}
          <div className="overflow-y-auto max-h-[420px] divide-y divide-outline-variant/10">
            {notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
                <div className="w-12 h-12 rounded-2xl bg-surface-container flex items-center justify-center mb-3">
                  <Bell className="w-5 h-5 text-muted-foreground/40" />
                </div>
                <p className="text-sm font-medium text-foreground/50">All caught up!</p>
                <p className="text-xs text-muted-foreground/40 mt-1">No notifications yet.</p>
              </div>
            ) : (
              notifications.map((notif) => (
                <div
                  key={notif.id}
                  className={`group flex items-start gap-3 px-4 py-3.5 transition-colors hover:bg-surface-container/40 ${
                    !notif.isRead ? "bg-primary/[0.03]" : ""
                  }`}
                >
                  {/* Icon badge */}
                  <div
                    className={`shrink-0 w-9 h-9 rounded-xl border flex items-center justify-center text-base ${
                      TYPE_COLOR[notif.type] ?? TYPE_COLOR.GENERAL
                    }`}
                  >
                    {TYPE_ICON[notif.type] ?? "🔔"}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className={`text-sm font-semibold leading-snug ${notif.isRead ? "text-foreground/70" : "text-foreground"}`}>
                        {notif.title}
                      </p>
                      {!notif.isRead && (
                        <span className="shrink-0 w-2 h-2 rounded-full bg-primary mt-1" />
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed line-clamp-2">
                      {notif.body}
                    </p>
                    <p className="text-[10px] text-muted-foreground/50 mt-1">
                      {timeAgo(notif.createdAt)}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="shrink-0 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    {!notif.isRead && (
                      <button
                        onClick={() => markOne(notif.id)}
                        title="Mark as read"
                        className="p-1 rounded-lg hover:bg-primary/10 text-muted-foreground hover:text-primary transition-colors"
                      >
                        <Check className="w-3 h-3" />
                      </button>
                    )}
                    <button
                      onClick={() => deleteOne(notif.id, notif.isRead)}
                      title="Delete"
                      className="p-1 rounded-lg hover:bg-red-500/10 text-muted-foreground hover:text-red-500 transition-colors"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="px-5 py-3 border-t border-outline-variant/20 bg-surface-container-lowest/50">
              <p className="text-[10px] text-muted-foreground/40 text-center">
                Showing last {notifications.length} notification{notifications.length !== 1 ? "s" : ""}
              </p>
            </div>
          )}
        </div>
      )}

      <style jsx>{`
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-8px) scale(0.97); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes bounce-once {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-3px); }
        }
        .animate-bounce-once { animation: bounce-once 0.5s ease; }
      `}</style>
    </div>
  );
}
