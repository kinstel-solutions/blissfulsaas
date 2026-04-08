import { LayoutDashboard, MessageSquare, Calendar, Home, Users } from "lucide-react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import SignOutButton from "@/components/SignOutButton";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getUser();

  if (!data?.user || error) {
    redirect("/login");
  }

  const navItems = [
    { label: "Overview", icon: LayoutDashboard, href: "/dashboard" },
    { label: "Patient Roster", icon: Users, href: "/dashboard/patients" },
    { label: "Appointments", icon: Calendar, href: "/dashboard/appointments" },
    { label: "Clinical Messages", icon: MessageSquare, href: "/dashboard/messages" },
  ];

  return (
    <div className="flex h-screen bg-surface font-sans text-foreground overflow-hidden">
      {/* Sidebar - Minimalist & Focused */}
      <aside className="w-72 bg-surface-container-low border-r border-outline-variant/30 flex flex-col z-20 shadow-sm">
        <div className="h-24 flex items-center px-10 border-b border-outline-variant/20">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shadow-md">
              <span className="text-primary-foreground font-heading font-bold text-xl">B</span>
            </div>
            <div className="flex flex-col leading-none">
               <span className="font-heading font-bold text-lg text-primary tracking-tight">Blissful</span>
               <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/60">Provider</span>
            </div>
          </Link>
        </div>
        
        <div className="px-6 py-10 flex flex-col flex-1 gap-2">
          <p className="px-4 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60 mb-3">Clinical workspace</p>
          {navItems.map((item) => (
            <Link 
              key={item.href}
              href={item.href} 
              className="flex items-center px-4 py-3.5 text-foreground/70 hover:bg-surface-container-lowest hover:text-primary rounded-2xl transition-all duration-300 group"
            >
              <item.icon className="w-5 h-5 mr-4 group-hover:scale-110 transition-transform text-primary/40 group-hover:text-primary" />
              <span className="font-medium text-sm">{item.label}</span>
            </Link>
          ))}
        </div>

        <div className="p-8 border-t border-outline-variant/20 space-y-3">
          <Link 
            href="/" 
            className="flex items-center px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60 hover:text-primary rounded-xl transition-colors group"
          >
            <Home className="w-4 h-4 mr-3" />
            Home
          </Link>
          <SignOutButton />
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col overflow-hidden relative bg-surface-container-lowest/30">
        <div className="absolute top-0 right-0 w-full h-[40vh] bg-linear-to-b from-primary/5 via-transparent to-transparent -z-10 pointer-events-none" />
        
        <header className="h-24 flex items-center justify-between px-12 bg-surface/30 backdrop-blur-xl border-b border-outline-variant/20 z-10">
          <div>
            <h2 className="text-2xl font-heading font-normal text-foreground">Provider Dashboard</h2>
          </div>
          <div className="flex items-center gap-6">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-bold text-foreground leading-none">{data.user.user_metadata?.first_name || "Doctor"}</p>
              <p className="text-[10px] text-muted-foreground mt-2 uppercase tracking-widest font-bold">LCSW • Active Practitioner</p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-primary-container/20 border border-primary/20 flex items-center justify-center text-primary font-bold shadow-inner">
              {data.user.user_metadata?.first_name?.[0] || "D"}
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-auto p-12 relative">
          <div className="max-w-6xl mx-auto">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
