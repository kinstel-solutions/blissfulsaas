"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  MessageSquare, Search, Clock, Calendar, ChevronRight,
  Send, Ban, Video, CalendarPlus, Book, Paperclip, FileText,
  X, ExternalLink, ImageIcon, Loader2,
} from "lucide-react";
import { api } from "@/lib/api";
import { createClient } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";

const supabaseClient = createClient();

const ATTACHMENT_PREFIX = "[ATTACHMENT]";
const MAX_FILE_SIZE_MB = 10;
const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/gif", "image/webp", "application/pdf"];

const parseUTCDate = (dateVal: string | Date | number) => {
  if (!dateVal) return new Date();
  if (dateVal instanceof Date) return dateVal;
  if (typeof dateVal === "number") return new Date(dateVal);

  let str = dateVal.trim();
  if (/^\d{4}-\d{2}-\d{2}[ T]\d{2}:\d{2}:\d{2}/.test(str) && !str.endsWith("Z") && !/[+-]\d{2}:?\d{2}$/.test(str)) {
    str = str.replace(" ", "T") + "Z";
  }
  return new Date(str);
};

// ── Attachment rendering helpers ─────────────────────────────────────────────

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
    // Strip the random prefix (timestamp-randomhex.ext)
    const match = raw.match(/^\d+-[a-z0-9]+\.(.+)$/);
    return match ? `attachment.${match[1]}` : raw;
  } catch {
    return "attachment";
  }
}

// ── Inline attachment bubble ─────────────────────────────────────────────────

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
        className={`flex items-center gap-3 px-4 py-3 rounded-[11px] shadow-sm max-w-[260px] transition-opacity hover:opacity-80 ${
          isMe
            ? "bg-primary text-white rounded-br-none"
            : "bg-white text-slate-900 border border-slate-100 rounded-bl-none"
        }`}
      >
        <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${isMe ? "bg-white/20" : "bg-primary/10"}`}>
          <FileText className={`w-5 h-5 ${isMe ? "text-white" : "text-primary"}`} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold truncate">{getFilename(url)}</p>
          <p className={`text-[10px] mt-0.5 flex items-center gap-1 ${isMe ? "text-white/70" : "text-slate-400"}`}>
            <ExternalLink className="w-2.5 h-2.5" /> Open PDF
          </p>
        </div>
      </a>
    );
  }

  return (
    <button
      onClick={() => onImageClick(url)}
      className={`block rounded-[11px] overflow-hidden shadow-sm border transition-opacity hover:opacity-90 active:scale-95 ${
        isMe ? "border-primary/30 rounded-br-none" : "border-slate-100 rounded-bl-none"
      }`}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={url}
        alt="Shared image"
        className="max-w-[220px] md:max-w-[260px] max-h-[200px] object-cover"
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

// ── Upload progress toast ─────────────────────────────────────────────────────

function UploadToast({ filename }: { filename: string }) {
  return (
    <div className="absolute bottom-20 left-1/2 -translate-x-1/2 z-40 flex items-center gap-2.5 bg-slate-900 text-white text-xs font-medium px-4 py-2.5 rounded-full shadow-xl animate-in fade-in slide-in-from-bottom-2 duration-200">
      <Loader2 className="w-3.5 h-3.5 animate-spin" />
      Uploading {filename}…
    </div>
  );
}

// ── Main component ─────────────────────────────────────────────────────────────

export default function MessageHistoryClient({
  initialSessions,
  currentUserId,
}: {
  initialSessions: any[];
  currentUserId: string;
}) {
  const [selectedSession, setSelectedSession] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<"connecting" | "connected" | "error">("connecting");
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadFilename, setUploadFilename] = useState("");
  const [uploadError, setUploadError] = useState("");
  const [unreadCounts, setUnreadCounts] = useState<Record<string, number>>({});
  const [mounted, setMounted] = useState(false);
  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchMessages = useCallback(async (sessionId: string) => {
    setLoading(true);
    try {
      const data = await api.messages.history(sessionId);
      setMessages(data || []);
      await api.messages.markRead(sessionId);
      setUnreadCounts((prev) => ({ ...prev, [sessionId]: 0 }));
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

  const searchParams = useSearchParams();
  const sessionIdFromUrl = searchParams.get("sessionId");

  useEffect(() => {
    setMounted(true);
    fetchUnreadCounts();
    if (sessionIdFromUrl && initialSessions.length > 0) {
      const session = initialSessions.find((s) => s.id === sessionIdFromUrl);
      if (session) setSelectedSession(session);
    }
  }, [fetchUnreadCounts, sessionIdFromUrl, initialSessions]);

  useEffect(() => {
    let roomChannel: any;
    if (selectedSession) {
      fetchMessages(selectedSession.id);

      roomChannel = supabaseClient
        .channel(`room:${selectedSession.id}`)
        .on(
          "postgres_changes",
          { event: "INSERT", schema: "public", table: "Message" },
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
      .channel("global-messages-notifications")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "Message" },
        (payload: any) => {
          const msg = payload.new;
          if (msg.senderId !== currentUserId && (!selectedSession || msg.appointmentId !== selectedSession.id)) {
            const isMySession = initialSessions.some((s) => s.id === msg.appointmentId);
            if (isMySession) {
              setUnreadCounts((prev) => ({
                ...prev,
                [msg.appointmentId]: (prev[msg.appointmentId] || 0) + 1,
              }));
            }
          }
        }
      )
      .subscribe((s) => { if (s === "SUBSCRIBED") setStatus("connected"); });

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

  // ── Send text ──────────────────────────────────────────────────────────────

  const handleSend = async () => {
    if (!selectedSession) return;
    const text = input.trim();
    if (!text || sending) return;
    setInput("");
    setSending(true);
    try {
      await api.messages.send(selectedSession.id, text);
    } catch (e: any) {
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

  // ── File attachment ────────────────────────────────────────────────────────

  const handleAttachClick = () => {
    setUploadError("");
    fileInputRef.current?.click();
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    // Reset input so the same file can be selected again
    if (fileInputRef.current) fileInputRef.current.value = "";

    if (!file || !selectedSession) return;

    if (!ACCEPTED_TYPES.includes(file.type)) {
      setUploadError("Only images (JPG, PNG, GIF, WebP) and PDFs are supported.");
      setTimeout(() => setUploadError(""), 4000);
      return;
    }

    if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
      setUploadError(`File is too large. Maximum size is ${MAX_FILE_SIZE_MB} MB.`);
      setTimeout(() => setUploadError(""), 4000);
      return;
    }

    setUploadFilename(file.name);
    setUploading(true);
    try {
      const url = await api.messages.uploadAttachment(file, selectedSession.id);
      await api.messages.send(selectedSession.id, `${ATTACHMENT_PREFIX}${url}`);
    } catch (err: any) {
      setUploadError(err?.message ?? "Upload failed. Please try again.");
      setTimeout(() => setUploadError(""), 5000);
    } finally {
      setUploading(false);
      setUploadFilename("");
    }
  };

  // ── Filtering / sorting ────────────────────────────────────────────────────

  const filteredSessions = initialSessions
    .filter((s) => {
      const therapist = s.therapist;
      const name = `${therapist?.firstName} ${therapist?.lastName}`.toLowerCase();
      return name.includes(search.toLowerCase());
    })
    .sort((a, b) => {
      if (a.status !== "CANCELLED" && b.status === "CANCELLED") return -1;
      if (a.status === "CANCELLED" && b.status !== "CANCELLED") return 1;
      return new Date(b.scheduledAt).getTime() - new Date(a.scheduledAt).getTime();
    });

  const isCancelled = selectedSession?.status === "CANCELLED";
  const isChatActive =
    selectedSession && !isCancelled
      ? Date.now() <=
        new Date(selectedSession.scheduledAt).getTime() +
          (selectedSession.duration || 60) * 60000 +
          7 * 24 * 60 * 60 * 1000
      : false;

  const activeUpcomingSession = selectedSession
    ? initialSessions.find(
        (s) =>
          s.therapist?.id === selectedSession.therapist?.id &&
          (s.status === "PENDING" || s.status === "CONFIRMED")
      )
    : null;

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <>
      {lightboxUrl && (
        <Lightbox url={lightboxUrl} onClose={() => setLightboxUrl(null)} />
      )}

      <Card className="flex-1 flex flex-row overflow-hidden h-full md:h-[calc(100vh-18rem)] p-0 gap-0">
        {/* Sidebar */}
        <div className={`w-full md:w-80 border-r border-slate-100 flex flex-col ${selectedSession ? "hidden md:flex" : "flex"}`}>
          <div className="p-5 md:p-6 border-b border-slate-50">
            <h2 className="text-2xl font-bold text-slate-900 mb-4 text-center md:hidden">Chat History</h2>
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <Input
                type="text"
                placeholder="Search therapists..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-11 pr-4 py-3.5 md:py-2 text-base md:text-base transition-all bg-slate-50 border-transparent focus-visible:ring-1 focus-visible:ring-primary/20 rounded-xl"
              />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-4 md:p-4 space-y-3">
            {filteredSessions.length === 0 ? (
              <div className="text-center py-16 md:py-20 opacity-30">
                <MessageSquare className="w-10 h-10 mx-auto mb-2" />
                <p className="text-sm md:text-base font-bold uppercase tracking-widest">No history found</p>
              </div>
            ) : (
              filteredSessions.map((s) => {
                const therapist = s.therapist;
                const isActive = selectedSession?.id === s.id;
                const unreadCount = unreadCounts[s.id] || 0;
                return (
                  <Button
                    variant="ghost"
                    key={s.id}
                    onClick={() => setSelectedSession(s)}
                    className={`relative w-full p-5 md:p-4 transition-all flex items-center gap-4 text-left h-auto justify-start border ${
                      isActive
                        ? "bg-primary/5 border-primary/10 hover:bg-primary/5 hover:text-inherit"
                        : "hover:bg-slate-50 border-transparent hover:text-inherit"
                    }`}
                  >
                    <div className={`w-14 h-14 md:w-10 md:h-10 rounded-xl flex items-center justify-center font-bold text-base md:text-base shrink-0 ${isActive ? "bg-primary text-white" : "bg-slate-100 text-slate-500"}`}>
                      {therapist?.firstName?.[0]}{therapist?.lastName?.[0]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <p className={`text-lg md:text-sm font-bold truncate ${isActive ? "text-primary" : "text-slate-900"}`}>
                          {therapist?.firstName} {therapist?.lastName}
                        </p>
                        {s.status === "CANCELLED" && (
                          <span className="text-xs md:text-[8px] font-bold uppercase px-2 py-0.5 bg-red-50 text-red-500 rounded-md shrink-0">Cancelled</span>
                        )}
                        {s.status === "COMPLETED" && (
                          <span className="text-xs md:text-[8px] font-bold uppercase px-2 py-0.5 bg-blue-50 text-blue-500 rounded-md shrink-0">Done</span>
                        )}
                      </div>
                      <div className="flex items-center justify-between gap-1.5 mt-1.5">
                        <div className={`flex items-center gap-1.5 text-sm md:text-xs font-semibold ${unreadCount > 0 ? "text-primary" : "text-slate-600"}`}>
                          <Calendar className="w-4 h-4 md:w-3 md:h-3" />
                          {mounted
                            ? new Date(s.scheduledAt).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric", timeZone: "Asia/Kolkata" })
                            : "Loading..."}
                        </div>
                        {unreadCount > 0 && (
                          <div className="w-6 h-6 md:w-5 md:h-5 bg-primary text-white text-xs md:text-[10px] font-bold rounded-full flex items-center justify-center shadow-sm shrink-0">
                            {unreadCount}
                          </div>
                        )}
                      </div>
                    </div>
                  </Button>
                );
              })
            )}
          </div>
        </div>

        {/* Main chat area */}
        <div className={`flex-1 flex flex-col bg-slate-50/30 ${!selectedSession ? "hidden md:flex" : "flex"}`}>
          {!selectedSession ? (
            <div className="flex-1 flex flex-col items-center justify-center p-6 md:p-12 text-center">
              <div className="w-16 h-16 md:w-20 md:h-20 bg-white rounded-lg md:rounded-xl shadow-lg border border-slate-100 flex items-center justify-center mb-6 text-slate-200">
                <MessageSquare className="w-8 h-8 md:w-10 md:h-10" />
              </div>
              <h3 className="text-lg md:text-xl font-heading font-medium text-slate-800 mb-2">Message History</h3>
              <p className="text-base md:text-sm text-slate-400 max-w-xs leading-relaxed">
                Select a therapist from the sidebar to review your clinical chat history for each session.
              </p>
            </div>
          ) : (
            <>
              {/* Thread header */}
              <div className="p-3 md:p-6 bg-white border-b border-slate-100 flex items-center justify-between sticky top-0 z-10">
                <div className="flex items-center gap-3 md:gap-4 overflow-hidden">
                  <Button
                    variant="ghost"
                    onClick={() => setSelectedSession(null)}
                    className="md:hidden p-2 -ml-2 text-slate-400 hover:text-slate-900 shrink-0 h-auto w-auto"
                  >
                    <ChevronRight className="w-5 h-5 rotate-180" />
                  </Button>
                  <div className="min-w-0">
                    <h3 className="text-lg md:text-sm font-bold text-slate-900 leading-none truncate">
                      {selectedSession.therapist?.firstName} {selectedSession.therapist?.lastName}
                    </h3>
                    <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
                      <p className="text-base md:text-[10px] text-slate-600 font-bold uppercase tracking-widest flex items-center gap-1">
                        <Clock className="w-3 h-3 md:w-3 md:h-3" />
                        {mounted
                          ? new Date(selectedSession.scheduledAt).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric", timeZone: "Asia/Kolkata" })
                          : "..."}
                      </p>
                      {isCancelled ? (
                        <span className="text-red-500 text-xs md:text-[9px] font-bold uppercase flex items-center gap-1 bg-red-50 px-2 py-0.5 rounded-full">
                          <Ban className="w-3 h-3 md:w-2.5 md:h-2.5" /> Cancelled
                        </span>
                      ) : isChatActive && (
                        <span className="text-green-500 font-bold text-xs md:text-[9px] uppercase flex items-center gap-1 bg-green-50 px-2 py-0.5 rounded-full">
                          <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" /> Active
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                {/* Actions */}
                <div className="flex items-center gap-2">
                  {activeUpcomingSession ? (
                    <Link
                      href={`/dashboard/sessions/${activeUpcomingSession.id}`}
                      className="flex items-center gap-1.5 px-4 py-2 md:px-4 md:py-2 bg-primary text-primary-foreground text-xs md:text-xs font-bold uppercase tracking-widest rounded-xl hover:shadow-lg hover:-translate-y-0.5 transition-all shadow-primary/20 whitespace-nowrap"
                    >
                      <Book className="w-4 h-4 md:w-3.5 md:h-3.5" />
                      <span className="hidden md:inline">View Session</span>
                      <span className="md:hidden text-[11px]">View Session</span>
                    </Link>
                  ) : (
                    <Link
                      href={`/dashboard/sessions/book/${selectedSession.therapist?.id}`}
                      className="flex items-center gap-1.5 px-4 py-2 md:px-4 md:py-2 bg-primary/10 text-primary hover:bg-primary/20 text-xs md:text-xs font-bold uppercase tracking-widest rounded-xl transition-all whitespace-nowrap"
                    >
                      <CalendarPlus className="w-4 h-4 md:w-3.5 md:h-3.5" />
                      <span className="hidden md:inline">Book Consultation</span>
                      <span className="md:hidden text-[11px]">Book</span>
                    </Link>
                  )}
                </div>
              </div>

              {/* Message list */}
              <div className="flex-1 overflow-y-auto p-5 md:p-8 space-y-5 md:space-y-6 relative">
                {loading && messages.length === 0 ? (
                  <div className="flex h-full items-center justify-center">
                    <div className="w-6 h-6 border-2 border-slate-200 border-t-primary rounded-full animate-spin" />
                  </div>
                ) : messages.length === 0 ? (
                  <div className="flex flex-col h-full items-center justify-center text-slate-500 opacity-60 space-y-2">
                    <MessageSquare className="w-10 h-10" />
                    <p className="text-sm md:text-base font-bold uppercase tracking-widest text-center">No messages in this thread</p>
                  </div>
                ) : (
                  messages.map((m) => {
                    const isMe = m.senderId === currentUserId;
                    const attachment = isAttachment(m.content);
                    const attUrl = attachment ? getAttachmentUrl(m.content) : null;

                    return (
                      <div key={m.id} className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}>
                        {attachment && attUrl ? (
                          <AttachmentBubble
                            url={attUrl}
                            isMe={isMe}
                            onImageClick={(u) => setLightboxUrl(u)}
                          />
                        ) : (
                          <div className={`max-w-[85%] md:max-w-[70%] p-4 md:p-4 rounded-[11px] text-base md:text-sm shadow-sm whitespace-pre-wrap ${
                            isMe
                              ? "bg-primary text-white rounded-br-none"
                              : "bg-white text-slate-900 border border-slate-100 rounded-bl-none"
                          }`}>
                            {m.content.split("\n").map((line: string, i: number) => (
                              <span key={i}>
                                {line.split(/(\*\*.*?\*\*)/).map((part: string, j: number) =>
                                  part.startsWith("**") && part.endsWith("**")
                                    ? <strong key={j}>{part.slice(2, -2)}</strong>
                                    : part
                                )}
                                {i !== m.content.split("\n").length - 1 && <br />}
                              </span>
                            ))}
                          </div>
                        )}
                        <span className="mt-2 text-xs md:text-xs font-bold text-slate-500 uppercase tracking-tighter">
                          {mounted ? parseUTCDate(m.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : ""}
                        </span>
                      </div>
                    );
                  })
                )}
                <div ref={bottomRef} />
              </div>

              {/* Footer */}
              {isChatActive ? (
                <div className="p-3 md:p-4 bg-white border-t border-slate-100 relative">
                  {/* Upload progress toast */}
                  {uploading && <UploadToast filename={uploadFilename} />}

                  {/* Error toast */}
                  {uploadError && (
                    <div className="absolute bottom-20 left-1/2 -translate-x-1/2 z-40 flex items-center gap-2 bg-red-600 text-white text-xs font-medium px-4 py-2.5 rounded-full shadow-xl animate-in fade-in slide-in-from-bottom-2 duration-200 whitespace-nowrap">
                      {uploadError}
                    </div>
                  )}

                  {/* Hidden file input */}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/gif,image/webp,application/pdf"
                    className="hidden"
                    onChange={handleFileSelect}
                  />

                  <div className="flex items-center gap-2 bg-slate-50 border border-slate-100 rounded-lg md:rounded-2xl pl-2 pr-0 py-0 md:pl-2">
                    {/* Attach button */}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleAttachClick}
                      disabled={uploading || sending}
                      title="Attach file (Images/PDFs, Max 10MB)"
                      className="w-9 h-9 p-0 shrink-0 text-slate-400 hover:text-primary hover:bg-primary/5 rounded-xl transition-colors"
                    >
                      {uploading ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Paperclip className="w-4 h-4" />
                      )}
                    </Button>

                    <Input
                      type="text"
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={handleKeyDown}
                      placeholder="Type a message…"
                      disabled={uploading}
                      className="flex-1 bg-transparent text-slate-800 placeholder:text-slate-400 text-base md:text-sm outline-none py-2 border-none focus-visible:ring-0 focus-visible:ring-offset-0"
                    />
                    <Button
                      variant="default"
                      onClick={handleSend}
                      disabled={!input.trim() || sending || uploading}
                      className="w-11 h-11 md:w-11 md:h-11 flex items-center justify-center transition-all active:scale-95 shrink-0 p-0 rounded-l-none rounded-r-xl"
                    >
                      <Send className="w-5 h-5 md:w-4 md:h-4 md:-ml-0.5" />
                    </Button>
                  </div>
                  <div className="mt-1.5 pl-2 text-[10px] text-slate-400 font-medium">
                    Supports PDFs and Images up to 10MB
                  </div>
                </div>
              ) : (
                <div className="p-6 bg-white/50 border-t border-slate-100 text-center">
                  <p className="text-sm md:text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-2">
                    Read Only History
                  </p>
                  <p className="text-sm md:text-[10px] text-slate-400 leading-relaxed">
                    {isCancelled
                      ? "Chatting is disabled for cancelled appointments."
                      : "This chat window closed 7 days after the consultation."}
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      </Card>
    </>
  );
}
