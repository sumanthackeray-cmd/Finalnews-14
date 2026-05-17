import { createFileRoute, Link } from "@tanstack/react-router";
import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Footer";
import { useState, useEffect } from "react";
import { 
  FileText, CheckCircle, XCircle, HelpCircle, 
  Clock, RefreshCw, AlertTriangle, ShieldCheck, Mail, ArrowRight 
} from "lucide-react";

export const Route = createFileRoute("/refund")({
  component: RefundPage,
});

const quickCards = [
  {
    icon: "⏱️",
    title: "7-Day Window",
    sub: "Full refund within 7 days of purchase",
    badge: "✓ Guaranteed",
    badgeType: "green",
  },
  {
    icon: "⚡",
    title: "Fast Processing",
    sub: "Refunds processed in 5–10 business days",
    badge: "Stripe / Bank",
    badgeType: "amber",
  },
  {
    icon: "💬",
    title: "Easy Request",
    sub: "Email us or use the contact form",
    badge: "No Forms",
    badgeType: "green",
  },
];

const secs = [
  { id: "s1", label: "Overview" },
  { id: "s2", label: "Eligibility" },
  { id: "s3", label: "Non-Refundable" },
  { id: "s4", label: "How to Request" },
  { id: "s5", label: "Processing Time" },
  { id: "s6", label: "Subscriptions" },
  { id: "s7", label: "Disputes" },
  { id: "s8", label: "Contact" },
];

function RefundPage() {
  const [activeSec, setActiveSec] = useState("s1");

  const scrollToSec = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
      setActiveSec(id);
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      let current = "s1";
      for (const sec of secs) {
        const el = document.getElementById(sec.id);
        if (el) {
          const rect = el.getBoundingClientRect();
          if (rect.top < 140) {
            current = sec.id;
          }
        }
      }
      setActiveSec(current);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-bg text-text flex flex-col">
      <Navbar />

      {/* ── HERO SECTION ── */}
      <section className="relative pt-32 pb-12 md:pt-48 md:pb-16 text-center overflow-hidden">
        {/* Glow Background */}
        <div className="absolute top-[-10%] left-[10%] w-[50%] aspect-square bg-radial-gradient from-accent/10 to-transparent blur-3xl pointer-events-none" />
        
        <div className="container mx-auto max-w-4xl px-6 relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest mb-6 bg-accent/10 text-accent-solid border border-accent/10">
            📋 Legal Policy
          </div>
          <h1 className="font-display font-black text-4xl sm:text-6xl md:text-7xl mb-6 leading-[1.05] tracking-tight">
            Refund &amp; <span className="text-gradient">Return Policy</span>
          </h1>
          <p className="text-muted font-medium text-lg sm:text-xl max-w-2xl mx-auto leading-relaxed mb-6">
            We want you to love Vogats CV. If something isn't right, we make it easy to get your money back — no hassle, no runaround.
          </p>
          
          <div className="inline-flex items-center gap-4 flex-wrap justify-center text-xs font-bold uppercase tracking-widest text-muted">
            <span className="flex items-center gap-2 px-4 py-2 bg-card border border-border rounded-full shadow-sm">
              <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
              Effective: May 1, 2026
            </span>
            <span className="flex items-center gap-2 px-4 py-2 bg-card border border-border rounded-full shadow-sm">
              <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0" />
              7-Day Guarantee
            </span>
          </div>
        </div>
      </section>

      {/* ── QUICK SUMMARY CARDS ── */}
      <section className="pb-12">
        <div className="container mx-auto max-w-4xl px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {quickCards.map((card, i) => (
              <div 
                key={i}
                className="bg-card border border-border rounded-3xl p-6 text-center transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
              >
                <div className="text-3xl mb-3">{card.icon}</div>
                <h3 className="font-display font-black text-sm mb-1">{card.title}</h3>
                <p className="text-xs text-muted font-medium mb-4 leading-relaxed">{card.sub}</p>
                <span className={`inline-block text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full ${
                  card.badgeType === "green" 
                    ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/10"
                    : "bg-amber-500/10 text-amber-500 border border-amber-500/10"
                }`}>
                  {card.badge}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── STICKY TOC PILL BAR ── */}
      <div className="sticky top-[64px] z-50 bg-bg/85 backdrop-blur-md py-4 border-b border-border mb-12 overflow-x-auto no-scrollbar">
        <div className="container mx-auto max-w-3xl px-6 flex gap-3 whitespace-nowrap">
          {secs.map((sec) => (
            <button
              key={sec.id}
              onClick={() => scrollToSec(sec.id)}
              className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all border duration-200 ${
                activeSec === sec.id
                  ? "bg-accent-solid border-accent-solid text-white shadow-md shadow-accent/20"
                  : "bg-card border-border text-muted hover:text-text hover:bg-surface"
              }`}
            >
              {sec.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── LEGAL SECTIONS WRAP ── */}
      <section className="pb-28">
        <div className="container mx-auto max-w-3xl px-6 space-y-10">

          {/* Guarantee Banner */}
          <div className="bg-gradient-to-br from-accent to-purple-600 text-white rounded-[2rem] p-8 md:p-10 text-center relative overflow-hidden shadow-2xl">
            <div className="absolute top-[-30%] right-[-10%] w-[40%] aspect-square bg-white/10 rounded-full blur-2xl pointer-events-none" />
            <div className="absolute bottom-[-30%] left-[-10%] w-[45%] aspect-square bg-white/5 rounded-full blur-2xl pointer-events-none" />
            
            <div className="relative z-10 space-y-4">
              <ShieldCheck className="w-16 h-16 mx-auto text-white/90 drop-shadow" />
              <h3 className="font-display font-black text-2xl md:text-3xl leading-tight">
                Our 7-Day Money-Back Guarantee
              </h3>
              <p className="text-white/80 max-w-md mx-auto text-sm leading-relaxed font-medium">
                Try Vogats CV completely risk-free. If you're not satisfied within 7 days of your purchase, we'll refund you in full — no questions asked.
              </p>
              <div className="pt-2">
                <Link to="/contact" className="inline-flex items-center gap-2 px-8 py-3.5 bg-white text-accent-solid hover:bg-white/90 rounded-2xl text-xs font-black uppercase tracking-widest shadow-xl transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0">
                  <span>Request a Refund</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>

          {/* 1. OVERVIEW */}
          <div id="s1" className="bg-card border border-border rounded-[2.5rem] p-8 md:p-10 space-y-6 scroll-mt-24">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-accent/10 text-accent-solid flex items-center justify-center shrink-0">
                <FileText className="w-6 h-6" />
              </div>
              <div>
                <div className="text-[10px] font-black uppercase tracking-wider text-muted mb-0.5">Section 01</div>
                <h2 className="font-display font-black text-xl leading-tight">Policy Overview</h2>
              </div>
            </div>
            <div className="space-y-4 text-sm leading-relaxed text-muted font-medium">
              <p>
                At Vogats CV, we are committed to delivering a premium AI-powered resume building experience. This Refund &amp; Return Policy outlines the conditions under which you can request a refund for any paid plan purchased on <a href="https://cv.vogats.com" className="text-accent hover:underline">cv.vogats.com</a>.
              </p>
              <p>
                Because our service is entirely digital — no physical products are shipped — our policy is specifically tailored to software subscriptions and AI-generated deliverables.
              </p>
              <div className="flex gap-3 p-4 rounded-2xl bg-accent/5 border border-accent/10 text-accent-solid text-xs">
                <HelpCircle className="w-5 h-5 shrink-0 mt-0.5" />
                <span>This policy applies to all paid subscription plans including Monthly Pro and Annual Pro. Free plan users are not eligible for refunds as no payment is made.</span>
              </div>
            </div>
          </div>

          {/* 2. ELIGIBILITY */}
          <div id="s2" className="bg-card border border-border rounded-[2.5rem] p-8 md:p-10 space-y-6 scroll-mt-24">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center shrink-0">
                <CheckCircle className="w-6 h-6" />
              </div>
              <div>
                <div className="text-[10px] font-black uppercase tracking-wider text-muted mb-0.5">Section 02</div>
                <h2 className="font-display font-black text-xl leading-tight">Refund Eligibility</h2>
              </div>
            </div>
            <div className="space-y-6 text-sm leading-relaxed text-muted font-medium">
              <p>You are eligible for a full refund if all of the following conditions are met:</p>
              
              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-emerald-500/5 border border-emerald-500/15 rounded-2xl p-5">
                  <h4 className="text-[10px] font-black uppercase tracking-wider text-emerald-500 mb-4">✅ Eligible If</h4>
                  <ul className="space-y-3 text-xs">
                    <li className="flex gap-2">✓ Request within 7 days of payment</li>
                    <li className="flex gap-2">✓ First-time purchase of the plan</li>
                    <li className="flex gap-2">✓ Technical issue not resolved in 48 hrs</li>
                    <li className="flex gap-2">✓ Accidental duplicate payment</li>
                    <li className="flex gap-2">✓ Service not as described</li>
                  </ul>
                </div>
                <div className="bg-red-500/5 border border-red-500/15 rounded-2xl p-5">
                  <h4 className="text-[10px] font-black uppercase tracking-wider text-red-500 mb-4">❌ Not Eligible If</h4>
                  <ul className="space-y-3 text-xs">
                    <li className="flex gap-2">✗ Request after 7-day window</li>
                    <li className="flex gap-2">✗ Previously refunded same plan</li>
                    <li className="flex gap-2">✗ Account suspended for violations</li>
                    <li className="flex gap-2">✗ Simply changed mind after 7 days</li>
                    <li className="flex gap-2">✗ Used 80%+ of monthly AI credits</li>
                  </ul>
                </div>
              </div>
              
              <div className="flex gap-3 p-4 rounded-2xl bg-emerald-500/5 border border-emerald-500/10 text-emerald-600 text-xs">
                <CheckCircle className="w-5 h-5 shrink-0 mt-0.5" />
                <span>Technical issues (bugs, AI failures, or gateway problems) are always evaluated individually. We will never deny a refund for a problem that was our fault.</span>
              </div>
            </div>
          </div>

          {/* 3. NON-REFUNDABLE */}
          <div id="s3" className="bg-card border border-border rounded-[2.5rem] p-8 md:p-10 space-y-6 scroll-mt-24">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-red-500/10 text-red-500 flex items-center justify-center shrink-0">
                <XCircle className="w-6 h-6" />
              </div>
              <div>
                <div className="text-[10px] font-black uppercase tracking-wider text-muted mb-0.5">Section 03</div>
                <h2 className="font-display font-black text-xl leading-tight">Non-Refundable Items</h2>
              </div>
            </div>
            <div className="space-y-6 text-sm leading-relaxed text-muted font-medium">
              <p>The following are generally excluded from our refund policy:</p>
              
              <ul className="space-y-4">
                {[
                  "Add-on credits — one-time AI credit top-ups that have been partially or fully used",
                  "Resume downloads — PDF/DOCX files already downloaded to your device",
                  "Renewals past the window — subscription renewals not cancelled before the billing date, unless requested within 48 hours of renewal",
                  "Promotional purchases — plans bought at a special discount event or lifetime deal (unless defective)"
                ].map((item, i) => (
                  <li key={i} className="flex gap-3">
                    <div className="w-5 h-5 rounded bg-red-500/10 text-red-500 flex items-center justify-center shrink-0 text-[10px]">✕</div>
                    <span className="text-xs leading-normal">{item}</span>
                  </li>
                ))}
              </ul>
              
              <div className="flex gap-3 p-4 rounded-2xl bg-amber-500/5 border border-amber-500/10 text-amber-600 text-xs">
                <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
                <span>If you believe an exception should apply to your case, please contact us anyway. We review every situation on a case-by-case basis and are happy to help.</span>
              </div>
            </div>
          </div>

          {/* 4. HOW TO REQUEST */}
          <div id="s4" className="bg-card border border-border rounded-[2.5rem] p-8 md:p-10 space-y-6 scroll-mt-24">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-accent/10 text-accent-solid flex items-center justify-center shrink-0">
                <Mail className="w-6 h-6" />
              </div>
              <div>
                <div className="text-[10px] font-black uppercase tracking-wider text-muted mb-0.5">Section 04</div>
                <h2 className="font-display font-black text-xl leading-tight">How to Request a Refund</h2>
              </div>
            </div>
            <div className="space-y-6 text-sm leading-relaxed text-muted font-medium">
              <p>Requesting a refund is simple and takes less than 2 minutes. Follow these steps:</p>
              
              <div className="relative pl-6 space-y-8 before:absolute before:left-2 before:top-4 before:bottom-4 before:w-[2px] before:bg-border">
                {[
                  { step: "1", title: "Email us or use the contact form", desc: "Send a message to support@vogats.com or visit our contact page with the subject line 'Refund Request'." },
                  { step: "2", title: "Include your order details", desc: "Provide your registered email address, the plan name, and the date of purchase. A short reason helps us improve our product." },
                  { step: "3", title: "We confirm & process", desc: "Our team will confirm your refund eligibility within 24 hours and initiate the refund immediately if approved." },
                  { step: "4", title: "Refund arrives in your account", desc: "Funds are returned to your original payment method within 5–10 business days depending on your bank or card provider." }
                ].map((t, i) => (
                  <div key={i} className="relative">
                    <div className="absolute -left-[30px] top-0 w-5 h-5 rounded-full bg-accent-solid text-white flex items-center justify-center text-[10px] font-black">
                      {t.step}
                    </div>
                    <div>
                      <strong className="block text-sm font-bold text-text mb-1">{t.title}</strong>
                      <span className="text-xs text-muted leading-relaxed block">{t.desc}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* 5. PROCESSING TIME */}
          <div id="s5" className="bg-card border border-border rounded-[2.5rem] p-8 md:p-10 space-y-6 scroll-mt-24">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center shrink-0">
                <Clock className="w-6 h-6" />
              </div>
              <div>
                <div className="text-[10px] font-black uppercase tracking-wider text-muted mb-0.5">Section 05</div>
                <h2 className="font-display font-black text-xl leading-tight">Processing Time</h2>
              </div>
            </div>
            <div className="space-y-6 text-sm leading-relaxed text-muted font-medium">
              <ul className="space-y-4">
                {[
                  { label: "Review & approval:", val: "Within 24–48 hours of your refund request" },
                  { label: "Initiation:", val: "Refund initiated immediately upon approval" },
                  { label: "Credit / Debit Cards:", val: "5–10 business days to appear on your statement" },
                  { label: "UPI / Net Banking (India):", val: "3–7 business days" },
                  { label: "PayPal:", val: "1–3 business days" }
                ].map((item, i) => (
                  <li key={i} className="flex gap-3">
                    <div className="w-5 h-5 rounded bg-accent/15 text-accent-solid flex items-center justify-center shrink-0 text-xs">→</div>
                    <span className="text-xs">
                      <strong>{item.label}</strong> {item.val}
                    </span>
                  </li>
                ))}
              </ul>
              
              <div className="flex gap-3 p-4 rounded-2xl bg-amber-500/5 border border-amber-500/10 text-amber-600 text-xs">
                <Clock className="w-5 h-5 shrink-0 mt-0.5" />
                <span>Bank processing times are beyond our control. If your refund hasn't appeared after 10 business days, contact us and we will provide a reference number.</span>
              </div>
            </div>
          </div>

          {/* 6. SUBSCRIPTIONS */}
          <div id="s6" className="bg-card border border-border rounded-[2.5rem] p-8 md:p-10 space-y-6 scroll-mt-24">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center shrink-0">
                <RefreshCw className="w-6 h-6" />
              </div>
              <div>
                <div className="text-[10px] font-black uppercase tracking-wider text-muted mb-0.5">Section 06</div>
                <h2 className="font-display font-black text-xl leading-tight">Subscriptions &amp; Cancellation</h2>
              </div>
            </div>
            <div className="space-y-6 text-sm leading-relaxed text-muted font-medium">
              <p>Vogats CV subscriptions automatically renew at the end of each billing cycle. Here's how cancellation works:</p>
              
              <ul className="space-y-4">
                {[
                  "Cancel anytime from your Account Settings → Billing with one click",
                  "After cancellation, you retain full access until the end of your current billing period",
                  "Renewal refunds requested within 48 hours of the renewal charge will be honored in full",
                  "Cancellation does not automatically trigger a refund — you must request one separately",
                  "Annual plans: If cancelled after the 7-day window, no prorated refund is provided for the unused months"
                ].map((item, i) => (
                  <li key={i} className="flex gap-3">
                    <div className="w-5 h-5 rounded bg-emerald-500/10 text-emerald-500 flex items-center justify-center shrink-0 text-xs">✓</div>
                    <span className="text-xs">{item}</span>
                  </li>
                ))}
              </ul>
              
              <div className="flex gap-3 p-4 rounded-2xl bg-emerald-500/5 border border-emerald-500/10 text-emerald-600 text-xs">
                <ShieldCheck className="w-5 h-5 shrink-0 mt-0.5" />
                <span>Tip: If you're unsure whether to continue, downgrade to the free plan instead of cancelling — you won't lose your saved resumes.</span>
              </div>
            </div>
          </div>

          {/* 7. DISPUTES */}
          <div id="s7" className="bg-card border border-border rounded-[2.5rem] p-8 md:p-10 space-y-6 scroll-mt-24">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-surface/50 text-text flex items-center justify-center shrink-0">
                ⚖️
              </div>
              <div>
                <div className="text-[10px] font-black uppercase tracking-wider text-muted mb-0.5">Section 07</div>
                <h2 className="font-display font-black text-xl leading-tight">Disputes &amp; Chargebacks</h2>
              </div>
            </div>
            <div className="space-y-4 text-sm leading-relaxed text-muted font-medium">
              <p>
                We strongly encourage you to contact us directly before initiating a chargeback with your bank or card provider. We resolve almost all disputes quickly and amicably.
              </p>
              <ul className="space-y-3">
                <li className="flex gap-3">
                  <div className="w-5 h-5 rounded bg-emerald-500/10 text-emerald-500 flex items-center justify-center shrink-0 text-xs">✓</div>
                  <span className="text-xs">Contact our support team first — we typically resolve disputes within 24 hours</span>
                </li>
                <li className="flex gap-3">
                  <div className="w-5 h-5 rounded bg-emerald-500/10 text-emerald-500 flex items-center justify-center shrink-0 text-xs">✓</div>
                  <span className="text-xs">For unresolved issues, you have the right to escalate to your payment provider</span>
                </li>
                <li className="flex gap-3">
                  <div className="w-5 h-5 rounded bg-red-500/10 text-red-500 flex items-center justify-center shrink-0 text-[10px]">✕</div>
                  <span className="text-xs">Fraudulent chargebacks may result in account suspension and referral to Stripe</span>
                </li>
              </ul>
            </div>
          </div>

          {/* 8. CONTACT */}
          <div id="s8" className="bg-card border border-border rounded-[2.5rem] p-8 md:p-10 space-y-6 scroll-mt-24">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-accent/10 text-accent-solid flex items-center justify-center shrink-0">
                💬
              </div>
              <div>
                <div className="text-[10px] font-black uppercase tracking-wider text-muted mb-0.5">Section 08</div>
                <h2 className="font-display font-black text-xl leading-tight">Contact &amp; Refund Requests</h2>
              </div>
            </div>
            <div className="space-y-6 text-sm leading-relaxed text-muted font-medium">
              <div className="grid md:grid-cols-2 gap-8 items-start">
                <div>
                  <h3 className="font-display font-black text-lg text-text mb-2">Get in touch</h3>
                  <p className="text-xs leading-relaxed">
                    Our support team is available Monday–Saturday, 9 AM–7 PM IST. We typically respond within 4 hours.
                  </p>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-3 bg-surface border border-border rounded-xl">
                    <span className="text-xl">📧</span>
                    <div className="text-xs">
                      <strong className="block text-text">support@vogats.com</strong>
                      <span>Refunds &amp; billing queries</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-surface border border-border rounded-xl">
                    <span className="text-xl">🌐</span>
                    <div className="text-xs">
                      <Link to="/contact" className="strong block text-text hover:underline">cv.vogats.com/contact</Link>
                      <span>Online contact form</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </section>

      <Footer />
    </div>
  );
}
