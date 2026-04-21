import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { 
  DollarSign, 
  TrendingUp, 
  Activity, 
  Users,
  Download,
  Calendar,
  CheckCircle2,
  Clock,
  BriefcaseMedical
} from "lucide-react";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";

async function getAdminStats() {
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return null;

  const res = await fetch(`${BACKEND_URL}/sessions/admin/stats`, {
    headers: {
      Authorization: `Bearer ${session.access_token}`,
    },
    cache: "no-store",
  });
  if (!res.ok) return null;
  return res.json();
}

export default async function FinancialsPage() {
  const stats = await getAdminStats();

  if (!stats) {
    return (
      <div className="flex flex-col items-center justify-center h-[50vh]">
        <p className="text-muted-foreground font-medium">Failed to load financial statistics.</p>
      </div>
    );
  }

  const { totalSessions, totalRevenue, completionRate, cancellationRate, therapistStats } = stats;

  const topLevelMetrics = [
    { label: "Total Gross Revenue", value: `₹${totalRevenue.toLocaleString()}`, icon: DollarSign, color: "text-emerald-600", bg: "bg-emerald-500/5", subtext: "Platform lifetime" },
    { label: "Total Consultations", value: totalSessions, icon: Users, color: "text-blue-600", bg: "bg-blue-500/5", subtext: "Booked sessions" },
    { label: "Completion Rate", value: `${completionRate.toFixed(1)}%`, icon: Activity, color: "text-primary", bg: "bg-primary/5", subtext: "Successfully ended" },
    { label: "Cancellation Rate", value: `${cancellationRate.toFixed(1)}%`, icon: TrendingUp, color: "text-amber-600", bg: "bg-amber-500/5", subtext: "Patient or therapist" },
  ];

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-heading font-medium text-primary">Financial Tracking</h1>
          <p className="text-muted-foreground text-sm font-medium mt-1">Platform revenue, payouts, and engagement metrics</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-surface border border-outline-variant/30 rounded-xl text-primary/80 hover:text-primary hover:border-primary/50 transition-all text-xs font-bold uppercase tracking-widest shadow-sm">
          <Download className="w-4 h-4" /> Export Report
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {topLevelMetrics.map((metric, idx) => (
          <div key={idx} className="bg-surface-container-lowest border border-outline-variant/20 p-6 rounded-2xl shadow-sm relative overflow-hidden group hover:shadow-md transition-shadow">
            <div className={`w-12 h-12 ${metric.bg} ${metric.color} rounded-2xl flex items-center justify-center mb-5 border border-current/10 shadow-inner group-hover:scale-110 transition-transform`}>
              <metric.icon className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/60 mb-1">{metric.label}</p>
              <h3 className="text-3xl font-heading font-medium text-foreground">{metric.value}</h3>
            </div>
            <div className="mt-4 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
               {metric.subtext}
            </div>
          </div>
        ))}
      </div>

      <div className="bg-surface-container-lowest border border-outline-variant/20 rounded-xl shadow-xl overflow-hidden">
        <div className="p-6 md:px-8 md:py-6 border-b border-outline-variant/10 bg-surface/50">
          <h3 className="text-lg font-heading font-medium text-primary">Provider Performance & Revenue</h3>
          <p className="text-xs text-muted-foreground mt-1">Gross revenue breakdown and consultation counts by specialist</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-outline-variant/10 text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/50 bg-primary/[0.01]">
                <th className="px-5 md:px-8 py-5">Specialist</th>
                <th className="px-4 md:px-6 py-5">Profile Info</th>
                <th className="px-4 md:px-6 py-5 text-center">Consultations</th>
                <th className="px-4 md:px-6 py-5 text-right">Gross Revenue</th>
                <th className="px-4 md:px-6 py-5 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/5">
              {therapistStats.map((t: any) => (
                <tr key={t.therapistId} className="group/row hover:bg-primary/[0.01] transition-colors">
                  <td className="px-5 md:px-8 py-5">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-primary/5 flex items-center justify-center text-primary font-bold shadow-inner border border-primary/5 text-sm">
                        {t.therapistName.replace('Dr. ', '')[0] || "?"}
                      </div>
                      <div>
                        <p className="font-heading font-medium text-foreground text-sm leading-tight">
                          {t.therapistName}
                        </p>
                        <p className="text-[10px] text-muted-foreground mt-0.5 tracking-tight">{t.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 md:px-6 py-5">
                    <div className="space-y-1">
                      {t.qualifications && (
                        <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground font-medium">
                           <BriefcaseMedical className="w-3 h-3 text-primary/40" /> {t.qualifications} ({t.yearsOfExperience}y exp)
                        </div>
                      )}
                      <div className="flex flex-wrap gap-1 mt-1">
                        {t.specialities?.slice(0, 2).map((spec: string, i: number) => (
                          <span key={i} className="text-[9px] px-1.5 py-0.5 bg-surface border border-outline-variant/20 rounded text-muted-foreground uppercase tracking-wider font-bold">
                            {spec}
                          </span>
                        ))}
                        {t.specialities?.length > 2 && (
                          <span className="text-[9px] px-1.5 py-0.5 bg-surface border border-outline-variant/20 rounded text-muted-foreground uppercase tracking-wider font-bold">
                            +{t.specialities.length - 2}
                          </span>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 md:px-6 py-5 text-center">
                    <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-surface-container-low text-primary font-bold text-sm">
                      {t.totalConsultations}
                    </span>
                  </td>
                  <td className="px-4 md:px-6 py-5 text-right">
                    <p className="text-lg font-heading font-medium text-emerald-600">
                      ₹{t.revenue.toLocaleString()}
                    </p>
                    <p className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground/40 mt-0.5">
                      Lifetime
                    </p>
                  </td>
                  <td className="px-4 md:px-6 py-5 text-center">
                    <button className="px-3 py-1.5 bg-surface hover:bg-surface-container-low border border-outline-variant/30 rounded-lg text-primary text-[10px] font-bold uppercase tracking-widest transition-colors">
                      View Ledger
                    </button>
                  </td>
                </tr>
              ))}
              {(!therapistStats || therapistStats.length === 0) && (
                <tr>
                  <td colSpan={5} className="px-5 md:px-8 py-20 text-center">
                     <p className="text-muted-foreground italic text-sm">No revenue data available yet.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
