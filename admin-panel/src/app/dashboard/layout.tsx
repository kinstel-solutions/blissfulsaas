import { createClient, createAdminClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { 
  Users, 
  LayoutDashboard, 
  ShieldCheck, 
  FileCheck, 
  Settings,
  Bell,
  CalendarDays,
  DollarSign
} from "lucide-react";

import SignOutButton from "@/components/SignOutButton";
import MobileNav from "@/components/MobileNav";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // We use the ADMIN CLIENT to bypass RLS for the role check
  const adminClient = await createAdminClient();
  const { data: dbUser } = await adminClient
    .from("User")
    .select("role")
    .eq("id", user.id)
    .single();

  if (dbUser?.role !== "ADMIN") {
    // If not admin, sign them out and send back to login
    await supabase.auth.signOut();
    redirect("/login?error=Unauthorized: Admin access required");
  }

  const navItems = [
    { label: "Overview", icon: LayoutDashboard, href: "/dashboard", active: true },
    { label: "Appointments", icon: CalendarDays, href: "/dashboard/appointments", active: true },
    { label: "Financials", icon: DollarSign, href: "/dashboard/financials", active: true },
    { label: "Providers", icon: ShieldCheck, href: "/dashboard/therapists", active: true },
  ];

  return (
    <div className="flex h-screen bg-surface font-sans text-foreground overflow-hidden relative">
      <MobileNav currentUserId={user.id} />
      {/* Sidebar - Desktop Only */}
      <aside className="w-72 bg-surface-container-low border-r border-outline-variant/20 flex-col z-20 shadow-sm hidden lg:flex">
        <div className="h-20 flex items-center px-4 md:px-8 border-b border-outline-variant/20">
          <Link href="/dashboard" className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-2xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
              <span className="text-primary-foreground font-heading font-bold text-lg">B</span>
            </div>
            <span className="font-heading font-bold text-xl text-primary tracking-tight">Admin OS</span>
          </Link>
        </div>
        
        <div className="px-6 py-5 md:py-10 flex flex-col flex-1 gap-2">
          <p className="px-4 text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground/60 mb-2">Systems</p>
          {navItems.map((item) => (
            <Link 
              key={item.label}
              href={item.href} 
              className={`flex items-center px-4 py-3.5 rounded-2xl transition-all duration-300 group ${
                item.active 
                  ? "text-foreground/60 hover:bg-surface-container-lowest hover:text-primary" 
                  : "text-muted-foreground/30 cursor-not-allowed pointer-events-none"
              }`}
            >
              <item.icon className={`w-5 h-5 mr-3 transition-transform ${
                item.active ? "group-hover:scale-110 group-hover:rotate-3" : ""
              }`} />
              <span className="font-medium text-sm">{item.label}</span>
            </Link>
          ))}
        </div>

        <div className="p-6 border-t border-outline-variant/20 space-y-2">
          <SignOutButton />
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden relative pb-20 lg:pb-0">
        <div className="absolute top-0 right-0 w-full h-[40vh] bg-linear-to-b from-primary/5 to-transparent -z-10 pointer-events-none" />
        
        <header className="h-20 flex items-center justify-between px-6 lg:px-10 bg-surface/30 backdrop-blur-3xl border-b border-outline-variant/10 z-10 shrink-0">
          <div className="flex items-center gap-3 lg:hidden">
            <div className="w-8 h-8 rounded-2xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
              <span className="text-primary-foreground font-heading font-bold text-lg">B</span>
            </div>
          </div>
          <div className="hidden sm:flex flex-col">
            <h2 className="text-xl font-heading font-medium text-primary">Admin Control Center</h2>
            <p className="text-[10px] font-bold text-muted-foreground/50 uppercase tracking-widest mt-0.5">The Blissful Station Internal OS</p>
          </div>
          
          <div className="flex items-center gap-4 lg:gap-6">
            <div className="flex items-center gap-4">
              <div className="text-right hidden md:block">
                <p className="text-xs font-bold text-foreground leading-none">{dbUser?.role === 'ADMIN' ? 'Super User' : 'Standard User'}</p>
                <p className="text-xs text-primary/60 mt-1 uppercase tracking-tighter font-bold">Root Access</p>
              </div>
              <div className="w-10 h-10 rounded-2xl bg-primary shadow-lg shadow-primary/20 flex items-center justify-center text-primary-foreground font-bold border border-primary/20">
                A
              </div>
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-auto p-6 lg:p-12 relative">
          <div className="max-w-6xl mx-auto h-full">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
