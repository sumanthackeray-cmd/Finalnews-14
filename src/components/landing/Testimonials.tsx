import { Star } from "lucide-react";

const quotes = [
  { q: "Got 4 callbacks in the first week. The ATS score nudges are unreal.", a: "Maya R.", r: "Product Designer · Stripe" },
  { q: "Replaced my $400 resume coach. Honestly better, definitely faster.", a: "Jordan K.", r: "Eng Manager · ex-Meta" },
  { q: "I rewrote my whole resume on the train. Hired two weeks later.", a: "Priya S.", r: "Data Scientist" },
];

export function Testimonials() {
  return (
    <section className="relative py-12 md:py-16 overflow-hidden bg-surface/10">
      <div className="container mx-auto max-w-7xl px-6 relative z-10">
        <div className="mx-auto max-w-3xl text-center mb-10">
          <h2 className="text-gradient font-display text-sm font-bold uppercase tracking-[0.3em] mb-4">
            Testimonials
          </h2>
          <h3 className="font-display text-4xl font-bold tracking-tight md:text-5xl text-balance">
            Real success stories from <br />
            <span className="opacity-60 italic text-muted">real candidates.</span>
          </h3>
        </div>

        <div className="grid gap-8 md:grid-cols-3">
          {quotes.map((t) => (
            <figure
              key={t.a}
              className="group relative flex flex-col justify-between rounded-[2.5rem] border border-border bg-surface/30 p-10 backdrop-blur-sm transition-all duration-500 hover:border-accent/40 hover:bg-surface/50"
            >
              <div className="absolute top-8 right-10 flex gap-0.5 opacity-20 group-hover:opacity-100 transition-opacity">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="h-3 w-3 fill-accent text-accent" />
                ))}
              </div>
              
              <blockquote className="font-display text-xl leading-relaxed text-text mb-10">
                "{t.q}"
              </blockquote>
              
              <figcaption className="flex items-center gap-4">
                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-accent to-accent-secondary flex items-center justify-center font-bold text-white text-xs">
                  {t.a.charAt(0)}
                </div>
                <div className="text-sm">
                  <div className="font-bold text-text">{t.a}</div>
                  <div className="text-xs text-muted font-medium">{t.r}</div>
                </div>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
