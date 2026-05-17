import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Footer";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/privacy")({
  component: PrivacyPage,
});

function PrivacyPage() {
  const [activeTab, setActiveTab] = useState<"privacy" | "terms">("privacy");
  const [activeTOC, setActiveTOC] = useState("");

  useEffect(() => {
    const handleScroll = () => {
      const sections = document.querySelectorAll(".section-block");
      sections.forEach((sec) => {
        const rect = sec.getBoundingClientRect();
        if (rect.top < 200 && rect.bottom > 100) {
          setActiveTOC(sec.id);
        }
      });
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [activeTab]);

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      const offset = 140;
      const bodyRect = document.body.getBoundingClientRect().top;
      const elementRect = el.getBoundingClientRect().top;
      const elementPosition = elementRect - bodyRect;
      const offsetPosition = elementPosition - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth"
      });
      setActiveTOC(id);
    }
  };

  return (
    <div className="min-h-screen bg-[#f5f3ef]">
      <Navbar />
      
      <style>{`
        .section-block {
          background: #ffffff;
          border: 1px solid #e2dfd8;
          border-radius: 16px;
          padding: 32px;
          margin-bottom: 20px;
          scroll-margin-top: 150px;
        }
        .section-block h2 {
          font-family: 'Syne', sans-serif;
          font-weight: 700;
          font-size: 1.1rem;
          margin-bottom: 14px;
          display: flex;
          align-items: center;
          gap: 10px;
          padding-bottom: 12px;
          border-bottom: 1px solid #e2dfd8;
        }
        .section-block h2 .icon {
          width: 32px;
          height: 32px;
          border-radius: 8px;
          background: #e8edff;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 15px;
          flex-shrink: 0;
        }
        .highlight-box {
          background: #e8edff;
          border: 1px solid rgba(26,86,255,0.2);
          border-radius: 10px;
          padding: 14px 16px;
          margin: 14px 0;
          font-size: 0.88rem;
          color: #1a56ff;
          line-height: 1.6;
        }
        .warn-box {
          background: rgba(255,150,30,0.08);
          border: 1px solid rgba(255,150,30,0.25);
          border-radius: 10px;
          padding: 14px 16px;
          margin: 14px 0;
          font-size: 0.88rem;
          color: #b35a00;
          line-height: 1.6;
        }
        .green-box {
          background: rgba(0,200,150,0.08);
          border: 1px solid rgba(0,200,150,0.25);
          border-radius: 10px;
          padding: 14px 16px;
          margin: 14px 0;
          font-size: 0.88rem;
          color: #007a5e;
          line-height: 1.6;
        }
        .contact-band {
          background: #1a56ff;
          border-radius: 16px;
          padding: 28px 32px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
          margin-bottom: 20px;
          flex-wrap: wrap;
        }
      `}</style>

      {/* HERO */}
      <section className="pt-24 pb-12 px-10 text-center bg-gradient-to-b from-[#1a56ff]/5 to-transparent">
        <div className="inline-flex items-center gap-1.5 bg-[#e8edff] text-[#1a56ff] px-3.5 py-1.5 rounded-full text-[12px] font-bold uppercase tracking-wider mb-4">
          🔒 Legal
        </div>
        <h1 className="font-display text-4xl sm:text-5xl font-extrabold mb-4 text-[#0f0e0c]">
          Privacy Policy & Terms of Service
        </h1>
        <p className="text-muted-foreground max-w-[500px] mx-auto mb-3 text-sm">
          We believe in full transparency about how we collect, use, and protect your data.
        </p>
        <div className="inline-flex items-center gap-1.5 bg-emerald-500/10 text-emerald-600 px-3 py-1 rounded-full text-[12px] font-medium">
          ✅ Last updated: May 1, 2026
        </div>
      </section>

      {/* TABS */}
      <div className="sticky top-[35px] z-40 bg-[#f5f3ef]/80 backdrop-blur-md py-4 px-10 border-b border-[#e2dfd8] flex justify-center gap-2">
        <button 
          onClick={() => { setActiveTab("privacy"); window.scrollTo({ top: 0, behavior: "smooth" }); }}
          className={cn(
            "px-6 py-2.5 rounded-xl border-2 font-display font-bold text-sm transition-all",
            activeTab === "privacy" 
              ? "bg-[#1a56ff] text-white border-[#1a56ff]" 
              : "bg-white text-muted-foreground border-[#e2dfd8] hover:border-[#1a56ff] hover:text-[#1a56ff]"
          )}
        >
          🔒 Privacy Policy
        </button>
        <button 
          onClick={() => { setActiveTab("terms"); window.scrollTo({ top: 0, behavior: "smooth" }); }}
          className={cn(
            "px-6 py-2.5 rounded-xl border-2 font-display font-bold text-sm transition-all",
            activeTab === "terms" 
              ? "bg-[#1a56ff] text-white border-[#1a56ff]" 
              : "bg-white text-muted-foreground border-[#e2dfd8] hover:border-[#1a56ff] hover:text-[#1a56ff]"
          )}
        >
          📄 Terms of Service
        </button>
      </div>

      {/* CONTENT LAYOUT */}
      <div className="max-w-[1100px] mx-auto px-10 py-10 grid grid-cols-1 md:grid-cols-[240px_1fr] gap-10 items-start">
        {/* SIDEBAR TOC */}
        <aside className="hidden md:block sticky top-[140px] bg-white border border-[#e2dfd8] rounded-2xl p-5">
          <h4 className="font-display font-bold text-[11px] uppercase tracking-widest text-muted-foreground mb-4">
            On This Page
          </h4>
          <ul className="space-y-1">
            {activeTab === "privacy" ? (
              <>
                {[
                  { id: "p1", label: "Information We Collect" },
                  { id: "p2", label: "How We Use Your Data" },
                  { id: "p3", label: "Data Sharing" },
                  { id: "p4", label: "Data Security" },
                  { id: "p5", label: "Your Rights" },
                  { id: "p6", label: "Cookies" },
                  { id: "p7", label: "Contact Us" }
                ].map(item => (
                  <li key={item.id}>
                    <button 
                      onClick={() => scrollToSection(item.id)}
                      className={cn(
                        "w-full text-left px-3 py-2 rounded-lg text-[13px] font-medium transition-all",
                        activeTOC === item.id 
                          ? "bg-[#e8edff] text-[#1a56ff]" 
                          : "text-muted-foreground hover:bg-[#e8edff] hover:text-[#1a56ff]"
                      )}
                    >
                      {item.label}
                    </button>
                  </li>
                ))}
              </>
            ) : (
              <>
                {[
                  { id: "t1", label: "Acceptance of Terms" },
                  { id: "t2", label: "Use of Service" },
                  { id: "t3", label: "Subscriptions & Billing" },
                  { id: "t4", label: "Intellectual Property" },
                  { id: "t5", label: "Limitations" },
                  { id: "t6", label: "Termination" },
                  { id: "t7", label: "Governing Law" }
                ].map(item => (
                  <li key={item.id}>
                    <button 
                      onClick={() => scrollToSection(item.id)}
                      className={cn(
                        "w-full text-left px-3 py-2 rounded-lg text-[13px] font-medium transition-all",
                        activeTOC === item.id 
                          ? "bg-[#e8edff] text-[#1a56ff]" 
                          : "text-muted-foreground hover:bg-[#e8edff] hover:text-[#1a56ff]"
                      )}
                    >
                      {item.label}
                    </button>
                  </li>
                ))}
              </>
            )}
          </ul>
        </aside>

        {/* MAIN CONTENT */}
        <main className="space-y-6">
          {activeTab === "privacy" ? (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="section-block" id="p1">
                <h2><span className="icon">📋</span> 1. Information We Collect</h2>
                <p className="text-sm text-muted-foreground leading-relaxed">We collect information you provide directly when you create an account or use our services:</p>
                <ul className="list-disc ml-5 mt-3 space-y-2 text-sm text-muted-foreground">
                  <li><strong>Account Information:</strong> Name, email address, and password when you sign up.</li>
                  <li><strong>Resume Content:</strong> Work history, education, skills, and any other information you input to build your resume.</li>
                  <li><strong>Payment Information:</strong> Billing details processed securely via Stripe — we never store full card numbers.</li>
                  <li><strong>Usage Data:</strong> How you interact with our platform (pages visited, features used, session duration).</li>
                </ul>
                <div className="highlight-box">💡 We only collect the minimum information necessary to provide and improve our service.</div>
              </div>

              <div className="section-block" id="p2">
                <h2><span class="icon">⚙️</span> 2. How We Use Your Data</h2>
                <p className="text-sm text-muted-foreground leading-relaxed">Your data is used exclusively to provide and improve Vogats AI services:</p>
                <ul className="list-disc ml-5 mt-3 space-y-2 text-sm text-muted-foreground">
                  <li>Generate and optimize your resume content using our AI models</li>
                  <li>Provide ATS analysis and scoring against job descriptions</li>
                  <li>Send important account and service updates (not spam)</li>
                  <li>Improve our AI models and product features (using anonymized, aggregated data only)</li>
                  <li>Process payments and manage subscriptions</li>
                </ul>
                <div className="green-box">✅ We do <strong>not</strong> sell, rent, or trade your personal data to third parties for marketing purposes — ever.</div>
              </div>

              <div className="section-block" id="p3">
                <h2><span class="icon">🤝</span> 3. Data Sharing</h2>
                <p className="text-sm text-muted-foreground leading-relaxed">We share data only with trusted service providers who help us operate Vogats AI:</p>
                <ul className="list-disc ml-5 mt-3 space-y-2 text-sm text-muted-foreground">
                  <li><strong>Stripe</strong> — secure payment processing</li>
                  <li><strong>AWS / Cloud Infrastructure</strong> — secure data hosting</li>
                  <li><strong>Analytics Providers</strong> — anonymized usage insights (no PII)</li>
                </ul>
                <p className="text-sm text-muted-foreground leading-relaxed mt-4">We may share data if required by law or to protect the rights and safety of users.</p>
              </div>

              <div className="section-block" id="p4">
                <h2><span class="icon">🛡️</span> 4. Data Security</h2>
                <p className="text-sm text-muted-foreground leading-relaxed">We take security seriously and implement industry-standard protections:</p>
                <ul className="list-disc ml-5 mt-3 space-y-2 text-sm text-muted-foreground">
                  <li>TLS/SSL encryption for all data in transit</li>
                  <li>AES-256 encryption for data at rest</li>
                  <li>Regular security audits and penetration testing</li>
                  <li>Access controls and employee security training</li>
                </ul>
                <div className="warn-box">⚠️ While we implement strong security measures, no system is 100% impenetrable. Please use a strong, unique password for your account.</div>
              </div>

              <div className="section-block" id="p5">
                <h2><span class="icon">👤</span> 5. Your Rights</h2>
                <p className="text-sm text-muted-foreground leading-relaxed">You have full control over your personal data:</p>
                <ul className="list-disc ml-5 mt-3 space-y-2 text-sm text-muted-foreground">
                  <li><strong>Access:</strong> Request a copy of all data we hold about you</li>
                  <li><strong>Correction:</strong> Update inaccurate or incomplete information</li>
                  <li><strong>Deletion:</strong> Delete your account and all associated data at any time</li>
                  <li><strong>Portability:</strong> Export your resume data in standard formats (PDF, DOCX)</li>
                  <li><strong>Opt-out:</strong> Unsubscribe from marketing emails at any time</li>
                </ul>
                <p className="text-sm text-muted-foreground leading-relaxed mt-4">To exercise any right, visit your account settings or contact <span className="text-[#1a56ff]">privacy@vogats.ai</span>.</p>
              </div>

              <div className="section-block" id="p6">
                <h2><span class="icon">🍪</span> 6. Cookies</h2>
                <p className="text-sm text-muted-foreground leading-relaxed">We use cookies to keep you logged in, remember preferences, and understand how you use our platform.</p>
                <ul className="list-disc ml-5 mt-3 space-y-2 text-sm text-muted-foreground">
                  <li><strong>Essential Cookies:</strong> Required for the platform to function</li>
                  <li><strong>Analytics Cookies:</strong> Help us understand feature usage</li>
                  <li><strong>Preference Cookies:</strong> Remember your settings and customizations</li>
                </ul>
              </div>

              <div className="section-block" id="p7">
                <h2><span class="icon">📬</span> 7. Contact & Questions</h2>
                <p className="text-sm text-muted-foreground leading-relaxed">If you have any questions about this Privacy Policy or how your data is handled, we want to hear from you.</p>
                <p className="text-sm text-muted-foreground leading-relaxed mt-4">
                  Data Controller: Vogats AI, Inc.<br />
                  Email: <span className="text-[#1a56ff]">privacy@vogats.ai</span>
                </p>
              </div>
            </div>
          ) : (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="section-block" id="t1">
                <h2><span class="icon">✅</span> 1. Acceptance of Terms</h2>
                <p className="text-sm text-muted-foreground leading-relaxed">By accessing or using Vogats AI ("Service"), you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use the Service.</p>
                <p className="text-sm text-muted-foreground leading-relaxed mt-4">We reserve the right to modify these terms at any time. Continued use after changes constitutes acceptance of updated terms.</p>
                <div className="highlight-box">📅 These Terms are effective as of May 1, 2026 and apply to all users of the Vogats AI platform.</div>
              </div>

              <div className="section-block" id="t2">
                <h2><span class="icon">💻</span> 2. Use of Service</h2>
                <p className="text-sm text-muted-foreground leading-relaxed">You agree to use Vogats AI only for lawful purposes. You may not:</p>
                <ul className="list-disc ml-5 mt-3 space-y-2 text-sm text-muted-foreground">
                  <li>Use the service to generate false, misleading, or fraudulent resume content</li>
                  <li>Attempt to reverse-engineer, copy, or scrape our AI models or platform</li>
                  <li>Share your account credentials with others</li>
                  <li>Use automated bots or scripts to access the platform without permission</li>
                </ul>
                <div className="green-box">✅ You are responsible for all content generated through your account. Use our tools to represent your genuine professional experience.</div>
              </div>

              <div className="section-block" id="t3">
                <h2><span class="icon">💳</span> 3. Subscriptions & Billing</h2>
                <p className="text-sm text-muted-foreground leading-relaxed">Vogats AI offers free and paid subscription plans. For paid plans:</p>
                <ul className="list-disc ml-5 mt-3 space-y-2 text-sm text-muted-foreground">
                  <li>Subscriptions automatically renew monthly or annually unless cancelled</li>
                  <li>You can cancel at any time from your account settings</li>
                  <li>We offer a <strong>7-day money-back guarantee</strong> on all paid plans</li>
                  <li>Price changes will be communicated 30 days in advance</li>
                </ul>
                <div className="warn-box">⚠️ After the 7-day refund window, we generally do not offer prorated refunds for unused subscription periods.</div>
              </div>

              <div className="section-block" id="t4">
                <h2><span class="icon">©️</span> 4. Intellectual Property</h2>
                <p className="text-sm text-muted-foreground leading-relaxed">Vogats AI and its AI models, templates, interfaces, and branding are owned by Vogats AI, Inc.</p>
                <p className="text-sm text-muted-foreground leading-relaxed mt-4"><strong>Your Content:</strong> You retain full ownership of the resume content you create on our platform. We do not claim any rights to your personal data or generated documents.</p>
              </div>

              <div className="section-block" id="t5">
                <h2><span class="icon">⚖️</span> 5. Limitations of Liability</h2>
                <p className="text-sm text-muted-foreground leading-relaxed">Vogats AI provides tools to assist with resume creation. We do not guarantee job placement, interview success, or any specific career outcome.</p>
                <ul className="list-disc ml-5 mt-3 space-y-2 text-sm text-muted-foreground">
                  <li>The Service is provided "as is" without warranties of any kind</li>
                  <li>We are not liable for indirect, incidental, or consequential damages</li>
                </ul>
              </div>

              <div className="section-block" id="t6">
                <h2><span class="icon">🚫</span> 6. Termination</h2>
                <p className="text-sm text-muted-foreground leading-relaxed">You may terminate your account at any time from account settings. We may suspend or terminate accounts that violate these Terms.</p>
              </div>

              <div className="section-block" id="t7">
                <h2><span class="icon">🌍</span> 7. Governing Law</h2>
                <p className="text-sm text-muted-foreground leading-relaxed">These Terms are governed by the laws of the State of Delaware, United States. Any disputes shall be resolved through binding arbitration, except where prohibited by law.</p>
                <p className="text-sm text-muted-foreground leading-relaxed mt-4">For legal inquiries: <span className="text-[#1a56ff]">legal@vogats.ai</span></p>
              </div>
            </div>
          )}

          <div className="contact-band">
            <div>
              <h3 className="font-display font-bold text-white text-lg">Questions about our policies?</h3>
              <p className="text-white/70 text-sm">Our legal team responds within 24 hours</p>
            </div>
            <button className="bg-white text-[#1a56ff] px-6 py-2.5 rounded-xl font-bold text-sm hover:opacity-90 transition-opacity">
              Contact Us →
            </button>
          </div>
        </main>
      </div>

      <Footer />
    </div>
  );
}
