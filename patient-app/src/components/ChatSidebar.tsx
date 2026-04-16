"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase";
// Force re-bundling to ensure hook stability across HMR
import { api } from "@/lib/api";
import { MessageSquare, Send, X } from "lucide-react";

interface Message {
  id: string;
  content: string;
  createdAt: string;
  senderId: string;
  sender: { id: string; email: string; role: string };
}

interface ChatSidebarProps {
  appointmentId: string;
  currentUserId: string;
  isOpen: boolean;
  onClose: () => void;
}

const supabaseClient = createClient();

export default function ChatSidebar({
  appointmentId,
  currentUserId,
  isOpen,
  onClose,
}: ChatSidebarProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [status, setStatus] = useState<"connecting" | "connected" | "error">("connecting");
  const bottomRef = useRef<HTMLDivElement>(null);

  // Fetch message history on mount
  const loadHistory = useCallback(async () => {
    try {
      const history = await api.messages.history(appointmentId);
      if (Array.isArray(history)) setMessages(history);
    } catch {}
  }, [appointmentId]);

  useEffect(() => {
    loadHistory();

    const channel = supabaseClient
      .channel(`room:${appointmentId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "Message",
        },
        (payload: any) => {
          const msg = payload.new as Message;
          if (msg.appointmentId !== appointmentId) return;

          setMessages((prev) => {
            if (prev.some((m) => m.id === msg.id)) return prev;
            return [...prev, msg];
          });
        }
      )
      .subscribe((status) => {
        if (status === "SUBSCRIBED") setStatus("connected");
        if (status === "CLOSED") setStatus("connecting");
        if (status === "CHANNEL_ERROR") setStatus("error");
      });

    // Fallback polling every 5s if Realtime is unreliable
    const poll = setInterval(loadHistory, 5000);

    return () => {
      supabaseClient.removeChannel(channel);
      clearInterval(poll);
    };
  }, [appointmentId, loadHistory]);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    const text = input.trim();
    if (!text || sending) return;
    setInput("");
    setSending(true);
    try {
      await api.messages.send(appointmentId, text);
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

  if (!isOpen) return null;

  return (
    <div className="absolute inset-0 z-40 flex flex-col bg-slate-950/95 backdrop-blur-xl rounded-2xl border border-white/10 animate-in slide-in-from-right duration-300">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-5 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
          <h3 className="text-sm font-bold uppercase tracking-widest text-white/70">
            Session Chat
          </h3>
          {status !== 'connected' && (
            <span className={`text-xs px-2 py-0.5 rounded-full font-bold uppercase tracking-widest ${
              status === 'error' ? 'bg-red-500/20 text-red-400' : 
              'bg-yellow-500/20 text-yellow-400'
            }`}>
              {status}
            </span>
          )}
        </div>
        <button
          onClick={onClose}
          className="w-8 h-8 rounded-full flex items-center justify-center text-white/40 hover:text-white hover:bg-white/10 transition-all"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Message List */}
      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-white/10">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full gap-3 opacity-30">
            <MessageSquare className="w-8 h-8 text-white" />
            <p className="text-white text-xs font-bold uppercase tracking-widest">
              No messages yet
            </p>
          </div>
        )}
        {messages.map((msg) => {
          const isMe = msg.senderId === currentUserId;
          return (
            <div
              key={msg.id}
              className={`flex ${isMe ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                  isMe
                    ? "bg-primary text-white rounded-br-sm"
                    : "bg-white/10 text-white/90 rounded-bl-sm"
                }`}
              >
                <p>{msg.content}</p>
                <p
                  className={`text-xs mt-1 font-bold uppercase tracking-wider ${
                    isMe ? "text-white/50" : "text-white/30"
                  }`}
                >
                  {new Date(msg.createdAt).toLocaleTimeString('en-US', {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="px-4 pb-4 pt-2 border-t border-white/10">
        <div className="flex items-center gap-2 bg-white/10 rounded-2xl px-4 py-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a message..."
            className="flex-1 bg-transparent text-white placeholder:text-white/30 text-sm outline-none"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || sending}
            className="w-8 h-8 rounded-xl bg-primary flex items-center justify-center text-white disabled:opacity-30 hover:bg-primary/80 transition-all active:scale-90"
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
