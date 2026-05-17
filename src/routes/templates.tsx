import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState, useMemo } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Footer";
import { TemplateThumb } from "@/components/resume/TemplateThumb";
import {
  Sparkles, LayoutGrid, ShieldCheck, FileDown,
  ArrowRight, ChevronDown, Search, X
} from "lucide-react";

export const Route = createFileRoute("/templates")({
  head: () => ({
    meta: [
      { title: "Resume Templates — Vogats CV" },
      { name: "description", content: "Explore 10 ATS-optimized, AI-ready resume templates. Fully editable, PDF & Word export." },
    ],
  }),
  component: TemplatesPage,
});

/* ─── Data ──────────────────────────────────────────────────── */
const TEMPLATES = [
  { id: "modern",    name: "Modern Classic",    tag: "Professional", badge: "Free",    pop: 120000, desc: "Clean sidebar with soft accents. Corporate, finance & tech favourite." },
  { id: "classic",   name: "Classic Slate",     tag: "Professional", badge: "Free",    pop: 105000, desc: "Timeless elegance favoured by recruiters worldwide." },
  { id: "minimal",   name: "Minimalist",        tag: "Minimal",      badge: "Free",    pop: 92000,  desc: "Ultra-clean single column — let your work do the talking." },
  { id: "turquoise", name: "Turquoise Sidebar", tag: "Creative",     badge: "Hot 🔥",  pop: 88000,  desc: "Vibrant teal two-column layout with gradient header panels." },
  { id: "creative",  name: "Creative Dark",     tag: "Creative",     badge: "New ✦",   pop: 85000,  desc: "Bold dark theme with gradients. Perfect for designers & PMs." },
  { id: "designer",  name: "Designer Pro",      tag: "Creative",     badge: "Pro",     pop: 74000,  desc: "Artistic grid format with premium visual systems." },
  { id: "avery",     name: "Avery Clean",       tag: "Professional", badge: "Pro",     pop: 67000,  desc: "Polished corporate layout for managers and senior engineers." },
  { id: "watson",    name: "Watson Standard",   tag: "Professional", badge: "Pro",     pop: 63000,  desc: "Double-column standard built for executive summaries." },
  { id: "slater",    name: "Slater Bold",       tag: "Creative",     badge: "Premium", pop: 58000,  desc: "High-contrast dark layout with striking technical accents." },
  { id: "sophia",    name: "Sophia Grace",      tag: "Executive",    badge: "Hot 🔥",  pop: 51000,  desc: "Exquisite serif structure for legal, academia & leadership." },
] as const;

const TAGS = ["All", "Professional", "Creative", "Minimal", "Executive"] as const;

const BADGE_STYLE: Record<string, string> = {
  "Free":    "bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border-emerald-500/30",
  "Pro":     "bg-accent/15 text-accent border-accent/30",
  "New ✦":  "bg-violet-500/15 text-violet-600 dark:text-violet-400 border-violet-500/30",
  "Premium": "bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30",
  "Hot 🔥": "bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/30",
};

/* ─── Reveal hook ────────────────────────────────────────────── */
function useReveal() {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); io.disconnect(); } },
      { threshold: 0.1 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return { ref, visible };
}

/* ─── Card ───────────────────────────────────────────────────── */
function TemplateCard({
  template, index, onUse,
}: {
  template: typeof TEMPLATES[number];
  index: number;
  onUse: (id: string, name: string) => void;
}) {
  const { ref, visible } = useReveal();
  const delay = (index % 3) * 80;

  return (
    <div
      ref={ref}
      className="group relative flex flex-col rounded-3xl overflow-hidden
                 bg-card border border-border
                 shadow-sm hover:shadow-xl
                 transition-all duration-500 ease-out
                 hover:-translate-y-2 hover:border-accent/40"
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(28px)",
        transition: `opacity 0.5s ease ${delay}ms, transform 0.5s ease ${delay}ms, box-shadow 0.3s, border-color 0.3s`,
      }}
    >
      {/* ── Preview thumbnail ── */}
      <div className="relative aspect-[3/4] overflow-hidden bg-white flex-shrink-0">
        <TemplateThumb
          templateId={template.id}
          className="w-full h-full pointer-events-none
                     transition-transform duration-700 ease-out
                     group-hover:scale-[1.05]"
        />

        {/* Gradient overlay always visible at bottom */}
        <div className="absolute inset-x-0 bottom-0 h-24
                        bg-gradient-to-t from-black/40 to-transparent
                        pointer-events-none" />

        {/* Badge */}
        <span className={`absolute top-3 left-3 z-10
                          text-[9px] font-black uppercase tracking-widest
                          px-2.5 py-1 rounded-full border
                          ${BADGE_STYLE[template.badge] ?? BADGE_STYLE["Pro"]}`}>
          {template.badge}
        </span>

        {/* Popularity chip */}
        <span className="absolute bottom-3 right-3 z-10
                         text-[9px] font-bold
                         bg-black/60 text-white backdrop-blur-sm
                         px-2.5 py-1 rounded-full">
          {(template.pop / 1000).toFixed(0)}K uses
        </span>

        {/* Hover overlay with CTA */}
        <div className="absolute inset-0 z-20
                        bg-black/65 backdrop-blur-[2px]
                        flex flex-col items-center justify-center gap-3
                        opacity-0 group-hover:opacity-100
                        transition-opacity duration-300">
          <button
            onClick={() => onUse(template.id, template.name)}
            className="btn-premium px-8 py-3 text-xs font-black tracking-wider
                       shadow-2xl transform translate-y-2 group-hover:translate-y-0
                       transition-transform duration-300"
          >
            Use This Template
          </button>
          <button
            onClick={() => onUse(template.id, template.name)}
            className="text-white/80 hover:text-white
                       text-[11px] font-bold uppercase tracking-widest
                       flex items-center gap-1
                       transform translate-y-2 group-hover:translate-y-0
                       transition-all duration-300 delay-75"
          >
            Start Editing <ArrowRight className="h-3 w-3" />
          </button>
        </div>
      </div>

      {/* ── Meta ── */}
      <div className="flex flex-col gap-3 p-5">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-display font-black text-base text-text
                         group-hover:text-accent transition-colors duration-300 leading-tight">
            {template.name}
          </h3>
          <span className="shrink-0 text-[9px] font-black uppercase tracking-widest
                           text-muted bg-soft border border-border
                           px-2.5 py-1 rounded-lg whitespace-nowrap">
            {template.tag}
          </span>
        </div>

        <p className="text-muted text-xs leading-relaxed line-clamp-2">
          {template.desc}
        </p>

        <div className="pt-3 border-t border-border/60 flex items-center justify-between">
          <span className="text-[10px] text-muted font-semibold">
            🔥 {template.pop.toLocaleString()}+ resumes
          </span>
          <button
            onClick={() => onUse(template.id, template.name)}
            className="flex items-center gap-1 text-[10px] font-black
                       text-accent uppercase tracking-widest
                       hover:gap-2 transition-all duration-200"
          >
            Use <ArrowRight className="h-3 w-3" />
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Page ───────────────────────────────────────────────────── */
function TemplatesPage() {
  const { user } = useAuth();
  const nav = useNavigate();
  const [activeTag, setActiveTag] = useState<string>("All");
  const [sort, setSort] = useState("popular");
  const [redirecting, setRedirecting] = useState<{ name: string } | null>(null);
  const [barWidth, setBarWidth] = useState(0);
  const heroRef = useRef<HTMLDivElement>(null);
  const [heroVisible, setHeroVisible] = useState(false);

  // Hero reveal
  useEffect(() => {
    const t = setTimeout(() => setHeroVisible(true), 80);
    return () => clearTimeout(t);
  }, []);

  // Animate bar when redirecting
  useEffect(() => {
    if (redirecting) {
      const t = setTimeout(() => setBarWidth(100), 60);
      return () => clearTimeout(t);
    } else {
      setBarWidth(0);
    }
  }, [redirecting]);

  const filtered = useMemo(() => {
    let list = [...TEMPLATES] as typeof TEMPLATES[number][];
    if (activeTag !== "All") list = list.filter(t => t.tag === activeTag);
    if (sort === "popular") list.sort((a, b) => b.pop - a.pop);
    else if (sort === "name") list.sort((a, b) => a.name.localeCompare(b.name));
    return list;
  }, [activeTag, sort]);

  const handleUse = (id: string, name: string) => {
    setRedirecting({ name });
    const dest = user
      ? `/dashboard?template=${id}`
      : `/auth?redirect=${encodeURIComponent(`/dashboard?template=${id}`)}`;
    setTimeout(() => { window.location.href = dest; }, 1350);
  };

  return (
    <div className="min-h-screen flex flex-col bg-bg text-text">
      <Navbar />

      {/* ─── HERO ──────────────────────────────────────────── */}
      <section className="relative pt-28 pb-16 px-4 sm:px-6 overflow-hidden">
        {/* Ambient blobs */}
        <div className="absolute -top-20 left-1/2 -translate-x-1/2
                        w-[600px] h-[400px] rounded-full
                        bg-accent/8 dark:bg-accent/10
                        blur-3xl pointer-events-none" />
        <div className="absolute top-10 -right-20
                        w-64 h-64 rounded-full
                        bg-accent/5 dark:bg-accent/8
                        blur-2xl pointer-events-none" />

        <div
          ref={heroRef}
          className="relative z-10 max-w-3xl mx-auto text-center"
          style={{
            opacity: heroVisible ? 1 : 0,
            transform: heroVisible ? "translateY(0)" : "translateY(-20px)",
            transition: "opacity 0.6s ease, transform 0.6s ease",
          }}
        >
          {/* Chip */}
          <span className="inline-flex items-center gap-2
                           bg-accent/10 border border-accent/20 text-accent
                           text-[10px] font-black uppercase tracking-widest
                           px-4 py-1.5 rounded-full mb-6">
            <Sparkles className="h-3.5 w-3.5" /> ATS-Optimised & AI-Powered
          </span>

          <h1 className="font-display font-black
                         text-4xl sm:text-5xl md:text-6xl
                         leading-[1.05] tracking-tight text-text mb-5">
            Pick your perfect <br />
            <span className="text-gradient italic">resume template</span>
          </h1>

          <p className="text-muted text-base sm:text-lg max-w-xl mx-auto leading-relaxed mb-10">
            Every layout is recruiter-tested, ATS-compliant, and editable live.
            Export to&nbsp;<strong className="text-text">PDF&nbsp;+&nbsp;Word</strong> in one click.
          </p>

          {/* Stat pills */}
          <div className="flex flex-wrap items-center justify-center gap-3">
            {[
              { icon: <LayoutGrid className="h-4 w-4" />, label: "10 Layouts" },
              { icon: <ShieldCheck className="h-4 w-4" />, label: "100% ATS Safe" },
              { icon: <FileDown className="h-4 w-4" />, label: "PDF + DOCX" },
            ].map(({ icon, label }) => (
              <span
                key={label}
                className="flex items-center gap-2
                           bg-card border border-border
                           text-text text-xs font-bold
                           px-4 py-2.5 rounded-full shadow-sm
                           hover:border-accent/40 hover:shadow-md
                           transition-all duration-300"
              >
                <span className="text-accent">{icon}</span>
                {label}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ─── FILTER BAR (sticky) ───────────────────────────── */}
      <div className="sticky top-14 sm:top-[35px] z-40
                      bg-bg/90 dark:bg-bg/95 backdrop-blur-xl
                      border-b border-border/60
                      shadow-sm">
        <div className="container mx-auto max-w-6xl px-4 sm:px-6 py-3
                        flex flex-col sm:flex-row sm:items-center justify-between gap-3">

          {/* Tag pills */}
          <div className="flex gap-2 flex-wrap">
            {TAGS.map((tag) => (
              <button
                key={tag}
                onClick={() => setActiveTag(tag)}
                className={`px-4 py-2 rounded-full text-[11px] font-black
                            uppercase tracking-widest border
                            transition-all duration-200
                            ${activeTag === tag
                              ? "bg-accent border-accent text-white shadow-md shadow-accent/20"
                              : "bg-card border-border text-muted hover:text-text hover:border-accent/40 hover:bg-soft"
                            }`}
              >
                {tag}
              </button>
            ))}
          </div>

          {/* Sort + count */}
          <div className="flex items-center gap-3 self-end sm:self-auto">
            <span className="text-[11px] text-muted font-bold uppercase tracking-wider">
              {filtered.length} result{filtered.length !== 1 ? "s" : ""}
            </span>
            <div className="relative">
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                className="appearance-none
                           bg-card border border-border
                           text-text text-[11px] font-bold
                           pl-4 pr-8 py-2.5 rounded-full
                           outline-none cursor-pointer
                           hover:border-accent/40 focus:border-accent
                           transition-colors duration-200"
              >
                <option value="popular">Most Popular</option>
                <option value="name">A – Z</option>
              </select>
              <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2
                                      h-3.5 w-3.5 text-muted pointer-events-none" />
            </div>
          </div>

        </div>
      </div>

      {/* ─── GRID ──────────────────────────────────────────── */}
      <main className="flex-1 container mx-auto max-w-6xl px-4 sm:px-6 py-10 sm:py-14">

        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center
                          py-24 text-center
                          bg-card border border-dashed border-border
                          rounded-3xl gap-4">
            <Search className="h-10 w-10 text-muted/50" />
            <h3 className="font-display text-xl font-black text-text">No templates found</h3>
            <p className="text-muted text-sm max-w-xs">
              Try a different category filter above.
            </p>
            <button
              onClick={() => setActiveTag("All")}
              className="btn-premium mt-2 px-7 py-3 text-xs"
            >
              Show all templates
            </button>
          </div>
        ) : (
          <div className="grid gap-6
                          grid-cols-1
                          sm:grid-cols-2
                          lg:grid-cols-3">
            {filtered.map((t, i) => (
              <TemplateCard key={t.id} template={t} index={i} onUse={handleUse} />
            ))}
          </div>
        )}

        {/* Bottom CTA strip */}
        <div className="mt-20 relative overflow-hidden
                        rounded-3xl border border-border
                        bg-gradient-to-br from-accent/10 via-card to-card
                        p-8 sm:p-12 text-center shadow-sm">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(99,102,241,0.12),transparent_70%)] pointer-events-none" />
          <div className="relative z-10 space-y-5 max-w-xl mx-auto">
            <Sparkles className="h-8 w-8 text-accent mx-auto opacity-80" />
            <h2 className="font-display text-2xl sm:text-3xl font-black text-text">
              Can't decide? Let Vogats AI pick for you.
            </h2>
            <p className="text-muted text-sm sm:text-base leading-relaxed">
              Answer 3 quick questions and our AI will match you with the
              template that best fits your industry and experience level.
            </p>
            <button
              onClick={() => handleUse("modern", "Modern Classic")}
              className="btn-premium px-10 py-4 text-sm font-black tracking-wider
                         inline-flex items-center gap-2 group"
            >
              Build my resume now
              <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>

      </main>

      <Footer />

      {/* ─── REDIRECT OVERLAY ──────────────────────────────── */}
      {redirecting && (
        <div className="fixed inset-0 z-[9999]
                        bg-black/80 backdrop-blur-md
                        flex items-center justify-center
                        animate-in fade-in duration-200">
          <div className="text-center text-white max-w-sm w-full px-8 py-12 space-y-5">
            {/* Animated check icon */}
            <div className="w-16 h-16 bg-accent rounded-2xl
                            flex items-center justify-center text-2xl font-black
                            mx-auto shadow-2xl shadow-accent/30
                            animate-bounce">
              ✓
            </div>
            <h2 className="font-display text-2xl font-black">Great choice!</h2>
            <p className="text-white/70 text-sm leading-relaxed">
              Opening <strong className="text-white">{redirecting.name}</strong> in the editor…
            </p>
            {/* Progress bar */}
            <div className="w-52 h-1.5 bg-white/20 rounded-full overflow-hidden mx-auto">
              <div
                className="h-full bg-accent rounded-full"
                style={{
                  width: `${barWidth}%`,
                  transition: "width 1.25s cubic-bezier(0.4,0,0.2,1)",
                }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
