"use client";

import React, { useState } from "react";
import { AlexButton } from "@/components/ui/AlexButton";
import { CloudRain, Brain, ClipboardCheck, Compass, Infinity, Baby, Zap, MessageSquare, Heart, ChevronDown } from "lucide-react";

const services = [
  {
    icon: <CloudRain className="w-10 h-10" />,
    title: "Depression",
    description:
      "Compassionate, evidence-based care to help you rediscover joy and meaning in everyday life.",
  },
  {
    icon: <Brain className="w-10 h-10" />,
    title: "Anxiety",
    description:
      "Practical tools and therapy to manage anxious thoughts, panic, and overthinking effectively.",
  },
  {
    icon: <ClipboardCheck className="w-10 h-10" />,
    title: "Psychological Testing",
    description:
      "Comprehensive psychological assessments to understand cognitive abilities, personality traits, and emotional well-being.",
  },
  {
    icon: <Compass className="w-10 h-10" />,
    title: "Career Counseling",
    description:
      "Guidance and support to help you make informed decisions about your career path and professional growth.",
  },
  {
    icon: <Infinity className="w-10 h-10" />,
    title: "Neurodivergence",
    description:
      "Evidence-based therapy and counseling for neurodivergent individuals including ADHD and Autism Spectrum Disorder.",
  },
  {
    icon: <Baby className="w-10 h-10" />,
    title: "Child Therapy",
    description:
      "Specialized psychological support for children and adolescents navigating emotional challenges.",
  },
  {
    icon: <Zap className="w-10 h-10" />,
    title: "Trauma",
    description:
      "Trauma-informed therapy to help you process difficult experiences and reclaim a sense of safety.",
  },
  {
    icon: <MessageSquare className="w-10 h-10" />,
    title: "CBT",
    description:
      "Cognitive Behavioral Therapy to identify and reshape unhelpful thought patterns and behaviors.",
  },
  {
    icon: <Heart className="w-10 h-10" />,
    title: "Relationships",
    description:
      "Helping individuals, couples and families build healthier connection, boundaries and communication.",
  },
];

function ServiceCard({ service }: { service: any }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div
      onClick={() => setIsOpen(!isOpen)}
      className="bg-white p-6 md:p-8 rounded-[25px] transition-all duration-300 border border-[rgba(33,77,62,0.05)] shadow-[0_5px_15px_rgba(33,77,62,0.02)] hover:border-[var(--accent)] hover:shadow-[0_10px_40px_rgba(33,77,62,0.08)] hover:-translate-y-1 cursor-pointer flex flex-col group select-none"
    >
      {/* 
      <div className="text-[var(--primary)] mb-6 block transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6">
        {service.icon}
      </div> 
      */}

      <div className="flex justify-between items-center w-full">
        <h3 className="font-cormorant font-semibold text-xl md:text-2xl text-[var(--primary)]">
          {service.title}
        </h3>
        <span className={`text-[var(--primary)] transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`}>
          <ChevronDown className="w-5 h-5" />
        </span>
      </div>

      <div className={`grid transition-all duration-300 ease-in-out ${isOpen ? "grid-rows-[1fr] opacity-100 mt-4" : "grid-rows-[0fr] opacity-0"}`}>
        <div className="overflow-hidden">
          <p className="text-[var(--text-light)] text-sm md:text-base leading-relaxed">
            {service.description}
          </p>
        </div>
      </div>
    </div>
  );
}

export function ServicesSection() {
  return (
    <section id="services" className="bg-[#F8FAF9] py-[100px] md:py-[140px]">
      <div className="container mx-auto px-6 md:px-8 max-w-[1200px]">
        <div className="text-center max-w-[600px] mx-auto mb-10 md:mb-16">
          <h2 className="text-3xl md:text-4xl font-cormorant font-semibold text-[var(--primary)] mb-4">
            Curated Specialized Care
          </h2>
          <p className="text-[var(--text-light)]">
            Our network offers a wide range of psychological therapy and counseling
            services, tailored to your unique needs across the globe and online.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service, idx) => (
            <ServiceCard key={idx} service={service} />
          ))}
        </div>

        <div className="mt-12 md:mt-16 flex justify-center">
          <AlexButton
            href="/discover"
            size="md">
            Find Your Specialist
          </AlexButton>
        </div>
      </div>
    </section>
  );
}
