"use client";

import React, { useState } from "react";
import { AlexButton } from "@/components/ui/AlexButton";
import { FileText, Video, LayoutDashboard, History, Bell, Calendar, Shield, CreditCard, Users } from "lucide-react";

const features = [
  {
    icon: <FileText className="w-10 h-10" />,
    title: "Automated Intake",
    description:
      "Digital forms and clinical screening assessments are automatically collected and summarized before the first session.",
  },
  {
    icon: <Video className="w-10 h-10" />,
    title: "Secure Video",
    description:
      "Fully encrypted, high-definition clinical video consultations integrated directly into your provider workspace.",
  },
  {
    icon: <LayoutDashboard className="w-10 h-10" />,
    title: "Financial Dashboard",
    description:
      "Real-time tracking of earnings, pending settlements, and automated billing workflows for your entire practice.",
  },
  {
    icon: <History className="w-10 h-10" />,
    title: "Clinical History",
    description:
      "Secure, long-term storage of patient notes and treatment history with structured recovery tracking.",
  },
  {
    icon: <Bell className="w-10 h-10" />,
    title: "Smart Notifications",
    description:
      "Real-time alerts for new bookings, message updates, and clinical reminders to keep your practice responsive.",
  },
  {
    icon: <Calendar className="w-10 h-10" />,
    title: "Schedule Master",
    description:
      "Flexible availability management with automated time-slot locking and appointment synchronization.",
  },
  {
    icon: <Shield className="w-10 h-10" />,
    title: "Ethical Guardrails",
    description:
      "Built-in communication boundaries and status-aware messaging to protect your work-life balance.",
  },
  {
    icon: <CreditCard className="w-10 h-10" />,
    title: "Instant Settlement",
    description:
      "Automated payment collection and predictable settlement cycles directly to your registered account.",
  },
  {
    icon: <Users className="w-10 h-10" />,
    title: "Specialist Network",
    description:
      "Join a curated community of ethical clinical experts and gain visibility in our verified marketplace.",
  },
];

export function ServicesSection() {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <section
      id="services"
      className="bg-[#F8FAF9] py-[100px] md:py-[140px]">
      <div className="container mx-auto px-6 md:px-8 max-w-[1200px]">
        <div className="text-center max-w-[600px] mx-auto mb-10 md:mb-16">
          <h2 className="text-3xl md:text-4xl font-cormorant font-semibold text-[var(--primary)] mb-4">
            Practice Management Suite
          </h2>
          <p className="text-[var(--text-light)]">
            Every tool you need to run a modern, ethical, and thriving clinical practice—all within a single digital sanctuary.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, idx) => (
            <div
              key={idx}
              className={`bg-white p-10 rounded-[25px] transition-all duration-400 border border-[rgba(33,77,62,0.05)] shadow-[0_5px_15px_rgba(33,77,62,0.02)] hover:border-[var(--accent)] hover:shadow-[0_10px_40px_rgba(33,77,62,0.08)] hover:-translate-y-2.5 group ${
                !isExpanded && idx >= 3 ? "hidden md:block" : "block"
              }`}>
              <div className="text-[var(--primary)] mb-6 block transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6">
                {feature.icon}
              </div>
              <h3 className="font-cormorant font-semibold text-2xl text-[var(--primary)] mb-4">
                {feature.title}
              </h3>
              <p className="text-[var(--text-light)]">{feature.description}</p>
            </div>
          ))}
        </div>

        <div className="mt-8 flex justify-center md:hidden">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-[var(--primary)] font-medium border-b border-[var(--primary)] pb-0.5 hover:text-[var(--accent)] hover:border-[var(--accent)] transition-colors">
            {isExpanded ? "Show Less" : "View All Features"}
          </button>
        </div>

        <div className="mt-12 md:mt-16 flex justify-center">
          <AlexButton
            href="/signup"
            size="md">
            Join the Sanctuary
          </AlexButton>
        </div>
      </div>
    </section>
  );
}
