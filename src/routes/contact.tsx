import { createFileRoute } from "@tanstack/react-router";
import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Footer";
import { useState } from "react";

export const Route = createFileRoute("/contact")({
  component: ContactPage,
});

const faqs = [
  {
    q: "How does the AI resume builder work?",
    a: "Our AI analyzes your work history and generates ATS-optimized resume content tailored to your target job. Simply input your experience and let the AI do the heavy lifting.",
  },
  {
    q: "Is my data safe with Vogats CV?",
    a: "Absolutely. We use end-to-end encryption and never sell your personal data. Your resume data is stored securely and you can delete it at any time from your account settings.",
  },
  {
    q: "Can I cancel my subscription anytime?",
    a: "Yes, you can cancel anytime from your account dashboard. No hidden fees, no cancellation charges. Your access continues until the end of the billing period.",
  },
  {
    q: "Do you offer refunds?",
    a: "We offer a 7-day money-back guarantee on all paid plans. Contact us within 7 days of your purchase and we'll process a full refund, no questions asked.",
  },
];

function ContactPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({
    firstName: "", lastName: "", email: "", subject: "", message: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "var(--bg)", color: "var(--text)" }}>
      <Navbar />

      {/* ── Hero ── */}
      <section
        className="pt-28 pb-14 text-center relative overflow-hidden"
        style={{ paddingLeft: "1.5rem", paddingRight: "1.5rem" }}
      >
        {/* Radial glow */}
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[280px] pointer-events-none"
          style={{ background: "radial-gradient(ellipse at center, rgba(99,102,241,0.12) 0%, transparent 70%)" }}
        />
        <div
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest mb-5"
          style={{ background: "var(--accent)/10", color: "var(--accent)", backgroundColor: "rgba(99,102,241,0.1)" }}
        >
          📬 Get In Touch
        </div>
        <h1 className="font-display font-black text-center mb-4"
          style={{ fontSize: "clamp(2rem, 5vw, 3.5rem)", lineHeight: 1.1 }}>
          We'd love to{" "}
          <span style={{ color: "var(--accent)" }}>hear from you</span>
        </h1>
        <p className="mx-auto max-w-lg text-base leading-relaxed" style={{ color: "var(--muted)" }}>
          Have questions about your resume, our AI tools, or need help with your account? Our team is here to help.
        </p>
      </section>

      {/* ── Contact grid ── */}
      <div
        className="mx-auto w-full grid gap-8 pb-20"
        style={{
          maxWidth: 1100,
          padding: "0 1.5rem 5rem",
          gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
          alignItems: "start",
        }}
      >
        {/* Left — info cards */}
        <div className="flex flex-col gap-4">
          {/* Email */}
          <InfoCard
            icon="📧"
            iconBg="rgba(99,102,241,0.1)"
            title="Email Support"
            delay="0.1s"
          >
            <p style={{ color: "var(--muted)", fontSize: "0.88rem", lineHeight: 1.6 }}>
              Send us an email and we'll get back to you within 24 hours.{" "}
              <a href="mailto:support@vogats.com" style={{ color: "var(--accent)", fontWeight: 600 }}>
                support@vogats.com
              </a>
            </p>
            {/* Response badge */}
            <div
              className="flex items-center gap-3 mt-3 px-4 py-3 rounded-xl"
              style={{ background: "rgba(0,200,150,0.08)", border: "1px solid rgba(0,200,150,0.25)" }}
            >
              <span
                className="w-2 h-2 rounded-full shrink-0"
                style={{ background: "#00c896", animation: "pulseDot 2s infinite" }}
              />
              <span style={{ fontSize: "0.82rem", color: "#00a07a", fontWeight: 500 }}>
                Average response: under 4 hours
              </span>
            </div>
          </InfoCard>

          {/* Live Chat */}
          <InfoCard icon="💬" iconBg="rgba(0,200,150,0.1)" title="Live Chat" delay="0.2s">
            <p style={{ color: "var(--muted)", fontSize: "0.88rem", lineHeight: 1.6 }}>
              Use the chat bubble on any page to speak instantly with our AI assistant or a human agent.
            </p>
          </InfoCard>

          {/* Business */}
          <InfoCard icon="🏢" iconBg="rgba(255,150,30,0.1)" title="Business Inquiries" delay="0.3s">
            <p style={{ color: "var(--muted)", fontSize: "0.88rem", lineHeight: 1.6 }}>
              For partnerships, enterprise plans, or media:{" "}
              <a href="mailto:business@vogats.com" style={{ color: "var(--accent)", fontWeight: 600 }}>
                business@vogats.com
              </a>
            </p>
          </InfoCard>
        </div>

        {/* Right — form card */}
        <div
          className="rounded-2xl p-8 md:p-10"
          style={{
            background: "var(--card)",
            border: "1px solid var(--border)",
            animation: "contactFadeUp 0.5s ease 0.15s both",
          }}
        >
          <h2 className="font-display font-black text-2xl mb-1">Send a message</h2>
          <p className="text-sm mb-7" style={{ color: "var(--muted)" }}>
            Fill out the form below and we'll respond promptly.
          </p>

          {!submitted ? (
            <form onSubmit={handleSubmit}>
              {/* Name row */}
              <div className="grid grid-cols-2 gap-4 mb-4">
                <Field label="First Name">
                  <input
                    type="text" placeholder="John" required
                    value={form.firstName}
                    onChange={e => setForm(f => ({ ...f, firstName: e.target.value }))}
                  />
                </Field>
                <Field label="Last Name">
                  <input
                    type="text" placeholder="Doe" required
                    value={form.lastName}
                    onChange={e => setForm(f => ({ ...f, lastName: e.target.value }))}
                  />
                </Field>
              </div>

              <Field label="Email Address" className="mb-4">
                <input
                  type="email" placeholder="john@example.com" required
                  value={form.email}
                  onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                />
              </Field>

              <Field label="Subject" className="mb-4">
                <select
                  required
                  value={form.subject}
                  onChange={e => setForm(f => ({ ...f, subject: e.target.value }))}
                >
                  <option value="" disabled>Select a topic</option>
                  <option>Resume Builder Help</option>
                  <option>Account &amp; Billing</option>
                  <option>ATS Score Questions</option>
                  <option>Feature Request</option>
                  <option>Partnership / Enterprise</option>
                  <option>Other</option>
                </select>
              </Field>

              <Field label="Message" className="mb-6">
                <textarea
                  placeholder="Tell us how we can help you..."
                  required rows={4}
                  value={form.message}
                  onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
                />
              </Field>

              <button
                type="submit"
                className="w-full py-4 rounded-xl font-display font-black text-base flex items-center justify-center gap-2 transition-all duration-200"
                style={{
                  background: "var(--accent)",
                  color: "#fff",
                  border: "none",
                  cursor: "pointer",
                  boxShadow: "0 8px 24px rgba(99,102,241,0.3)",
                }}
                onMouseOver={e => (e.currentTarget.style.opacity = "0.88")}
                onMouseOut={e => (e.currentTarget.style.opacity = "1")}
              >
                ✉️ Send Message
              </button>
            </form>
          ) : (
            <div
              className="text-center py-10 px-4 rounded-xl"
              style={{ background: "rgba(0,200,150,0.08)", border: "1px solid rgba(0,200,150,0.25)" }}
            >
              <div className="text-5xl mb-4">✅</div>
              <h3 className="font-display font-black text-xl mb-2" style={{ color: "#00a07a" }}>
                Message Sent!
              </h3>
              <p className="text-sm" style={{ color: "var(--muted)" }}>
                Thanks for reaching out. We'll reply to your email within 24 hours.
              </p>
              <button
                className="mt-6 px-6 py-2 rounded-xl text-sm font-bold transition-all"
                style={{ background: "var(--accent)", color: "#fff", border: "none", cursor: "pointer" }}
                onClick={() => { setSubmitted(false); setForm({ firstName: "", lastName: "", email: "", subject: "", message: "" }); }}
              >
                Send Another
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ── FAQ ── */}
      <div className="mx-auto w-full pb-20 px-6" style={{ maxWidth: 800 }}>
        <h2 className="font-display font-black text-center text-3xl mb-8">
          Frequently Asked Questions
        </h2>
        <div className="flex flex-col gap-3">
          {faqs.map((faq, i) => (
            <div
              key={i}
              className="rounded-2xl overflow-hidden"
              style={{ background: "var(--card)", border: "1px solid var(--border)" }}
            >
              <button
                className="w-full flex items-center justify-between text-left px-5 py-5 font-semibold text-sm transition-colors"
                style={{ color: "var(--text)", background: "transparent", border: "none", cursor: "pointer" }}
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
              >
                <span>{faq.q}</span>
                <span
                  className="text-xl shrink-0 ml-3 transition-transform duration-300"
                  style={{
                    color: "var(--accent)",
                    transform: openFaq === i ? "rotate(45deg)" : "rotate(0deg)",
                  }}
                >
                  +
                </span>
              </button>
              <div
                style={{
                  maxHeight: openFaq === i ? 200 : 0,
                  overflow: "hidden",
                  transition: "max-height 0.35s ease, padding 0.35s ease",
                  padding: openFaq === i ? "0 1.25rem 1.25rem" : "0 1.25rem",
                  fontSize: "0.9rem",
                  color: "var(--muted)",
                  lineHeight: 1.7,
                }}
              >
                {faq.a}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Pulse animation */}
      <style>{`
        @keyframes pulseDot { 0%,100%{opacity:1} 50%{opacity:0.3} }
        @keyframes contactFadeUp { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
        .contact-field input,
        .contact-field select,
        .contact-field textarea {
          width: 100%;
          padding: 10px 14px;
          border: 1.5px solid var(--border);
          border-radius: 10px;
          font-size: 0.92rem;
          color: var(--text);
          background: var(--bg);
          outline: none;
          transition: border-color 0.2s, box-shadow 0.2s;
          font-family: inherit;
        }
        .contact-field textarea { resize: vertical; min-height: 100px; }
        .contact-field select { cursor: pointer; }
        .contact-field input:focus,
        .contact-field select:focus,
        .contact-field textarea:focus {
          border-color: var(--accent);
          box-shadow: 0 0 0 3px rgba(99,102,241,0.12);
          background: var(--card);
        }
      `}</style>

      <Footer />
    </div>
  );
}

/* ── Sub-components ── */

function InfoCard({
  icon, iconBg, title, children, delay,
}: {
  icon: string; iconBg: string; title: string; children: React.ReactNode; delay?: string;
}) {
  return (
    <div
      className="rounded-2xl p-6 transition-all duration-200 hover:-translate-y-1"
      style={{
        background: "var(--card)",
        border: "1px solid var(--border)",
        animation: `contactFadeUp 0.5s ease ${delay ?? "0s"} both`,
        boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
      }}
      onMouseOver={e => (e.currentTarget.style.boxShadow = "0 8px 24px rgba(0,0,0,0.1)")}
      onMouseOut={e => (e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.04)")}
    >
      <div
        className="w-11 h-11 rounded-xl flex items-center justify-center text-xl mb-4"
        style={{ background: iconBg }}
      >
        {icon}
      </div>
      <h3 className="font-display font-bold text-sm mb-2" style={{ color: "var(--text)" }}>{title}</h3>
      {children}
    </div>
  );
}

function Field({
  label, children, className,
}: {
  label: string; children: React.ReactNode; className?: string;
}) {
  return (
    <div className={`contact-field flex flex-col gap-1.5 ${className ?? ""}`}>
      <label
        className="text-[11px] font-black uppercase tracking-widest"
        style={{ color: "var(--text)" }}
      >
        {label}
      </label>
      {children}
    </div>
  );
}
