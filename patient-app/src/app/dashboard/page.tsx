import { createClient } from "@/lib/supabase/server";
import { ArrowRight, Activity } from "lucide-react";
import Image from "next/image";

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();

  const firstName = data?.user?.user_metadata?.first_name || "Guest";

  return (
    <div className="space-y-10">
      {/* Welcome Section */}
      <div className="relative overflow-hidden group bg-surface-container-lowest border border-outline-variant/30 p-10 rounded-3xl shadow-sm">
        <div className="absolute top-0 right-0 w-80 h-80 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:scale-125 transition-transform duration-700" />
        <div className="relative z-10">
          <h1 className="text-4xl font-heading font-medium text-foreground mb-4">
            Welcome back, {firstName}
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl leading-relaxed">
            Your sanctuary for growth and healing is ready. You have <span className="text-primary font-bold">1 session</span> scheduled with your curated specialist this week.
          </p>
          <div className="mt-8 flex gap-4">
            <button className="bg-primary text-primary-foreground px-6 py-3 rounded-xl font-medium shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all">
              Join Current Session
            </button>
            <button className="bg-surface-container-low text-primary px-6 py-3 rounded-xl font-medium border border-outline-variant/50 hover:bg-surface-container-lowest transition-all">
              View Schedule
            </button>
          </div>
        </div>
      </div>

      {/* Grid Highlights */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* Therapist Spotlight */}
        <div className="col-span-1 md:col-span-2 bg-surface-container-low/50 backdrop-blur-sm border border-outline-variant/20 rounded-3xl p-8 relative group">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-heading font-normal text-foreground">Curated Specialist</h3>
            <button className="text-xs font-bold uppercase tracking-widest text-primary/60 hover:text-primary transition-colors flex items-center group">
              View Profile <ArrowRight className="w-3 h-3 ml-1 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
          
          <div className="bg-surface-container-lowest rounded-2xl p-6 border border-outline-variant/20 flex flex-col md:flex-row items-center justify-between gap-6 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-5">
              <div className="w-16 h-16 rounded-2xl bg-primary-container/20 border border-primary/10 flex items-center justify-center text-primary font-bold overflow-hidden shadow-inner">
                <Image 
                  src="https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=200&h=200" 
                  alt="Specialist"
                  width={64}
                  height={64}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="text-left">
                <h4 className="text-foreground font-heading font-medium text-lg">Dr. Sarah Jenkins</h4>
                <p className="text-sm text-muted-foreground font-medium">Clinical Psychotherapist • 12+ years</p>
              </div>
            </div>
            <div className="text-center md:text-right">
              <p className="text-foreground font-semibold text-sm">Today, 3:00 PM</p>
              <p className="text-[10px] text-muted-foreground uppercase tracking-widest mt-1">Virtual Sanctuary</p>
            </div>
            <button className="px-6 py-2.5 bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground text-sm font-bold rounded-xl transition-all">
              Details
            </button>
          </div>
        </div>

        {/* Wellness Pulse */}
        <div className="bg-surface-container-lowest border border-outline-variant/20 rounded-3xl p-8 flex flex-col justify-between shadow-sm relative overflow-hidden group">
          <div className="absolute bottom-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-2xl z-0 pointer-events-none" />
          <div className="flex items-center justify-between z-10">
             <h3 className="text-lg font-heading font-normal text-foreground">Wellness Score</h3>
             <Activity className="w-5 h-5 text-primary/40 group-hover:text-primary transition-colors duration-500" />
          </div>
          <div className="flex-1 flex flex-col items-center justify-center py-6 z-10">
            <div className="text-7xl font-heading font-normal text-primary drop-shadow-sm">
              86
            </div>
            <p className="text-sm font-medium text-muted-foreground mt-4 flex items-center gap-1">
              <span className="text-primary">+4 points</span> since last week
            </p>
          </div>
          <div className="h-1.5 w-full bg-surface-container-low rounded-full overflow-hidden z-10">
            <div className="h-full w-[86%] bg-primary rounded-full animate-pulse" />
          </div>
        </div>

      </div>
    </div>
  );
}
