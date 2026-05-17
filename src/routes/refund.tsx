import { createFileRoute, Link } from "@tanstack/react-router";
import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Footer";
import { useState, useEffect } from "react";
import {
  ShieldCheck, CheckCircle, XCircle, Clock, RefreshCw,
  AlertTriangle, Mail, ArrowRight, ChevronDown, Star
} from "lucide-react";

export const Route = createFileRoute("/refund")({
  component: RefundPage,
});

const toc = [
  { id: "s1", label: "Overview" },
  { id: "s2", label: "Eligibility" },
  { id: "s3", label: "Non-Refundable" },
  { id: "s4", label: "How to Request" },
  { id: "s5", label: "Processing Time" },
  { id: "s6", label: "Subscriptions" },
  { id: "s7", label: "Disputes" },
  { id: "s8", label: "Contact" },
];

const stats = [
  { icon: "⏱️", value: "7 Days", label: "Money-Back Window", color: "from-violet-500/20 to-indigo-500/20", border: "border-violet-500/20" },
  { icon: "⚡", value: "48 hrs", label: "Approval Time", color: "from-amber-500/20 to-orange-500/20", border: "border-amber-500/20" },
  { icon: "✅", value: "100%", label: "Full Refund Guaranteed", color: "from-emerald-500/20 to-teal-500/20", border: "border-emerald-500/20" },
  { icon: "💬", value: "4 hrs", label: "Avg Response Time", color: "from-sky-500/20 to-blue-500/20", border: "border-sky-500/20" },
];

type SectionProps = {
  id: string;
  num: string;
  icon: React.ReactNode;
  iconBg: string;
  title: string;
  children: React.ReactNode;
};

function Section({ id, num, icon, iconBg, title, children }: SectionProps) {
  const [open, setOpen] = useState(true);
  return (
    <div
      id={id}
      className="rounded-3xl border border-border overflow-hidden scroll-mt-28 transition-all duration-300"
      style={{ backgroundColor: "var(--card)" }}
    >
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between gap-4 px-6 py-5 text-left"
      >
        <div className="flex items-center gap-4">
          <div className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 ${iconBg}`}>
            {icon}
          </div>
          <div>
            <div className="text-[9px] font-black uppercase tracking-[0.2em] text-muted mb-0.5">{num}</div>
            <h2 className="font-display font-black text-base sm:text-lg leading-tight text-text">{title}</h2>
          </div>
        </div>
        <ChevronDown className={`w-5 h-5 text-muted shrink-0 transition-transform duration-300 ${open ? "rotate-180" : ""}`} />
      </button>
      <div className={`overflow-hidden transition-all duration-400 ${open ? "max-h-[2000px] opacity-100" : "max-h-0 opacity-0"}`}>
        <div className="px-6 pb-6 space-y-4 text-sm text-muted leading-relaxed font-medium border-t border-border pt-5">
          {children}
        </div>
      </div>
    </div>
  );
}

function InfoBox({ type, children }: { type: "blue" | "green" | "amber" | "red"; children: React.ReactNode }) {
  const styles = {
    blue:  "bg-accent/5 border-accent/15 text-accent-solid",
    green: "bg-emerald-500/5 border-emerald-500/15 text-emerald-600",
    amber: "bg-amber-500/5 border-amber-500/15 text-amber-600",
    red:   "bg-red-500/5 border-red-500/15 text-red-500",
  };
  const icons = { blue: "ℹ️", green: "💚", amber: "⚠️", red: "🚫" };
  return (
    <div className={`flex gap-3 p-4 rounded-2xl border text-xs ${styles[type]}`}>
      <span className="shrink-0 mt-0.5">{icons[type]}</span>
      <span>{children}</span>
    </div>
  );
}

function Check({ color = "green", children }: { color?: "green" | "red" | "amber"; children: React.ReactNode }) {
  const s = {
    green: "bg-emerald-500/10 text-emerald-500",
    red: "bg-red-500/10 text-red-500",
    amber: "bg-amber-500/10 text-amber-500",
  };
  const icons = { green: "✓", red: "✕", amber: "⚠" };
  return (
    <li className="flex gap-3 items-start">
      <div className={`w-5 h-5 rounded-md flex items-center justify-center shrink-0 text-[10px] font-black mt-0.5 ${s[color]}`}>
        {icons[color]}
      </div>
      <span className="text-xs text-muted leading-relaxed">{children}</span>
    </li>
  );
}

function RefundPage() {
  const [activeSec, setActiveSec] = useState("s1");

  const scrollToSec = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
    setActiveSec(id);
  };

  useEffect(() => {
    const onScroll = () => {
      let cur = "s1";
      for (const s of toc) {
        const el = document.getElementById(s.id);
        if (el && el.getBoundingClientRect().top < 140) cur = s.id;
      }
      setActiveSec(cur);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: "var(--bg)", color: "var(--text)" }}>
      <Navbar />

      {/* ── HERO ── */}
      <section className="relative pt-32 pb-16 md:pt-44 md:pb-24 text-center overflow-hidden">
        {/* bg glows */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[400px]"
            style={{ background: "radial-gradient(ellipse at center top, rgba(99,102,241,0.13) 0%, transparent 70%)" }} />
          <div className="absolute bottom-0 right-0 w-[400px] h-[300px]"
            style={{ background: "radial-gradient(ellipse at right bottom, rgba(6,182,212,0.08) 0%, transparent 70%)" }} />
        </div>

        <div className="container mx-auto max-w-4xl px-6 relative z-10">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-widest mb-8 border"
            style={{ backgroundColor: "rgba(99,102,241,0.1)", borderColor: "rgba(99,102,241,0.2)", color: "var(--accent)" }}>
            <ShieldCheck className="w-3.5 h-3.5" />
            Legal Policy · Refund & Returns
          </div>

          <h1 className="font-display font-black text-4xl sm:text-6xl md:text-[5rem] leading-[1.0] tracking-tight mb-6">
            We've got your{" "}
            <span className="text-gradient">money covered</span>
          </h1>

          <p className="text-muted font-medium text-lg sm:text-xl max-w-xl mx-auto leading-relaxed mb-8">
            If Vogats CV doesn't deliver, you get every rupee back — no awkward emails, no waiting games.
          </p>

          {/* Meta pills */}
          <div className="flex items-center justify-center gap-3 flex-wrap text-[10px] font-black uppercase tracking-widest">
            {[
              { dot: "#10b981", label: "Effective: May 1, 2026" },
              { dot: "#f59e0b", label: "7-Day Guarantee" },
              { dot: "#6366f1", label: "Powered by Vogats AI" },
            ].map((p) => (
              <span key={p.label} className="flex items-center gap-2 px-4 py-2 rounded-full border shadow-sm"
                style={{ backgroundColor: "var(--card)", borderColor: "var(--border)", color: "var(--muted)" }}>
                <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: p.dot }} />
                {p.label}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── STATS GRID ── */}
      <section className="pb-16">
        <div className="container mx-auto max-w-5xl px-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {stats.map((s, i) => (
              <div key={i}
                className={`rounded-3xl p-6 text-center border bg-gradient-to-br ${s.color} ${s.border} transition-all duration-300 hover:-translate-y-1 hover:shadow-xl`}>
                <div className="text-3xl mb-3">{s.icon}</div>
                <div className="font-display font-black text-2xl sm:text-3xl text-text mb-1">{s.value}</div>
                <div className="text-[10px] font-bold text-muted uppercase tracking-wider leading-snug">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── GUARANTEE BANNER ── */}
      <section className="pb-16">
        <div className="container mx-auto max-w-3xl px-6">
          <div className="relative rounded-[2.5rem] overflow-hidden p-8 md:p-12 text-center shadow-2xl"
            style={{ background: "linear-gradient(135deg, #4f46e5 0%, #7c3aed 50%, #06b6d4 100%)" }}>
            {/* decorative circles */}
            <div className="absolute top-[-40px] right-[-40px] w-52 h-52 rounded-full bg-white/10 blur-2xl pointer-events-none" />
            <div className="absolute bottom-[-60px] left-[-30px] w-64 h-64 rounded-full bg-white/5 blur-3xl pointer-events-none" />
            {/* stars row */}
            <div className="flex items-center justify-center gap-1 mb-4 relative z-10">
              {Array(5).fill(0).map((_, i) => <Star key={i} className="w-4 h-4 text-yellow-300 fill-yellow-300" />)}
              <span className="text-white/70 text-xs font-bold ml-2">Trusted by 120K+ users</span>
            </div>
            <ShieldCheck className="w-16 h-16 mx-auto text-white/90 mb-4 relative z-10 drop-shadow-xl" />
            <h2 className="font-display font-black text-3xl md:text-4xl text-white leading-tight mb-4 relative z-10">
              7-Day Money-Back Guarantee
            </h2>
            <p className="text-white/80 max-w-md mx-auto text-sm leading-relaxed font-medium mb-8 relative z-10">
              Try Vogats CV completely risk-free. Not happy within 7 days? We'll refund you in full — no questions asked, no forms to fill.
            </p>
            <div className="flex items-center justify-center gap-3 flex-wrap relative z-10">
              <Link to="/contact"
                className="inline-flex items-center gap-2 px-8 py-3.5 bg-white rounded-2xl text-xs font-black uppercase tracking-widest shadow-xl transition-all hover:-translate-y-0.5"
                style={{ color: "var(--accent)" }}>
                Request a Refund <ArrowRight className="w-3.5 h-3.5" />
              </Link>
              <a href="#s2"
                onClick={(e) => { e.preventDefault(); scrollToSec("s2"); }}
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl border border-white/25 text-white text-xs font-black uppercase tracking-widest transition-all hover:bg-white/10">
                See Eligibility
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ── TOC PILL BAR ── */}
      <div className="sticky top-[64px] z-50 border-b border-border backdrop-blur-md mb-12 overflow-x-auto no-scrollbar"
        style={{ backgroundColor: "var(--bg)", opacity: 0.97 }}>
        <div className="container mx-auto max-w-3xl px-6 py-3 flex gap-2 whitespace-nowrap">
          {toc.map((s) => (
            <button key={s.id} onClick={() => scrollToSec(s.id)}
              className={`px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-wider border transition-all duration-200 ${
                activeSec === s.id
                  ? "bg-accent-solid border-accent-solid text-white shadow-lg shadow-accent/25"
                  : "border-border text-muted hover:text-text"
              }`}
              style={activeSec !== s.id ? { backgroundColor: "var(--card)" } : {}}>
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── SECTIONS ── */}
      <section className="pb-32">
        <div className="container mx-auto max-w-3xl px-6 space-y-4">

          <Section id="s1" num="Section 01" title="Policy Overview"
            icon={<span className="text-lg">📄</span>} iconBg="bg-accent/10">
            <p>At Vogats CV, we are committed to delivering a premium AI-powered resume building experience. This Refund &amp; Return Policy outlines the conditions under which you can request a refund for any paid plan purchased on <a href="https://cv.vogats.com" className="text-accent-solid underline">cv.vogats.com</a>.</p>
            <p>Because our service is entirely digital — no physical products are shipped — our policy is specifically tailored to software subscriptions and AI-generated deliverables.</p>
            <InfoBox type="blue">This policy applies to all paid plans (Monthly Pro and Annual Pro). Free plan users are not eligible for refunds as no payment is made.</InfoBox>
          </Section>

          <Section id="s2" num="Section 02" title="Refund Eligibility"
            icon={<CheckCircle className="w-5 h-5 text-emerald-500" />} iconBg="bg-emerald-500/10">
            <p>You are eligible for a full refund if all of the following conditions are met:</p>
            <div className="grid sm:grid-cols-2 gap-4 mt-2">
              <div className="rounded-2xl p-5 border border-emerald-500/15 bg-emerald-500/5">
                <h4 className="text-[10px] font-black uppercase tracking-wider text-emerald-500 mb-3">✅ You're Eligible If</h4>
                <ul className="space-y-2">
                  {["Request within 7 days of payment","First-time purchase of the plan","Technical issue unresolved in 48 hrs","Accidental duplicate payment","Service not as described"].map(t => <Check key={t} color="green">{t}</Check>)}
                </ul>
              </div>
              <div className="rounded-2xl p-5 border border-red-500/15 bg-red-500/5">
                <h4 className="text-[10px] font-black uppercase tracking-wider text-red-500 mb-3">❌ Not Eligible If</h4>
                <ul className="space-y-2">
                  {["Request after 7-day window","Previously refunded same plan","Account suspended for violations","Changed mind after 7 days","Used 80%+ of monthly AI credits"].map(t => <Check key={t} color="red">{t}</Check>)}
                </ul>
              </div>
            </div>
            <InfoBox type="green">Technical issues (bugs, AI failures, gateway errors) are always evaluated individually. We never deny a refund for our fault.</InfoBox>
          </Section>

          <Section id="s3" num="Section 03" title="Non-Refundable Items"
            icon={<XCircle className="w-5 h-5 text-red-500" />} iconBg="bg-red-500/10">
            <ul className="space-y-3">
              {[
                "Add-on credits — one-time AI credit top-ups that have been partially or fully used",
                "Resume downloads — PDF/DOCX files already downloaded to your device",
                "Renewals past the window — not cancelled before billing date (unless within 48 hrs of renewal)",
                "Promotional purchases — plans bought at special discount events or lifetime deals (unless defective)",
              ].map(t => <Check key={t} color="red">{t}</Check>)}
            </ul>
            <InfoBox type="amber">If you believe an exception applies, contact us anyway. We review every case individually and are always happy to help.</InfoBox>
          </Section>

          <Section id="s4" num="Section 04" title="How to Request a Refund"
            icon={<Mail className="w-5 h-5 text-accent-solid" />} iconBg="bg-accent/10">
            <p>Requesting a refund takes less than 2 minutes. Follow these steps:</p>
            <div className="relative pl-8 space-y-6 mt-3 before:absolute before:left-3 before:top-2 before:bottom-2 before:w-[2px] before:rounded-full before:bg-border">
              {[
                { n: "1", t: "Email us or use the contact form", d: "Send a message to support@vogats.com or visit our contact page with subject: 'Refund Request'." },
                { n: "2", t: "Include your order details", d: "Provide your registered email, plan name, and date of purchase. A short reason helps us improve." },
                { n: "3", t: "We confirm & process", d: "Our team confirms eligibility within 24 hours and initiates the refund immediately if approved." },
                { n: "4", t: "Refund arrives", d: "Funds arrive in your original payment method within 5–10 business days depending on your bank." },
              ].map((s) => (
                <div key={s.n} className="relative">
                  <div className="absolute -left-8 top-0 w-6 h-6 rounded-full text-white flex items-center justify-center text-[10px] font-black shadow-md"
                    style={{ backgroundColor: "var(--accent)" }}>{s.n}</div>
                  <strong className="block text-sm font-bold text-text mb-1">{s.t}</strong>
                  <span className="text-xs text-muted leading-relaxed">{s.d}</span>
                </div>
              ))}
            </div>
          </Section>

          <Section id="s5" num="Section 05" title="Processing Time"
            icon={<Clock className="w-5 h-5 text-emerald-500" />} iconBg="bg-emerald-500/10">
            <div className="grid sm:grid-cols-2 gap-3">
              {[
                { label: "Review & Approval", val: "24–48 hours" },
                { label: "Refund Initiation", val: "Immediately on approval" },
                { label: "Credit / Debit Cards", val: "5–10 business days" },
                { label: "UPI / Net Banking", val: "3–7 business days" },
                { label: "PayPal", val: "1–3 business days" },
              ].map((r) => (
                <div key={r.label} className="flex items-center justify-between p-3 rounded-xl border border-border"
                  style={{ backgroundColor: "var(--surface)" }}>
                  <span className="text-xs font-bold text-text">{r.label}</span>
                  <span className="text-xs font-black text-accent-solid">{r.val}</span>
                </div>
              ))}
            </div>
            <InfoBox type="amber">Bank processing times are beyond our control. After 10 business days contact us for a payment reference number.</InfoBox>
          </Section>

          <Section id="s6" num="Section 06" title="Subscriptions & Cancellation"
            icon={<RefreshCw className="w-5 h-5 text-amber-500" />} iconBg="bg-amber-500/10">
            <p>Subscriptions auto-renew each billing cycle. Here's how cancellation and refunds work:</p>
            <ul className="space-y-2 mt-2">
              <Check color="green">Cancel anytime from Account Settings → Billing with one click</Check>
              <Check color="green">After cancellation, full access continues until end of billing period</Check>
              <Check color="green">Renewal refunds within 48 hours of the charge will be honored in full</Check>
              <Check color="amber">Cancellation does not auto-trigger a refund — request separately within the window</Check>
              <Check color="amber">Annual plans: No prorated refund after the 7-day window for unused months</Check>
            </ul>
            <InfoBox type="green">Tip: If unsure, downgrade to the free plan instead of cancelling — your resumes stay safe.</InfoBox>
          </Section>

          <Section id="s7" num="Section 07" title="Disputes & Chargebacks"
            icon={<span className="text-lg">⚖️</span>} iconBg="bg-surface">
            <p>We strongly encourage you to contact us before initiating a chargeback. We resolve almost all disputes quickly and amicably.</p>
            <ul className="space-y-2 mt-2">
              <Check color="green">Contact support first — disputes typically resolved within 24 hours</Check>
              <Check color="green">You have the right to escalate to your payment provider if unresolved</Check>
              <Check color="red">Fraudulent chargebacks may result in account suspension and referral to Stripe/Razorpay</Check>
            </ul>
            <InfoBox type="blue">We are a small team and every refund is personally reviewed. Please reach out before escalating — we genuinely want to make things right.</InfoBox>
          </Section>

          <Section id="s8" num="Section 08" title="Contact & Refund Requests"
            icon={<span className="text-lg">💬</span>} iconBg="bg-accent/10">
            <div className="grid sm:grid-cols-2 gap-8">
              <div>
                <h3 className="font-display font-black text-lg text-text mb-2">Get in touch</h3>
                <p className="text-xs leading-relaxed">Our support team is available Mon–Sat, 9 AM–7 PM IST. We typically respond within 4 hours.</p>
              </div>
              <div className="space-y-3">
                {[
                  { icon: "📧", title: "support@vogats.com", sub: "Refunds & billing queries" },
                  { icon: "🌐", title: "cv.vogats.com/contact", sub: "Online contact form", link: "/contact" },
                  { icon: "⚡", title: "Live Chat", sub: "Chat bubble on any page" },
                ].map((c) => (
                  <div key={c.title} className="flex items-center gap-3 p-3 rounded-xl border border-border"
                    style={{ backgroundColor: "var(--surface)" }}>
                    <span className="text-xl">{c.icon}</span>
                    <div className="text-xs">
                      {c.link
                        ? <Link to={c.link as "/contact"} className="block font-bold text-text hover:underline">{c.title}</Link>
                        : <strong className="block text-text">{c.title}</strong>}
                      <span className="text-muted">{c.sub}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Section>

        </div>
      </section>

      {/* ── BOTTOM CTA ── */}
      <section className="pb-24">
        <div className="container mx-auto max-w-2xl px-6 text-center">
          <div className="rounded-3xl border border-border p-10 space-y-4" style={{ backgroundColor: "var(--card)" }}>
            <div className="text-4xl">🛡️</div>
            <h3 className="font-display font-black text-2xl text-text">Still have questions?</h3>
            <p className="text-sm text-muted max-w-sm mx-auto leading-relaxed">Our support team reads every message personally and replies fast.</p>
            <Link to="/contact"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl text-white font-black text-xs uppercase tracking-widest transition-all hover:-translate-y-0.5 shadow-xl"
              style={{ background: "linear-gradient(135deg, var(--accent), var(--accent-secondary))", boxShadow: "0 8px 30px rgba(99,102,241,0.35)" }}>
              Contact Support <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
