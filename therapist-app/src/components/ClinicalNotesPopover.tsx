"use client";

import { useState } from "react";
import { StickyNote, X, Save, Check } from "lucide-react";
import { api } from "@/lib/api";

export default function ClinicalNotesPopover({ appointmentId, initialNotes }: { appointmentId: string, initialNotes?: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const [notes, setNotes] = useState(initialNotes || "");
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  const saveNotes = async () => {
    setLoading(true);
    try {
      await api.sessions.updateNotes(appointmentId, notes);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (error) {
      console.error("Failed to save notes", error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) {
    return (
      <button 
        onClick={() => setIsOpen(true)}
        className={`p-2 rounded-lg transition-all flex items-center gap-2 ${
          initialNotes ? 'text-blue-600 bg-blue-50 hover:bg-blue-100' : 'text-slate-400 hover:bg-slate-100'
        }`}
        title="View Clinical Notes"
      >
        <StickyNote className="w-5 h-5" />
        {initialNotes && <span className="text-xs font-bold uppercase tracking-widest">Notes</span>}
      </button>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl border border-slate-100 overflow-hidden animate-in slide-in-from-bottom-4 duration-500">
        <header className="p-8 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg">
              <StickyNote className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 leading-tight">Clinical Session Notes</h3>
              <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">Private Record • Confidential</p>
            </div>
          </div>
          <button onClick={() => setIsOpen(false)} className="p-2 text-slate-400 hover:text-slate-900 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </header>

        <div className="p-8">
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Type your clinical observations, treatment plans, or private session notes here..."
            className="w-full h-64 bg-slate-50/50 border-none rounded-3xl p-6 text-sm text-slate-800 placeholder:text-slate-400 focus:ring-2 focus:ring-blue-500/20 transition-all resize-none outline-none leading-relaxed"
          />
          
          <div className="mt-8 flex items-center justify-between">
            <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">
              Last auto-synced: {new Date().toLocaleTimeString()}
            </p>
            <button 
              onClick={saveNotes}
              disabled={loading}
              className={`flex items-center gap-2 px-6 py-3 rounded-2xl text-xs font-bold uppercase tracking-widest transition-all shadow-lg active:scale-95 ${
                saved 
                  ? 'bg-green-500 text-white shadow-green-200' 
                  : 'bg-slate-900 text-white hover:bg-blue-600 shadow-slate-200'
              }`}
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : saved ? (
                <>
                  <Check className="w-4 h-4" />
                  Notes Saved
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Save Notes
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
