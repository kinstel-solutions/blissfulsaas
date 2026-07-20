"use client";

import { useState, useEffect } from "react";
import { 
  X, 
  User, 
  Mail, 
  Calendar, 
  MessageSquare, 
  FileText, 
  Clock, 
  Video,
  Send,
  Loader2,
  ChevronRight
} from "lucide-react";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";

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
}

interface PatientDetailPanelProps {
  patient: Patient | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function PatientDetailPanel({ patient, isOpen, onClose }: PatientDetailPanelProps) {
  const [activeTab, setActiveTab] = useState<'timeline' | 'notes' | 'messages'>('timeline');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<any[]>([]);
  const [messageLoading, setMessageLoading] = useState(false);
  const [isEditingNotes, setIsEditingNotes] = useState(false);
  const [editNotesText, setEditNotesText] = useState("");
  const [savingNotes, setSavingNotes] = useState(false);

  useEffect(() => {
    if (patient) {
      setEditNotesText(patient.latestSessionNotes || "");
      setIsEditingNotes(false);
    }
  }, [patient]);

  const handleSaveNotes = async () => {
    if (!patient?.latestSession) return;
    setSavingNotes(true);
    try {
      await api.sessions.updateNotes(patient.latestSession, editNotesText);
      patient.latestSessionNotes = editNotesText;
      setIsEditingNotes(false);
    } catch (error) {
      console.error("Failed to save notes", error);
    } finally {
      setSavingNotes(false);
    }
  };

  useEffect(() => {
    if (isOpen && patient && activeTab === 'messages') {
      fetchMessageHistory();
    }
  }, [isOpen, patient, activeTab]);

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
  
  // Close on ESC
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [onClose]);

  if (!patient) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className={`fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[100] transition-opacity duration-500 ${
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={onClose}
      />

      {/* Panel */}
      <aside 
        className={`fixed top-0 right-0 h-full w-full max-w-lg bg-white shadow-2xl z-[101] transform transition-transform duration-500 ease-out flex flex-col ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Header */}
        <header className="p-6 border-b border-slate-100 flex items-center justify-between bg-white shrink-0">
          <div className="flex items-center gap-4">
            <Avatar className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-bold text-lg shadow-inner shrink-0">
              <AvatarFallback className="bg-transparent text-current font-bold text-lg">{patient.firstName?.[0]}{patient.lastName?.[0]}</AvatarFallback>
            </Avatar>
            <div>
              <h2 className="text-xl font-bold text-slate-900 leading-tight font-sans">
                {patient.firstName} {patient.lastName}
              </h2>
              <p className="text-base text-slate-400 font-bold uppercase tracking-widest mt-1">Patient Identity</p>
            </div>
          </div>
          <Button 
            variant="ghost"
            onClick={onClose}
            className="p-2 transition-colors text-slate-400 hover:text-slate-600 h-auto w-auto"
          >
            <X className="w-5 h-5" />
          </Button>
        </header>

        {/* Content */}
        <div className={`flex-1 ${activeTab === 'messages' ? 'flex flex-col overflow-hidden' : 'overflow-y-auto'} bg-slate-50/30`}>
          {/* Quick Stats (Only show when not chatting to maximize chat view) */}
          {activeTab !== 'messages' && (
            <div className="p-6 grid grid-cols-2 gap-4">
              <Card className="p-4">
                <div className="flex items-center gap-2 text-slate-400 mb-1">
                  <Calendar className="w-3.5 h-3.5" />
                  <span className="text-[10px] font-bold uppercase tracking-wider">Total Sessions</span>
                </div>
                <p className="text-xl font-bold text-slate-900 font-sans">{patient.sessionCount || 0}</p>
              </Card>
              <Card className="p-4">
                <div className="flex items-center gap-2 text-slate-400 mb-1">
                  <Clock className="w-3.5 h-3.5" />
                  <span className="text-[10px] font-bold uppercase tracking-wider">Last Seen</span>
                </div>
                <p className="text-sm font-medium text-slate-900">
                  {patient.latestSession ? new Date(patient.latestSession).toLocaleDateString('en-US', { timeZone: 'Asia/Kolkata' }) : 'Never'}
                </p>
              </Card>
            </div>
          )}

          {/* Tabs */}
          <div className="px-6 border-b border-slate-100 flex gap-6 shrink-0">
            {(['timeline', 'notes', 'messages'] as const).map((tab) => (
              <Button
                variant="ghost"
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`pb-4 text-xs font-bold uppercase tracking-widest transition-all relative rounded-none hover:bg-transparent px-0 h-auto shadow-none ${
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
          <div className="p-6">
            {activeTab === 'timeline' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between mb-2">
                   <h3 className="text-sm font-bold text-slate-900">Activity History</h3>
                   <Button variant="link" className="text-[10px] font-bold text-primary uppercase tracking-widest hover:underline p-0 h-auto">Download Report</Button>
                </div>
                
                {/* Mock Timeline - to be replaced with real data */}
                <div className="relative pl-6 border-l-2 border-slate-100 space-y-8">
                  <div className="relative">
                    <div className="absolute -left-[31px] top-0 w-4 h-4 rounded-full bg-primary border-4 border-white shadow-sm" />
                    <Card className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Appointment • Upcoming</span>
                        <span className="text-[10px] font-medium text-slate-500">Tomorrow, 10:00 AM</span>
                      </div>
                      <p className="text-sm font-medium text-slate-900">Follow-up: Clinical Assessment</p>
                    </Card>
                  </div>
                  
                  <div className="relative">
                    <div className="absolute -left-[31px] top-0 w-4 h-4 rounded-full bg-slate-300 border-4 border-white shadow-sm" />
                    <Card className="p-4 opacity-60">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Session • Completed</span>
                        <span className="text-[10px] font-medium text-slate-500">Oct 24, 2023</span>
                      </div>
                      <p className="text-sm font-medium text-slate-900">Intake Consultation</p>
                    </Card>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'notes' && (
              <div className="space-y-4">
                {isEditingNotes ? (
                  <>
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-bold text-slate-900 font-heading"> Clinical Notes</h3>
                    </div>
                    <Card className="p-5 space-y-4">
                      <Textarea
                        value={editNotesText}
                        onChange={(e) => setEditNotesText(e.target.value)}
                        placeholder="Write clinical notes here..."
                        className="w-full min-h-[140px] text-sm bg-surface-container-low border-outline-variant/30 leading-relaxed"
                      />
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          onClick={() => setIsEditingNotes(false)}
                          disabled={savingNotes}
                          className="px-4 py-2 h-auto text-xs rounded-xl"
                        >
                          Cancel
                        </Button>
                        <Button
                          onClick={handleSaveNotes}
                          disabled={savingNotes}
                          className="px-4 py-2 h-auto text-xs rounded-xl flex items-center gap-1.5"
                        >
                          {savingNotes ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
                          Save Notes
                        </Button>
                      </div>
                    </Card>
                  </>
                ) : (
                  <>
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-bold text-slate-900">Clinical Notes</h3>
                      <Button 
                        variant="outline" 
                        size="icon" 
                        className="bg-primary/5 text-primary hover:bg-primary/10"
                        disabled={!patient.latestSession}
                        onClick={() => {
                          setEditNotesText("");
                          setIsEditingNotes(true);
                        }}
                        title={!patient.latestSession ? "No session found to add notes to" : "Add notes"}
                      >
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                    {patient.latestSessionNotes ? (
                       <Card className="p-5">
                          <p className="text-sm text-slate-600 leading-relaxed italic">
                            &quot;{patient.latestSessionNotes}&quot;
                          </p>
                          <div className="mt-4 pt-4 border-t border-slate-50 flex justify-between items-center">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Last updated {new Date(patient.latestSession!).toLocaleDateString('en-US', { timeZone: 'Asia/Kolkata' })}</span>
                            <Button 
                              variant="link" 
                              onClick={() => {
                                setEditNotesText(patient.latestSessionNotes || "");
                                setIsEditingNotes(true);
                              }}
                              className="text-[10px] font-bold text-primary uppercase tracking-widest p-0 h-auto hover:underline"
                            >
                              Edit
                            </Button>
                          </div>
                       </Card>
                    ) : (
                      <Card className="p-10 text-center">
                        <FileText className="w-8 h-8 text-slate-200 mx-auto mb-3" />
                        <p className="text-sm text-slate-400">No clinical notes available.</p>
                      </Card>
                    )}
                  </>
                )}
              </div>
            )}

            {activeTab === 'messages' && (
               <div className="flex-1 flex flex-col min-h-0">
                 <div className="flex-1 space-y-4 overflow-y-auto p-6 pr-4">
                    {messageLoading ? (
                       <div className="h-full flex flex-col items-center justify-center opacity-40">
                          <Loader2 className="w-8 h-8 animate-spin mb-2" />
                          <p className="text-[10px] font-bold uppercase tracking-widest">Loading Conversation...</p>
                       </div>
                    ) : messages.length === 0 ? (
                       <div className="h-full flex flex-col items-center justify-center opacity-30 text-center p-10">
                          <MessageSquare className="w-12 h-12 mb-4" />
                          <p className="text-sm font-medium">No messages with this patient yet.</p>
                          <p className="text-base mt-2">Messages from all sessions will appear here.</p>
                       </div>
                    ) : (
                      messages.map((msg, idx) => {
                        const isMe = msg.sender.role === 'THERAPIST';
                        return (
                          <div key={msg.id || idx} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                            <div className={`rounded-xl p-3 max-w-[85%] text-sm shadow-sm ${
                              isMe ? 'bg-primary text-primary-foreground' : 'bg-white border border-slate-100 text-slate-700'
                            }`}>
                              {msg.content}
                              <div className={`text-[9px] mt-1 font-bold uppercase tracking-tighter opacity-50 ${isMe ? 'text-right' : ''}`}>
                                {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </div>
                            </div>
                          </div>
                        );
                      })
                    )}
                 </div>
               </div>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <footer className="p-6 border-t border-slate-100 bg-white shrink-0">
          {activeTab === 'messages' ? (
             <div className="relative">
                <Input 
                  type="text" 
                  placeholder="Type a message..."
                  className="w-full text-sm transition-all pr-12 bg-surface-container-low border-outline-variant/30 h-12"
                />
                <Button className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-lg flex items-center justify-center transition-all p-0 active:scale-95 shadow-sm">
                  <Send className="w-4 h-4" />
                </Button>
             </div>
          ) : (
             <div className="grid grid-cols-2 gap-4">
               <Button 
                 className="w-full flex items-center justify-center gap-2 py-4 text-xs font-bold uppercase tracking-[0.2em] transition-all h-auto rounded-xl active:scale-[0.98]"
                 onClick={() => {}}
               >
                 <Video className="w-4 h-4" />
                 Start Session
               </Button>
               <Button 
                 variant="outline"
                 className="w-full flex items-center justify-center gap-2 py-4 text-xs font-bold uppercase tracking-[0.2em] transition-all h-auto rounded-xl active:scale-[0.98] border-outline-variant/30"
                 onClick={() => setActiveTab('messages')}
               >
                 <MessageSquare className="w-4 h-4" />
                 Quick Chat
               </Button>
             </div>
          )}
        </footer>
      </aside>
    </>
  );
}

function Plus({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
    </svg>
  );
}
