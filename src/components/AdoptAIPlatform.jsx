import React, { useEffect, useRef, useState } from "react";

/* ─── data ──────────────────────────────────────────────── */

const TIMELINE_MILESTONES = [
  { date: "Month 1", title: "Kickoff — competitive audit + interaction model v1", body: "Mapped the competitive landscape. Defined the core interaction grammar: how users initiate actions, how AI confirms intent, how results surface." },
  { date: "Month 2–3", title: "Design system built in parallel with first prototype", body: "No existing design language. Built typography, colour, spacing, and core components from scratch while the first copilot prototype was being developed." },
  { date: "Month 3–4", title: "First design partner sessions", body: "Joined early customer demo calls. Ran prototype walkthroughs bi-weekly. Feedback from these sessions directly shaped every major design decision." },
  { date: "Month 5–6", title: "Weekly iteration cycle established", body: "Shipped design updates weekly based on customer sync feedback. Prototypes shown in calls, refined between sessions. This cadence held for the full 9 months." },
  { date: "Month 7–8", title: "MVP pilots signed", body: "First design partners converted to paying pilots. The demo experience — clarity, trust, ease of setup — was cited directly in customer conversations." },
  { date: "Month 9", title: "GA launch", body: "Platform moved from pilot to general availability. Design system, interaction model, and copilot UI all production-ready and documented for the engineering team." },
];

const APPROACH_CARDS = [
  { n: "01", title: "Customer contact as a design input", body: "I joined demo calls and customer syncs from month one — not as an observer, but as an active participant testing prototypes and collecting feedback. Weekly iteration cycles meant design was always grounded in real customer response, not assumption." },
  { n: "02", title: "Design system as a product accelerator", body: "Building the design system in parallel with the product — not after — meant every new feature had a consistent foundation from day one. It also made onboarding engineering faster as the team grew." },
  { n: "03", title: "Trust as the primary design constraint", body: "For enterprise users delegating real actions to AI, trust is not a feature — it's the product. Every interface decision was evaluated against one question: does this make the AI's behaviour more legible, reviewable, and correctable?" },
];

const LEARNINGS = [
  { h: "Customer contact is a design method, not a research phase", b: "Joining demo calls and weekly syncs from month one meant feedback arrived in real time, not in batched research rounds. The cadence of iteration matched the cadence of customer contact. That alignment is hard to replicate later." },
  { h: "Build the design system before you need it", b: "Starting the design system in parallel with the first prototype — not after the product had already diverged — meant consistency was never a catch-up exercise. Every component was born into a system, not retrofitted." },
  { h: "For AI products, trust is the interaction model", b: "Every decision about how to surface AI behaviour — what to show, when to ask for confirmation, how to handle failure — was a trust decision first and a UX decision second. Treating them separately produces the wrong answer." },
  { h: "Speed and quality compound when the feedback loop is short", b: "Weekly iteration cycles forced decisions to be made with just enough information. That constraint produced more focused design than longer cycles — and the compounding effect over 9 months was a product that was already validated before GA." },
];

/* ─── component ──────────────────────────────────────────── */

const NAV_SECTION_IDS = ["context", "timeline", "approach", "work", "impact", "reflection"];

const NAV_LABELS = {
  context: "Context",
  timeline: "Timeline",
  approach: "Approach",
  work: "Work",
  impact: "Impact",
  reflection: "Reflection",
};

export default function AdoptAIPlatform({ onClose }) {
  const [scrolled, setScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState("context");
  const rootRef = useRef(null);

  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    const h = () => setScrolled(el.scrollTop > 48);
    el.addEventListener("scroll", h);
    return () => el.removeEventListener("scroll", h);
  }, []);

  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    const updateActiveSection = () => {
      const triggerOffset = 140;
      let current = NAV_SECTION_IDS[0];
      for (const id of NAV_SECTION_IDS) {
        const section = el.querySelector(`#${id}`);
        if (section) {
          const rect = section.getBoundingClientRect();
          const containerRect = el.getBoundingClientRect();
          const sectionTopRelative = rect.top - containerRect.top;
          if (sectionTopRelative <= triggerOffset) current = id;
        }
      }
      setActiveSection(current);
    };
    updateActiveSection();
    el.addEventListener("scroll", updateActiveSection);
    return () => el.removeEventListener("scroll", updateActiveSection);
  }, []);

  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    const nodes = el.querySelectorAll(".reveal");
    const obs = new IntersectionObserver(
      (entries) => entries.forEach((e) => {
        if (e.isIntersecting) { e.target.classList.add("revealed"); obs.unobserve(e.target); }
      }),
      { threshold: 0.04, rootMargin: "0px 0px -20px 0px", root: el }
    );
    nodes.forEach((n) => obs.observe(n));
    return () => obs.disconnect();
  }, []);

  const MediaBox = ({ label = "Placeholder", sub = "Add media", height = 200, src, maxWidth }) => (
    src ? (
      <div style={{ marginTop: 20, maxWidth: maxWidth || "100%", marginLeft: "auto", marginRight: "auto" }}>
        <img src={src} alt={label} style={{ width: "100%", height: "auto", borderRadius: 10, display: "block" }} />
      </div>
    ) : (
      <div style={{ width:"100%", height, borderRadius:10, background:"#f2f1ef", border:"1.5px dashed #d6d3d1", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:6, marginTop:20 }}>
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#c4b5a5" strokeWidth="1.4">
          <rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4" strokeLinecap="round"/>
        </svg>
        <span style={{ fontSize:12, fontWeight:600, color:"#a8a29e" }}>{label}</span>
        <span style={{ fontSize:11, color:"#c4b5a5" }}>{sub}</span>
      </div>
    )
  );

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Lora:ital,wght@0,500;0,600;0,700;1,400;1,500;1,600&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600;9..40,700;9..40,800&display=swap');

        .cs-root {
          position:fixed; inset:0; z-index:50;
          overflow-y:auto; overflow-x:hidden;
          background:#fcfbfa; color:#1c1917;
          font-family:'DM Sans',ui-sans-serif,system-ui,sans-serif;
          -webkit-font-smoothing:antialiased;
          scroll-behavior:smooth;
          overflow-x:hidden;
        }
        .cs-root *, .cs-root *::before, .cs-root *::after { box-sizing:border-box; margin:0; padding:0; }

        /* ── NAV ── */
        .cs-nav {
          position:sticky; top:0; z-index:40;
          height:52px; padding:0 48px;
          display:flex; align-items:center; justify-content:space-between;
          background:rgba(252,251,250,.92);
          backdrop-filter:blur(20px);
          border-bottom:1px solid transparent;
          transition:border-color .25s;
        }
        .cs-nav.on { border-color:#e7e5e4; }
        .cs-nav-back {
          display:flex; align-items:center; gap:6px;
          font-size:13px; font-weight:500; color:#a8a29e;
          background:none; border:none; cursor:pointer;
          font-family:inherit; transition:color .15s; padding:0;
        }
        .cs-nav-back:hover { color:#1c1917; }
        .cs-nav-id { font-size:12px; font-weight:600; color:#78716c; }
        .cs-nav-links { display:flex; gap:22px; list-style:none; }
        .cs-nav-links a { font-size:11.5px; font-weight:500; color:#a8a29e; text-decoration:none; transition:color .15s; }
        .cs-nav-links a:hover { color:#1c1917; }
        .cs-nav-links a.cs-nav-active { color:#1c1917; font-weight:600; }

        /* ── LAYOUT ── */
        .cs-wrap { max-width:880px; margin:0 auto; padding:0 48px; }

        /* ── HERO ── */
        .cs-hero {
          padding:80px 0 64px;
          position:relative; border-bottom:1px solid #e7e5e4;
        }
        .cs-hero-tex {
          position:absolute; top:0; bottom:0; left:50%; transform:translateX(-50%);
          width:100vw; z-index:0; opacity:.35;
          background-image: radial-gradient(circle, #c4b5a5 1px, transparent 1px);
          background-size: 22px 22px;
        }
        .cs-hero-wash {
          position:absolute; top:0; bottom:0; left:50%; transform:translateX(-50%);
          width:100vw; z-index:1; pointer-events:none;
          background:
            radial-gradient(ellipse 65% 50% at 70% 0%, rgba(219,234,254,.82) 0%, transparent 60%),
            radial-gradient(ellipse 40% 35% at 0% 85%, rgba(220,252,231,.65) 0%, transparent 55%),
            linear-gradient(to bottom, rgba(252,251,250,0) 0%, rgba(252,251,250,.9) 100%);
        }
        .cs-hero-inner { position:relative; z-index:2; max-width:880px; margin:0 auto; padding:0 48px; }

        .cs-tags { display:flex; gap:8px; flex-wrap:wrap; margin-bottom:28px; }
        .cs-pill {
          font-size:10px; font-weight:700; letter-spacing:.11em;
          text-transform:uppercase; padding:4px 11px;
          border-radius:100px; border:1px solid; white-space:nowrap;
        }
        .cs-pill-blue  { color:#2563eb; border-color:#93c5fd; background:#eff6ff; }
        .cs-pill-green { color:#16a34a; border-color:#86efac; background:#f0fdf4; }
        .cs-pill-warm  { color:#92400e; border-color:#fcd34d; background:#fffbeb; }
        .cs-pill-stone { color:#78716c; border-color:#d6d3d1; background:#fff; }

        .cs-h1 {
          font-family:'Lora',Georgia,serif;
          font-size:clamp(42px,6vw,72px);
          font-weight:700; line-height:1.03;
          letter-spacing:-.025em; color:#0c0a09;
          margin-bottom:8px;
        }
        .cs-h1 em { font-style:italic; color:#2563eb; }
        .cs-h1-word {
          display:inline-block;
          opacity:0; transform:translateY(18px);
          animation:wordUp .55s ease forwards;
        }
        @keyframes wordUp { to { opacity:1; transform:translateY(0); } }

        .cs-h1-sub {
          font-size:clamp(15px,2vw,18px); font-weight:300;
          color:#a8a29e; letter-spacing:-.005em; margin-top:28px; margin-bottom:22px;
          opacity:0; animation:wordUp .55s .5s ease forwards;
        }
        .cs-hero-gif {
          width:100%; max-width:100%; border-radius:12px;
          margin-bottom:32px; display:block;
          box-shadow:0 2px 12px rgba(0,0,0,.06);
          opacity:0; animation:wordUp .55s .6s ease forwards;
        }
        .cs-hero-lead {
          font-size:16px; line-height:1.8; color:#57534e;
          max-width:800px; margin-bottom:48px; font-weight:400;
          opacity:0; animation:wordUp .55s .65s ease forwards;
        }
        .cs-hero-lead strong { color:#1c1917; font-weight:600; }

        .cs-meta {
          display:grid; grid-template-columns:repeat(4,1fr);
          background:#fff; border:1px solid #e7e5e4;
          border-radius:12px; overflow:hidden;
          box-shadow:0 1px 4px rgba(0,0,0,.04);
          opacity:0; animation:wordUp .55s .8s ease forwards;
        }
        .cs-meta-cell { padding:15px 20px; border-right:1px solid #e7e5e4; }
        .cs-meta-cell:last-child { border-right:none; }
        .cs-meta-k { font-size:9px; font-weight:700; letter-spacing:.14em; text-transform:uppercase; color:#a8a29e; margin-bottom:4px; }
        .cs-meta-v { font-size:13px; font-weight:600; color:#1c1917; line-height:1.35; }

        /* ── SECTION ── */
        .cs-sec { padding:72px 0; border-bottom:1px solid #e7e5e4; }
        .cs-sec:last-of-type { border-bottom:none; }

        .cs-kicker {
          display:inline-flex; align-items:center; gap:10px;
          font-size:10px; font-weight:700; letter-spacing:.14em;
          text-transform:uppercase; color:#a8a29e; margin-bottom:14px;
        }
        .cs-kicker-dot { width:6px; height:6px; border-radius:50%; background:#d6d3d1; flex-shrink:0; }

        .cs-sh {
          font-family:'Lora',Georgia,serif;
          font-size:clamp(28px,4vw,42px);
          font-weight:700; line-height:1.08;
          letter-spacing:-.022em; color:#0c0a09; margin-bottom:18px;
        }
        .cs-sh em { font-style:italic; color:#2563eb; }

        .cs-p { font-size:15px; line-height:1.85; color:#57534e; max-width:800px; }
        .cs-p + .cs-p { margin-top:16px; }
        .cs-p strong { color:#1c1917; font-weight:600; }

        /* ── CALLOUT ── */
        .cs-callout {
          margin:32px 0; padding:28px 32px 24px;
          background:linear-gradient(140deg,#eff6ff,#f0f9ff);
          border:1px solid #bfdbfe; border-radius:14px;
          position:relative; overflow:hidden;
        }
        .cs-callout::after {
          content:''; position:absolute; inset:0; border-radius:14px; pointer-events:none;
          opacity:.03;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
          background-size:160px;
        }
        .cs-callout-mark {
          position:absolute; top:-16px; left:20px;
          font-family:'Lora',serif; font-size:96px; font-weight:700;
          color:#dbeafe; line-height:1; user-select:none; pointer-events:none;
        }
        .cs-callout-text {
          font-family:'Lora',Georgia,serif;
          font-size:18px; font-style:italic; font-weight:500;
          line-height:1.65; color:#1e40af;
          position:relative; z-index:1; max-width:680px;
        }
        .cs-callout-label {
          display:block; margin-top:12px;
          font-size:10px; font-weight:700; letter-spacing:.12em;
          text-transform:uppercase; color:#93c5fd;
          position:relative; z-index:1;
        }

        /* ── TIMELINE ── */
        .cs-timeline {
          position:relative;
          margin-top:36px;
        }
        .cs-timeline::before {
          content:'';
          position:absolute;
          left:55px;
          top:8px;
          bottom:8px;
          width:2px;
          background:#e7e5e4;
        }
        .cs-timeline-item {
          position:relative;
          display:grid;
          grid-template-columns:120px 1fr;
          gap:24px;
          padding:24px 0;
          align-items:start;
        }
        .cs-timeline-dot {
          position:absolute;
          left:51px;
          top:32px;
          width:8px;
          height:8px;
          border-radius:50%;
          background:#2563eb;
        }
        .cs-timeline-date {
          font-size:11px;
          font-weight:700;
          letter-spacing:.1em;
          text-transform:uppercase;
          color:#a8a29e;
        }
        .cs-timeline-title {
          font-family:'Lora',Georgia,serif;
          font-size:15px;
          font-weight:600;
          color:#0c0a09;
          margin-bottom:6px;
        }
        .cs-timeline-body {
          font-size:13px;
          line-height:1.7;
          color:#57534e;
        }
        .cs-timeline-end {
          margin-top:24px;
          padding:12px 16px;
          background:#eff6ff;
          border:1px solid #bfdbfe;
          border-radius:8px;
          font-size:13px;
          font-weight:600;
          color:#2563eb;
        }

        /* ── PRINCIPLES ── */
        .cs-prin-grid { display:grid; grid-template-columns:1fr 1fr; gap:14px; margin-top:36px; }
        .cs-prin {
          background:#fff; border:1px solid #e7e5e4; border-radius:12px;
          padding:26px; transition:border-color .2s, box-shadow .2s, transform .2s;
          position:relative; overflow:hidden;
        }
        .cs-prin:hover { border-color:#93c5fd; box-shadow:0 6px 24px rgba(59,130,246,.08); transform:translateY(-2px); }
        .cs-prin-num {
          font-size:10px; font-weight:700; letter-spacing:.14em;
          text-transform:uppercase; color:#3b82f6; margin-bottom:12px;
          display:flex; align-items:center; gap:8px;
        }
        .cs-prin-num::after { content:''; flex:1; height:1px; background:#e7e5e4; }
        .cs-prin-h { font-family:'Lora',serif; font-size:15px; font-weight:600; color:#0c0a09; margin-bottom:9px; line-height:1.45; }
        .cs-prin-p { font-size:13px; line-height:1.8; color:#78716c; }

        /* ── METRICS (static) ── */
        .cs-metrics {
          display:grid; grid-template-columns:repeat(3,1fr);
          border:1px solid #e7e5e4; border-radius:14px;
          overflow:hidden; margin-top:36px;
          background:#fff; box-shadow:0 2px 12px rgba(0,0,0,.04);
        }
        .cs-metric { padding:32px 26px; border-right:1px solid #e7e5e4; position:relative; overflow:hidden; }
        .cs-metric:last-child { border-right:none; }
        .cs-metric-num {
          font-family:'Lora',serif;
          font-size:56px; font-weight:700; line-height:1;
          letter-spacing:-.035em; margin-bottom:8px; position:relative; z-index:1;
        }
        .cs-metric-num.blue   { color:#2563eb; }
        .cs-metric-num.green  { color:#16a34a; }
        .cs-metric-num.orange { color:#ea580c; }
        .cs-metric-lbl { font-size:13px; font-weight:700; color:#1c1917; margin-bottom:4px; position:relative; z-index:1; }
        .cs-metric-sub { font-size:11px; font-weight:500; color:#a8a29e; letter-spacing:.06em; text-transform:uppercase; position:relative; z-index:1; }

        /* ── IMPACT ── */
        .cs-impact-grid { display:grid; grid-template-columns:3fr 2fr; gap:16px; margin-top:20px; align-items:start; }
        .cs-outcome-card { background:#fff; border:1px solid #e7e5e4; border-radius:12px; padding:24px; }
        .cs-outcome-head { font-size:10px; font-weight:700; letter-spacing:.12em; text-transform:uppercase; color:#a8a29e; margin-bottom:14px; padding-bottom:12px; border-bottom:1px solid #f5f5f4; }
        .cs-outcome-row { display:grid; grid-template-columns:16px 1fr; gap:12px; padding:13px 0; border-bottom:1px solid #f5f5f4; align-items:start; }
        .cs-outcome-row:last-child { border-bottom:none; padding-bottom:0; }
        .cs-outcome-dot { width:6px; height:6px; border-radius:50%; background:#3b82f6; margin-top:6px; }
        .cs-outcome-h { font-size:13px; font-weight:600; color:#1c1917; margin-bottom:2px; }
        .cs-outcome-p { font-size:12.5px; line-height:1.7; color:#78716c; }
        .cs-stat-col { display:flex; flex-direction:column; gap:12px; }
        .cs-stat-hero {
          background:linear-gradient(140deg,#eff6ff,#dbeafe);
          border:1px solid #93c5fd; border-radius:12px; padding:24px;
          position:relative; overflow:hidden;
        }
        .cs-stat-hero-n { font-family:'Lora',serif; font-size:56px; font-weight:700; letter-spacing:-.035em; color:#2563eb; line-height:1; margin-bottom:6px; position:relative; z-index:1; }
        .cs-stat-hero-l { font-size:13px; font-weight:700; color:#1c1917; margin-bottom:4px; position:relative; z-index:1; }
        .cs-stat-hero-s { font-size:12.5px; line-height:1.65; color:#78716c; position:relative; z-index:1; }
        .cs-stat-next { background:#fff; border:1px solid #e7e5e4; border-radius:12px; padding:20px; }
        .cs-stat-next-k { font-size:9.5px; font-weight:700; letter-spacing:.12em; text-transform:uppercase; color:#a8a29e; margin-bottom:8px; }
        .cs-stat-next-p { font-size:13px; line-height:1.7; color:#57534e; }
        .cs-stat-next-p strong { color:#1c1917; font-weight:600; }

        /* ── LEARNINGS ── */
        .cs-learnings { list-style:none; margin-top:36px; display:flex; flex-direction:column; gap:0; }
        .cs-learning {
          display:grid; grid-template-columns:52px 1fr;
          gap:22px; padding:24px 0;
          border-bottom:1px solid #e7e5e4; align-items:start;
        }
        .cs-learning:last-child { border-bottom:none; padding-bottom:0; }
        .cs-learning-n {
          width:44px; height:44px; border-radius:12px; flex-shrink:0;
          background:linear-gradient(135deg,#eff6ff,#dbeafe);
          border:1px solid #bfdbfe;
          display:flex; align-items:center; justify-content:center;
          font-size:13px; font-weight:700; color:#2563eb;
        }
        .cs-learning-h { font-family:'Lora',serif; font-size:16px; font-weight:600; color:#0c0a09; margin-bottom:5px; line-height:1.35; letter-spacing:-.01em; }
        .cs-learning-p { font-size:13px; line-height:1.75; color:#57534e; }

        /* ── FOOTER ── */
        .cs-foot { max-width:880px; margin:0 auto; padding:40px 48px 72px; display:flex; align-items:center; justify-content:space-between; }
        .cs-foot-back {
          display:flex; align-items:center; gap:7px;
          font-size:13px; font-weight:500; color:#a8a29e;
          background:none; border:none; cursor:pointer;
          font-family:inherit; transition:color .15s; padding:0;
        }
        .cs-foot-back:hover { color:#1c1917; }
        .cs-foot-sig { font-size:12px; color:#c4b5a5; }

        /* ── REVEAL ── */
        .reveal { opacity:0; transform:translateY(20px); transition:opacity .5s ease, transform .5s ease; }
        .reveal.s1 { transition-delay:.06s; }
        .reveal.s2 { transition-delay:.12s; }
        .reveal.s3 { transition-delay:.18s; }
        .reveal.s4 { transition-delay:.24s; }
        .revealed { opacity:1; transform:translateY(0); }

        /* ── RESPONSIVE ── */
        @media (max-width:700px) {
          .cs-nav { padding:0 20px; }
          .cs-nav-links { display:none; }
          .cs-wrap { padding:0 20px; }
          .cs-hero { padding:48px 0; }
          .cs-hero-inner { padding:0 20px; }
          .cs-meta { grid-template-columns:1fr 1fr; }
          .cs-meta-cell:nth-child(2n) { border-right:none; }
          .cs-meta-cell:nth-child(n+3) { border-top:1px solid #e7e5e4; }
          .cs-prin-grid, .cs-impact-grid { grid-template-columns:1fr; }
          .cs-metrics { grid-template-columns:1fr; }
          .cs-metric { border-right:none; border-bottom:1px solid #e7e5e4; }
          .cs-metric:last-child { border-bottom:none; }
          .cs-two-col, .cs-work-grid { grid-template-columns:1fr !important; }
          .cs-timeline::before { left:20px; }
          .cs-timeline-item { grid-template-columns:1fr; padding-left:44px; }
          .cs-timeline-dot { left:16px; }
          .cs-timeline-date { padding-left:0; margin-bottom:4px; }
          .cs-timeline-title, .cs-timeline-body { grid-column:1; }
          .cs-foot { flex-direction:column; gap:14px; align-items:flex-start; padding:32px 20px 56px; }
        }
      `}</style>

      <div className="cs-root" ref={rootRef}>

        {/* NAV */}
        <nav className={`cs-nav${scrolled ? " on" : ""}`}>
          <button className="cs-nav-back" type="button" onClick={onClose}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.7">
              <path d="M10 12.5L5.5 8 10 3.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Projects
          </button>
          <span className="cs-nav-id">Adopt AI · Platform Vision</span>
          <ul className="cs-nav-links">
            {NAV_SECTION_IDS.map((id) => (
              <li key={id}>
                <a
                  href={`#${id}`}
                  className={activeSection === id ? "cs-nav-active" : ""}
                >
                  {NAV_LABELS[id]}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        {/* HERO */}
        <header className="cs-hero" id="top">
          <div className="cs-hero-tex"/>
          <div className="cs-hero-wash"/>
          <div className="cs-hero-inner">
            <div className="cs-tags">
              <span className="cs-pill cs-pill-green">Founding Designer</span>
              <span className="cs-pill cs-pill-warm">AI Platform</span>
              <span className="cs-pill cs-pill-stone">0 to Scale</span>
            </div>
            <h1 className="cs-h1">
              {"Designing the platform.".split(" ").map((w, i) => (
                <span key={w+i} className="cs-h1-word" style={{ animationDelay:`${i*0.1}s`, marginRight:"0.22em" }}>{w}</span>
              ))}
              <br/>
              <em className="cs-h1-word" style={{ animationDelay:"0.4s" }}>Before the platform existed.</em>
            </h1>
            <p className="cs-h1-sub">Adopt AI</p>
            <MediaBox
              label="Platform Overview"
              sub="Best full-platform screenshot: copilot embedded in customer app"
              height={380}
            />
            <p className="cs-hero-lead">
              Adopt AI needed a design language, an interaction model, and a UX definition for agentic software — before any of those things existed. This is the story of how I built them in parallel with the product, and what that process looks like when it works.
            </p>
            <div className="cs-meta">
              {[["Role","Founding Staff Designer"],["Scope","0 to 1 · Full Platform"],["Timeline","9 Months · Pilots to GA"],["Outcome","10+ Contracts · Growing MoM"]].map(([k,v])=>(
                <div className="cs-meta-cell" key={k}>
                  <div className="cs-meta-k">{k}</div>
                  <div className="cs-meta-v">{v}</div>
                </div>
              ))}
            </div>
          </div>
        </header>

        <div className="cs-wrap">

          {/* CONTEXT */}
          <section className="cs-sec reveal" id="context">
            <div className="cs-kicker"><span className="cs-kicker-dot"/>01 · Context</div>
            <h2 className="cs-sh">An AI copilot platform.<br/><em>No brief. No prior art.</em></h2>
            <p className="cs-p">
              Adopt AI embeds a configurable AI copilot inside enterprise SaaS tools. Unlike advisory AI, Adopt executes workflows on the user's behalf — navigating the product, filling forms, completing tasks end-to-end. When I joined, none of the infrastructure for designing this existed: no interaction model, no design system, no established UX patterns for autonomous AI at enterprise scale.
            </p>
            <p className="cs-p">
              My scope was not just UI. I needed to define what agentic UX means for this product, build the design system from scratch, and maintain a direct feedback loop with customers throughout.
            </p>
            <div className="cs-callout reveal">
              <span className="cs-callout-mark">"</span>
              <p className="cs-callout-text">The design problem wasn't "how should this look." It was "what should this be" — and those are very different starting points.</p>
              <span className="cs-callout-label">The scope of the problem</span>
            </div>
            <div className="cs-two-col reveal" style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16, marginTop:32 }}>
              <MediaBox
                label="Competitive Landscape"
                sub="Microsoft Copilot, Salesforce Agentforce, Google Gemini — the reference set at kickoff"
                height={240}
              />
              <MediaBox
                label="Early Interaction Model Sketches"
                sub="First wireframes defining how users initiate, guide, and review AI-executed actions"
                height={240}
              />
            </div>
          </section>

          {/* TIMELINE */}
          <section className="cs-sec reveal" id="timeline">
            <div className="cs-kicker"><span className="cs-kicker-dot"/>02 · How It Shipped</div>
            <h2 className="cs-sh">9 months.<br/><em>From first wireframe to GA.</em></h2>
            <p className="cs-p">
              The product moved fast. Design kept pace by staying embedded in the customer feedback loop throughout — not just at research phases.
            </p>
            <div className="cs-timeline reveal">
              {TIMELINE_MILESTONES.map((m) => (
                <div key={m.date} className="cs-timeline-item">
                  <div className="cs-timeline-dot"/>
                  <div className="cs-timeline-date">{m.date}</div>
                  <div>
                    <h4 className="cs-timeline-title">{m.title}</h4>
                    <p className="cs-timeline-body">{m.body}</p>
                  </div>
                </div>
              ))}
              <div className="cs-timeline-end">
                10+ enterprise contracts signed within 12 months. Growing month over month.
              </div>
            </div>
          </section>

          {/* APPROACH */}
          <section className="cs-sec reveal" id="approach">
            <div className="cs-kicker"><span className="cs-kicker-dot"/>03 · Design Approach</div>
            <h2 className="cs-sh">Three things that made the difference.<br/><em>Staying close to customers. Building the system. Designing for trust.</em></h2>
            <p className="cs-p">
              With no prior design infrastructure and a fast-moving product, the approach had to be both strategic and highly practical. These were the decisions that shaped how I worked.
            </p>
            <div className="cs-prin-grid reveal">
              {APPROACH_CARDS.map((p, i) => (
                <div key={p.n} className={`cs-prin reveal s${i + 1}`}>
                  <div className="cs-prin-num">{p.n}</div>
                  <h4 className="cs-prin-h">{p.title}</h4>
                  <p className="cs-prin-p">{p.body}</p>
                </div>
              ))}
            </div>
          </section>

          {/* WORK */}
          <section className="cs-sec reveal" id="work">
            <div className="cs-kicker"><span className="cs-kicker-dot"/>04 · The Work</div>
            <h2 className="cs-sh">The platform across three contexts.<br/><em>One design system. Three deployment modes.</em></h2>
            <p className="cs-p">
              The copilot deploys as an embedded panel inside a customer's own product, as internal enterprise tooling, or as a fully white-labelled solution under the customer's brand. The design system had to support all three without fragmenting — consistent interaction patterns, flexible theming, shared component architecture.
            </p>
            <MediaBox
              label="Copilot — Embedded in Customer Platform"
              sub="Best screenshot: full sidebar panel with Welcome message, Recommended Actions, Top Actions, and chat input visible"
              height={400}
            />
            <div className="cs-work-sublabel" style={{ fontSize:10, fontWeight:700, letterSpacing:".14em", textTransform:"uppercase", color:"#a8a29e", marginTop:32, marginBottom:12 }}>Platform in action</div>
            <div className="cs-work-grid reveal" style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
              <MediaBox label="Conversational Action Execution" sub="Ziuri Copilot chat interface: AI conversation with Deactivate/Reassign action buttons visible" height={220} />
              <MediaBox label="No-Code Configuration — Design Studio" sub="Design Studio panel: sidebar customization with Header, Welcome Text, Colour Palette controls visible" height={220} />
              <MediaBox label="Action Configuration" sub="Action components / flow builder: action config panel with routing logic visible" height={220} />
              <MediaBox label="Platform Analytics" sub="Adopt AI dashboard: Action Performance charts, Customer time spend metrics, Actions by topic donut chart" height={220} />
            </div>
            <p style={{ fontSize:13, fontStyle:"italic", color:"#a8a29e", textAlign:"center", marginTop:16 }}>
              Same interaction model. Different brand. Consistent trust signals throughout.
            </p>
          </section>

          {/* IMPACT */}
          <section className="cs-sec reveal" id="impact">
            <div className="cs-kicker"><span className="cs-kicker-dot"/>05 · Impact</div>
            <h2 className="cs-sh">What shipped. What it produced.<br/><em>Measured in contracts, not compliments.</em></h2>
            <p className="cs-p">
              Nine months of weekly iteration with direct customer contact produced outcomes that were measurable from the start of pilots.
            </p>

            <div className="cs-metrics">
              {[
                { num:"9mo", cls:"blue", l:"Zero to GA", s:"First wireframe to general availability" },
                { num:"10+", cls:"green", l:"Enterprise contracts", s:"Signed within 12 months of launch" },
                { num:"MoM", cls:"orange", l:"Growing month over month", s:"Customer pipeline expanding at GA" },
              ].map((m)=>(
                <div key={m.l} className="cs-metric">
                  <div className={`cs-metric-num ${m.cls}`}>{m.num}</div>
                  <div className="cs-metric-lbl">{m.l}</div>
                  <div className="cs-metric-sub">{m.s}</div>
                </div>
              ))}
            </div>

            <div className="cs-impact-grid reveal">
              <div className="cs-outcome-card">
                <div className="cs-outcome-head">What the numbers reflect</div>
                {[
                  { h:"Design drove conversion in demos", p:"Customers consistently cited UI clarity and perceived trustworthiness as factors in moving from demo to pilot. The copilot felt manageable, not opaque." },
                  { h:"Weekly cadence reduced rework", p:"Shipping design updates weekly against live customer feedback meant problems were caught early. Major direction changes happened at the prototype stage, not post-engineering." },
                  { h:"One system served three markets", p:"White-label, embedded, and internal deployment modes shared the same design system and interaction model. No parallel design tracks. No fragmentation." },
                ].map((o)=>(
                  <div key={o.h} className="cs-outcome-row">
                    <div className="cs-outcome-dot"/>
                    <div>
                      <div className="cs-outcome-h">{o.h}</div>
                      <p className="cs-outcome-p">{o.p}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="cs-stat-col">
                <div className="cs-stat-hero">
                  <div className="cs-stat-hero-n">V1 → V2</div>
                  <div className="cs-stat-hero-l">Design partners became advocates</div>
                  <p className="cs-stat-hero-s">Partners who pushed back on V1 were referencing the V2 design in customer calls as a reason to continue. That shift validated the direction.</p>
                </div>
                <div className="cs-stat-next">
                  <div className="cs-stat-next-k">Trajectory</div>
                  <p className="cs-stat-next-p">Pipeline is growing month over month. <strong>Design velocity</strong> — the ability to ship weekly against customer feedback — is now a recognised competitive advantage.</p>
                </div>
              </div>
            </div>
          </section>

          {/* REFLECTION */}
          <section className="cs-sec reveal" id="reflection">
            <div className="cs-kicker"><span className="cs-kicker-dot"/>06 · Reflection</div>
            <h2 className="cs-sh">What I carry forward.<br/><em>From this kind of work.</em></h2>
            <p className="cs-p">
              Building a product from zero alongside the customers who will use it produces a different kind of design knowledge. These are the things that changed how I work.
            </p>
            <ul className="cs-learnings">
              {LEARNINGS.map((l, i) => (
                <li key={l.h} className={`cs-learning reveal s${i + 1}`}>
                  <div className="cs-learning-n">{String(i + 1).padStart(2, "0")}</div>
                  <div>
                    <div className="cs-learning-h">{l.h}</div>
                    <p className="cs-learning-p">{l.b}</p>
                  </div>
                </li>
              ))}
            </ul>
          </section>

        </div>

        {/* FOOTER */}
        <footer className="cs-foot">
          <button className="cs-foot-back" type="button" onClick={onClose}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.7">
              <path d="M10 12.5L5.5 8 10 3.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Back to Projects
          </button>
          <span className="cs-foot-sig">Edward Chu · Adopt AI</span>
        </footer>

      </div>
    </>
  );
}
