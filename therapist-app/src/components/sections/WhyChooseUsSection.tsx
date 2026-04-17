import React from "react";
import { AlexButton } from "@/components/ui/AlexButton";

const features = [
  {
    number: "01",
    title: "Ethical Autonomy",
    description:
      "Run your practice your way. We provide the tools, but you maintain complete clinical control over your sessions and treatment plans.",
  },
  {
    number: "02",
    title: "Integrated Clinical Stack",
    description:
      "A seamless transition between intake, session notes, secure video, and automated billing. No more fragmented tools.",
  },
  {
    number: "03",
    title: "Verified Marketplace Growth",
    description:
      "Gain visibility in our highly trusted network of clinical experts. We handle the SEO and discovery for your practice.",
  },
  {
    number: "04",
    title: "Curated Specialist Community",
    description:
      "Join a peer-reviewed community of ethical clinical experts. Collaborate and grow within a sanctuary of clinical excellence.",
  },
];

export function WhyChooseUsSection() {
  return (
    <section id="why-choose-us" className="bg-white py-[100px] md:py-[140px] relative overflow-hidden">
      {/* Decorative corner element */}
      <div className="absolute -bottom-20 -left-20 w-[40vw] h-[40vw] bg-[radial-gradient(circle,rgba(33,77,62,0.02)_0%,rgba(252,250,255,0)_70%)] -z-0"></div>

      <div className="container mx-auto px-6 md:px-8 max-w-[1200px] relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">
          <div className="lg:col-span-4 lg:sticky lg:top-32">
            <span className="text-[var(--primary)] font-bold text-xs uppercase tracking-[0.2em] mb-4 block">
              The Platform
            </span>
            <h2 className="text-4xl md:text-5xl font-cormorant font-medium text-[var(--text-dark)] leading-[1.1] mb-8">
              Why Partner with <br />
              The <span className="italic">Blissful</span> Station?
            </h2>
            <p className="text-[var(--text-light)] text-lg mb-10 leading-relaxed">
              We provide the clinical rigor of a dedicated institution with the flexibility of a modern marketplace. Join the standard for ethical therapy.
            </p>
            <AlexButton
              href="/signup"
              size="md">
              Apply to Join
            </AlexButton>
          </div>

          <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-16">
            {features.map((feature, idx) => (
              <div
                key={idx}
                className="group relative">
                <div className="mb-6 flex items-baseline gap-4">
                  <span className="text-4xl md:text-5xl font-cormorant font-light text-[rgba(33,77,62,0.15)] group-hover:text-[rgba(33,77,62,0.3)] transition-colors duration-500">
                    {feature.number}
                  </span>
                  <div className="h-px flex-1 bg-[rgba(33,77,62,0.1)] group-hover:bg-[var(--primary)] transition-colors duration-500"></div>
                </div>
                <h3 className="text-xl font-outfit font-semibold text-[var(--primary)] mb-4">
                  {feature.title}
                </h3>
                <p className="text-[var(--text-light)] leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
