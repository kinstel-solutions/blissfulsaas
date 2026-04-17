'use client';

import React, { useRef, useEffect } from 'react';

const testimonials = [
  { text: '"The Blissful Station has transformed how I manage my practice. The intake flows and automated billing save me hours every week, allowing me to focus entirely on patient care."', name: 'Dr. Aruna' },
  { text: '"Finally, a platform that respects the clinical process. The design is calm, and the tools are rigorous. It\'s the digital sanctuary my practice needed."', name: 'Dr. Sameer' },
  { text: '"The verified marketplace has brought me high-alignment patients who are truly ready for the work. The quality of connection here is unmatched."', name: 'Dr. Priya' },
  { text: '"Seamless transitions between video consultations and session notes. The interface is intuitive and reduces the cognitive load of practice management."', name: 'Dr. Vikram' },
  { text: '"As a clinical psychologist, I value the ethical boundaries built into the system. The notification and boundary tools are game-changers."', name: 'Dr. Neha' },
];

const doubled = [...testimonials, ...testimonials];

function ReviewCard({ t }: { t: typeof testimonials[0] }) {
  return (
    <div className="shrink-0 bg-[#F8FAF9] p-7 rounded-[24px] flex flex-col gap-4 border border-[rgba(33,77,62,0.05)] shadow-[0_5px_30px_rgba(0,0,0,0.04)]"
      style={{ width: '300px' }}>
      <div className="text-yellow-400 text-lg tracking-widest">★★★★★</div>
      <p className="italic text-[0.93rem] leading-relaxed text-[var(--text-dark)] flex-1">{t.text}</p>
      <div className="border-t border-[rgba(33,77,62,0.08)] pt-4 flex items-center gap-3">
        <div className="w-9 h-9 rounded-full bg-[var(--secondary)] flex items-center justify-center text-[var(--primary)] font-bold font-cormorant text-lg flex-shrink-0">
          {t.name[0]}
        </div>
        <div>
          <strong className="block font-cormorant text-[var(--primary)] text-base font-semibold">{t.name}</strong>
          <span className="text-[0.78rem] text-[var(--text-light)]">Verified Provider</span>
        </div>
      </div>
    </div>
  );
}

export function TestimonialsSection() {
  const mobileRef = useRef<HTMLDivElement>(null);
  const isTouching = useRef(false);
  const resumeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const el = mobileRef.current;
    if (!el) return;

    const step = 0.5; // px per tick

    const interval = setInterval(() => {
      if (!isTouching.current && el) {
        el.scrollLeft += step;
        // Seamless loop: reset at halfway point
        if (el.scrollLeft >= el.scrollWidth / 2) {
          el.scrollLeft = 0;
        }
      }
    }, 16); // ~60fps

    return () => {
      clearInterval(interval);
      if (resumeTimer.current) clearTimeout(resumeTimer.current);
    };
  }, []);

  const handleTouchStart = () => {
    isTouching.current = true;
    if (resumeTimer.current) clearTimeout(resumeTimer.current);
  };

  const handleTouchEnd = () => {
    // Resume auto-scroll after 2s of inactivity
    resumeTimer.current = setTimeout(() => {
      isTouching.current = false;
    }, 2000);
  };

  return (
    <section id="testimonials" className="bg-white py-[60px] md:py-[100px] overflow-hidden">
      {/* Header */}
      <div className="text-center max-w-[600px] mx-auto mb-10 md:mb-16 px-6 md:px-8">
        <h2 className="text-3xl md:text-4xl font-cormorant font-semibold text-[var(--primary)] mb-3 md:mb-4">
          Provider Success Stories
        </h2>
        <p className="text-[var(--text-light)]">
          Join hundreds of clinical experts who have elevated their practice with Blissful Station.
        </p>
        <div className="flex items-center justify-center gap-2 mt-4">
          <span className="text-yellow-400 text-xl">★★★★★</span>
          <span className="font-semibold text-[var(--primary)]">5.0</span>
          <span className="text-[var(--text-light)] text-sm">· Platform Rating</span>
        </div>
      </div>

      {/* ── MOBILE: JS auto-scroll + manual swipe ─────────────────── */}
      <div
        ref={mobileRef}
        className="md:hidden flex gap-5 px-6 overflow-x-auto pb-3"
        style={{ scrollbarWidth: 'none', WebkitOverflowScrolling: 'touch' } as React.CSSProperties}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {doubled.map((t, idx) => <ReviewCard key={idx} t={t} />)}
      </div>

      {/* ── DESKTOP: CSS marquee ───────────────────────────────────── */}
      <div
        className="hidden md:flex gap-6 w-max animate-marquee"
        onMouseEnter={e => (e.currentTarget.style.animationPlayState = 'paused')}
        onMouseLeave={e => (e.currentTarget.style.animationPlayState = 'running')}
      >
        {doubled.map((t, idx) => <ReviewCard key={idx} t={t} />)}
      </div>
    </section>
  );
}
