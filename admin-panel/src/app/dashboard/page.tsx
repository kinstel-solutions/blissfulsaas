import { createAdminClient, createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { 
  Users, 
  UserCheck, 
  ShieldAlert, 
  Activity,
  ArrowUpRight,
  TrendingUp,
  Clock,
  ChevronRight
} from "lucide-react";

export default async function DashboardPage() {
  const supabase = await createAdminClient();
  const client = await createClient();
  const { data: { session } } = await client.auth.getSession();
  const token = session?.access_token;

  // 1. Fetch Backend Stats (Section 7.4)
  const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";
  let adminStats = null;
  if (token) {
    try {
      const res = await fetch(`${BACKEND_URL}/sessions/admin/stats`, {
        headers: { Authorization: `Bearer ${token}` },
        cache: "no-store",
      });
      if (res.ok) adminStats = await res.json();
    } catch (e) {
      console.error("Failed to fetch admin stats:", e);
    }
  }

  // 2. Fetch counts
  const { count: totalUsers } = await supabase.from("User").select("*", { count: "exact", head: true });
  const { count: pendingTherapistsCount } = await supabase.from("Therapist").select("*", { count: "exact", head: true }).eq("isVerified", false);

  // 3. Fetch pending therapists with details (Section 7.3)
  const { data: pendingApplications } = await supabase
    .from("Therapist")
    .select("id, firstName, lastName, profileImageUrl")
    .eq("isVerified", false)
    .limit(3);

  // 4. Fetch registration data for chart (Section 7.1)
  const fourteenDaysAgo = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString();
  const { data: recentUsers } = await supabase
    .from("User")
    .select("createdAt")
    .gte("createdAt", fourteenDaysAgo);

  // Process registration data for the 14-day chart
  const registrationsByDay = new Array(14).fill(0);
  const today = new Date();
  today.setHours(23, 59, 59, 999);
  
  recentUsers?.forEach(u => {
    const regDate = new Date(u.createdAt);
    const diffInMs = today.getTime() - regDate.getTime();
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
    if (diffInDays >= 0 && diffInDays < 14) {
      registrationsByDay[13 - diffInDays]++;
    }
  });

  const maxRegs = Math.max(...registrationsByDay, 1);
  const chartData = registrationsByDay.map(count => (count / maxRegs) * 100);

  const stats = [
    { label: "Total Platform Users", value: totalUsers || 0, icon: Users, color: "text-primary", bg: "bg-primary/5" },
    { label: "Gross Revenue", value: adminStats ? `₹${adminStats.totalRevenue.toLocaleString()}` : "₹0", icon: TrendingUp, color: "text-emerald-600", bg: "bg-emerald-500/5" },
    { label: "Completed Sessions", value: adminStats?.totalSessions || 0, icon: Activity, color: "text-blue-600", bg: "bg-blue-500/5" },
    { label: "Pending Verifications", value: pendingTherapistsCount || 0, icon: ShieldAlert, color: "text-destructive", bg: "bg-destructive/5" },
  ];

  return (
    <div className="space-y-8 md:space-y-12 animate-in fade-in duration-700 px-4 md:px-0">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-heading font-medium text-primary mb-2">Systems Overview</h1>
          <p className="text-sm md:text-base text-muted-foreground font-medium" suppressHydrationWarning>Platform state as of {new Date().toLocaleDateString('en-US')}</p>
        </div>
        <div className="flex gap-4">
           <div className="px-5 py-2.5 bg-surface-container-low border border-outline-variant/30 rounded-2xl flex items-center gap-3 shadow-sm">
             <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
             <span className="text-[10px] md:text-xs font-bold uppercase tracking-widest text-primary/60">System Online</span>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
        {stats.map((stat, idx) => (
          <div key={idx} className="group bg-surface-container-lowest border border-outline-variant/20 p-6 md:p-8 rounded-[2rem] md:rounded-xl shadow-sm hover:shadow-xl hover:-translate-y-1.5 transition-all duration-500 cursor-default relative overflow-hidden">
            <div className={`absolute top-0 right-0 w-32 h-32 ${stat.bg} rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:scale-125 transition-transform duration-700`} />
            <div className={`w-12 h-12 md:w-14 md:h-14 ${stat.bg} ${stat.color} rounded-2xl flex items-center justify-center mb-6 border border-current/10 shadow-inner group-hover:rotate-6 transition-transform`}>
              <stat.icon className="w-6 h-6 md:w-7 md:h-7" />
            </div>
            <div>
              <p className="text-[10px] md:text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground/60 mb-2">{stat.label}</p>
              <h3 className="text-3xl md:text-4xl font-heading font-normal text-primary">{stat.value}</h3>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 md:gap-10">
        <div className="lg:col-span-2 bg-surface-container-lowest border border-outline-variant/20 rounded-xl md:rounded-2xl p-6 md:p-10 shadow-sm relative overflow-hidden group">
          <div className="flex items-center justify-between mb-8 md:mb-10">
            <div>
              <h3 className="text-xl md:text-2xl font-heading font-normal text-primary">System Activity</h3>
              <p className="text-[10px] md:text-xs text-muted-foreground mt-1">Daily user registration flow (Last 14 Days)</p>
            </div>
          </div>
          
          <div className="h-48 md:h-64 w-full flex items-end gap-2 md:gap-3 px-1 md:px-2">
             {chartData.map((height, i) => (
               <div 
                 key={i} 
                 className="flex-1 bg-primary/5 hover:bg-primary/20 rounded-t-lg transition-all duration-500 relative group/bar"
                 style={{ height: `${height}%` }}
               >
                 <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-[10px] font-bold px-2 py-1 rounded opacity-0 group-hover/bar:opacity-100 transition-opacity whitespace-nowrap z-10">
                   {registrationsByDay[i]} new
                 </div>
               </div>
             ))}
          </div>
          <div className="mt-6 flex justify-between px-2 text-[9px] md:text-xs font-bold uppercase tracking-widest text-muted-foreground/30">
             <span>{new Date(fourteenDaysAgo).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
             <span>Today</span>
          </div>
        </div>

        <div className="bg-primary border border-primary/20 rounded-xl md:rounded-2xl p-4 md:p-8 md:p-10 shadow-2xl relative overflow-hidden group min-h-[400px]">
           <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -translate-y-1/3 translate-x-1/3" />
           <div className="relative z-10 flex flex-col h-full justify-between">
              <div>
                 <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center text-white mb-6 backdrop-blur-md border border-white/10">
                    <Clock className="w-6 h-6" />
                 </div>
                 <h3 className="text-xl md:text-2xl font-heading font-normal text-white leading-tight">Pending Approval Queue</h3>
                 <p className="text-white/40 text-[10px] md:text-xs font-bold uppercase tracking-[0.2em] mt-3">Priority action required</p>
              </div>

              <div className="mt-8 md:mt-10 space-y-3 flex-1 overflow-auto max-h-64 pr-2 custom-scrollbar">
                 {pendingApplications?.length === 0 ? (
                   <div className="p-6 bg-white/5 rounded-xl border border-white/5 text-center italic text-white/40 text-[10px]">
                      No pending applications
                   </div>
                 ) : (
                   pendingApplications?.map((app) => (
                     <Link 
                       key={app.id}
                       href={`/dashboard/therapists/${app.id}`}
                       className="p-3 bg-white/5 rounded-xl border border-white/5 flex items-center justify-between group/item hover:bg-white/10 transition-colors"
                     >
                       <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-white/10 overflow-hidden flex items-center justify-center text-[10px] font-bold text-white shrink-0">
                             {app.profileImageUrl ? (
                               <img src={app.profileImageUrl} alt={app.firstName} className="w-full h-full object-cover" />
                             ) : (
                               app.firstName?.[0]
                             )}
                          </div>
                          <p className="text-sm font-medium text-white/80 truncate max-w-[120px]">{app.firstName} {app.lastName}</p>
                       </div>
                       <ChevronRight className="w-4 h-4 text-white/30 group-hover/item:text-white transition-colors" />
                     </Link>
                   ))
                 )}
                 {pendingTherapistsCount && pendingTherapistsCount > 3 && (
                   <p className="text-[10px] text-white/40 text-center pt-2 italic">+{pendingTherapistsCount - 3} more awaiting review</p>
                 )}
              </div>

              <div className="mt-8 md:mt-10">
                 <Link 
                   href="/dashboard/therapists"
                   className="w-full h-14 bg-white text-primary rounded-2xl flex items-center justify-center font-bold uppercase tracking-widest text-[10px] md:text-xs shadow-xl hover:shadow-primary-container hover:-translate-y-1 transition-all"
                 >
                    View All Applications
                 </Link>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}
