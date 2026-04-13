"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ShieldAlert, ChevronRight, Fingerprint, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase";

export default function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    const supabase = createClient();
    
    const { error: authError } = await supabase.auth.signInWithPassword({ 
      email, 
      password 
    });

    if (authError) {
      setError(authError.message);
      setLoading(false);
      return;
    }

    // Role check happens in dashboard layout, but we'll do a quick check here too
    router.push("/dashboard");
  };

  return (
    <div className="min-h-screen flex flex-col bg-surface font-sans text-foreground overflow-hidden antialiased">
      {/* Background Decorative Blurs */}
      <div className="absolute top-0 right-0 w-1/2 h-[50vh] bg-primary/5 rounded-full blur-[120px] -z-10 pointer-events-none transform translate-x-1/4 -translate-y-1/4" />
      <div className="absolute bottom-0 left-0 w-1/3 h-[40vh] bg-destructive/5 rounded-full blur-[120px] -z-10 pointer-events-none transform -translate-x-1/4 translate-y-1/4" />

      {/* Header */}
      <header className="p-8 md:px-16 flex justify-between items-center z-10 transition-all duration-500">
        <div className="flex items-center gap-4 group cursor-default">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center shadow-lg shadow-primary/20 rotate-0 group-hover:rotate-12 transition-transform">
            <span className="text-primary-foreground font-heading font-bold text-xs">B</span>
          </div>
          <span className="font-heading font-bold text-lg text-primary tracking-tight">System Admin</span>
        </div>
        <div className="hidden sm:flex items-center gap-2 px-4 py-2 bg-destructive/5 border border-destructive/10 rounded-full">
           <ShieldAlert className="w-3.5 h-3.5 text-destructive animate-pulse" />
           <span className="text-xs font-bold uppercase tracking-widest text-destructive/80">Restricted Access</span>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center p-8 pb-32 z-10">
        <div className="w-full max-w-md animate-in fade-in slide-in-from-bottom-8 duration-700">
          <div className="text-center mb-12">
            <div className="w-20 h-20 rounded-[2rem] bg-surface-container-low flex items-center justify-center mx-auto mb-8 text-primary shadow-inner border border-outline-variant/10 relative overflow-hidden group">
               <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-1 transition-opacity duration-500" />
               <Fingerprint className="w-10 h-10 font-thin transition-transform duration-500 group-hover:scale-110" />
            </div>
            <h1 className="text-4xl font-heading font-normal tracking-tight text-primary mb-4 leading-tight">Admin OS.</h1>
            <p className="text-primary/40 text-xs font-bold uppercase tracking-[0.4em] ml-1">Admin Login</p>
          </div>

          <div className="bg-surface-container-lowest p-10 md:p-12 rounded-[3.5rem] shadow-2xl border border-outline-variant/10 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-48 h-48 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:scale-125 transition-transform duration-1000" />
            
            <form onSubmit={handleLogin} className="space-y-8 relative z-10">
              <div className="space-y-3">
                <label className="block text-xs font-bold uppercase tracking-[0.3em] text-primary/30 ml-2">
                  Email Address
                </label>
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@station.os" 
                  className="w-full h-16 bg-surface-container-low border border-transparent focus:border-primary/10 focus:bg-surface-container-lowest px-8 outline-none transition-all rounded-3xl text-primary font-medium placeholder:text-primary/10 shadow-sm"
                  required
                />
              </div>
              
              <div className="space-y-3">
                <label className="block text-xs font-bold uppercase tracking-[0.3em] text-primary/30 ml-2">
                  Password
                </label>
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••" 
                  className="w-full h-16 bg-surface-container-low border border-transparent focus:border-primary/10 focus:bg-surface-container-lowest px-8 outline-none transition-all rounded-3xl text-primary font-medium placeholder:text-primary/10 shadow-sm"
                  required
                />
              </div>

              {error && (
                <div className="p-5 bg-destructive/5 border border-destructive/10 rounded-3xl text-destructive text-xs font-bold uppercase tracking-[0.1em] text-center leading-relaxed">
                  {error}
                </div>
              )}

              <button 
                type="submit" 
                disabled={loading}
                className="w-full h-20 bg-primary text-primary-foreground font-bold uppercase tracking-[0.4em] text-xs rounded-[2.5rem] shadow-2xl shadow-primary/20 hover:shadow-primary/40 hover:-translate-y-1.5 active:translate-y-0.5 flex items-center justify-center group transition-all duration-500 disabled:opacity-50 disabled:translate-y-0"
              >
                {loading ? (
                  <Loader2 className="w-6 h-6 animate-spin" />
                ) : (
                  <>
                    Login
                    <ChevronRight className="w-4 h-4 ml-4 group-hover:translate-x-2 transition-transform duration-500" />
                  </>
                )}
              </button>
            </form>

            <div className="mt-14 pt-10 border-t border-primary/5 text-center">
              <p className="text-xs text-primary/30 font-bold uppercase tracking-[0.2em] leading-relaxed">
                Access to this terminal is restricted to authorized personnel. 
                <br />Unauthorized access will be logged.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
