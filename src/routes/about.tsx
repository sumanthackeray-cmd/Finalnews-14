import { createFileRoute } from "@tanstack/react-router";
import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Footer";
import { Sparkles, Brain, Target, Layout, CheckCircle, ArrowRight } from "lucide-react";

export const Route = createFileRoute("/about")({
  component: AboutPage,
});

const stats = [
  { value: "120K+", label: "Resumes Created" },
  { value: "94%", label: "ATS Pass Rate" },
  { value: "50+", label: "Countries Served" },
  { value: "4.9★", label: "User Rating" },
];

const team = [
  {
    name: "Mr. Kamlesh Kumar",
    role: "CEO & Co-Founder",
    desc: "Visionary entrepreneur and leader guiding Vogats CV to revolutionize modern AI resume and career building services globally.",
    initial: "K",
    gradient: "from-accent to-purple-500",
  },
  {
    name: "Abhishek Sinha",
    role: "CTO",
    desc: "A seasoned technology architect and machine learning leader directing artificial intelligence models and high-scalability platforms.",
    initial: "A",
    gradient: "from-emerald-400 to-accent",
  },
  {
    name: "Suman Thackeray",
    role: "Head of Product",
    desc: "Innovative product designer and senior career consultant passionate about crafting premium, clean, and intuitive user experiences.",
    initial: "S",
    gradient: "from-orange-500 to-amber-500",
  },
];

const blogs = [
  {
    tag: "ATS Tips",
    title: "10 ATS Mistakes That Are Silently Killing Your Resume (And How to Fix Them)",
    desc: "Most job seekers don't realize their resume never reaches a human. Here's everything you need to know about passing ATS filters in 2026.",
    author: "Mr. Kamlesh Kumar",
    date: "May 12, 2026",
    readTime: "7 min read",
    icon: "📄",
    gradient: "from-indigo-100 to-indigo-200 dark:from-indigo-950/40 dark:to-indigo-900/40",
  },
  {
    tag: "Career Growth",
    title: "How to Get Promoted in 12 Months Using the STAR Method",
    desc: "A proven framework for documenting your wins and making the case for your next role.",
    author: "Suman Thackeray",
    date: "Apr 28, 2026",
    readTime: "5 min read",
    icon: "💼",
    gradient: "from-teal-100 to-teal-200 dark:from-teal-950/40 dark:to-teal-900/40",
  },
  {
    tag: "AI & Jobs",
    title: "AI Won't Take Your Job — But This Will Help You Keep It",
    desc: "How to future-proof your career in the age of generative AI and automated hiring systems.",
    author: "Abhishek Sinha",
    date: "Apr 10, 2026",
    readTime: "6 min read",
    icon: "🤖",
    gradient: "from-amber-100 to-amber-200 dark:from-amber-950/40 dark:to-amber-900/40",
  },
];

function AboutPage() {
  return (
    <div className="min-h-screen bg-bg text-text flex flex-col">
      <Navbar />

      {/* ── HERO SECTION ── */}
      <section className="relative pt-32 pb-16 md:pt-48 md:pb-24 text-center overflow-hidden">
        {/* Glow Effects */}
        <div className="absolute top-[-10%] right-[-10%] w-[45%] aspect-square bg-radial-gradient from-accent/10 to-transparent blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-[-15%] w-[50%] aspect-square bg-radial-gradient from-accent-secondary/5 to-transparent blur-3xl pointer-events-none" />
        
        <div className="container mx-auto max-w-4xl px-6 relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest mb-6 bg-accent/10 text-accent border border-accent/10">
            🚀 Our Story
          </div>
          <h1 className="font-display font-black text-4xl sm:text-6xl md:text-7xl mb-6 leading-[1.05] tracking-tight">
            Building the future of <span className="text-gradient">career growth</span>
          </h1>
          <p className="text-muted font-medium text-lg sm:text-xl max-w-2xl mx-auto leading-relaxed">
            Vogats AI was born from a simple belief: every professional deserves a state-of-the-art AI-powered platform that helps them land their dream job faster.
          </p>
        </div>
      </section>

      {/* ── STATS SECTION ── */}
      <section className="pb-20 md:pb-28">
        <div className="container mx-auto max-w-5xl px-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat, i) => (
              <div 
                key={i} 
                className="bg-card border border-border rounded-3xl p-6 sm:p-8 text-center transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:border-accent/20"
              >
                <div className="font-display font-black text-3xl sm:text-4xl text-accent mb-2">
                  {stat.value}
                </div>
                <div className="text-[11px] font-bold text-muted uppercase tracking-widest">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── MISSION SECTION ── */}
      <section className="pb-24 md:pb-32">
        <div className="container mx-auto max-w-6xl px-6">
          <div className="grid md:grid-cols-2 gap-12 md:gap-16 items-center">
            {/* Mission text */}
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest bg-accent-secondary/10 text-accent-secondary border border-accent-secondary/10">
                🎯 Mission
              </div>
              <h2 className="font-display font-black text-3xl sm:text-4xl md:text-5xl leading-tight">
                We're on a mission to <span className="italic text-muted font-medium">democratize</span> career success
              </h2>
              <div className="space-y-4 text-muted leading-relaxed font-medium">
                <p>
                  Finding a job shouldn't depend on who you know or how much you can spend on resume writers. Vogats CV puts enterprise-grade career tools in the hands of every job seeker — free, fast, and intelligent.
                </p>
                <p>
                  Our AI models have been trained on hundreds of thousands of successful resumes and job descriptions to give you a real competitive edge.
                </p>
              </div>
            </div>

            {/* Mission visual */}
            <div className="bg-card border border-border rounded-[2.5rem] p-8 md:p-10 relative overflow-hidden shadow-inner">
              <div className="absolute inset-0 bg-gradient-to-br from-accent/5 to-accent-secondary/5 pointer-events-none" />
              <ul className="space-y-6 relative z-10">
                {[
                  { icon: "🤖", title: "AI-Powered Writing", desc: "Generate compelling bullet points and summaries in seconds" },
                  { icon: "📊", title: "ATS Optimization", desc: "Score your resume against real job descriptions" },
                  { icon: "✨", title: "One-Click Tailoring", desc: "Customize your resume for each job application instantly" },
                  { icon: "🎓", title: "Interview Coach", desc: "AI-powered mock interviews and live feedback" }
                ].map((item, i) => (
                  <li key={i} className="flex gap-4">
                    <div className="w-10 h-10 rounded-xl bg-surface border border-border flex items-center justify-center shrink-0 text-lg shadow-sm">
                      {item.icon}
                    </div>
                    <div>
                      <strong className="block text-sm font-bold text-text mb-1">{item.title}</strong>
                      <span className="text-xs text-muted font-medium">{item.desc}</span>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ── TEAM SECTION ── */}
      <section className="pb-24 md:pb-36">
        <div className="container mx-auto max-w-6xl px-6">
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-4">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest bg-purple-500/10 text-purple-500 border border-purple-500/10">
              👥 The Team
            </div>
            <h2 className="font-display font-black text-3xl sm:text-4xl md:text-5xl">
              Built by people who've been there
            </h2>
            <p className="text-muted font-medium leading-relaxed">
              Our founders have recruited at top companies and felt the pain of the job search — firsthand.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {team.map((member, i) => (
              <div 
                key={i} 
                className="bg-card border border-border rounded-3xl p-8 text-center transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:border-accent/20"
              >
                <div className={`w-20 h-20 rounded-full bg-gradient-to-br ${member.gradient} text-white flex items-center justify-center text-3xl font-display font-black mx-auto mb-6 shadow-lg`}>
                  {member.initial}
                </div>
                <h3 className="font-display font-black text-lg mb-1">{member.name}</h3>
                <div className="text-xs font-bold text-accent uppercase tracking-widest mb-4">
                  {member.role}
                </div>
                <p className="text-sm text-muted leading-relaxed font-medium">
                  {member.desc}
                </p>
              </div>
            ))}
          </div>

          {/* Corporate Information */}
          <div className="mt-20 p-8 sm:p-12 rounded-[2.5rem] bg-card border border-border relative overflow-hidden shadow-2xl max-w-4xl mx-auto">
            <div className="absolute top-[-60px] right-[-60px] w-64 h-64 rounded-full bg-accent/5 blur-3xl pointer-events-none" />
            <div className="grid md:grid-cols-2 gap-10 sm:gap-12 relative z-10 items-center">
              <div>
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest bg-emerald-500/10 text-emerald-500 border border-emerald-500/10 mb-6">
                  🏢 Registered Entity
                </div>
                <h3 className="font-display font-black text-2xl mb-4 text-text">Vogats AI</h3>
                <p className="text-sm text-muted leading-relaxed font-medium mb-6">
                  Vogats CV is a globally recognized AI career building platform operated under registered corporate offices in India. We aim to design career tools that are accessible, simple, and impactful.
                </p>
                <div className="flex items-start gap-4">
                  <span className="text-2xl mt-0.5 shrink-0">📍</span>
                  <div>
                    <h4 className="text-xs font-bold text-text uppercase tracking-widest mb-1">Registered Office</h4>
                    <address className="text-xs text-muted leading-relaxed not-italic font-medium">
                      Samastipur, Bihar, India
                    </address>
                  </div>
                </div>
              </div>
              <div className="p-6 sm:p-8 rounded-3xl bg-surface border border-border space-y-6">
                <div className="flex items-start gap-4">
                  <span className="text-2xl mt-0.5 shrink-0">💬</span>
                  <div>
                    <h4 className="text-xs font-bold text-text uppercase tracking-widest mb-1">WhatsApp &amp; Support</h4>
                    <p className="text-xs text-muted font-medium mb-2">Connect instantly with our dedicated support line for fast resolutions.</p>
                    <a 
                      href="https://wa.me/919801200459" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-xs font-black text-emerald-500 hover:underline"
                    >
                      +91 98012 00459 ↗
                    </a>
                  </div>
                </div>
                <div className="flex items-start gap-4 border-t border-border pt-6">
                  <span className="text-2xl mt-0.5 shrink-0">📧</span>
                  <div>
                    <h4 className="text-xs font-bold text-text uppercase tracking-widest mb-1">Email Support</h4>
                    <p className="text-xs text-muted font-medium mb-2">For business inquiries, refund requests, or API partnerships.</p>
                    <a 
                      href="mailto:support@vogats.com" 
                      className="text-xs font-black text-accent hover:underline"
                    >
                      support@vogats.com
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── BLOG SECTION ── */}
      <section id="blog" className="py-24 md:py-32 border-t border-border bg-surface/30">
        <div className="container mx-auto max-w-6xl px-6">
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-4">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest bg-accent/10 text-accent border border-accent/10">
              📝 Blog
            </div>
            <h2 className="font-display font-black text-3xl sm:text-4xl md:text-5xl">
              Career insights &amp; tips
            </h2>
            <p className="text-muted font-medium leading-relaxed">
              Expert advice to help you nail your job search, ace interviews, and grow your career.
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {blogs.map((blog, i) => (
              <article 
                key={i}
                className="bg-card border border-border rounded-3xl overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:border-accent/10 flex flex-col"
              >
                {/* Visual Header */}
                <div className={`w-full aspect-[16/9] bg-gradient-to-br ${blog.gradient} flex items-center justify-center text-5xl shrink-0`}>
                  {blog.icon}
                </div>
                {/* Content */}
                <div className="p-6 sm:p-8 flex flex-col flex-1">
                  <div className="mb-4">
                    <span className="inline-block bg-accent/10 text-accent text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full border border-accent/10">
                      {blog.tag}
                    </span>
                  </div>
                  <h3 className="font-display font-black text-lg mb-3 leading-snug hover:text-accent transition-colors duration-200 flex-1">
                    {blog.title}
                  </h3>
                  <p className="text-xs text-muted leading-relaxed font-medium mb-6">
                    {blog.desc}
                  </p>
                  {/* Meta */}
                  <div className="pt-4 border-t border-border flex items-center justify-between text-[11px] font-bold text-muted uppercase tracking-widest mt-auto">
                    <span>{blog.author}</span>
                    <div className="flex items-center gap-2">
                      <span>{blog.date}</span>
                      <span className="w-1 h-1 rounded-full bg-border" />
                      <span>{blog.readTime}</span>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>

          <div className="text-center mt-16">
            <a 
              href="#blog" 
              className="inline-flex items-center gap-2.5 px-8 py-3.5 rounded-2xl border-2 border-accent-solid text-accent-solid font-display font-black text-sm uppercase tracking-widest transition-all duration-300 hover:bg-accent-solid hover:text-white"
            >
              <span>View All Articles</span>
              <ArrowRight className="w-4 h-4" />
            </a>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
