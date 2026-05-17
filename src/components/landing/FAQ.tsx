import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

const faqs = [
  { q: "Is my resume actually ATS-friendly?", a: "Yes. Every template is parsed against the same ATS engines used by Greenhouse, Lever, and Workday. Our scorecard tells you exactly what to fix." },
  { q: "What AI models do you use?", a: "Vogats CV uses our proprietary Vogats AI, specifically fine-tuned for professional writing and ATS optimization." },
  { q: "Can I import from LinkedIn?", a: "Yes. Paste your LinkedIn URL or upload your existing PDF and we'll extract everything into editable sections." },
  { q: "Do you store my data?", a: "Your resumes are private and encrypted. You can delete everything in one click. We never train models on your content." },
  { q: "Is it really a one-time payment?", a: "Yes! No subscriptions or recurring charges. Pay once for the plan you need and keep access to your resume forever." },
];

export function FAQ() {
  return (
    <section id="faq" className="relative py-12 md:py-16 overflow-hidden">
      <div className="container mx-auto max-w-3xl px-6 relative z-10">
        <div className="text-center mb-10">
          <h2 className="text-gradient font-display text-sm font-bold uppercase tracking-[0.3em] mb-4">
            Common Questions
          </h2>
          <h3 className="font-display text-4xl font-bold tracking-tight md:text-5xl text-balance">
            Questions, <span className="opacity-60 italic text-muted">answered.</span>
          </h3>
        </div>

        <Accordion type="single" collapsible className="space-y-4">
          {faqs.map((f, i) => (
            <AccordionItem 
              key={i} 
              value={`item-${i}`} 
              className="border border-border bg-surface/30 backdrop-blur-sm rounded-2xl px-6 py-2 transition-all hover:bg-surface/50"
            >
              <AccordionTrigger className="text-left font-display text-lg font-bold hover:no-underline text-text">
                {f.q}
              </AccordionTrigger>
              <AccordionContent className="text-muted font-medium leading-relaxed pb-6">
                {f.a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}
