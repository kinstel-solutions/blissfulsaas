import { fetchWithAuthContent } from "@/lib/api-server";
import { 
  Calendar as CalendarIcon, 
  Clock, 
  Video,
  FileText,
  Activity,
  ClipboardList,
  ChevronLeft,
  MessageSquare,
  Phone,
  Building2
} from "lucide-react";
import Link from "next/link";
import AppointmentActions from "@/components/AppointmentActions";
import AppointmentNotesClient from "./AppointmentNotesClient";
import { notFound } from "next/navigation";
import { AlexButton } from "@/components/ui/AlexButton";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardHeader, CardContent } from "@/components/ui/card";

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
                  appointment.status === 'EXPIRED' ? 'bg-slate-50 text-slate-400 border-slate-100' :
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
          
          <div className="grid grid-cols-2 gap-2 w-full lg:flex lg:w-auto lg:items-center lg:gap-3">
             {appointment.status !== 'COMPLETED' && appointment.status !== 'CANCELLED' && appointment.status !== 'EXPIRED' && appointment.mode === 'ONLINE' && (
                <Link
                   href={`/dashboard/sessions/${appointment.id}/call`}
                   className={buttonVariants({
                      variant: "default",
                      className: "w-full lg:w-auto font-bold text-[10px] uppercase tracking-widest transition-all flex items-center justify-center gap-2 active:scale-95 h-auto py-2.5 px-4 lg:flex-none"
                   })}
                >
                   <Video className="w-3.5 h-3.5 text-white shrink-0" />
                   <span>Join Call</span>
                </Link>
             )}
             <Link
                href={`/dashboard/messages?sessionId=${appointment.id}`}
                className={buttonVariants({
                   variant: "secondary",
                   className: "w-full lg:w-auto font-bold text-[10px] uppercase tracking-widest transition-all flex items-center justify-center gap-2 active:scale-95 h-auto py-2.5 px-4 lg:flex-none border-0 hover:bg-secondary/80"
                })}
             >
                <MessageSquare className="w-3.5 h-3.5 text-primary shrink-0" />
                <span>Message</span>
             </Link>
             <div className="contents lg:block lg:flex-none">
                <AppointmentActions id={appointment.id} status={appointment.status} />
             </div>
          </div>
        </div>
      </div>

      {/* Session Metadata Bar */}
      <Card className="rounded-3xl p-4 lg:p-3 grid grid-cols-2 gap-4 sm:flex sm:flex-row sm:flex-wrap sm:items-center sm:justify-between sm:gap-4">
        <div className="contents sm:flex sm:flex-wrap sm:items-center gap-4 lg:gap-8 sm:px-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
              <CalendarIcon className="w-4 h-4 text-primary" />
            </div>
            <div>
              <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Date</p>
              <p className="text-[11px] font-semibold text-slate-900">{scheduledAt.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
              <Clock className="w-4 h-4 text-primary" />
            </div>
            <div>
              <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Time</p>
              <p className="text-[11px] font-semibold text-slate-900">{timeStr}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-violet-100/50 flex items-center justify-center shrink-0">
              <Activity className="w-4 h-4 text-violet-600" />
            </div>
            <div>
              <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Duration</p>
              <p className="text-[11px] font-semibold text-slate-900">{appointment.duration} Min</p>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-start sm:justify-end gap-4 pr-0 sm:pr-4">
           {appointment.mode === 'IN_CLINIC' ? (
             <div className="flex items-center gap-3">
               <div className="w-8 h-8 rounded-lg bg-emerald-100/50 flex items-center justify-center shrink-0">
                 <Building2 className="w-4 h-4 text-emerald-600" />
               </div>
               <div>
                 <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Mode</p>
                 <p className="text-[11px] font-semibold text-slate-900">In-Clinic</p>
               </div>
             </div>
           ) : (
             <div className="flex items-center gap-3">
               <div className="w-8 h-8 rounded-lg bg-blue-100/50 flex items-center justify-center shrink-0">
                 <Video className="w-4 h-4 text-blue-600" />
               </div>
               <div>
                 <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Mode</p>
                 <p className="text-[11px] font-semibold text-slate-900">Online</p>
               </div>
             </div>
           )}
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
        {/* Left Column: Patient Intake */}
        <div className="lg:col-span-5">
           <Card className="h-full p-0 gap-0">
              <CardHeader className="p-5 lg:p-8 bg-slate-50/50 border-b border-slate-100 flex flex-row items-center gap-3 space-y-0">
                 <div className="w-10 h-10 rounded-xl bg-violet-50 flex items-center justify-center shrink-0">
                    <ClipboardList className="w-5 h-5 text-violet-600" />
                 </div>
                 <div>
                    <h2 className="text-xs lg:text-sm font-bold text-slate-900 uppercase tracking-widest leading-none">Clinical Intake</h2>
                    <p className="text-[9px] lg:text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em] mt-1.5">Patient Intake Data</p>
                 </div>
              </CardHeader>
              <CardContent className="p-5 lg:p-8">
                {!appointment.patient?.intakeCompleted ? (
                   <div className="flex flex-col items-center justify-center text-center py-10 lg:py-20 opacity-30">
                      <ClipboardList className="w-10 h-10 lg:w-12 lg:h-12 mb-4 text-slate-300" />
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">No Intake Data Available</p>
                   </div>
                ) : (
                   <div className="space-y-6 lg:space-y-8">
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
                               <p className="text-base lg:text-sm text-slate-700 leading-relaxed italic">"{appointment.patient.reasonForSeeking}"</p>
                            </div>
                         </div>
                      )}

                      <div className="grid grid-cols-2 gap-4">
                         {appointment.patient?.previousTherapy !== null && (
                            <div className="col-span-1">
                               <p className="text-[9px] lg:text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Previous Therapy</p>
                               <span className={`inline-block px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${appointment.patient.previousTherapy ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-slate-100 text-slate-500 border border-slate-200'}`}>
                                  {appointment.patient.previousTherapy ? 'Yes' : 'No'}
                               </span>
                            </div>
                         )}

                         {appointment.patient?.currentMedications && (
                            <div className="col-span-1">
                               <p className="text-[9px] lg:text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Medications</p>
                               <div className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full border border-blue-100 text-[10px] font-bold uppercase tracking-wider inline-block">
                                  {appointment.patient.currentMedications}
                               </div>
                            </div>
                         )}
                      </div>

                      {appointment.patient?.mentalHealthHistory && (
                         <div>
                            <p className="text-[9px] lg:text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Clinical History</p>
                            <div className="p-3 lg:p-4 bg-amber-50/30 rounded-2xl border border-amber-100/50">
                               <p className="text-base lg:text-sm text-slate-700 leading-relaxed">{appointment.patient.mentalHealthHistory}</p>
                            </div>
                         </div>
                      )}

                      {appointment.patient?.therapyGoals && (
                         <div>
                            <p className="text-[9px] lg:text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Clinical Goals</p>
                            <div className="p-3 lg:p-4 bg-slate-50 rounded-2xl border border-slate-100">
                               <p className="text-base lg:text-sm text-slate-700 leading-relaxed">{appointment.patient.therapyGoals}</p>
                            </div>
                         </div>
                      )}

                      {(appointment.patient?.emergencyContactName || appointment.patient?.emergencyContactPhone) && (
                         <div className="pt-6 border-t border-slate-100">
                            <p className="text-[9px] lg:text-[10px] font-bold text-red-400 uppercase tracking-widest mb-3">Emergency Contact</p>
                            <div className="flex items-center justify-between p-3 lg:p-4 bg-red-50/30 rounded-2xl border border-red-100/50">
                               <div>
                                  <p className="text-base font-bold text-slate-900">{appointment.patient.emergencyContactName || 'Not Provided'}</p>
                                  <p className="text-[10px] text-slate-500 font-medium">{appointment.patient.emergencyContactPhone || 'No Phone'}</p>
                               </div>
                               <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center">
                                  <Phone className="w-3.5 h-3.5 text-red-600" />
                               </div>
                            </div>
                         </div>
                      )}
                    </div>
                 )}
              </CardContent>
           </Card>
        </div>

        {/* Right Column: Clinical Workstation / Notes */}
        <div className="lg:col-span-7 h-full">
           <AppointmentNotesClient 
             appointmentId={appointment.id} 
             initialNotes={appointment.therapistNotes || ""} 
           />
        </div>
      </div>
    </div>
  );
}
