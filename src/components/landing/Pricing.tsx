import { useState, useEffect } from "react";
import { Check, Zap, ShieldCheck, Crown, Shield, X, Loader2, CreditCard, Smartphone, Sparkles } from "lucide-react";
import { PLANS as APP_PLANS, PlanId } from "@/lib/subscription";
import { useNavigate } from "@tanstack/react-router";
import { useAuth } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";

/* ─── Plan data mapped from App Config ────────────────────────────── */
const DISPLAY_PLANS = [
  {
    id: "STARTER" as PlanId,
    name: APP_PLANS.STARTER.label,
    icon: <Zap className="w-5 h-5" />,
    iconColor: "text-amber-500",
    validity: `${APP_PLANS.STARTER.durationDays} DAYS`,
    price: APP_PLANS.STARTER.price,
    popular: false,
    features: APP_PLANS.STARTER.perks,
    btn: "Get Started",
    accent: "bg-amber-500/10",
  },
  {
    id: "PRO" as PlanId,
    name: APP_PLANS.PRO.label,
    icon: <ShieldCheck className="w-5 h-5" />,
    iconColor: "text-accent",
    validity: `${APP_PLANS.PRO.durationDays} DAYS`,
    price: APP_PLANS.PRO.price,
    popular: true,
    features: APP_PLANS.PRO.perks,
    btn: "Go Pro Now",
    accent: "bg-accent/10",
  },
  {
    id: "UNLIMITED" as PlanId,
    name: APP_PLANS.UNLIMITED.label,
    icon: <Crown className="w-5 h-5" />,
    iconColor: "text-emerald-500",
    validity: `${APP_PLANS.UNLIMITED.durationDays} DAYS`,
    price: APP_PLANS.UNLIMITED.price,
    popular: false,
    features: APP_PLANS.UNLIMITED.perks,
    btn: "Unlock All",
    accent: "bg-emerald-500/10",
  },
];

const CASHFREE_ENV = (import.meta.env.VITE_CASHFREE_ENV as string) || "sandbox";

function getCashfreePaymentUrl(sessionId: string): string {
  if (CASHFREE_ENV === "production") {
    return `https://payments.cashfree.com/order/#${sessionId}`;
  }
  return `https://payments-test.cashfree.com/order/#${sessionId}`;
}

/* ─── Checkout Modal ────────────────────────────────────────── */
function CheckoutModal({ plan, onClose, userProfile }: { plan: any, onClose: () => void, userProfile?: any }) {
  const [form, setForm] = useState({ 
    name: userProfile?.displayName || "", 
    email: userProfile?.email || "", 
    phone: "" 
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [step, setStep] = useState<"form" | "loading" | "error">("form");
  const [errMsg, setErrMsg] = useState("");

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = "Name is required";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = "Valid email required";
    if (!/^[6-9]\d{9}$/.test(form.phone)) e.phone = "Valid 10-digit mobile required";
    return e;
  };

  const handlePay = async () => {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    setStep("loading");
    try {
      const res = await fetch("/api/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName: form.name.trim(),
          customerEmail: form.email.trim().toLowerCase(),
          customerPhone: form.phone.trim(),
          amount: plan.price,
          planName: plan.name,
          planId: plan.id,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.payment_session_id) throw new Error(data.error || "Order creation failed.");
      window.location.href = getCashfreePaymentUrl(data.payment_session_id);
    } catch (err: any) {
      setStep("error"); setErrMsg(err.message || "Failed to process payment.");
    }
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-bg/80 backdrop-blur-xl animate-in fade-in duration-300">
      <div 
        className="relative w-full max-w-lg bg-card border border-border rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 p-2 rounded-full bg-surface hover:bg-muted/10 text-muted-foreground transition-colors z-10"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="p-8 md:p-12">
          <div className="flex items-center gap-4 mb-8">
            <div className={cn("p-4 rounded-2xl", plan.accent, plan.iconColor)}>
              {plan.icon}
            </div>
            <div>
              <h2 className="text-2xl font-display font-bold">{plan.name} Plan</h2>
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Secure Checkout</p>
            </div>
          </div>

          <div className="flex items-baseline gap-2 mb-10">
            <span className="text-5xl font-display font-black tracking-tighter">₹{plan.price}</span>
            <span className="text-sm font-medium text-muted-foreground">one-time</span>
          </div>

          {step === "form" && (
            <div className="space-y-6">
              <div className="space-y-4">
                <div>
                  <input
                    type="text" placeholder="Full Name"
                    value={form.name}
                    onChange={e => setForm({ ...form, name: e.target.value })}
                    className={cn(
                      "w-full h-12 px-5 bg-surface border rounded-xl text-sm outline-none transition-all",
                      errors.name ? "border-red-500" : "border-border focus:border-accent"
                    )}
                  />
                  {errors.name && <p className="text-[10px] text-red-500 mt-1.5 ml-1 font-bold uppercase">{errors.name}</p>}
                </div>
                <div>
                  <input
                    type="email" placeholder="Email Address"
                    value={form.email}
                    onChange={e => setForm({ ...form, email: e.target.value })}
                    className={cn(
                      "w-full h-12 px-5 bg-surface border rounded-xl text-sm outline-none transition-all",
                      errors.email ? "border-red-500" : "border-border focus:border-accent"
                    )}
                  />
                  {errors.email && <p className="text-[10px] text-red-500 mt-1.5 ml-1 font-bold uppercase">{errors.email}</p>}
                </div>
                <div className="flex">
                  <div className="h-12 px-4 flex items-center justify-center bg-muted/10 border border-r-0 border-border rounded-l-xl text-xs font-bold text-muted-foreground">
                    +91
                  </div>
                  <input
                    type="tel" maxLength={10} placeholder="Mobile Number"
                    value={form.phone}
                    onChange={e => setForm({ ...form, phone: e.target.value.replace(/\D/g, "") })}
                    className={cn(
                      "flex-1 h-12 px-5 bg-surface border rounded-r-xl text-sm outline-none transition-all",
                      errors.phone ? "border-red-500" : "border-border focus:border-accent"
                    )}
                  />
                </div>
                {errors.phone && <p className="text-[10px] text-red-500 mt-1.5 ml-1 font-bold uppercase">{errors.phone}</p>}
              </div>

              <button 
                onClick={handlePay}
                className="w-full btn-premium py-5 text-sm font-bold shadow-xl"
              >
                Complete Payment ₹{plan.price}
              </button>
              
              <div className="flex items-center justify-center gap-6 pt-4 grayscale opacity-40">
                <Smartphone className="w-4 h-4" />
                <CreditCard className="w-4 h-4" />
                <Shield className="w-4 h-4" />
              </div>
            </div>
          )}

          {step === "loading" && (
            <div className="py-20 flex flex-col items-center justify-center gap-4">
              <Loader2 className="w-10 h-10 animate-spin text-accent" />
              <p className="font-display font-bold text-lg">Initializing Secure Payment...</p>
            </div>
          )}

          {step === "error" && (
            <div className="py-20 flex flex-col items-center justify-center text-center gap-6">
              <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center text-red-500">
                <X className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-xl font-bold mb-2">Payment Failed</h3>
                <p className="text-sm text-muted-foreground">{errMsg}</p>
              </div>
              <button 
                onClick={() => setStep("form")}
                className="btn-premium px-8 py-3 text-xs font-bold"
              >
                Try Again
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ─── Plan Card Component ─────────────────────────────────────────── */
function PlanCard({ plan, onSelect }: { plan: any, onSelect: (p: any) => void }) {
  return (
    <div
      className={cn(
        "group relative flex flex-col p-8 sm:p-10 rounded-[2.5rem] transition-all duration-500 border-2",
        plan.popular 
          ? "bg-card border-accent shadow-2xl scale-105 z-10" 
          : "bg-card/50 border-border hover:border-accent/40 shadow-lg hover:shadow-xl backdrop-blur-sm"
      )}
    >
      {plan.popular && (
        <div className="absolute -top-5 left-1/2 -translate-x-1/2 px-6 py-2.5 rounded-full bg-gradient-to-r from-[#4f46e5] via-[#6366f1] to-[#4f46e5] bg-[length:200%_auto] animate-gradient text-white text-[10px] font-black uppercase tracking-[0.2em] shadow-[0_15px_30px_-10px_rgba(79,70,229,0.6)] z-20 flex items-center gap-2 min-w-max ring-4 ring-white dark:ring-slate-900 transition-all group-hover:-top-6">
          <Sparkles className="w-3.5 h-3.5 fill-white animate-pulse" />
          Recommended Plan
        </div>
      )}

      {/* Decorative Glow for Popular Plan */}
      {plan.popular && (
        <div className="absolute -inset-1 rounded-[2.6rem] bg-gradient-to-br from-accent/20 via-accent-secondary/20 to-accent/20 -z-10 blur-2xl opacity-40 group-hover:opacity-60 transition-opacity animate-pulse-slow" />
      )}

      <div className="flex items-center gap-4 mb-8">
        <div className={cn(
          "w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-500 group-hover:scale-110", 
          plan.popular ? "bg-accent/10 text-accent" : "bg-muted/10 text-muted"
        )}>
          {plan.icon}
        </div>
        <div>
          <h3 className="text-xl sm:text-2xl font-display font-black tracking-tight text-text">{plan.name}</h3>
          <p className="text-[10px] font-bold text-muted uppercase tracking-[0.2em]">{plan.validity}</p>
        </div>
      </div>

      <div className="mb-8">
        <div className="flex items-baseline gap-1.5">
          <span className="text-5xl sm:text-7xl font-display font-black tracking-tighter text-text">₹{plan.price}</span>
          <span className="text-xs font-black text-muted uppercase tracking-widest opacity-50">One-time</span>
        </div>
        <div className="mt-3 inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-soft border border-border">
          <ShieldCheck className="w-3.5 h-3.5 text-accent" />
          <span className="text-[11px] font-bold text-muted uppercase tracking-wider">Pay once, keep forever</span>
        </div>
      </div>

      <div className="space-y-4 mb-12 flex-1">
        {plan.features.map((f: string, i: number) => (
          <div key={i} className="flex items-start gap-3 group/item">
             <div className={cn(
               "mt-1 flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center transition-colors",
               plan.popular ? "bg-accent/10 text-accent" : "bg-muted/10 text-muted"
             )}>
                <Check className="w-3 h-3" strokeWidth={4} />
             </div>
             <span className={cn(
               "text-[14px] leading-snug transition-colors", 
               f.toLowerCase().includes("pdf + word") || f.toLowerCase().includes("unlimited") 
                 ? "text-text font-bold" 
                 : "text-muted group-hover/item:text-text"
             )}>
              {f}
             </span>
          </div>
        ))}
      </div>

      <button
        onClick={() => onSelect(plan)}
        className={cn(
          "w-full py-4 sm:py-5 rounded-2xl font-display font-black text-sm uppercase tracking-widest transition-all duration-300 active:scale-[0.98]",
          plan.popular 
            ? "btn-premium" 
            : "bg-soft border-2 border-border hover:border-accent hover:text-accent"
        )}
      >
        {plan.btn}
      </button>
    </div>
  );
}

/* ─── Main Pricing Section ────────────────────────────────────────── */
export function Pricing() {
  const nav = useNavigate();
  const { user } = useAuth();
  const [selectedPlan, setSelectedPlan] = useState<any>(null);

  const handleSelect = (plan: any) => {
    if (!user) {
      nav({ to: "/auth", search: { redirect: `/dashboard?buy=${plan.id}` } });
    } else {
      setSelectedPlan(plan);
    }
  };

  return (
    <section id="pricing" className="relative py-12 md:py-24 overflow-hidden bg-bg">
      {/* Ambient backgrounds */}
      <div className="absolute top-[-200px] right-[-300px] w-[800px] h-[800px] bg-[radial-gradient(circle,var(--accent),transparent_70%)] opacity-[0.05] pointer-events-none" />
      <div className="absolute bottom-0 left-[-200px] w-[600px] h-[600px] bg-[radial-gradient(circle,var(--accent-secondary),transparent_70%)] opacity-[0.03] pointer-events-none" />

      <div className="container mx-auto max-w-7xl px-4 sm:px-6 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-20">
           <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-accent/10 border border-accent/20 px-5 py-2 text-[11px] font-black uppercase tracking-[0.2em] text-accent">
             <Crown className="w-3.5 h-3.5" />
             <span>Invest In Your Career</span>
           </div>
           <h3 className="font-display text-4xl font-black tracking-tight md:text-7xl text-balance mb-8 text-text">
             Elite resume tools. <br />
             <span className="text-gradient">No monthly fees.</span>
           </h3>
           <p className="text-base sm:text-xl text-muted font-medium max-w-2xl mx-auto leading-relaxed">
             Join 50,000+ top-tier candidates who chose Vogats CV. Get lifetime access to every professional feature with a single secure payment.
           </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-center max-w-6xl mx-auto">
          {DISPLAY_PLANS.map((plan) => (
            <PlanCard key={plan.id} plan={plan} onSelect={handleSelect} />
          ))}
        </div>

        {/* Trust Badges */}
        <div className="mt-24 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
          {[
            { icon: Shield, text: "256-bit SSL Secure" },
            { icon: Zap, text: "Instant Activation" },
            { icon: CreditCard, text: "All Payment Modes" },
            { icon: Crown, text: "Lifetime Access" }
          ].map((item, i) => (
            <div key={i} className="flex flex-col items-center p-6 rounded-3xl bg-surface border border-border group hover:bg-white dark:hover:bg-white/5 transition-all">
              <item.icon className="w-6 h-6 text-accent mb-3 group-hover:scale-110 transition-transform" />
              <span className="text-[10px] font-black text-muted uppercase tracking-widest">{item.text}</span>
            </div>
          ))}
        </div>
      </div>

      {selectedPlan && (
        <CheckoutModal 
          plan={selectedPlan} 
          onClose={() => setSelectedPlan(null)} 
          userProfile={user}
        />
      )}
    </section>
  );
}
