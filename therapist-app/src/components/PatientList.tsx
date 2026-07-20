"use client";

import { useState } from "react";
import { Users, Mail, Phone, Calendar, ArrowRight, Activity, ShieldCheck, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
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
  const [searchQuery, setSearchQuery] = useState("");

  const handlePatientClick = (patient: Patient) => {
    router.push(`/dashboard/patients/${patient.id}`);
  };

  const sortedRoster = [...roster].sort((a, b) => {
    const dateA = a.latestSession ? new Date(a.latestSession).getTime() : 0;
    const dateB = b.latestSession ? new Date(b.latestSession).getTime() : 0;
    return dateB - dateA; // Most recent first
  });

  const filteredRoster = sortedRoster.filter((p) => {
    const fullName = `${p.firstName} ${p.lastName}`.toLowerCase();
    const email = (p.user?.email || "").toLowerCase();
    const query = searchQuery.toLowerCase();
    return fullName.includes(query) || email.includes(query);
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 bg-white px-4 py-1.5 rounded-xl border border-slate-100 shadow-xs max-w-md">
        <Search className="w-5 h-5 text-slate-400 shrink-0" />
        <Input
          placeholder="Search patients by name or email..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="border-0 shadow-none focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-slate-400 text-sm h-10 px-0"
        />
      </div>

      <Card className="p-0 gap-0 ring-0 border border-slate-100 shadow-xs bg-white rounded-xl overflow-x-auto">
        <table className="w-full min-w-[900px] md:min-w-full">
          <thead>
            <tr className="bg-slate-50/50 border-b border-slate-100">
              <th className="px-5 md:px-10 py-6 uppercase text-primary tracking-[0.2em]">Patient identity</th>
              <th className="px-5 md:px-10 py-6 uppercase text-primary tracking-[0.2em]">Email</th>
              <th className="px-5 md:px-10 py-6 uppercase text-primary tracking-[0.2em]">Total Sessions</th>
              <th className="px-5 md:px-10 py-6 uppercase text-primary tracking-[0.2em]">Last Session</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {filteredRoster.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-5 md:px-10 py-16 text-center text-slate-400">
                  <Users className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                  <p className="text-base font-medium">No patients found matching &quot;{searchQuery}&quot;</p>
                </td>
              </tr>
            ) : (
              filteredRoster.map((p) => (
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
                        <p className="text-sm text-slate-400 font-bold uppercase tracking-widest mt-1">ID: {p.id.slice(0, 8)}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 md:px-10 py-4 md:py-8">
                    <div className="flex items-center gap-2 text-base text-slate-600">
                      <Mail className="w-3.5 h-3.5 text-slate-300" />
                      {p.user?.email || "N/A"}
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
                        <span className="text-base font-medium">{new Date(p.latestSession).toLocaleDateString('en-US', { timeZone: 'Asia/Kolkata' })}</span>
                      </div>
                      <p className={`text-sm ${new Date(p.latestSession) > new Date() ? "text-emerald-600 font-semibold" : "text-slate-400"}`}>
                        {new Date(p.latestSession) > new Date() ? "Upcoming Session" : "Last Session"}
                      </p>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
