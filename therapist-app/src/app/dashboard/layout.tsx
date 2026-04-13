import { Home, Activity } from "lucide-react";
import Link from "next/link";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import SignOutButton from "@/components/SignOutButton";
import DashboardSidebar from "@/components/DashboardSidebar";
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

  // Role Check: Ensure user is a THERAPIST
  const adminSupabase = await createAdminClient();
  const { data: dbUser } = await adminSupabase
    .from("User")
    .select("role")
    .eq("id", user.id)
    .single();

  if (dbUser?.role !== "THERAPIST") {
    redirect("/login?error=Unauthorized: Therapist access required");
  }

  const bottomNavItems = [
    { label: "My Profile", icon: Activity, href: "/dashboard/profile" },
  ];

  return (
    <div className="flex h-screen bg-surface font-sans text-foreground overflow-hidden relative">
      <MobileNav currentUserId={user.id} />
      {/* Sidebar - Desktop Only */}
      <aside className="w-72 bg-surface-container-low border-r border-outline-variant/30 flex-col z-20 shadow-sm hidden lg:flex">
        <div className="h-24 flex items-center px-10 border-b border-outline-variant/20">
          <Link href="/dashboard" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shadow-md">
              <span className="text-primary-foreground font-heading font-bold text-xl">B</span>
            </div>
            <div className="flex flex-col leading-none">
               <span className="font-heading font-bold text-lg text-primary tracking-tight">Blissful</span>
               <span className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground/60">Provider</span>
            </div>
          </Link>
        </div>
        
        <DashboardSidebar currentUserId={user.id} />

        <div className="p-8 border-t border-outline-variant/20 space-y-3">
          {bottomNavItems.map((item) => (
            <Link 
              key={item.href}
              href={item.href} 
              className="flex items-center px-4 py-3 text-xs font-bold uppercase tracking-widest text-muted-foreground/60 hover:text-primary rounded-xl transition-colors group"
            >
              <item.icon className="w-4 h-4 mr-3 group-hover:scale-110 transition-transform" />
              {item.label}
            </Link>
          ))}
          <Link 
            href="/" 
            className="flex items-center px-4 py-3 text-xs font-bold uppercase tracking-widest text-muted-foreground/60 hover:text-primary rounded-xl transition-colors group"
          >
            <Home className="w-4 h-4 mr-3" />
            Home
          </Link>
          <SignOutButton />
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col overflow-hidden relative bg-surface-container-lowest/30 pb-20 lg:pb-0">
        <div className="absolute top-0 right-0 w-full h-[40vh] bg-linear-to-b from-primary/5 via-transparent to-transparent -z-10 pointer-events-none" />
        
        <header className="h-20 lg:h-24 flex items-center justify-between px-6 lg:px-12 bg-surface/30 backdrop-blur-xl border-b border-outline-variant/20 z-10 shrink-0">
          <div className="flex items-center gap-3 lg:hidden">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shadow-md">
              <span className="text-primary-foreground font-heading font-bold text-xl">B</span>
            </div>
          </div>
          <div className="hidden md:block">
            <h2 className="text-xl lg:text-2xl font-heading font-normal text-foreground">Provider Dashboard</h2>
          </div>
          <div className="flex items-center gap-6">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-bold text-foreground leading-none">{user.user_metadata?.first_name || "Doctor"}</p>
              <p className="text-xs text-muted-foreground mt-2 uppercase tracking-widest font-bold">LCSW • Active Practitioner</p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-primary-container/20 border border-primary/20 flex items-center justify-center text-primary font-bold shadow-inner">
              {user.user_metadata?.first_name?.[0] || "D"}
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-auto p-6 lg:p-12 relative">
          <div className="max-w-6xl mx-auto">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
