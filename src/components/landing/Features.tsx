import { 
  Brain, Gauge, Wand2, Layers, Eye, Languages, 
  Sparkles, Check, Crown, CreditCard, Shield, Zap, Target
} from "lucide-react";
import { cn } from "@/lib/utils";

export function Features() {
  return (
    <section id="features" className="relative py-12 md:py-24 overflow-hidden bg-bg">
      {/* Ambient background blobs */}
      <div className="absolute top-[-200px] left-[-300px] w-[800px] h-[800px] bg-[radial-gradient(circle,var(--accent),transparent_70%)] opacity-[0.08] pointer-events-none" />
      <div className="absolute bottom-0 right-[-200px] w-[600px] h-[600px] bg-[radial-gradient(circle,var(--accent-secondary),transparent_70%)] opacity-[0.05] pointer-events-none" />

      <div className="container mx-auto max-w-7xl px-4 sm:px-6 relative z-10">
        
        {/* Header */}
        <div className="mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-accent/10 border border-accent/25 text-[11px] font-black uppercase tracking-[0.2em] text-accent mb-6">
            <div className="w-1.5 h-1.5 bg-accent rounded-full animate-pulse shadow-[0_0_8px_var(--accent)]" />
            Powerful Features
          </div>
          <h2 className="font-display text-4xl sm:text-7xl font-black leading-[1.05] tracking-tight text-text mb-6">
            Crafted for candidates<br />
            who <span className="text-gradient">demand the best.</span>
          </h2>
          <p className="text-base sm:text-lg text-muted max-w-lg leading-relaxed font-medium">
            Every tool you need to land interviews — powered by cutting-edge AI and designed for human impact.
          </p>
        </div>

        {/* Bento Grid */}
        <div className="grid grid-cols-12 gap-4 lg:gap-6">
          
          {/* Card 1: AI Summary */}
          <div className="col-span-12 lg:col-span-7 group relative bg-card border border-border rounded-[2.5rem] p-8 overflow-hidden transition-all duration-500 hover:border-accent/40 hover:bg-card/80 hover:-translate-y-1 shadow-sm">
            <div className="relative z-10">
              <div className="flex items-start justify-between mb-6">
                <div className="w-12 h-12 rounded-2xl bg-indigo-500/15 flex items-center justify-center text-indigo-500">
                  <Brain className="w-6 h-6" />
                </div>
                <span className="text-[10px] font-black uppercase tracking-widest bg-indigo-500/10 text-indigo-500 border border-indigo-500/20 px-3 py-1 rounded-full">AI-Powered</span>
              </div>
              <h3 className="font-display text-2xl font-black text-text mb-3">Vogats AI Summary</h3>
              <p className="text-sm text-muted leading-relaxed max-w-md font-medium">Transform raw bullet points into polished, executive-level summaries in a single click. Let AI do the heavy lifting.</p>
                           <div className="flex items-end gap-1.5 h-12 mt-8">
                {[0.6, 1, 0.75, 0.9, 0.5, 0.8, 0.65].map((h, i) => (
                  <div key={i} 
                    className={cn(
                      "w-2.5 rounded-t-sm transition-all duration-1000", 
                      i % 2 === 0 ? "bg-indigo-500/30" : "bg-indigo-500/70"
                    )}
                    style={{ height: `${h * 100}%` }}
                  />
                ))}
              </div>
            </div>
            <div className="absolute right-8 bottom-8 text-7xl opacity-[0.03] dark:opacity-5 pointer-events-none group-hover:scale-110 group-hover:-rotate-12 transition-all duration-500 text-text">✦</div>
          </div>

          {/* Card 2: ATS Smart Score */}
          <div className="col-span-12 lg:col-span-5 group relative bg-card border border-border rounded-[2.5rem] p-8 overflow-hidden transition-all duration-500 hover:border-cyan-500/40 hover:bg-card/80 hover:-translate-y-1 shadow-sm">
            <div className="relative z-10">
              <div className="flex items-start justify-between mb-6">
                <div className="w-12 h-12 rounded-2xl bg-cyan-500/15 flex items-center justify-center text-cyan-500">
                  <Gauge className="w-6 h-6" />
                </div>
                <span className="text-[10px] font-black uppercase tracking-widest bg-cyan-500/10 text-cyan-500 border border-cyan-500/20 px-3 py-1 rounded-full">Real-time</span>
              </div>
              <h3 className="font-display text-2xl font-black text-text mb-3">ATS Smart Score</h3>
              <p className="text-sm text-muted leading-relaxed font-medium">Real-time parsing and keyword optimization to beat the robots. Know your score before you apply.</p>
              
              <div className="flex items-center gap-4 mt-8">
                <div className="relative w-14 h-14">
                  <svg className="w-full h-full -rotate-90" viewBox="0 0 54 54">
                    <circle cx="27" cy="27" r="22" fill="none" stroke="currentColor" className="text-cyan-500/10" strokeWidth="5"/>
                    <circle cx="27" cy="27" r="22" fill="none" stroke="currentColor" className="text-cyan-500" strokeWidth="5" strokeDasharray="138" strokeDashoffset="28" strokeLinecap="round"/>
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center text-[13px] font-black text-cyan-500">94</div>
                </div>
                <div>
                  <div className="text-xl font-black text-cyan-500">94%</div>
                  <div className="text-[11px] font-bold text-muted uppercase tracking-wider">ATS Match Score</div>
                </div>
              </div>
            </div>
            <div className="absolute right-8 bottom-8 text-7xl opacity-[0.03] dark:opacity-5 pointer-events-none text-text">◎</div>
          </div>

          {/* Card 3: Smart Rewriting */}
          <div className="col-span-12 lg:col-span-4 group relative bg-card border border-border rounded-[2.5rem] p-8 overflow-hidden transition-all duration-500 hover:border-purple-500/40 hover:bg-card/80 hover:-translate-y-1 shadow-sm">
            <div className="relative z-10 h-full flex flex-col">
              <div className="flex items-start justify-between mb-6">
                <div className="w-12 h-12 rounded-2xl bg-purple-500/15 flex items-center justify-center text-purple-500">
                  <Wand2 className="w-6 h-6" />
                </div>
                <span className="text-[10px] font-black uppercase tracking-widest bg-purple-500/10 text-purple-500 border border-purple-500/20 px-3 py-1 rounded-full">Smart</span>
              </div>
              <h3 className="font-display text-2xl font-black text-text mb-3">Smart Rewriting</h3>
              <p className="text-sm text-muted leading-relaxed font-medium">Instantly adjust tone and impact to match specific job requirements with one tap.</p>
              <div className="mt-auto pt-8 flex justify-end">
                <div className="text-7xl opacity-[0.03] dark:opacity-5 pointer-events-none text-text">⟳</div>
              </div>
            </div>
          </div>

          {/* Card 4: Premium Templates */}
          <div className="col-span-12 lg:col-span-8 group relative bg-card border border-border rounded-[2.5rem] p-8 overflow-hidden transition-all duration-500 hover:border-emerald-500/40 hover:bg-card/80 hover:-translate-y-1 shadow-sm">
            <div className="relative z-10">
              <div className="flex items-start justify-between mb-6">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 flex items-center justify-center text-emerald-500">
                  <Layers className="w-6 h-6" />
                </div>
                <span className="text-[10px] font-black uppercase tracking-widest bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 px-3 py-1 rounded-full">12+ Designs</span>
              </div>
              <h3 className="font-display text-2xl font-black text-text mb-3">Premium Templates</h3>
              <p className="text-sm text-muted leading-relaxed max-w-md font-medium">Hand-crafted layouts that guarantee a professional look every time. ATS-friendly and visually stunning.</p>
              
              <div className="flex gap-3 mt-8">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="w-12 h-16 rounded-lg border border-border bg-surface relative overflow-hidden group-hover:scale-105 transition-transform">
                    <div className="absolute top-2 left-2 right-2 h-1 bg-text/10 rounded-full" />
                    <div className="absolute top-4 left-2 right-2 bottom-2 bg-[repeating-linear-gradient(to_bottom,rgba(0,0,0,0.08)_0px,rgba(0,0,0,0.08)_1px,transparent_1px,transparent_4px)] dark:bg-[repeating-linear-gradient(to_bottom,rgba(255,255,255,0.08)_0px,rgba(255,255,255,0.08)_1px,transparent_1px,transparent_4px)]" />
                  </div>
                ))}
              </div>
            </div>
            <div className="absolute right-8 bottom-8 text-7xl opacity-[0.03] dark:opacity-5 pointer-events-none text-text">▣</div>
          </div>

          {/* Card 5: Live Preview */}
          <div className="col-span-12 lg:col-span-6 group relative bg-card border border-border rounded-[2.5rem] p-8 overflow-hidden transition-all duration-500 hover:border-amber-500/40 hover:bg-card/80 hover:-translate-y-1 shadow-sm">
            <div className="relative z-10">
              <div className="flex items-start justify-between mb-6">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/15 flex items-center justify-center text-amber-500">
                  <Eye className="w-6 h-6" />
                </div>
                <span className="text-[10px] font-black uppercase tracking-widest bg-amber-500/10 text-amber-500 border border-amber-500/20 px-3 py-1 rounded-full">Live</span>
              </div>
              <h3 className="font-display text-2xl font-black text-text mb-3">Live Preview</h3>
              <p className="text-sm text-muted leading-relaxed max-w-md font-medium">See your changes in real-time with pixel-perfect PDF rendering. What you see is exactly what you get.</p>
              
              <div className="space-y-2 mt-8">
                {[88, 72, 80, 55].map((w, i) => (
                  <div key={i} className="h-2 bg-muted/10 rounded-full overflow-hidden relative border border-border/50">
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-amber-500/40 to-transparent translate-x-[-100%] animate-[shimmer_2s_infinite]" style={{ animationDelay: `${i * 0.2}s` }} />
                    <div className="h-full bg-muted/20" style={{ width: `${w}%` }} />
                  </div>
                ))}
              </div>
            </div>
            <div className="absolute right-8 bottom-8 text-7xl opacity-[0.03] dark:opacity-5 pointer-events-none text-text">◈</div>
          </div>

          {/* Card 6: Global Support */}
          <div className="col-span-12 lg:col-span-6 group relative bg-card border border-border rounded-[2.5rem] p-8 overflow-hidden transition-all duration-500 hover:border-rose-500/40 hover:bg-card/80 hover:-translate-y-1 shadow-sm">
            <div className="relative z-10">
              <div className="flex items-start justify-between mb-6">
                <div className="w-12 h-12 rounded-2xl bg-rose-500/15 flex items-center justify-center text-rose-500">
                  <Languages className="w-6 h-6" />
                </div>
                <span className="text-[10px] font-black uppercase tracking-widest bg-rose-500/10 text-rose-500 border border-rose-500/20 px-3 py-1 rounded-full">16+ Languages</span>
              </div>
              <h3 className="font-display text-2xl font-black text-text mb-3">Global Support</h3>
              <p className="text-sm text-muted leading-relaxed max-w-md font-medium">Translate and adapt your resume for 16+ different languages seamlessly. Apply anywhere, instantly.</p>
              
              <div className="flex flex-wrap gap-2 mt-8">
                {["🇺🇸 EN", "🇫🇷 FR", "🇩🇪 DE", "🇪🇸 ES", "🇯🇵 JP", "+11"].map((lang) => (
                  <span key={lang} className="px-3 py-1 rounded-full bg-surface border border-border text-[11px] font-bold text-muted hover:bg-rose-500/10 hover:border-rose-500/20 hover:text-rose-500 transition-all cursor-default">
                    {lang}
                  </span>
                ))}
              </div>
            </div>
            <div className="absolute right-8 bottom-8 text-7xl opacity-[0.03] dark:opacity-5 pointer-events-none text-text">◉</div>
          </div>
        </div>

        {/* Stats Row */}
        <div className="mt-12 grid grid-cols-3 gap-4 pt-12 border-t border-border">
          {[
            { num: "50K+", label: "Resumes built" },
            { num: "94%", label: "ATS pass rate" },
            { num: "3×", label: "More interviews" }
          ].map((stat, i) => (
            <div key={i} className="text-center p-4 sm:p-6 rounded-3xl bg-card border border-border hover:bg-accent/5 hover:border-accent/20 transition-all group shadow-sm">
              <div className="text-2xl sm:text-4xl font-display font-black text-gradient leading-none mb-2">
                {stat.num}
              </div>
              <div className="text-[10px] sm:text-xs font-black text-muted uppercase tracking-widest leading-none">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      <style>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(200%); }
        }
      `}</style>
    </section>
  );
}

