"use client";

import { useEffect, useState, useCallback } from "react";
import { api } from "@/lib/api";
import { FileText, Save, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";

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
    <div className="flex flex-col flex-1 min-h-0 animate-in slide-in-from-right duration-300">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 gap-2">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
          <h3 className="text-xs font-bold uppercase tracking-widest text-primary/60 flex items-center gap-2">
            <FileText className="w-4 h-4" /> Private Notes
          </h3>
        </div>
        <Button
          onClick={handleSave}
          disabled={saving || loading}
          className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest disabled:opacity-50 transition-all active:scale-95 h-auto px-3 py-1.5 md:px-4 md:py-2 shrink-0 whitespace-nowrap"
        >
          {saving ? (
            <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin shrink-0" />
          ) : saved ? (
            <Check className="w-3.5 h-3.5 text-green-400 shrink-0" />
          ) : (
            <Save className="w-3.5 h-3.5 shrink-0" />
          )}
          <span>{saved ? "Saved" : "Save"}</span>
        </Button>
      </div>

      {/* Editor Box */}
      <div className="flex-1 flex flex-col relative overflow-hidden bg-slate-50 border border-slate-200 rounded-2xl min-h-0">
        {loading ? (
          <div className="w-full h-full flex items-center justify-center py-20">
            <div className="w-8 h-8 border-4 border-slate-200 border-t-amber-500 rounded-full animate-spin flex-shrink-0" />
          </div>
        ) : (
          <Textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Start typing your clinical notes here... 

These notes are strictly private and will only be visible to you for future reference."
            className="flex-1 w-full p-4 lg:p-6 bg-transparent border-none focus-visible:ring-0 focus-visible:ring-offset-0 resize-none outline-none text-slate-800 text-sm leading-relaxed transition-all min-h-0"
          />
        )}
      </div>
    </div>
  );
}
