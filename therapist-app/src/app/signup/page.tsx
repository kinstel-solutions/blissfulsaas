"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ChevronRight, User, Mail, Lock, Briefcase, Loader2 } from "lucide-react";
import { signUpTherapist } from "./actions";
import { LandingNavbar } from "@/components/sections/LandingNavbar";
import { AlexButton } from "@/components/ui/AlexButton";
import { signupSchema, type SignupValues } from "@/lib/validations";

export default function SignupPage() {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignupValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      email: "",
      password: "",
      confirmPassword: "",
      firstName: "",
      lastName: "",
    },
  });

  const onSubmit = async (data: SignupValues) => {
    setError(null);
    setLoading(true);
    
    try {
      const result = await signUpTherapist({
        email: data.email,
        password: data.password,
        firstName: data.firstName,
        lastName: data.lastName
      });

      if (result.error) {
        setError(result.error);
      } else {
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
    <div className="min-h-screen flex flex-col bg-[#F8FAF9] font-outfit text-[#1A2F28] overflow-hidden antialiased relative">
      <LandingNavbar portal="therapist" hideLinks />

      {/* Decorative Blurs */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[#E3F2ED] rounded-full blur-[120px] -z-10 pointer-events-none transform translate-x-1/3 -translate-y-1/3 opacity-60" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-[#EEF5F2] rounded-full blur-[100px] -z-10 pointer-events-none transform -translate-x-1/4 translate-y-1/4 opacity-80" />

      <main className="flex-1 flex items-center justify-center p-4 md:p-8 relative z-10 pt-32 pb-20">
        <div className="w-full max-w-2xl mt-12 mb-24">
          <div className="text-center mb-10">
            <div className="w-20 h-20 rounded-2xl bg-white/40 backdrop-blur-sm border border-[#1A2F28]/5 flex items-center justify-center mx-auto mb-6 shadow-sm">
               <Briefcase className="w-10 h-10 text-[#2D4F43] stroke-[1.5]" />
            </div>
            <h1 className="text-5xl md:text-6xl font-cormorant font-medium text-[#1A2F28] mb-4 tracking-tight">
              Join Our <span className="italic font-normal">Network</span>
            </h1>
            <p className="text-[#1A2F28]/60 text-sm font-medium uppercase tracking-[0.2em]">Apply for a curated practice space</p>
          </div>

          <div className="bg-white/60 backdrop-blur-xl p-8 md:p-14 rounded-[2.5rem] shadow-[0_20px_50px_rgba(26,47,40,0.05)] border border-white/40 relative overflow-hidden group">
            {/* Inner Glow */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#E3F2ED]/50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:scale-110 transition-transform duration-1000" />
            
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 relative z-10">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label htmlFor="firstName" className="block text-[10px] font-bold uppercase tracking-[0.2em] text-[#1A2F28]/40 ml-4">
                    First Name
                  </label>
                  <div className="relative group/input">
                    <div className="absolute left-6 top-1/2 -translate-y-1/2 text-[#1A2F28]/30 group-focus-within/input:text-[#2D4F43] transition-colors">
                      <User size={18} />
                    </div>
                    <input 
                      id="firstName" 
                      {...register("firstName")}
                      placeholder="Jane" 
                      className={`w-full h-16 bg-white/50 border focus:bg-white px-14 outline-none transition-all rounded-2xl text-[#1A2F28] font-medium placeholder:text-[#1A2F28]/20 shadow-sm ${
                        errors.firstName ? 'border-red-500' : 'border-[#1A2F28]/5 focus:border-[#2D4F43]/20'
                      }`}
                    />
                  </div>
                  {errors.firstName && <p className="text-[10px] text-red-500 font-bold uppercase tracking-widest mt-1 ml-4">{errors.firstName.message}</p>}
                </div>
                <div className="space-y-2">
                  <label htmlFor="lastName" className="block text-[10px] font-bold uppercase tracking-[0.2em] text-[#1A2F28]/40 ml-4">
                    Last Name
                  </label>
                  <div className="relative group/input">
                    <div className="absolute left-6 top-1/2 -translate-y-1/2 text-[#1A2F28]/30 group-focus-within/input:text-[#2D4F43] transition-colors">
                      <User size={18} />
                    </div>
                    <input 
                      id="lastName" 
                      {...register("lastName")}
                      placeholder="Doe" 
                      className={`w-full h-16 bg-white/50 border focus:bg-white px-14 outline-none transition-all rounded-2xl text-[#1A2F28] font-medium placeholder:text-[#1A2F28]/20 shadow-sm ${
                        errors.lastName ? 'border-red-500' : 'border-[#1A2F28]/5 focus:border-[#2D4F43]/20'
                      }`}
                    />
                  </div>
                  {errors.lastName && <p className="text-[10px] text-red-500 font-bold uppercase tracking-widest mt-1 ml-4">{errors.lastName.message}</p>}
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="email" className="block text-[10px] font-bold uppercase tracking-[0.2em] text-[#1A2F28]/40 ml-4">
                  Professional Email
                </label>
                <div className="relative group/input">
                  <div className="absolute left-6 top-1/2 -translate-y-1/2 text-[#1A2F28]/30 group-focus-within/input:text-[#2D4F43] transition-colors">
                    <Mail size={18} />
                  </div>
                  <input 
                    id="email" 
                    type="email" 
                    {...register("email")}
                    placeholder="name@provider.com" 
                    className={`w-full h-16 bg-white/50 border focus:bg-white px-14 outline-none transition-all rounded-2xl text-[#1A2F28] font-medium placeholder:text-[#1A2F28]/20 shadow-sm ${
                      errors.email ? 'border-red-500' : 'border-[#1A2F28]/5 focus:border-[#2D4F43]/20'
                    }`}
                  />
                </div>
                {errors.email && <p className="text-[10px] text-red-500 font-bold uppercase tracking-widest mt-1 ml-4">{errors.email.message}</p>}
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label htmlFor="password" className="block text-[10px] font-bold uppercase tracking-[0.2em] text-[#1A2F28]/40 ml-4">
                    Account Password
                  </label>
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
                      {...register("confirmPassword")}
                      placeholder="••••••••" 
                      className={`w-full h-16 bg-white/50 border focus:bg-white px-14 outline-none transition-all rounded-2xl text-[#1A2F28] font-medium placeholder:text-[#1A2F28]/20 shadow-sm ${
                        errors.confirmPassword ? 'border-red-500' : 'border-[#1A2F28]/5 focus:border-[#2D4F43]/20'
                      }`}
                    />
                  </div>
                  {errors.confirmPassword && <p className="text-[10px] text-red-500 font-bold uppercase tracking-widest mt-1 ml-4">{errors.confirmPassword.message}</p>}
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
                  disabled={loading}
                  size="lg"
                  className="px-12 text-sm uppercase tracking-[0.2em]"
                  icon={loading ? <Loader2 className="w-5 h-5 animate-spin" /> : undefined}
                >
                  {loading ? "Processing..." : "Submit Application"}
                </AlexButton>
              </div>
            </form>

            <div className="mt-10 pt-8 border-t border-[#1A2F28]/5 text-center">
              <p className="text-xs text-[#1A2F28]/40 font-medium">
                Already registered as a provider?{" "}
                <Link href="/login" className="text-[#2D4F43] font-bold hover:underline decoration-[#2D4F43]/20 decoration-2 underline-offset-4">
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
