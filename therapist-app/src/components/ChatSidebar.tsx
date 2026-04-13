"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase";
import { api } from "@/lib/api";
import { MessageSquare, Send } from "lucide-react";

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
}

const supabaseClient = createClient();

export default function ChatSidebar({
  appointmentId,
  currentUserId,
}: ChatSidebarProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [status, setStatus] = useState<"connecting" | "connected" | "error">("connecting");
  const bottomRef = useRef<HTMLDivElement>(null);

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

    // Fallback polling
    const poll = setInterval(loadHistory, 5000);

    return () => {
      supabaseClient.removeChannel(channel);
      clearInterval(poll);
    };
  }, [appointmentId, loadHistory]);

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
    } catch {
      setInput(text);
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

  return (
    <div className="flex flex-col flex-1 min-h-0">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          <h3 className="text-xs font-bold uppercase tracking-widest text-primary/60 flex items-center gap-2">
            <MessageSquare className="w-4 h-4" /> Session Chat
          </h3>
          {status !== 'connected' && (
            <span className={`text-xs px-2 py-0.5 rounded-full font-bold uppercase tracking-widest ${
              status === 'error' ? 'bg-red-100 text-red-700' : 
              'bg-yellow-100 text-yellow-700'
            }`}>
              {status}
            </span>
          )}
        </div>

      {/* Message List */}
      <div className="flex-1 overflow-y-auto space-y-3 min-h-0 pr-1">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-32 gap-2 text-slate-300">
            <MessageSquare className="w-6 h-6" />
            <p className="text-xs font-bold uppercase tracking-widest">
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
                className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                  isMe
                    ? "bg-slate-900 text-white rounded-br-sm"
                    : "bg-slate-100 text-slate-800 rounded-bl-sm"
                }`}
              >
                <p>{msg.content}</p>
                <p
                  className={`text-xs mt-1 font-bold uppercase tracking-wider ${
                    isMe ? "text-white/40" : "text-slate-400"
                  }`}
                >
                  {new Date(msg.createdAt).toLocaleTimeString([], {
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
      <div className="mt-4 pt-4 border-t border-slate-100">
        <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-2xl px-4 py-2.5">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Send a message..."
            className="flex-1 bg-transparent text-slate-800 placeholder:text-slate-400 text-sm outline-none"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || sending}
            className="w-8 h-8 rounded-xl bg-slate-900 flex items-center justify-center text-white disabled:opacity-30 hover:bg-primary transition-all active:scale-90"
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
