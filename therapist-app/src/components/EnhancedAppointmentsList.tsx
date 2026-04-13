"use client";

import { useState } from "react";
import { 
  Calendar as CalendarIcon, 
  Clock, 
  ChevronDown, 
  ChevronUp, 
  StickyNote, 
  Save, 
  Check, 
  Video,
  FileText,
  Activity,
  ClipboardList
} from "lucide-react";
import Link from "next/link";
import AppointmentActions from "@/components/AppointmentActions";
import { api } from "@/lib/api";

export default function EnhancedAppointmentsList({ initialAppointments }: { initialAppointments: any[] }) {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [notesState, setNotesState] = useState<Record<string, { content: string, loading: boolean, saved: boolean }>>(() => {
    const state: any = {};
    initialAppointments.forEach(a => {
      state[a.id] = { content: a.therapistNotes || "", loading: false, saved: false };
    });
    return state;
  });

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const handleNotesChange = (id: string, content: string) => {
    setNotesState(prev => ({
      ...prev,
      [id]: { ...prev[id], content, saved: false }
    }));
  };

  const saveNotes = async (id: string) => {
    setNotesState(prev => ({ ...prev, [id]: { ...prev[id], loading: true } }));
    try {
      await api.sessions.updateNotes(id, notesState[id].content);
      setNotesState(prev => ({ 
        ...prev, 
        [id]: { ...prev[id], loading: false, saved: true } 
      }));
      setTimeout(() => {
        setNotesState(prev => ({ ...prev, [id]: { ...prev[id], saved: false } }));
      }, 2000);
    } catch (error) {
      console.error("Failed to save notes", error);
      setNotesState(prev => ({ ...prev, [id]: { ...prev[id], loading: false } }));
    }
  };

  return (
    <div className="bg-white lg:border border-slate-200 lg:rounded-[2.5rem] overflow-hidden lg:shadow-sm">
      <div className="hidden lg:block overflow-x-auto">
        <table className="w-full text-left border-separate border-spacing-0">
          <thead>
            <tr className="bg-slate-50/50 border-b border-slate-100">
              <th className="px-8 py-6 text-xs font-bold uppercase tracking-[0.2em] text-slate-400">Consultation</th>
              <th className="px-8 py-6 text-xs font-bold uppercase tracking-[0.2em] text-slate-400">Timing</th>
              <th className="px-8 py-6 text-xs font-bold uppercase tracking-[0.2em] text-slate-400">Status</th>
              <th className="px-8 py-6 text-xs font-bold uppercase tracking-[0.2em] text-slate-400 text-right">Reference</th>
            </tr>
          </thead>
          <tbody className="">
            {initialAppointments.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-8 py-32 text-center text-slate-300">
                  <CalendarIcon className="w-16 h-16 mx-auto mb-4 opacity-10" />
                  <p className="text-sm font-medium">Your clinical schedule is currently clear.</p>
                </td>
              </tr>
            ) : (
              initialAppointments.map((appt) => {
                const isExpanded = expandedId === appt.id;
                const state = notesState[appt.id];
                const hasNotes = state.content.length > 0;

                return (
                  <React.Fragment key={appt.id}>
                    <tr 
                      onClick={() => toggleExpand(appt.id)}
                      className={`group transition-all cursor-pointer ${
                        isExpanded ? 'bg-primary/5' : 'hover:bg-slate-50/50'
                      } ${['CANCELLED', 'COMPLETED'].includes(appt.status) && !isExpanded ? 'opacity-50 grayscale-[0.2]' : ''}`}
                    >
                      <td className="px-8 py-6 border-b border-slate-50">
                        <div className="flex items-center gap-4">
                          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-lg transition-all shadow-sm border ${
                            isExpanded ? 'bg-primary text-white border-primary' : 'bg-white text-primary border-slate-100'
                          }`}>
                            {appt.patient?.firstName?.[0]}
                          </div>
                          <div>
                            <div className="font-heading font-medium text-slate-900 flex items-center gap-2">
                              {appt.patient?.firstName} {appt.patient?.lastName}
                              {hasNotes && (
                                <div className="flex items-center gap-1.5 px-2 py-0.5 bg-blue-50 text-blue-600 rounded-md border border-blue-100 animate-in fade-in zoom-in duration-300">
                                   <FileText className="w-2.5 h-2.5" />
                                   <span className="text-xs font-bold uppercase tracking-widest whitespace-nowrap">Documented</span>
                                </div>
                              )}
                            </div>
                            <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">Video Consultation</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6 border-b border-slate-50">
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-2 text-sm text-slate-700 font-medium">
                            {new Date(appt.scheduledAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                          </div>
                          <div className="flex items-center gap-2 text-xs text-slate-400 font-bold uppercase">
                            <Clock className="w-3 h-3" />
                            {new Date(appt.scheduledAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6 border-b border-slate-50">
                         <span className={`px-4 py-1.5 rounded-xl text-xs font-bold uppercase tracking-widest border ${
                            appt.status === 'CONFIRMED' ? 'bg-green-50 text-green-700 border-green-100' :
                            appt.status === 'PENDING' ? 'bg-amber-50 text-amber-700 border-amber-100' :
                            appt.status === 'COMPLETED' ? 'bg-blue-50 text-blue-700 border-blue-100' :
                            'bg-slate-50 text-slate-500 border-slate-100'
                          }`}>
                            {appt.status}
                          </span>
                      </td>
                      <td className="px-8 py-6 border-b border-slate-50 text-right">
                        <div className="flex items-center justify-end gap-3" onClick={e => e.stopPropagation()}>
                           <AppointmentActions id={appt.id} status={appt.status} />
                           {isExpanded ? <ChevronUp className="w-5 h-5 text-primary" /> : <ChevronDown className="w-5 h-5 text-slate-300 group-hover:text-primary transition-colors" />}
                        </div>
                      </td>
                    </tr>
                    
                    {/* Expandable Clinical Workstation (Desktop) */}
                    {isExpanded && (
                      <tr>
                        <td colSpan={4} className="bg-slate-50/50 p-1 border-b border-slate-100 animate-in slide-in-from-top-1 duration-300">
                          <div className="bg-white m-3 rounded-[2rem] border border-primary/10 shadow-xl overflow-hidden">
                             <div className="grid grid-cols-1 lg:grid-cols-4">
                                {/* Column 1: Session Details */}
                                <div className="p-7 border-b lg:border-b-0 lg:border-r border-slate-100 bg-slate-50/20 space-y-4">
                                   <div className="flex items-center gap-2 mb-1">
                                      <Activity className="w-4 h-4 text-primary" />
                                      <h4 className="text-xs font-bold text-slate-900 uppercase tracking-widest">Session</h4>
                                   </div>
                                   <div className="p-3 bg-white rounded-xl border border-slate-100 shadow-sm">
                                      <p className="text-xs font-bold text-slate-400 uppercase tracking-tighter mb-1">Patient</p>
                                      <p className="text-sm font-medium text-slate-800">{appt.patient?.firstName} {appt.patient?.lastName}</p>
                                      <p className="text-xs text-slate-400 mt-0.5">{appt.patient?.user?.email}</p>
                                   </div>
                                   <div className="p-3 bg-white rounded-xl border border-slate-100 shadow-sm">
                                      <p className="text-xs font-bold text-slate-400 uppercase tracking-tighter mb-1">Duration</p>
                                      <p className="text-sm font-medium text-slate-800">{appt.duration} Min</p>
                                   </div>
                                   {appt.status !== 'COMPLETED' && appt.status !== 'CANCELLED' && (
                                      <Link href={`/dashboard/sessions/${appt.id}/call`} className="block">
                                         <button className="w-full py-3 bg-slate-900 text-white rounded-xl text-xs font-bold uppercase tracking-[0.2em] hover:bg-blue-600 transition-all flex items-center justify-center gap-2">
                                            <Video className="w-3.5 h-3.5" />
                                            Join Call
                                         </button>
                                      </Link>
                                   )}
                                </div>

                                {/* Column 2: Patient Intake Form */}
                                <div className="lg:col-span-1 p-7 border-b lg:border-b-0 lg:border-r border-slate-100">
                                   <div className="flex items-center gap-2 mb-5">
                                      <ClipboardList className="w-4 h-4 text-violet-600" />
                                      <h4 className="text-xs font-bold text-slate-900 uppercase tracking-widest">Patient Intake</h4>
                                   </div>
                                   {!appt.patient?.intakeCompleted ? (
                                      <div className="h-full flex flex-col items-center justify-center text-center py-6 opacity-40">
                                         <ClipboardList className="w-8 h-8 mb-3 text-slate-400" />
                                         <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Not yet submitted</p>
                                         <p className="text-xs text-slate-400 mt-1">Patient hasn't completed their intake form</p>
                                      </div>
                                   ) : (
                                      <div className="space-y-3 overflow-y-auto max-h-64 pr-1">
                                         {appt.patient?.primaryConcerns?.length > 0 && (
                                            <div>
                                               <p className="text-xs font-bold text-slate-400 uppercase tracking-tighter mb-2">Primary Concerns</p>
                                               <div className="flex flex-wrap gap-1">
                                                  {appt.patient.primaryConcerns.map((c: string) => (
                                                     <span key={c} className="px-2 py-0.5 bg-violet-50 text-violet-700 text-xs font-bold rounded-md border border-violet-100">{c}</span>
                                                  ))}
                                               </div>
                                            </div>
                                         )}
                                         {appt.patient?.reasonForSeeking && (
                                            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                                               <p className="text-xs font-bold text-slate-400 uppercase tracking-tighter mb-1">Reason for Seeking</p>
                                               <p className="text-xs text-slate-700 leading-relaxed">{appt.patient.reasonForSeeking}</p>
                                            </div>
                                         )}
                                         {appt.patient?.therapyGoals && (
                                            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                                               <p className="text-xs font-bold text-slate-400 uppercase tracking-tighter mb-1">Therapy Goals</p>
                                               <p className="text-xs text-slate-700 leading-relaxed">{appt.patient.therapyGoals}</p>
                                            </div>
                                         )}
                                         {appt.patient?.currentMedications && (
                                            <div className="p-3 bg-amber-50 rounded-xl border border-amber-100">
                                               <p className="text-xs font-bold text-amber-600 uppercase tracking-tighter mb-1">Medications</p>
                                               <p className="text-xs text-slate-700 leading-relaxed">{appt.patient.currentMedications}</p>
                                            </div>
                                         )}
                                         {appt.patient?.mentalHealthHistory && (
                                            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                                               <p className="text-xs font-bold text-slate-400 uppercase tracking-tighter mb-1">MH History</p>
                                               <p className="text-xs text-slate-700 leading-relaxed">{appt.patient.mentalHealthHistory}</p>
                                            </div>
                                         )}
                                         <div className="flex items-center gap-2 pt-1">
                                            <div className={`text-xs font-bold px-2 py-1 rounded-md ${appt.patient?.previousTherapy ? 'bg-blue-50 text-blue-700 border border-blue-100' : 'bg-slate-100 text-slate-500'}`}>
                                               {appt.patient?.previousTherapy ? '✓ Prior therapy experience' : '✗ No prior therapy'}
                                            </div>
                                         </div>
                                      </div>
                                   )}
                                </div>

                                {/* Column 3: Clinical Notes */}
                                <div className="lg:col-span-2 p-7">
                                   <div className="flex items-center justify-between mb-5">
                                      <div className="flex items-center gap-2">
                                         <FileText className="w-4 h-4 text-blue-600" />
                                         <h4 className="text-xs font-bold text-slate-900 uppercase tracking-widest">Private Notes</h4>
                                      </div>
                                      <div className="flex items-center gap-3">
                                         <span className="text-xs font-bold text-slate-300 uppercase tracking-widest">Confidential</span>
                                         <button 
                                            onClick={() => saveNotes(appt.id)}
                                            disabled={state.loading}
                                            className={`px-5 py-1.5 rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${
                                               state.saved ? 'bg-green-500 text-white' : 'bg-primary text-white hover:shadow-lg hover:shadow-primary/20 hover:-translate-y-0.5'
                                            }`}
                                         >
                                            {state.loading ? 'Saving...' : state.saved ? <div className="flex items-center gap-1.5"><Check className="w-3 h-3"/> Saved</div> : <div className="flex items-center gap-1.5"><Save className="w-3 h-3"/> Save</div>}
                                         </button>
                                      </div>
                                   </div>
                                   <textarea 
                                      value={state.content}
                                      onChange={(e) => handleNotesChange(appt.id, e.target.value)}
                                      placeholder="Start typing your clinical observations here..."
                                      className="w-full h-44 bg-slate-50/50 border border-slate-100 rounded-[1.5rem] p-5 text-sm text-slate-700 placeholder:text-slate-300 focus:ring-4 focus:ring-primary/5 transition-all outline-none resize-none leading-relaxed"
                                   />
                                   <p className="mt-3 text-xs font-bold text-slate-400 uppercase tracking-[0.3em] flex items-center gap-2">
                                      <StickyNote className="w-3 h-3" />
                                      Not visible to the patient
                                   </p>
                                </div>
                             </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile Card Layout */}
      <div className="lg:hidden space-y-4 p-4">
        {initialAppointments.length === 0 ? (
          <div className="py-20 text-center text-slate-300">
            <CalendarIcon className="w-12 h-12 mx-auto mb-4 opacity-10" />
            <p className="text-sm font-medium">Your schedule is clear.</p>
          </div>
        ) : (
          initialAppointments.map((appt) => {
            const isExpanded = expandedId === appt.id;
            const state = notesState[appt.id];
            const hasNotes = state.content.length > 0;

            return (
              <div 
                key={appt.id}
                className={`flex flex-col rounded-3xl border transition-all duration-300 overflow-hidden ${
                  isExpanded ? 'bg-primary/5 border-primary/20 ring-4 ring-primary/5 translate-y-[-2px]' : 'bg-white border-slate-100 hover:border-slate-200'
                }`}
              >
                {/* Header Info */}
                <div 
                  onClick={() => toggleExpand(appt.id)}
                  className="p-5 flex items-start justify-between gap-4 cursor-pointer"
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-lg transition-all shadow-sm shrink-0 border ${
                      isExpanded ? 'bg-primary text-white border-primary' : 'bg-white text-primary border-slate-100'
                    }`}>
                      {appt.patient?.firstName?.[0]}
                    </div>
                    <div>
                      <div className="font-heading font-medium text-slate-900 line-clamp-1">
                        {appt.patient?.firstName} {appt.patient?.lastName}
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest border shrink-0 ${
                          appt.status === 'CONFIRMED' ? 'bg-green-50 text-green-700 border-green-100' :
                          appt.status === 'PENDING' ? 'bg-amber-50 text-amber-700 border-amber-100' :
                          appt.status === 'COMPLETED' ? 'bg-blue-50 text-blue-700 border-blue-100' :
                          'bg-slate-50 text-slate-500 border-slate-100'
                        }`}>
                          {appt.status}
                        </span>
                        {hasNotes && (
                         <div className="flex items-center gap-1 px-1.5 py-0.5 bg-blue-50 text-blue-600 rounded border border-blue-100">
                            <FileText className="w-2.5 h-2.5" />
                            <span className="text-[9px] font-bold uppercase tracking-widest">Notes</span>
                         </div>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <div className="text-right">
                      <div className="text-xs font-bold text-slate-900">
                        {new Date(appt.scheduledAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                      </div>
                      <div className="text-[10px] text-slate-400 font-bold uppercase mt-1">
                        {new Date(appt.scheduledAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Actions Bar */}
                <div className="px-5 pb-5 flex items-center justify-between gap-3 border-t border-slate-50 pt-4">
                   <div className="flex gap-2" onClick={e => e.stopPropagation()}>
                      <AppointmentActions id={appt.id} status={appt.status} />
                   </div>
                   <button 
                      onClick={() => toggleExpand(appt.id)}
                      className="p-2 bg-slate-50 rounded-xl text-slate-400 hover:text-primary transition-colors"
                   >
                    {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                   </button>
                </div>

                {/* Expanded Section (Mobile) */}
                {isExpanded && (
                  <div className="border-t border-primary/10 bg-white/50 animate-in slide-in-from-top-1 duration-300">
                    <div className="p-5 space-y-8">
                      {/* Session Details */}
                      <section className="space-y-4">
                        <div className="flex items-center gap-2">
                          <Activity className="w-4 h-4 text-primary" />
                          <h4 className="text-xs font-bold text-slate-900 uppercase tracking-widest">Session Details</h4>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div className="p-3 bg-white rounded-xl border border-slate-100">
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter mb-1">Duration</p>
                            <p className="text-xs font-medium text-slate-800">{appt.duration} Min</p>
                          </div>
                          <Link href={`/dashboard/sessions/${appt.id}/call`} className="block">
                            <button className="w-full h-full py-3 bg-slate-900 text-white rounded-xl text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-blue-600 transition-all flex items-center justify-center gap-2 shrink-0">
                                <Video className="w-3 h-3" /> Join Call
                            </button>
                          </Link>
                        </div>
                      </section>

                      {/* Clinical Notes (Higher Importance on Mobile) */}
                      <section className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <FileText className="w-4 h-4 text-blue-600" />
                            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-widest">Private Notes</h4>
                          </div>
                          <button 
                             onClick={() => saveNotes(appt.id)}
                             disabled={state.loading}
                             className={`px-4 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all ${
                                state.saved ? 'bg-green-500 text-white' : 'bg-primary text-white'
                             }`}
                          >
                             {state.loading ? '...' : state.saved ? 'Saved' : 'Save'}
                          </button>
                        </div>
                        <textarea 
                          value={state.content}
                          onChange={(e) => handleNotesChange(appt.id, e.target.value)}
                          placeholder="Clinical observations..."
                          className="w-full h-32 bg-slate-50/50 border border-slate-100 rounded-2xl p-4 text-sm text-slate-700 outline-none resize-none"
                        />
                      </section>

                      {/* Intake Info */}
                      <section className="space-y-4">
                        <div className="flex items-center gap-2">
                          <ClipboardList className="w-4 h-4 text-violet-600" />
                          <h4 className="text-xs font-bold text-slate-900 uppercase tracking-widest">Intake Form</h4>
                        </div>
                        {!appt.patient?.intakeCompleted ? (
                          <p className="text-[10px] text-slate-400 font-bold uppercase italic">Not submitted</p>
                        ) : (
                          <div className="space-y-3">
                            {appt.patient?.primaryConcerns?.length > 0 && (
                              <div className="flex flex-wrap gap-1">
                                {appt.patient.primaryConcerns.map((c: string) => (
                                  <span key={c} className="px-2 py-0.5 bg-violet-50 text-violet-700 text-[10px] font-bold rounded border border-violet-100">{c}</span>
                                ))}
                              </div>
                            )}
                            {appt.patient?.reasonForSeeking && (
                              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-[11px] text-slate-700 leading-relaxed">
                                <p className="font-bold text-slate-400 uppercase tracking-[0.1em] mb-1">Reason</p>
                                {appt.patient.reasonForSeeking}
                              </div>
                            )}
                          </div>
                        )}
                      </section>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

import React from "react";
