import { createFileRoute } from "@tanstack/react-router";
import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Footer";
import { Mail, Phone, MapPin, MessageSquare, Sparkles } from "lucide-react";
import { Card } from "@/components/ui/card";

export const Route = createFileRoute("/contact")({
  component: ContactPage,
});

function ContactPage() {
  return (
    <div className="min-h-screen bg-bg text-text flex flex-col">
      <Navbar />
      <main className="flex-1 container mx-auto max-w-5xl px-6 py-32 md:py-48">
        <div className="text-center mb-24">
          <h2 className="text-gradient font-display text-sm font-bold uppercase tracking-[0.3em] mb-4">
            Get in Touch
          </h2>
          <h1 className="font-display text-5xl font-bold md:text-7xl mb-6">
            We're here to <span className="opacity-60 italic text-muted">help.</span>
          </h1>
          <p className="text-muted font-medium text-lg max-w-2xl mx-auto">
            Have questions about Vogats CV? Our team and AI assistant are ready to assist you.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-12 items-stretch">
          <div className="space-y-10">
            <h2 className="text-3xl font-bold font-display">Contact Information</h2>
            <div className="space-y-8">
              {[
                { icon: Mail, label: "Email", val: "support@vogats.com", color: "text-accent" },
                { icon: Phone, label: "Phone", val: "+1 (555) 000-0000", color: "text-accent-secondary" },
                { icon: MapPin, label: "Office", val: "San Francisco, CA", color: "text-emerald-500" },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-6 group">
                  <div className={`w-14 h-14 rounded-2xl bg-surface border border-border shadow-inner flex items-center justify-center ${item.color} group-hover:scale-110 transition-transform duration-500`}>
                    <item.icon className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">{item.label}</p>
                    <p className="text-lg font-bold">{item.val}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-br from-accent to-accent-secondary rounded-[2.5rem] blur opacity-20 group-hover:opacity-40 transition-opacity" />
            <Card className="relative h-full p-10 bg-surface/50 backdrop-blur-xl border-border rounded-[2.5rem] flex flex-col items-center text-center justify-center">
              <div className="w-20 h-20 rounded-3xl bg-accent/10 flex items-center justify-center text-accent mb-8 shadow-inner">
                <MessageSquare className="w-10 h-10" />
              </div>
              <h3 className="text-2xl font-display font-bold mb-4">Instant AI Help</h3>
              <p className="text-muted font-medium mb-8 leading-relaxed">
                Our AI assistant is trained to help you with resume building, 
                formatting tips, and technical support 24/7.
              </p>
              <div className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-accent/10 text-accent font-bold text-sm">
                <Sparkles className="w-4 h-4" />
                <span>Click the chat icon below</span>
              </div>
            </Card>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
