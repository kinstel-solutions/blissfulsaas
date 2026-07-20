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
  Activity
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
  const [activeTab, setActiveTab] = useState<'profile' | 'sessions' | 'messages'>('profile');

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
      <div className="border-b border-slate-200 flex gap-8">
        {(['profile', 'sessions', 'messages'] as const).map((tab) => (
          <Button
            variant="ghost"
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`pb-4 text-sm font-bold uppercase tracking-widest transition-all relative rounded-none hover:bg-transparent px-0 h-auto shadow-none ${
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
      </div>
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
