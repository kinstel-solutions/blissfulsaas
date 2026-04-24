"use client";

import { useState } from "react";
import { FileText, Save, Check, StickyNote } from "lucide-react";
import { api } from "@/lib/api";

interface AppointmentNotesClientProps {
  appointmentId: string;
  initialNotes: string;
}

export default function AppointmentNotesClient({ appointmentId, initialNotes }: AppointmentNotesClientProps) {
  const [notes, setNotes] = useState(initialNotes);
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  const saveNotes = async () => {
    setLoading(true);
    try {
      await api.sessions.updateNotes(appointmentId, notes);
      setLoading(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (error) {
      console.error("Failed to save notes", error);
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm h-full flex flex-col overflow-hidden min-h-[400px] lg:min-h-[500px]">
      <div className="p-5 lg:p-8 bg-slate-50/50 border-b border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
            <FileText className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h2 className="text-xs lg:text-sm font-bold text-slate-900 uppercase tracking-widest leading-none">Clinical Observations</h2>
            <p className="text-[9px] lg:text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em] mt-1.5">Private Session Notes</p>
          </div>
        </div>
        
        <button 
          onClick={saveNotes}
          disabled={loading}
          className={`w-full sm:w-auto px-6 lg:px-8 py-3 lg:py-3 rounded-2xl text-[10px] lg:text-xs font-bold uppercase tracking-widest transition-all shadow-lg ${
            saved 
              ? 'bg-emerald-500 text-white shadow-emerald-200' 
              : 'bg-primary text-white hover:bg-primary/90 hover:-translate-y-0.5 active:translate-y-0 shadow-primary/20'
          } flex items-center justify-center gap-2`}
        >
          {loading ? (
            'Saving...'
          ) : saved ? (
            <>
              <Check className="w-4 h-4" />
              Saved
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              Save Notes
            </>
          )}
        </button>
      </div>

      <div className="flex-1 p-5 lg:p-8 relative group">
        <textarea 
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Begin documenting..."
          maxLength={5000}
          className="w-full h-full bg-slate-50/30 border-none p-0 text-base lg:text-lg text-slate-700 placeholder:text-slate-300 outline-none resize-none leading-relaxed font-normal min-h-[300px]"
        />
        
        <div className="absolute bottom-5 right-5 lg:bottom-8 lg:right-8 pointer-events-none hidden sm:block">
           <div className="flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm border border-slate-100 rounded-xl shadow-sm animate-in fade-in duration-500">
              <StickyNote className="w-4 h-4 text-slate-300" />
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Confidential Record</span>
           </div>
        </div>
      </div>

      <div className="px-5 lg:px-8 py-4 lg:py-6 bg-slate-50/20 border-t border-slate-50">
        <div className="flex items-center gap-4 lg:gap-6">
           <div className="flex -space-x-2 shrink-0">
              <div className="w-6 h-6 rounded-full bg-emerald-100 border-2 border-white flex items-center justify-center">
                 <Check className="w-3 h-3 text-emerald-600" />
              </div>
              <div className="w-6 h-6 rounded-full bg-blue-100 border-2 border-white flex items-center justify-center">
                 <FileText className="w-3 h-3 text-blue-600" />
              </div>
           </div>
           <p className="text-[9px] lg:text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-relaxed">
              Notes are encrypted and never visible to patients.
           </p>
        </div>
      </div>
    </div>
  );
}
