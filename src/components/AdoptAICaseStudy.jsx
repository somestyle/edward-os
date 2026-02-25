import React, { useEffect, useRef, useState } from "react";

/* ─── data ──────────────────────────────────────────────── */

const ITERATIONS = [
  {
    version: "v1",
    vBg: "#44403c", vColor: "#fff",
    label: "Node Canvas",
    statusLabel: "Pivoted",
    statusColor: "#78716c", statusBg: "#f5f5f4",
    headline: "We started with a canvas because that is what every agent builder uses.",
    body: "Node-based canvases are the dominant paradigm in this category. Competitors use them. Engineering also believed our AI studio agent could handle workflow editing through natural language, which made a high-level canvas feel sufficient. Both assumptions broke under real production conditions. The studio agent did not perform reliably enough to ship. And actions were far more granular than a canvas could express: each API call required defined inputs, outputs, and contracts that a simple node box could not carry.",
    fdeCallout: false,
    wins: ["Established shared mental model early", "Confirmed need for step-level hierarchy"],
    gaps: ["Studio agent NL editing not production-ready", "No type contracts or input / output model", "Canvas became unreadable beyond 6 nodes", "Fully disconnected from WDL execution layer"],
    mediaSrc: "/Projects/Adopt/output_visual_640_24.gif",
  },
  {
    version: "v1.5",
    vBg: "#92400e", vColor: "#fff",
    label: "Structured Blocks",
    statusLabel: "Pivoted",
    statusColor: "#78716c", statusBg: "#f5f5f4",
    headline: "Sequential blocks fixed legibility. They exposed a deeper architectural gap.",
    body: "Ordered step blocks gave the workflow a clear top-to-bottom structure. PMs could follow the logic. Engineers found it more readable than the canvas. But when the studio agent was removed from the plan, a new reality emerged: someone had to edit the WDL code directly, and that person needed to live in this interface too. The visual editor and the WDL execution code were two entirely separate systems with no live sync. Every code edit silently diverged from what the UI showed. That drift was a trust failure built into the foundation.",
    fdeCallout: true,
    wins: ["Sequential structure readable for PMs", "Workflow logic scannable end to end"],
    gaps: ["UI and WDL out of sync on every edit", "No test mode or debug output", "FDE had no dedicated code editing surface", "Two separate truths for two user types"],
    mediaSrc: "/Projects/Adopt/output_blocks_640_24.gif",
  },
  {
    version: "v2",
    vBg: "#15803d", vColor: "#fff",
    label: "IA Reform + WDL Sync",
    statusLabel: "Shipped",
    statusColor: "#15803d", statusBg: "#f0fdf4",
    headline: "One interface. One source of truth. Both users served.",
    body: "Version 2 rebuilt two things at once. The information architecture was restructured with expandable panels and a contextual right-side drawer, so the layout scaled with complexity without overwhelming first-time users. The more consequential change was bidirectional UI and WDL sync: any visual edit instantly updated the code, any code change instantly reflected in the UI. This eliminated the root cause of drift. Engineers could edit code without leaving the surface. PMs could inspect the execution layer without writing it. Inline test mode, step-level debug output, and validation all shipped here.",
    fdeCallout: false,
    wins: ["Bidirectional sync eliminated UI and WDL drift", "Inline test and debug in one surface", "Both PMs and FDEs served from one model", "Trust restored through visible execution state"],
    gaps: [],
    mediaSrc: "/Projects/Adopt/output_techdetail_640_24.gif",
  },
  {
    version: "v2+",
    vBg: "#1d4ed8", vColor: "#fff",
    label: "Typed Step Primitives",
    statusLabel: "Foundation",
    statusColor: "#1d4ed8", statusBg: "#eff6ff",
    headline: "Typed steps turned the builder into a reusable system.",
    body: "The final layer introduced a formal step type system: Input, API Call, Data Processing, and Output. Each type carries its own schema, validation rules, and WDL snippet. Steps became composable components with defined contracts rather than one-off configurations. PMs could read the step list and understand what would execute. Engineers could rely on each step having a predictable input and output. Across customers, the same typed steps appeared repeatedly, growing into a shared library that cut onboarding time measurably.",
    fdeCallout: false,
    wins: ["Reusable typed steps with validated contracts", "Shared vocabulary for both PMs and engineers", "Schema validation at the step level", "Architecture extensible to agent orchestration"],
    gaps: [],
    mediaSrc: "/Projects/Adopt/output_wdledit_640_24.gif",
  },
];

const PRINCIPLES = [
  { n: "01", title: "AI output is probabilistic. Operations must be deterministic.", body: "Every AI-generated plan must be inspectable and editable before it executes. Confidence comes from visibility, not from trusting the model implicitly." },
  { n: "02", title: "Structure must be typed, not freeform.", body: "Freeform steps cannot be validated, safely reused, or reliably modified. Typed primitives create a stable shared vocabulary that scales with the platform." },
  { n: "03", title: "Trust is earned through visibility at every layer.", body: "Users cannot trust what they cannot inspect. When something fails, the system must say exactly where and why. Generic error states destroy trust immediately." },
  { n: "04", title: "One shared model beats two separate surfaces.", body: "Separate interfaces for PMs and engineers create two versions of truth. One underlying model with progressive disclosure is more honest and more maintainable." },
];

const RESEARCH_METHODS = [
  { icon: "👥", label: "Usability testing", note: "PM and FDE sessions across all major iterations" },
  { icon: "🔍", label: "FDE shadowing", note: "Observed live debugging workflow and WDL editing sessions" },
  { icon: "🧠", label: "AI officer workshops", note: "Broke down technical requirements with ML lead and Chief AI Officer" },
  { icon: "📊", label: "Time-on-task benchmarking", note: "Measured FDE time to create and test top actions per iteration" },
  { icon: "🏁", label: "Competitor benchmarking", note: "Mapped against Zapier, Salesforce Agentforce, and similar builders" },
  { icon: "🤝", label: "Design partner testing", note: "Stress-tested actions with early customers, tracked deployment rates" },
];

/* ─── component ──────────────────────────────────────────── */

const NAV_SECTION_IDS = ["context", "users", "research", "process", "principles", "solution", "impact"];

export default function AdoptAICaseStudy({ onClose }) {
  const [scrolled, setScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState("context");
  const rootRef = useRef(null);
  const metricRefs = useRef([]);
  const [metricCounted, setMetricCounted] = useState(false);

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

  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    const badges = el.querySelectorAll(".iter-badge-anim");
    const obs = new IntersectionObserver(
      (entries) => entries.forEach((e) => {
        if (e.isIntersecting) { e.target.classList.add("badge-popped"); obs.unobserve(e.target); }
      }),
      { threshold: 0.3, root: el }
    );
    badges.forEach((b) => obs.observe(b));
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    const rows = el.querySelectorAll(".arch-row-anim");
    const obs = new IntersectionObserver(
      (entries) => entries.forEach((e) => {
        if (e.isIntersecting) { e.target.classList.add("arch-row-in"); obs.unobserve(e.target); }
      }),
      { threshold: 0.2, root: el }
    );
    rows.forEach((r) => obs.observe(r));
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    if (metricCounted) return;
    const el = rootRef.current;
    if (!el) return;
    const targets = [
      { ref: metricRefs.current[0], end: 50, suffix: "%", prefix: "" },
      { ref: metricRefs.current[1], end: 25, suffix: "%", prefix: "+" },
      { ref: metricRefs.current[2], end: 90, suffix: "%", prefix: "" },
    ];
    const obs = new IntersectionObserver(
      (entries) => entries.forEach((e) => {
        if (e.isIntersecting && !metricCounted) {
          setMetricCounted(true);
          targets.forEach(({ ref, end, suffix, prefix }) => {
            if (!ref) return;
            let start = 0;
            const duration = 1400;
            const step = 16;
            const inc = end / (duration / step);
            const timer = setInterval(() => {
              start = Math.min(start + inc, end);
              ref.textContent = prefix + Math.round(start) + suffix;
              if (start >= end) clearInterval(timer);
            }, step);
          });
        }
      }),
      { threshold: 0.4, root: el }
    );
    if (metricRefs.current[0]) obs.observe(metricRefs.current[0].closest(".cs-metrics"));
    return () => obs.disconnect();
  }, [metricCounted]);

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
          overflow:hidden;
        }
        .cs-hero-tex {
          position:absolute; inset:0; z-index:0; opacity:.35;
          background-image: radial-gradient(circle, #c4b5a5 1px, transparent 1px);
          background-size: 22px 22px;
        }
        .cs-hero-wash {
          position:absolute; inset:0; z-index:1; pointer-events:none;
          background:
            radial-gradient(ellipse 65% 50% at 70% 0%, rgba(219,234,254,.82) 0%, transparent 60%),
            radial-gradient(ellipse 40% 35% at 0% 85%, rgba(220,252,231,.65) 0%, transparent 55%),
            linear-gradient(to bottom, rgba(252,251,250,0) 0%, rgba(252,251,250,.9) 100%);
        }
        .cs-hero-inner { position:relative; z-index:2; }

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
          width:640px; max-width:100%; border-radius:12px;
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

        /* ── BEFORE / AFTER ── */
        .cs-diff {
          margin-top:32px; border-radius:12px; overflow:hidden;
          border:1px solid #e7e5e4; background:#fff;
          box-shadow:0 1px 6px rgba(0,0,0,.04);
        }
        .cs-diff-head {
          padding:11px 20px; background:#fcfbfa;
          border-bottom:1px solid #e7e5e4;
          font-size:10px; font-weight:700; letter-spacing:.12em;
          text-transform:uppercase; color:#a8a29e;
        }
        .cs-diff-row {
          display:grid; grid-template-columns:96px 1fr;
          gap:16px; padding:18px 20px; align-items:start;
          border-bottom:1px solid #f5f5f4;
        }
        .cs-diff-row:last-child { border-bottom:none; }
        .cs-diff-badge {
          font-size:9.5px; font-weight:700; letter-spacing:.07em;
          text-transform:uppercase; padding:4px 0;
          border-radius:5px; text-align:center; margin-top:2px;
        }
        .cs-diff-badge.before { background:#fee2e2; color:#dc2626; }
        .cs-diff-badge.after  { background:#dcfce7; color:#16a34a; }
        .cs-diff-body { font-size:14px; line-height:1.75; color:#44403c; }
        .cs-diff-body strong { color:#15803d; font-weight:600; }

        /* ── PERSONA ── */
        .cs-persona-wrap { margin-top:28px; }
        .cs-persona {
          border-radius:14px; padding:28px; overflow:hidden;
          transition:transform .2s, box-shadow .2s;
          border:1px solid #e7e5e4;
        }
        .cs-persona:hover { transform:translateY(-2px); box-shadow:0 8px 32px rgba(0,0,0,.08); }
        .cs-persona-pm  { background:#fafaf9; }
        .cs-persona-avatar {
          width:44px; height:44px; border-radius:12px;
          display:flex; align-items:center; justify-content:center;
          font-size:20px; margin-bottom:16px; background:#f5f5f4;
        }
        .cs-persona-role { font-size:9.5px; font-weight:700; letter-spacing:.12em; text-transform:uppercase; color:#a8a29e; margin-bottom:6px; }
        .cs-persona-name { font-family:'Lora',serif; font-size:18px; font-weight:600; color:#0c0a09; margin-bottom:10px; line-height:1.3; }
        .cs-persona-desc { font-size:13px; line-height:1.75; color:#78716c; margin-bottom:16px; }
        .cs-persona-need { display:inline-block; font-size:11.5px; font-weight:600; padding:7px 12px; border-radius:8px; background:#f0f0ef; color:#44403c; }

        /* ── RESEARCH GRID ── */
        .cs-research-grid {
          display:grid; grid-template-columns:repeat(3,1fr);
          gap:10px; margin-top:28px;
        }
        .cs-research-card {
          background:#fff; border:1px solid #e7e5e4; border-radius:10px;
          padding:16px; transition:border-color .2s;
        }
        .cs-research-card:hover { border-color:#93c5fd; }
        .cs-research-icon { font-size:18px; margin-bottom:8px; }
        .cs-research-label { font-size:12px; font-weight:700; color:#1c1917; margin-bottom:3px; }
        .cs-research-note { font-size:11.5px; line-height:1.6; color:#78716c; }

        /* ── FDE CALLOUT (mid-iteration reveal) ── */
        .cs-fde-reveal {
          margin-top:20px;
          padding:16px 20px;
          background:#fffbeb; border:1px solid #fde68a; border-radius:12px;
          display:flex; gap:12px; align-items:flex-start;
        }
        .cs-fde-reveal-icon {
          width:28px; height:28px; flex-shrink:0; border-radius:7px;
          background:#fef3c7; display:flex; align-items:center; justify-content:center; font-size:13px;
        }
        .cs-fde-reveal-body { font-size:13px; line-height:1.7; color:#78716c; }
        .cs-fde-reveal-body strong { color:#92400e; font-weight:600; }

        /* ── ITERATIONS ── */
        .cs-iters { margin-top:48px; }
        .cs-iter {
          display:grid; grid-template-columns:200px 1fr;
          gap:48px; padding:48px 0;
          border-top:1px solid #e7e5e4;
        }
        .cs-iter:last-child { padding-bottom:0; }

        .cs-iter-version {
          display:inline-block;
          font-family:'DM Sans',sans-serif;
          font-size:13px; font-weight:700; letter-spacing:.04em;
          color:#fff; padding:5px 14px; border-radius:8px;
          margin-bottom:8px;
          transform:scale(0.7); opacity:0;
          transition:transform .4s cubic-bezier(.34,1.56,.64,1), opacity .3s ease;
        }
        .cs-iter-version.badge-popped { transform:scale(1); opacity:1; }
        .cs-iter-name { font-size:10px; font-weight:700; letter-spacing:.12em; text-transform:uppercase; color:#a8a29e; margin-bottom:12px; }
        .cs-iter-status {
          display:inline-flex; align-items:center; gap:6px;
          font-size:11px; font-weight:600; padding:5px 11px;
          border-radius:100px; margin-bottom:24px;
        }
        .cs-iter-status-dot { width:5px; height:5px; border-radius:50%; }

        /* ── HELD UP / BROKE DOWN ── */
        .cs-iter-groups { display:flex; flex-direction:column; gap:14px; }
        .cs-iter-group-label {
          display:flex; align-items:center; gap:7px;
          font-size:9.5px; font-weight:700; letter-spacing:.12em;
          text-transform:uppercase; color:#a8a29e; margin-bottom:7px;
        }
        .cs-iter-group-label svg { width:13px; height:13px; flex-shrink:0; }
        .cs-iter-group-items { display:flex; flex-direction:column; gap:5px; }
        .cs-iter-group-item {
          font-size:12px; font-weight:500; line-height:1.5;
          color:#57534e; padding:5px 0;
          border-bottom:1px solid #f5f5f4;
          display:flex; gap:8px; align-items:flex-start;
        }
        .cs-iter-group-item:last-child { border-bottom:none; }
        .cs-iter-group-item-dot { width:4px; height:4px; border-radius:50%; flex-shrink:0; margin-top:5px; }
        .dot-held { background:#78716c; }
        .dot-broke { background:#a8a29e; }

        .cs-iter-h {
          font-family:'Lora',serif; font-size:20px; font-weight:600;
          line-height:1.35; color:#0c0a09; letter-spacing:-.015em; margin-bottom:14px;
        }
        .cs-iter-p { font-size:14px; line-height:1.85; color:#57534e; }

        /* ── PRINCIPLES ── */
        .cs-prin-grid { display:grid; grid-template-columns:1fr 1fr; gap:14px; margin-top:36px; }
        .cs-prin {
          background:#fff; border:1px solid #e7e5e4; border-radius:12px;
          padding:26px; transition:border-color .2s, box-shadow .2s, transform .2s;
          position:relative; overflow:hidden;
        }
        .cs-prin:hover { border-color:#93c5fd; box-shadow:0 6px 24px rgba(59,130,246,.08); transform:translateY(-2px); }
        .cs-prin::after {
          content:''; position:absolute; inset:0; border-radius:12px; pointer-events:none; opacity:.02;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
          background-size:160px;
        }
        .cs-prin-num {
          font-size:10px; font-weight:700; letter-spacing:.14em;
          text-transform:uppercase; color:#3b82f6; margin-bottom:12px;
          display:flex; align-items:center; gap:8px;
        }
        .cs-prin-num::after { content:''; flex:1; height:1px; background:#e7e5e4; }
        .cs-prin-h { font-family:'Lora',serif; font-size:15px; font-weight:600; color:#0c0a09; margin-bottom:9px; line-height:1.45; }
        .cs-prin-p { font-size:13px; line-height:1.8; color:#78716c; }

        /* ── ARCHITECTURE ── */
        .cs-arch {
          margin-top:36px; border-radius:14px;
          background:#fff; border:1px solid #e7e5e4;
          overflow:hidden; box-shadow:0 2px 12px rgba(0,0,0,.04);
        }
        .cs-arch-head {
          padding:14px 24px; background:#fcfbfa;
          border-bottom:1px solid #e7e5e4;
          display:flex; align-items:center; justify-content:space-between;
        }
        .cs-arch-head-title { font-size:10px; font-weight:700; letter-spacing:.12em; text-transform:uppercase; color:#a8a29e; }
        .cs-arch-head-hint  { font-size:11px; font-weight:500; color:#c4b5a5; font-style:italic; }
        .cs-arch-body { padding:28px 24px 24px; }
        .cs-arch-root-wrap { display:flex; justify-content:center; }
        .cs-arch-root { background:#0c0a09; border-radius:10px; padding:14px 32px; text-align:center; min-width:180px; }
        .cs-arch-root-k { font-size:9px; font-weight:700; letter-spacing:.14em; text-transform:uppercase; color:#78716c; margin-bottom:4px; }
        .cs-arch-root-v { font-size:16px; font-weight:700; color:#fff; }
        .cs-arch-vline-wrap { display:flex; justify-content:center; padding:6px 0; }
        .cs-arch-vline { width:2px; height:20px; background:#d6d3d1; }
        .cs-arch-hrow { position:relative; display:grid; gap:10px; }
        .cs-arch-hrow.c4 { grid-template-columns:repeat(4,1fr); }
        .cs-arch-hrow.c2 { grid-template-columns:1fr 1fr; }
        .cs-arch-hrow::before { content:''; position:absolute; top:0; height:2px; background:#e7e5e4; }
        .cs-arch-hrow.c4::before { left:12.5%; right:12.5%; }
        .cs-arch-hrow.c2::before { left:25%; right:25%; }

        .arch-row-anim .cs-arch-node { opacity:0; transform:translateY(10px); }
        .arch-row-in .cs-arch-node { opacity:1; transform:translateY(0); transition:opacity .35s ease, transform .35s ease; }
        .arch-row-in .cs-arch-node:nth-child(1) { transition-delay:.0s; }
        .arch-row-in .cs-arch-node:nth-child(2) { transition-delay:.07s; }
        .arch-row-in .cs-arch-node:nth-child(3) { transition-delay:.14s; }
        .arch-row-in .cs-arch-node:nth-child(4) { transition-delay:.21s; }

        .cs-arch-node {
          border-radius:9px; padding:12px 10px; text-align:center;
          border:1px solid; position:relative;
          transition:transform .15s, box-shadow .15s; cursor:default;
        }
        .cs-arch-node:hover { transform:translateY(-2px); box-shadow:0 4px 16px rgba(0,0,0,.08); }
        .cs-arch-node::before {
          content:''; position:absolute; top:-10px; left:50%; transform:translateX(-50%);
          width:2px; height:10px; background:#e7e5e4;
        }
        .cs-arch-node-k { font-size:8.5px; font-weight:700; letter-spacing:.1em; text-transform:uppercase; margin-bottom:4px; }
        .cs-arch-node-v { font-size:12px; font-weight:600; line-height:1.3; }
        .cs-arch-ui     { background:#fafaf9; border-color:#e7e5e4; }
        .cs-arch-ui     .cs-arch-node-k { color:#a8a29e; }
        .cs-arch-ui     .cs-arch-node-v { color:#44403c; }
        .cs-arch-ui.act { background:#eff6ff; border-color:#93c5fd; }
        .cs-arch-ui.act .cs-arch-node-k { color:#3b82f6; }
        .cs-arch-ui.act .cs-arch-node-v { color:#1d4ed8; }
        .cs-arch-type   { background:#eff6ff; border-color:#bfdbfe; }
        .cs-arch-type   .cs-arch-node-k { color:#3b82f6; }
        .cs-arch-type   .cs-arch-node-v { color:#1d4ed8; }
        .cs-arch-today  { background:#fafaf9; border-color:#e7e5e4; }
        .cs-arch-today  .cs-arch-node-k { color:#a8a29e; }
        .cs-arch-today  .cs-arch-node-v { color:#44403c; }
        .cs-arch-future { background:linear-gradient(135deg,#eff6ff,#f0f9ff); border-color:#93c5fd; }
        .cs-arch-future .cs-arch-node-k { color:#3b82f6; }
        .cs-arch-future .cs-arch-node-v { color:#1d4ed8; }
        .cs-arch-sync {
          display:flex; align-items:center; gap:10px;
          margin:12px 0; font-size:10px; font-weight:600;
          letter-spacing:.08em; text-transform:uppercase; color:#93c5fd;
        }
        .cs-arch-sync::before, .cs-arch-sync::after { content:''; flex:1; height:1px; background:#bfdbfe; }
        .cs-arch-users { display:grid; grid-template-columns:1fr 1fr; gap:10px; margin-top:20px; padding-top:16px; border-top:1px solid #f5f5f4; }
        .cs-arch-user { border-radius:9px; padding:14px 16px; border:1px solid; }
        .cs-arch-user-pm  { background:#fafaf9; border-color:#e7e5e4; }
        .cs-arch-user-eng { background:#eff6ff; border-color:#bfdbfe; }
        .cs-arch-user-k { font-size:9px; font-weight:700; letter-spacing:.12em; text-transform:uppercase; margin-bottom:5px; }
        .cs-arch-user-pm  .cs-arch-user-k { color:#a8a29e; }
        .cs-arch-user-eng .cs-arch-user-k { color:#3b82f6; }
        .cs-arch-user-v { font-size:12.5px; line-height:1.65; color:#57534e; }

        /* ── METRICS ── */
        .cs-metrics {
          display:grid; grid-template-columns:repeat(3,1fr);
          border:1px solid #e7e5e4; border-radius:14px;
          overflow:hidden; margin-top:36px;
          background:#fff; box-shadow:0 2px 12px rgba(0,0,0,.04);
        }
        .cs-metric { padding:32px 26px; border-right:1px solid #e7e5e4; position:relative; overflow:hidden; }
        .cs-metric:last-child { border-right:none; }
        .cs-metric::before {
          content:''; position:absolute; inset:0; pointer-events:none;
          background-image: repeating-linear-gradient(-45deg, transparent, transparent 5px, rgba(0,0,0,.018) 5px, rgba(0,0,0,.018) 6px);
        }
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
        .cs-stat-hero::before {
          content:''; position:absolute; inset:0; border-radius:12px; pointer-events:none;
          background-image: repeating-linear-gradient(-45deg, transparent, transparent 5px, rgba(37,99,235,.04) 5px, rgba(37,99,235,.04) 6px);
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
          .cs-meta { grid-template-columns:1fr 1fr; }
          .cs-meta-cell:nth-child(2n) { border-right:none; }
          .cs-meta-cell:nth-child(n+3) { border-top:1px solid #e7e5e4; }
          .cs-prin-grid, .cs-arch-users, .cs-impact-grid { grid-template-columns:1fr; }
          .cs-research-grid { grid-template-columns:1fr 1fr; }
          .cs-arch-hrow.c4 { grid-template-columns:1fr 1fr; }
          .cs-arch-hrow.c4::before, .cs-arch-hrow.c2::before { display:none; }
          .cs-arch-node::before { display:none; }
          .cs-metrics { grid-template-columns:1fr; }
          .cs-metric { border-right:none; border-bottom:1px solid #e7e5e4; }
          .cs-metric:last-child { border-bottom:none; }
          .cs-iter { grid-template-columns:1fr; gap:16px; }
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
          <span className="cs-nav-id">Adopt AI · Action Builder</span>
          <ul className="cs-nav-links">
            {NAV_SECTION_IDS.map((id) => (
              <li key={id}>
                <a
                  href={`#${id}`}
                  className={activeSection === id ? "cs-nav-active" : ""}
                >
                  {id.charAt(0).toUpperCase() + id.slice(1)}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        {/* HERO */}
        <div className="cs-wrap">
          <header className="cs-hero" id="top">
            <div className="cs-hero-tex"/>
            <div className="cs-hero-wash"/>
            <div className="cs-hero-inner">
              <div className="cs-tags">
                <span className="cs-pill cs-pill-green">0 to 1 Design</span>
                <span className="cs-pill cs-pill-warm">Agentic AI</span>
                <span className="cs-pill cs-pill-stone">Enterprise SaaS</span>
              </div>
              <h1 className="cs-h1">
                {"Building trust into".split(" ").map((w, i) => (
                  <span key={w+i} className="cs-h1-word" style={{ animationDelay:`${i*0.1}s`, marginRight:"0.22em" }}>{w}</span>
                ))}
                <br/>
                <em className="cs-h1-word" style={{ animationDelay:"0.4s" }}>agentic AI</em>
              </h1>
              <p className="cs-h1-sub">Adopt AI</p>
              <img
                src="/Projects/Adopt/output_adopt_640_24.gif"
                alt="Adopt AI dashboard in action"
                className="cs-hero-gif"
              />
              <p className="cs-hero-lead">
                When AI stops <strong>advising</strong> and starts <strong>acting</strong>, the design problem changes entirely. This is the story of how I designed a workflow system that gave enterprise teams the confidence to let AI execute on their behalf, and what it took to earn that trust across four iterations.
              </p>
              <div className="cs-meta">
                {[["Role","Founding Staff Designer"],["Scope","0 to 1 · End-to-End"],["Timeline","6 Months"],["Platform","Enterprise SaaS · B2B2C"]].map(([k,v])=>(
                  <div className="cs-meta-cell" key={k}>
                    <div className="cs-meta-k">{k}</div>
                    <div className="cs-meta-v">{v}</div>
                  </div>
                ))}
              </div>
            </div>
          </header>
        </div>

        <div className="cs-wrap">

          {/* 01 CONTEXT */}
          <section className="cs-sec reveal" id="context">
            <div className="cs-kicker"><span className="cs-kicker-dot"/>01 · Context</div>
            <h2 className="cs-sh">The product that <em>acts</em>,<br/>not just advises</h2>
            <p className="cs-p">
              Adopt AI embeds a Copilot inside enterprise SaaS tools. Instead of answering questions, Adopt <strong>completes the entire workflow on the user's behalf</strong>. A rep types a natural language request. Adopt navigates the product, fills the form, and submits the record.
            </p>
            <p className="cs-p">
              As the <strong>founding staff designer</strong>, I owned the full design from first principles: system architecture, interaction model, and the trust model that makes autonomous AI safe inside regulated enterprise environments.
            </p>
            <div className="cs-callout reveal">
              <span className="cs-callout-mark">"</span>
              <p className="cs-callout-text">The shift from "here is how" to "done" sounds trivial. When software acts autonomously inside production systems on behalf of real users, every design decision carries real consequence.</p>
              <span className="cs-callout-label">The core design challenge</span>
            </div>
            <div className="cs-diff reveal">
              <div className="cs-diff-head">What changes when AI acts instead of advises</div>
              <div className="cs-diff-row">
                <span className="cs-diff-badge before">Before Adopt</span>
                <span className="cs-diff-body">"How do I add a customer?" returns a walkthrough. The user clicks every step. Every manual action is a chance for error.</span>
              </div>
              <div className="cs-diff-row">
                <span className="cs-diff-badge after">With Adopt</span>
                <span className="cs-diff-body">"Add John Doe, john@acme.com as a customer" and <strong>Adopt executes the full workflow end-to-end</strong>. Every action is logged, transparent, and reversible.</span>
              </div>
            </div>
          </section>

          {/* 02 USERS */}
          <section className="cs-sec reveal" id="users">
            <div className="cs-kicker"><span className="cs-kicker-dot"/>02 · User</div>
            <h2 className="cs-sh">One original target.<br/><em>A constraint that changed everything.</em></h2>
            <p className="cs-p">
              Adopt is B2B2C. Adopt's customers are SaaS companies that embed the Copilot into their own product. The Action Builder is the tool their internal team uses to configure, refine, and maintain the workflows their end users will execute. We are not designing for Adopt's own team. We are designing for the people inside each customer's organisation.
            </p>
            <p className="cs-p">
              We started with one primary target user.
            </p>
            <div className="cs-persona-wrap reveal">
              <div className="cs-persona cs-persona-pm">
                <div className="cs-persona-avatar">🧭</div>
                <div className="cs-persona-role">Original Target User · Customer's Team</div>
                <div className="cs-persona-name">SaaS Product Manager</div>
                <p className="cs-persona-desc">Configures and publishes AI-powered workflows for their end users. Needs to understand what a workflow will do without reading code. Must feel confident before pressing publish.</p>
                <span className="cs-persona-need">Needs: clarity, structure, confidence</span>
              </div>
            </div>
            <div className="cs-fde-reveal reveal" style={{ marginTop:20 }}>
              <div className="cs-fde-reveal-icon">⚡</div>
              <p className="cs-fde-reveal-body">
                <strong>A second user emerged mid-project.</strong> When the AI studio agent could not handle workflow editing reliably, Adopt needed Forward Deploy Engineers to do that work manually. This was not in the original plan. It changed the design problem entirely and is explained in the iteration section below.
              </p>
            </div>
          </section>

          {/* 03 RESEARCH */}
          <section className="cs-sec reveal" id="research">
            <div className="cs-kicker"><span className="cs-kicker-dot"/>03 · Research</div>
            <h2 className="cs-sh">How I grounded<br/><em>every decision</em></h2>
            <p className="cs-p">
              The platform was technically complex. Research had to bridge product managers who could not read code and engineers who thought in execution layers. I used six methods across the full six-month timeline.
            </p>
            <div className="cs-research-grid reveal">
              {RESEARCH_METHODS.map((m) => (
                <div key={m.label} className="cs-research-card">
                  <div className="cs-research-icon">{m.icon}</div>
                  <div className="cs-research-label">{m.label}</div>
                  <div className="cs-research-note">{m.note}</div>
                </div>
              ))}
            </div>
          </section>

          {/* 04 PROCESS */}
          <section className="cs-sec reveal" id="process">
            <div className="cs-kicker"><span className="cs-kicker-dot"/>04 · Design Process</div>
            <h2 className="cs-sh">Four iterations.<br/><em>Each one earned.</em></h2>
            <p className="cs-p">
              The path to v2 was not planned in advance. Each version made sense given what we knew at the time. The learning from each iteration is what decided the next move.
            </p>
            <div className="cs-iters">
              {ITERATIONS.map((it) => (
                <div className="cs-iter reveal" key={it.version}>
                  {/* left spine */}
                  <div>
                    <div
                      className="cs-iter-version iter-badge-anim"
                      style={{ background: it.vBg, color: it.vColor }}
                    >
                      {it.version}
                    </div>
                    <div className="cs-iter-name">{it.label}</div>
                    <div
                      className="cs-iter-status"
                      style={{ background: it.statusBg, color: it.statusColor }}
                    >
                      <span className="cs-iter-status-dot" style={{ background: it.statusColor }}/>
                      {it.statusLabel}
                    </div>

                    <div className="cs-iter-groups">
                      {it.wins.length > 0 && (
                        <div>
                          <div className="cs-iter-group-label">
                            <svg viewBox="0 0 13 13" fill="none" stroke="#78716c" strokeWidth="1.6">
                              <path d="M2 7l3.5 3.5L11 3.5" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                            Held up
                          </div>
                          <div className="cs-iter-group-items">
                            {it.wins.map((w) => (
                              <div key={w} className="cs-iter-group-item">
                                <span className="cs-iter-group-item-dot dot-held"/>
                                {w}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      {it.gaps.length > 0 && (
                        <div style={{ marginTop: it.wins.length > 0 ? 12 : 0 }}>
                          <div className="cs-iter-group-label">
                            <svg viewBox="0 0 13 13" fill="none" stroke="#a8a29e" strokeWidth="1.6">
                              <circle cx="6.5" cy="6.5" r="4.5"/>
                            </svg>
                            Broke down
                          </div>
                          <div className="cs-iter-group-items">
                            {it.gaps.map((g) => (
                              <div key={g} className="cs-iter-group-item">
                                <span className="cs-iter-group-item-dot dot-broke"/>
                                {g}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* right content */}
                  <div>
                    <h3 className="cs-iter-h">{it.headline}</h3>
                    <p className="cs-iter-p">{it.body}</p>
                    {it.fdeCallout && (
                      <div className="cs-fde-reveal" style={{ marginTop:20 }}>
                        <div className="cs-fde-reveal-icon">⚙️</div>
                        <p className="cs-fde-reveal-body">
                          <strong>This is where the Forward Deploy Engineer entered the picture.</strong> When the studio agent was removed from the plan, Adopt hired FDEs to handle workflow editing manually. A second user now lived inside the same interface, with completely different needs. Designing for one while not breaking the other became the central challenge of every iteration that followed.
                        </p>
                      </div>
                    )}
                    <MediaBox label={it.mediaLabel} sub={it.mediaSub} height={190} src={it.mediaSrc}/>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* 05 PRINCIPLES */}
          <section className="cs-sec reveal" id="principles">
            <div className="cs-kicker"><span className="cs-kicker-dot"/>05 · Design Principles</div>
            <h2 className="cs-sh">Not guidelines.<br/><em>Hard-won constraints.</em></h2>
            <p className="cs-p">
              These emerged mid-project, each time an iteration revealed what the previous version had gotten structurally wrong.
            </p>
            <div className="cs-prin-grid">
              {PRINCIPLES.map((p, i) => (
                <div key={p.n} className={`cs-prin reveal s${i + 1}`}>
                  <div className="cs-prin-num">{p.n}</div>
                  <h4 className="cs-prin-h">{p.title}</h4>
                  <p className="cs-prin-p">{p.body}</p>
                </div>
              ))}
            </div>
          </section>

          {/* 06 SOLUTION */}
          <section className="cs-sec reveal" id="solution">
            <div className="cs-kicker"><span className="cs-kicker-dot"/>06 · The Solution</div>
            <h2 className="cs-sh">A system designed<br/>to <em>earn trust</em></h2>
            <p className="cs-p">
              The v2 Action Builder is a layered system. Starting with what users can read, connecting through to what actually executes, and built to scale toward full agent orchestration.
            </p>
            <MediaBox label="Action Builder · Final Design" sub="Production UI or walkthrough GIF · add here" height={320} src="/Projects/Adopt/output_production_640_24.gif" maxWidth={640}/>

            <div className="cs-arch reveal">
              <div className="cs-arch-head">
                <span className="cs-arch-head-title">System Architecture · How the layers connect</span>
                <span className="cs-arch-head-hint">Read top to bottom</span>
              </div>
              <div className="cs-arch-body">
                <div className="cs-arch-root-wrap">
                  <div className="cs-arch-root">
                    <div className="cs-arch-root-k">Product</div>
                    <div className="cs-arch-root-v">Action Builder</div>
                  </div>
                </div>
                <div className="cs-arch-vline-wrap"><div className="cs-arch-vline"/></div>

                <div className="cs-arch-hrow c4 arch-row-anim">
                  {[["View","Instructions View",false],["Edit","Structured Editor",false],["Code","WDL Editor",true],["Validate","Test + Debug",false]].map(([k,v,a])=>(
                    <div key={k} className={`cs-arch-node cs-arch-ui${a?" act":""}`}>
                      <div className="cs-arch-node-k">{k}</div>
                      <div className="cs-arch-node-v">{v}</div>
                    </div>
                  ))}
                </div>

                <div className="cs-arch-sync">Real-time bidirectional sync · UI and WDL always in agreement</div>

                <div className="cs-arch-hrow c4 arch-row-anim">
                  {["Input","API Call","Data Processing","Output"].map((v)=>(
                    <div key={v} className="cs-arch-node cs-arch-type">
                      <div className="cs-arch-node-k">Step Type</div>
                      <div className="cs-arch-node-v">{v}</div>
                    </div>
                  ))}
                </div>

                <div className="cs-arch-sync">Typed primitives · reusable, validatable, composable across customers</div>

                <div className="cs-arch-hrow c2 arch-row-anim">
                  <div className="cs-arch-node cs-arch-today">
                    <div className="cs-arch-node-k">Today</div>
                    <div className="cs-arch-node-v">Customer Workflow Execution</div>
                  </div>
                  <div className="cs-arch-node cs-arch-future">
                    <div className="cs-arch-node-k">Built toward</div>
                    <div className="cs-arch-node-v">Studio Agent Orchestration</div>
                  </div>
                </div>

                <div className="cs-arch-users">
                  <div className="cs-arch-user cs-arch-user-pm">
                    <div className="cs-arch-user-k">Product Manager gets</div>
                    <div className="cs-arch-user-v">Instructions View shows what will happen before it runs. Edit mode to adjust steps without touching code. Validation surfaces every error before it ships.</div>
                  </div>
                  <div className="cs-arch-user cs-arch-user-eng">
                    <div className="cs-arch-user-k">Forward Deploy Engineer gets</div>
                    <div className="cs-arch-user-v">Live-synced WDL editor for surgical edits. Step-level code access without leaving the surface. Inline test and debug with no context-switching.</div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* 07 IMPACT */}
          <section className="cs-sec reveal" id="impact">
            <div className="cs-kicker"><span className="cs-kicker-dot"/>07 · Impact</div>
            <h2 className="cs-sh">Results that proved<br/><em>the decisions right</em></h2>
            <p className="cs-p">
              Each number maps directly to a design decision made during the iteration process and a real cost that existed before v2 shipped.
            </p>

            <div className="cs-metrics">
              {[
                { init:"0%",  cls:"blue",   l:"Faster to debug",           s:"After UI to WDL sync shipped",      idx:0 },
                { init:"0%",  cls:"green",  l:"Higher publish success",    s:"Deployment rate post-v2",           idx:1 },
                { init:"0%",  cls:"orange", l:"Reduction in drift errors", s:"UI and WDL near-perfectly aligned", idx:2 },
              ].map((m)=>(
                <div key={m.l} className="cs-metric">
                  <div className={`cs-metric-num ${m.cls}`} ref={(el) => { metricRefs.current[m.idx] = el; }}>
                    {m.init}
                  </div>
                  <div className="cs-metric-lbl">{m.l}</div>
                  <div className="cs-metric-sub">{m.s}</div>
                </div>
              ))}
            </div>

            <div className="cs-impact-grid reveal">
              <div className="cs-outcome-card">
                <div className="cs-outcome-head">Qualitative shifts</div>
                {[
                  { h:"PMs could validate before deploying", p:"Non-engineers saw exactly what would execute and confirmed it was correct before it ran in front of a customer." },
                  { h:"Engineers stopped context-switching", p:"One surface for editing, testing, and debugging replaced a fragmented multi-tool workflow that had been silently reintroducing bugs." },
                  { h:"Step reuse became the default", p:"Typed primitives grew into a shared library across every enterprise customer, cutting setup time per new client significantly." },
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
                  <div className="cs-stat-hero-n">7×</div>
                  <div className="cs-stat-hero-l">Step-type reuse across customers</div>
                  <p className="cs-stat-hero-s">Typed primitives grew into a shared library. Each new customer came pre-loaded with reusable building blocks, cutting onboarding measurably.</p>
                </div>
                <div className="cs-stat-next">
                  <div className="cs-stat-next-k">What this unlocked</div>
                  <p className="cs-stat-next-p">The typed step architecture became the direct foundation for <strong>Studio Agent Orchestration</strong>, Adopt's next product milestone.</p>
                </div>
              </div>
            </div>
          </section>

          {/* 08 REFLECTION */}
          <section className="cs-sec reveal">
            <div className="cs-kicker"><span className="cs-kicker-dot"/>08 · Reflection</div>
            <h2 className="cs-sh">What I would<br/><em>do differently</em></h2>
            <p className="cs-p">
              Four things I carry forward from this project into every complex systems problem I take on next.
            </p>
            <ul className="cs-learnings">
              {[
                {
                  h: "Start with the type system, not the interface",
                  b: "Typed steps were not a late refinement. Defining them in v1 would have prevented drift, unlocked debugging, and made even the canvas viable. The primitives you define early set the ceiling for everything built on top.",
                },
                {
                  h: "Validate AI feasibility before designing around it",
                  b: "The studio agent was promised. When it did not perform, we pivoted mid-stream. Next time I push for a small engineering POC before committing design direction to any AI capability. Surfacing the real constraints early is cheaper than changing course later.",
                },
                {
                  h: "Transparency is not a feature. It is the product.",
                  b: "Users need to understand AI, predict it, and correct it. Showing execution steps, surfacing errors inline, keeping UI and code in sync: these were not polish. They were the foundation of trust.",
                },
                {
                  h: "Constraints sharpen the design",
                  b: "Serving two radically different users from one shared model produced something more honest and more scalable than two separate surfaces would have. The hardest constraints almost always contain the right answer.",
                },
              ].map((l, i) => (
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
