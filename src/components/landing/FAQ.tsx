import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

const faqs = [
  { q: "Is my resume actually ATS-friendly?", a: "Yes. Every template is parsed against the same ATS engines used by Greenhouse, Lever, and Workday. Our scorecard tells you exactly what to fix." },
  { q: "What AI models do you use?", a: "We route between OpenAI GPT-5 and Google Gemini through Lovable AI, picking the right model for each task — fast for rewrites, deep for tailoring." },
  { q: "Can I import from LinkedIn?", a: "Yes. Paste your LinkedIn URL or upload your existing PDF and we'll extract everything into editable sections." },
  { q: "Do you store my data?", a: "Your resumes are private and encrypted. You can delete everything in one click. We never train models on your content." },
  { q: "Can I cancel any time?", a: "Of course. Cancel from the dashboard — keep access until the end of your billing period." },
];

export function FAQ() {
  return (
    <section id="faq" className="bg-background py-24 md:py-32">
      <div className="container mx-auto max-w-3xl px-6">
        <div className="text-center">
          <p className="text-sm font-medium uppercase tracking-widest text-coral">FAQ</p>
          <h2 className="mt-4 font-display text-4xl font-semibold tracking-tight md:text-5xl text-balance">
            Questions, answered.
          </h2>
        </div>
        <Accordion type="single" collapsible className="mt-12">
          {faqs.map((f, i) => (
            <AccordionItem key={i} value={`item-${i}`} className="border-border">
              <AccordionTrigger className="text-left font-display text-lg font-medium hover:no-underline">
                {f.q}
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground">{f.a}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}
