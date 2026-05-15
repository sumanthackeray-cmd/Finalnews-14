const quotes = [
  { q: "Got 4 callbacks in the first week. The ATS score nudges are unreal.", a: "Maya R.", r: "Product Designer · Stripe" },
  { q: "Replaced my $400 resume coach. Honestly better, definitely faster.", a: "Jordan K.", r: "Eng Manager · ex-Meta" },
  { q: "I rewrote my whole resume on the train. Hired two weeks later.", a: "Priya S.", r: "Data Scientist" },
];

export function Testimonials() {
  return (
    <section className="bg-background py-24 md:py-32">
      <div className="container mx-auto max-w-7xl px-6">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-medium uppercase tracking-widest text-coral">Testimonials</p>
          <h2 className="mt-4 font-display text-4xl font-semibold tracking-tight md:text-5xl text-balance">
            People are getting hired.
          </h2>
        </div>
        <div className="mt-16 grid gap-6 md:grid-cols-3">
          {quotes.map((t) => (
            <figure
              key={t.a}
              className="rounded-3xl border border-border bg-card p-8 shadow-soft"
            >
              <blockquote className="font-display text-xl leading-snug text-balance">
                "{t.q}"
              </blockquote>
              <figcaption className="mt-6 text-sm">
                <div className="font-semibold">{t.a}</div>
                <div className="text-muted-foreground">{t.r}</div>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
