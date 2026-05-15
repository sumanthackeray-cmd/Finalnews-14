import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles, Star } from "lucide-react";
import { Link } from "@tanstack/react-router";
import heroImg from "@/assets/hero-resume.jpg";

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-hero-glow grain">
      <div className="container mx-auto max-w-7xl px-6 pb-24 pt-16 md:pb-32 md:pt-24">
        <div className="mx-auto flex max-w-3xl flex-col items-center text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-card/60 px-3 py-1 text-xs font-medium text-muted-foreground backdrop-blur">
            <Sparkles className="h-3 w-3 text-coral" />
            Powered by Lovable AI · GPT-5 & Gemini
          </div>
          <h1 className="font-display text-5xl font-semibold leading-[1.05] tracking-tight text-balance md:text-7xl">
            The resume that
            <span className="relative mx-2 inline-block italic">
              <span className="relative z-10 text-coral">writes itself</span>
              <span className="absolute -bottom-1 left-0 right-0 h-3 -rotate-1 bg-coral-soft/60" aria-hidden />
            </span>
            and lands the interview.
          </h1>
          <p className="mt-6 max-w-xl text-lg text-muted-foreground text-balance">
            Build a recruiter-ready, ATS-optimized resume in minutes. AI writes it,
            scores it, and tailors it to every job — you just hit export.
          </p>
          <div className="mt-10 flex flex-col items-stretch sm:items-center gap-3 sm:flex-row w-full sm:w-auto">
            <Link to="/dashboard" className="w-full sm:w-auto">
              <Button variant="coral" size="xl" className="group w-full sm:w-auto min-h-12">
                Build my resume
                <ArrowRight className="transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
            <a href="#templates" className="w-full sm:w-auto">
              <Button variant="ghost" size="xl" className="rounded-full w-full sm:w-auto min-h-12">
                See templates
              </Button>
            </a>
          </div>
          <div className="mt-8 flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} className="h-4 w-4 fill-coral text-coral" />
              ))}
            </div>
            <span>Loved by 12,000+ job seekers</span>
          </div>
        </div>

        <div className="relative mx-auto mt-20 max-w-5xl">
          <div className="absolute -inset-8 -z-10 rounded-[3rem] bg-gradient-coral opacity-20 blur-3xl" />
          <div className="overflow-hidden rounded-3xl border border-border bg-ink shadow-elegant">
            <img
              src={heroImg}
              alt="AI-generated resume preview floating against an editorial dark background"
              width={1536}
              height={1024}
              className="h-auto w-full object-cover"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
