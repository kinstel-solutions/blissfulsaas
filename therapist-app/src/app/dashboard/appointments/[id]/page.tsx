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
import PatientIntakeContent from "@/components/PatientIntakeContent";
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
    year: 'numeric',
    timeZone: 'Asia/Kolkata'
  });
  const timeStr = scheduledAt.toLocaleTimeString('en-US', { 
    hour: '2-digit', 
    minute: '2-digit',
    timeZone: 'Asia/Kolkata'
  });

  return (
    <div className="max-w-6xl mx-auto space-y-6 lg:space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 px-1 pb-12 lg:pb-16">
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

          <div className="flex items-center gap-2.5 shrink-0 w-full lg:w-auto">
            <AppointmentActions id={appointment.id} status={appointment.status} />
          </div>
        </div>
      </div>

      {/* Session Metadata Bar */}
      <Card className="rounded-3xl p-5 sm:p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-5">
        <div className="grid grid-cols-2 sm:flex sm:flex-wrap items-center gap-4 lg:gap-8">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
              <CalendarIcon className="w-4 h-4 text-primary" />
            </div>
            <div>
              <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Date</p>
              <p className="text-[11px] font-semibold text-slate-900">{scheduledAt.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'Asia/Kolkata' })}</p>
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

        <div className="flex flex-row items-center gap-2.5 sm:gap-3 w-full lg:w-auto">
           {appointment.status !== 'COMPLETED' && appointment.status !== 'CANCELLED' && appointment.status !== 'EXPIRED' && appointment.mode === 'ONLINE' && (
              <Link
                 href={`/dashboard/sessions/${appointment.id}/call`}
                 className={`flex-1 lg:flex-initial ${buttonVariants({
                    variant: "default",
                    className: "w-full lg:w-auto font-bold text-[10px] sm:text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2 sm:gap-2.5 active:scale-95 h-auto py-3 px-3 sm:px-5 rounded-xl shadow-md hover:shadow-lg"
                 })}`}
              >
                 <Video className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white shrink-0" />
                 <span>Join Call</span>
              </Link>
           )}
           <Link
              href={`/dashboard/messages?sessionId=${appointment.id}`}
              className={`flex-1 lg:flex-initial ${buttonVariants({
                 variant: "secondary",
                 className: "w-full lg:w-auto font-bold text-[10px] sm:text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2 sm:gap-2.5 active:scale-95 h-auto py-3 px-3 sm:px-5 rounded-xl border-0 hover:bg-secondary/80 shadow-xs"
              })}`}
           >
              <MessageSquare className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary shrink-0" />
              <span>Message</span>
           </Link>
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
                <PatientIntakeContent patient={appointment.patient as any} />
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
