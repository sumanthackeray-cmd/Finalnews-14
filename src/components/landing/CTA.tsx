import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { useAuth } from "@/hooks/use-auth";

export function CTA() {
  const { user } = useAuth();

  return (
    <section className="px-6 pb-12 md:pb-16 relative overflow-hidden">
      <div className="container mx-auto max-w-7xl">
        <div className="relative overflow-hidden rounded-[3rem] bg-surface border border-border px-8 py-12 text-center shadow-2xl md:px-16 md:py-20 group">
          {/* Background Decorative Elements */}
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-accent/5 via-transparent to-accent-secondary/5 -z-10" />
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-accent/10 rounded-full blur-[100px] group-hover:bg-accent/20 transition-colors duration-1000" />
          <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-accent-secondary/10 rounded-full blur-[100px] group-hover:bg-accent-secondary/20 transition-colors duration-1000" />
          
          <div className="relative mx-auto max-w-3xl">
            <div className="mb-8 inline-flex items-center gap-2 rounded-full bg-accent/10 px-4 py-1.5 text-[10px] font-bold uppercase tracking-widest text-accent">
              <Sparkles className="h-3 w-3" />
              <span>Limited Time Free Access</span>
            </div>
            
            <h2 className="font-display text-4xl font-bold tracking-tight md:text-7xl text-balance mb-8">
              Your dream job is <br />
              <span className="text-gradient">one click away.</span>
            </h2>
            
            <p className="mt-6 text-lg md:text-xl text-muted font-medium text-balance mb-12 max-w-2xl mx-auto leading-relaxed">
              Join thousands of professionals landing roles at top companies. 
              Build, score, and optimize your resume with Vogats AI.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to={user ? "/dashboard" : "/auth"} className="w-full sm:w-auto">
                <button className="btn-premium w-full sm:w-auto px-12 py-5 text-lg font-bold shadow-2xl flex items-center justify-center gap-3 group">
                  Build my resume now
                  <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-2" />
                </button>
              </Link>
            </div>
            
            <p className="mt-8 text-xs font-bold text-muted-foreground uppercase tracking-widest opacity-60">
              No credit card required to start
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
