"use client";

import { useState } from "react";
import { Users, Mail, Phone, Calendar, ArrowRight, Activity, ShieldCheck, MessageSquare, Clock } from "lucide-react";
import PatientDetailPanel from "./PatientDetailPanel";

interface Patient {
  id: string;
  firstName: string;
  lastName: string;
  user?: {
    email: string;
  };
  sessionCount: number;
  latestSession: string;
  latestSessionNotes?: string;
}

export default function PatientList({ roster }: { roster: Patient[] }) {
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [isPanelOpen, setIsPanelOpen] = useState(false);

  const handlePatientClick = (patient: Patient) => {
    setSelectedPatient(patient);
    setIsPanelOpen(true);
  };

  return (
    <>
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] md:min-w-full">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="px-5 md:px-10 py-4 md:py-8 text-left text-xs font-bold uppercase tracking-[0.2em] text-slate-400">Patient identity</th>
                <th className="px-5 md:px-10 py-4 md:py-8 text-left text-xs font-bold uppercase tracking-[0.2em] text-slate-400">Status & Activity</th>
                <th className="px-5 md:px-10 py-4 md:py-8 text-left text-xs font-bold uppercase tracking-[0.2em] text-slate-400 text-center">Engagement</th>
                <th className="px-5 md:px-10 py-4 md:py-8 text-left text-xs font-bold uppercase tracking-[0.2em] text-slate-400">Clinical History</th>
                <th className="px-5 md:px-10 py-4 md:py-8"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {roster.map((p) => (
                <tr 
                  key={p.id} 
                  className="group hover:bg-slate-50/50 transition-colors cursor-pointer"
                  onClick={() => handlePatientClick(p)}
                >
                  <td className="px-5 md:px-10 py-4 md:py-8">
                    <div className="flex items-center gap-5">
                      <div className="w-14 h-14 rounded-2xl bg-primary/5 flex items-center justify-center text-primary font-bold text-xl border border-primary/10 group-hover:bg-primary group-hover:text-white transition-all">
                        {p.firstName?.[0]}{p.lastName?.[0]}
                      </div>
                      <div>
                        <p className="font-sans text-lg font-bold text-slate-900 leading-tight">
                          {p.firstName} {p.lastName}
                        </p>
                        <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">Ref: {p.id.slice(0, 8)}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 md:px-10 py-4 md:py-8">
                    <div className="space-y-2">
                       <div className="flex items-center gap-2">
                         <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                         <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest">Active Care</span>
                       </div>
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <Mail className="w-3.5 h-3.5 text-slate-300" />
                        {p.user?.email || "N/A"}
                      </div>
                    </div>
                  </td>
                  <td className="px-5 md:px-10 py-4 md:py-8 text-center">
                    <div className="inline-flex flex-col items-center">
                      <div className="inline-flex items-center gap-2 bg-slate-100/50 px-4 py-2 rounded-xl border border-slate-100 group-hover:border-primary/20 group-hover:bg-primary/5 transition-all">
                        <Activity className="w-3.5 h-3.5 text-slate-400 group-hover:text-primary" />
                        <span className="text-xs font-bold text-slate-900">{p.sessionCount} Sessions</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 md:px-10 py-4 md:py-8">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <Calendar className="w-4 h-4 text-slate-300" />
                        <span className="font-medium">{new Date(p.latestSession).toLocaleDateString('en-US')}</span>
                      </div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Last Consultation</p>
                    </div>
                  </td>
                  <td className="px-5 md:px-10 py-4 md:py-8 text-right">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all">
                       <button 
                        className="p-2.5 bg-white border border-slate-200 text-slate-400 hover:text-primary hover:border-primary/30 rounded-xl transition-all shadow-sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handlePatientClick(p);
                        }}
                       >
                         <MessageSquare className="w-4 h-4" />
                       </button>
                       <button 
                        className="p-2.5 bg-white border border-slate-200 text-slate-400 hover:text-primary hover:border-primary/30 rounded-xl transition-all shadow-sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handlePatientClick(p);
                        }}
                       >
                         <Clock className="w-4 h-4" />
                       </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <PatientDetailPanel 
        patient={selectedPatient} 
        isOpen={isPanelOpen} 
        onClose={() => setIsPanelOpen(false)} 
      />
    </>
  );
}
