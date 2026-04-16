import { Home } from "lucide-react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
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
      <MobileNav currentUserId={user.id} />
      {/* Sidebar - Desktop Only */}
      <aside className="w-72 bg-surface-container-low border-r border-outline-variant/30 flex-col z-20 shadow-sm hidden lg:flex">
        <div className="h-20 flex items-center px-4 md:px-8 border-b border-outline-variant/20">
          <Link href="/dashboard" className="flex items-center gap-3">
            <div className="w-8 h-8 rounded bg-primary flex items-center justify-center shadow-sm">
              <span className="text-primary-foreground font-heading font-bold text-lg">B</span>
            </div>
            <span className="font-heading font-bold text-xl text-primary tracking-tight">Blissful Station</span>
          </Link>
        </div>
        
        <DashboardSidebar currentUserId={user.id} />

        <div className="p-6 border-t border-outline-variant/20 space-y-2">
          <Link 
            href="/" 
            className="flex items-center px-4 py-3 text-foreground/60 hover:text-primary rounded-xl transition-colors text-sm font-medium group"
          >
            <Home className="w-5 h-5 mr-3" />
            Return to Sanctuary
          </Link>
          <SignOutButton />
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden relative pb-20 lg:pb-0">
        <div className="absolute top-0 right-0 w-full h-[30vh] bg-linear-to-b from-primary/5 to-transparent -z-10 pointer-events-none" />
        
        <header className="h-16 md:h-20 flex items-center justify-between px-6 md:px-10 bg-surface/40 backdrop-blur-md border-b border-outline-variant/20 z-10 shrink-0">
          <div className="flex items-center gap-3 lg:hidden">
            <div className="w-8 h-8 rounded bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-heading font-bold text-lg">B</span>
            </div>
          </div>
          <div className="hidden md:block">
            <h2 className="text-xl md:text-2xl font-heading font-normal text-foreground">Patient Portal</h2>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-semibold text-foreground leading-none">{user.user_metadata?.first_name || "User"}</p>
              <p className="text-xs text-muted-foreground mt-1 uppercase tracking-tighter">Premium Patient</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-primary-container/20 border border-primary/20 flex items-center justify-center text-primary font-bold shadow-inner">
              {user.user_metadata?.first_name?.[0] || "U"}
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-auto p-6 md:p-10 relative">
          <div className="max-w-5xl mx-auto">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
