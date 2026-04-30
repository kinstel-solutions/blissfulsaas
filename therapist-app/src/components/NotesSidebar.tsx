"use client";

import { useEffect, useState, useCallback } from "react";
import { api } from "@/lib/api";
import { FileText, Save, Check } from "lucide-react";

interface NotesSidebarProps {
  appointmentId: string;
}

export default function NotesSidebar({ appointmentId }: NotesSidebarProps) {
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadNotes = useCallback(async () => {
    try {
      const data = await api.sessions.getNotes(appointmentId);
      if (data?.notes) setNotes(data.notes);
    } catch {
      console.error("Failed to load notes");
    } finally {
      setLoading(false);
    }
  }, [appointmentId]);

  useEffect(() => {
    loadNotes();
  }, [loadNotes]);

  const handleSave = async () => {
    setSaving(true);
    setSaved(false);
    try {
      await api.sessions.updateNotes(appointmentId, notes);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (error) {
      console.error("Failed to save notes", error);
      alert("Failed to save notes. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex flex-col flex-1 bg-slate-50 border border-slate-200 rounded-2xl animate-in slide-in-from-right duration-300">
      <div className="flex items-center justify-between px-6 py-5 border-b border-slate-200 bg-white rounded-t-2xl">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center text-amber-600">
            <FileText className="w-4 h-4" />
          </div>
          <h3 className="text-sm font-bold uppercase tracking-widest text-slate-800">
            Private Notes
          </h3>
        </div>
        <button
          onClick={handleSave}
          disabled={saving || loading}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold uppercase tracking-widest hover:bg-slate-800 disabled:opacity-50 transition-all shadow-md active:scale-95"
        >
          {saving ? (
            <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : saved ? (
            <Check className="w-3.5 h-3.5 text-green-400" />
          ) : (
            <Save className="w-3.5 h-3.5" />
          )}
          {saved ? "Saved" : "Save"}
        </button>
      </div>

      <div className="flex-1 flex flex-col relative overflow-hidden">
        {loading ? (
          <div className="w-full h-full flex items-center justify-center">
            <div className="w-8 h-8 border-4 border-slate-200 border-t-amber-500 rounded-full animate-spin flex-shrink-0" />
          </div>
        ) : (
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Start typing your clinical notes here... 

These notes are strictly private and will only be visible to you for future reference."
            className="flex-1 w-full p-6 lg:p-8 bg-transparent resize-none outline-none text-slate-800 text-sm leading-relaxed transition-all min-h-[300px]"
          />
        )}
      </div>
    </div>
  );
}
