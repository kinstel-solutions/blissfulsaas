"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ChevronRight, Fingerprint, Mail, Lock, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase";
import { LandingNavbar } from "@/components/sections/LandingNavbar";
import { AlexButton } from "@/components/ui/AlexButton";
import { loginSchema, type LoginValues } from "@/lib/validations";

export default function LoginPage() {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: LoginValues) => {
    setLoading(true);
    setError(null);
    const supabase = createClient();
    const { error: authError } = await supabase.auth.signInWithPassword(data);
    if (authError) {
      setError(authError.message);
      setLoading(false);
    } else {
      router.push("/dashboard/discover");
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAF9] font-outfit text-[#1A2F28] overflow-hidden antialiased relative">
      <LandingNavbar hideLinks />

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
              Welcome <span className="italic font-normal">Back</span>
            </h1>
            <p className="text-[#1A2F28]/60 text-sm font-medium uppercase tracking-[0.2em]">Secure Access to your Station</p>
          </div>

          <div className="bg-white/60 backdrop-blur-xl p-8 md:p-12 rounded-[2.5rem] shadow-[0_20px_50px_rgba(26,47,40,0.05)] border border-white/40 relative overflow-hidden group">
            {/* Inner Glow */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#E3F2ED]/50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:scale-110 transition-transform duration-1000" />
            
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 relative z-10">
              <div className="space-y-2">
                <label htmlFor="email" className="block text-[10px] font-bold uppercase tracking-[0.2em] text-[#1A2F28]/40 ml-4">
                  Email Address
                </label>
                <div className="relative group/input">
                  <div className="absolute left-6 top-1/2 -translate-y-1/2 text-[#1A2F28]/30 group-focus-within/input:text-[#2D4F43] transition-colors">
                    <Mail size={18} />
                  </div>
                  <input 
                    id="email" 
                    type="email" 
                    {...register("email")}
                    placeholder="your@email.com" 
                    className={`w-full h-16 bg-white/50 border focus:bg-white px-14 outline-none transition-all rounded-2xl text-[#1A2F28] font-medium placeholder:text-[#1A2F28]/20 shadow-sm ${
                      errors.email ? 'border-red-500' : 'border-[#1A2F28]/5 focus:border-[#2D4F43]/20'
                    }`}
                  />
                </div>
                {errors.email && <p className="text-[10px] text-red-500 font-bold uppercase tracking-widest mt-1 ml-4">{errors.email.message}</p>}
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between items-center px-4">
                  <label htmlFor="password" className="block text-[10px] font-bold uppercase tracking-[0.2em] text-[#1A2F28]/40">
                    Password
                  </label>
                  <Link href="/forgot" className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#2D4F43]/60 hover:text-[#2D4F43] transition-colors">
                    Forgot?
                  </Link>
                </div>
                <div className="relative group/input">
                  <div className="absolute left-6 top-1/2 -translate-y-1/2 text-[#1A2F28]/30 group-focus-within/input:text-[#2D4F43] transition-colors">
                    <Lock size={18} />
                  </div>
                  <input 
                    id="password" 
                    type="password" 
                    {...register("password")}
                    placeholder="••••••••" 
                    className={`w-full h-16 bg-white/50 border focus:bg-white px-14 outline-none transition-all rounded-2xl text-[#1A2F28] font-medium placeholder:text-[#1A2F28]/20 shadow-sm ${
                      errors.password ? 'border-red-500' : 'border-[#1A2F28]/5 focus:border-[#2D4F43]/20'
                    }`}
                  />
                </div>
                {errors.password && <p className="text-[10px] text-red-500 font-bold uppercase tracking-widest mt-1 ml-4">{errors.password.message}</p>}
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
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Sign In"}
                </AlexButton>
              </div>
            </form>

            <div className="mt-10 pt-8 border-t border-[#1A2F28]/5 text-center">
              <p className="text-xs text-[#1A2F28]/40 font-medium">
                New to the Station?{" "}
                <Link href="/signup" className="text-[#2D4F43] font-bold hover:underline decoration-[#2D4F43]/20 decoration-2 underline-offset-4">
                  Create an account
                </Link>
              </p>
            </div>
          </div>
          
          <div className="mt-12 flex justify-center items-center gap-8">
            <Link href="/" className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#1A2F28]/30 hover:text-[#1A2F28] transition-colors">
              Privacy Policy
            </Link>
            <div className="w-1 h-1 bg-[#1A2F28]/10 rounded-full" />
            <Link href="/" className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#1A2F28]/30 hover:text-[#1A2F28] transition-colors">
              Terms of Service
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
