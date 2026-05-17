import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState, useMemo } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Footer";
import { TemplateThumb } from "@/components/resume/TemplateThumb";
import { toast } from "sonner";
import { LayoutGrid, Sparkles, Flame, CheckCircle, ArrowRight } from "lucide-react";

export const Route = createFileRoute("/templates")({
  head: () => ({
    meta: [
      { title: "Premium Resume Templates — Vogats CV" },
      {
        name: "description",
        content: "Explore the top 10 ATS-optimized resume templates. Fully editable with Vogats AI resume builder, available in PDF and Word.",
      },
    ],
  }),
  component: TemplatesPage,
});

const ALL_TEMPLATES = [
  { id: "modern",   name: "Modern Classic", badge: "Free",    tags: "professional", pop: 120000, desc: "Clean sidebar layout with soft accents. Perfect for corporate, finance, and tech roles." },
  { id: "classic",  name: "Classic Slate",  badge: "Free",    tags: "professional", pop: 105000, desc: "Traditional elegant layout. Timeless design favored by recruiters worldwide." },
  { id: "creative", name: "Creative Dark",  badge: "New",     tags: "creative",     pop: 85000,  desc: "Dark theme featuring beautiful gradients. Commands attention for product and design roles." },
  { id: "minimal",  name: "Minimalist",     badge: "Free",    tags: "minimal",      pop: 92000,  desc: "Ultra-clean single column layout. Ideal for writers, developers, and practitioners." },
  { id: "designer", name: "Designer Pro",   badge: "Pro",     tags: "creative",     pop: 74000,  desc: "Artistic, highly-styled designer format with custom grid visual systems." },
  { id: "avery",    name: "Avery Clean",    badge: "Pro",     tags: "professional", pop: 67000,  desc: "Polished corporate layout optimized for experienced managers and developers." },
  { id: "slater",   name: "Slater Bold",    badge: "Premium", tags: "creative",     pop: 58000,  desc: "Sleek, high-contrast dark layout with custom technical accents." },
  { id: "watson",   name: "Watson Standard",badge: "Pro",     tags: "professional", pop: 63000,  desc: "Corporate double-column standard built for executive summaries." },
  { id: "sophia",   name: "Sophia Grace",   badge: "Hot",     tags: "professional", pop: 51000,  desc: "Exquisite visual structure featuring custom decorative serif separators." },
  { id: "turquoise",name: "Turquoise Sidebar",badge: "Hot",   tags: "creative",     pop: 88000,  desc: "Vibrant custom teal two-column layout with blue-gradient header panels." },
] as const;

function TemplatesPage() {
  const { user } = useAuth();
  const nav = useNavigate();
  const [filter, setFilter] = useState("all");
  const [sort, setSort] = useState("popular");
  const [redirectState, setRedirectState] = useState<{ active: boolean; name: string } | null>(null);

  // Apply filters and sorting in real-time
  const filteredTemplates = useMemo(() => {
    let result = [...ALL_TEMPLATES];
    
    // Filter
    if (filter !== "all") {
      result = result.filter(t => t.tags === filter);
    }
    
    // Sort
    if (sort === "popular") {
      result.sort((a, b) => b.pop - a.pop);
    } else if (sort === "new") {
      result.sort((a, b) => b.id.localeCompare(a.id));
    } else if (sort === "name") {
      result.sort((a, b) => a.name.localeCompare(b.name));
    }
    
    return result;
  }, [filter, sort]);

  const handleUseTemplate = (id: string, name: string) => {
    setRedirectState({ active: true, name });
    
    // Determine the destination editor URL
    // If the user is logged in, redirect directly to dashboard with template query parameter
    // If guest, redirect to /auth with the dashboard templates parameter as rediction value
    const destination = user 
      ? `/dashboard?template=${id}` 
      : `/auth?redirect=${encodeURIComponent(`/dashboard?template=${id}`)}`;

    setTimeout(() => {
      window.location.href = destination;
    }, 1300);
  };

  return (
    <div className="min-h-screen bg-bg text-text scroll-smooth pt-16 flex flex-col justify-between">
      <Navbar />

      {/* Styles for premium layout details */}
      <style>{`
        .hero-section {
          background: linear-gradient(180deg, rgba(var(--accent-rgb), 0.05) 0%, transparent 100%);
        }
        .template-grid-card {
          transition: transform .25s, box-shadow .25s, border-color .25s;
        }
        .template-grid-card:hover {
          transform: translateY(-6px);
          box-shadow: 0 12px 40px rgba(0,0,0,0.12);
        }
      `}</style>

      <main className="flex-1 pb-20">
        
        {/* HERO */}
        <section className="hero-section text-center px-6 py-16 sm:py-20 relative overflow-hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-accent/5 rounded-full blur-3xl pointer-events-none" />
          
          <div className="relative z-10 max-w-3xl mx-auto space-y-6">
            <span className="inline-flex items-center gap-2 bg-accent/10 border border-accent/20 text-accent text-[11px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full">
              <Sparkles className="h-3.5 w-3.5" /> 100% Recruiter & ATS Approved
            </span>
            <h1 className="font-display text-4xl sm:text-6xl font-black leading-none tracking-tight text-balance">
              Choose your perfect <br />
              <span className="text-accent italic">resume template</span>
            </h1>
            <p className="text-muted text-sm sm:text-base max-w-xl mx-auto leading-relaxed">
              Every template is meticulously crafted to be fully ATS-compliant, beautifully styled, and fully editable in real-time with Vogats AI.
            </p>
            
            <div className="flex items-center justify-center gap-4 flex-wrap pt-2">
              <span className="bg-card border border-border px-4 py-2 rounded-full text-xs font-bold text-muted flex items-center gap-1.5 shadow-sm">
                <LayoutGrid className="h-3.5 w-3.5 text-accent" /> 10 Premium Layouts
              </span>
              <span className="bg-card border border-border px-4 py-2 rounded-full text-xs font-bold text-muted flex items-center gap-1.5 shadow-sm">
                <CheckCircle className="h-3.5 w-3.5 text-sage" /> ATS Compatible
              </span>
              <span className="bg-card border border-border px-4 py-2 rounded-full text-xs font-bold text-muted flex items-center gap-1.5 shadow-sm">
                <Flame className="h-3.5 w-3.5 text-amber-500" /> PDF + Word Exports
              </span>
            </div>
          </div>
        </section>

        {/* FILTERS & SORT */}
        <section className="container mx-auto max-w-6xl px-6 mb-10">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pb-6 border-b border-border/50">
            
            {/* Filter Pills */}
            <div className="flex gap-2 flex-wrap">
              {["all", "professional", "creative", "minimal"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setFilter(tab)}
                  className={`px-5 py-2.5 rounded-full text-xs font-black uppercase tracking-widest border transition-all ${
                    filter === tab 
                      ? "bg-accent border-accent text-white shadow-md shadow-accent/15" 
                      : "bg-card border-border text-muted hover:text-text hover:border-accent/40"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* Sort Dropdown */}
            <div className="flex items-center gap-4 self-end sm:self-auto">
              <span className="text-xs text-muted font-bold uppercase tracking-wider">{filteredTemplates.length} Templates</span>
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                className="bg-card border border-border text-text font-bold text-xs px-4 py-2.5 rounded-full outline-none cursor-pointer focus:border-accent hover:border-border/80 transition-colors"
              >
                <option value="popular">Most Popular</option>
                <option value="new">Newest Arrivals</option>
                <option value="name">Alphabetical (A-Z)</option>
              </select>
            </div>

          </div>
        </section>

        {/* TEMPLATE GRID */}
        <section className="container mx-auto max-w-6xl px-6">
          {filteredTemplates.length === 0 ? (
            <div className="text-center py-20 bg-card border border-dashed border-border rounded-3xl">
              <div className="text-4xl mb-4">🔍</div>
              <h3 className="font-display text-xl font-bold mb-2">No Templates Found</h3>
              <p className="text-muted text-sm mb-6">We couldn't find matches. Try changing the filter tab.</p>
              <button 
                onClick={() => setFilter("all")} 
                className="btn-premium px-6 py-2.5 text-xs"
              >
                View All Templates
              </button>
            </div>
          ) : (
            <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
              {filteredTemplates.map((t) => (
                <div 
                  key={t.id} 
                  className="template-grid-card bg-card border border-border/80 rounded-[2rem] overflow-hidden group flex flex-col justify-between"
                >
                  
                  {/* Thumb Preview container with scale/overlay effects */}
                  <div className="aspect-[3/4] relative overflow-hidden bg-white border-b border-border/30">
                    
                    {/* Badge */}
                    <div className="absolute top-4 left-4 z-20">
                      <span className={`text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full shadow-lg ${
                        t.badge === "Free" ? "bg-emerald-500 text-white" :
                        t.badge === "Pro" ? "bg-accent text-white" :
                        t.badge === "New" ? "bg-violet-500 text-white" :
                        "bg-amber-500 text-white"
                      }`}>
                        {t.badge}
                      </span>
                    </div>

                    {/* Scale live component inside scaled TemplateThumb */}
                    <TemplateThumb 
                      templateId={t.id} 
                      className="w-full h-full pointer-events-none transition-transform duration-700 group-hover:scale-[1.04]"
                    />

                    {/* Premium Hover Overlay */}
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-[3px] opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center gap-3">
                      <button 
                        onClick={() => handleUseTemplate(t.id, t.name)}
                        className="btn-premium px-8 py-3 text-xs tracking-wider"
                      >
                        Use This Template
                      </button>
                      <button 
                        onClick={() => handleUseTemplate(t.id, t.name)}
                        className="px-6 py-2 border.5 border-white/40 text-white text-xs font-bold rounded-xl hover:bg-white/10 transition-colors"
                      >
                        Start Editing
                      </button>
                    </div>

                  </div>

                  {/* Meta details */}
                  <div className="p-6 space-y-4">
                    <div className="flex items-center justify-between gap-4">
                      <h3 className="font-display font-black text-lg truncate group-hover:text-accent transition-colors">
                        {t.name}
                      </h3>
                      <span className="text-[10px] text-muted font-black uppercase tracking-widest bg-soft border border-border px-3 py-1 rounded-lg">
                        {t.tags}
                      </span>
                    </div>
                    
                    <p className="text-muted text-xs leading-relaxed line-clamp-2">
                      {t.desc}
                    </p>

                    <div className="pt-4 border-t border-border/50 flex items-center justify-between">
                      <span className="text-[10px] text-muted font-bold tracking-wide">
                        🔥 Used {t.pop.toLocaleString()}+ times
                      </span>
                      <button 
                        onClick={() => handleUseTemplate(t.id, t.name)}
                        className="flex items-center gap-1 text-[10px] font-black text-accent uppercase tracking-widest hover:translate-x-1 transition-transform"
                      >
                        Use Layout <ArrowRight className="h-3 w-3" />
                      </button>
                    </div>
                  </div>

                </div>
              ))}
            </div>
          )}
        </section>

      </main>

      {/* Redirect overlay */}
      {redirectState?.active && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-[9999] flex items-center justify-center animate-fade-in">
          <div className="text-center text-white max-w-sm px-6 py-10 space-y-4">
            <div className="w-16 h-16 bg-accent text-white rounded-2xl flex items-center justify-center text-3xl mx-auto shadow-2xl animate-bounce">
              ✓
            </div>
            <h2 className="font-display text-2xl font-black">Great Choice!</h2>
            <p className="text-white/70 text-sm">
              Loading <b className="text-white">{redirectState.name}</b> in your workspace...
            </p>
            
            <div className="w-48 h-1 bg-white/20 rounded-full overflow-hidden mx-auto mt-6">
              <div className="h-full bg-accent animate-loading-bar rounded-full" style={{ width: "100%", transition: "width 1.2s ease" }} />
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
