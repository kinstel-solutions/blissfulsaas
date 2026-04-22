import { fetchWithAuthContent } from "@/lib/api-server";
import { 
  Calendar as CalendarIcon, 
  Clock, 
  Video,
  FileText,
  Activity,
  ClipboardList,
  ChevronLeft,
  MessageSquare
} from "lucide-react";
import Link from "next/link";
import AppointmentActions from "@/components/AppointmentActions";
import AppointmentNotesClient from "./AppointmentNotesClient";
import { notFound } from "next/navigation";

export default async function AppointmentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const appointment = await fetchWithAuthContent(`/sessions/${id}`);
  
  if (!appointment || appointment.error) {
    notFound();
  }

  const scheduledAt = new Date(appointment.scheduledAt);
  const dateStr = scheduledAt.toLocaleDateString('en-US', { 
    weekday: 'long', 
    month: 'long', 
    day: 'numeric',
    year: 'numeric'
  });
  const timeStr = scheduledAt.toLocaleTimeString('en-US', { 
    hour: '2-digit', 
    minute: '2-digit' 
  });

  return (
    <div className="max-w-6xl mx-auto space-y-6 lg:space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 px-1">
      {/* Navigation & Header */}
      <div className="flex flex-col gap-4 lg:gap-6">
        <Link 
          href="/dashboard/appointments" 
          className="flex items-center gap-2 text-slate-500 hover:text-primary transition-colors group w-fit ml-2"
        >
          <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span className="text-[10px] lg:text-sm font-bold uppercase tracking-[0.15em] lg:tracking-widest">Appointments</span>
        </Link>
        
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 px-2">
          <div className="flex items-center gap-4 lg:gap-5">
            <div className="w-14 h-14 lg:w-16 lg:h-16 rounded-[1.5rem] lg:rounded-[2rem] bg-primary text-white flex items-center justify-center font-bold text-xl lg:text-2xl shadow-xl shadow-primary/20 shrink-0">
              {appointment.patient?.firstName?.[0]}
            </div>
            <div className="min-w-0">
              <h1 className="text-2xl lg:text-3xl font-heading font-medium text-slate-900 truncate">
                {appointment.patient?.firstName} {appointment.patient?.lastName}
              </h1>
              <div className="flex flex-wrap items-center gap-2 lg:gap-3 mt-1">
                <span className={`px-2 lg:px-3 py-0.5 lg:py-1 rounded-full text-[9px] lg:text-[10px] font-bold uppercase tracking-[0.1em] lg:tracking-[0.2em] border ${
                  appointment.status === 'CONFIRMED' ? 'bg-green-50 text-green-700 border-green-100' :
                  appointment.status === 'PENDING' ? 'bg-amber-50 text-amber-700 border-amber-100' :
                  appointment.status === 'COMPLETED' ? 'bg-blue-50 text-blue-700 border-blue-100' :
                  'bg-slate-50 text-slate-500 border-slate-100'
                }`}>
                  {appointment.status}
                </span>
                <span className="text-slate-300 text-xs hidden lg:block">|</span>
                <span className="text-slate-500 text-[10px] lg:text-xs font-medium truncate max-w-[150px] lg:max-w-none">
                  {appointment.patient?.user?.email}
                </span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2 lg:gap-3">
             <Link href={`/dashboard/messages?sessionId=${appointment.id}`} className="flex-1 lg:flex-none">
                <button className="w-full lg:w-auto px-5 lg:px-6 py-3 bg-white text-slate-700 rounded-2xl border border-slate-200 font-bold text-[10px] lg:text-xs uppercase tracking-widest hover:bg-slate-50 transition-all flex items-center justify-center gap-2 shadow-sm">
                   <MessageSquare className="w-4 h-4 text-primary" />
                   Message
                </button>
             </Link>
             <div className="flex-1 lg:flex-none">
                <AppointmentActions id={appointment.id} status={appointment.status} />
             </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
        {/* Left Column: Session Info & Intake */}
        <div className="lg:col-span-1 space-y-6 lg:space-y-8">
          {/* Quick Stats */}
          <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden">
             <div className="p-5 lg:p-6 bg-slate-50/50 border-b border-slate-100">
                <div className="flex items-center gap-2">
                   <Activity className="w-4 h-4 text-primary" />
                   <h2 className="text-[10px] lg:text-xs font-bold text-slate-900 uppercase tracking-widest">Session Summary</h2>
                </div>
             </div>
             <div className="p-5 lg:p-6 space-y-5 lg:space-y-6">
                <div className="grid grid-cols-2 lg:grid-cols-1 gap-4 lg:gap-6">
                  <div className="flex items-start gap-3 lg:gap-4">
                    <div className="w-9 h-9 lg:w-10 lg:h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                        <CalendarIcon className="w-4 h-4 lg:w-5 lg:h-5 text-primary" />
                    </div>
                    <div className="min-w-0">
                        <p className="text-[9px] lg:text-[10px] font-bold text-slate-400 uppercase tracking-widest">Date</p>
                        <p className="text-xs lg:text-sm font-semibold text-slate-900 mt-0.5 truncate">{scheduledAt.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3 lg:gap-4">
                    <div className="w-9 h-9 lg:w-10 lg:h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                        <Clock className="w-4 h-4 lg:w-5 lg:h-5 text-primary" />
                    </div>
                    <div className="min-w-0">
                        <p className="text-[9px] lg:text-[10px] font-bold text-slate-400 uppercase tracking-widest">Time</p>
                        <p className="text-xs lg:text-sm font-semibold text-slate-900 mt-0.5 truncate">{timeStr}</p>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-50">
                  {appointment.status !== 'COMPLETED' && appointment.status !== 'CANCELLED' && (
                    appointment.mode === 'IN_CLINIC' ? (
                      <div className="w-full py-3.5 lg:py-4 bg-emerald-50 text-emerald-700 rounded-2xl text-[10px] lg:text-xs font-bold uppercase tracking-[0.15em] lg:tracking-[0.2em] flex items-center justify-center gap-2 border border-emerald-200 shadow-sm shadow-emerald-100/50">
                        🏥 In-Clinic Visit
                      </div>
                    ) : (
                      <Link href={`/dashboard/sessions/${appointment.id}/call`} className="block">
                        <button className="w-full py-3.5 lg:py-4 bg-slate-900 text-white rounded-2xl text-[10px] lg:text-xs font-bold uppercase tracking-[0.15em] lg:tracking-[0.2em] hover:bg-primary transition-all flex items-center justify-center gap-2 shadow-lg shadow-slate-200">
                          <Video className="w-4 h-4" />
                          Join Call
                        </button>
                      </Link>
                    )
                  )}
                  <div className="mt-3 text-center">
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Duration: {appointment.duration} Min</p>
                  </div>
                </div>
             </div>
          </div>

          {/* Intake Information */}
          <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden">
             <div className="p-5 lg:p-6 bg-slate-50/50 border-b border-slate-100">
                <div className="flex items-center gap-2">
                   <ClipboardList className="w-4 h-4 text-violet-600" />
                   <h2 className="text-[10px] lg:text-xs font-bold text-slate-900 uppercase tracking-widest">Patient Intake</h2>
                </div>
             </div>
             <div className="p-5 lg:p-6">
                {!appointment.patient?.intakeCompleted ? (
                   <div className="flex flex-col items-center justify-center text-center py-6 lg:py-10 opacity-30">
                      <ClipboardList className="w-10 h-10 lg:w-12 lg:h-12 mb-3 lg:mb-4 text-slate-300" />
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">No Intake Form</p>
                   </div>
                ) : (
                   <div className="space-y-5 lg:space-y-6">
                      {appointment.patient?.primaryConcerns?.length > 0 && (
                         <div>
                            <p className="text-[9px] lg:text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Primary Concerns</p>
                            <div className="flex flex-wrap gap-1.5 lg:gap-2">
                               {appointment.patient.primaryConcerns.map((c: string) => (
                                  <span key={c} className="px-2.5 py-1 bg-violet-50 text-violet-700 text-[9px] lg:text-[10px] font-bold rounded-lg border border-violet-100">{c}</span>
                               ))}
                            </div>
                         </div>
                      )}
                      
                      {appointment.patient?.reasonForSeeking && (
                         <div>
                            <p className="text-[9px] lg:text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Reason for Seeking</p>
                            <div className="p-3 lg:p-4 bg-slate-50 rounded-2xl border border-slate-100">
                               <p className="text-xs lg:text-sm text-slate-700 leading-relaxed italic truncate lg:whitespace-normal">"{appointment.patient.reasonForSeeking}"</p>
                            </div>
                         </div>
                      )}

                      {appointment.patient?.therapyGoals && (
                         <div>
                            <p className="text-[9px] lg:text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Clinical Goals</p>
                            <div className="p-3 lg:p-4 bg-slate-50 rounded-2xl border border-slate-100">
                               <p className="text-xs lg:text-sm text-slate-700 leading-relaxed">{appointment.patient.therapyGoals}</p>
                            </div>
                         </div>
                      )}
                   </div>
                )}
             </div>
          </div>
        </div>

        {/* Right Column: Clinical Workstation / Notes */}
        <div className="lg:col-span-2">
           <AppointmentNotesClient 
             appointmentId={appointment.id} 
             initialNotes={appointment.therapistNotes || ""} 
           />
        </div>
      </div>
    </div>
  );
}
