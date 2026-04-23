"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ShieldAlert, Loader2, Mail, Lock, ShieldCheck } from "lucide-react";
import { createClient } from "@/lib/supabase";
import { AlexButton } from "@/components/ui/AlexButton";
import { adminLoginSchema, type AdminLoginValues } from "@/lib/validations";

export default function AdminLoginPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<AdminLoginValues>({
    resolver: zodResolver(adminLoginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: AdminLoginValues) => {
    setLoading(true);
    setError(null);
    
    const supabase = createClient();
    
    const { error: authError } = await supabase.auth.signInWithPassword(data);

    if (authError) {
      setError(authError.message);
      setLoading(false);
      return;
    }

    router.push("/dashboard");
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#0F1A16] font-outfit text-white overflow-hidden antialiased relative">
      {/* Decorative Blurs */}
      <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-[#1A2F28] rounded-full blur-[150px] -z-10 pointer-events-none transform translate-x-1/3 -translate-y-1/3 opacity-40" />
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-[#2D4F43] rounded-full blur-[120px] -z-10 pointer-events-none transform -translate-x-1/4 translate-y-1/4 opacity-20" />

      {/* Header */}
      <header className="p-6 md:p-10 md:px-16 flex justify-between items-center z-10">
        <div className="flex items-center gap-4 group cursor-default">
          <div className="w-10 h-10 rounded-xl bg-[#2D4F43] flex items-center justify-center shadow-lg shadow-[#2D4F43]/20 rotate-0 group-hover:rotate-12 transition-transform">
            <span className="text-white font-heading font-bold text-sm">B</span>
          </div>
          <div className="flex flex-col">
            <span className="font-cormorant font-bold text-xl text-white tracking-tight leading-none">Blissful Station</span>
            <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#2D4F43]">System Admin</span>
          </div>
        </div>
        <div className="hidden sm:flex items-center gap-3 px-5 py-2.5 bg-red-500/5 border border-red-500/10 rounded-full backdrop-blur-md">
           <ShieldAlert className="w-3.5 h-3.5 text-red-400 animate-pulse" />
           <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-red-400/80">Restricted Access</span>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center p-4 md:p-8 pb-32 z-10">
        <div className="w-full max-w-xl animate-in fade-in slide-in-from-bottom-8 duration-1000">
          <div className="text-center mb-10">
            <div className="w-20 h-20 rounded-[2rem] bg-white/5 border border-white/10 flex items-center justify-center mx-auto mb-8 text-white shadow-2xl relative overflow-hidden group">
               <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
               <ShieldCheck className="w-10 h-10 font-thin transition-transform duration-500 group-hover:scale-110 text-[#2D4F43]" />
            </div>
            <h1 className="text-5xl md:text-6xl font-cormorant font-medium text-white mb-4 tracking-tight">
              Admin <span className="italic font-normal text-[#2D4F43]">OS</span>
            </h1>
            <p className="text-white/40 text-[10px] font-bold uppercase tracking-[0.4em]">Biometric or Security Auth Required</p>
          </div>

          <div className="bg-white/5 backdrop-blur-2xl p-8 md:p-14 rounded-[3rem] shadow-[0_30px_100px_rgba(0,0,0,0.5)] border border-white/10 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#2D4F43]/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:scale-125 transition-transform duration-1000" />
            
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 relative z-10">
              <div className="space-y-3">
                <label className="block text-[10px] font-bold uppercase tracking-[0.3em] text-white/30 ml-4">
                  Root Credentials
                </label>
                <div className="relative group/input">
                  <div className="absolute left-6 top-1/2 -translate-y-1/2 text-white/20 group-focus-within/input:text-[#2D4F43] transition-colors">
                    <Mail size={20} />
                  </div>
                  <input 
                    type="email" 
                    {...register("email")}
                    placeholder="admin@station.os" 
                    className={`w-full h-16 bg-white/5 border focus:bg-white/10 px-14 outline-none transition-all rounded-2xl text-white font-medium placeholder:text-white/10 shadow-inner ${
                      errors.email ? 'border-red-500' : 'border-white/10 focus:border-[#2D4F43]/30'
                    }`}
                  />
                </div>
                {errors.email && <p className="text-[10px] text-red-500 font-bold uppercase tracking-[0.2em] mt-1 ml-4">{errors.email.message}</p>}
              </div>
              
              <div className="space-y-3">
                <label className="block text-[10px] font-bold uppercase tracking-[0.3em] text-white/30 ml-4">
                  Security Token
                </label>
                <div className="relative group/input">
                  <div className="absolute left-6 top-1/2 -translate-y-1/2 text-white/20 group-focus-within/input:text-[#2D4F43] transition-colors">
                    <Lock size={20} />
                  </div>
                  <input 
                    type="password" 
                    {...register("password")}
                    placeholder="••••••••" 
                    className={`w-full h-16 bg-white/5 border focus:bg-white/10 px-14 outline-none transition-all rounded-2xl text-white font-medium placeholder:text-white/10 shadow-inner ${
                      errors.password ? 'border-red-500' : 'border-white/10 focus:border-[#2D4F43]/30'
                    }`}
                  />
                </div>
                {errors.password && <p className="text-[10px] text-red-500 font-bold uppercase tracking-[0.2em] mt-1 ml-4">{errors.password.message}</p>}
              </div>

              {error && (
                <div className="p-5 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-400 text-[10px] font-bold uppercase tracking-[0.2em] text-center leading-relaxed animate-shake">
                  {error}
                </div>
              )}

              <div className="pt-2 flex justify-center">
                <AlexButton 
                  type="submit" 
                  disabled={loading}
                  size="lg"
                  className="px-12 text-sm uppercase tracking-[0.3em]"
                  icon={loading ? <Loader2 className="w-6 h-6 animate-spin" /> : <ShieldCheck size={18} />}
                >
                  {loading ? "Processing..." : "Initiate Access"}
                </AlexButton>
              </div>
            </form>

            <div className="mt-14 pt-10 border-t border-white/5 text-center">
              <p className="text-[10px] text-white/20 font-bold uppercase tracking-[0.2em] leading-relaxed">
                Access to this system is restricted to authorized personnel. 
                <br />Unauthorized access attempts are logged and reported.
              </p>
            </div>
          </div>
        </div>
      </main>

      <footer className="p-10 text-center opacity-20">
        <p className="text-[10px] font-bold uppercase tracking-[0.5em]">Blissful Station Secure Environment v4.0.2</p>
      </footer>
    </div>
  );
}
