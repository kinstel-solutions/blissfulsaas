import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import SignOutButton from "@/components/SignOutButton";
import DashboardSidebar from "@/components/DashboardSidebar";
import MobileNav from "@/components/MobileNav";
import NotificationBell from "@/components/NotificationBell";
import RealtimeAutoUpdater from "@/components/RealtimeAutoUpdater";

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

  // Role Check: Ensure user is a PATIENT
  const { data: dbUser } = await supabase
    .from("User")
    .select("role")
    .eq("id", user.id)
    .single();

  if (dbUser?.role !== "PATIENT") {
    redirect("/login?error=Unauthorized: Patient access required");
  }

  return (
    <div className="flex h-screen bg-surface font-sans text-foreground overflow-hidden relative">
      <RealtimeAutoUpdater currentUserId={user.id} />
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
            Understand. Transform.
          </span>
        </div>

        {/* Profile Widget in Sidebar */}
        <Link href="/dashboard/account" className="px-6 py-4 border-b border-outline-variant/10 flex items-center justify-between group hover:bg-slate-50/50 transition-colors shrink-0 cursor-pointer">
          <div className="flex items-center gap-3.5 overflow-hidden">
            <div className="w-12 h-12 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary text-base font-bold shadow-inner overflow-hidden shrink-0">
              {user.user_metadata?.first_name?.[0]?.toUpperCase() || "P"}
            </div>
            <div className="flex flex-col overflow-hidden text-left leading-tight">
              <span className="text-[13.5px] font-bold truncate">
                {user.user_metadata?.first_name ? `${user.user_metadata.first_name} ${user.user_metadata.last_name || ''}` : user.email?.split('@')[0] || "Patient"}
              </span>
              <span className="text-xs font-medium text-muted-foreground/80 mt-0.5 truncate">
                Premium Patient
              </span>
            </div>
          </div>
        </Link>
        
        <DashboardSidebar currentUserId={user.id} />

        <div className="px-6 py-5 border-t border-outline-variant/20 space-y-3 shrink-0">
          <SignOutButton />
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden relative pb-20 lg:pb-0">
        <div className="absolute top-0 right-0 w-full h-[40vh] bg-linear-to-b from-primary/5 via-transparent to-transparent -z-10 pointer-events-none" />
        
        <header className="h-20 flex items-center justify-between px-6 lg:px-10 bg-transparent z-30 shrink-0 w-full">
          <div className="flex items-center gap-3 lg:hidden">
            <Image src="/iconLogo.jpeg" alt="Icon" width={40} height={40} className="w-10 h-10 rounded-lg object-cover shadow-lg shadow-primary/20" />
          </div>

          <div className="flex items-center gap-3 sm:gap-4 ml-auto">
            <NotificationBell currentUserId={user.id} />
            
            {/* Mobile Profile Icon (only visible on screens smaller than sm) */}
            <Link
              href="/dashboard/account"
              className="flex sm:hidden w-10 h-10 rounded-xl bg-primary-container/20 border border-primary/20 items-center justify-center text-primary font-bold shadow-inner hover:bg-primary-container/40 transition-colors overflow-hidden shrink-0"
            >
              {user.user_metadata?.first_name?.[0]?.toUpperCase() || "P"}
            </Link>
          </div>
        </header>

        <div className="flex-1 overflow-auto p-6 pb-24 md:p-10 relative">
          <div className="max-w-5xl mx-auto">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
