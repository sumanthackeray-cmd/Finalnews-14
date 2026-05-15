import { Brain, Wand2, FileCheck2, Languages, Layers, Gauge } from "lucide-react";

const features = [
  { icon: Brain, title: "AI summary writer", body: "One click turns a few bullet points into a recruiter-grade professional summary." },
  { icon: Wand2, title: "Rewrite in your voice", body: "Polish, shorten, or amplify any line. Keeps the meaning, drops the cringe." },
  { icon: FileCheck2, title: "ATS scorecard", body: "Live keyword and formatting score against any job description you paste." },
  { icon: Layers, title: "Templates that breathe", body: "12 modern templates. Tweak fonts, colors, density. Zero design skills." },
  { icon: Gauge, title: "Real-time preview", body: "Edit on the left, watch your resume re-flow on the right. Always pixel-perfect PDF." },
  { icon: Languages, title: "Built-in translation", body: "Ship the same resume in 14 languages without losing tone or formatting." },
];

export function Features() {
  return (
    <section id="features" className="border-t border-border/60 bg-background py-24 md:py-32">
      <div className="container mx-auto max-w-7xl px-6">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-medium uppercase tracking-widest text-coral">Why Resumé.ai</p>
          <h2 className="mt-4 font-display text-4xl font-semibold tracking-tight md:text-5xl text-balance">
            Everything you'd hire a writer for.
            <span className="italic text-muted-foreground"> Minus the writer.</span>
          </h2>
        </div>
        <div className="mt-16 grid gap-px overflow-hidden rounded-3xl border border-border bg-border md:grid-cols-2 lg:grid-cols-3">
          {features.map((f) => (
            <div
              key={f.title}
              className="group bg-card p-8 transition-colors hover:bg-secondary"
            >
              <div className="mb-5 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-ink text-ivory transition-transform group-hover:-rotate-6">
                <f.icon className="h-5 w-5" />
              </div>
              <h3 className="font-display text-xl font-semibold">{f.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{f.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
