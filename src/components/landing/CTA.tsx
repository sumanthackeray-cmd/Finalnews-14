import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export function CTA() {
  return (
    <section className="px-6 pb-24 md:pb-32">
      <div className="container mx-auto max-w-7xl">
        <div className="relative overflow-hidden rounded-[2.5rem] bg-ink px-8 py-20 text-center text-ivory shadow-elegant md:px-16 md:py-28 grain">
          <div className="absolute inset-0 bg-gradient-coral opacity-20" />
          <div className="relative mx-auto max-w-2xl">
            <h2 className="font-display text-4xl font-semibold tracking-tight md:text-6xl text-balance">
              Your next role is one resume away.
            </h2>
            <p className="mt-6 text-lg text-ivory/75 text-balance">
              Build, score, and export your AI-tailored resume in under five minutes.
            </p>
            <div className="mt-10">
              <Button variant="coral" size="xl" className="group">
                Build my resume free
                <ArrowRight className="transition-transform group-hover:translate-x-1" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
