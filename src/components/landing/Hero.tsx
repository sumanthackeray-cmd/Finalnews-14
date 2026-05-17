import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles, Star, ShieldCheck, Zap } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { useAuth } from "@/hooks/use-auth";
import heroImg from "@/assets/hero-resume.jpg";

export function Hero() {
  const { user } = useAuth();

  return (
    <section className="relative pt-12 pb-10 md:pt-20 md:pb-12 overflow-hidden min-h-[85vh] flex flex-col items-center justify-center">
      {/* Background Orbs */}
      <div className="absolute top-0 left-1/4 w-[300px] h-[300px] md:w-[500px] md:h-[500px] bg-accent/10 rounded-full blur-[80px] md:blur-[120px] -z-10 animate-pulse-slow" />
      <div className="absolute bottom-0 right-1/4 w-[250px] h-[250px] md:w-[400px] md:h-[400px] bg-accent-secondary/10 rounded-full blur-[70px] md:blur-[100px] -z-10 animate-pulse-slow delay-700" />
      
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 relative z-10">
        <div className="mx-auto flex max-w-5xl flex-col items-center text-center">
          <div className="mb-6 md:mb-8 inline-flex items-center gap-2 rounded-full border border-border bg-surface/40 backdrop-blur-md px-3 py-1 sm:px-4 sm:py-1.5 text-[9px] sm:text-[10px] font-bold uppercase tracking-widest text-muted-foreground animate-in slide-in-from-top-4 duration-700">
            <div className="flex h-4 w-4 sm:h-5 sm:w-5 items-center justify-center rounded-full bg-accent/20">
              <Sparkles className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-accent" />
            </div>
            <span>Vogats AI · Smartest Resume Builder 2026</span>
          </div>
          
          <h1 className="font-display text-4xl sm:text-5xl font-bold leading-[1.1] tracking-tight text-balance md:text-8xl md:leading-[1.05] mb-6 md:mb-8 text-text animate-in slide-in-from-top-6 duration-1000">
            Your career story, <br />
            <span className="text-gradient">redefined by AI.</span>
          </h1>
          
          <p className="max-w-2xl text-base md:text-xl text-muted font-medium text-balance mb-10 md:mb-12 leading-relaxed opacity-90 animate-in slide-in-from-top-8 duration-1000">
            Build a high-performance, recruiter-ready resume in minutes. 
            Vogats AI writes, scores, and optimizes your data for maximum impact.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto animate-in fade-in zoom-in duration-1000">
            <Link to={user ? "/dashboard" : "/auth"} className="w-full sm:w-auto">
              <button className="btn-premium w-full sm:w-auto px-8 md:px-10 py-4 md:py-5 text-base md:text-lg font-bold shadow-2xl group overflow-hidden relative">
                <span className="relative z-10 flex items-center justify-center gap-3">
                  Build my resume
                  <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                </span>
                <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-500 ease-in-out" />
              </button>
            </Link>
            <a href="#templates" className="w-full sm:w-auto">
              <button className="w-full sm:w-auto px-8 md:px-10 py-4 md:py-5 rounded-2xl text-base md:text-lg font-bold text-text hover:bg-surface/80 transition-all border border-border bg-surface/30 backdrop-blur-sm">
                View Templates
              </button>
            </a>
          </div>
          
          <div className="mt-10 md:mt-12 flex flex-wrap items-center justify-center gap-4 md:gap-8 text-muted animate-in fade-in duration-1000 delay-500">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-accent" />
              <span className="text-[10px] md:text-xs font-semibold uppercase tracking-wider">ATS Optimized</span>
            </div>
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-accent-secondary" />
              <span className="text-[10px] md:text-xs font-semibold uppercase tracking-wider">One-Click Export</span>
            </div>
            <div className="flex items-center gap-2">
              <Star className="h-4 w-4 text-amber-400" />
              <span className="text-[10px] md:text-xs font-semibold uppercase tracking-wider">4.9/5 Rating</span>
            </div>
          </div>

          <div className="relative mx-auto mt-12 md:mt-16 max-w-5xl group px-2 sm:px-0 perspective-1000">
            <div className="absolute -inset-10 -z-10 rounded-[3rem] bg-accent/20 opacity-0 blur-3xl group-hover:opacity-100 transition-opacity duration-1000" />
            <div className="overflow-hidden rounded-2xl md:rounded-3xl border border-border bg-surface/50 shadow-2xl backdrop-blur-sm transform transition-all duration-700 group-hover:scale-[1.02] group-hover:rotate-x-2 group-hover:rotate-y-2 group-hover:shadow-accent/20 animate-float">
              <img
                src={heroImg}
                alt="AI-generated resume preview"
                width={1536}
                height={1024}
                className="h-auto w-full object-cover opacity-90 transition-opacity group-hover:opacity-100"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-bg via-transparent to-transparent opacity-40" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
