"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, ChevronRight } from "lucide-react";
import { createClient } from "@/lib/supabase";

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const supabase = createClient();
    
    // Simulate auth logic or real auth if keys are present
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          first_name: firstName,
          last_name: lastName,
          role: "PATIENT" 
        }
      }
    });
    
    if (error) {
      setError(error.message);
    } else {
      router.push("/dashboard"); // Or verification page
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-surface font-sans text-foreground overflow-hidden">
      {/* Background Decorative Element */}
      <div className="absolute top-0 right-0 w-1/2 h-[50vh] bg-primary/5 rounded-full blur-3xl -z-10 pointer-events-none transform translate-x-1/4 -translate-y-1/4" />
      <div className="absolute bottom-0 left-0 w-1/3 h-[40vh] bg-primary-container/10 rounded-full blur-3xl -z-10 pointer-events-none transform -translate-x-1/4 translate-y-1/4" />

      {/* Header / Nav */}
      <header className="p-6 md:px-12 flex justify-between items-center">
        <Link href="/" className="group inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Back to Sanctuary
        </Link>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded bg-primary flex items-center justify-center">
            <span className="text-primary-foreground font-heading font-bold text-xs">B</span>
          </div>
          <span className="font-heading font-semibold text-sm text-primary">Blissful Station</span>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center p-6 pb-24">
        <div className="w-full max-w-lg">
          <div className="text-center mb-10">
            <h1 className="text-4xl font-heading font-normal tracking-tight text-foreground mb-3">Begin Your Journey</h1>
            <p className="text-muted-foreground">Join our curated workspace for mental wellness.</p>
          </div>

          <div className="bg-surface-container-lowest p-8 md:p-10 rounded-2xl shadow-sm border border-outline-variant/30 relative">
            <form onSubmit={handleSignup} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                 <div className="space-y-2">
                   <label htmlFor="firstName" className="block text-sm font-medium text-foreground/80 ml-1">
                     First Name
                   </label>
                   <input 
                     id="firstName" 
                     value={firstName}
                     onChange={(e) => setFirstName(e.target.value)}
                     placeholder="Jane" 
                     className="w-full h-12 bg-surface-container-low border-b border-outline-variant/50 focus:border-primary px-4 outline-none transition-all rounded-lg text-foreground placeholder:text-muted-foreground/50"
                     required
                   />
                 </div>
                 <div className="space-y-2">
                   <label htmlFor="lastName" className="block text-sm font-medium text-foreground/80 ml-1">
                     Last Name
                   </label>
                   <input 
                     id="lastName" 
                     value={lastName}
                     onChange={(e) => setLastName(e.target.value)}
                     placeholder="Doe" 
                     className="w-full h-12 bg-surface-container-low border-b border-outline-variant/50 focus:border-primary px-4 outline-none transition-all rounded-lg text-foreground placeholder:text-muted-foreground/50"
                     required
                   />
                 </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="email" className="block text-sm font-medium text-foreground/80 ml-1">
                  Email Address
                </label>
                <input 
                  id="email" 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="jane.doe@example.com" 
                  className="w-full h-12 bg-surface-container-low border-b border-outline-variant/50 focus:border-primary px-4 outline-none transition-all rounded-lg text-foreground placeholder:text-muted-foreground/50"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <label htmlFor="password" className="block text-sm font-medium text-foreground/80 ml-1">
                  Create Password
                </label>
                <input 
                  id="password" 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••" 
                  className="w-full h-12 bg-surface-container-low border-b border-outline-variant/50 focus:border-primary px-4 outline-none transition-all rounded-lg text-foreground placeholder:text-muted-foreground/50"
                  required
                />
              </div>

              {error && (
                <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive text-xs text-center font-medium">
                  {error}
                </div>
              )}

              <button 
                type="submit" 
                className="w-full h-12 mt-4 bg-primary text-primary-foreground font-semibold rounded-xl shadow-md hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center group transition-all duration-300"
              >
                Create Account
                <ChevronRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </button>
            </form>

            <div className="mt-8 pt-6 border-t border-surface-container-low text-center">
              <p className="text-sm text-muted-foreground font-sans">
                Already registered?{" "}
                <Link href="/login" className="text-primary font-semibold hover:underline">
                  Sign in securely
                </Link>
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
