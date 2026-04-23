"use client";

import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";

export default function SignOutButton() {
  const router = useRouter();

  const handleSignOut = async () => {
    try {
      // In Admin, we use a slightly different route if we want, 
      // but let's stick to the same pattern.
      const response = await fetch("/auth/signout", {
        method: "POST",
      });

      if (response.ok) {
        router.push("/login");
        router.refresh();
      }
    } catch (error) {
      console.error("Error signing out:", error);
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
