"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  ShieldCheck, 
  CalendarDays,
  DollarSign
} from "lucide-react";

const NAV_ITEMS = [
  { label: "Overview", icon: LayoutDashboard, href: "/dashboard" },
  { label: "Appointments", icon: CalendarDays, href: "/dashboard/appointments" },
  { label: "Financials", icon: DollarSign, href: "/dashboard/financials" },
  { label: "Providers", icon: ShieldCheck, href: "/dashboard/therapists" },
];

export default function SidebarNav() {
  const pathname = usePathname();

  return (
    <div className="px-6 py-6 flex flex-col flex-1 gap-2">
      {NAV_ITEMS.map((item) => {
        const isActive = pathname === item.href;
        
        return (
          <Link 
            key={item.href}
            href={item.href} 
            className={`flex items-center px-4 py-3 rounded-lg transition-all duration-300 group relative overflow-hidden ${
              isActive 
                ? 'bg-primary/10 text-primary font-bold shadow-xs' 
                : 'text-foreground/70 hover:bg-surface-container-lowest hover:text-primary'
            }`}
          >
            {/* Active Vertical Indicator Bar */}
            {isActive && (
              <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-primary rounded-r-md" />
            )}

            <item.icon className={`w-5 h-5 mr-4 group-hover:scale-110 transition-transform ${isActive ? 'text-primary' : 'text-primary/40 group-hover:text-primary'}`} />
            <span className="text-sm">{item.label}</span>
          </Link>
        );
      })}
    </div>
  );
}
