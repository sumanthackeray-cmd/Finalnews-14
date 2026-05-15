import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";

const plans = [
  {
    name: "Free",
    price: "$0",
    sub: "Forever",
    features: ["1 resume", "3 templates", "10 AI credits / month", "PDF export with watermark"],
    cta: "Start free",
    variant: "outline" as const,
  },
  {
    name: "Pro",
    price: "$12",
    sub: "per month",
    highlight: true,
    features: ["Unlimited resumes", "All 12 templates", "Unlimited AI credits", "ATS scoring & job matching", "PDF + DOCX export", "Cover letter generator"],
    cta: "Go Pro",
    variant: "coral" as const,
  },
  {
    name: "Business",
    price: "$29",
    sub: "per month",
    features: ["Everything in Pro", "Team workspace (5 seats)", "Brand kit & custom templates", "Priority AI models", "Resume version history"],
    cta: "Contact sales",
    variant: "ink" as const,
  },
];

export function Pricing() {
  return (
    <section id="pricing" className="border-t border-border/60 bg-background py-24 md:py-32">
      <div className="container mx-auto max-w-7xl px-6">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-medium uppercase tracking-widest text-coral">Pricing</p>
          <h2 className="mt-4 font-display text-4xl font-semibold tracking-tight md:text-5xl text-balance">
            Pay less than one hour with a coach.
          </h2>
        </div>
        <div className="mt-16 grid gap-6 md:grid-cols-3">
          {plans.map((p) => (
            <div
              key={p.name}
              className={`relative flex flex-col rounded-3xl border p-8 ${p.highlight ? "border-ink bg-ink text-ivory shadow-elegant" : "border-border bg-card shadow-soft"}`}
            >
              {p.highlight && (
                <span className="absolute -top-3 left-8 rounded-full bg-coral px-3 py-1 text-xs font-semibold text-accent-foreground">
                  Most popular
                </span>
              )}
              <h3 className="font-display text-2xl font-semibold">{p.name}</h3>
              <div className="mt-4 flex items-baseline gap-2">
                <span className="font-display text-5xl font-semibold">{p.price}</span>
                <span className={p.highlight ? "text-ivory/60" : "text-muted-foreground"}>{p.sub}</span>
              </div>
              <ul className="mt-8 space-y-3 text-sm">
                {p.features.map((f) => (
                  <li key={f} className="flex items-start gap-2">
                    <Check className={`mt-0.5 h-4 w-4 shrink-0 ${p.highlight ? "text-coral" : "text-coral"}`} />
                    <span className={p.highlight ? "text-ivory/85" : ""}>{f}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-8 pt-2">
                <Button variant={p.variant} size="lg" className="w-full">
                  {p.cta}
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
