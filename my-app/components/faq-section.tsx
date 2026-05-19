"use client";

import { useState } from "react";

interface FAQItem {
  question: string;
  answer: string;
}

const faqItems: FAQItem[] = [
  {
    question: "Who owns the ideas I submit?",
    answer:
      "You retain attribution (your name on the idea), but ideas are open by default. Anyone can build on your idea without asking permission. This is by design — we want to increase execution, not block ideas with ownership barriers.",
  },
  {
    question: "Can multiple teams build the same idea?",
    answer:
      "Yes, absolutely. Multiple independent builders can start their own implementations of the same idea. Each team gets full credit for their specific build, and the original idea giver is credited by default on every implementation.",
  },
  {
    question: "Is this really free?",
    answer:
      "Yes, 100% free. No paid plans, no hidden fees, no premium tier. We're focused on building a community of builders, not monetization. Free now, free forever for the MVP.",
  },
  {
    question: "Can beginners join?",
    answer:
      "Yes! We welcome builders of all skill levels. The AI categorizes each idea by difficulty (Beginner, Intermediate, Expert), so you can filter and find projects matching your skill level. You can also join existing builds as a teammate to learn from experienced developers.",
  },
  {
    question: "How does AI scoring work?",
    answer:
      "Every idea gets analyzed for quality score (0-10), difficulty level, required skills, project tags, market alternatives, worthiness review, feasibility analysis, and improvement suggestions. The AI never rewrites your idea — it scores and suggests, never replaces.",
  },
];

export function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section className="mt-16">
      <h2 className="font-heading text-2xl text-ink">Frequently asked questions</h2>
      <div className="mt-6 space-y-0">
        {faqItems.map((item, index) => (
          <div key={index} className="border-b border-border">
            <button
              type="button"
              onClick={() => setOpenIndex(openIndex === index ? null : index)}
              className="flex w-full items-center justify-between py-4 text-left"
            >
              <span className="font-heading text-lg text-ink">{item.question}</span>
              <span className="ml-4 text-muted-foreground">
                {openIndex === index ? "−" : "+"}
              </span>
            </button>
            {openIndex === index && (
              <div className="pb-5 text-muted-foreground">{item.answer}</div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}