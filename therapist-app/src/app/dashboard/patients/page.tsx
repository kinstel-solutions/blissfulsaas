import { Users, Mail, Phone, Calendar, ArrowRight, Activity, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { fetchWithAuthContent } from "@/lib/api-server";

export default async function PatientRosterPage() {
  const patients = await fetchWithAuthContent("/therapists/my-patients");
  const roster = Array.isArray(patients) ? patients : [];

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl font-heading font-medium text-slate-900 leading-none">
            Patient Roster
          </h1>
          <p className="text-slate-500 mt-4 text-lg max-w-2xl">
            A comprehensive record of your clinical client base. Manage profiles, track engagement, and review session histories.
          </p>
        </div>
        <div className="flex items-center gap-3 bg-emerald-50 text-emerald-700 px-6 py-3 rounded-2xl border border-emerald-100 shadow-sm">
          <ShieldCheck className="w-5 h-5" />
          <span className="text-sm font-bold uppercase tracking-widest">Hippa Compliant Access</span>
        </div>
      </header>

      {roster.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-[3rem] p-24 text-center shadow-sm">
          <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-8 text-slate-300">
             <Users className="w-12 h-12" />
          </div>
          <h3 className="text-2xl font-heading font-medium text-slate-900">Your roster is empty</h3>
          <p className="text-slate-500 mt-3 max-w-sm mx-auto leading-relaxed"> Once patients start booking appointments with you, they will appear here for your clinical records.</p>
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-[3rem] shadow-sm overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="px-10 py-8 text-left text-xs font-bold uppercase tracking-[0.2em] text-slate-400">Patient identity</th>
                <th className="px-10 py-8 text-left text-xs font-bold uppercase tracking-[0.2em] text-slate-400">Contact Details</th>
                <th className="px-10 py-8 text-left text-xs font-bold uppercase tracking-[0.2em] text-slate-400 text-center">Engagement</th>
                <th className="px-10 py-8 text-left text-xs font-bold uppercase tracking-[0.2em] text-slate-400">Last Session</th>
                <th className="px-10 py-8"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {roster.map((p) => (
                <tr key={p.id} className="group hover:bg-slate-50/50 transition-colors">
                  <td className="px-10 py-8">
                    <div className="flex items-center gap-5">
                      <div className="w-14 h-14 rounded-2xl bg-primary/5 flex items-center justify-center text-primary font-bold text-xl border border-primary/10 group-hover:bg-primary group-hover:text-white transition-all">
                        {p.firstName?.[0]}{p.lastName?.[0]}
                      </div>
                      <div>
                        <p className="font-heading text-lg font-medium text-slate-900 leading-tight">
                          {p.firstName} {p.lastName}
                        </p>
                        <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">Ref: {p.id.slice(0, 8)}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-10 py-8">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <Mail className="w-3.5 h-3.5 text-slate-300" />
                        {p.user?.email || "N/A"}
                      </div>
                    </div>
                  </td>
                  <td className="px-10 py-8 text-center">
                    <div className="inline-flex items-center gap-2 bg-slate-100/50 px-4 py-2 rounded-xl border border-slate-100">
                      <Activity className="w-3.5 h-3.5 text-slate-400" />
                      <span className="text-xs font-bold text-slate-900">{p.sessionCount} Sessions</span>
                    </div>
                  </td>
                  <td className="px-10 py-8">
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <Calendar className="w-4 h-4 text-slate-300" />
                      {new Date(p.latestSession).toLocaleDateString()}
                      {p.latestSessionNotes && (
                        <div className="ml-2 w-2 h-2 rounded-full bg-blue-500" title="Latest session documented" />
                      )}
                    </div>
                  </td>
                  <td className="px-10 py-8 text-right">
                    <Link 
                      href="/dashboard/messages"
                      className="inline-flex items-center gap-2 px-5 py-2.5 bg-white border border-slate-200 text-xs font-bold uppercase tracking-widest text-slate-600 hover:bg-slate-900 hover:text-white hover:border-slate-900 rounded-xl transition-all"
                    >
                      History <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
