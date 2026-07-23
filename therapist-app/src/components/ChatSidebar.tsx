"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase";
import { api } from "@/lib/api";
import {
  MessageSquare,
  Send,
  Paperclip,
  FileText,
  X,
  ExternalLink,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface Message {
  id: string;
  content: string;
  createdAt: string;
  senderId: string;
  appointmentId?: string;
  sender?: { id: string; email: string; role: string };
}

interface ChatSidebarProps {
  appointmentId: string;
  currentUserId: string;
}

const supabaseClient = createClient();

const ATTACHMENT_PREFIX = "[ATTACHMENT]";
const MAX_FILE_SIZE_MB = 10;
const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/gif", "image/webp", "application/pdf"];

function isAttachment(content: string) {
  return content.startsWith(ATTACHMENT_PREFIX);
}

function getAttachmentUrl(content: string) {
  return content.slice(ATTACHMENT_PREFIX.length);
}

function isPdf(url: string) {
  return url.toLowerCase().includes(".pdf");
}

function getFilename(url: string) {
  try {
    const parts = new URL(url).pathname.split("/");
    const raw = parts[parts.length - 1] ?? "attachment";
    const match = raw.match(/^\d+-[a-z0-9]+\.(.+)$/);
    return match ? `attachment.${match[1]}` : raw;
  } catch {
    return "attachment";
  }
}

// ── Attachment Bubble ────────────────────────────────────────────────────────
function AttachmentBubble({
  url,
  isMe,
  onImageClick,
}: {
  url: string;
  isMe: boolean;
  onImageClick: (url: string) => void;
}) {
  if (isPdf(url)) {
    return (
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs transition-opacity hover:opacity-80 ${
          isMe
            ? "bg-slate-900 text-white rounded-br-none"
            : "bg-slate-100 text-slate-800 rounded-bl-none"
        }`}
      >
        <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${isMe ? "bg-white/20" : "bg-primary/10"}`}>
          <FileText className={`w-4 h-4 ${isMe ? "text-white" : "text-primary"}`} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold truncate text-[11px]">{getFilename(url)}</p>
          <p className={`text-[9px] flex items-center gap-1 mt-0.5 ${isMe ? "text-white/70" : "text-slate-400"}`}>
            <ExternalLink className="w-2.5 h-2.5" /> Open PDF
          </p>
        </div>
      </a>
    );
  }

  return (
    <button
      onClick={() => onImageClick(url)}
      className={`block rounded-xl overflow-hidden border transition-opacity hover:opacity-90 active:scale-95 ${
        isMe ? "border-slate-800 rounded-br-none" : "border-slate-200 rounded-bl-none"
      }`}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={url}
        alt="Shared image"
        className="max-w-[180px] sm:max-w-[200px] max-h-[160px] object-cover"
        loading="lazy"
      />
    </button>
  );
}

// ── Lightbox ─────────────────────────────────────────────────────────────────
function Lightbox({ url, onClose }: { url: string; onClose: () => void }) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}
    >
      <button
        className="absolute top-4 right-4 w-10 h-10 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
        onClick={onClose}
        aria-label="Close"
      >
        <X className="w-5 h-5" />
      </button>
      <div
        className="relative max-w-[90vw] max-h-[90vh] flex flex-col items-center gap-3"
        onClick={(e) => e.stopPropagation()}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={url}
          alt="Full size"
          className="max-w-full max-h-[80vh] object-contain rounded-xl shadow-2xl"
        />
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 text-white/70 hover:text-white text-xs font-medium transition-colors"
        >
          <ExternalLink className="w-3.5 h-3.5" /> Open original
        </a>
      </div>
    </div>
  );
}

export default function ChatSidebar({
  appointmentId,
  currentUserId,
}: ChatSidebarProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadFilename, setUploadFilename] = useState("");
  const [uploadError, setUploadError] = useState("");
  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null);
  const [status, setStatus] = useState<"connecting" | "connected" | "error">("connecting");
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const prevCountRef = useRef<number>(0);

  const scrollToBottomInternal = useCallback(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, []);

  const loadHistory = useCallback(async () => {
    try {
      const history = await api.messages.history(appointmentId);
      if (Array.isArray(history)) {
        setMessages((prev) => {
          // Compare if anything actually changed before setting new state
          if (
            prev.length === history.length &&
            prev.every((m, idx) => m.id === history[idx]?.id)
          ) {
            return prev; // Return exact reference to prevent re-render
          }
          return history;
        });
      }
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
          if (msg.appointmentId && msg.appointmentId !== appointmentId) return;

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

    const poll = setInterval(loadHistory, 3000);

    return () => {
      supabaseClient.removeChannel(channel);
      clearInterval(poll);
    };
  }, [appointmentId, loadHistory]);

  // Scroll ONLY the inner chat container element when new messages are added
  useEffect(() => {
    if (messages.length > prevCountRef.current) {
      scrollToBottomInternal();
    }
    prevCountRef.current = messages.length;
  }, [messages, scrollToBottomInternal]);

  const handleSend = async () => {
    const text = input.trim();
    if (!text || sending) return;
    setInput("");
    setSending(true);
    try {
      const sentMsg = await api.messages.send(appointmentId, text);
      if (sentMsg && sentMsg.id) {
        setMessages((prev) => {
          if (prev.some((m) => m.id === sentMsg.id)) return prev;
          return [...prev, sentMsg];
        });
      } else {
        loadHistory();
      }
      setTimeout(scrollToBottomInternal, 50);
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

  const handleAttachClick = () => {
    setUploadError("");
    fileInputRef.current?.click();
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (fileInputRef.current) fileInputRef.current.value = "";

    if (!file) return;

    if (!ACCEPTED_TYPES.includes(file.type)) {
      setUploadError("Only JPG, PNG, GIF, WebP, and PDF files are allowed.");
      setTimeout(() => setUploadError(""), 4000);
      return;
    }

    if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
      setUploadError(`File too large (max ${MAX_FILE_SIZE_MB}MB).`);
      setTimeout(() => setUploadError(""), 4000);
      return;
    }

    setUploadFilename(file.name);
    setUploading(true);
    try {
      const url = await api.messages.uploadAttachment(file, appointmentId);
      const sentMsg = await api.messages.send(appointmentId, `${ATTACHMENT_PREFIX}${url}`);
      if (sentMsg && sentMsg.id) {
        setMessages((prev) => {
          if (prev.some((m) => m.id === sentMsg.id)) return prev;
          return [...prev, sentMsg];
        });
      } else {
        loadHistory();
      }
      setTimeout(scrollToBottomInternal, 50);
    } catch (err: any) {
      setUploadError(err?.message ?? "Upload failed. Try again.");
      setTimeout(() => setUploadError(""), 5000);
    } finally {
      setUploading(false);
      setUploadFilename("");
    }
  };

  return (
    <>
      {lightboxUrl && (
        <Lightbox url={lightboxUrl} onClose={() => setLightboxUrl(null)} />
      )}

      <div className="flex flex-col flex-1 min-h-0 relative">
        {/* Hidden File Input */}
        <input
          ref={fileInputRef}
          type="file"
          accept={ACCEPTED_TYPES.join(",")}
          onChange={handleFileSelect}
          className="hidden"
        />

        {/* Header Status */}
        <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-100 shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <h3 className="text-xs font-bold uppercase tracking-widest text-slate-600 flex items-center gap-1.5">
              <MessageSquare className="w-3.5 h-3.5 text-slate-400" /> Live Chat
            </h3>
          </div>
          {status !== "connected" && (
            <span
              className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-widest ${
                status === "error"
                  ? "bg-red-100 text-red-700"
                  : "bg-amber-100 text-amber-700"
              }`}
            >
              {status}
            </span>
          )}
        </div>

        {/* Uploading indicator banner */}
        {uploading && (
          <div className="mb-2 px-3 py-1.5 rounded-xl bg-slate-900 text-white text-xs flex items-center gap-2 animate-in fade-in shrink-0">
            <Loader2 className="w-3.5 h-3.5 animate-spin shrink-0 text-primary" />
            <span className="truncate">Uploading {uploadFilename}…</span>
          </div>
        )}

        {/* Upload error banner */}
        {uploadError && (
          <div className="mb-2 px-3 py-1.5 rounded-xl bg-red-50 text-red-700 border border-red-200 text-xs font-medium animate-in fade-in shrink-0">
            {uploadError}
          </div>
        )}

        {/* Message List Container (isolated scrolling) */}
        <div
          ref={chatContainerRef}
          className="flex-1 overflow-y-auto space-y-3 min-h-0 pr-1"
        >
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-36 gap-2 text-slate-300">
              <MessageSquare className="w-7 h-7" />
              <p className="text-xs font-bold uppercase tracking-widest text-slate-400">
                No messages in this session yet
              </p>
            </div>
          )}

          {messages.map((msg) => {
            const isMe = msg.senderId === currentUserId;
            const hasAttachment = isAttachment(msg.content);

            return (
              <div
                key={msg.id}
                className={`flex ${isMe ? "justify-end" : "justify-start"}`}
              >
                {hasAttachment ? (
                  <div className="flex flex-col items-end">
                    <AttachmentBubble
                      url={getAttachmentUrl(msg.content)}
                      isMe={isMe}
                      onImageClick={(url) => setLightboxUrl(url)}
                    />
                    <span
                      className={`text-[9px] mt-1 font-bold uppercase tracking-wider ${
                        isMe ? "text-slate-400" : "text-slate-400"
                      }`}
                    >
                      {new Date(msg.createdAt).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                ) : (
                  <div
                    className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-xs leading-relaxed shadow-xs ${
                      isMe
                        ? "bg-slate-900 text-white rounded-br-sm"
                        : "bg-slate-100 text-slate-800 rounded-bl-sm"
                    }`}
                  >
                    <p className="whitespace-pre-wrap break-words">{msg.content}</p>
                    <p
                      className={`text-[9px] mt-1 font-bold uppercase tracking-wider ${
                        isMe ? "text-white/40" : "text-slate-400"
                      }`}
                    >
                      {new Date(msg.createdAt).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Input area */}
        <div className="mt-3 pt-3 border-t border-slate-100 shrink-0">
          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-2xl px-3 py-2">
            <Button
              variant="ghost"
              type="button"
              onClick={handleAttachClick}
              disabled={uploading || sending}
              className="w-7 h-7 shrink-0 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 p-0 transition-colors"
              title="Attach image or PDF"
            >
              <Paperclip className="w-4 h-4" />
            </Button>
            <Input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Send a message..."
              className="flex-1 bg-transparent text-slate-800 placeholder:text-slate-400 text-xs outline-none border-none focus-visible:ring-0 focus-visible:ring-offset-0 h-7 px-1"
            />
            <Button
              variant="ghost"
              onClick={handleSend}
              disabled={!input.trim() || sending || uploading}
              className="w-7 h-7 shrink-0 rounded-xl bg-slate-900 flex items-center justify-center text-white disabled:opacity-30 hover:bg-primary transition-all active:scale-90 p-0 hover:text-white"
            >
              <Send className="w-3.5 h-3.5 shrink-0" />
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
