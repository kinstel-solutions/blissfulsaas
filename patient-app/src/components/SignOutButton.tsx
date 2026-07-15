"use client";

import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";

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
    <Button 
      variant="ghost"
      onClick={handleSignOut}
      className="w-full flex items-center justify-start px-4 py-3.5 text-destructive/80 hover:bg-destructive/10 hover:text-destructive rounded-lg transition-all duration-200 text-base font-medium group h-auto shadow-none"
    >
      <LogOut className="w-5 h-5 mr-4 group-hover:scale-110 transition-transform" />
      Sign Out
    </Button>
  );
}
