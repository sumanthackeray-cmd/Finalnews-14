import { createFileRoute, Link, useLocation, Outlet } from "@tanstack/react-router";
import { useState } from "react";
import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Footer";
import { cn } from "@/lib/utils";

// Route definition with highly optimized SEO headers
export const Route = createFileRoute("/blog")({
  head: () => ({
    meta: [
      { title: "Blog — Career Tips & Resume Advice | Vogats AI" },
      { name: "description", content: "Expert career advice, ATS tips, resume writing guides, and job search strategies from the Vogats AI team." },
      { name: "keywords", content: "Vogats AI, resume builder, career tips, ATS resume guide, salary negotiation script, LinkedIn profile checklist, interview preparation" },
      { name: "robots", content: "index, follow" },
      
      // OpenGraph
      { property: "og:title", content: "Blog — Career Tips & Resume Advice | Vogats AI" },
      { property: "og:description", content: "Expert career advice, ATS tips, resume writing guides, and job search strategies from the Vogats AI team." },
      { property: "og:url", content: "https://cv.vogats.com/blog" },
      { property: "og:type", content: "website" },
      { property: "og:site_name", content: "Vogats AI" },
      
      // Twitter
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "Blog — Career Tips & Resume Advice | Vogats AI" },
      { name: "twitter:description", content: "Expert career advice, ATS tips, resume writing guides, and job search strategies from the Vogats AI team." }
    ],
    links: [
      { rel: "canonical", href: "https://cv.vogats.com/blog" },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      { rel: "stylesheet", href: "https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;1,9..40,400&display=swap" }
    ]
  }),
  component: BlogPage,
});

const ARTICLES = [
  {
    id: "blog-ats-mistakes",
    topic: "ats",
    tag: "ATS Tips",
    tagClass: "tag-ats",
    title: "10 ATS Mistakes That Are Silently Killing Your Resume",
    desc: "Most job seekers don't realize their resume never reaches a human. Here's everything about passing ATS filters in 2026.",
    author: "Mr. Kamlesh Kumar",
    avatar: "K",
    avClass: "av1",
    date: "May 12, 2026",
    readTime: "7 min read",
    icon: "📄"
  },
  {
    id: "blog-star-method",
    topic: "career",
    tag: "Career Growth",
    tagClass: "tag-career",
    title: "How to Get Promoted in 12 Months Using the STAR Method",
    desc: "A proven framework for documenting your wins and making the compelling case for your next role.",
    author: "Suman Thackeray",
    avatar: "S",
    avClass: "av2",
    date: "Apr 28, 2026",
    readTime: "5 min read",
    icon: "💼"
  },
  {
    id: "blog-ai-jobs",
    topic: "ai",
    tag: "AI & Jobs",
    tagClass: "tag-ai",
    title: "AI Won't Take Your Job — But This Will Help You Keep It",
    desc: "How to future-proof your career in the age of generative AI and automated hiring systems.",
    author: "Abhishek Sinha",
    avatar: "A",
    avClass: "av3",
    date: "Apr 10, 2026",
    readTime: "6 min read",
    icon: "🤖"
  }
];

function BlogPage() {
  const location = useLocation();
  const isDetailPage = location.pathname.startsWith("/blog/") && location.pathname.length > 6;

  if (isDetailPage) {
    return <Outlet />;
  }

  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);

  const filteredArticles = selectedTopic 
    ? ARTICLES.filter(a => a.topic === selectedTopic)
    : ARTICLES;

  // JSON-LD Structured Data Schema for Google Search Rich Results
  const jsonLdSchema = {
    "@context": "https://schema.org",
    "@type": "Blog",
    "name": "Vogats AI Blog",
    "description": "Expert career advice, ATS tips, resume writing guides, and job search strategies from the Vogats AI team.",
    "url": "https://cv.vogats.com/blog",
    "publisher": {
      "@type": "Organization",
      "name": "Vogats AI",
      "logo": {
        "@type": "ImageObject",
        "url": "https://cv.vogats.com/favicon.png"
      }
    },
    "blogPost": ARTICLES.map(art => ({
      "@type": "BlogPosting",
      "headline": art.title,
      "description": art.desc,
      "datePublished": art.date,
      "author": {
        "@type": "Person",
        "name": art.author
      }
    }))
  };

  return (
    <div className="blog-body">
      {/* Dynamic SEO JSON-LD Script tag */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdSchema) }}
      />

      <style dangerouslySetInnerHTML={{ __html: `
        .blog-body {
          --bg: #faf9f6; --surface: #fff; --ink: #0f0e0b; --ink2: #52504a; --ink3: #a09d96;
          --accent: #1a4dff; --ap: #eaefff; --green: #00b87a; --gp: #e5f9f2;
          --amber: #e07800; --amberp: #fff3e0;
          --border: #e8e4db; --r: 16px;
          --sh: 0 2px 12px rgba(0,0,0,.07); --sh2: 0 8px 32px rgba(0,0,0,.12);
          --body: 'DM Sans', sans-serif; --display: 'Instrument Serif', serif;
          font-family: var(--body);
          background: var(--bg);
          color: var(--ink);
          -webkit-font-smoothing: antialiased;
          overflow-x: hidden;
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          transition: background-color 0.3s, color 0.3s;
        }

        /* Dark Mode overrides using global html.dark selector */
        html.dark .blog-body {
          --bg: #0f0e14;
          --surface: #19181f;
          --ink: #f0effe;
          --ink2: #a09db8;
          --ink3: #5e5b75;
          --accent: #6366f1;
          --ap: rgba(99,102,241,.15);
          --green: #00b87a;
          --gp: rgba(0,184,122,.12);
          --amber: #f59e0b;
          --amberp: rgba(245,158,11,.12);
          --border: rgba(255,255,255,.08);
          --sh: 0 2px 16px rgba(0,0,0,.3);
          --sh2: 0 8px 40px rgba(0,0,0,.4);
        }

        /* HERO */
        .blog-hero {
          padding: 72px 32px 52px;
          text-align: center;
          background: linear-gradient(175deg, rgba(26, 77, 255, 0.06) 0%, transparent 55%);
          position: relative; overflow: hidden;
        }
        .blog-hero::before {
          content: ''; position: absolute; top: -80px; left: 50%; transform: translateX(-50%);
          width: 800px; height: 400px; border-radius: 50%;
          background: radial-gradient(ellipse, rgba(26, 77, 255, 0.07) 0%, transparent 65%);
          pointer-events: none;
        }
        .hero-label {
          display: inline-flex; align-items: center; gap: 6px;
          background: var(--ap); color: var(--accent); border: 1px solid rgba(26, 77, 255, 0.18);
          padding: 5px 14px; border-radius: 100px;
          font-size: .72rem; font-weight: 700; text-transform: uppercase; letter-spacing: .07em;
          margin-bottom: 20px; animation: fD .5s ease both;
        }
        .blog-hero h1 {
          font-family: var(--display); font-size: clamp(2.2rem, 6vw, 3.8rem);
          font-weight: 400; line-height: 1.1; margin-bottom: 16px;
          animation: fD .5s .08s ease both;
        }
        .blog-hero h1 i { color: var(--accent); }
        .blog-hero p {
          font-size: .98rem; color: var(--ink2); max-width: 500px; margin: 0 auto 32px; line-height: 1.75;
          animation: fD .5s .16s ease both;
        }
        /* Topic filter pills */
        .topic-row {
          display: none; gap: 8px; flex-wrap: wrap; justify-content: center;
          animation: fD .5s .24s ease both;
        }
        @media(min-width: 768px) {
          .topic-row { display: flex; }
        }
        .t-pill {
          padding: 7px 16px; border-radius: 100px;
          border: 1.5px solid var(--border); background: var(--surface);
          font-size: .76rem; font-weight: 600; color: var(--ink2); cursor: pointer; transition: all .2s;
        }
        .t-pill:hover, .t-pill.on { background: var(--accent); border-color: var(--accent); color: #fff; }

        /* FEATURED ARTICLE */
        .featured-wrap { max-width: 1100px; margin: 0 auto; padding: 48px 32px 0; width: 100%; }
        .feat-label { font-size: .72rem; font-weight: 700; text-transform: uppercase; letter-spacing: .1em; color: var(--ink3); margin-bottom: 16px; }
        .feat-card {
          display: grid; grid-template-columns: 1fr 1fr; gap: 0;
          background: var(--surface); border: 1px solid var(--border); border-radius: 24px;
          overflow: hidden; box-shadow: var(--sh);
          transition: transform .25s, box-shadow .25s;
          animation: fU .5s ease both;
        }
        .feat-card:hover { transform: translateY(-4px); box-shadow: var(--sh2); }
        .feat-img {
          min-height: 340px; background: #e8edff;
          display: grid; place-items: center; font-size: 80px;
          position: relative; overflow: hidden;
        }
        .feat-img::after {
          content: 'FEATURED';
          position: absolute; top: 16px; left: 16px;
          background: var(--accent); color: #fff;
          font-size: .65rem; font-weight: 800; letter-spacing: .1em; padding: 4px 10px; border-radius: 100px;
          font-family: var(--body);
        }
        .feat-body { padding: 40px 36px; display: flex; flex-direction: column; justify-content: center; }
        .feat-tag {
          display: inline-block; background: var(--ap); color: var(--accent);
          padding: 4px 12px; border-radius: 100px; font-size: .72rem; font-weight: 700;
          text-transform: uppercase; letter-spacing: .06em; margin-bottom: 16px;
          align-self: flex-start;
        }
        .feat-body h2 {
          font-family: var(--display); font-size: clamp(1.5rem, 3vw, 2.1rem);
          font-weight: 400; line-height: 1.2; margin-bottom: 14px; color: var(--ink);
        }
        .feat-body p { font-size: .92rem; color: var(--ink2); line-height: 1.75; margin-bottom: 24px; }
        .feat-meta { display: flex; align-items: center; gap: 16px; margin-bottom: 24px; }
        .meta-av {
          width: 36px; height: 36px; border-radius: 50%;
          background: linear-gradient(135deg, #1a4dff, #7c3aed);
          display: grid; place-items: center; color: #fff; font-weight: 700; font-size: .85rem; flex-shrink: 0;
        }
        .meta-info strong { display: block; font-size: .82rem; font-weight: 700; color: var(--ink); }
        .meta-info span { font-size: .76rem; color: var(--ink3); }
        .read-btn {
          display: inline-flex; align-items: center; gap: 8px;
          background: var(--ink); color: #fff; padding: 12px 24px; border-radius: 12px;
          font-weight: 700; font-size: .85rem; align-self: flex-start;
          transition: transform .2s, box-shadow .2s;
        }
        .read-btn:hover { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(0,0,0,.2); }

        /* BLOG GRID */
        .grid-section { max-width: 1100px; margin: 0 auto; padding: 52px 32px 80px; width: 100%; }
        .grid-head { display: flex; align-items: center; justify-content: space-between; margin-bottom: 32px; }
        .grid-head h2 { font-family: var(--display); font-size: 1.6rem; font-weight: 400; }
        .all-link { font-size: .82rem; font-weight: 600; color: var(--accent); display: flex; align-items: center; gap: 4px; }
        .blog-grid {
          display: grid; grid-template-columns: repeat(3, 1fr); gap: 22px;
        }
        .blog-card {
          background: var(--surface); border: 1px solid var(--border); border-radius: var(--r);
          overflow: hidden; transition: transform .25s, box-shadow .25s;
          animation: fU .45s ease both; cursor: pointer;
          display: flex; flex-direction: column;
        }
        .blog-card:hover { transform: translateY(-5px); box-shadow: var(--sh2); }
        .bc-img {
          width: 100%; aspect-ratio: 16/9; display: grid; place-items: center;
          font-size: 42px; position: relative; overflow: hidden;
        }
        .bc-img-1 { background: #e8edff }
        .bc-img-2 { background: #d4f5ec }
        .bc-img-3 { background: #fff3e0 }
        .bc-img-4 { background: #fce7f3 }
        .bc-img-5 { background: #ede9fe }
        .bc-body { padding: 20px; flex: 1; display: flex; flex-direction: column; }
        .bc-tag {
          display: inline-block; padding: 3px 10px; border-radius: 100px;
          font-size: .68rem; font-weight: 700; text-transform: uppercase; letter-spacing: .07em;
          margin-bottom: 10px; align-self: flex-start;
        }
        .tag-ats { background: var(--ap); color: var(--accent) }
        .tag-career { background: var(--gp); color: var(--green) }
        .tag-ai { background: var(--amberp); color: var(--amber) }

        .bc-body h3 {
          font-family: var(--display); font-size: 1.05rem; font-weight: 400;
          line-height: 1.3; margin-bottom: 8px; color: var(--ink);
        }
        .bc-body p { font-size: .82rem; color: var(--ink2); line-height: 1.6; margin-bottom: 16px; }
        .bc-meta { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; margin-top: auto; }
        .bc-av {
          width: 24px; height: 24px; border-radius: 50%;
          display: grid; place-items: center; color: #fff; font-size: .65rem; font-weight: 700; flex-shrink: 0;
        }
        .av1 { background: linear-gradient(135deg, #1a4dff, #7c3aed) }
        .av2 { background: linear-gradient(135deg, #00b87a, #1a4dff) }
        .av3 { background: linear-gradient(135deg, #e07800, #ef4444) }
        .bc-author { font-size: .73rem; font-weight: 600; color: var(--ink2); }
        .bc-dot { width: 3px; height: 3px; border-radius: 50%; background: var(--border) }
        .bc-date, .bc-read { font-size: .72rem; color: var(--ink3); }
        .bc-read-link {
          display: flex; align-items: center; gap: 6px; margin-top: 14px;
          color: var(--accent); font-size: .78rem; font-weight: 700;
          transition: gap .2s;
        }
        .blog-card:hover .bc-read-link { gap: 10px; }

        /* NEWSLETTER */
        .blog-newsletter {
          width: 100%; max-width: 700px; margin: 0 auto 80px;
          padding: 0 32px;
        }
        .nl-box {
          background: linear-gradient(135deg, #0f0e0b 0%, #1a1a28 100%);
          border-radius: 24px; padding: 40px 36px; text-align: center;
          position: relative; overflow: hidden;
        }
        .nl-box::before { content: ''; position: absolute; top: -60px; right: -60px; width: 200px; height: 200px; border-radius: 50%; background: rgba(26, 77, 255, 0.15) }
        .nl-box::after { content: ''; position: absolute; bottom: -40px; left: -40px; width: 160px; height: 160px; border-radius: 50%; background: rgba(0, 184, 122, 0.1) }
        .nl-box h3 { font-family: var(--display); font-size: 1.7rem; color: #fff; margin-bottom: 10px; position: relative; }
        .nl-box p { font-size: .88rem; color: rgba(255, 255, 255, 0.65); margin-bottom: 24px; line-height: 1.65; position: relative; }
        .nl-form { display: flex; gap: 10px; max-width: 440px; margin: 0 auto; position: relative; }
        .nl-input {
          flex: 1; padding: 12px 18px; border-radius: 10px; border: none;
          font-family: var(--body); font-size: .88rem; background: #fff; color: var(--ink); outline: none;
        }
        .nl-btn {
          background: var(--accent); color: #fff; border: none;
          padding: 12px 22px; border-radius: 10px;
          font-family: var(--body); font-weight: 700; font-size: .85rem; cursor: pointer;
          white-space: nowrap; transition: opacity .2s;
        }
        .nl-btn:hover { opacity: .85; }

        @keyframes fD { from { opacity: 0; transform: translateY(-12px) } to { opacity: 1; transform: translateY(0) } }
        @keyframes fU { from { opacity: 0; transform: translateY(18px) } to { opacity: 1; transform: translateY(0) } }

        /* Stagger cards */
        .blog-card:nth-child(1) { animation-delay: .05s }
        .blog-card:nth-child(2) { animation-delay: .1s }
        .blog-card:nth-child(3) { animation-delay: .15s }

        @media(max-width: 900px) {
          .feat-card { grid-template-columns: 1fr }
          .feat-img { min-height: 220px }
          .blog-grid { grid-template-columns: repeat(2, 1fr) }
        }
        @media(max-width: 600px) {
          .blog-hero { padding: 48px 18px 36px }
          .featured-wrap, .grid-section, .blog-newsletter { padding-left: 18px; padding-right: 18px }
          .blog-grid { grid-template-columns: 1fr }
          .feat-body { padding: 24px 20px }
          .nl-form { flex-direction: column }
        }
      `}} />

      {/* Renders unified site navigation */}
      <Navbar />

      {/* HERO */}
      <section className="blog-hero">
        <div className="hero-label">📝 Vogats AI Blog</div>
        <h1>Career wisdom,<br /><i>delivered fresh</i></h1>
        <p>Expert tips on resume writing, ATS optimization, interview prep, and landing your dream job — from people who've been on both sides of the hiring table.</p>
        <div className="topic-row">
          <button className={cn("t-pill", !selectedTopic && "on")} onClick={() => setSelectedTopic(null)}>All Posts</button>
          <button className={cn("t-pill", selectedTopic === "ats" && "on")} onClick={() => setSelectedTopic("ats")}>ATS Tips</button>
          <button className={cn("t-pill", selectedTopic === "career" && "on")} onClick={() => setSelectedTopic("career")}>Career Growth</button>
          <button className={cn("t-pill", selectedTopic === "ai" && "on")} onClick={() => setSelectedTopic("ai")}>AI & Jobs</button>
        </div>

        <div className="md:hidden mt-6 w-full max-w-[280px] mx-auto animate-[fD_0.5s_0.24s_ease_both]">
          <select 
            className="w-full p-3.5 rounded-xl border-2 border-[var(--border)] bg-[var(--surface)] text-[var(--ink2)] font-bold text-sm outline-none focus:border-[var(--accent)] transition-all appearance-none cursor-pointer shadow-sm"
            value={selectedTopic || "all"}
            onChange={(e) => setSelectedTopic(e.target.value === "all" ? null : e.target.value)}
            style={{ backgroundImage: `url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%23a09d96%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E")`, backgroundRepeat: "no-repeat", backgroundPosition: "right 1.2rem top 50%", backgroundSize: "0.65rem auto" }}
          >
            <option value="all">📝 All Posts</option>
            <option value="ats">🤖 ATS Tips</option>
            <option value="career">🚀 Career Growth</option>
            <option value="ai">🧠 AI & Jobs</option>
          </select>
        </div>
      </section>

      {/* FEATURED */}
      {!selectedTopic && (
        <div className="featured-wrap">
          <p className="feat-label">✦ Featured Article</p>
          <Link to="/blog/blog-ats-mistakes" style={{ display: "block" }}>
            <article className="feat-card">
              <div className="feat-img" style={{ background: "linear-gradient(135deg,#dbeafe,#e8edff)" }}>📄</div>
              <div className="feat-body">
                <span className="feat-tag">ATS Tips</span>
                <h2>10 ATS Mistakes That Are Silently Killing Your Resume (And How to Fix Them)</h2>
                <p>Most job seekers don't realize their resume never reaches a human. 75% of applications are rejected by Applicant Tracking Systems before a single recruiter sees them. Here's everything you need to know about passing ATS filters in 2026.</p>
                <div className="feat-meta">
                  <div className="meta-av">K</div>
                  <div className="meta-info">
                    <strong>Mr. Kamlesh Kumar</strong>
                    <span>May 12, 2026 · 7 min read</span>
                  </div>
                </div>
                <span className="read-btn">Read Full Article →</span>
              </div>
            </article>
          </Link>
        </div>
      )}

      {/* ALL POSTS GRID */}
      <section className="grid-section">
        <div className="grid-head">
          <h2>{selectedTopic ? `${selectedTopic.toUpperCase()} Articles` : "All Articles"}</h2>
          <span className="all-link">{filteredArticles.length} posts →</span>
        </div>
        <div className="blog-grid" id="blogGrid">
          {filteredArticles.map((art) => (
            <Link to={`/blog/${art.id}`} key={art.id} className="blog-card">
              <article style={{ display: "flex", flexDirection: "column", height: "100%" }}>
                <div className={cn("bc-img", art.avClass === "av1" ? "bc-img-1" : art.avClass === "av2" ? "bc-img-2" : "bc-img-3")}>
                  {art.icon}
                </div>
                <div className="bc-body">
                  <span className={cn("bc-tag", art.tagClass)}>{art.tag}</span>
                  <h3>{art.title}</h3>
                  <p>{art.desc}</p>
                  <div className="bc-meta">
                    <div className={cn("bc-av", art.avClass)}>{art.avatar}</div>
                    <span className="bc-author">{art.author}</span>
                    <div className="bc-dot"></div>
                    <span className="bc-date">{art.date}</span>
                    <div className="bc-dot"></div>
                    <span className="bc-read">{art.readTime}</span>
                  </div>
                  <div className="bc-read-link">Read Article →</div>
                </div>
              </article>
            </Link>
          ))}
        </div>
      </section>

      {/* NEWSLETTER */}
      <section className="blog-newsletter">
        <div className="nl-box">
          <h3>Get career tips in your inbox</h3>
          <p>Weekly career advice, resume tips, and job market insights — no spam, unsubscribe anytime.</p>
          <form className="nl-form" onSubmit={(e) => { e.preventDefault(); alert('Subscribed successfully!'); }}>
            <input className="nl-input" type="email" placeholder="your@email.com" required style={{ color: "#000" }} />
            <button className="nl-btn" type="submit">Subscribe →</button>
          </form>
        </div>
      </section>

      {/* Renders unified site footer */}
      <Footer />
    </div>
  );
}
