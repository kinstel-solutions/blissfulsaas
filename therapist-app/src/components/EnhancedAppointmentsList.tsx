"use client";

import { useState } from "react";
import { 
  Calendar as CalendarIcon, 
  Clock, 
  ChevronUp, 
  FileText,
  MessageSquare
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import AppointmentActions from "@/components/AppointmentActions";
import PatientDetailPanel from "./PatientDetailPanel";
import React from "react";

export default function EnhancedAppointmentsList({ initialAppointments }: { initialAppointments: any[] }) {
  const router = useRouter();
  const [selectedPatient, setSelectedPatient] = useState<any | null>(null);
  const [isPanelOpen, setIsPanelOpen] = useState(false);

  const openPatientPanel = (e: React.MouseEvent, patient: any) => {
    e.stopPropagation();
    setSelectedPatient(patient);
    setIsPanelOpen(true);
  };

  const navigateToDetail = (id: string) => {
    router.push(`/dashboard/appointments/${id}`);
  };

  return (
    <div className="bg-white lg:border border-slate-200 lg:rounded-xl overflow-hidden lg:shadow-sm">
      <div className="hidden lg:block overflow-x-auto">
        <table className="w-full text-left border-separate border-spacing-0">
          <thead>
            <tr className="bg-slate-50/50 border-b border-slate-100">
              <th className="px-4 md:px-8 py-6 text-xs font-bold uppercase tracking-[0.2em] text-slate-400">Consultation</th>
              <th className="px-4 md:px-8 py-6 text-xs font-bold uppercase tracking-[0.2em] text-slate-400">Timing</th>
              <th className="px-4 md:px-8 py-6 text-xs font-bold uppercase tracking-[0.2em] text-slate-400">Status</th>
              <th className="px-4 md:px-8 py-6 text-xs font-bold uppercase tracking-[0.2em] text-slate-400 text-right">Reference</th>
            </tr>
          </thead>
          <tbody className="">
            {initialAppointments.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-4 md:px-8 py-32 text-center text-slate-300">
                  <CalendarIcon className="w-16 h-16 mx-auto mb-4 opacity-10" />
                  <p className="text-sm font-medium">Your clinical schedule is currently clear.</p>
                </td>
              </tr>
            ) : (
              initialAppointments.map((appt) => {
                const hasNotes = appt.therapistNotes && appt.therapistNotes.length > 0;

                return (
                  <tr 
                    key={appt.id}
                    onClick={() => navigateToDetail(appt.id)}
                    className={`group transition-all cursor-pointer hover:bg-slate-50/50 ${['CANCELLED', 'COMPLETED'].includes(appt.status) ? 'opacity-70 grayscale-[0.2]' : ''}`}
                  >
                    <td className="px-4 md:px-8 py-6 border-b border-slate-50">
                      <div 
                        className="flex items-center gap-4 group/patient"
                        onClick={(e) => openPatientPanel(e, appt.patient)}
                      >
                        <div className="w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-lg transition-all shadow-sm border bg-white text-primary border-slate-100 group-hover/patient:bg-primary group-hover/patient:text-white group-hover/patient:border-primary">
                          {appt.patient?.firstName?.[0]}
                        </div>
                        <div>
                          <div className="font-heading font-medium text-slate-900 flex items-center gap-2 group-hover/patient:text-primary transition-colors">
                            {appt.patient?.firstName} {appt.patient?.lastName}
                            {hasNotes && (
                              <div className="flex items-center gap-1.5 px-2 py-0.5 bg-blue-50 text-blue-600 rounded-md border border-blue-100">
                                 <FileText className="w-2.5 h-2.5" />
                                 <span className="text-xs font-bold uppercase tracking-widest whitespace-nowrap">Notes</span>
                              </div>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <p className={`text-xs font-bold uppercase tracking-widest mt-1 ${
                              appt.mode === 'IN_CLINIC' ? 'text-emerald-600' : 'text-slate-400'
                            }`}>
                              {appt.mode === 'IN_CLINIC' ? '🏥 In-Clinic Visit' : '🖥️ Video Consultation'}
                            </p>
                            <div className="w-1 h-1 rounded-full bg-slate-300 mt-1" />
                            <Link href={`/dashboard/messages?sessionId=${appt.id}`} onClick={e => e.stopPropagation()}>
                              <button 
                                className="text-[10px] font-bold text-primary/60 uppercase tracking-widest mt-1 hover:text-primary transition-colors"
                              >
                                Message
                              </button>
                            </Link>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 md:px-8 py-6 border-b border-slate-50">
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2 text-sm text-slate-700 font-medium">
                          {new Date(appt.scheduledAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-slate-400 font-bold uppercase">
                          <Clock className="w-3 h-3" />
                          {new Date(appt.scheduledAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 md:px-8 py-6 border-b border-slate-50">
                       <span className={`px-4 py-1.5 rounded-xl text-xs font-bold uppercase tracking-widest border ${
                          appt.status === 'CONFIRMED' ? 'bg-green-50 text-green-700 border-green-100' :
                          appt.status === 'PENDING' ? 'bg-amber-50 text-amber-700 border-amber-100' :
                          appt.status === 'COMPLETED' ? 'bg-blue-50 text-blue-700 border-blue-100' :
                          'bg-slate-50 text-slate-500 border-slate-100'
                        }`}>
                          {appt.status}
                        </span>
                    </td>
                    <td className="px-4 md:px-8 py-6 border-b border-slate-50 text-right">
                      <div className="flex items-center justify-end gap-3" onClick={e => e.stopPropagation()}>
                         <AppointmentActions id={appt.id} status={appt.status} />
                         <Link href={`/dashboard/appointments/${appt.id}`}>
                            <button className="p-2 bg-slate-50 rounded-lg text-slate-400 hover:text-primary hover:bg-primary/5 transition-all">
                               <ChevronUp className="w-5 h-5 rotate-90" />
                            </button>
                         </Link>
                      </div>
                    </td>
                  </tr>
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
            const hasNotes = appt.therapistNotes && appt.therapistNotes.length > 0;

            return (
              <div 
                key={appt.id}
                onClick={() => navigateToDetail(appt.id)}
                className={`flex flex-col rounded-xl border transition-all duration-300 overflow-hidden bg-white border-slate-100 active:bg-slate-50 active:scale-[0.98] ${
                  ['CANCELLED', 'COMPLETED'].includes(appt.status) ? 'opacity-70' : ''
                }`}
              >
                {/* Header Info */}
                <div className="p-5 flex items-start justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-lg transition-all shadow-sm shrink-0 border bg-white text-primary border-slate-100">
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
                        {new Date(appt.scheduledAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </div>
                      <div className="text-[10px] text-slate-400 font-bold uppercase mt-1">
                        {new Date(appt.scheduledAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Actions Bar */}
                <div className="px-5 pb-5 flex items-center justify-between gap-3 border-t border-slate-50 pt-4">
                   <div className="flex gap-2" onClick={e => e.stopPropagation()}>
                      <Link href={`/dashboard/messages?sessionId=${appt.id}`}>
                        <button className="p-2.5 bg-primary/5 text-primary rounded-xl border border-primary/10">
                          <MessageSquare className="w-4 h-4" />
                        </button>
                      </Link>
                      <AppointmentActions id={appt.id} status={appt.status} />
                   </div>
                   <div className="flex items-center gap-1 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                      View <ChevronUp className="w-4 h-4 rotate-90" />
                   </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      <PatientDetailPanel 
        patient={selectedPatient} 
        isOpen={isPanelOpen} 
        onClose={() => setIsPanelOpen(false)} 
      />
    </div>
  );
}
