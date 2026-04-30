"use client";

import { LogOut } from "lucide-react";
export default function SignOutButton() {

  const handleSignOut = async () => {
    try {
      await fetch("/auth/signout", {
        method: "POST",
      });

      // Force a hard reload/redirect to clear all state and ensure session is gone
      window.location.href = "/login";
    } catch (error) {
      console.error("Error signing out:", error);
      window.location.href = "/login";
    }
  };

  return (
    <button 
      onClick={handleSignOut}
      className="w-full flex items-center px-4 py-4 text-destructive/80 hover:bg-destructive/5 hover:text-destructive rounded-2xl transition-all duration-300 text-sm font-bold uppercase tracking-widest group"
    >
      <LogOut className="w-5 h-5 mr-3 group-hover:-translate-x-1 transition-transform" />
      Sign Out
    </button>
  );
}
