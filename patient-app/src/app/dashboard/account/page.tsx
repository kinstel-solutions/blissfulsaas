"use client";

import Link from "next/link";
import { 
  Home, 
  User, 
  LogOut, 
  ChevronRight, 
  ClipboardList,
  ShieldCheck,
  CreditCard
} from "lucide-react";
import SignOutButton from "@/components/SignOutButton";

export default function AccountPage() {
  return (
    <div className="space-y-6 pb-24">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-heading font-bold text-foreground">Account</h1>
        <p className="text-sm text-muted-foreground">Manage your sanctuary settings and profile</p>
      </div>

      {/* Profile Section Preview */}
      <div className="bg-surface-container-low border border-outline-variant/20 rounded-3xl p-6 flex items-center gap-4">
        <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary text-2xl font-bold">
          JD
        </div>
        <div>
          <h2 className="text-lg font-bold text-foreground leading-none">Jane Doe</h2>
          <p className="text-xs text-muted-foreground mt-1 uppercase tracking-widest font-bold">Premium Patient</p>
        </div>
      </div>

      <div className="space-y-2">
        <p className="px-4 text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/60 mb-2">Sanctuary Settings</p>
        <div className="bg-white border border-slate-100 rounded-3xl overflow-hidden divide-y divide-slate-50">
          <Link 
            href="/dashboard/profile" 
            className="flex items-center justify-between p-5 hover:bg-slate-50 transition-colors group"
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-500">
                <User className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-900">Personal Information</p>
                <p className="text-[10px] text-slate-400 font-medium">Update your profile details</p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-300 group-hover:translate-x-1 transition-transform" />
          </Link>

          <Link 
            href="/dashboard/intake" 
            className="flex items-center justify-between p-5 hover:bg-slate-50 transition-colors group"
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center text-purple-500">
                <ClipboardList className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-900">My Intake Form</p>
                <p className="text-[10px] text-slate-400 font-medium">Review your clinical assessment</p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-300 group-hover:translate-x-1 transition-transform" />
          </Link>

          <Link 
            href="/" 
            className="flex items-center justify-between p-5 hover:bg-slate-50 transition-colors group"
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center text-orange-500">
                <Home className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-900">Return to Sanctuary</p>
                <p className="text-[10px] text-slate-400 font-medium">Go back to landing page</p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-300 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>

      <div className="space-y-2">
        <p className="px-4 text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/60 mb-2">Security & Legal</p>
        <div className="bg-white border border-slate-100 rounded-3xl overflow-hidden divide-y divide-slate-50">
          <Link 
            href="#" 
            className="flex items-center justify-between p-5 hover:bg-slate-50 transition-colors opacity-50 cursor-not-allowed"
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-900">Privacy Policy</p>
              </div>
            </div>
          </Link>
        </div>
      </div>

      <div className="pt-4">
        <div className="bg-red-50/50 border border-red-100 rounded-3xl p-2">
           <SignOutButton />
        </div>
      </div>
    </div>
  );
}
