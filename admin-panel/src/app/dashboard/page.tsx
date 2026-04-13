import { createAdminClient } from "@/lib/supabase/server";
import { 
  Users, 
  UserCheck, 
  ShieldAlert, 
  Activity,
  ArrowUpRight,
  TrendingUp,
  Clock
} from "lucide-react";

export default async function DashboardPage() {
  const supabase = await createAdminClient();

  // Fetch counts
  const { count: totalUsers } = await supabase.from("User").select("*", { count: "exact", head: true });
  const { count: totalPatients } = await supabase.from("User").select("*", { count: "exact", head: true }).eq("role", "PATIENT");
  const { count: totalTherapists } = await supabase.from("User").select("*", { count: "exact", head: true }).eq("role", "THERAPIST");
  const { count: pendingTherapists } = await supabase.from("Therapist").select("*", { count: "exact", head: true }).eq("isVerified", false);

  const stats = [
    { label: "Total Sanctuary Users", value: totalUsers || 0, icon: Users, color: "text-primary", bg: "bg-primary/5" },
    { label: "Registered Patients", value: totalPatients || 0, icon: UserCheck, color: "text-emerald-600", bg: "bg-emerald-500/5" },
    { label: "Mental Health Specialists", value: totalTherapists || 0, icon: Activity, color: "text-blue-600", bg: "bg-blue-500/5" },
    { label: "Pending Verifications", value: pendingTherapists || 0, icon: ShieldAlert, color: "text-destructive", bg: "bg-destructive/5" },
  ];

  return (
    <div className="space-y-8 md:space-y-12 animate-in fade-in duration-700 px-4 md:px-0">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-heading font-medium text-primary mb-2">Systems Overview</h1>
          <p className="text-sm md:text-base text-muted-foreground font-medium">Platform state as of {new Date().toLocaleDateString()}</p>
        </div>
        <div className="flex gap-4">
           <div className="px-5 py-2.5 bg-surface-container-low border border-outline-variant/30 rounded-2xl flex items-center gap-3 shadow-sm">
             <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
             <span className="text-[10px] md:text-xs font-bold uppercase tracking-widest text-primary/60">Mainnet Live</span>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
        {stats.map((stat, idx) => (
          <div key={idx} className="group bg-surface-container-lowest border border-outline-variant/20 p-6 md:p-8 rounded-[2rem] md:rounded-[2.5rem] shadow-sm hover:shadow-xl hover:-translate-y-1.5 transition-all duration-500 cursor-default relative overflow-hidden">
            <div className={`absolute top-0 right-0 w-32 h-32 ${stat.bg} rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:scale-125 transition-transform duration-700`} />
            <div className={`w-12 h-12 md:w-14 md:h-14 ${stat.bg} ${stat.color} rounded-2xl flex items-center justify-center mb-6 border border-current/10 shadow-inner group-hover:rotate-6 transition-transform`}>
              <stat.icon className="w-6 h-6 md:w-7 md:h-7" />
            </div>
            <div>
              <p className="text-[10px] md:text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground/60 mb-2">{stat.label}</p>
              <h3 className="text-3xl md:text-4xl font-heading font-normal text-primary">{stat.value}</h3>
            </div>
            <div className="mt-4 md:mt-6 flex items-center gap-2 text-[10px] md:text-xs font-bold text-emerald-600/60 uppercase tracking-widest">
               <TrendingUp className="w-3 h-3" /> +12% this month
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 md:gap-10">
        <div className="lg:col-span-2 bg-surface-container-lowest border border-outline-variant/20 rounded-[2.5rem] md:rounded-[3rem] p-6 md:p-10 shadow-sm relative overflow-hidden group">
          <div className="flex items-center justify-between mb-8 md:mb-10">
            <div>
              <h3 className="text-xl md:text-2xl font-heading font-normal text-primary">System Activity</h3>
              <p className="text-[10px] md:text-xs text-muted-foreground mt-1">Real-time user registration flow</p>
            </div>
            <button className="hidden sm:flex text-[10px] md:text-xs font-bold uppercase tracking-widest text-primary/40 hover:text-primary transition-colors items-center gap-2">
              Deep Analytics <ArrowUpRight className="w-3 h-3" />
            </button>
          </div>
          
          <div className="h-48 md:h-64 w-full flex items-end gap-2 md:gap-3 px-1 md:px-2">
             {[45, 67, 43, 89, 56, 78, 92, 65, 45, 87, 65, 34, 56, 88].map((height, i) => (
               <div 
                 key={i} 
                 className="flex-1 bg-primary/5 hover:bg-primary/20 rounded-t-lg transition-all duration-500 relative group/bar"
                 style={{ height: `${height}%` }}
               >
                 <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-[10px] font-bold px-2 py-1 rounded opacity-0 group-hover/bar:opacity-100 transition-opacity whitespace-nowrap z-10">
                   {height}
                 </div>
               </div>
             ))}
          </div>
          <div className="mt-6 flex justify-between px-2 text-[9px] md:text-xs font-bold uppercase tracking-widest text-muted-foreground/30">
             <span>March 25</span>
             <span>Today</span>
          </div>
        </div>

        <div className="bg-primary border border-primary/20 rounded-[2.5rem] md:rounded-[3rem] p-8 md:p-10 shadow-2xl relative overflow-hidden group min-h-[400px]">
           <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -translate-y-1/3 translate-x-1/3" />
           <div className="relative z-10 flex flex-col h-full justify-between">
              <div>
                 <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center text-white mb-6 backdrop-blur-md border border-white/10">
                    <Clock className="w-6 h-6" />
                 </div>
                 <h3 className="text-xl md:text-2xl font-heading font-normal text-white leading-tight">Pending Approval Queue</h3>
                 <p className="text-white/40 text-[10px] md:text-xs font-bold uppercase tracking-[0.2em] mt-3">Priority action required</p>
              </div>

              <div className="mt-8 md:mt-10 space-y-4 flex-1 overflow-auto max-h-48 pr-2 custom-scrollbar">
                 {pendingTherapists === 0 ? (
                   <div className="p-6 bg-white/5 rounded-3xl border border-white/5 text-center italic text-white/40 text-[10px]">
                      No pending applications
                   </div>
                 ) : (
                   <div className="p-6 bg-white/5 rounded-3xl border border-white/5 flex items-center justify-between group/item hover:bg-white/10 transition-colors">
                      <div className="flex items-center gap-4">
                         <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-[10px] font-bold text-white">
                            {pendingTherapists}
                         </div>
                         <p className="text-sm font-medium text-white/80">Application Pool</p>
                      </div>
                      <ArrowUpRight className="w-4 h-4 text-white/30 group-hover/item:text-white transition-colors" />
                   </div>
                 )}
              </div>

              <div className="mt-8 md:mt-10">
                 <button className="w-full h-14 bg-white text-primary rounded-2xl font-bold uppercase tracking-widest text-[10px] md:text-xs shadow-xl hover:shadow-primary-container hover:-translate-y-1 transition-all">
                    Launch Review Terminal
                 </button>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}
