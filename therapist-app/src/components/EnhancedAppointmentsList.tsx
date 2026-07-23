"use client";

import { useState } from "react";
import {
  Calendar as CalendarIcon,
  Clock,
  FileText,
  MessageSquare,
  MapPin,
  Video
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function EnhancedAppointmentsList({ initialAppointments }: { initialAppointments: any[] }) {
  const router = useRouter();

  const navigateToDetail = (id: string) => {
    router.push(`/dashboard/appointments/${id}`);
  };

  const appointments = [...initialAppointments].sort((a, b) => {
    const timeA = new Date(a.scheduledAt).getTime();
    const timeB = new Date(b.scheduledAt).getTime();
    const now = Date.now();

    const isUpcomingA = ['PENDING', 'CONFIRMED'].includes(a.status) && timeA > now;
    const isUpcomingB = ['PENDING', 'CONFIRMED'].includes(b.status) && timeB > now;

    if (isUpcomingA && !isUpcomingB) return -1;
    if (!isUpcomingA && isUpcomingB) return 1;

    if (isUpcomingA && isUpcomingB) {
      return timeA - timeB; // Nearest upcoming first
    } else {
      return timeB - timeA; // Most recent past first
    }
  });

  return (
    <Card className="p-0 gap-0 overflow-hidden ring-0 border-0 bg-transparent rounded-none lg:border lg:border-slate-100 lg:bg-white lg:shadow-xs lg:rounded-xl">
      <div className="hidden lg:block overflow-x-auto">
        <table className="w-full text-left border-separate border-spacing-0">
          <thead>
            <tr className="bg-slate-50/50 border-b border-slate-100">
              <th className="px-4 md:px-8 py-6 uppercase text-primary tracking-[0.2em]">Consultation</th>
              <th className="px-4 md:px-8 py-6 uppercase text-primary tracking-[0.2em] w-48">Timing</th>
              <th className="px-4 md:px-8 py-6 uppercase text-primary tracking-[0.2em] w-32">Status</th>
              <th className="px-4 md:px-8 py-6 uppercase text-primary tracking-[0.2em] text-right w-60">Actions</th>
            </tr>
          </thead>
          <tbody className="">
            {appointments.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-4 md:px-8 py-32 text-center text-slate-300">
                  <CalendarIcon className="w-16 h-16 mx-auto mb-4 opacity-10" />
                  <p className="text-sm font-medium">Your clinical schedule is currently clear.</p>
                </td>
              </tr>
            ) : (
              appointments.map((appt) => {
                const hasNotes = appt.therapistNotes && appt.therapistNotes.length > 0;

                return (
                  <tr
                    key={appt.id}
                    onClick={() => navigateToDetail(appt.id)}
                    className={`group transition-all cursor-pointer hover:bg-slate-50/50 ${['CANCELLED', 'COMPLETED', 'EXPIRED'].includes(appt.status) ? 'opacity-70 grayscale-[0.2]' : ''}`}
                  >
                    <td className="px-4 md:px-8 py-6 border-b border-slate-50">
                      <div className="flex items-center gap-4 group/patient">
                        <div className="w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-lg transition-all shadow-sm border bg-white text-primary border-slate-100 group-hover/patient:bg-primary group-hover/patient:text-white group-hover/patient:border-primary">
                          {appt.patient?.firstName?.[0]}
                        </div>
                        <div>
                          <div className="text-lg font-sans font-bold text-slate-900 flex items-center gap-2 group-hover/patient:text-primary transition-colors">
                            {appt.patient?.firstName} {appt.patient?.lastName}
                            {hasNotes && (
                              <div className="flex items-center gap-1.5 px-2 py-0.5 bg-blue-50 text-blue-600 rounded-md border border-blue-100">
                                <FileText className="w-2.5 h-2.5" />
                                <span className="text-xs font-bold uppercase tracking-widest whitespace-nowrap">Notes</span>
                              </div>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <p className={`text-sm font-bold uppercase tracking-widest mt-1 flex items-center gap-1.5 ${appt.mode === 'IN_CLINIC' ? 'text-emerald-600' : 'text-slate-400'
                              }`}>
                              {appt.mode === 'IN_CLINIC' ? (
                                <><MapPin className="w-3 h-3" /> In-Clinic Visit</>
                              ) : (
                                <><Video className="w-3 h-3" /> Video Consultation</>
                              )}
                            </p>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 md:px-8 py-6 border-b border-slate-50 w-48">
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2 text-base text-slate-700 font-medium">
                          {new Date(appt.scheduledAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: 'Asia/Kolkata' })}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-slate-400 font-bold uppercase">
                          <Clock className="w-3 h-3" />
                          {new Date(appt.scheduledAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Kolkata' })}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 md:px-8 py-6 border-b border-slate-50 w-32">
                      <span className={`px-4 py-1.5 rounded-xl text-xs font-bold uppercase tracking-widest border ${appt.status === 'CONFIRMED' ? 'bg-green-50 text-green-700 border-green-100' :
                        appt.status === 'PENDING' ? 'bg-amber-50 text-amber-700 border-amber-100' :
                          appt.status === 'COMPLETED' ? 'bg-blue-50 text-blue-700 border-blue-100' :
                            appt.status === 'EXPIRED' ? 'bg-slate-50 text-slate-400 border-slate-100' :
                              'bg-slate-50 text-slate-500 border-slate-100'
                        }`}>
                        {appt.status}
                      </span>
                    </td>
                    <td className="px-4 md:px-8 py-6 border-b border-slate-50 text-right w-60">
                      <div className="flex items-center justify-end gap-3" onClick={e => e.stopPropagation()}>
                        <Link href={`/dashboard/appointments/${appt.id}`}>
                          <Button className="px-4 py-2 bg-primary hover:bg-primary/90 text-white font-bold uppercase tracking-widest text-[10px] rounded-xl transition-all active:scale-95 h-auto">
                            View session
                          </Button>
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
        {appointments.length === 0 ? (
          <div className="py-20 text-center text-slate-300">
            <CalendarIcon className="w-12 h-12 mx-auto mb-4 opacity-10" />
            <p className="text-sm font-medium">Your schedule is clear.</p>
          </div>
        ) : (
          appointments.map((appt) => {
            const hasNotes = appt.therapistNotes && appt.therapistNotes.length > 0;

            return (
              <Card
                key={appt.id}
                onClick={() => navigateToDetail(appt.id)}
                className={`flex flex-col transition-all duration-300 overflow-hidden active:scale-[0.98] cursor-pointer p-0 gap-0 ${['CANCELLED', 'COMPLETED', 'EXPIRED'].includes(appt.status) ? 'opacity-70' : ''
                  }`}
              >
                {/* Header Info */}
                <div className="p-5 flex flex-col gap-3">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-base transition-all shadow-sm shrink-0 border bg-white text-primary border-slate-100">
                        {appt.patient?.firstName?.[0]}
                      </div>
                      <div className="min-w-0">
                        <div className="text-base font-bold text-slate-900 truncate">
                          {appt.patient?.firstName} {appt.patient?.lastName}
                        </div>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="text-sm font-semibold text-slate-900">
                        {new Date(appt.scheduledAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: 'Asia/Kolkata' })}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-2 text-xs pt-1">
                    <div className={`font-medium flex items-center gap-1.5 ${appt.mode === 'IN_CLINIC' ? 'text-emerald-600' : 'text-slate-400'}`}>
                      {appt.mode === 'IN_CLINIC' ? (
                        <><MapPin className="w-3.5 h-3.5" /> In-Clinic Visit</>
                      ) : (
                        <><Video className="w-3.5 h-3.5" /> Video Session</>
                      )}
                    </div>
                    <div className="text-slate-500 font-medium flex items-center gap-1">
                      <Clock className="w-3 h-3 text-slate-400" />
                      <span>{new Date(appt.scheduledAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Kolkata' })}</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 mt-1">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest border shrink-0 ${appt.status === 'CONFIRMED' ? 'bg-green-50 text-green-700 border-green-100' :
                      appt.status === 'PENDING' ? 'bg-amber-50 text-amber-700 border-amber-100' :
                        appt.status === 'COMPLETED' ? 'bg-blue-50 text-blue-700 border-blue-100' :
                          appt.status === 'EXPIRED' ? 'bg-slate-50 text-slate-400 border-slate-100' :
                            'bg-slate-50 text-slate-500 border-slate-100'
                      }`}>
                      {appt.status}
                    </span>
                    {hasNotes && (
                      <div className="flex items-center gap-1 px-1.5 py-0.5 bg-blue-50 text-blue-600 rounded border border-blue-100 shrink-0">
                        <FileText className="w-2.5 h-2.5 shrink-0" />
                        <span className="text-[10px] font-bold uppercase tracking-widest whitespace-nowrap">Notes</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Actions Bar */}
                <div className="px-5 pb-5 flex items-center border-t border-slate-50 pt-4">
                  <div className="flex gap-2 flex-1 min-w-0" onClick={e => e.stopPropagation()}>
                    <Link href={`/dashboard/appointments/${appt.id}`} className="w-full">
                      <Button className="w-full bg-primary hover:bg-primary/90 text-white font-bold uppercase tracking-widest text-[10px] rounded-xl py-2.5 h-auto transition-all active:scale-95">
                        View session
                      </Button>
                    </Link>
                  </div>
                </div>
              </Card>
            );
          })
        )}
      </div>
    </Card>
  );
}
