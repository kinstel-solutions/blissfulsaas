"use client";

import { useState, useEffect } from "react";
import { 
  User, 
  Mail, 
  Calendar, 
  MessageSquare, 
  FileText, 
  Clock, 
  Video,
  Send,
  Loader2,
  ChevronLeft,
  Phone,
  Activity,
  ExternalLink,
  X
} from "lucide-react";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { useRouter } from "next/navigation";
import PatientIntakeContent from "./PatientIntakeContent";
import EnhancedAppointmentsList from "./EnhancedAppointmentsList";
import MessageHistoryClient from "./MessageHistoryClient";

// Helper to clean up filenames
const getFilename = (url: string) => {
  try {
    const parts = new URL(url).pathname.split("/");
    const raw = parts[parts.length - 1] ?? "attachment";
    const match = raw.match(/^\d+-[a-z0-9]+\.(.+)$/);
    return match ? `attachment.${match[1]}` : raw;
  } catch {
    return "attachment";
  }
};

// Lightbox component
function Lightbox({ url, onClose }: { url: string; onClose: () => void }) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-[200] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
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

interface Patient {
  id: string;
  firstName: string;
  lastName: string;
  user?: {
    email: string;
  };
  sessionCount?: number;
  latestSession?: string;
  latestSessionNotes?: string;
  age?: string | number;
  pronouns?: string;
  city?: string;
  reasonForSeeking?: string;
  mentalHealthHistory?: string;
  currentMedications?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
}

export default function PatientDetailView({ patient, sessions, currentUserId }: { patient: Patient; sessions: any[], currentUserId?: string }) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'profile' | 'sessions' | 'messages' | 'resources'>('profile');
  const [patientDocs, setPatientDocs] = useState<any[]>([]);
  const [docsLoading, setDocsLoading] = useState(false);
  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null);

  useEffect(() => {
    if (patient?.id) {
      setDocsLoading(true);
      api.messages.patientHistory(patient.id)
        .then((data: any[]) => {
          const docs = (data || []).filter(
            (msg: any) => msg.content.startsWith("[ATTACHMENT]") && msg.sender.role === "PATIENT"
          );
          setPatientDocs(docs);
        })
        .catch(console.error)
        .finally(() => setDocsLoading(false));
    }
  }, [patient?.id]);

  if (!patient) return null;

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-500 pb-20">
      {/* Back Link */}
      <button 
        onClick={() => router.back()} 
        className="flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-slate-600 uppercase tracking-[0.25em] transition-colors"
      >
        <ChevronLeft className="w-4 h-4 shrink-0" /> Patients
      </button>

      {/* Header Profile Info */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-5">
          <Avatar className="w-16 h-16 rounded-full bg-primary flex items-center justify-center text-white font-extrabold text-2xl shrink-0 shadow-sm">
            <AvatarFallback className="bg-transparent text-current font-extrabold">
              {patient.firstName?.[0]}
            </AvatarFallback>
          </Avatar>
          <div className="space-y-1.5">
            <h2 className="text-3xl font-extrabold text-slate-900 leading-none tracking-tight font-sans">
              {patient.firstName} {patient.lastName}
            </h2>
          </div>
        </div>
      </div>

      {/* Horizontal Metadata Pill-Bar */}
      <div className="bg-white border border-slate-200/60 rounded-2xl md:rounded-full p-4 md:py-2 md:px-6 grid grid-cols-2 md:flex md:flex-row items-center md:items-center justify-between gap-4 md:gap-6 shadow-2xs">
        {/* Item 1: Date */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-emerald-50/60 text-emerald-600 flex items-center justify-center border border-emerald-100/30 shrink-0">
            <Calendar className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              {patient.latestSession && new Date(patient.latestSession) > new Date() ? "Upcoming Session" : "Last Session"}
            </div>
            <div className="text-sm font-bold text-slate-900 mt-0.5 truncate">
              {patient.latestSession ? new Date(patient.latestSession).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'Asia/Kolkata' }) : 'Never'}
            </div>
          </div>
        </div>

        {/* Item 2: Engagement */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-indigo-50/60 text-indigo-600 flex items-center justify-center border border-indigo-100/30 shrink-0">
            <Activity className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Engagement</div>
            <div className="text-sm font-bold text-slate-900 mt-0.5 truncate">{patient.sessionCount || 0} Sessions</div>
          </div>
        </div>

        {/* Item 3: Email */}
        <div className="flex items-center gap-3 col-span-2 md:col-span-1">
          <div className="w-8 h-8 rounded-full bg-sky-50/60 text-sky-600 flex items-center justify-center border border-sky-100/30 shrink-0">
            <Mail className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Email</div>
            <div className="text-sm font-bold text-slate-900 mt-0.5 truncate">{patient.user?.email || "N/A"}</div>
          </div>
        </div>

        {/* Item 4: Patient ID */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-amber-50/60 text-amber-600 flex items-center justify-center border border-amber-100/30 shrink-0">
            <User className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Patient ID</div>
            <div className="text-sm font-bold text-slate-900 mt-0.5 truncate">{patient.id.slice(0, 8).toUpperCase()}</div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-slate-200 flex gap-6 overflow-x-auto scrollbar-none whitespace-nowrap -mx-4 px-4 md:mx-0 md:px-0">
        {(['profile', 'sessions', 'messages', 'resources'] as const).map((tab) => (
          <Button
            variant="ghost"
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`pb-4 text-sm font-bold uppercase tracking-widest transition-all relative rounded-none hover:bg-transparent px-0 h-auto shadow-none shrink-0 ${
              activeTab === tab ? 'text-primary' : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            {tab}
            {activeTab === tab && (
              <div className="absolute bottom-0 left-0 w-full h-0.5 bg-primary rounded-full" />
            )}
          </Button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="pt-2">
        {activeTab === 'profile' && (
          <div className="space-y-8">
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-slate-900">Client Intake Data</h3>
            </div>
            
            <Card className="p-8 shadow-sm border-slate-100">
              <PatientIntakeContent patient={patient as any} />
            </Card>
          </div>
        )}

        {activeTab === 'sessions' && (
          <div className="space-y-6">
            <EnhancedAppointmentsList initialAppointments={sessions} />
          </div>
        )}

        {activeTab === 'messages' && (
           <div className="h-[60vh] min-h-[500px]">
             <MessageHistoryClient initialSessions={sessions} currentUserId={currentUserId || ""} />
           </div>
        )}

        {activeTab === 'resources' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-900">Patient Uploaded Resources</h3>
            </div>

            {docsLoading ? (
              <Card className="p-16 text-center">
                <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" />
                <p className="text-sm text-slate-400 mt-4">Loading patient documents...</p>
              </Card>
            ) : patientDocs.length === 0 ? (
              <Card className="p-16 text-center">
                <FileText className="w-12 h-12 mx-auto text-slate-200 mb-4" />
                <h4 className="text-base font-bold text-slate-900">No documents found</h4>
                <p className="text-sm text-slate-400 mt-2 max-w-xs mx-auto">
                  Any images or PDF files uploaded by this patient in the chat will show up here.
                </p>
              </Card>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3.5">
                {patientDocs.map((msg) => {
                  const url = msg.content.slice("[ATTACHMENT]".length);
                  const isPdfFile = url.toLowerCase().includes(".pdf");
                  const filename = getFilename(url);

                  return (
                    <Card
                      key={msg.id}
                      className="p-2.5 bg-white border border-slate-200/60 rounded-xl hover:shadow-md transition-all flex flex-col justify-between group cursor-pointer relative overflow-hidden"
                      onClick={() => {
                        if (isPdfFile) {
                          window.open(url, "_blank", "noopener,noreferrer");
                        } else {
                          setLightboxUrl(url);
                        }
                      }}
                    >
                      {/* Compact Square Preview Box */}
                      {isPdfFile ? (
                        <div className="w-full aspect-square rounded-lg bg-red-50/70 flex flex-col items-center justify-center border border-red-100/30 gap-1.5 shrink-0 transition-colors group-hover:bg-red-50">
                          <FileText className="w-8 h-8 text-red-500" />
                          <span className="text-[9px] font-bold text-red-600/80 uppercase tracking-widest">PDF</span>
                        </div>
                      ) : (
                        <div className="w-full aspect-square rounded-lg overflow-hidden border border-slate-100 shrink-0 bg-slate-50 relative">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={url}
                            alt="preview"
                            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                          />
                          <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <span className="bg-white/90 text-slate-800 text-[9px] font-bold px-2 py-1 rounded-md shadow-sm uppercase tracking-wider">Expand</span>
                          </div>
                        </div>
                      )}

                      {/* Info Footer inside card */}
                      <div className="mt-2.5 min-w-0">
                        <h4 className="text-[11px] font-bold text-slate-700 truncate leading-tight" title={filename}>
                          {filename}
                        </h4>
                        <p className="text-[9px] text-slate-400 mt-1 font-medium leading-none">
                          {new Date(msg.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                        </p>
                      </div>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Lightbox for full screen viewing */}
      {lightboxUrl && (
        <Lightbox url={lightboxUrl} onClose={() => setLightboxUrl(null)} />
      )}
    </div>
  );
}

function Plus({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
    </svg>
  );
}
