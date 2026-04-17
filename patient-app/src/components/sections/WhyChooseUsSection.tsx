import React from "react";
import { AlexButton } from "@/components/ui/AlexButton";

const features = [
  {
    number: "01",
    title: "Verified Clinical Experts",
    description:
      "Access a curated network of certified professionals specialized in psychotherapy, counseling and psychological testing services.",
  },
  {
    number: "02",
    title: "Safe & 100% Confidential",
    description:
      "Your privacy is our core priority. We provide a secure digital sanctuary for your entire healing journey.",
  },
  {
    number: "03",
    title: "Evidence-Based Results",
    description:
      "Our specialists utilize scientifically proven and ethical therapeutic modalities tailored to modern recovery.",
  },
  {
    number: "04",
    title: "Unmatched Accessibility",
    description:
      "Convenient scheduling for both in-person clinic visits and high-fidelity, secure online consultations.",
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
              The Difference
            </span>
            <h2 className="text-4xl md:text-5xl font-cormorant font-medium text-[var(--text-dark)] leading-[1.1] mb-8">
              Why Choose <br />
              The <span className="italic">Blissful</span> Station?
            </h2>
            <p className="text-[var(--text-light)] text-lg mb-10 leading-relaxed">
              We combine clinical excellence with a compassionate, human-centric
              approach. Our station is dedicated to connecting you with the highest standards of mental well-being support.
            </p>
            <AlexButton
              href="/signup"
              size="md">
              Start Your Journey
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
