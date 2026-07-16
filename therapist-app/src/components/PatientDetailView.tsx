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
  Phone
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

export default function PatientDetailView({ patient, sessions }: { patient: Patient; sessions: any[] }) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'profile' | 'sessions' | 'messages'>('profile');
  const [messages, setMessages] = useState<any[]>([]);
  const [messageLoading, setMessageLoading] = useState(false);

  useEffect(() => {
    if (patient && activeTab === 'messages') {
      fetchMessageHistory();
    }
  }, [patient, activeTab]);

  const fetchMessageHistory = async () => {
    if (!patient) return;
    setMessageLoading(true);
    try {
      const data = await api.messages.patientHistory(patient.id);
      setMessages(data);
    } catch (error) {
      console.error("Failed to fetch message history", error);
    } finally {
      setMessageLoading(false);
    }
  };

  if (!patient) return null;

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-500 pb-20">
      {/* Header */}
      <header className="flex items-center gap-6">
        <Button 
          variant="outline" 
          onClick={() => router.back()}
          className="w-12 h-12 rounded-xl flex items-center justify-center p-0 shrink-0"
        >
          <ChevronLeft className="w-5 h-5 text-slate-500" />
        </Button>
        <div className="flex items-center gap-5 flex-1">
          <Avatar className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-bold text-2xl shadow-inner shrink-0">
            <AvatarFallback className="bg-transparent text-current font-bold">{patient.firstName?.[0]}{patient.lastName?.[0]}</AvatarFallback>
          </Avatar>
          <div>
            <h2 className="text-3xl font-bold text-slate-900 leading-tight font-sans">
              {patient.firstName} {patient.lastName}
            </h2>
            <p className="text-sm text-slate-400 font-bold uppercase tracking-widest mt-1.5">Patient Identity</p>
          </div>
        </div>
      </header>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-6 flex flex-col justify-between h-32 shadow-sm border-slate-100">
          <div className="flex items-center gap-2 text-slate-400">
            <Calendar className="w-4 h-4" />
            <span className="text-xs font-bold uppercase tracking-widest">Total Sessions</span>
          </div>
          <p className="text-4xl font-bold text-slate-900 font-sans">{patient.sessionCount || 0}</p>
        </Card>
        <Card className="p-6 flex flex-col justify-between h-32 shadow-sm border-slate-100">
          <div className="flex items-center gap-2 text-slate-400">
            <Clock className="w-4 h-4" />
            <span className="text-xs font-bold uppercase tracking-widest">Last Seen</span>
          </div>
          <p className="text-2xl font-bold text-slate-900">
            {patient.latestSession ? new Date(patient.latestSession).toLocaleDateString() : 'Never'}
          </p>
        </Card>
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
           <Card className="flex flex-col min-h-[500px] h-[60vh] shadow-sm border-slate-100 overflow-hidden">
             <div className="flex-1 space-y-6 overflow-y-auto p-8">
                {messageLoading ? (
                   <div className="h-full flex flex-col items-center justify-center opacity-40">
                      <Loader2 className="w-10 h-10 animate-spin mb-4" />
                      <p className="text-xs font-bold uppercase tracking-widest">Loading Conversation...</p>
                   </div>
                ) : messages.length === 0 ? (
                   <div className="h-full flex flex-col items-center justify-center opacity-40 text-center p-10">
                      <MessageSquare className="w-16 h-16 mb-6 text-slate-300" />
                      <p className="text-lg font-medium text-slate-600">No messages with this patient yet.</p>
                      <p className="text-sm mt-2 text-slate-400">Messages from all sessions will appear here.</p>
                   </div>
                ) : (
                  messages.map((msg, idx) => {
                    const isMe = msg.sender.role === 'THERAPIST';
                    return (
                      <div key={msg.id || idx} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                        <div className={`rounded-2xl p-4 max-w-[70%] text-base shadow-sm ${
                          isMe ? 'bg-primary text-primary-foreground rounded-tr-sm' : 'bg-slate-50 border border-slate-100 text-slate-800 rounded-tl-sm'
                        }`}>
                          {msg.content}
                          <div className={`text-[10px] mt-2 font-bold uppercase tracking-tighter opacity-50 ${isMe ? 'text-right' : ''}`}>
                            {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
             </div>
             <div className="p-4 border-t border-slate-100 bg-slate-50/50">
                 <div className="relative max-w-4xl mx-auto">
                    <Input 
                      type="text" 
                      placeholder="Type a message..."
                      className="w-full text-base transition-all pr-14 bg-white border-slate-200 h-14 rounded-xl shadow-sm"
                    />
                    <Button className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-lg flex items-center justify-center transition-all p-0 active:scale-95 shadow-sm">
                      <Send className="w-5 h-5" />
                    </Button>
                 </div>
             </div>
           </Card>
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
