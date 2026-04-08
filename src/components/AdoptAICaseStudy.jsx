import React, { useEffect, useRef, useState } from "react";
import AdoptPresentationMode from "./AdoptPresentationMode.jsx";

/* ─── data ──────────────────────────────────────────────── */

const ITERATIONS = [
  {
    version: "01",
    iterLabel: "Iteration 1",
    label: "Node Canvas",
    vColor: "#fff",
    vBg: "#2563eb",
    headline: "A spatial canvas made sense given what we knew about our users.",
    paragraphs: [
      "Our initial target persona was product managers: non-technical users who needed to understand workflows at a glance. A node-based canvas borrowed from tools they already knew. The hypothesis was that if you could see the relationships between steps spatially, the whole workflow would become legible without needing to read code.",
      "As we tested with real workflows, the abstraction broke down. PMs got disoriented beyond five or six nodes. Engineers found the canvas too disconnected from actual execution. And the fundamental gap: every step was just a labelled box. There was no type system, no way to declare what a step expected or produced, and no path to reuse or validate anything.",
    ],
    mediaSrc: "/Projects/Adopt/Adopt_builder1.gif",
    mediaLabel: "v1 · Node Canvas",
    wins: ["Established the conceptual baseline", "Surfaced the need for step hierarchy and ordering"],
    gaps: ["No type system or input / output model", "Steps impossible to debug at scale", "PMs disoriented beyond a handful of nodes", "Zero connection to execution logic"],
  },
  {
    version: "02",
    iterLabel: "Iteration 2",
    label: "Structured Blocks",
    vColor: "#fff",
    vBg: "#2563eb",
    headline: "Ordering steps gave us legibility. Testing showed us what we still hadn't solved.",
    paragraphs: [
      "Moving from canvas to ordered blocks felt like a real step forward. Sequential top-to-bottom flow was immediately more readable. PMs could follow the logic without getting spatially lost. Early grouping into Input, Building Blocks, and Output gave the whole thing a recipe-like structure that felt trustworthy to non-engineers.",
      "Then the critical failure surfaced in usability testing. The UI and the underlying WDL execution code were two completely separate systems. Engineers still edited raw WDL directly. A change in the visual editor would not update the code. A code change would not update the UI. Every single edit was creating drift. This was not a minor inconsistency. It was a trust failure baked into the architecture itself.",
    ],
    mediaSrc: "/Projects/Adopt/Adopt_builder1b.gif",
    mediaLabel: "v1.5 · Structured Blocks",
    wins: ["Sequential order felt natural and readable", "PMs could follow logic end to end without code knowledge"],
    gaps: ["UI and WDL diverged on every edit", "No debugging or test capability in the interface", "Engineers and PMs working from different representations of truth", "No reusable step components"],
  },
  {
    version: "03",
    iterLabel: "Iteration 3",
    label: "IA Reform",
    vColor: "#fff",
    vBg: "#2563eb",
    headline: "Rebuilding the information architecture gave both users a surface they could trust.",
    paragraphs: [
      "Before solving the sync problem, we needed to fix the structural scaffolding. The information architecture was rebuilt with expandable section panels, a contextual right-side configuration drawer, and updated navigation that let users move between viewing and editing without losing context. The layout could now scale with workflow complexity without overwhelming users on first load.",
      "This iteration also introduced clearer grouping between action metadata, the step list, and the technical details panel. The left-right split mapped naturally to the PM versus engineer mental models. Getting this structure right was the prerequisite for everything that came next.",
    ],
    mediaSrc: "/Projects/Adopt/Adopt_builder2.gif",
    mediaLabel: "v2 · Information Architecture",
    wins: ["Clearer grouping reduced cognitive load for both user types", "Expand/collapse patterns let complexity stay hidden until needed", "Right-side panel gave engineers contextual detail without cluttering the PM view"],
    gaps: ["UI/WDL sync still unsolved", "Engineers still context-switching to raw code for edits", "Debugging remained fragmented across tools"],
  },
  {
    version: "04",
    iterLabel: "Iteration 4",
    label: "WDL Editor + Test",
    vColor: "#fff",
    vBg: "#2563eb",
    headline: "Putting code and UI side by side, in real-time sync, eliminated the root cause of every trust failure.",
    paragraphs: [
      "This was the decisive change. The side-by-side WDL editor was introduced alongside the visual UI, kept in bidirectional real-time sync. Any edit in the visual interface instantly updated the underlying code. Any code change instantly reflected in the UI. For the first time, both representations were the same thing.",
      "Inline test mode, step-level debug output, and run-and-inspect capability were all shipped together. Engineers could now edit, test, and debug without leaving the builder. PMs could inspect the code representation even if they couldn't write it. The builder stopped being a configuration tool and became a live development environment that both users could operate in.",
    ],
    mediaSrc: "/Projects/Adopt/Adopt_builder2b.gif",
    mediaLabel: "v2+ · WDL Editor & Test Integration",
    wins: ["Changes in either the visual editor or the underlying code instantly update the other, permanently ending the drift", "Inline test and debug removed the need to context-switch to external tools", "Both PM and engineer served within one unified surface", "Trust restored through full execution visibility"],
    gaps: [
      "Steps still had no defined structure, so the same workflow built by two different engineers looked completely different",
      "There was no way to reuse work across customers, every new client required starting from scratch",
      "Without a shared vocabulary for step types, PMs and engineers described the same thing differently"
    ],
  },
  {
    version: "05",
    iterLabel: "Iteration 5",
    label: "Structured Step Templates",
    vColor: "#fff",
    vBg: "#2563eb",
    headline: "Giving each step a defined category turned the builder into something every customer could reuse.",
    paragraphs: [
      "The final layer introduced a formal type system across four categories: User Input, API Call, Data Processing, and Output. Each step type carries its own form schema, its own validation rules, and its own WDL code snippet. Steps stopped being one-off configurations and became reusable components with defined contracts.",
      "This created a shared vocabulary that both PMs and engineers could reason about independently. A PM could read the step list and understand what the workflow actually does at each stage. An engineer could trust that each step had a declared input/output contract. Across customers, the same structured steps recurred, and the library grew with every new implementation. This is the structural layer the system had been missing since v1.",
    ],
    mediaSrc: "/Projects/Adopt/Adopt_builder3.gif",
    mediaLabel: "v3 · Structured Step Templates",
    wins: ["Structured step templates are reusable, validatable, and composable across workflows", "Shared vocabulary bridged the PM/engineer communication gap", "Schema validation built in at the step level reduced execution errors by 90%", "Architecture became the direct foundation for Studio Agent orchestration"],
    gaps: [],
  },
];

const ITERATION_BRIDGES = [
  "The canvas gave us the right question. But it surfaced a user we hadn't fully designed for.",
  "Ordering steps solved the PM's problem. Testing revealed the engineer's problem that we hadn't seen prior.",
  "The IA gave both users a clearer surface. But every edit was still producing two conflicting versions of the same workflow.",
  "Sync solved the trust problem. The next question was whether the steps themselves could become a reusable system.",
];

const PRINCIPLES = [
  { n: "01", title: "AI output is probabilistic. Operations must be deterministic.", body: "Every AI-generated plan must be inspectable and editable before it executes. Confidence comes from visibility, not from trusting the model implicitly." },
  { n: "02", title: "Structure must be templated, not freeform.", body: "When every step has a defined category and purpose, the whole team uses the same language to describe what a workflow does. That shared understanding is what lets the system grow without breaking down." },
  { n: "03", title: "Trust is earned through visibility at every layer.", body: "Users cannot trust what they cannot inspect. When something fails, the system must say exactly where and why. Generic error states destroy trust immediately." },
  { n: "04", title: "One shared model beats two separate surfaces.", body: "Separate interfaces for PMs and engineers create two versions of truth. One underlying model with progressive disclosure is more honest and more maintainable." },
];

const RESEARCH_METHODS = [
  { icon: "👥", label: "Usability testing", note: "PM and FDE sessions across all major iterations" },
  { icon: "🔍", label: "FDE shadowing", note: "Observed live debugging sessions with Forward Deploy Engineers (FDEs) and watched how they edited WDL to fix broken workflows in customer environments" },
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
  const [presentationOpen, setPresentationOpen] = useState(false);

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
        .cs-nav-id {
          flex:1;
          min-width:0;
          text-align:center;
          font-size:12px;
          font-weight:600;
          color:#78716c;
        }
        .cs-nav-links { display:flex; gap:22px; list-style:none; }
        .cs-nav-links a { font-size:11.5px; font-weight:500; color:#a8a29e; text-decoration:none; transition:color .15s; }
        .cs-nav-links a:hover { color:#1c1917; }
        .cs-nav-links a.cs-nav-active { color:#1c1917; font-weight:600; }
        .cs-nav-right {
          display:flex;
          align-items:center;
          justify-content:flex-end;
          gap:14px;
          flex-shrink:0;
          min-height:100%;
        }
        .cs-nav-present {
          display:inline-flex;
          align-items:center;
          justify-content:center;
          gap:6px;
          padding:5px 10px;
          font-size:12px;
          font-weight:600;
          letter-spacing:0.01em;
          color:#44403c;
          background:#fff;
          border:1px solid #d6d3d1;
          border-radius:8px;
          box-shadow:0 1px 2px rgba(0,0,0,.04);
          cursor:pointer;
          font-family:inherit;
          line-height:1;
          transition:border-color .15s, background .15s, box-shadow .15s;
        }
        .cs-nav-present:hover {
          border-color:#a8a29e;
          background:#fafaf9;
          box-shadow:0 1px 3px rgba(0,0,0,.06);
        }
        .cs-nav-present-icon {
          flex-shrink:0;
          display:block;
          color:#2563eb;
        }

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
          border-radius:14px; padding:16px 20px;
          transition:transform .2s, box-shadow .2s;
          border:1px solid #e7e5e4;
          display:flex; gap:12px; align-items:flex-start;
        }
        .cs-persona:hover { transform:translateY(-2px); box-shadow:0 8px 32px rgba(0,0,0,.08); }
        .cs-persona-pm  { background:#fafaf9; }
        .cs-persona-avatar {
          width:44px; height:44px; border-radius:12px;
          display:flex; align-items:center; justify-content:center;
          font-size:20px; flex-shrink:0; background:#f5f5f4;
        }
        .cs-persona-body { flex:1; min-width:0; }
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
          background:#fffbeb; border:1px solid #fde68a; border-radius:14px;
          display:flex; gap:12px; align-items:flex-start;
        }
        .cs-fde-reveal-icon {
          width:44px; height:44px; flex-shrink:0; border-radius:12px;
          background:#fef3c7; display:flex; align-items:center; justify-content:center; font-size:20px;
        }
        .cs-fde-reveal-body { font-size:13px; line-height:1.7; color:#78716c; }
        .cs-fde-reveal-body strong { color:#92400e; font-weight:600; }
        .cs-fde-reveal-body strong.cs-fde-body-strong { color:#78716c; font-weight:600; }

        /* ── ITERATIONS ── */
        .cs-iters { margin-top:48px; }

        /* ITERATION CARD - new stacked layout */
        .cs-iter {
          padding: 48px 0 40px;
          border-bottom: 1px solid #e7e5e4;
        }
        .cs-iter:last-of-type { border-bottom: none; padding-bottom: 0; }

        .cs-iter-header {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 16px;
        }
        .cs-iter-badge {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 5px 14px;
          border-radius: 6px;
          font-size: 12px;
          font-weight: 700;
          letter-spacing: .04em;
          color: #fff;
          white-space: nowrap;
          flex-shrink: 0;
        }
        .cs-iter-name {
          font-size: 11px;
          font-weight: 700;
          letter-spacing: .12em;
          text-transform: uppercase;
          color: #a8a29e;
        }

        .cs-iter-headline {
          font-family: 'Lora', Georgia, serif;
          font-size: clamp(20px, 2.8vw, 28px);
          font-weight: 700;
          line-height: 1.15;
          letter-spacing: -.018em;
          color: #0c0a09;
          margin-bottom: 24px;
          max-width: 720px;
        }

        .cs-iter-media {
          width: 100%;
          border-radius: 12px;
          overflow: hidden;
          border: 1px solid #e7e5e4;
          background: #f5f5f4;
          margin-bottom: 28px;
        }
        .cs-iter-media img {
          width: 100%;
          height: auto;
          display: block;
        }

        .cs-iter-analysis {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
        }
        .cs-iter-analysis.single-col {
          grid-template-columns: 1fr;
        }

        .cs-iter-col {
          background: #fff;
          border: 1px solid #e7e5e4;
          border-radius: 10px;
          padding: 20px 22px;
        }

        .cs-iter-col-head {
          display: flex;
          align-items: center;
          gap: 7px;
          font-size: 10px;
          font-weight: 700;
          letter-spacing: .12em;
          text-transform: uppercase;
          margin-bottom: 14px;
          padding-bottom: 12px;
          border-bottom: 1px solid #f5f5f4;
        }
        .cs-iter-col-head.worked { color: #16a34a; }
        .cs-iter-col-head.learned { color: #ea580c; }

        .cs-iter-col-head-icon {
          width: 14px;
          height: 14px;
          flex-shrink: 0;
        }

        .cs-iter-bullets {
          list-style: none;
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        .cs-iter-bullet {
          display: flex;
          align-items: flex-start;
          gap: 9px;
          font-size: 13px;
          line-height: 1.6;
          color: #57534e;
        }
        .cs-iter-bullet-dot {
          width: 5px;
          height: 5px;
          border-radius: 50%;
          margin-top: 7px;
          flex-shrink: 0;
        }
        .cs-iter-bullet-dot.worked  { background: #16a34a; }
        .cs-iter-bullet-dot.learned { background: #ea580c; }

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
        .cs-arch-root { background:#ffedd5; border-radius:10px; padding:14px 32px; text-align:center; min-width:180px; }
        .cs-arch-root-k { font-size:9px; font-weight:700; letter-spacing:.14em; text-transform:uppercase; color:#9a3412; margin-bottom:4px; }
        .cs-arch-root-v { font-size:16px; font-weight:700; color:#1c1917; }
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
          .cs-iter-analysis { grid-template-columns: 1fr; }
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
          <div className="cs-nav-right">
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
            <button
              type="button"
              className="cs-nav-present"
              aria-label="Present"
              title="Present"
              onClick={() => setPresentationOpen(true)}
            >
              <svg className="cs-nav-present-icon" width="11" height="11" viewBox="0 0 24 24" aria-hidden>
                <path fill="currentColor" d="M8 5v14l11-7z" />
              </svg>
              Present
            </button>
          </div>
        </nav>

        {/* HERO */}
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
                src="/Projects/Adopt/Adopt_main.gif"
                alt="Adopt AI dashboard in action"
                className="cs-hero-gif"
              />
              <p className="cs-hero-lead">
                When AI stops <strong>advising</strong> and starts <strong>acting</strong>, the design problem changes entirely. The challenge shifts to making system behavior understandable and predictable. This is the story of how I designed a workflow system that gave enterprise teams the confidence to let AI execute on their behalf.
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

        <div className="cs-wrap">

          {/* 01 CONTEXT */}
          <section className="cs-sec reveal" id="context">
            <div className="cs-kicker"><span className="cs-kicker-dot"/>01 · Context</div>
            <h2 className="cs-sh">The product that <em>acts</em>,<br/>not just advises</h2>
            <p className="cs-p">
              Adopt AI embeds a Copilot inside enterprise SaaS tools. Instead of answering questions, Adopt <strong>completes the entire workflow on the user's behalf</strong>. A rep types a natural language request. Adopt navigates the product, fills the form, and submits the record. The Action Builder is the internal tool that lets customers configure those workflows, deciding what steps the AI takes, in what order, and with what data.
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
                <span className="cs-diff-body">"How do I add a customer?" returns a walkthrough or link to a knowledge base. The user has to follow the guide and clicks through every step. Every manual action is a chance for error.</span>
              </div>
              <div className="cs-diff-row">
                <span className="cs-diff-badge after">With Adopt</span>
                <span className="cs-diff-body">"Add John Doe, john@acme.com as a customer" and <strong>Adopt executes the full workflow end-to-end</strong>. Every action is logged, transparent, and reversible while keeping human in the loop.</span>
              </div>
            </div>
          </section>

          {/* 02 USERS */}
          <section className="cs-sec reveal" id="users">
            <div className="cs-kicker"><span className="cs-kicker-dot"/>02 · User</div>
            <h2 className="cs-sh">One original target.<br/><em>A constraint that changed everything.</em></h2>
            <p className="cs-p">
              Adopt is B2B2C. Adopt's customers are SaaS companies that embed the Copilot into their own product. The Action Builder is the tool their internal team uses to configure, refine, and maintain the workflows their end users will execute. We are not designing for Adopt's own team. We are designing for the people inside each customer's organization.
            </p>
            <p className="cs-p">
              We started with one primary target user.
              <br />
              Too much flexibility made it hard for users to predict what would happen when an action executed.
              <br />
              We introduced constraints to make the system easier to reason about.
            </p>
            <div className="cs-persona-wrap reveal">
              <div className="cs-persona cs-persona-pm">
                <div className="cs-persona-avatar">🧭</div>
                <div className="cs-persona-body">
                  <div className="cs-persona-role">Original Target User · Customer's Team</div>
                  <div className="cs-persona-name">SaaS Product Manager</div>
                  <p className="cs-persona-desc">Configures and publishes AI-powered workflows for their end users. Needs to understand what a workflow will do without reading code. Must feel confident before pressing publish.</p>
                  <span className="cs-persona-need">Needs: clarity, structure, confidence</span>
                </div>
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
            <h2 className="cs-sh">Five iterations.<br/><em>Each one earned.</em></h2>
            <p className="cs-p">
              The path to v2 was not planned in advance. Each version made sense given what we knew at the time. The learning from each iteration is what decided the next move.
            </p>
            <div className="cs-iters">
              {ITERATIONS.map((iter, i) => (
                <React.Fragment key={iter.version}>
                  <div className="cs-iter reveal">
                    {/* Header: badge + label */}
                    <div className="cs-iter-header">
                      <div className="cs-iter-badge" style={{ background: iter.vBg }}>
                        {iter.iterLabel}
                      </div>
                      <div className="cs-iter-name">{iter.label}</div>
                    </div>

                    {/* Headline */}
                    <div className="cs-iter-headline">{iter.headline}</div>

                    {/* Media */}
                    <div className="cs-iter-media">
                      <img
                        src={iter.mediaSrc}
                        alt={iter.mediaLabel}
                        loading="lazy"
                      />
                    </div>

                    {/* Analysis columns */}
                    <div className={`cs-iter-analysis${!iter.gaps || iter.gaps.length === 0 ? ' single-col' : ''}`}>
                      {/* What worked */}
                      <div className="cs-iter-col">
                        <div className="cs-iter-col-head worked">
                          <svg className="cs-iter-col-head-icon" viewBox="0 0 14 14" fill="none">
                            <path d="M2.5 7.5l3 3 6-6" stroke="#16a34a" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                          What worked
                        </div>
                        <ul className="cs-iter-bullets">
                          {iter.wins.map((w) => (
                            <li key={w} className="cs-iter-bullet">
                              <span className="cs-iter-bullet-dot worked" />
                              {w}
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* What we learned - only render if gaps exist */}
                      {iter.gaps && iter.gaps.length > 0 && (
                        <div className="cs-iter-col">
                          <div className="cs-iter-col-head learned">
                            <svg className="cs-iter-col-head-icon" viewBox="0 0 14 14" fill="none">
                              <circle cx="7" cy="7" r="5" stroke="#ea580c" strokeWidth="1.6"/>
                              <path d="M7 4.5v3M7 9.5v.5" stroke="#ea580c" strokeWidth="1.6" strokeLinecap="round"/>
                            </svg>
                            What we learned
                          </div>
                          <ul className="cs-iter-bullets">
                            {iter.gaps.map((g) => (
                              <li key={g} className="cs-iter-bullet">
                                <span className="cs-iter-bullet-dot learned" />
                                {g}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                  {i < ITERATIONS.length - 1 && (
                    <div style={{ borderTop: "1px solid #e7e5e4", padding: "20px 0", textAlign: "center", fontSize: 13, fontStyle: "italic", color: "#a8a29e" }}>
                      <p style={{ margin: 0 }}>{ITERATION_BRIDGES[i]}</p>
                      {i === 1 && (
                        <div className="cs-fde-reveal" style={{ marginTop: 16, textAlign: "left" }}>
                          <div className="cs-fde-reveal-icon">⚡</div>
                          <p className="cs-fde-reveal-body" style={{ fontStyle: "normal" }}>
                            <strong>A second user enters the picture.</strong>
                            <br/>
                            Forward Deploy Engineers (FDEs - the team responsible for debugging and maintaining actions in production) were using the builder far more intensively than we had anticipated. They needed surgical code-level access, not just a visual interface. Designing for one user had left the other without the tools they needed. Both had to be served from the same surface.
                            <br/>
                            <br/>
                            <strong className="cs-fde-body-strong">This fundamentally changed the product from a self-serve tool into a system that needed to balance usability with deep technical control.</strong>
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </React.Fragment>
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
            <MediaBox label="Action Builder · Final Design" sub="Production UI or walkthrough GIF · add here" height={320} src="/Projects/Adopt/Adopt_builder_prod.gif"/>

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

                <div className="cs-arch-sync">Structured step templates · reusable, validatable, composable across customers</div>

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
                { init:"0%",  cls:"orange", l:"Reduction in drift errors", s:"Code and interface near-perfectly aligned", idx:2 },
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
                  { h:"Step reuse became the default", p:"Structured step templates grew into a shared library across every enterprise customer, cutting setup time per new client significantly." },
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
                  <div className="cs-stat-hero-l">Workflow step reuse across customers</div>
                  <p className="cs-stat-hero-s">Structured step templates grew into a shared library. Each new customer came pre-loaded with reusable building blocks, cutting onboarding measurably.</p>
                </div>
                <div className="cs-stat-next">
                  <div className="cs-stat-next-k">What this unlocked</div>
                  <p className="cs-stat-next-p">The structured step architecture became the direct foundation for <strong>Studio Agent Orchestration</strong>, Adopt's next product milestone.</p>
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
                  h: "Define what each step is before designing how it looks",
                  b: "Structured steps were not a late refinement. Defining them in v1 would have prevented drift, unlocked debugging, and made even the canvas viable. The templates you define early set the ceiling for everything built on top.",
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

      <AdoptPresentationMode
        open={presentationOpen}
        onClose={() => setPresentationOpen(false)}
        iterations={ITERATIONS}
        iterationBridges={ITERATION_BRIDGES}
        principles={PRINCIPLES}
        researchMethods={RESEARCH_METHODS}
      />
    </>
  );
}
