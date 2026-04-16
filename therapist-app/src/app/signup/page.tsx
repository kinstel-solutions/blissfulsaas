"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, ChevronRight, Briefcase } from "lucide-react";
import { signUpTherapist } from "./actions";

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    
    try {
      const result = await signUpTherapist({
        email,
        password,
        firstName,
        lastName
      });

      if (result.error) {
        setError(result.error);
      } else {
        // Success!
        router.push("/dashboard"); 
      }

    } catch (err: any) {
      setError("An unexpected error occurred. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-surface font-sans text-foreground overflow-hidden">
      {/* Background Decorative Element */}
      <div className="absolute top-0 right-0 w-1/2 h-[50vh] bg-primary/5 rounded-full blur-3xl -z-10 pointer-events-none transform translate-x-1/4 -translate-y-1/4" />
      <div className="absolute bottom-0 left-0 w-1/3 h-[40vh] bg-primary-container/10 rounded-full blur-3xl -z-10 pointer-events-none transform -translate-x-1/4 translate-y-1/4" />

      {/* Header / Nav */}
      <header className="p-6 md:px-12 flex justify-between items-center bg-surface/50 backdrop-blur-md z-10 border-b border-outline-variant/10">
        <Link href="/" className="group inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-muted-foreground/60 hover:text-primary transition-colors">
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Home
        </Link>
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 rounded bg-primary flex items-center justify-center">
            <span className="text-primary-foreground font-heading font-bold text-xs">B</span>
          </div>
          <span className="font-heading font-semibold text-sm text-primary tracking-tight">Provider Portal</span>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center p-6 pb-24 z-10 overflow-auto">
        <div className="w-full max-w-lg mt-12 mb-24">
          <div className="text-center mb-10">
            <div className="w-16 h-16 rounded-xl bg-primary/5 flex items-center justify-center mx-auto mb-6 text-primary border border-primary/10 shadow-sm">
               <Briefcase className="w-8 h-8" />
            </div>
            <h1 className="text-4xl font-heading font-normal tracking-tight text-foreground mb-3">Join Our Network</h1>
            <p className="text-muted-foreground text-sm font-medium">Apply for a curated practice space at Blissful Station</p>
          </div>

          <div className="bg-surface-container-lowest p-4 md:p-8 md:p-10 rounded-xl shadow-xl border border-outline-variant/30 relative">
            <form onSubmit={handleSignup} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                 <div className="space-y-2">
                   <label htmlFor="firstName" className="block text-xs font-bold uppercase tracking-widest text-muted-foreground/80 ml-1">
                     First Name
                   </label>
                   <input 
                     id="firstName" 
                     value={firstName}
                     onChange={(e) => setFirstName(e.target.value)}
                     placeholder="Jane" 
                     className="w-full h-12 bg-surface-container-low border-b border-outline-variant/50 focus:border-primary px-4 outline-none transition-all rounded-xl text-foreground placeholder:text-muted-foreground/40 font-medium"
                     required
                   />
                 </div>
                 <div className="space-y-2">
                   <label htmlFor="lastName" className="block text-xs font-bold uppercase tracking-widest text-muted-foreground/80 ml-1">
                     Last Name
                   </label>
                   <input 
                     id="lastName" 
                     value={lastName}
                     onChange={(e) => setLastName(e.target.value)}
                     placeholder="Doe" 
                     className="w-full h-12 bg-surface-container-low border-b border-outline-variant/50 focus:border-primary px-4 outline-none transition-all rounded-xl text-foreground placeholder:text-muted-foreground/40 font-medium"
                     required
                   />
                 </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="email" className="block text-xs font-bold uppercase tracking-widest text-muted-foreground/80 ml-1">
                  Professional Email
                </label>
                <input 
                  id="email" 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@provider.com" 
                  className="w-full h-12 bg-surface-container-low border-b border-outline-variant/50 focus:border-primary px-4 outline-none transition-all rounded-xl text-foreground placeholder:text-muted-foreground/40 font-medium"
                  required
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="password" className="block text-xs font-bold uppercase tracking-widest text-muted-foreground/80 ml-1">
                  Create Account Password
                </label>
                <input 
                  id="password" 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••" 
                  className="w-full h-12 bg-surface-container-low border-b border-outline-variant/50 focus:border-primary px-4 outline-none transition-all rounded-xl text-foreground placeholder:text-muted-foreground/40 font-medium"
                  required
                />
              </div>

              {error && (
                <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-xl text-destructive text-xs text-center font-bold">
                  {error}
                </div>
              )}

              <button 
                type="submit" 
                disabled={loading}
                className="w-full h-14 bg-primary text-primary-foreground font-bold uppercase tracking-widest text-xs rounded-2xl shadow-lg hover:shadow-xl hover:-translate-y-1 active:translate-y-0.5 flex items-center justify-center group transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Processing..." : "Submit Application"}
                <ChevronRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </button>
            </form>

            <div className="mt-10 pt-8 border-t border-surface-container-low text-center">
              <p className="text-sm text-muted-foreground font-sans">
                Already registered as a provider?{" "}
                <Link href="/login" className="text-primary font-bold hover:underline">
                  Sign In to Workspace
                </Link>
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
