import { Users, Mail, Phone, Calendar, ArrowRight, Activity, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { fetchWithAuthContent } from "@/lib/api-server";
import PatientList from "@/components/PatientList";

export default async function PatientRosterPage() {
  const patients = await fetchWithAuthContent("/therapists/my-patients");
  const roster = Array.isArray(patients) ? patients : [];

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl font-heading font-medium text-slate-900 leading-none">
            My Patients
          </h1>
          <p className="text-slate-500 mt-4 text-lg max-w-2xl">
            A comprehensive record of your clinical client base. Manage profiles, track engagement, and review session histories.
          </p>
        </div>
        <div className="flex items-center gap-3 bg-emerald-50 text-emerald-700 px-6 py-3 rounded-2xl border border-emerald-100 shadow-sm">
          <ShieldCheck className="w-5 h-5" />
          <span className="text-sm font-bold uppercase tracking-widest">Confidential Patient Records</span>
        </div>
      </header>

      {roster.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-24 text-center shadow-sm">
          <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-8 text-slate-300">
             <Users className="w-12 h-12" />
          </div>
          <h3 className="text-2xl font-heading font-medium text-slate-900">Your patient list is empty</h3>
          <p className="text-slate-500 mt-3 max-w-sm mx-auto leading-relaxed"> Once patients start booking appointments with you, they will appear here for your clinical records.</p>
        </div>
      ) : (
        <PatientList roster={roster} />
      )}
    </div>
  );
}
