"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { MessageSquare, Search, Clock, Calendar, ChevronRight, Send, Ban } from "lucide-react";
import { api } from "@/lib/api";
import { createClient } from "@/lib/supabase";

const supabaseClient = createClient();

export default function MessageHistoryClient({ 
  initialSessions, 
  currentUserId,
  mode = 'therapist'
}: { 
  initialSessions: any[], 
  currentUserId: string,
  mode?: 'patient' | 'therapist'
}) {
  const [selectedSession, setSelectedSession] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<"connecting" | "connected" | "error">("connecting");
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [unreadCounts, setUnreadCounts] = useState<Record<string, number>>({});
  const [mounted, setMounted] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  const fetchMessages = useCallback(async (sessionId: string) => {
    setLoading(true);
    try {
      const data = await api.messages.history(sessionId);
      setMessages(data || []);
      
      // Mark as read
      await api.messages.markRead(sessionId);
      setUnreadCounts(prev => ({ ...prev, [sessionId]: 0 }));
    } catch (error) {
      console.error("Failed to fetch message history", error);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchUnreadCounts = useCallback(async () => {
    try {
      const counts = await api.messages.unreadCounts();
      setUnreadCounts(counts || {});
    } catch (e) {}
  }, []);

  useEffect(() => {
    setMounted(true);
    fetchUnreadCounts();
  }, [fetchUnreadCounts]);

  // Realtime subscription
  useEffect(() => {
    let roomChannel: any;
    if (selectedSession) {
      fetchMessages(selectedSession.id);

      roomChannel = supabaseClient
        .channel(`room:${selectedSession.id}`)
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "Message",
          },
          (payload: any) => {
            const msg = payload.new;
            if (msg.appointmentId !== selectedSession.id) return;

            setMessages((prev) => {
              if (prev.some((m) => m.id === msg.id)) return prev;
              return [...prev, msg];
            });

            if (msg.senderId !== currentUserId) {
              api.messages.markRead(selectedSession.id);
            }
          }
        )
        .subscribe();
    }

    const globalChannel = supabaseClient
      .channel('global-messages-notifications')
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "Message",
        },
        (payload: any) => {
          const msg = payload.new;
          if (msg.senderId !== currentUserId && (!selectedSession || msg.appointmentId !== selectedSession.id)) {
            const isMySession = initialSessions.some(s => s.id === msg.appointmentId);
            if (isMySession) {
              setUnreadCounts(prev => ({
                ...prev,
                [msg.appointmentId]: (prev[msg.appointmentId] || 0) + 1
              }));
            }
          }
        }
      )
      .subscribe((status) => {
        if (status === "SUBSCRIBED") setStatus("connected");
      });

    const poll = setInterval(() => {
      fetchUnreadCounts();
      if (selectedSession) fetchMessages(selectedSession.id);
    }, 10000);

    return () => {
      if (roomChannel) supabaseClient.removeChannel(roomChannel);
      supabaseClient.removeChannel(globalChannel);
      clearInterval(poll);
    };
  }, [selectedSession, fetchMessages, fetchUnreadCounts, initialSessions, currentUserId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!selectedSession) return;
    const text = input.trim();
    if (!text || sending) return;
    setInput("");
    setSending(true);
    try {
      await api.messages.send(selectedSession.id, text);
    } catch (e: any) {
      setInput(text); // restore on error
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const filteredSessions = initialSessions.filter(s => {
    const otherParty = mode === 'therapist' ? s.patient : s.therapist;
    const name = `${otherParty?.firstName} ${otherParty?.lastName}`.toLowerCase();
    return name.includes(search.toLowerCase());
  });

  const isCancelled = selectedSession?.status === 'CANCELLED';
  const isChatActive = selectedSession && !isCancelled ? (
    Date.now() <= new Date(selectedSession.scheduledAt).getTime() + ((selectedSession.duration || 60) * 60000) + (7 * 24 * 60 * 60 * 1000)
  ) : false;

  return (
    <div className="flex-1 bg-white border border-slate-200 rounded-2xl md:rounded-[2.5rem] shadow-sm flex overflow-hidden h-[calc(100vh-16rem)] md:h-[calc(100vh-18rem)]">
      {/* Sidebar - Conversation List */}
      <div className={`w-full md:w-80 border-r border-slate-100 flex flex-col ${selectedSession ? 'hidden md:flex' : 'flex'}`}>
        <div className="p-4 md:p-6 border-b border-slate-50">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search patients..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-50 border-none rounded-xl pl-10 pr-4 py-2.5 md:py-2 text-xs focus:ring-2 focus:ring-primary/20 transition-all outline-none"
            />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-3 md:p-4 space-y-2">
          {filteredSessions.length === 0 ? (
            <div className="text-center py-16 md:py-20 opacity-30">
              <MessageSquare className="w-8 h-8 mx-auto mb-2" />
              <p className="text-[10px] md:text-xs font-bold uppercase tracking-widest">No history found</p>
            </div>
          ) : (
            filteredSessions.map((s) => {
              const otherParty = mode === 'therapist' ? s.patient : s.therapist;
              const isActive = selectedSession?.id === s.id;
              const unreadCount = unreadCounts[s.id] || 0;
              return (
                <button
                  key={s.id}
                  onClick={() => setSelectedSession(s)}
                  className={`relative w-full p-3 md:p-4 rounded-xl md:rounded-2xl transition-all flex items-center gap-3 text-left ${
                    isActive ? 'bg-primary/5 border border-primary/10' : 'hover:bg-slate-50 border border-transparent'
                  }`}
                >
                  {unreadCount > 0 && (
                    <div className="absolute top-3 md:top-4 right-3 md:right-4 w-5 h-5 bg-primary text-white text-[10px] font-bold rounded-full flex items-center justify-center shadow-sm">
                      {unreadCount}
                    </div>
                  )}
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 ${
                    isActive ? 'bg-primary text-white' : 'bg-slate-100 text-slate-500'
                  }`}>
                    {otherParty?.firstName?.[0]}{otherParty?.lastName?.[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-bold truncate ${isActive ? 'text-primary' : 'text-slate-900'}`}>
                      {otherParty?.firstName} {otherParty?.lastName}
                    </p>
                    <div className={`flex items-center gap-1.5 text-[10px] md:text-xs font-medium ${unreadCount > 0 ? 'text-primary' : 'text-slate-400'}`}>
                      <Calendar className="w-3 h-3" />
                      {mounted ? new Date(s.scheduledAt).toLocaleDateString() : '...'}
                    </div>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* Main Area - Chat History */}
      <div className={`flex-1 flex flex-col bg-slate-50/30 ${!selectedSession ? 'hidden md:flex' : 'flex'}`}>
        {!selectedSession ? (
          <div className="flex-1 flex flex-col items-center justify-center p-6 md:p-12 text-center">
            <div className="w-16 h-16 md:w-20 md:h-20 bg-white rounded-[1.5rem] md:rounded-3xl shadow-lg border border-slate-100 flex items-center justify-center mb-6 text-slate-200">
              <MessageSquare className="w-8 h-8 md:w-10 md:h-10" />
            </div>
            <h3 className="text-lg md:text-xl font-heading font-medium text-slate-800 mb-2">Clinical Archive</h3>
            <p className="text-xs md:text-sm text-slate-400 max-w-xs leading-relaxed">
              Select a previous session from the sidebar to review the full communication history.
            </p>
          </div>
        ) : (
          <>
            {/* Thread Header */}
            <div className="p-4 md:p-6 bg-white border-b border-slate-100 flex items-center justify-between sticky top-0 z-10">
              <div className="flex items-center gap-3 md:gap-4 overflow-hidden">
                <button 
                  onClick={() => setSelectedSession(null)}
                  className="md:hidden p-2 -ml-2 text-slate-400 hover:text-slate-900 shrink-0"
                >
                  <ChevronRight className="w-5 h-5 rotate-180" />
                </button>
                <div className="min-w-0">
                  <h3 className="text-sm font-bold text-slate-900 leading-none truncate">
                    {mode === 'therapist' ? selectedSession.patient?.firstName + ' ' + selectedSession.patient?.lastName : 'Dr. ' + selectedSession.therapist?.firstName}
                  </h3>
                  <div className="flex flex-wrap items-center gap-2 mt-1.5">
                    <p className="text-[10px] text-slate-400 font-medium uppercase tracking-widest flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {mounted ? new Date(selectedSession.scheduledAt).toLocaleDateString() : '...'}
                    </p>
                    {isCancelled ? (
                      <span className="text-red-500 text-[9px] font-bold uppercase flex items-center gap-1 bg-red-50 px-1.5 py-0.5 rounded-full">
                        <Ban className="w-2.5 h-2.5" />
                        Cancelled
                      </span>
                    ) : isChatActive && (
                      <span className="text-green-500 font-bold text-[9px] uppercase flex items-center gap-1 bg-green-50 px-1.5 py-0.5 rounded-full">
                        <span className="w-1 h-1 rounded-full bg-green-500 animate-pulse" />
                        Active
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Message List */}
            <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-4 md:space-y-6">
              {loading && messages.length === 0 ? (
                <div className="flex h-full items-center justify-center">
                  <div className="w-6 h-6 border-2 border-slate-200 border-t-primary rounded-full animate-spin" />
                </div>
              ) : messages.length === 0 ? (
                <div className="flex flex-col h-full items-center justify-center text-slate-300 opacity-50 space-y-2">
                  <MessageSquare className="w-8 h-8" />
                  <p className="text-[10px] md:text-xs font-bold uppercase tracking-widest text-center">No messages in this archive</p>
                </div>
              ) : (
                messages.map((m) => {
                  const isMe = m.senderId === currentUserId;
                  return (
                    <div key={m.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                      <div className={`max-w-[85%] md:max-w-[70%] p-3.5 md:p-4 rounded-xl md:rounded-2xl text-xs md:text-sm shadow-sm ${
                        isMe 
                          ? 'bg-primary text-white rounded-tr-none' 
                          : 'bg-white text-slate-800 border border-slate-100 rounded-tl-none'
                      }`}>
                        {m.content}
                      </div>
                      <span className="mt-1.5 text-[9px] md:text-xs font-bold text-slate-300 uppercase tracking-tighter">
                        {mounted ? new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                      </span>
                    </div>
                  );
                })
              )}
              <div ref={bottomRef} />
            </div>

            {/* Conditionally Render Footer Input vs Read Only Note */}
            {isChatActive ? (
              <div className="p-3 md:p-4 bg-white border-t border-slate-100">
                <div className="flex items-center gap-2 bg-slate-50 border border-slate-100 rounded-xl md:rounded-2xl px-3 md:px-4 py-1.5 md:py-2">
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Type a message..."
                    className="flex-1 bg-transparent text-slate-800 placeholder:text-slate-400 text-sm outline-none"
                  />
                  <button
                    onClick={handleSend}
                    disabled={!input.trim() || sending}
                    className="w-9 h-9 md:w-10 md:h-10 rounded-lg md:rounded-xl bg-primary flex items-center justify-center text-white disabled:opacity-30 hover:bg-primary/90 transition-all active:scale-95 shrink-0"
                  >
                    <Send className="w-4 h-4 md:-ml-0.5" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-4 bg-white/50 border-t border-slate-100 text-center">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-1">
                  Read Only Archive
                </p>
                <p className="text-[10px] text-slate-400">
                  {isCancelled 
                    ? "Chatting is disabled for cancelled appointments." 
                    : "This chat window closed 7 days after the consultation."
                  }
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
