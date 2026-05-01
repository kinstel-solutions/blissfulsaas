"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Lock, Fingerprint, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase";
import { LandingNavbar } from "@/components/sections/LandingNavbar";
import { AlexButton } from "@/components/ui/AlexButton";

export default function UpdatePasswordPage() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password || !confirmPassword) return;

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setLoading(true);
    setError(null);
    const supabase = createClient();
    
    const { error: updateError } = await supabase.auth.updateUser({
      password: password
    });

    if (updateError) {
      setError(updateError.message);
      setLoading(false);
    } else {
      // Successfully updated, redirect to dashboard
      router.push("/dashboard");
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAF9] font-outfit text-[#1A2F28] overflow-hidden antialiased relative">
      <LandingNavbar portal="therapist" hideLinks />

      {/* Decorative Blurs */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[#E3F2ED] rounded-full blur-[120px] -z-10 pointer-events-none transform translate-x-1/3 -translate-y-1/3 opacity-60" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-[#EEF5F2] rounded-full blur-[100px] -z-10 pointer-events-none transform -translate-x-1/4 translate-y-1/4 opacity-80" />

      <main className="flex-1 flex items-center justify-center p-4 md:p-8 relative z-10 pt-32 pb-20">
        <div className="w-full max-w-xl">
          <div className="text-center mb-10">
            <div className="w-20 h-20 rounded-2xl bg-white/40 backdrop-blur-sm border border-[#1A2F28]/5 flex items-center justify-center mx-auto mb-6 shadow-sm">
               <Fingerprint className="w-10 h-10 text-[#2D4F43] stroke-[1.5]" />
            </div>
            <h1 className="text-5xl md:text-6xl font-cormorant font-medium text-[#1A2F28] mb-4 tracking-tight">
              New <span className="italic font-normal">Password</span>
            </h1>
            <p className="text-[#1A2F28]/60 text-sm font-medium uppercase tracking-[0.2em]">Secure your Provider Account</p>
          </div>

          <div className="bg-white/60 backdrop-blur-xl p-8 md:p-12 rounded-[2.5rem] shadow-[0_20px_50px_rgba(26,47,40,0.05)] border border-white/40 relative overflow-hidden group">
            {/* Inner Glow */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#E3F2ED]/50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:scale-110 transition-transform duration-1000" />
            
            <form onSubmit={onSubmit} className="space-y-6 relative z-10">
              <div className="space-y-2">
                <label htmlFor="password" className="block text-[10px] font-bold uppercase tracking-[0.2em] text-[#1A2F28]/40 ml-4">
                  New Password
                </label>
                <div className="relative group/input">
                  <div className="absolute left-6 top-1/2 -translate-y-1/2 text-[#1A2F28]/30 group-focus-within/input:text-[#2D4F43] transition-colors">
                    <Lock size={18} />
                  </div>
                  <input 
                    id="password" 
                    type="password" 
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••" 
                    className="w-full h-16 bg-white/50 border border-[#1A2F28]/5 focus:border-[#2D4F43]/20 focus:bg-white px-14 outline-none transition-all rounded-2xl text-[#1A2F28] font-medium placeholder:text-[#1A2F28]/20 shadow-sm"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="confirmPassword" className="block text-[10px] font-bold uppercase tracking-[0.2em] text-[#1A2F28]/40 ml-4">
                  Confirm Password
                </label>
                <div className="relative group/input">
                  <div className="absolute left-6 top-1/2 -translate-y-1/2 text-[#1A2F28]/30 group-focus-within/input:text-[#2D4F43] transition-colors">
                    <Lock size={18} />
                  </div>
                  <input 
                    id="confirmPassword" 
                    type="password" 
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••" 
                    className="w-full h-16 bg-white/50 border border-[#1A2F28]/5 focus:border-[#2D4F43]/20 focus:bg-white px-14 outline-none transition-all rounded-2xl text-[#1A2F28] font-medium placeholder:text-[#1A2F28]/20 shadow-sm"
                  />
                </div>
              </div>
              
              {error && (
                <div className="p-4 bg-red-50/50 border border-red-100 rounded-2xl text-red-600 text-[10px] font-bold uppercase tracking-widest text-center animate-shake">
                  {error}
                </div>
              )}

              <div className="pt-2 flex justify-center">
                <AlexButton 
                  type="submit" 
                  size="lg"
                  disabled={loading}
                  className="px-12 text-sm uppercase tracking-[0.2em]"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save Password"}
                </AlexButton>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}
