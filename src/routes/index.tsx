import { createFileRoute } from "@tanstack/react-router";
import { Navbar } from "@/components/landing/Navbar";
import { Hero } from "@/components/landing/Hero";
import { Features } from "@/components/landing/Features";
import { Templates } from "@/components/landing/Templates";
import { Testimonials } from "@/components/landing/Testimonials";
import { Pricing } from "@/components/landing/Pricing";
import { FAQ } from "@/components/landing/FAQ";
import { CTA } from "@/components/landing/CTA";
import { Footer } from "@/components/landing/Footer";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Vogats CV — AI Resume Builder that lands interviews" },
      {
        name: "description",
        content:
          "Build a recruiter-ready, ATS-optimized resume in minutes with Vogats CV. Vogats AI writes it, scores it, and tailors it to every job. Free to start.",
      },
      { property: "og:title", content: "Vogats CV — AI Resume Builder" },
      { property: "og:description", content: "Vogats AI-written, ATS-optimized resumes in minutes with Vogats CV." },
      { property: "og:type", content: "website" },
    ],
  }),
  component: LandingPage,
});

import { useEffect } from "react";

function LandingPage() {
  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
        }
      });
    }, { threshold: 0.1 });

    document.querySelectorAll('[data-scroll-reveal]').forEach(el => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <div className="min-h-screen bg-bg text-text scroll-smooth">
      <Navbar />
      <main>
        <div data-scroll-reveal><Hero /></div>
        <div data-scroll-reveal><Features /></div>
        <div data-scroll-reveal><Templates /></div>
        <div data-scroll-reveal><Testimonials /></div>
        <div data-scroll-reveal><Pricing /></div>
        <div data-scroll-reveal><FAQ /></div>
        <div data-scroll-reveal><CTA /></div>
      </main>
      <Footer />
    </div>
  );
}
