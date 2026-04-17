import React from 'react';
import { Zap, CreditCard, LifeBuoy, TrendingUp } from 'lucide-react';

const stats = [
  { value: '0', label: 'Clinical Overhead', icon: <Zap className="w-6 h-6" /> },
  { value: 'Instant', label: 'Settlements', icon: <CreditCard className="w-6 h-6" /> },
  { value: '24/7', label: 'Clinical Support', icon: <LifeBuoy className="w-6 h-6" /> },
  { value: '10x', label: 'Practice Growth', icon: <TrendingUp className="w-6 h-6" /> },
];

export function StatsSection() {
  return (
    <section className="relative py-[80px] md:py-[120px] overflow-hidden bg-white">
      {/* Decorative Background Elements */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[80%] bg-[radial-gradient(circle,rgba(33,77,62,0.03)_0%,rgba(252,250,255,0)_70%)] -z-10"></div>
      
      <div className="container mx-auto px-6 md:px-8 max-w-[1200px]">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12">
          {stats.map((stat, idx) => (
            <div key={idx} className="group relative text-center">
              <div className="mb-6 inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-white shadow-[0_10px_30px_rgba(33,77,62,0.06)] border border-[rgba(33,77,62,0.05)] text-[var(--primary)] text-xl transition-all duration-500 group-hover:-translate-y-2 group-hover:bg-[var(--primary)] group-hover:text-white">
                {stat.icon}
              </div>
              
              <h3 className="text-4xl md:text-5xl font-cormorant font-bold text-[var(--primary)] mb-2 tracking-tight">
                {stat.value}
              </h3>
              
              <p className="text-[var(--text-light)] font-medium uppercase text-[10px] md:text-xs tracking-[0.15em]">
                {stat.label}
              </p>
              
              {/* Subtle line indicator */}
              <div className="mt-6 h-1 w-8 bg-[var(--primary)] mx-auto rounded-full opacity-10 group-hover:w-12 group-hover:opacity-40 transition-all duration-500"></div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
