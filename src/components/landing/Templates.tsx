import { TemplateThumb } from "@/components/resume/TemplateThumb";
import { useNavigate } from "@tanstack/react-router";
import { ArrowUpRight } from "lucide-react";

const templates = [
  { id: "slater",  name: "Slater",  tag: "Creative",     accent: "from-purple-500/20 to-blue-500/20" },
  { id: "watson",  name: "Watson",  tag: "Professional", accent: "from-blue-500/20 to-cyan-500/20" },
  { id: "sophia",  name: "Sophia",  tag: "Editorial",    accent: "from-amber-500/20 to-orange-500/20" },
];

export function Templates() {
  const navigate = useNavigate();

  return (
    <section id="templates" className="relative py-12 md:py-16 overflow-hidden bg-surface/20">
      {/* Background Decorative Element */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[radial-gradient(circle_at_center,rgba(99,102,241,0.03)_0,transparent_70%)] -z-10" />

      <div className="container mx-auto max-w-7xl px-6">
        <div className="flex flex-col items-center text-center mb-12">
          <h2 className="text-gradient font-display text-sm font-bold uppercase tracking-[0.3em] mb-4">
            Curated Templates
          </h2>
          <h3 className="font-display text-4xl font-bold tracking-tight md:text-6xl text-balance mb-6">
            Designed by humans. <br />
            <span className="opacity-60 italic text-muted">Optimized by Vogats AI.</span>
          </h3>
          <p className="max-w-2xl text-muted font-medium text-lg">
            Every template is meticulously crafted to be ATS-friendly and visually stunning. 
            Swap styles instantly without losing a single word.
          </p>
        </div>

        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
          {templates.map((t) => (
            <div key={t.id} className="group relative">
              <div
                className={`relative p-1 rounded-[2rem] bg-gradient-to-br ${t.accent} border border-border/50 shadow-2xl transition-all duration-700 hover:scale-[1.02] hover:-rotate-1 cursor-pointer overflow-hidden`}
                onClick={() => navigate({ to: "/dashboard", search: { template: t.id } })}
              >
                <div className="absolute inset-0 bg-gradient-to-t from-bg/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity z-10 flex items-end justify-center pb-8">
                  <button className="btn-premium px-8 py-3 rounded-full flex items-center gap-2">
                    Use Template <ArrowUpRight className="h-4 w-4" />
                  </button>
                </div>
                
                <TemplateThumb
                  templateId={t.id}
                  className="rounded-[1.8rem] w-full transform transition-transform duration-700 group-hover:scale-110"
                />
              </div>
              
              <div className="mt-6 flex items-center justify-between px-2">
                <div>
                  <h4 className="font-display text-2xl font-bold">{t.name}</h4>
                  <p className="text-xs uppercase tracking-[0.2em] text-muted font-bold mt-1">{t.tag}</p>
                </div>
                <div className="h-1 w-12 rounded-full bg-border group-hover:w-20 group-hover:bg-accent transition-all duration-500" />
              </div>
            </div>
          ))}
        </div>

        {/* CTA to separate templates page */}
        <div className="flex justify-center mt-14">
          <button 
            onClick={() => navigate({ to: "/templates" })}
            className="btn-premium px-10 py-4 font-bold text-sm tracking-wider flex items-center gap-2 group shadow-xl"
          >
            Explore All 10 Premium Templates 
            <ArrowUpRight className="h-4 w-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
          </button>
        </div>
      </div>
    </section>
  );
}
