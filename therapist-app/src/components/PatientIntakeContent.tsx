"use client";

import { useState } from "react";
import { User, FileText, Phone, ClipboardList, ChevronDown, ChevronUp } from "lucide-react";

interface PatientIntakeData {
  firstName?: string;
  lastName?: string;
  fullName?: string;
  age?: string | number;
  pronouns?: string;
  city?: string;
  user?: { email?: string };
  reasonForSeeking?: string;
  mentalHealthHistory?: string;
  currentMedications?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  intakeCompleted?: boolean;
}

export default function PatientIntakeContent({ 
  patient, 
  defaultExpanded = true 
}: { 
  patient: PatientIntakeData; 
  defaultExpanded?: boolean; 
}) {
  const [isOpen, setIsOpen] = useState(defaultExpanded);

  if (!patient.intakeCompleted && !patient.reasonForSeeking && !patient.mentalHealthHistory) {
    return (
      <div className="flex flex-col items-center justify-center text-center py-10 lg:py-20 opacity-30">
        <ClipboardList className="w-10 h-10 lg:w-12 lg:h-12 mb-4 text-slate-300" />
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">No Intake Data Available</p>
      </div>
    );
  }

  const displayName = patient.fullName || `${patient.firstName} ${patient.lastName}`;

  return (
    <div className="space-y-6">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between py-3.5 text-slate-700 hover:text-slate-950 transition-colors font-bold text-sm uppercase tracking-wider border border-slate-200 bg-slate-100/40 hover:bg-slate-100/70 rounded-xl px-5"
      >
        <span>{isOpen ? "Close Intake Details" : "Open Intake Details"}</span>
        {isOpen ? <ChevronUp className="w-4 h-4 text-slate-600" /> : <ChevronDown className="w-4 h-4 text-slate-600" />}
      </button>

      {isOpen && (
        <div className="space-y-8 animate-in fade-in slide-in-from-top-2 duration-200">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pb-8 border-b border-slate-100">
        <div>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Full Name</p>
          <p className="text-base font-medium text-slate-900">{displayName}</p>
        </div>
        <div>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Age</p>
          <p className="text-base font-medium text-slate-900">{patient.age || "Not provided"}</p>
        </div>
        <div>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Pronouns</p>
          <p className="text-base font-medium text-slate-900">{patient.pronouns || "Not provided"}</p>
        </div>
        <div>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">City</p>
          <p className="text-base font-medium text-slate-900">{patient.city || "Not provided"}</p>
        </div>
      </div>

      <div>
        <h4 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
          <User className="w-4 h-4 text-primary" /> Reason for Seeking Therapy
        </h4>
        <p className="text-sm text-slate-600 leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-100 italic">
          "{patient.reasonForSeeking || "No information provided."}"
        </p>
      </div>

      <div>
        <h4 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
          <FileText className="w-4 h-4 text-primary" /> Health Background
        </h4>
        <div className="space-y-4">
          <div className="bg-amber-50/30 p-4 rounded-xl border border-amber-100/50">
            <p className="text-xs font-bold text-amber-700/60 uppercase tracking-widest mb-2">Mental Health History</p>
            <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">{patient.mentalHealthHistory || "None provided."}</p>
          </div>
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Current Medications</p>
            {patient.currentMedications ? (
              <div className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full border border-blue-100 text-[10px] font-bold uppercase tracking-wider inline-block">
                {patient.currentMedications}
              </div>
            ) : (
              <p className="text-sm text-slate-600 leading-relaxed">None provided.</p>
            )}
          </div>
        </div>
      </div>

      {(patient.emergencyContactName || patient.emergencyContactPhone) && (
        <div className="pt-6 border-t border-slate-100">
          <h4 className="text-[10px] lg:text-[10px] font-bold text-red-400 uppercase tracking-widest mb-3 flex items-center gap-2">
            Emergency Contact
          </h4>
          <div className="bg-red-50/30 p-4 rounded-xl border border-red-100 flex items-center justify-between">
            <div>
              <p className="text-base font-bold text-slate-900">{patient.emergencyContactName || "Not provided"}</p>
              <p className="text-[10px] font-medium text-slate-500 mt-0.5">{patient.emergencyContactPhone || "No phone provided"}</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-red-100 text-red-600 flex items-center justify-center font-bold">
              <Phone className="w-4 h-4" />
            </div>
          </div>
        </div>
      )}
        </div>
      )}
    </div>
  );
}
