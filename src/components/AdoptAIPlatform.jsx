import React, { useEffect, useRef, useState } from "react";

/* ─── data ──────────────────────────────────────────────── */

const CHALLENGES = [
  {
    icon: "🤖",
    title: "AI is unpredictable",
    body: "You can't design a static flow when the system itself is a variable. I had to build interaction patterns that stayed trustworthy even when AI outputs varied, and design for failure as a first-class state.",
  },
  {
    icon: "👥",
    title: "Two very different audiences",
    body: "Engineers think in execution layers. PMs think in outcomes. The same interface had to serve both without feeling like a compromise for either. Progressive disclosure became the core design pattern.",
  },
  {
    icon: "📖",
    title: "No vocabulary existed",
    body: "Before I could design agentic UX, I had to invent the language for it: defining actions, flows, golden paths, and agent behaviour for our users, our product, and our engineers. The vocabulary I created became the team's shared north star.",
  },
];

const CONTRIBUTIONS = [
  { emoji: "🔁", title: "Interaction Model", body: "Defined how users initiate, guide, correct, and trust AI-executed actions. This became the UX grammar of the entire platform." },
  { emoji: "🎨", title: "Design System from Zero", body: "Built the entire visual and component language from scratch. Typography, colour, spacing, components: all defined before a single screen was production-ready." },
  { emoji: "🧠", title: "Agentic UX Definition", body: "Established what agentic UX means at Adopt: a north star used internally to align product, engineering, and AI teams on how users should experience autonomous action." },
  { emoji: "🔬", title: "Design Partner Research", body: "Ran iterative testing and feedback cycles directly with early enterprise customers. Their friction shaped our product direction across every major decision." },
  { emoji: "🗺", title: "Product Strategy Influence", body: "Shaped roadmap decisions alongside the CEO and CTO. Design was in the room, not downstream." },
];

/* ─── component ──────────────────────────────────────────── */

const NAV_SECTION_IDS = ["origin", "challenge", "contributions", "work", "impact"];

const NAV_LABELS = {
  origin: "Origin",
  challenge: "Challenge",
  contributions: "Contributions",
  work: "Work",
  impact: "Impact",
};

export default function AdoptAIPlatform({ onClose, onOpenActionBuilder }) {
  const [scrolled, setScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState("origin");
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

        /* ── CHALLENGE GRID ── */
        .cs-challenge-grid {
          display:grid; grid-template-columns:repeat(3,1fr);
          gap:16px; margin-top:32px;
        }
        .cs-challenge-card {
          background:#fff; border:1px solid #e7e5e4; border-radius:12px;
          padding:24px; transition:border-color .2s, box-shadow .2s;
        }
        .cs-challenge-card:hover { border-color:#93c5fd; box-shadow:0 6px 24px rgba(59,130,246,.08); }
        .cs-challenge-card h4 { font-size:14px; font-weight:700; color:#1c1917; margin-bottom:10px; }
        .cs-challenge-card p { font-size:13px; line-height:1.75; color:#78716c; }

        /* ── PRINCIPLES ── */
        .cs-prin-grid { display:grid; grid-template-columns:1fr 1fr; gap:14px; margin-top:36px; }
        .cs-prin-span { grid-column:1 / -1; }
        .cs-prin {
          background:#fff; border:1px solid #e7e5e4; border-radius:12px;
          padding:26px; transition:border-color .2s, box-shadow .2s, transform .2s;
          position:relative; overflow:hidden;
        }
        .cs-prin:hover { border-color:#93c5fd; box-shadow:0 6px 24px rgba(59,130,246,.08); transform:translateY(-2px); }
        .cs-prin-num {
          font-size:14px; margin-bottom:12px;
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

        /* ── FOOTER ── */
        .cs-foot { max-width:880px; margin:0 auto; padding:40px 48px 72px; display:flex; align-items:center; justify-content:space-between; }
        .cs-foot-nav-row { display:flex; gap:24px; margin-bottom:20px; }
        .cs-foot-nav-row button {
          font-size:13px; font-weight:500; color:#a8a29e;
          background:none; border:none; cursor:pointer;
          font-family:inherit; transition:color .15s; padding:0;
        }
        .cs-foot-nav-row button:hover { color:#1c1917; }
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
          .cs-prin-span { grid-column:1; }
          .cs-challenge-grid { grid-template-columns:1fr; }
          .cs-metrics { grid-template-columns:1fr; }
          .cs-metric { border-right:none; border-bottom:1px solid #e7e5e4; }
          .cs-metric:last-child { border-bottom:none; }
          .cs-two-col, .cs-work-grid { grid-template-columns:1fr !important; }
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
                {"From whiteboard to".split(" ").map((w, i) => (
                  <span key={w+i} className="cs-h1-word" style={{ animationDelay:`${i*0.1}s`, marginRight:"0.22em" }}>{w}</span>
                ))}
                <br/>
                <em className="cs-h1-word" style={{ animationDelay:"0.4s" }}>signed customers.</em>
              </h1>
              <p className="cs-h1-sub">Adopt AI</p>
              <MediaBox
                label="Platform Overview"
                sub="Best full-platform screenshot: copilot embedded in customer app with sidebar, recommended actions, and chat visible"
                height={380}
              />
              <p className="cs-hero-lead">
                The CEO had competitor screenshots and one idea. I had a blank Figma file and no brief. Six months later, Adopt had <strong>dozens of signed enterprise customers</strong>, and a design system, interaction model, and product direction built from scratch.
              </p>
              <div className="cs-meta">
                {[["Role","Founding Staff Designer"],["Scope","0 to 1 · Platform Vision"],["Timeline","6 Months to First Customers"],["Output","Platform · Design System · Strategy"]].map(([k,v])=>(
                  <div className="cs-meta-cell" key={k}>
                    <div className="cs-meta-k">{k}</div>
                    <div className="cs-meta-v">{v}</div>
                  </div>
                ))}
              </div>
            </div>
        </header>

        <div className="cs-wrap">

          {/* ORIGIN */}
          <section className="cs-sec reveal" id="origin">
            <div className="cs-kicker"><span className="cs-kicker-dot"/>01 · Origin</div>
            <h2 className="cs-sh">No PRD. No design system.<br/><em>Just a whiteboard and a vision.</em></h2>
            <p className="cs-p">
              The CEO walked in with competitor screenshots: Microsoft Copilot, Salesforce Agentforce, Google Gemini, and one conviction that every company should be able to build their own AI copilot, not just the enterprises that can afford to. There was no product brief, no existing design language, and no playbook for what agentic UX even looked like at this scale. That was the starting point.
            </p>
            <p className="cs-p">
              My first job wasn't to design screens. It was to figure out what we were actually building, and translate that into something a team could execute against.
            </p>
            <div className="cs-callout reveal">
              <span className="cs-callout-mark">"</span>
              <p className="cs-callout-text">Before I could design the product, I had to define what "agentic UX" meant for our users, our engineering team, and our customers.</p>
              <span className="cs-callout-label">The real first deliverable</span>
            </div>
            <div className="cs-two-col reveal" style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16, marginTop:32 }}>
              <MediaBox
                label="Early Exploration"
                sub="Whiteboard photo or earliest lo-fi wireframes from Figma: raw and honest works here"
                height={240}
              />
              <MediaBox
                label="Market Landscape at Kickoff"
                sub="Competitor reference grid: Microsoft Copilot, Salesforce Agentforce, Google Gemini from original deck"
                height={240}
              />
            </div>
          </section>

          {/* CHALLENGE */}
          <section className="cs-sec reveal" id="challenge">
            <div className="cs-kicker"><span className="cs-kicker-dot"/>02 · Challenge</div>
            <h2 className="cs-sh">Three problems no one had solved yet.<br/><em>I had to define them before I could design them.</em></h2>
            <p className="cs-p">
              Designing an AI copilot platform from zero isn't a typical UX problem. The constraints weren't just user needs. They were fundamental questions about how AI should behave, how teams should trust it, and how a product can serve radically different audiences without splitting itself in two.
            </p>
            <div className="cs-challenge-grid reveal">
              {CHALLENGES.map((c) => (
                <div key={c.title} className="cs-challenge-card">
                  <span className="cs-challenge-icon" style={{ fontSize:20, marginBottom:12, display:"block" }}>{c.icon}</span>
                  <h4>{c.title}</h4>
                  <p>{c.body}</p>
                </div>
              ))}
            </div>
          </section>

          {/* CONTRIBUTIONS */}
          <section className="cs-sec reveal" id="contributions">
            <div className="cs-kicker"><span className="cs-kicker-dot"/>03 · Contributions</div>
            <h2 className="cs-sh">I didn't just design screens.<br/><em>I architected the foundation.</em></h2>
            <p className="cs-p">
              As the sole designer at founding stage, the scope went well beyond UI. Every structural decision (how AI interactions are modelled, how the system scales, how trust is built in) came from design.
            </p>
            <div className="cs-prin-grid">
              {CONTRIBUTIONS.map((p, i) => (
                <div key={p.title} className={`cs-prin reveal s${i + 1} ${i === 4 ? "cs-prin-span" : ""}`}>
                  <div className="cs-prin-num">{p.emoji}</div>
                  <h4 className="cs-prin-h">{p.title}</h4>
                  <p className="cs-prin-p">{p.body}</p>
                </div>
              ))}
            </div>
          </section>

          {/* WORK */}
          <section className="cs-sec reveal" id="work">
            <div className="cs-kicker"><span className="cs-kicker-dot"/>04 · The Work</div>
            <h2 className="cs-sh">A platform designed to be trusted.<br/><em>Flexible enough to white-label. Intuitive enough to close deals.</em></h2>
            <p className="cs-p">
              The copilot deploys on customer platforms with their own branding, voice, and workflows, powered by Adopt under the hood. Three deployment modes: embedded copilot on a customer's product, internal tooling for the customer's own team, or a full white-label solution. The design had to support all three without fragmenting the system.
            </p>
            {/* Ed: Replace MediaBox placeholders below with real product screenshots. The Work section reads strongest when readers see the actual shipped UI. */}
            <MediaBox
              label="Platform Overview — Copilot Embedded"
              sub="Best screenshot: Acme Copilot or MoEngage Copilot, full sidebar panel with Welcome message, Recommended Actions, Top Actions, and chat input all visible"
              height={400}
            />
            <div className="cs-work-sublabel" style={{ fontSize:10, fontWeight:700, letterSpacing:".14em", textTransform:"uppercase", color:"#a8a29e", marginTop:32, marginBottom:12 }}>Platform in action</div>
            <div className="cs-work-grid reveal" style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
              <MediaBox label="Conversational Action Execution" sub="Ziuri Copilot chat interface: AI conversation with Deactivate/Reassign action buttons visible" height={220} />
              <MediaBox label="No-Code Configuration — Design Studio" sub="Design Studio panel: sidebar customization with Header, Welcome Text, Colour Palette controls visible" height={220} />
              <MediaBox label="Action Configuration" sub="Action components / flow builder: action config panel with routing logic visible" height={220} />
              <MediaBox label="Platform Analytics" sub="Adopt AI dashboard: Action Performance charts, Customer time spend metrics, Actions by topic donut chart" height={220} />
            </div>
            <p className="cs-work-caption" style={{ fontSize:13, fontStyle:"italic", color:"#a8a29e", textAlign:"center", marginTop:16 }}>
              The copilot deploys with the customer's own branding and voice. Adopt powers it invisibly under the hood.
            </p>
          </section>

          {/* IMPACT */}
          <section className="cs-sec reveal" id="impact">
            <div className="cs-kicker"><span className="cs-kicker-dot"/>05 · Impact</div>
            <h2 className="cs-sh">Design that moved the business.<br/><em>Not just shipped. Scaled.</em></h2>
            <p className="cs-p">
              Six months from whiteboard to signed customers. Design wasn't a downstream execution layer. It was the product. The demos closed deals. The trust model converted skeptics. The flexibility unlocked markets.
            </p>

            <div className="cs-metrics">
              {[
                { num:"6mo", cls:"blue", l:"Whiteboard to signed customers", s:"Full 0-to-1 in one product cycle" },
                { num:"Dozens", cls:"green", l:"Enterprise customers signed", s:"Within the first product cycle" },
                { num:"1", cls:"orange", l:"Designer building it all", s:"Design system · UX · strategy · research" },
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
                <div className="cs-outcome-head">Why design specifically drove this</div>
                {[
                  { h:"Demos closed deals", p:"Customers described the UI as sleek and trustworthy. The copilot felt easy to use and easy to manage, which turned first demos into signed pilots." },
                  { h:"Trust was visible, not assumed", p:"The design made AI behaviour transparent. Users could see what the agent would do, review it, and correct it. That visibility is what converted skeptical enterprise buyers." },
                  { h:"Flexibility unlocked multiple markets", p:"White-label, embedded, and internal deployment modes meant one design system served three distinct go-to-market motions without fragmenting the product." },
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
                  <div className="cs-stat-hero-n">V1→V2</div>
                  <div className="cs-stat-hero-l">Skepticism became excitement</div>
                  <p className="cs-stat-hero-s">The same design partners who pushed back on V1 were championing V2 in customer calls. That shift validated the product direction and the design approach.</p>
                </div>
                <div className="cs-stat-next">
                  <div className="cs-stat-next-k">What's next</div>
                  <p className="cs-stat-next-p">Expanding pilots with V2. Measuring adoption rates, self-serve completion, and reduced support load as the platform scales to new customers.</p>
                </div>
              </div>
            </div>
          </section>

          {/* CLOSING + FOOTER NAV ROW */}
          <section className="cs-sec reveal" style={{ marginTop:48, padding:"32px 0", textAlign:"center", borderTop:"1px solid #e7e5e4" }}>
            <p style={{ fontFamily:"'Lora',Georgia,serif", fontSize:22, fontWeight:500, color:"#57534e" }}>
              This wasn't just a design project.
            </p>
            <p style={{ fontFamily:"'Lora',Georgia,serif", fontSize:22, fontStyle:"italic", fontWeight:500, color:"#2563eb", marginTop:6 }}>
              It was the product.
            </p>
            <div className="cs-foot-nav-row" style={{ marginTop:24, display:"flex", justifyContent:"center", gap:24 }}>
              <button type="button" className="cs-foot-back" onClick={onClose}>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.7">
                  <path d="M10 12.5L5.5 8 10 3.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Back to Projects
              </button>
              <button type="button" className="cs-foot-back" onClick={onOpenActionBuilder || onClose}>
                Read Action Builder →
              </button>
            </div>
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
