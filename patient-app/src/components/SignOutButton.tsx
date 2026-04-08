"use client";

import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";

export default function SignOutButton() {
  const router = useRouter();

  const handleSignOut = async () => {
    try {
      const response = await fetch("/auth/signout", {
        method: "POST",
      });

      if (response.ok) {
        // Clear local storage / memory if any
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
      className="w-full flex items-center px-4 py-3 text-destructive/80 hover:bg-destructive/10 hover:text-destructive rounded-xl transition-all duration-200 text-sm font-medium group"
    >
      <LogOut className="w-5 h-5 mr-3 group-hover:scale-110 transition-transform" />
      Sign Out
    </button>
  );
}
