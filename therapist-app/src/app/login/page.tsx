"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, ChevronRight, Fingerprint } from "lucide-react";
import { createClient } from "@/lib/supabase";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) setError(error.message);
    else router.push("/dashboard");
  };

  return (
    <div className="min-h-screen flex flex-col bg-surface font-sans text-foreground overflow-hidden antialiased">
      {/* Decorative Blurs */}
      <div className="absolute top-0 right-0 w-1/2 h-[50vh] bg-primary/5 rounded-full blur-[100px] -z-10 pointer-events-none transform translate-x-1/4 -translate-y-1/4" />
      <div className="absolute bottom-0 left-0 w-1/3 h-[40vh] bg-primary-container/10 rounded-full blur-[100px] -z-10 pointer-events-none transform -translate-x-1/4 translate-y-1/4" />

      {/* Header */}
      <header className="p-8 md:px-16 flex justify-between items-center z-10 bg-transparent">
        <Link href="/" className="group inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-primary/40 hover:text-primary transition-colors">
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Back to Home
        </Link>
        <div className="flex items-center gap-3 opacity-40">
          <div className="w-6 h-6 rounded-lg bg-primary flex items-center justify-center">
            <span className="text-primary-foreground font-heading font-bold text-xs">B</span>
          </div>
          <span className="font-heading font-semibold text-sm text-primary tracking-tighter">Portal Login</span>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center p-8 pb-32 z-10">
        <div className="w-full max-w-md">
          <div className="text-center mb-12">
            <div className="w-16 h-16 rounded-3xl bg-primary/2 flex items-center justify-center mx-auto mb-8 text-primary/40 shadow-sm border border-primary/5">
               <Fingerprint className="w-8 h-8 font-thin" />
            </div>
            <h1 className="text-4xl font-heading font-normal tracking-tight text-primary mb-4 leading-tight">Provider Login.</h1>
            <p className="text-primary/40 text-xs font-bold uppercase tracking-[0.3em]">Sign in to your account</p>
          </div>

          <div className="bg-surface-container-lowest p-10 md:p-12 rounded-[2.5rem] shadow-2xl border border-outline-variant/10 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/2 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 group-hover:scale-110 transition-transform duration-700" />
            
            <form onSubmit={handleLogin} className="space-y-8 relative z-10">
              <div className="space-y-3">
                <label htmlFor="email" className="block text-xs font-bold uppercase tracking-[0.3em] text-primary/30 ml-1">
                  Email Address
                </label>
                <input 
                  id="email" 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com" 
                  className="w-full h-14 bg-surface-container-low border border-transparent focus:border-primary/10 focus:bg-surface-container-lowest px-6 outline-none transition-all rounded-2xl text-primary font-medium placeholder:text-primary/20 shadow-sm"
                  required
                />
              </div>
              
              <div className="space-y-3">
                <div className="flex justify-between items-center px-1">
                  <label htmlFor="password" className="block text-xs font-bold uppercase tracking-[0.3em] text-primary/30">
                    Password
                  </label>
                  <Link href="/forgot" className="text-xs font-bold uppercase tracking-[0.2em] text-primary/60 hover:text-primary transition-colors underline decoration-primary/10 decoration-2 underline-offset-4">
                    Forgot password?
                  </Link>
                </div>
                <input 
                  id="password" 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••" 
                  className="w-full h-14 bg-surface-container-low border border-transparent focus:border-primary/10 focus:bg-surface-container-lowest px-6 outline-none transition-all rounded-2xl text-primary font-medium placeholder:text-primary/20 shadow-sm"
                  required
                />
              </div>

              {error && (
                <div className="p-4 bg-destructive/5 border border-destructive/10 rounded-2xl text-destructive text-xs font-bold uppercase tracking-widest text-center">
                  {error}
                </div>
              )}

              <button 
                type="submit" 
                className="w-full h-16 bg-primary text-primary-foreground font-bold uppercase tracking-[0.3em] text-xs rounded-2xl shadow-2xl hover:shadow-primary/40 hover:-translate-y-1 active:translate-y-0.5 flex items-center justify-center group transition-all duration-500"
              >
                Sign In
                <ChevronRight className="w-4 h-4 ml-3 group-hover:translate-x-1 transition-transform" />
              </button>
            </form>

            <div className="mt-12 pt-10 border-t border-primary/5 text-center">
              <p className="text-xs text-primary/40 font-medium">
                Don't have an account?{" "}
                <Link href="/signup" className="text-primary font-bold hover:underline decoration-primary/20 decoration-2 underline-offset-4">
                  Sign Up
                </Link>
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
