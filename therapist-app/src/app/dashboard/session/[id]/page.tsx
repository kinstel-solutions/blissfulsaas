import {
  ArrowLeft,
  Mic,
  Video,
  Monitor,
  PhoneOff,
  MessageSquare,
  Plus,
  CheckCircle,
  Shield,
  MoreVertical,
  FileText,
  Clock,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default function SessionRoomPage() {
  // Mock data for Emily Rodriguez Session
  const session = {
    patient: "Emily Rodriguez",
    timeStarted: "2:05 PM",
    duration: "45m elapsed",
    notes: [
      "Patient reporting improved sleep cycles.",
      "Discussed resilience strategy for work-life boundary.",
      "Assigned reading on Stoic Mindfulness.",
    ],
  };

  return (
    <div className="h-[90vh] flex flex-col lg:flex-row gap-8 pb-10">
      {/* Session Navigation Slot */}
      <div className="flex flex-col flex-1 relative gap-6">
        {/* Breadcrumb Header */}
        <header className="flex justify-between items-center bg-surface/50 backdrop-blur-md p-4 px-1 rounded-3xl z-10 sticky top-0 border-b border-outline-variant/10">
          <Link
            href="/dashboard"
            className="group flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-primary/60 hover:text-primary transition-colors pl-4">
            <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform" />
            Dashboard
          </Link>
          <div className="flex items-center gap-3">
            <div className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60 mr-4 flex items-center gap-2">
              <Shield className="w-3.5 h-3.5" /> HIPAA Secured Channel
            </p>
          </div>
        </header>

        {/* Video Canvas - The Virtual Sanctuary */}
        <div className="flex-1 bg-surface-container-low rounded-[3.5rem] border border-outline-variant/30 overflow-hidden relative shadow-2xl flex flex-col group">
          {/* Background Overlay */}
          <div className="absolute inset-0 bg-linear-to-b from-black/40 via-transparent to-black/60 pointer-events-none z-10" />

          {/* Main Video (Patient) */}
          <Image
            src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=1200&h=800"
            alt="Patient Feed"
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-10000"
          />

          {/* Self-Feed Picture in Picture */}
          <div className="absolute top-10 right-10 w-48 aspect-video bg-surface-container-lowest rounded-3xl border border-white/20 shadow-2xl overflow-hidden z-20 group/pip hover:scale-110 transition-transform">
            <Image
              src="https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=400&h=300"
              alt="Therapist Feed"
              fill
              className="object-cover"
            />
            <div className="absolute bottom-2 left-3 z-30 px-2 py-0.5 rounded-full bg-black/40 backdrop-blur-md text-[8px] font-bold uppercase tracking-widest text-white">
              You (Dr. Jenkins)
            </div>
          </div>

          {/* Session Timer Overlay */}
          <div className="absolute top-10 left-10 z-20 flex flex-col gap-2">
            <p className="text-[10px] font-bold uppercase tracking-widest text-white/60">
              Current Session
            </p>
            <h2 className="text-3xl font-heading text-white">
              {session.patient}
            </h2>
            <div className="flex items-center gap-2 text-white/50 text-[10px] uppercase font-bold tracking-widest">
              <Clock className="w-3.5 h-3.5" /> {session.duration}
            </div>
          </div>

          {/* Call Controls HUD */}
          <div className="absolute bottom-12 left-1/2 -translate-x-1/2 z-20 flex items-center gap-4">
            <button className="w-14 h-14 rounded-full bg-white/10 backdrop-blur-xl border border-white/20 flex items-center justify-center text-white hover:bg-white/20 transition-all shadow-xl">
              <Mic className="w-6 h-6" />
            </button>
            <button className="w-14 h-14 rounded-full bg-white/10 backdrop-blur-xl border border-white/20 flex items-center justify-center text-white hover:bg-white/20 transition-all shadow-xl">
              <Video className="w-6 h-6" />
            </button>
            <button className="w-14 h-14 rounded-full bg-white/10 backdrop-blur-xl border border-white/20 flex items-center justify-center text-white hover:bg-white/20 transition-all shadow-xl">
              <Monitor className="w-6 h-6" />
            </button>
            <button className="w-16 h-16 rounded-2xl bg-destructive text-white border border-destructive/50 flex items-center justify-center shadow-2xl hover:scale-110 active:scale-95 transition-all mx-4">
              <PhoneOff className="w-7 h-7" />
            </button>
            <button className="w-14 h-14 rounded-full bg-white/10 backdrop-blur-xl border border-white/20 flex items-center justify-center text-white hover:bg-white/20 transition-all shadow-xl">
              <MessageSquare className="w-6 h-6" />
            </button>
          </div>
        </div>
      </div>

      {/* Clinical Notes Sidebar - Architectural Right Column */}
      <aside className="w-full lg:w-96 flex flex-col gap-8">
        <div className="flex-1 bg-surface-container-lowest rounded-[3rem] border border-outline-variant/30 p-10 flex flex-col shadow-xl">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-[10px] font-bold uppercase tracking-widest text-primary/60 flex items-center gap-2">
              <FileText className="w-4 h-4" /> Live Clinical Notes
            </h3>
            <MoreVertical className="w-4 h-4 text-muted-foreground/40" />
          </div>

          <div className="space-y-8 flex-1">
            {session.notes.map((note, idx) => (
              <div
                key={idx}
                className="group flex gap-4">
                <div className="w-1.5 h-1.5 rounded-full bg-primary/30 mt-2.5 group-hover:bg-primary transition-colors" />
                <p className="text-sm font-medium text-foreground leading-relaxed tracking-tight">
                  {note}
                </p>
              </div>
            ))}
            <div className="pt-4">
              <button className="w-full h-12 flex items-center justify-center gap-2 rounded-2xl bg-surface-container-low text-primary text-xs font-bold uppercase tracking-widest hover:bg-primary/5 transition-all">
                <Plus className="w-3.5 h-3.5" /> Append observation
              </button>
            </div>
          </div>

          <div className="mt-10 pt-10 border-t border-outline-variant/10 space-y-4">
            <div className="p-5 bg-primary/5 rounded-2xl border border-primary/10 flex items-center gap-4">
              <CheckCircle className="w-5 h-5 text-primary" />
              <div className="text-left">
                <p className="text-[8px] font-bold uppercase tracking-widest text-primary/60">
                  Auto-Summary
                </p>
                <p className="text-xs font-bold text-primary">
                  Session Progress: High
                </p>
              </div>
            </div>
            <button className="w-full h-14 bg-surface text-foreground border border-outline-variant/50 font-bold uppercase tracking-widest text-[10px] rounded-2xl shadow-sm hover:shadow-lg transition-all">
              Finalize and Secure Encrypt
            </button>
          </div>
        </div>
      </aside>
    </div>
  );
}
