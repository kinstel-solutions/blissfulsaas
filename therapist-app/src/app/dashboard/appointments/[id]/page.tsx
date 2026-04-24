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
  Phone
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

      {/* Session Metadata Bar */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-2 lg:p-3 flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-4 lg:gap-8 px-4">
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

        <div className="flex items-center gap-4 pr-2">
           {appointment.status !== 'COMPLETED' && appointment.status !== 'CANCELLED' && (
             appointment.mode === 'IN_CLINIC' ? (
               <div className="px-4 py-2 bg-emerald-50 text-emerald-700 rounded-xl text-[10px] font-bold uppercase tracking-wider flex items-center gap-2 border border-emerald-100">
                 🏥 In-Clinic
               </div>
             ) : (
               <Link href={`/dashboard/sessions/${appointment.id}/call`}>
                 <button className="px-5 py-2 bg-slate-900 text-white rounded-xl text-[10px] font-bold uppercase tracking-wider hover:bg-primary transition-all flex items-center gap-2">
                   <Video className="w-3.5 h-3.5" />
                   Join Call
                 </button>
               </Link>
             )
           )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
        {/* Left Column: Patient Intake */}
        <div className="lg:col-span-5">
          <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden h-full">
             <div className="p-5 lg:p-6 bg-slate-50/50 border-b border-slate-100">
                <div className="flex items-center gap-2">
                   <ClipboardList className="w-4 h-4 text-violet-600" />
                   <h2 className="text-[10px] lg:text-xs font-bold text-slate-900 uppercase tracking-widest">Clinical Intake</h2>
                </div>
             </div>
             <div className="p-5 lg:p-8">
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
                               <p className="text-xs lg:text-sm text-slate-700 leading-relaxed italic">"{appointment.patient.reasonForSeeking}"</p>
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
                               <p className="text-xs lg:text-sm text-slate-700 leading-relaxed">{appointment.patient.mentalHealthHistory}</p>
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

                      {(appointment.patient?.emergencyContactName || appointment.patient?.emergencyContactPhone) && (
                         <div className="pt-6 border-t border-slate-100">
                            <p className="text-[9px] lg:text-[10px] font-bold text-red-400 uppercase tracking-widest mb-3">Emergency Contact</p>
                            <div className="flex items-center justify-between p-3 lg:p-4 bg-red-50/30 rounded-2xl border border-red-100/50">
                               <div>
                                  <p className="text-xs font-bold text-slate-900">{appointment.patient.emergencyContactName || 'Not Provided'}</p>
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
             </div>
          </div>
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
