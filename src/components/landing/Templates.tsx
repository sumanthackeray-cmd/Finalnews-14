const templates = [
  { name: "Aria", tag: "Professional", color: "from-[oklch(0.88_0.03_260)] to-[oklch(0.78_0.05_240)]" },
  { name: "Lumen", tag: "Creative", color: "from-[oklch(0.86_0.08_40)] to-[oklch(0.78_0.12_30)]" },
  { name: "North", tag: "Minimal", color: "from-[oklch(0.95_0.005_80)] to-[oklch(0.88_0.012_70)]" },
  { name: "Slate", tag: "Corporate", color: "from-[oklch(0.3_0.03_260)] to-[oklch(0.2_0.04_260)]" },
  { name: "Pixel", tag: "Tech", color: "from-[oklch(0.8_0.07_160)] to-[oklch(0.65_0.1_180)]" },
  { name: "Folio", tag: "Editorial", color: "from-[oklch(0.92_0.04_60)] to-[oklch(0.82_0.07_45)]" },
];

export function Templates() {
  return (
    <section id="templates" className="bg-ink py-24 text-ivory md:py-32">
      <div className="container mx-auto max-w-7xl px-6">
        <div className="flex flex-col items-end justify-between gap-6 md:flex-row">
          <div className="max-w-xl">
            <p className="text-sm font-medium uppercase tracking-widest text-coral">Templates</p>
            <h2 className="mt-4 font-display text-4xl font-semibold tracking-tight md:text-5xl text-balance">
              Designed by humans.
              <span className="italic text-ivory/60"> Filled by AI.</span>
            </h2>
          </div>
          <p className="max-w-sm text-ivory/70">
            Twelve templates tuned for ATS parsing and recruiter eyeballs. Swap any time
            without losing your content.
          </p>
        </div>

        <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {templates.map((t, i) => (
            <div key={t.name} className="group relative">
              <div
                className={`aspect-[3/4] overflow-hidden rounded-2xl border border-ivory/10 bg-gradient-to-br ${t.color} p-6 shadow-elegant transition-transform duration-500 group-hover:-translate-y-2 group-hover:rotate-[-1deg]`}
              >
                <div className="flex h-full flex-col rounded-xl bg-ivory p-5 text-ink shadow-soft">
                  <div className="mb-3 h-2 w-1/3 rounded-full bg-ink/80" />
                  <div className="mb-1 h-1.5 w-1/2 rounded-full bg-ink/30" />
                  <div className="my-4 h-px w-full bg-ink/10" />
                  <div className="space-y-1.5">
                    {Array.from({ length: 5 }).map((_, j) => (
                      <div
                        key={j}
                        className="h-1 rounded-full bg-ink/15"
                        style={{ width: `${60 + ((i * 7 + j * 13) % 35)}%` }}
                      />
                    ))}
                  </div>
                  <div className="my-4 h-px w-full bg-ink/10" />
                  <div className="mb-2 h-2 w-1/4 rounded-full bg-coral" />
                  <div className="space-y-1.5">
                    {Array.from({ length: 4 }).map((_, j) => (
                      <div
                        key={j}
                        className="h-1 rounded-full bg-ink/15"
                        style={{ width: `${50 + ((i * 11 + j * 9) % 40)}%` }}
                      />
                    ))}
                  </div>
                </div>
              </div>
              <div className="mt-4 flex items-baseline justify-between">
                <h3 className="font-display text-xl font-semibold">{t.name}</h3>
                <span className="text-xs uppercase tracking-widest text-ivory/50">{t.tag}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
