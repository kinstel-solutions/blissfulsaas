"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  ShieldCheck, 
  CalendarDays,
  DollarSign,
  UserCircle 
} from "lucide-react";

const NAV_ITEMS = [
  { label: "Overview", icon: LayoutDashboard, href: "/dashboard" },
  { label: "App.", icon: CalendarDays, href: "/dashboard/appointments" },
  { label: "Fin.", icon: DollarSign, href: "/dashboard/financials" },
  { label: "Provider", icon: ShieldCheck, href: "/dashboard/therapists" },
  { label: "Acc.", icon: UserCircle, href: "/dashboard/account" },
];

export default function MobileNav({ currentUserId }: { currentUserId: string }) {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 w-full z-[100] lg:hidden">
      <div className="bg-surface/95 backdrop-blur-3xl border-t border-primary/10 rounded-t-[1rem] py-2 flex justify-between items-center shadow-[0_-10px_40px_rgba(0,0,0,0.05)] ring-1 ring-primary/5">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href;
          
          return (
            <Link 
              key={item.href}
              href={item.href}
              className={`flex-1 flex flex-col items-center justify-center gap-1 group relative h-12 transition-all duration-300 ${
                isActive ? 'text-primary scale-110' : 'text-primary/30 hover:text-primary/60'
              }`}
            >
              <div className={`relative p-2 rounded-2xl transition-all duration-300 ${
                isActive ? 'bg-primary/10' : 'group-active:scale-90 group-hover:bg-primary/5'
              }`}>
                <item.icon className={`w-5 h-5 transition-all duration-300 ${isActive ? 'stroke-[2.5px]' : 'stroke-[1.8px]'}`} />
              </div>
              
              {isActive && (
                <div className="absolute -top-1 w-1 h-1 bg-primary rounded-full blur-[1px] animate-pulse" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
