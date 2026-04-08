import { LayoutDashboard, MessageSquare, Calendar, Home } from "lucide-react";
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
    { label: "My Sessions", icon: Calendar, href: "/dashboard/sessions" },
    { label: "Messages", icon: MessageSquare, href: "/dashboard/messages" },
  ];

  return (
    <div className="flex h-screen bg-surface font-sans text-foreground overflow-hidden">
      {/* Sidebar */}
      <aside className="w-72 bg-surface-container-low border-r border-outline-variant/30 flex flex-col z-20 shadow-sm">
        <div className="h-20 flex items-center px-8 border-b border-outline-variant/20">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-8 h-8 rounded bg-primary flex items-center justify-center shadow-sm">
              <span className="text-primary-foreground font-heading font-bold text-lg">B</span>
            </div>
            <span className="font-heading font-bold text-xl text-primary tracking-tight">Blissful Station</span>
          </Link>
        </div>
        
        <div className="px-6 py-8 flex flex-col flex-1 gap-1">
          <p className="px-4 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60 mb-2">Workspace</p>
          {navItems.map((item) => (
            <Link 
              key={item.href}
              href={item.href} 
              className="flex items-center px-4 py-3 text-foreground/70 hover:bg-surface-container-lowest hover:text-primary rounded-xl transition-all duration-200 group"
            >
              <item.icon className="w-5 h-5 mr-3 group-hover:scale-110 transition-transform" />
              <span className="font-medium text-sm">{item.label}</span>
            </Link>
          ))}
        </div>

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
      <main className="flex-1 flex flex-col overflow-hidden relative">
        <div className="absolute top-0 right-0 w-full h-[30vh] bg-linear-to-b from-primary/5 to-transparent -z-10 pointer-events-none" />
        
        <header className="h-20 flex items-center justify-between px-10 bg-surface/40 backdrop-blur-md border-b border-outline-variant/20 z-10">
          <div>
            <h2 className="text-2xl font-heading font-normal text-foreground">Patient Portal</h2>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-semibold text-foreground leading-none">{data.user.user_metadata?.first_name || "User"}</p>
              <p className="text-[10px] text-muted-foreground mt-1 uppercase tracking-tighter">Premium Patient</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-primary-container/20 border border-primary/20 flex items-center justify-center text-primary font-bold shadow-inner">
              {data.user.user_metadata?.first_name?.[0] || "U"}
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-auto p-10 relative">
          <div className="max-w-5xl mx-auto">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
