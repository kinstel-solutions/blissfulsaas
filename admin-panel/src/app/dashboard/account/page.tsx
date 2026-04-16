"use client";

import Link from "next/link";
import { 
  ShieldAlert, 
  Settings, 
  LogOut, 
  ChevronRight, 
  Bell,
  HardDrive
} from "lucide-react";
import SignOutButton from "@/components/SignOutButton";

export default function AccountPage() {
  return (
    <div className="space-y-6 pb-24">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-heading font-bold text-primary">Admin Access</h1>
        <p className="text-sm text-muted-foreground">Internal OS and system control center</p>
      </div>

      {/* Admin Section Preview */}
      <div className="bg-primary shadow-lg shadow-primary/20 rounded-xl p-6 flex items-center gap-4 border border-primary/20">
        <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white text-2xl font-bold">
          A
        </div>
        <div>
          <h2 className="text-lg font-bold text-white leading-none">Super User</h2>
          <p className="text-xs text-white/70 mt-1 uppercase tracking-widest font-bold">Root Access • Blissful Station</p>
        </div>
      </div>

      <div className="space-y-2">
        <p className="px-4 text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/60 mb-2">System Functions</p>
        <div className="bg-white border border-slate-100 rounded-xl overflow-hidden divide-y divide-slate-50">
          <Link 
            href="#" 
            className="flex items-center justify-between p-5 hover:bg-slate-50 transition-colors group opacity-50 cursor-not-allowed"
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400">
                <Settings className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-900">System Config</p>
                <p className="text-[10px] text-slate-400 font-medium">Manage global app variables</p>
              </div>
            </div>
          </Link>

          <Link 
            href="#" 
            className="flex items-center justify-between p-5 hover:bg-slate-50 transition-colors group opacity-50 cursor-not-allowed"
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400">
                <Bell className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-900">System Broadcast</p>
                <p className="text-[10px] text-slate-400 font-medium">Send notifications to all users</p>
              </div>
            </div>
          </Link>
        </div>
      </div>

      <div className="space-y-2">
        <p className="px-4 text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/60 mb-2">Security</p>
        <div className="bg-white border border-slate-100 rounded-xl overflow-hidden divide-y divide-slate-50">
          <div className="flex items-center justify-between p-5">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center text-green-500">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-900">Health Check</p>
                <p className="text-[10px] text-green-500 font-bold uppercase tracking-widest">All systems operational</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="pt-4">
        <div className="bg-red-50/50 border border-red-100 rounded-xl p-2">
           <SignOutButton />
        </div>
      </div>
    </div>
  );
}
