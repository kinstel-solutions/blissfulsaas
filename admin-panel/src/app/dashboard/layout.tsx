import { createClient, createAdminClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { 
  Users, 
  LayoutDashboard, 
  ShieldCheck, 
  FileCheck, 
  Settings,
  Bell,
  CalendarDays,
  DollarSign,
  Home
} from "lucide-react";

import SignOutButton from "@/components/SignOutButton";
import MobileNav from "@/components/MobileNav";
import SidebarNav from "@/components/SidebarNav";

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
    redirect("/auth/unauthorized");
  }

  return (
    <div className="flex h-screen bg-surface font-sans text-foreground overflow-hidden relative">
      <MobileNav currentUserId={user.id} />
      {/* Sidebar - Desktop Only */}
      <aside className="w-80 bg-surface-container-low border-r border-outline-variant/30 flex-col z-20 shadow-sm hidden lg:flex">
        {/* Brand Block */}
        <div className="px-6 py-6 border-b border-outline-variant/10 flex flex-col gap-3 shrink-0">
          <Link href="/dashboard" className="flex items-start gap-4">
            <Image src="/iconLogo.jpeg" alt="Icon" width={56} height={56} className="w-14 h-14 rounded-full object-cover shrink-0 mt-0.5" />
            <div className="flex flex-col text-left font-heading font-black text-xl text-primary leading-[1.0] tracking-tight">
              <span>The</span>
              <span>Blissful</span>
              <span>Station</span>
            </div>
          </Link>
          <span className="text-xs font-bold text-primary leading-normal text-left block">
            Express. Connect.<br />
            Transform.
          </span>
        </div>

        {/* Profile Widget in Sidebar */}
        <Link href="/dashboard/account" className="px-6 py-4 border-b border-outline-variant/10 flex items-center justify-between group hover:bg-slate-50/50 transition-colors shrink-0 cursor-pointer">
          <div className="flex items-center gap-3.5 overflow-hidden">
            <div className="w-12 h-12 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary text-base font-bold shadow-inner overflow-hidden shrink-0">
              {user.user_metadata?.first_name?.[0]?.toUpperCase() || "A"}
            </div>
            <div className="flex flex-col overflow-hidden text-left leading-tight">
              <span className="text-[13.5px] font-bold truncate">
                {user.user_metadata?.first_name ? `${user.user_metadata.first_name} ${user.user_metadata.last_name || ''}` : user.email?.split('@')[0] || "Admin"}
              </span>
              <span className="text-xs font-medium text-muted-foreground/80 mt-0.5 truncate">
                Super Admin
              </span>
            </div>
          </div>
        </Link>

        <SidebarNav />

        <div className="px-6 py-5 border-t border-outline-variant/20 space-y-3 shrink-0">
          <SignOutButton />
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden relative pb-20 lg:pb-0">
        <div className="absolute top-0 right-0 w-full h-[40vh] bg-linear-to-b from-primary/5 to-transparent -z-10 pointer-events-none" />
        
        <header className="h-20 flex items-center justify-between px-6 lg:px-10 bg-surface/30 backdrop-blur-3xl border-b border-outline-variant/10 z-10 shrink-0">
          <div className="flex items-center gap-3 lg:hidden">
            <Image src="/iconLogo.jpeg" alt="Icon" width={32} height={32} className="w-8 h-8 rounded-2xl object-cover shadow-lg shadow-primary/20" />
          </div>
          <div className="hidden sm:flex flex-col">
            <h2 className="text-xl font-heading font-medium text-primary">Admin Control Center</h2>
            <p className="text-[10px] font-bold text-muted-foreground/50 uppercase tracking-widest mt-0.5">The Blissful Station Internal OS</p>
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
