import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Footer";
import { cn } from "@/lib/utils";

// Route definition with dynamic meta heads
export const Route = createFileRoute("/blog/$id")({
  head: ({ params }) => {
    const art = ARTICLES_METADATA[params.id] || ARTICLES_METADATA["blog-ats-mistakes"];
    return {
      meta: [
        { title: `${art.title} | Vogats AI Blog` },
        { name: "description", content: art.desc },
        { name: "keywords", content: `${art.tag}, Vogats AI, career tips, resume guide, ${art.title}` },
        { name: "robots", content: "index, follow" },
        
        // OpenGraph
        { property: "og:title", content: `${art.title} | Vogats AI Blog` },
        { property: "og:description", content: art.desc },
        { property: "og:url", content: `https://cv.vogats.com/blog/${params.id}` },
        { property: "og:type", content: "article" },
        { property: "og:site_name", content: "Vogats AI" },
        { property: "article:published_time", content: art.isoDate },
        { property: "article:author", content: art.author },
        { property: "article:section", content: art.tag },
        
        // Twitter
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:title", content: `${art.title} | Vogats AI Blog` },
        { name: "twitter:description", content: art.desc }
      ],
      links: [
        { rel: "canonical", href: `https://cv.vogats.com/blog/${params.id}` },
        { rel: "preconnect", href: "https://fonts.googleapis.com" },
        { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
        { rel: "stylesheet", href: "https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;1,9..40,400&display=swap" }
      ]
    };
  },
  component: BlogPostDetail,
});

const ARTICLES_METADATA: Record<string, {
  tag: string;
  tagClass: string;
  title: string;
  desc: string;
  author: string;
  avatar: string;
  avClass: string;
  date: string;
  isoDate: string;
  readTime: string;
  icon: string;
}> = {
  "blog-ats-mistakes": {
    tag: "ATS Tips",
    tagClass: "tag-ats",
    title: "10 ATS Mistakes That Are Silently Killing Your Resume (And How to Fix Them)",
    desc: "Most job seekers don't realize their resume never reaches a human. 75% of applications are filtered out by Applicant Tracking Systems before a single recruiter lays eyes on them. Here's every mistake — and exactly how to fix each one.",
    author: "Mr. Kamlesh Kumar",
    avatar: "K",
    avClass: "av1",
    date: "May 12, 2026",
    isoDate: "2026-05-12",
    readTime: "7 min read",
    icon: "📄"
  },
  "blog-star-method": {
    tag: "Career Growth",
    tagClass: "tag-career",
    title: "How to Get Promoted in 12 Months Using the STAR Method",
    desc: "A proven framework for documenting your wins and making the compelling case for your next promotion. Learn the STAR method with real examples.",
    author: "Suman Thackeray",
    avatar: "S",
    avClass: "av2",
    date: "Apr 28, 2026",
    isoDate: "2026-04-28",
    readTime: "5 min read",
    icon: "💼"
  },
  "blog-ai-jobs": {
    tag: "AI & Jobs",
    tagClass: "tag-ai",
    title: "AI Won't Take Your Job — But This Will Help You Keep It",
    desc: "How to future-proof your career in the age of generative AI. The 6 skills that matter most, and how to show them on your resume.",
    author: "Abhishek Sinha",
    avatar: "A",
    avClass: "av3",
    date: "Apr 10, 2026",
    isoDate: "2026-04-10",
    readTime: "6 min read",
    icon: "🤖"
  }
};

function BlogPostDetail() {
  const { id } = Route.useParams();
  const art = ARTICLES_METADATA[id] || ARTICLES_METADATA["blog-ats-mistakes"];
  const [scrollProgress, setScrollProgress] = useState(0);

  // Update reading progress bar
  useEffect(() => {
    const handleScroll = () => {
      const h = document.documentElement;
      const total = h.scrollHeight - h.clientHeight;
      if (total > 0) {
        setScrollProgress((h.scrollTop / total) * 100);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // JSON-LD Structured Schema tag for this specific Article
  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "headline": art.title,
    "description": art.desc,
    "datePublished": art.isoDate,
    "author": {
      "@type": "Person",
      "name": art.author
    },
    "publisher": {
      "@type": "Organization",
      "name": "Vogats AI",
      "logo": {
        "@type": "ImageObject",
        "url": "https://cv.vogats.com/favicon.png"
      }
    },
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": `https://cv.vogats.com/blog/${id}`
    }
  };

  return (
    <div className="blog-body">
      {/* Dynamic SEO JSON-LD Script tag */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />

      {/* Dynamic Top Scroll Progress Indicator */}
      <div className="progress-bar" style={{ width: `${scrollProgress}%` }} />

      <style dangerouslySetInnerHTML={{ __html: `
        .blog-body {
          --bg: #faf9f6; --surface: #fff; --ink: #0f0e0b; --ink2: #52504a; --ink3: #a09d96;
          --accent: #1a4dff; --ap: #eaefff; --green: #00b87a; --gp: #e5f9f2;
          --red: #dc2626; --rp: #fee2e2; --amber: #e07800; --amberp: #fff3e0;
          --border: #e8e4db; --r: 14px;
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

        /* Set up distinct greenish bg for STAR method in light mode */
        .blog-body.star-theme {
          --bg: #f5faf7;
          --border: #dce8e0;
          --accent: #00b87a;
          --ap: #e5f9f2;
        }

        /* Set up dark bg for AI jobs by default if no light class is set */
        .blog-body.ai-theme {
          --bg: #0f0e14;
          --surface: #19181f;
          --ink: #f0effe;
          --ink2: #a09db8;
          --ink3: #5e5b75;
          --accent: #6366f1;
          --ap: rgba(99,102,241,.15);
          --green: #00b87a;
          --gp: rgba(0,184,122,.12);
          --border: rgba(255,255,255,.08);
          --sh: 0 2px 16px rgba(0,0,0,.3);
          --sh2: 0 8px 40px rgba(0,0,0,.4);
        }

        /* Dark Mode overrides using global html.dark selector */
        html.dark .blog-body {
          --bg: #0f0e14;
          --surface: #19181f;
          --surface2: #201f28;
          --ink: #f0effe;
          --ink2: #a09db8;
          --ink3: #5e5b75;
          --accent: #6366f1;
          --ap: rgba(99,102,241,.15);
          --green: #00b87a;
          --gp: rgba(0,184,122,.12);
          --red: #ef4444;
          --rp: rgba(239,68,68,.12);
          --amber: #f59e0b;
          --amberp: rgba(245,158,11,.12);
          --border: rgba(255,255,255,.08);
          --sh: 0 2px 16px rgba(0,0,0,.3);
          --sh2: 0 8px 40px rgba(0,0,0,.4);
        }

        /* Force light mode variables if html has class "light" */
        html.light .blog-body {
          --bg: #faf9f6; --surface: #fff; --ink: #0f0e0b; --ink2: #52504a; --ink3: #a09d96;
          --accent: #1a4dff; --ap: #eaefff; --green: #00b87a; --gp: #e5f9f2;
          --red: #dc2626; --rp: #fee2e2; --amber: #e07800; --amberp: #fff3e0;
          --border: #e8e4db;
          --sh: 0 2px 12px rgba(0,0,0,.07); --sh2: 0 8px 32px rgba(0,0,0,.12);
        }
        html.light .blog-body.star-theme {
          --bg: #f5faf7;
          --border: #dce8e0;
          --accent: #00b87a;
          --ap: #e5f9f2;
        }

        /* TOP PROGRESS BAR */
        .progress-bar {
          position: fixed; top: 0; left: 0; height: 3px; background: var(--accent); z-index: 9999; transition: width .1s linear;
        }

        /* BREADCRUMB */
        .crumb { max-width: 780px; margin: 0 auto; padding: 18px 32px 0; font-size: .76rem; color: var(--ink3); display: flex; align-items: center; gap: 6px; width: 100%; }
        .crumb a { color: var(--ink3); transition: color .2s; }
        .crumb a:hover { color: var(--accent); }

        /* ARTICLE HERO */
        .art-hero { max-width: 780px; margin: 0 auto; padding: 28px 32px 0; animation: fD .5s ease both; width: 100%; }
        .art-tag { display: inline-flex; align-items: center; gap: 6px; background: var(--ap); color: var(--accent); padding: 5px 13px; border-radius: 100px; font-size: .72rem; font-weight: 700; text-transform: uppercase; letter-spacing: .07em; margin-bottom: 20px; border: 1px solid rgba(26, 77, 255, 0.1); }
        .art-hero h1 { font-family: var(--display); font-size: clamp(1.9rem, 5vw, 2.9rem); font-weight: 400; line-height: 1.15; color: var(--ink); margin-bottom: 16px; }
        .art-hero .deck { font-size: 1.05rem; color: var(--ink2); line-height: 1.75; margin-bottom: 24px; }
        .art-meta { display: flex; align-items: center; gap: 14px; flex-wrap: wrap; padding-bottom: 24px; border-bottom: 1px solid var(--border); }
        .art-av { width: 42px; height: 42px; border-radius: 50%; display: grid; place-items: center; color: #fff; font-weight: 700; font-size: 1rem; flex-shrink: 0; }
        .av-ats { background: linear-gradient(135deg, #1a4dff, #7c3aed); }
        .av-star { background: linear-gradient(135deg, #00b87a, #1a4dff); }
        .av-ai { background: linear-gradient(135deg, #e07800, #ef4444); }
        .art-av-info strong { display: block; font-size: .88rem; font-weight: 700; color: var(--ink); }
        .art-av-info span { font-size: .78rem; color: var(--ink3); }
        .art-chips { display: flex; gap: 8px; flex-wrap: wrap; }
        .art-chip { background: var(--surface); border: 1px solid var(--border); padding: 4px 12px; border-radius: 100px; font-size: .74rem; color: var(--ink2); font-weight: 500; }

        /* HERO IMG */
        .art-hero-img { max-width: 780px; margin: 28px auto 0; padding: 0 32px; width: 100%; }
        .art-hero-img div { width: 100%; aspect-ratio: 21/9; border-radius: 20px; display: grid; place-items: center; font-size: 80px; overflow: hidden; animation: fD .5s .1s ease both; }
        .bg-ats { background: linear-gradient(135deg, #dbeafe 0%, #e8edff 50%, #c7d2fe 100%); }
        .bg-star { background: linear-gradient(135deg, #d4f5ec 0%, #a7f3d0 50%, #e8edff 100%); }
        .bg-ai { background: linear-gradient(135deg, #1a1a2e 0%, #16213e 40%, #0f3460 100%); }

        /* CONTENT */
        .art-content { max-width: 780px; margin: 0 auto; padding: 40px 32px 60px; animation: fD .5s .15s ease both; width: 100%; }
        .art-content h2 { font-family: var(--display); font-size: 1.65rem; font-weight: 400; color: var(--ink); margin: 36px 0 14px; line-height: 1.2; }
        .art-content h3 { font-family: var(--display); font-size: 1.2rem; font-weight: 400; color: var(--ink); margin: 28px 0 10px; }
        .art-content p { font-size: .95rem; color: var(--ink2); line-height: 1.85; margin-bottom: 16px; }
        .art-content strong { color: var(--ink); font-weight: 700; }
        .art-content a { color: var(--accent); font-weight: 500; }
        .art-content ul, .art-content ol { margin: 14px 0 18px 20px; display: flex; flex-direction: column; gap: 10px; }
        .art-content ul li, .art-content ol li { font-size: .93rem; color: var(--ink2); line-height: 1.7; }
        .art-content ul li::marker { color: var(--accent); }

        /* CALLOUT BOXES */
        .box { border-radius: 12px; padding: 18px 20px; margin: 22px 0; display: flex; gap: 12px; align-items: flex-start; }
        .box-icon { font-size: 18px; flex-shrink: 0; margin-top: 2px; }
        .box-body { font-size: .88rem; line-height: 1.7; }
        .box-body strong { display: block; margin-bottom: 4px; font-size: .9rem; }
        .box-green { background: var(--gp); border: 1px solid rgba(0,184,122,.2); color: #005a3d; }
        .box-red { background: var(--rp); border: 1px solid rgba(220,38,38,.2); color: #7f1d1d; }
        .box-blue { background: var(--ap); border: 1px solid rgba(26,77,255,.15); color: #1e3a8a; }
        .box-amber { background: var(--amberp); border: 1px solid rgba(224,120,0,.2); color: #7c3506; }

        html.dark .box-green { color: #a7f3d0; }
        html.dark .box-red { color: #fca5a5; }
        html.dark .box-blue { color: #c7d2fe; }
        html.dark .box-amber { color: #fde68a; }

        /* MISTAKE CARDS */
        .mistake-card { background: var(--surface); border: 1px solid var(--border); border-radius: 16px; padding: 24px; margin: 20px 0; position: relative; overflow: hidden; border-left: 4px solid var(--red); transition: box-shadow .2s; }
        .mistake-card:hover { box-shadow: var(--sh2); }
        .mistake-num { position: absolute; top: 16px; right: 20px; font-family: var(--display); font-size: 3.5rem; font-weight: 400; color: rgba(220,38,38,.08); line-height: 1; pointer-events: none; }
        .mistake-card h3 { font-family: var(--display); font-size: 1.15rem; font-weight: 400; color: var(--ink); margin-bottom: 8px; }
        .mistake-card .wrong { background: var(--rp); color: var(--red); padding: 3px 8px; border-radius: 5px; font-size: .75rem; font-weight: 700; display: inline-block; margin-bottom: 8px; }
        .mistake-card .fix { background: var(--gp); color: var(--green); padding: 3px 8px; border-radius: 5px; font-size: .75rem; font-weight: 700; display: inline-block; margin-bottom: 8px; margin-left: 6px; }
        .mistake-card p { font-size: .88rem; color: var(--ink2); line-height: 1.7; }
        .mistake-card .fix-box { background: var(--gp); border-radius: 8px; padding: 10px 14px; margin-top: 10px; font-size: .83rem; color: #005a3d; line-height: 1.6; }
        html.dark .mistake-card .fix-box { color: #a7f3d0; }

        /* STAT CALLOUT */
        .big-stat { background: linear-gradient(135deg,var(--accent) 0%,#6366f1 100%); border-radius: 20px; padding: 32px 28px; text-align: center; color: #fff; margin: 28px 0; }
        .big-stat .num { font-family: var(--display); font-size: 4rem; font-weight: 400; line-height: 1; margin-bottom: 8px; }
        .big-stat p { font-size: .92rem; color: rgba(255,255,255,.8); max-width: 320px; margin: 0 auto; line-height: 1.6; }

        /* STAR LETTERS GRID */
        .star-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 14px; margin: 24px 0; }
        .star-box { background: var(--surface); border: 1px solid var(--border); border-radius: 16px; padding: 20px 16px; text-align: center; transition: transform .2s, box-shadow .2s; }
        .star-box:hover { transform: translateY(-3px); box-shadow: var(--sh2); }
        .star-letter { font-family: var(--display); font-size: 2.8rem; font-weight: 400; line-height: 1; margin-bottom: 6px; }
        .s-col .star-letter { color: #1a4dff; }
        .t-col .star-letter { color: #00b87a; }
        .a-col .star-letter { color: #e07800; }
        .r-col .star-letter { color: #dc2626; }
        .star-word { font-size: .78rem; font-weight: 700; text-transform: uppercase; letter-spacing: .06em; color: var(--ink2); margin-bottom: 6px; }
        .star-desc { font-size: .73rem; color: var(--ink3); line-height: 1.4; }

        /* STAR EXAMPLE CARD */
        .example-card { background: var(--surface); border: 1px solid var(--border); border-radius: 16px; overflow: hidden; margin: 20px 0; }
        .ex-head { background: var(--ink); padding: 14px 20px; display: flex; align-items: center; gap: 10px; }
        .ex-head-label { font-size: .72rem; font-weight: 700; text-transform: uppercase; letter-spacing: .08em; color: rgba(255,255,255,.6); }
        .ex-head-title { font-size: .92rem; font-weight: 700; color: #fff; }
        .ex-body { padding: 0; }
        .ex-row { display: grid; grid-template-columns: 80px 1fr; border-bottom: 1px solid var(--border); }
        .ex-row:last-child { border-bottom: none; }
        .ex-label { padding: 16px 14px; background: var(--bg); border-right: 1px solid var(--border); display: flex; align-items: flex-start; justify-content: center; padding-top: 18px; }
        .ex-label-txt { font-size: .72rem; font-weight: 800; text-transform: uppercase; letter-spacing: .08em; writing-mode: vertical-rl; transform: rotate(180deg); color: var(--accent); }
        .ex-content { padding: 16px 20px; font-size: .86rem; color: var(--ink2); line-height: 1.65; }
        .ex-content strong { color: var(--ink); }

        /* ROADMAP TIMELINE */
        .timeline { display: flex; flex-direction: column; gap: 0; margin: 20px 0; }
        .t-item { display: flex; gap: 16px; align-items: flex-start; padding-bottom: 22px; position: relative; }
        .t-item::before { content: ''; position: absolute; left: 19px; top: 40px; bottom: 0; width: 2px; background: var(--border); }
        .t-item:last-child::before { display: none; }
        .t-item:last-child { padding-bottom: 0; }
        .t-circle { width: 40px; height: 40px; border-radius: 50%; background: var(--ap); border: 2px solid var(--accent); display: grid; place-items: center; flex-shrink: 0; z-index: 1; }
        .t-month { font-size: .68rem; font-weight: 800; color: var(--accent); text-align: center; line-height: 1.1; }
        .t-content { padding-top: 8px; }
        .t-content strong { display: block; font-size: .9rem; font-weight: 700; color: var(--ink); margin-bottom: 3px; }
        .t-content p { font-size: .83rem; color: var(--ink2); line-height: 1.55; }

        .big-quote { border-left: 4px solid var(--accent); padding: 20px 24px; margin: 28px 0; background: var(--ap); border-radius: 0 12px 12px 0; }
        .big-quote p { font-family: var(--display); font-size: 1.25rem; color: var(--ink); line-height: 1.5; font-style: italic; }
        .big-quote cite { font-size: .78rem; color: var(--ink3); display: block; margin-top: 8px; }

        /* AI SKILL CARDS */
        .skills-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 14px; margin: 22px 0; }
        .skill-card { background: var(--surface); border: 1px solid var(--border); border-radius: 16px; padding: 20px; transition: transform .2s, box-shadow .2s; position: relative; overflow: hidden; }
        .skill-card:hover { transform: translateY(-3px); box-shadow: var(--sh2); }
        .skill-card::before { content: ''; position: absolute; top: 0; left: 0; right: 0; height: 3px; }
        .sk1::before { background: linear-gradient(90deg, #6366f1, #8b5cf6); }
        .sk2::before { background: linear-gradient(90deg, #00b87a, #06b6d4); }
        .sk3::before { background: linear-gradient(90deg, #f59e0b, #f97316); }
        .sk4::before { background: linear-gradient(90deg, #ef4444, #ec4899); }
        .sk5::before { background: linear-gradient(90deg, #06b6d4, #6366f1); }
        .sk6::before { background: linear-gradient(90deg, #00b87a, #a3e635); }
        .skill-num { font-family: var(--display); font-size: 2rem; font-weight: 400; color: rgba(255,255,255,.06); line-height: 1; position: absolute; top: 12px; right: 16px; }
        .skill-icon { font-size: 1.6rem; margin-bottom: 10px; display: block; }
        .skill-card h3 { font-family: var(--display); font-size: 1.05rem; font-weight: 400; color: var(--ink); margin-bottom: 6px; }
        .skill-card p { font-size: .82rem; color: var(--ink2); line-height: 1.6; }
        .skill-badge { display: inline-block; margin-top: 8px; background: var(--ap); color: var(--accent); border-radius: 5px; padding: 2px 8px; font-size: .68rem; font-weight: 700; text-transform: uppercase; letter-spacing: .05em; }

        /* FUTURE AUTOMATION METER */
        .future-meter { background: var(--surface); border: 1px solid var(--border); border-radius: 20px; padding: 28px; margin: 24px 0; }
        .fm-title { font-size: .78rem; font-weight: 700; text-transform: uppercase; letter-spacing: .08em; color: var(--ink3); margin-bottom: 20px; }
        .fm-row { margin-bottom: 14px; }
        .fm-label { display: flex; justify-content: space-between; margin-bottom: 6px; }
        .fm-label span:first-child { font-size: .85rem; color: var(--ink); font-weight: 500; }
        .fm-label span:last-child { font-size: .8rem; color: var(--ink2); }
        .fm-bar { height: 8px; background: rgba(255,255,255,.06); border-radius: 4px; overflow: hidden; }
        .fm-fill { height: 8px; border-radius: 4px; transition: width 1s ease; }
        .fill-high { background: linear-gradient(90deg, #00b87a, #06b6d4); }
        .fill-med { background: linear-gradient(90deg, #f59e0b, #f97316); }
        .fill-low { background: linear-gradient(90deg, #ef4444, #ec4899); }

        /* RESUME COMPARISON BLOCK */
        .resume-example { background: var(--surface2, #201f28); border: 1px solid var(--border); border-radius: 16px; overflow: hidden; margin: 24px 0; }
        .re-head { padding: 14px 20px; border-bottom: 1px solid var(--border); display: flex; align-items: center; gap: 8px; }
        .re-dots { display: flex; gap: 5px; }
        .re-dot { width: 10px; height: 10px; border-radius: 50%; }
        .red-d { background: #ff5f57; }
        .yel-d { background: #ffbd2e; }
        .grn-d { background: #28c840; }
        .re-title { font-size: .78rem; color: var(--ink3); margin-left: 6px; }
        .re-content { padding: 20px; display: flex; flex-direction: column; gap: 12px; }
        .re-label { font-size: .7rem; font-weight: 700; text-transform: uppercase; letter-spacing: .08em; color: var(--ink3); margin-bottom: 4px; }
        .re-bad { background: rgba(239,68,68,.1); border: 1px solid rgba(239,68,68,.2); border-radius: 8px; padding: 10px 14px; }
        .re-good { background: var(--gp); border: 1px solid rgba(0,184,122,.2); border-radius: 8px; padding: 10px 14px; }
        .re-bad p { font-size: .82rem; color: #fca5a5; line-height: 1.5; }
        .re-good p { font-size: .82rem; color: #a7f3d0; line-height: 1.5; }
        .re-arrow { text-align: center; font-size: 1.2rem; color: var(--ink3); }

        /* AUTHOR BOX */
        .author-box { background: var(--surface); border: 1px solid var(--border); border-radius: 20px; padding: 28px; display: flex; gap: 20px; align-items: flex-start; margin: 36px 0; }
        .auth-av { width: 64px; height: 64px; border-radius: 50%; display: grid; place-items: center; color: #fff; font-size: 1.5rem; font-weight: 700; flex-shrink: 0; }
        .auth-info h4 { font-family: var(--display); font-size: 1.1rem; margin-bottom: 4px; color: var(--ink); }
        .auth-info .role { font-size: .78rem; color: var(--accent); font-weight: 700; text-transform: uppercase; letter-spacing: .06em; margin-bottom: 8px; }
        .auth-info p { font-size: .85rem; color: var(--ink2); line-height: 1.65; }

        /* CALL TO ACTION */
        .art-cta { background: linear-gradient(135deg, #0b100d 0%, #1a2818 100%); border-radius: 20px; padding: 36px 32px; text-align: center; margin: 36px 0; }
        .art-cta h3 { font-family: var(--display); font-size: 1.7rem; color: #fff; margin-bottom: 10px; }
        .art-cta p { font-size: .88rem; color: rgba(255,255,255,.65); margin-bottom: 22px; line-height: 1.6; }
        .art-cta a { display: inline-block; background: var(--accent); color: #fff; padding: 13px 28px; border-radius: 12px; font-weight: 700; font-size: .9rem; transition: transform .2s, box-shadow .2s; }
        .art-cta a:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(26,77,255,.4); }

        /* RELATED POSTS */
        .related { max-width: 780px; margin: 0 auto; padding: 0 32px 80px; width: 100%; }
        .related h2 { font-family: var(--display); font-size: 1.5rem; margin-bottom: 24px; color: var(--ink); }
        .related-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; }
        .rel-card { background: var(--surface); border: 1px solid var(--border); border-radius: var(--r); overflow: hidden; transition: transform .2s, box-shadow .2s; }
        .rel-card:hover { transform: translateY(-3px); box-shadow: var(--sh2); }
        .rel-img { height: 120px; display: grid; place-items: center; font-size: 32px; }
        .ri1 { background: #d4f5ec; }
        .ri2 { background: #fff3e0; }
        .ri3 { background: #e8edff; }
        .rel-body { padding: 16px; }
        .rel-tag { font-size: .68rem; font-weight: 700; color: var(--accent); text-transform: uppercase; letter-spacing: .06em; margin-bottom: 6px; display: block; }
        .rel-body h3 { font-family: var(--display); font-size: .95rem; font-weight: 400; line-height: 1.3; margin-bottom: 6px; color: var(--ink); }
        .rel-body span { font-size: .75rem; color: var(--ink3); }

        @keyframes fD { from { opacity: 0; transform: translateY(-12px); } to { opacity: 1; transform: translateY(0); } }

        @media(max-width:600px){
          .crumb, .art-hero, .art-hero-img, .art-content, .related { padding-left: 18px; padding-right: 18px; }
          .star-grid { grid-template-columns: repeat(2, 1fr); }
          .ex-row { grid-template-columns: 60px 1fr; }
          .skills-grid { grid-template-columns: 1fr; }
          .related-grid { grid-template-columns: 1fr; }
          .author-box { flex-direction: column; }
        }
      `}} />

      {/* Renders unified site navigation */}
      <Navbar />

      {/* BREADCRUMB */}
      <div className="crumb">
        <Link to="/">Home</Link> › <Link to="/blog">Blog</Link> › <span>{art.tag}</span>
      </div>

      {/* HERO */}
      <div className="art-hero">
        <span className="art-tag">{art.tag}</span>
        <h1>{art.title}</h1>
        <p className="deck">{art.desc}</p>
        <div className="art-meta">
          <div className={cn("art-av", id === "blog-ats-mistakes" ? "av-ats" : id === "blog-star-method" ? "av-star" : "av-ai")}>
            {art.avatar}
          </div>
          <div className="art-av-info">
            <strong>{art.author}</strong>
            <span>{id === "blog-ats-mistakes" ? "Senior Career Strategist" : id === "blog-star-method" ? "Career Coach" : "AI & Future of Work Researcher"} · Vogats AI</span>
          </div>
          <div className="art-chips">
            <span className="art-chip">📅 {art.date}</span>
            <span className="art-chip">⏱ {art.readTime}</span>
            <span className="art-chip">👁 {id === "blog-ats-mistakes" ? "24,800" : id === "blog-star-method" ? "18,400" : "31,200"} views</span>
          </div>
        </div>
      </div>

      {/* HERO IMAGE */}
      <div className="art-hero-img">
        <div className={cn(id === "blog-ats-mistakes" ? "bg-ats" : id === "blog-star-method" ? "bg-star" : "bg-ai")}>
          {art.icon}
        </div>
      </div>

      {/* ARTICLE BODY RENDERING */}
      <main className="art-content">
        {id === "blog-ats-mistakes" && <ATSContent />}
        {id === "blog-star-method" && <STARContent />}
        {id === "blog-ai-jobs" && <AIJobsContent />}
      </main>

      {/* RELATED POSTS */}
      <section className="related">
        <h2>Keep Reading</h2>
        <div className="related-grid">
          {id !== "blog-ats-mistakes" && (
            <Link to="/blog/blog-ats-mistakes" className="rel-card">
              <div className="rel-img ri3">📄</div>
              <div className="rel-body">
                <span className="rel-tag">ATS Tips</span>
                <h3>10 ATS Mistakes That Are Silently Killing Your Resume</h3>
                <span>May 12, 2026 · 7 min read</span>
              </div>
            </Link>
          )}
          {id !== "blog-star-method" && (
            <Link to="/blog/blog-star-method" className="rel-card">
              <div className="rel-img ri1">💼</div>
              <div className="rel-body">
                <span className="rel-tag">Career Growth</span>
                <h3>How to Get Promoted in 12 Months Using the STAR Method</h3>
                <span>Apr 28, 2026 · 5 min read</span>
              </div>
            </Link>
          )}
          {id !== "blog-ai-jobs" && (
            <Link to="/blog/blog-ai-jobs" className="rel-card">
              <div className="rel-img ri2">🤖</div>
              <div className="rel-body">
                <span className="rel-tag">AI & Jobs</span>
                <h3>AI Won't Take Your Job — But This Will Help You Keep It</h3>
                <span>Apr 10, 2026 · 6 min read</span>
              </div>
            </Link>
          )}
        </div>
      </section>

      {/* Renders unified site footer */}
      <Footer />
    </div>
  );
}

/* ─────────────────────────────────────────────────────────── */
/* INDIVIDUAL ARTICLE COMPONENT BODY RENDERS                   */
/* ─────────────────────────────────────────────────────────── */

function ATSContent() {
  return (
    <>
      <p>You spent three hours writing the perfect resume. You tailored every bullet point, chose an elegant template, and hit submit — then heard nothing. Sound familiar?</p>
      <p>The painful truth: <strong>your resume probably never made it to a human.</strong> An Applicant Tracking System (ATS) filtered it out automatically, and you didn't even know it was happening.</p>

      <div className="big-stat">
        <div className="num">75%</div>
        <p>of resumes are rejected by ATS software before a human recruiter ever reads them — even when the candidate is perfectly qualified.</p>
      </div>

      <p>ATS software is used by over 99% of Fortune 500 companies and the vast majority of mid-sized businesses. These systems scan, parse, rank, and filter resumes automatically. If your resume doesn't meet their criteria, it's gone — no matter how impressive your experience is.</p>
      <p>Here are the 10 most common ATS mistakes — and exactly how to fix every single one using Vogats AI.</p>

      <h2>The 10 Mistakes (And Their Fixes)</h2>

      {/* Mistake 1 */}
      <div className="mistake-card">
        <div className="mistake-num">1</div>
        <h3>Using a Fancy Template With Tables, Columns, or Text Boxes</h3>
        <span className="wrong">❌ Mistake</span><span class="fix">✅ Fix Below</span>
        <p>That beautiful two-column resume with a coloured sidebar you downloaded from Canva? ATS systems read files top-to-bottom, left-to-right in plain text. Multi-column layouts, text boxes, and tables get scrambled or completely skipped during parsing. Your skills section might never be read.</p>
        <div className="fix-box">✅ <strong>Fix:</strong> Use a single-column or simple two-column layout with no text boxes. Vogats AI templates are specifically engineered to be ATS-parseable — every section is read cleanly.</div>
      </div>

      {/* Mistake 2 */}
      <div className="mistake-card">
        <div className="mistake-num">2</div>
        <h3>Missing Keywords From the Job Description</h3>
        <span className="wrong">❌ Mistake</span><span class="fix">✅ Fix Below</span>
        <p>ATS systems rank resumes by keyword match against the job posting. If the job says \"Project Management\" and your resume says \"Programme Coordination,\" the ATS scores you lower — or eliminates you entirely. The same goes for technical skills, certifications, and industry jargon.</p>
        <div className="fix-box">✅ <strong>Fix:</strong> Paste the job description into Vogats AI's \"Tailor to Job\" feature. It automatically identifies missing keywords and weaves them naturally into your resume. Your match score can jump 40–60 points in minutes.</div>
      </div>

      {/* Mistake 3 */}
      <div className="mistake-card">
        <div className="mistake-num">3</div>
        <h3>Submitting a PDF When the System Wants a DOCX</h3>
        <span className="wrong">❌ Mistake</span><span class="fix">✅ Fix Below</span>
        <p>Many older ATS platforms struggle to parse PDFs accurately. Some read them fine; others extract garbled text or skip sections entirely. Unless the job posting specifically says \"PDF preferred,\" always have both formats ready.</p>
        <div className="fix-box">✅ <strong>Fix:</strong> Always read the application instructions carefully. Vogats AI lets you download your resume as both PDF and DOCX — switch between them in one click.</div>
      </div>

      {/* Mistake 4 */}
      <div className="mistake-card">
        <div className="mistake-num">4</div>
        <h3>Using Abbreviations Without Spelling Them Out</h3>
        <span className="wrong">❌ Mistake</span><span class="fix">✅ Fix Below</span>
        <p>ATS systems don't always connect abbreviations with their full forms. If you write \"PM\" instead of \"Project Manager,\" or \"SEO\" without mentioning \"Search Engine Optimization,\" you may miss keyword matches. This is especially common with certifications like \"PMP,\" \"CPA,\" or \"AWS.\"</p>
        <div className="fix-box">✅ <strong>Fix:</strong> Write both versions: \"Project Manager (PM)\" and \"AWS (Amazon Web Services)\" on first use. Vogats AI's AI writing tool naturally expands abbreviations in your content.</div>
      </div>

      {/* Mistake 5 */}
      <div className="mistake-card">
        <div className="mistake-num">5</div>
        <h3>Headers That ATS Can't Recognise</h3>
        <span className="wrong">❌ Mistake</span><span class="fix">✅ Fix Below</span>
        <p>Naming your sections \"Where I've Been\" or \"My Superpowers\" is creative — but ATS systems look for standard labels like \"Work Experience,\" \"Education,\" and \"Skills.\" Non-standard headers confuse the parser, which may misfile or skip your entire section.</p>
        <div className="fix-box">✅ <strong>Fix:</strong> Stick to standard section headers: Work Experience, Education, Skills, Certifications, Projects, Summary. All Vogats AI templates use ATS-recognised labels by default.</div>
      </div>

      {/* Mistake 6 */}
      <div className="mistake-card">
        <div className="mistake-num">6</div>
        <h3>Putting Critical Information in Headers, Footers or Images</h3>
        <span className="wrong">❌ Mistake</span><span class="fix">✅ Fix Below</span>
        <p>Many job seekers put their name, contact details, or LinkedIn URL in the document header or footer. Most ATS systems completely ignore these areas. Your contact information may never be parsed — making it impossible to reach you even if they want to.</p>
        <div className="fix-box">✅ <strong>Fix:</strong> Place all contact information in the main body of the document. Never put important information inside images or graphics — ATS cannot read images.</div>
      </div>

      {/* Mistake 7 */}
      <div className="mistake-card">
        <div className="mistake-num">7</div>
        <h3>No Quantified Achievements — Just Duties</h3>
        <span className="wrong">❌ Mistake</span><span class="fix">✅ Fix Below</span>
        <p>Modern ATS systems — especially AI-powered ones — score candidates on impact, not just responsibilities. \"Responsible for managing social media\" scores lower than \"Grew Instagram following 340% to 85K in 6 months, increasing lead generation by 28%.\"</p>
        <div className="fix-box">✅ <strong>Fix:</strong> Use Vogats AI's \"Add Bullets\" feature to transform duty-based sentences into quantified achievement statements automatically.</div>
      </div>

      {/* Mistake 8 */}
      <div className="mistake-card">
        <div className="mistake-num">8</div>
        <h3>One Generic Resume for Every Application</h3>
        <span className="wrong">❌ Mistake</span><span class="fix">✅ Fix Below</span>
        <p>Sending the exact same resume to 50 different jobs is one of the most common — and most damaging — mistakes. Each job has a unique set of keywords, priorities, and requirements. A generic resume gets low ATS scores across the board.</p>
        <div className="fix-box">✅ <strong>Fix:</strong> Tailor your resume for every application. Vogats AI's \"Tailor to Job\" takes 30 seconds — paste the job description and your resume is customised instantly.</div>
      </div>

      {/* Mistake 9 */}
      <div className="mistake-card">
        <div className="mistake-num">9</div>
        <h3>Using Special Characters, Emojis, or Non-Standard Fonts</h3>
        <span className="wrong">❌ Mistake</span><span class="fix">✅ Fix Below</span>
        <p>Bullet points using arrows (→), diamonds (◆), or emojis (🚀) often convert to garbled symbols or question marks when ATS parses your file. Non-standard fonts may not embed correctly, causing parsing errors throughout your document.</p>
        <div className="fix-box">✅ <strong>Fix:</strong> Use standard bullet points (•), clean fonts like Calibri, Georgia, or Arial, and avoid all decorative characters. Vogats AI templates are built with ATS-safe typography throughout.</div>
      </div>

      {/* Mistake 10 */}
      <div className="mistake-card">
        <div className="mistake-num">10</div>
        <h3>Never Checking Your ATS Score Before Submitting</h3>
        <span className="wrong">❌ Mistake</span><span class="fix">✅ Fix Below</span>
        <p>Most job seekers submit their resume with zero idea of how it will perform in an ATS. They're essentially flying blind. Some companies use ATS scores as hard cutoffs — if you're below 70%, you're automatically rejected regardless of experience.</p>
        <div className="fix-box">✅ <strong>Fix:</strong> Always run your resume through an ATS checker before submitting. Vogats AI's ATS Check tool scores your resume against any job description in seconds and shows you exactly what to improve.</div>
      </div>

      <div className="box box-green">
        <span className="box-icon">💡</span>
        <div className="box-body"><strong>Quick Win Strategy</strong> Fix mistakes #2 (keywords), #5 (headers), and #10 (ATS score) first — these three changes alone can lift your ATS score by 30–50 points within 15 minutes.</div>
      </div>

      <h2>Your Action Plan: Fix All 10 This Week</h2>
      <ol>
        <li><strong>Run your current resume through Vogats AI's ATS Check</strong> — get your baseline score and see which mistakes you're making right now</li>
        <li><strong>Switch to an ATS-safe template</strong> — choose any template from cv.vogats.com/templates, all are fully ATS-optimised</li>
        <li><strong>Paste each job description into \"Tailor to Job\"</strong> — get a custom keyword-matched version in 30 seconds</li>
        <li><strong>Use \"Add Bullets\" to quantify your experience</strong> — transform duties into achievements with real numbers</li>
        <li><strong>Always check your ATS score before submitting</strong> — aim for 80%+ match rate</li>
      </ol>

      <div className="art-cta">
        <h3>Check your ATS score right now</h3>
        <p>See exactly which of these 10 mistakes your resume is making — and fix them in minutes with Vogats AI.</p>
        <Link to="/dashboard">Check My Resume Free →</Link>
      </div>

      <div className="author-box">
        <div className="auth-av" style={{ background: "linear-gradient(135deg, #1a4dff, #7c3aed)" }}>K</div>
        <div className="auth-info">
          <h4>Mr. Kamlesh Kumar</h4>
          <div className="role">Senior Career Strategist · Vogats AI</div>
          <p>Kamlesh has helped over 8,000 job seekers fix their resumes and land interviews at top companies. Former HR lead with 12 years recruiting experience across tech, finance, and FMCG sectors.</p>
        </div>
      </div>
    </>
  );
}

function STARContent() {
  return (
    <>
      <p>There's a painful paradox in most workplaces: the people who work hardest are often not the ones who get promoted fastest. The professionals who move up quickly aren't necessarily better — they're <strong>better documented</strong>.</p>
      <p>They keep records of every win, every metric improved, every project delivered. And when promotion season comes, they don't scramble to remember what they did — they have a portfolio of evidence ready to present.</p>
      <p>The STAR Method is the most powerful framework for building that portfolio — and for presenting it in a way that makes saying \"yes\" to your promotion the most logical choice your manager can make.</p>

      <div className="big-quote">
        <p>\"People don't get promoted for working hard. They get promoted for making the value of their work impossible to ignore.\"</p>
        <cite>— Suman Thackeray, Career Coach, Vogats AI</cite>
      </div>

      <h2>What Is the STAR Method?</h2>
      <p>STAR stands for <strong>Situation, Task, Action, Result</strong>. It's a storytelling framework that transforms vague work descriptions into compelling, evidence-based narratives that clearly demonstrate your impact.</p>

      <div className="star-grid">
        <div className="star-box s-col">
          <div className="star-letter">S</div>
          <div className="star-word">Situation</div>
          <div className="star-desc">The context and challenge you faced</div>
        </div>
        <div className="star-box t-col">
          <div className="star-letter">T</div>
          <div className="star-word">Task</div>
          <div className="star-desc">Your specific responsibility or goal</div>
        </div>
        <div className="star-box a-col">
          <div className="star-letter">A</div>
          <div className="star-word">Action</div>
          <div className="star-desc">The specific steps you personally took</div>
        </div>
        <div className="star-box r-col">
          <div className="star-letter">R</div>
          <div className="star-word">Result</div>
          <div className="star-desc">The measurable outcome you achieved</div>
        </div>
      </div>

      <p>Most people describe their work using only S and T: \"I was responsible for managing the company's social media.\" Strong performers add A and R: \"I redesigned our content strategy and posting schedule (A), growing engagement 340% and reducing cost-per-lead by 45% in 6 months (R).\"</p>
      <p>The difference isn't just better phrasing — it's the difference between looking like a doer and looking like a driver of results.</p>

      <h2>A Real STAR Example</h2>

      <div className="example-card">
        <div className="ex-head">
          <div>
            <div className="ex-head-label">Real Example</div>
            <div className="ex-head-title">Marketing Manager → Senior Marketing Manager</div>
          </div>
        </div>
        <div className="ex-body">
          <div className="ex-row">
            <div className="ex-label"><span className="ex-label-txt">Situation</span></div>
            <div className="ex-content">Our company's lead generation had plateaued for 8 months despite consistent ad spend. We were generating 200 leads/month but conversion to qualified leads was only 12%, well below the industry average of 28%.</div>
          </div>
          <div className="ex-row">
            <div className="ex-label"><span class="ex-label-txt">Task</span></div>
            <div className="ex-content">I was tasked with diagnosing the conversion problem and proposing a solution within 6 weeks — with no additional budget.</div>
          </div>
          <div className="ex-row">
            <div className="ex-label"><span class="ex-label-txt">Action</span></div>
            <div className="ex-content">I conducted a full-funnel audit using Hotjar and Google Analytics, interviewed 20 recent leads who hadn't converted, and identified that 68% of our landing page traffic was bouncing within 8 seconds. I redesigned the landing page hero section, rewrote the CTA copy, and added social proof. I A/B tested 3 versions over 4 weeks, then rolled out the winner.</div>
          </div>
          <div className="ex-row">
            <div className="ex-label"><span class="ex-label-txt">Result</span></div>
            <div className="ex-content"><strong>Conversion rate jumped from 12% to 31% in 90 days</strong> — the highest in company history. Monthly qualified leads grew from 24 to 62, contributing an estimated ₹18L in new pipeline. I received a promotion and a 22% salary increase two months later.</div>
          </div>
        </div>
      </div>

      <h2>Your 12-Month Promotion Roadmap</h2>
      <p>Getting promoted in 12 months is achievable — but it requires intentional action from day one, not just hard work. Here's the month-by-month blueprint:</p>

      <div className="timeline">
        <div className="t-item">
          <div className="t-circle"><div className="t-month">M<br />1–2</div></div>
          <div className="t-content">
            <strong>Align on what \"excellent\" looks like</strong>
            <p>Have a direct conversation with your manager: \"What would exceptional performance look like for someone in my role this year?\" Take detailed notes. This becomes your personal scorecard.</p>
          </div>
        </div>
        <div className="t-item">
          <div className="t-circle"><div className="t-month">M<br />3–4</div></div>
          <div className="t-content">
            <strong>Start your STAR journal — every week</strong>
            <p>Every Friday, spend 10 minutes writing one STAR entry for something you accomplished that week. It takes 10 minutes now and saves hours of scrambling later. Include any numbers, even rough ones.</p>
          </div>
        </div>
        <div className="t-item">
          <div className="t-circle"><div className="t-month">M<br />5–6</div></div>
          <div className="t-content">
            <strong>Volunteer for a high-visibility project</strong>
            <p>Identify one cross-team or senior-visible initiative and contribute meaningfully. This is your signature STAR story — the one you'll reference most in your promotion conversation.</p>
          </div>
        </div>
        <div className="t-item">
          <div className="t-circle"><div className="t-month">M<br />7–9</div></div>
          <div className="t-content">
            <strong>Build your promotion case document</strong>
            <p>Compile your top 5–7 STAR stories into a one-page \"Impact Summary.\" Share it informally with your manager at your mid-year check-in: \"I've been tracking my contributions — here's a summary I thought you'd find useful.\"</p>
          </div>
        </div>
        <div className="t-item">
          <div className="t-circle"><div className="t-month">M<br />10–11</div></div>
          <div className="t-content">
            <strong>Request the promotion conversation explicitly</strong>
            <p>Don't wait to be offered. Schedule a dedicated meeting: \"I'd love to discuss my progress toward a senior role and what the path looks like.\" Bring your Impact Summary. Listen carefully to any gaps they identify.</p>
          </div>
        </div>
        <div className="t-item">
          <div className="t-circle"><div className="t-month">M<br />12</div></div>
          <div className="t-content">
            <strong>Follow up with a written summary</strong>
            <p>After the conversation, send a brief email summarising your case and the next steps discussed. This shows professionalism and keeps the process moving. Confirm the timeline and decision date.</p>
          </div>
        </div>
      </div>

      <h2>Putting STAR on Your Resume</h2>
      <p>Your STAR journal becomes your most powerful resume tool. Each STAR entry converts directly into a high-impact bullet point:</p>

      <div className="box box-blue">
        <span className="box-icon">📄</span>
        <div className="box-body">
          <strong>Before (Duty-Based):</strong>
          \"Responsible for managing social media channels and creating content for the marketing team.\"<br /><br />
          <strong>After (STAR-Based):</strong>
          \"Redesigned content strategy and A/B tested posting formats, growing engagement 340% and reducing cost-per-lead 45% in 6 months — highest conversion rate in company history.\"
        </div>
      </div>

      <p>Vogats AI's <strong>\"Add Bullets\" feature</strong> takes your raw STAR notes and converts them into polished, quantified resume bullet points using proven achievement-based language. You paste in what you did — the AI writes it like a top 1% resume writer.</p>

      <h2>5 Common STAR Mistakes to Avoid</h2>
      <ul>
        <li><strong>Too much Situation:</strong> Keep S and T combined to 1–2 sentences. The Result is what matters most.</li>
        <li><strong>Weak or missing Result:</strong> If you don't have an exact number, use a range or a directional (\"reduced by roughly half,\" \"doubled within a quarter\"). No number is the only unacceptable result.</li>
        <li><strong>Using \"we\" instead of \"I\":</strong> In your STAR stories, clearly articulate your personal contribution — what YOU specifically did, even in a team context.</li>
        <li><strong>Forgetting soft-skill results:</strong> Results can be qualitative: \"improved team morale,\" \"resolved a 6-month client conflict,\" \"trained 8 new hires.\" These count.</li>
        <li><strong>Only doing it at review time:</strong> STAR journaling only works as a habit. One entry per week takes 10 minutes — the discipline pays enormous dividends.</li>
      </ul>

      <div className="art-cta">
        <h3>Turn your STAR stories into a winning resume</h3>
        <p>Vogats AI's AI Bullet Generator transforms your STAR notes into powerful, quantified resume bullet points in seconds.</p>
        <Link to="/dashboard">Try It Free →</Link>
      </div>

      <div className="author-box">
        <div className="auth-av" style={{ background: "linear-gradient(135deg, #00b87a, #1a4dff)" }}>S</div>
        <div className="auth-info">
          <h4>Suman Thackeray</h4>
          <div className="role">Career Coach · Vogats AI</div>
          <p>Suman has coached 3,000+ professionals across India and the UK through promotions, career pivots, and salary negotiations. Former Deloitte consultant turned dedicated career strategist.</p>
        </div>
      </div>
    </>
  );
}

function AIJobsContent() {
  return (
    <>
      <p>Every month, a new headline announces that AI has learned to do something humans thought was uniquely ours — write code, design logos, pass bar exams, diagnose medical images. It's understandable to feel anxious.</p>
      <p>But here's what the panic-inducing headlines miss: <strong>AI is a tool, not a replacement.</strong> The professionals who are thriving in 2026 aren't the ones who ignored AI or fought against it — they're the ones who learned to collaborate with it, multiply their output with it, and think in ways AI genuinely cannot.</p>

      <div className="big-quote">
        <p>\"AI will not replace humans. But humans who use AI will replace humans who don't.\"</p>
        <cite>— Karim Lakhani, Harvard Business School</cite>
      </div>

      <h2>The Real Picture: What AI Is Actually Replacing</h2>
      <p>Let's be honest about what's changing. AI is very good at tasks that are:</p>
      <ul>
        <li><strong>Repetitive and rule-based</strong> — data entry, report formatting, basic code debugging</li>
        <li><strong>Pattern recognition at scale</strong> — fraud detection, image classification, resume screening</li>
        <li><strong>Content generation from templates</strong> — standard emails, boilerplate contracts, basic marketing copy</li>
        <li><strong>Information retrieval and summarisation</strong> — research, FAQs, meeting notes</li>
      </ul>

      <p>These tasks represent roughly <strong>40–50% of the average white-collar workday</strong>. That's significant — but it also means the other 50–60% is where humans are irreplaceable, at least for now.</p>

      <div className="future-meter">
        <div className="fm-title">AI Automation Risk by Skill Type (2026)</div>
        <div className="fm-row">
          <div className="fm-label"><span>Routine Data Processing</span><span>High Risk — 87%</span></div>
          <div className="fm-bar"><div className="fm-fill fill-low" style={{ width: "87%" }}></div></div>
        </div>
        <div className="fm-row">
          <div className="fm-label"><span>Basic Content Creation</span><span>High Risk — 74%</span></div>
          <div className="fm-bar"><div className="fm-fill fill-low" style={{ width: "74%" }}></div></div>
        </div>
        <div className="fm-row">
          <div className="fm-label"><span>Standard Customer Service</span><span>Medium Risk — 58%</span></div>
          <div className="fm-bar"><div className="fm-fill fill-med" style={{ width: "58%" }}></div></div>
        </div>
        <div className="fm-row">
          <div className="fm-label"><span>Data Analysis & Insight</span><span>Medium Risk — 42%</span></div>
          <div className="fm-bar"><div className="fm-fill fill-med" style={{ width: "42%" }}></div></div>
        </div>
        <div className="fm-row">
          <div className="fm-label"><span>Creative Strategy</span><span>Low Risk — 18%</span></div>
          <div className="fm-bar"><div className="fm-fill fill-high" style={{ width: "18%" }}></div></div>
        </div>
        <div className="fm-row">
          <div className="fm-label"><span>Leadership & Judgment</span><span>Low Risk — 9%</span></div>
          <div className="fm-bar"><div className="fm-fill fill-high" style={{ width: "9%" }}></div></div>
        </div>
      </div>

      <h2>The 6 Skills That Make You AI-Proof</h2>
      <p>These aren't soft skills in the dismissive sense — they're the precise competencies that AI systems structurally cannot replicate, and that employers are actively hunting for in 2026.</p>

      <div className="skills-grid">
        <div className="skill-card sk1">
          <div className="skill-num">01</div>
          <span className="skill-icon">🧠</span>
          <h3>AI Collaboration & Prompting</h3>
          <p>Knowing how to work with AI tools — which tasks to delegate, how to write effective prompts, how to evaluate AI output critically — multiplies your productivity 3–5x. This is the most in-demand new skill of 2026.</p>
          <span className="skill-badge">Highest Demand</span>
        </div>
        <div className="skill-card sk2">
          <div className="skill-num">02</div>
          <span className="skill-icon">🎯</span>
          <h3>Complex Problem Framing</h3>
          <p>AI solves problems you hand it. Identifying which problems matter, defining them precisely, and knowing when a solution is \"good enough\" — this is fundamentally human. Consultants, strategists, and product leaders do this daily.</p>
          <span className="skill-badge">Hard to Automate</span>
        </div>
        <div className="skill-card sk3">
          <div className="skill-num">03</div>
          <span className="skill-icon">🤝</span>
          <h3>Stakeholder Influence</h3>
          <p>Getting buy-in across departments, navigating office politics, reading a room in a negotiation, building trust with a sceptical client — these require emotional intelligence that no LLM possesses.</p>
          <span className="skill-badge">Irreplaceable</span>
        </div>
        <div className="skill-card sk4">
          <div className="skill-num">04</div>
          <span className="skill-icon">💡</span>
          <h3>Cross-Domain Creativity</h3>
          <p>AI is excellent at remixing what already exists. Original ideas that connect disparate domains — applying a concept from behavioural economics to a product UX problem, for instance — still require human intuition.</p>
          <span className="skill-badge">Future-Proof</span>
        </div>
        <div className="skill-card sk5">
          <div className="skill-num">05</div>
          <span className="skill-icon">⚖️</span>
          <h3>Ethical Judgment & Accountability</h3>
          <p>AI can recommend, but humans must decide and be accountable. Professionals who can make high-stakes decisions under uncertainty — and own the consequences — are more valuable than ever.</p>
          <span className="skill-badge">Leadership</span>
        </div>
        <div className="skill-card sk6">
          <div className="skill-num">06</div>
          <span className="skill-icon">🔄</span>
          <h3>Adaptive Learning Speed</h3>
          <p>The tools change every 6 months. The professionals who thrive are those who can pick up new workflows, tools, and mental models quickly. Learning agility is the meta-skill that makes all other skills renewable.</p>
          <span className="skill-badge">Compounding Value</span>
        </div>
      </div>

      <h2>How to Show These Skills on Your Resume</h2>
      <p>Knowing these skills is step one. Communicating them to employers — especially to ATS systems that scan for the right keywords — is where most people fall short.</p>

      <div className="resume-example">
        <div className="re-head">
          <div className="re-dots">
            <div className="re-dot red-d"></div>
            <div className="re-dot yel-d"></div>
            <div className="re-dot grn-d"></div>
          </div>
          <span className="re-title">Resume Bullet Comparison — AI Skills</span>
        </div>
        <div className="re-content">
          <div>
            <div className="re-label">❌ Weak (Generic)</div>
            <div className="re-bad"><p>\"Used AI tools in daily work to improve productivity.\"</p></div>
          </div>
          <div className="re-arrow">↓</div>
          <div>
            <div className="re-label">✅ Strong (Specific + Quantified)</div>
            <div className="re-good"><p>\"Integrated GPT-4 into content production workflow, reducing first-draft time from 4 hours to 35 minutes and enabling team to scale output 6x without additional headcount.\"</p></div>
          </div>
          <div style={{ marginTop: "4px" }}>
            <div className="re-label">❌ Weak (Soft Skill Cliché)</div>
            <div className="re-bad"><p>\"Strong problem-solving and critical thinking skills.\"</p></div>
          </div>
          <div className="re-arrow">↓</div>
          <div>
            <div className="re-label">✅ Strong (Evidence-Based)</div>
            <div className="re-good"><p>\"Diagnosed and resolved a 6-month supply chain bottleneck by reframing the problem as a communication failure rather than a logistics issue — saving ₹22L annually.\"</p></div>
          </div>
        </div>
      </div>

      <div className="box box-amber">
        <span className="box-icon">💡</span>
        <div className="box-body">
          <strong>Vogats AI Tip</strong>
          Use the \"Rewrite Summary\" feature to add AI-literacy signals to your resume summary. Mention specific tools (ChatGPT, Copilot, Midjourney, Gemini) and quantify how you used them. ATS systems are increasingly scanning for these keywords.
        </div>
      </div>

      <h2>The Job Search Is Also AI-Powered Now</h2>
      <p>Here's something most candidates don't realise: <strong>the companies you're applying to are also using AI</strong> to screen, rank, and filter your application. Modern ATS platforms don't just keyword-match — they use ML models to score your resume against thousands of data points.</p>
      <p>This means your resume needs to be optimised for machines before it ever reaches a human. The irony is that the best tool to optimise your resume for AI hiring systems is... an AI resume builder.</p>

      <ul>
        <li>Vogats AI's ATS Check scores your resume against real job descriptions using the same logic as major ATS platforms</li>
        <li>The \"Tailor to Job\" feature identifies which AI and future-skills keywords are missing from your resume</li>
        <li>AI-generated bullet points are structured using patterns that score highly on both human readability and ATS parsing</li>
      </ul>

      <div className="box box-green">
        <span className="box-icon">🚀</span>
        <div className="box-body">
          <strong>The bottom line</strong>
          Use AI to beat the AI screening your resume. Then demonstrate your irreplaceable human skills in the interview. That's the modern job search strategy in 2026.
        </div>
      </div>

      <h2>Your 30-Day Future-Proofing Plan</h2>
      <ol>
        <li><strong>Week 1:</strong> Pick one AI tool in your domain (Copilot for coding, Jasper for writing, Gemini for research) and spend 30 minutes daily learning it deeply.</li>
        <li><strong>Week 2:</strong> Document one project where you solved a complex, ambiguous problem. Write it using the STAR method. This is your proof of human judgment.</li>
        <li><strong>Week 3:</strong> Update your resume with Vogats AI — add AI tool proficiencies, quantify at least 3 achievements, and run the ATS check against your target job.</li>
        <li><strong>Week 4:</strong> Update your LinkedIn profile to reflect your AI literacy. Recruiters at top companies are actively searching for candidates with AI skills right now.</li>
      </ol>

      <div className="art-cta">
        <h3>Future-proof your resume today</h3>
        <p>Vogats AI adds the right AI-skill keywords, quantifies your achievements, and checks your ATS score — all in under 10 minutes.</p>
        <Link to="/dashboard">Build My Future-Ready Resume →</Link>
      </div>

      <div className="author-box">
        <div className="auth-av" style={{ background: "linear-gradient(135deg, #e07800, #ef4444)" }}>A</div>
        <div className="auth-info">
          <h4>Abhishek Sinha</h4>
          <div className="role">AI & Future of Work Researcher · Vogats AI</div>
          <p>Abhishek studies the intersection of AI and employment, with a focus on how professionals can adapt and thrive. Former data scientist at Infosys, speaker at NASSCOM Future of Work Summit 2025.</p>
        </div>
      </div>
    </>
  );
}
