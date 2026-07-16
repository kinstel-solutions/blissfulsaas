"use client";

import { Users, Mail, Phone, Calendar, ArrowRight, Activity, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useRouter } from "next/navigation";

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
  const router = useRouter();

  const handlePatientClick = (patient: Patient) => {
    router.push(`/dashboard/patients/${patient.id}`);
  };

  const sortedRoster = [...roster].sort((a, b) => {
    const dateA = a.latestSession ? new Date(a.latestSession).getTime() : 0;
    const dateB = b.latestSession ? new Date(b.latestSession).getTime() : 0;
    return dateB - dateA; // Most recent first
  });

  return (
    <>
      <Card className="p-0 gap-0 ring-0 border border-slate-100 shadow-xs bg-white rounded-xl overflow-x-auto">
        <table className="w-full min-w-[900px] md:min-w-full">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="px-5 md:px-10 py-6 uppercase text-primary tracking-[0.2em]">Patient identity</th>
                <th className="px-5 md:px-10 py-6 uppercase text-primary tracking-[0.2em]">Status & Activity</th>
                <th className="px-5 md:px-10 py-6 uppercase text-primary tracking-[0.2em]">Engagement</th>
                <th className="px-5 md:px-10 py-6 uppercase text-primary tracking-[0.2em]">Clinical History</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {sortedRoster.map((p) => (
                <tr
                  key={p.id}
                  className="group hover:bg-slate-50/50 transition-colors cursor-pointer"
                  onClick={() => handlePatientClick(p)}
                >
                  <td className="px-5 md:px-10 py-4">
                    <div className="flex items-center gap-5">
                      <div className="w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-lg transition-all shadow-sm border bg-white text-primary border-slate-100 group-hover:bg-primary group-hover:text-white group-hover:border-primary shrink-0">
                        {p.firstName?.[0]}
                      </div>
                      <div>
                        <p className="text-lg font-bold text-slate-900 leading-tight">
                          {p.firstName} {p.lastName}
                        </p>
                        <p className="text-sm text-slate-400 font-bold uppercase tracking-widest mt-1">Ref: {p.id.slice(0, 8)}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 md:px-10 py-4 md:py-8">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest">Active Care</span>
                      </div>
                      <div className="flex items-center gap-2 text-base text-slate-600">
                        <Mail className="w-3.5 h-3.5 text-slate-300" />
                        {p.user?.email || "N/A"}
                      </div>
                    </div>
                  </td>
                  <td className="px-5 md:px-10 py-4 md:py-8 text-center">
                    <div className="inline-flex flex-col items-center">
                      <div className="inline-flex items-center gap-2 bg-slate-100/50 px-4 py-2 rounded-xl border border-slate-100 group-hover:border-primary/20 group-hover:bg-primary/5 transition-all">
                        <Activity className="w-3.5 h-3.5 text-slate-400 group-hover:text-primary" />
                        <span className="text-sm font-bold text-slate-900">{p.sessionCount} Sessions</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 md:px-10 py-4 md:py-8">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <Calendar className="w-4 h-4 text-slate-300" />
                        <span className="text-base font-medium">{new Date(p.latestSession).toLocaleDateString('en-US')}</span>
                      </div>
                      <p className="text-sm text-slate-400">Last Consultation</p>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
      </Card>
    </>
  );
}
