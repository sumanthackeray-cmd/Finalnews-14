import { TemplateThumb } from "@/components/resume/TemplateThumb";
import { useNavigate } from "@tanstack/react-router";
import { ArrowUpRight, ChevronLeft, ChevronRight } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

// ALL templates sorted by popularity (most used first).
// This order auto-reflects "top popular templates" — update pop values to reprioritize.
const ALL_TEMPLATES = [
  { id: "modern",    name: "Modern Classic",    tag: "Professional", pop: 120000, accent: "from-blue-500/15 to-indigo-500/15" },
  { id: "classic",   name: "Classic Slate",     tag: "Professional", pop: 105000, accent: "from-slate-500/15 to-blue-500/15" },
  { id: "saurabh",   name: "Saurabh Sidebar",   tag: "Creative",     pop: 95000,  accent: "from-cyan-500/15 to-indigo-500/15" },
  { id: "turquoise", name: "Turquoise Sidebar", tag: "Creative",     pop: 88000,  accent: "from-teal-500/15 to-cyan-500/15" },
  { id: "minimal",   name: "Minimalist",        tag: "Minimal",      pop: 92000,  accent: "from-gray-400/15 to-zinc-500/15" },
  { id: "creative",  name: "Creative Dark",     tag: "Creative",     pop: 85000,  accent: "from-violet-500/15 to-purple-500/15" },
  { id: "designer",  name: "Designer Pro",      tag: "Creative",     pop: 74000,  accent: "from-pink-500/15 to-rose-500/15" },
  { id: "watson",    name: "Watson Standard",   tag: "Professional", pop: 63000,  accent: "from-blue-500/15 to-cyan-500/15" },
  { id: "avery",     name: "Avery Clean",       tag: "Professional", pop: 67000,  accent: "from-emerald-500/15 to-green-500/15" },
  { id: "slater",    name: "Slater Bold",       tag: "Creative",     pop: 58000,  accent: "from-purple-500/15 to-blue-500/15" },
  { id: "sophia",    name: "Sophia Grace",      tag: "Editorial",    pop: 51000,  accent: "from-amber-500/15 to-orange-500/15" },
] as const;

// Sort by popularity (highest first) — this makes "top popular" always come first
const SORTED_TEMPLATES = [...ALL_TEMPLATES].sort((a, b) => b.pop - a.pop);

const DESKTOP_PER_SLIDE = 3;
const MOBILE_PER_SLIDE = 2;
const AUTO_INTERVAL_MS = 4000;

export function Templates() {
  const navigate = useNavigate();
  const [page, setPage] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const [paused, setPaused] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Detect mobile/desktop
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 640);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  const perSlide = isMobile ? MOBILE_PER_SLIDE : DESKTOP_PER_SLIDE;
  const totalPages = Math.ceil(SORTED_TEMPLATES.length / perSlide);

  const goNext = useCallback(() => {
    setPage((p) => (p + 1) % totalPages);
  }, [totalPages]);

  const goPrev = useCallback(() => {
    setPage((p) => (p - 1 + totalPages) % totalPages);
  }, [totalPages]);

  // Auto-advance
  useEffect(() => {
    if (paused) return;
    timerRef.current = setInterval(goNext, AUTO_INTERVAL_MS);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [goNext, paused]);

  // Reset page when perSlide changes (resize)
  useEffect(() => {
    setPage(0);
  }, [perSlide]);

  const pagesArray = [];
  for (let i = 0; i < SORTED_TEMPLATES.length; i += perSlide) {
    pagesArray.push(SORTED_TEMPLATES.slice(i, i + perSlide));
  }

  return (
    <section id="templates" className="relative py-16 md:py-24 overflow-hidden bg-surface/20">
      {/* Background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[radial-gradient(circle_at_center,rgba(99,102,241,0.04)_0,transparent_70%)] -z-10" />

      <div className="container mx-auto max-w-7xl px-6">

        {/* Section header */}
        <div className="flex flex-col items-center text-center mb-14">
          <h2 className="text-gradient font-display text-sm font-bold uppercase tracking-[0.3em] mb-4">
            Curated Templates
          </h2>
          <h3 className="font-display text-4xl font-bold tracking-tight md:text-6xl text-balance mb-6">
            Designed by humans. <br />
            <span className="opacity-60 italic text-muted">Optimized by Vogats AI.</span>
          </h3>
          <p className="max-w-2xl text-muted font-medium text-lg">
            Every template is ATS-friendly and visually stunning. 
            Swap styles instantly without losing a single word.
          </p>
        </div>

        {/* Carousel Wrapper with horizontal sliding track */}
        <div
          className="relative group/carousel overflow-visible"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
          onTouchStart={() => setPaused(true)}
          onTouchEnd={() => setPaused(false)}
        >
          {/* Outer track wrapper containing full width layout hidden overflow */}
          <div className="overflow-hidden rounded-[2rem] p-2 -m-2">
            <div
              className="flex transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]"
              style={{ transform: `translate3d(-${page * 100}%, 0, 0)` }}
            >
              {pagesArray.map((pageTemplates, pageIdx) => (
                <div 
                  key={pageIdx} 
                  className="w-full shrink-0 grid gap-6"
                  style={{ gridTemplateColumns: `repeat(${perSlide}, minmax(0, 1fr))` }}
                >
                  {pageTemplates.map((t) => (
                    <div key={t.id} className="group relative">
                      <div
                        className={`relative p-1 rounded-[2rem] bg-gradient-to-br ${t.accent} border border-border/50 shadow-2xl transition-all duration-500 hover:scale-[1.03] hover:-rotate-1 cursor-pointer overflow-hidden group-hover:shadow-[0_20px_50px_rgba(99,102,241,0.15)]`}
                        onClick={() => navigate({ to: "/dashboard", search: { template: t.id } })}
                      >
                        {/* Hover CTA overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-bg/95 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10 flex items-end justify-center pb-8">
                          <button className="btn-premium px-7 py-3 rounded-full flex items-center gap-2 text-sm shadow-xl hover:scale-105 transition-transform duration-200">
                            Use Template <ArrowUpRight className="h-4 w-4" />
                          </button>
                        </div>

                        {/* Popularity badge */}
                        <div className="absolute top-4 right-4 z-20 bg-black/60 backdrop-blur-md text-white text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full border border-white/10 shadow-sm">
                          🔥 {(t.pop / 1000).toFixed(0)}K uses
                        </div>

                        <TemplateThumb
                          templateId={t.id}
                          className="rounded-[1.8rem] w-full transform transition-transform duration-700 group-hover:scale-105"
                        />
                      </div>

                      <div className="mt-5 flex items-center justify-between px-2">
                        <div>
                          <h4 className="font-display text-xl font-bold transition-colors group-hover:text-accent">{t.name}</h4>
                          <p className="text-xs uppercase tracking-[0.2em] text-muted font-bold mt-0.5">{t.tag}</p>
                        </div>
                        <div className="h-1 w-10 rounded-full bg-border group-hover:w-20 group-hover:bg-accent transition-all duration-500" />
                      </div>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>

          {/* Prev / Next navigation buttons */}
          <button
            onClick={() => { goPrev(); setPaused(true); }}
            aria-label="Previous templates"
            className="absolute -left-6 top-1/2 -translate-y-1/2 w-12 h-12 bg-card/90 dark:bg-card/75 backdrop-blur-md border border-border/80 rounded-full flex items-center justify-center shadow-xl hover:bg-accent hover:text-white hover:border-accent transition-all duration-300 hover:scale-110 active:scale-95 z-20 hidden sm:flex cursor-pointer"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            onClick={() => { goNext(); setPaused(true); }}
            aria-label="Next templates"
            className="absolute -right-6 top-1/2 -translate-y-1/2 w-12 h-12 bg-card/90 dark:bg-card/75 backdrop-blur-md border border-border/80 rounded-full flex items-center justify-center shadow-xl hover:bg-accent hover:text-white hover:border-accent transition-all duration-300 hover:scale-110 active:scale-95 z-20 hidden sm:flex cursor-pointer"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>

        {/* Dot indicators */}
        <div className="flex items-center justify-center gap-2 mt-10">
          {Array.from({ length: totalPages }).map((_, i) => (
            <button
              key={i}
              onClick={() => { setPage(i); setPaused(true); }}
              aria-label={`Go to slide ${i + 1}`}
              className={`rounded-full transition-all duration-300 ${
                i === page
                  ? "w-8 h-2 bg-accent"
                  : "w-2 h-2 bg-border hover:bg-muted"
              }`}
            />
          ))}
        </div>

        {/* Mobile swipe hint */}
        <p className="text-center text-xs text-muted mt-4 sm:hidden">Tap arrows or dots to browse • Auto-slides every 4s</p>

        {/* CTA to /templates page */}
        <div className="flex justify-center mt-12">
          <button
            onClick={() => navigate({ to: "/templates" })}
            className="btn-premium px-10 py-4 font-bold text-sm tracking-wider flex items-center gap-2 group shadow-xl"
          >
            Explore All 10 Premium Templates
            <ArrowUpRight className="h-4 w-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
          </button>
        </div>

      </div>

      <style>{`
        @keyframes fadeU {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeU {
          animation: fadeU 0.4s ease both;
        }
      `}</style>
    </section>
  );
}
