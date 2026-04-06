import React, { useEffect, useRef, useState, useCallback } from "react";

/* ─── data ─────────────────────────────────────────────── */

const SOLUTION_FEATURES = [
  { icon: "🖥", title: "Chrome Extension", body: "Lives alongside payer portals as a persistent surface." },
  { icon: "🎧", title: "Contextual Assistant", body: "Acts during submission and status workflows in real time." },
  { icon: "🔗", title: "System Connector", body: "Connects payer portals, SamaCare, and EHR systems in real time." },
  { icon: "✨", title: "Future Expansion", body: "Creates a persistent surface for workflow support and future expansion." },
];

const SUBMISSION_STEPS = [
  { n: "01", label: "Search & Select", body: "Users search and select patients within Copilot while on a payer portal." },
  { n: "02", label: "Autofill", body: "Injects patient data such as name and MRN directly into portal forms." },
  { n: "03", label: "Detection", body: "Copilot detects submission confirmation states automatically after form submission." },
  { n: "04", label: "Extract & Save", body: "Extracts structured data such as authorization number and status, captures a screenshot, and saves all information directly into SamaCare without requiring user navigation." },
];

const STATUS_STEPS = [
  { n: "01", label: "Search for Patient", body: "Users return to payer portals to check authorization status. Copilot allows users to search for a patient directly within the extension." },
  { n: "02", label: "View Existing Authorizations", body: "Displays existing prior authorizations associated with the patient." },
  { n: "03", label: "Update Status", body: "Users can update status such as approved or denied using a dropdown. Optional screenshot capture allows documentation of status changes." },
];

const SCALE_TIERS = [
  { label: "Unsupported", head: "Manual flow", desc: "Portal is accessible but Copilot has no automated capability. Users complete workflows manually.", tier: "unsupported" },
  { label: "Assisted",    head: "Partial support", desc: "Copilot provides partial support such as autofill or manual capture triggers to reduce effort.", tier: "assisted" },
  { label: "Fully Automated", head: "Full automation", desc: "End-to-end detection, extraction, screenshot, and save without user intervention.", tier: "automated" },
];

const SYSTEM_DEPTH_BULLETS = [
  "Enables multi-directional data flow between payer portals, SamaCare, and EHR",
  "Supports creating new patient records based on portal input",
  "Allows users to attach documents directly from EHR integrations without downloading",
  "Eliminates redundant data entry and file handling steps",
  "Maintains consistency across systems and reduces data drift",
];

const PAIN_POINTS = [
  "Repeated entry of patient and authorization data across multiple systems",
  "Constant switching between payer portals, EHR and SamaCare to complete tasks",
  "Manual screenshots required to capture submission and status for compliance",
  "Updating status requires navigating back to SamaCare and searching records",
  "High risk of errors such as incorrect data entry, missed updates or wrong info",
];

const OPPORTUNITY_BULLETS = [
  "Embed SamaCare capabilities directly into payer portals",
  "Capture data at the source rather than reconstructing it later",
  "Reduce context switching and enable real-time updates",
  "Introduce a new interaction model where the product extends beyond its own interface",
];

const COPILOT_CAPABILITIES = [
  { side: "cap", text: "Side panel" },
  { side: "cap", text: "Autofill" },
  { side: "cap", text: "Status update" },
  { side: "cap", text: "Notification" },
];

const COPILOT_WHY = [
  "Side panel enables in-context actions",
  "Detection + prompts reduce missed steps",
  "Designed for minimal disruption inside payer portals",
  "Runs inside payer portals without API access",
];

const IMPACT_OUTCOMES = [
  "Accelerated time to value by enabling use within existing workflows without full onboarding",
  "Reduced manual work and system switching significantly",
  "Improved data accuracy and reduced user errors",
  "Embedded into daily workflows for submission and status tracking",
  "Evolved into a prioritized product initiative with continued investment and expansion",
];

const NAV_SECTION_IDS = ["context", "insight", "problem", "solution", "workflows", "system", "impact"];
const NAV_LABELS = { context: "Context", insight: "Insight", problem: "Problem", solution: "Solution", workflows: "Workflows", system: "System", impact: "Impact" };

/* ─── component ─────────────────────────────────────────── */

export default function SamaCareCopilotCaseStudy({ onClose }) {
  const [scrolled, setScrolled]         = useState(false);
  const [activeSection, setActive]      = useState("context");
  const [lightbox, setLightbox]         = useState(null);   // src string or null
  const rootRef    = useRef(null);
  const metricRefs = useRef([]);
  const [metricCounted, setMetricCounted] = useState(false);

  /* ── scroll/active section ── */
  useEffect(() => {
    const el = rootRef.current; if (!el) return;
    const h = () => setScrolled(el.scrollTop > 48);
    el.addEventListener("scroll", h);
    return () => el.removeEventListener("scroll", h);
  }, []);

  useEffect(() => {
    const el = rootRef.current; if (!el) return;
    const update = () => {
      let cur = NAV_SECTION_IDS[0];
      for (const id of NAV_SECTION_IDS) {
        const s = el.querySelector(`#${id}`);
        if (s && s.getBoundingClientRect().top - el.getBoundingClientRect().top <= 140) cur = id;
      }
      setActive(cur);
    };
    update();
    el.addEventListener("scroll", update);
    return () => el.removeEventListener("scroll", update);
  }, []);

  /* ── reveal on scroll ── */
  useEffect(() => {
    const el = rootRef.current; if (!el) return;
    const obs = new IntersectionObserver(
      (entries) => entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("revealed"); obs.unobserve(e.target); } }),
      { threshold: 0.04, rootMargin: "0px 0px -20px 0px", root: el }
    );
    el.querySelectorAll(".reveal").forEach((n) => obs.observe(n));
    return () => obs.disconnect();
  }, []);

  /* ── metric count-up ── */
  useEffect(() => {
    if (metricCounted) return;
    const el = rootRef.current; if (!el) return;
    const targets = [
      { ref: metricRefs.current[0], end: 3000,  suffix: "+", fmt: (n) => n.toLocaleString() },
      { ref: metricRefs.current[1], end: 40,    suffix: "%", fmt: (n) => String(n) },
      { ref: metricRefs.current[2], end: 40000, suffix: "+", fmt: (n) => n.toLocaleString() },
    ];
    const obs = new IntersectionObserver((entries) => entries.forEach((e) => {
      if (!e.isIntersecting || metricCounted) return;
      setMetricCounted(true);
      targets.forEach(({ ref, end, suffix, fmt }) => {
        if (!ref) return;
        let cur = 0; const dur = 1400; const step = 16; const inc = end / (dur / step);
        const t = setInterval(() => { cur = Math.min(cur + inc, end); ref.textContent = fmt(Math.round(cur)) + suffix; if (cur >= end) clearInterval(t); }, step);
      });
    }), { threshold: 0.4, root: el });
    if (metricRefs.current[0]) obs.observe(metricRefs.current[0].closest(".cs-metrics"));
    return () => obs.disconnect();
  }, [metricCounted]);

  /* ── lightbox ESC ── */
  useEffect(() => {
    const handler = (e) => { if (e.key === "Escape") setLightbox(null); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  const openLightbox = useCallback((src) => setLightbox(src), []);
  const closeLightbox = useCallback(() => setLightbox(null), []);

  /* ─────────────────────────────────────────────────────── */

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Lora:ital,wght@0,500;0,600;0,700;1,400;1,500;1,600&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600;9..40,700;9..40,800&display=swap');

        /* ── ROOT ── */
        .cs-root { position:fixed; inset:0; z-index:50; overflow-y:auto; overflow-x:hidden; background:#fcfbfa; color:#1c1917; font-family:'DM Sans',ui-sans-serif,system-ui,sans-serif; -webkit-font-smoothing:antialiased; scroll-behavior:smooth; }
        .cs-root *, .cs-root *::before, .cs-root *::after { box-sizing:border-box; margin:0; padding:0; }

        /* ── NAV ── */
        .cs-nav { position:sticky; top:0; z-index:40; height:52px; padding:0 48px; display:flex; align-items:center; justify-content:space-between; background:rgba(252,251,250,.92); backdrop-filter:blur(20px); border-bottom:1px solid transparent; transition:border-color .25s; }
        .cs-nav.on { border-color:#e7e5e4; }
        .cs-nav-back { display:flex; align-items:center; gap:6px; font-size:13px; font-weight:500; color:#a8a29e; background:none; border:none; cursor:pointer; font-family:inherit; transition:color .15s; padding:0; }
        .cs-nav-back:hover { color:#1c1917; }
        .cs-nav-id { flex:1; min-width:0; text-align:center; font-size:12px; font-weight:600; color:#78716c; }
        .cs-nav-links { display:flex; gap:22px; list-style:none; }
        .cs-nav-links a { font-size:11.5px; font-weight:500; color:#a8a29e; text-decoration:none; transition:color .15s; }
        .cs-nav-links a:hover { color:#1c1917; }
        .cs-nav-links a.cs-nav-active { color:#1c1917; font-weight:600; }

        /* ── LAYOUT ── */
        .cs-wrap { max-width:880px; margin:0 auto; padding:0 48px; }

        /* ── HERO ── */
        .cs-hero { padding:80px 0 64px; position:relative; border-bottom:1px solid #e7e5e4; }
        .cs-hero-tex { position:absolute; top:0; bottom:0; left:50%; transform:translateX(-50%); width:100vw; z-index:0; opacity:.35; background-image:radial-gradient(circle,#c4b5a5 1px,transparent 1px); background-size:22px 22px; }
        .cs-hero-wash { position:absolute; top:0; bottom:0; left:50%; transform:translateX(-50%); width:100vw; z-index:1; pointer-events:none; background: radial-gradient(ellipse 65% 50% at 70% 0%,rgba(237,233,254,.88) 0%,transparent 60%), radial-gradient(ellipse 40% 35% at 0% 85%,rgba(220,252,231,.55) 0%,transparent 55%), linear-gradient(to bottom,rgba(252,251,250,0) 0%,rgba(252,251,250,.9) 100%); }
        .cs-hero .cs-wrap { position:relative; z-index:2; }

        .cs-tags { display:flex; gap:8px; flex-wrap:wrap; margin-bottom:28px; }
        .cs-pill { font-size:10px; font-weight:700; letter-spacing:.11em; text-transform:uppercase; padding:4px 11px; border-radius:100px; border:1px solid; white-space:nowrap; }
        .cs-pill-brand { color:#6d28d9; border-color:#c4b5fd; background:#f5f3ff; }
        .cs-pill-green { color:#16a34a; border-color:#86efac; background:#f0fdf4; }
        .cs-pill-stone { color:#78716c; border-color:#d6d3d1; background:#fff; }

        .cs-h1 { font-family:'Lora',Georgia,serif; font-size:clamp(42px,6vw,72px); font-weight:700; line-height:1.03; letter-spacing:-.025em; color:#0c0a09; }
        .cs-h1 em { font-style:italic; color:#6d28d9; }
        .cs-h1-word { display:inline-block; opacity:0; transform:translateY(18px); animation:wordUp .55s ease forwards; }
        @keyframes wordUp { to { opacity:1; transform:translateY(0); } }

        .cs-h1-sub { font-size:clamp(15px,2vw,18px); font-weight:300; color:#a8a29e; letter-spacing:-.005em; margin-top:28px; margin-bottom:22px; opacity:0; animation:wordUp .55s .5s ease forwards; }
        .cs-hero-gif { width:100%; height:auto; border-radius:12px; margin-bottom:32px; display:block; box-shadow:0 2px 12px rgba(0,0,0,.06); border:1px solid #e7e5e4; opacity:0; animation:wordUp .55s .58s ease forwards; }
        .cs-hero-lead { font-size:16px; line-height:1.8; color:#57534e; max-width:800px; margin-bottom:48px; font-weight:400; opacity:0; animation:wordUp .55s .65s ease forwards; }
        .cs-hero-lead strong { color:#1c1917; font-weight:600; }

        .cs-meta { display:grid; grid-template-columns:repeat(4,1fr); background:#fff; border:1px solid #e7e5e4; border-radius:12px; overflow:hidden; box-shadow:0 1px 4px rgba(0,0,0,.04); opacity:0; animation:wordUp .55s .8s ease forwards; }
        .cs-meta-cell { padding:15px 20px; border-right:1px solid #e7e5e4; }
        .cs-meta-cell:last-child { border-right:none; }
        .cs-meta-k { font-size:9px; font-weight:700; letter-spacing:.14em; text-transform:uppercase; color:#a8a29e; margin-bottom:4px; }
        .cs-meta-v { font-size:13px; font-weight:600; color:#1c1917; line-height:1.35; }

        /* ── SECTIONS ── */
        .cs-sec { padding:72px 0; border-bottom:1px solid #e7e5e4; }
        .cs-sec:last-of-type { border-bottom:none; }
        .cs-kicker { display:inline-flex; align-items:center; gap:10px; font-size:10px; font-weight:700; letter-spacing:.14em; text-transform:uppercase; color:#a8a29e; margin-bottom:14px; }
        .cs-kicker-dot { width:6px; height:6px; border-radius:50%; background:#d6d3d1; flex-shrink:0; }
        .cs-sh { font-family:'Lora',Georgia,serif; font-size:clamp(28px,4vw,42px); font-weight:700; line-height:1.08; letter-spacing:-.022em; color:#0c0a09; margin-bottom:18px; }
        .cs-sh em { font-style:italic; color:#6d28d9; }
        .cs-p { font-size:15px; line-height:1.85; color:#57534e; max-width:800px; }
        .cs-p + .cs-p { margin-top:16px; }
        .cs-p strong { color:#1c1917; font-weight:600; }

        /* ── CALLOUT ── */
        .cs-callout { margin:36px 0; padding:28px 32px 24px; background:linear-gradient(140deg,#f5f3ff,#faf5ff); border:1px solid #ddd6fe; border-radius:14px; position:relative; overflow:hidden; }
        .cs-callout::after { content:''; position:absolute; inset:0; border-radius:14px; pointer-events:none; opacity:.03; background-image:url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E"); background-size:160px; }
        .cs-callout-mark { position:absolute; top:-16px; left:20px; font-family:'Lora',serif; font-size:96px; font-weight:700; color:#ede9fe; line-height:1; user-select:none; pointer-events:none; }
        .cs-callout-text { font-family:'Lora',Georgia,serif; font-size:18px; font-style:italic; font-weight:500; line-height:1.65; color:#5b21b6; position:relative; z-index:1; max-width:680px; }
        .cs-callout-label { display:block; margin-top:12px; font-size:10px; font-weight:700; letter-spacing:.12em; text-transform:uppercase; color:#c4b5fd; position:relative; z-index:1; }

        /* ── DIFF ── */
        .cs-diff { margin-top:32px; border-radius:12px; overflow:hidden; border:1px solid #e7e5e4; background:#fff; box-shadow:0 1px 6px rgba(0,0,0,.04); }
        .cs-diff-head { padding:11px 20px; background:#fcfbfa; border-bottom:1px solid #e7e5e4; font-size:10px; font-weight:700; letter-spacing:.12em; text-transform:uppercase; color:#a8a29e; }
        .cs-diff-row { display:grid; grid-template-columns:96px 1fr; gap:16px; padding:18px 20px; align-items:start; border-bottom:1px solid #f5f5f4; }
        .cs-diff-row:last-child { border-bottom:none; }
        .cs-diff-badge { font-size:9.5px; font-weight:700; letter-spacing:.07em; text-transform:uppercase; padding:4px 0; border-radius:5px; text-align:center; margin-top:2px; }
        .cs-diff-badge.before { background:#fee2e2; color:#dc2626; }
        .cs-diff-badge.after  { background:#dcfce7; color:#16a34a; }
        .cs-diff-body { font-size:14px; line-height:1.75; color:#44403c; }
        .cs-diff-body strong { color:#15803d; font-weight:600; }

        /* ── SPLIT LAYOUT ── */
        .cs-split { display:grid; grid-template-columns:1fr minmax(260px,420px); gap:40px; align-items:start; margin-top:32px; }
        .cs-split-img { position:sticky; top:80px; }
        .cs-split-img img { width:100%; height:auto; border-radius:12px; border:1px solid #e7e5e4; box-shadow:0 6px 28px rgba(28,25,23,.08); display:block; }
        .cs-split.is-rev { grid-template-columns:minmax(260px,420px) 1fr; }
        .cs-split.is-rev .cs-split-img { grid-column:1; grid-row:1; }
        .cs-split.is-rev .cs-split-copy { grid-column:2; grid-row:1; }

        /* ── PHOTO (no lightbox) ── */
        .cs-photo { width:100%; height:auto; border-radius:12px; border:1px solid #e7e5e4; box-shadow:0 6px 28px rgba(28,25,23,.08); display:block; }

        /* ── UI SCREENSHOT (lightbox-enabled) ── */
        .cs-ui-img {
          display:block; width:100%; height:auto; border-radius:12px;
          border:1px solid #e7e5e4; box-shadow:0 4px 20px rgba(0,0,0,.08);
          cursor:zoom-in; transition:box-shadow .2s, transform .2s;
          position:relative;
        }
        .cs-ui-img:hover { box-shadow:0 8px 36px rgba(109,40,217,.14); transform:translateY(-1px); }
        .cs-ui-wrap { position:relative; display:block; }
        .cs-ui-wrap::after {
          content:'⤢';
          position:absolute; top:10px; right:10px;
          width:28px; height:28px; border-radius:6px;
          background:rgba(255,255,255,.9); backdrop-filter:blur(6px);
          border:1px solid rgba(0,0,0,.08);
          display:flex; align-items:center; justify-content:center;
          font-size:13px; color:#44403c; pointer-events:none;
          opacity:0; transition:opacity .2s;
          display:flex; align-items:center; justify-content:center;
          line-height:1;
        }
        .cs-ui-wrap:hover::after { opacity:1; }

        /* ── LIGHTBOX ── */
        .cs-lightbox {
          position:fixed; inset:0; z-index:200;
          background:rgba(12,10,9,.82); backdrop-filter:blur(10px);
          display:flex; align-items:center; justify-content:center;
          padding:24px; cursor:zoom-out;
          animation:lbFade .18s ease;
        }
        @keyframes lbFade { from { opacity:0; } to { opacity:1; } }
        .cs-lightbox-inner {
          position:relative; max-width:min(1200px, 94vw); max-height:90vh;
          cursor:default;
          animation:lbScale .18s ease;
        }
        @keyframes lbScale { from { transform:scale(.96); opacity:0; } to { transform:scale(1); opacity:1; } }
        .cs-lightbox-inner img {
          display:block; width:100%; height:auto; max-height:90vh;
          object-fit:contain; border-radius:10px;
          box-shadow:0 24px 80px rgba(0,0,0,.6);
        }
        .cs-lightbox-close {
          position:absolute; top:-14px; right:-14px;
          width:32px; height:32px; border-radius:50%;
          background:#fff; border:1px solid #e7e5e4;
          font-size:18px; line-height:1; cursor:pointer;
          display:flex; align-items:center; justify-content:center;
          box-shadow:0 2px 8px rgba(0,0,0,.12);
          color:#57534e; transition:color .15s;
          font-family:system-ui; padding-bottom:1px;
        }
        .cs-lightbox-close:hover { color:#0c0a09; }

        /* ── FULL-WIDTH IMAGE BLOCK ── */
        .cs-img-full {
          margin-top:28px; border-radius:14px; overflow:hidden;
          border:1px solid #e7e5e4;
          box-shadow:0 4px 24px rgba(0,0,0,.07);
        }
        .cs-img-full img { width:100%; height:auto; display:block; }

        /* ── PAIN LIST ── */
        .cs-pain-list { list-style:none; margin-top:28px; }
        .cs-pain-item { display:flex; align-items:flex-start; gap:12px; padding:13px 0; border-bottom:1px solid #f5f5f4; font-size:14px; line-height:1.7; color:#44403c; }
        .cs-pain-item:last-child { border-bottom:none; }
        .cs-pain-dot { width:6px; height:6px; border-radius:50%; background:#dc2626; flex-shrink:0; margin-top:7px; }

        /* ── SOLUTION CARDS ── */
        .cs-sol-grid { display:grid; grid-template-columns:1fr 1fr; gap:10px; margin-top:28px; }
        .cs-sol-card { display:flex; gap:14px; align-items:flex-start; padding:18px 20px; border:1px solid #e7e5e4; border-radius:12px; background:#fff; box-shadow:0 1px 3px rgba(0,0,0,.04); }
        .cs-sol-card-icon { width:40px; height:40px; flex-shrink:0; border-radius:10px; background:#f5f3ff; border:1px solid #ddd6fe; display:flex; align-items:center; justify-content:center; font-size:18px; }
        .cs-sol-card-t { font-size:14px; font-weight:700; color:#1c1917; margin-bottom:4px; }
        .cs-sol-card-p { font-size:13px; line-height:1.65; color:#57534e; margin:0; }
        .cs-sol-footnote { margin-top:14px; padding:12px 16px; border-radius:10px; background:linear-gradient(135deg,#eef2ff,#f5f3ff); border:1px solid #c4b5fd; font-size:13px; line-height:1.6; color:#4338ca; font-weight:600; display:flex; gap:10px; align-items:flex-start; }

        /* ── RELIABILITY ── */
        .cs-reliability { margin-top:40px; border-radius:14px; overflow:hidden; border:1px solid #e7e5e4; background:#fff; box-shadow:0 2px 12px rgba(0,0,0,.04); }
        .cs-reliability-head { padding:14px 24px; background:#fcfbfa; border-bottom:1px solid #e7e5e4; font-size:10px; font-weight:700; letter-spacing:.12em; text-transform:uppercase; color:#a8a29e; }
        .cs-reliability-body { display:grid; grid-template-columns:1fr 1fr; }
        .cs-reliability-col { padding:24px 28px; }
        .cs-reliability-col:first-child { border-right:1px solid #e7e5e4; }
        .cs-rel-label { font-size:10px; font-weight:700; letter-spacing:.12em; text-transform:uppercase; margin-bottom:8px; }
        .cs-rel-label.supported { color:#16a34a; }
        .cs-rel-label.fallback   { color:#d97706; }
        .cs-rel-h { font-family:'Lora',serif; font-size:16px; font-weight:600; color:#0c0a09; margin-bottom:10px; line-height:1.35; }
        .cs-rel-p { font-size:13px; line-height:1.75; color:#57534e; }

        /* ── WORKFLOW STEPS ── */
        .cs-wf-label { font-size:11px; font-weight:700; letter-spacing:.12em; text-transform:uppercase; color:#6d28d9; margin-bottom:18px; display:flex; align-items:center; gap:10px; }
        .cs-wf-label::after { content:''; flex:1; height:1px; background:#e7e5e4; }
        .cs-wf-steps { display:grid; grid-template-columns:repeat(4,1fr); gap:12px; }
        .cs-wf-steps.three { grid-template-columns:repeat(3,1fr); }
        .cs-wf-step { background:#fff; border:1px solid #e7e5e4; border-radius:12px; padding:20px 18px; transition:border-color .2s, box-shadow .2s; }
        .cs-wf-step:hover { border-color:#c4b5fd; box-shadow:0 4px 16px rgba(109,40,217,.07); }
        .cs-wf-step-n { font-size:9px; font-weight:700; letter-spacing:.12em; text-transform:uppercase; color:#a8a29e; margin-bottom:8px; }
        .cs-wf-step-label { font-family:'Lora',serif; font-size:15px; font-weight:600; color:#0c0a09; margin-bottom:8px; line-height:1.3; }
        .cs-wf-step-body { font-size:12.5px; line-height:1.7; color:#57534e; }
        .cs-wf-note { margin-top:16px; padding:12px 16px; background:#f0fdf4; border:1px solid #86efac; border-radius:10px; font-size:13px; color:#15803d; font-weight:600; line-height:1.6; }

        /* ── SYSTEM ── */
        .cs-system-bullets { list-style:none; }
        .cs-system-bullet { display:flex; align-items:flex-start; gap:12px; padding:13px 0; border-bottom:1px solid #f5f5f4; font-size:14px; line-height:1.7; color:#44403c; }
        .cs-system-bullet:last-child { border-bottom:none; }
        .cs-system-dot { width:6px; height:6px; border-radius:50%; background:#6d28d9; flex-shrink:0; margin-top:7px; }

        /* ── TIER GRID ── */
        .cs-tier-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:12px; margin-top:28px; }
        .cs-tier { border-radius:12px; padding:24px; border:1px solid; transition:transform .2s, box-shadow .2s; }
        .cs-tier:hover { transform:translateY(-2px); box-shadow:0 6px 24px rgba(0,0,0,.08); }
        .cs-tier.unsupported { background:#fafaf9; border-color:#e7e5e4; }
        .cs-tier.assisted    { background:#fffbeb; border-color:#fde68a; }
        .cs-tier.automated   { background:#f0fdf4; border-color:#86efac; }
        .cs-tier-label { font-size:10px; font-weight:700; letter-spacing:.12em; text-transform:uppercase; margin-bottom:8px; }
        .cs-tier.unsupported .cs-tier-label { color:#78716c; }
        .cs-tier.assisted    .cs-tier-label { color:#92400e; }
        .cs-tier.automated   .cs-tier-label { color:#15803d; }
        .cs-tier-h { font-family:'Lora',serif; font-size:16px; font-weight:600; color:#0c0a09; margin-bottom:8px; line-height:1.3; }
        .cs-tier-p { font-size:13px; line-height:1.7; color:#57534e; }

        /* ── INSIGHT CARDS ── */
        .cs-insight-row { display:grid; grid-template-columns:1fr 1fr; gap:16px; margin-top:28px; }
        .cs-insight-card { border-radius:12px; padding:22px 24px; border:1px solid; }
        .cs-insight-card.blind { background:#fffbeb; border-color:#fde68a; }
        .cs-insight-card.field { background:#f0fdf4; border-color:#86efac; }
        .cs-insight-label { font-size:9.5px; font-weight:700; letter-spacing:.12em; text-transform:uppercase; margin-bottom:10px; }
        .cs-insight-card.blind .cs-insight-label { color:#92400e; }
        .cs-insight-card.field .cs-insight-label { color:#15803d; }
        .cs-insight-h { font-family:'Lora',serif; font-size:15px; font-weight:600; color:#0c0a09; margin-bottom:8px; line-height:1.35; }
        .cs-insight-p { font-size:13px; line-height:1.7; color:#57534e; }

        /* ── METRICS ── */
        .cs-metrics { display:grid; grid-template-columns:repeat(3,1fr); border:1px solid #e7e5e4; border-radius:14px; overflow:hidden; margin-top:36px; background:#fff; box-shadow:0 2px 12px rgba(0,0,0,.04); }
        .cs-metric { padding:32px 26px; border-right:1px solid #e7e5e4; position:relative; overflow:hidden; }
        .cs-metric:last-child { border-right:none; }
        .cs-metric::before { content:''; position:absolute; inset:0; pointer-events:none; background-image:repeating-linear-gradient(-45deg,transparent,transparent 5px,rgba(0,0,0,.018) 5px,rgba(0,0,0,.018) 6px); }
        .cs-metric-num { font-family:'Lora',serif; font-size:clamp(28px,4vw,44px); font-weight:700; line-height:1.1; letter-spacing:-.02em; margin-bottom:8px; position:relative; z-index:1; }
        .cs-metric-num.violet { color:#6d28d9; }
        .cs-metric-num.green  { color:#16a34a; }
        .cs-metric-num.amber  { color:#d97706; }
        .cs-metric-lbl { font-size:13px; font-weight:700; color:#1c1917; margin-bottom:4px; position:relative; z-index:1; }
        .cs-metric-sub { font-size:11px; font-weight:500; color:#a8a29e; letter-spacing:.06em; text-transform:uppercase; position:relative; z-index:1; }

        /* ── IMPACT ── */
        .cs-impact-grid { display:grid; grid-template-columns:3fr 2fr; gap:16px; margin-top:20px; align-items:start; }
        .cs-outcome-card { background:#fff; border:1px solid #e7e5e4; border-radius:12px; padding:24px; }
        .cs-outcome-head { font-size:10px; font-weight:700; letter-spacing:.12em; text-transform:uppercase; color:#a8a29e; margin-bottom:14px; padding-bottom:12px; border-bottom:1px solid #f5f5f4; }
        .cs-outcome-row { display:grid; grid-template-columns:16px 1fr; gap:12px; padding:13px 0; border-bottom:1px solid #f5f5f4; align-items:start; }
        .cs-outcome-row:last-child { border-bottom:none; padding-bottom:0; }
        .cs-outcome-dot { width:6px; height:6px; border-radius:50%; background:#7c3aed; margin-top:6px; }
        .cs-outcome-h { font-size:13px; font-weight:600; color:#1c1917; margin-bottom:2px; }
        .cs-outcome-p { font-size:12.5px; line-height:1.7; color:#78716c; }
        .cs-stat-col { display:flex; flex-direction:column; gap:12px; }
        .cs-stat-hero { background:linear-gradient(140deg,#f5f3ff,#ede9fe); border:1px solid #c4b5fd; border-radius:12px; padding:24px; position:relative; overflow:hidden; }
        .cs-stat-hero::before { content:''; position:absolute; inset:0; border-radius:12px; pointer-events:none; background-image:repeating-linear-gradient(-45deg,transparent,transparent 5px,rgba(109,40,217,.04) 5px,rgba(109,40,217,.04) 6px); }
        .cs-stat-hero-n { font-family:'Lora',serif; font-size:42px; font-weight:700; letter-spacing:-.035em; color:#6d28d9; line-height:1; margin-bottom:6px; position:relative; z-index:1; }
        .cs-stat-hero-l { font-size:13px; font-weight:700; color:#1c1917; margin-bottom:4px; position:relative; z-index:1; }
        .cs-stat-hero-s { font-size:12.5px; line-height:1.65; color:#78716c; position:relative; z-index:1; }
        .cs-stat-next { background:#fff; border:1px solid #e7e5e4; border-radius:12px; padding:20px; }
        .cs-stat-next-k { font-size:9.5px; font-weight:700; letter-spacing:.12em; text-transform:uppercase; color:#a8a29e; margin-bottom:8px; }
        .cs-stat-next-p { font-size:13px; line-height:1.7; color:#57534e; }
        .cs-stat-next-p strong { color:#1c1917; font-weight:600; }

        /* ── FOOTER ── */
        .cs-foot { max-width:880px; margin:0 auto; padding:40px 48px 72px; display:flex; align-items:center; justify-content:space-between; }
        .cs-foot-back { display:flex; align-items:center; gap:7px; font-size:13px; font-weight:500; color:#a8a29e; background:none; border:none; cursor:pointer; font-family:inherit; transition:color .15s; padding:0; }
        .cs-foot-back:hover { color:#1c1917; }
        .cs-foot-sig { font-size:12px; color:#c4b5a5; }

        /* ── REVEAL ── */
        .reveal { opacity:0; transform:translateY(20px); transition:opacity .5s ease,transform .5s ease; }
        .reveal.s1 { transition-delay:.06s; }
        .reveal.s2 { transition-delay:.12s; }
        .reveal.s3 { transition-delay:.18s; }
        .reveal.s4 { transition-delay:.24s; }
        .revealed { opacity:1; transform:translateY(0); }

        /* ── RESPONSIVE ── */
        @media (max-width:960px) {
          .cs-split, .cs-split.is-rev { grid-template-columns:1fr; }
          .cs-split-img, .cs-split.is-rev .cs-split-img { position:relative; top:0; grid-column:1; grid-row:auto; }
          .cs-split.is-rev .cs-split-copy { grid-column:1; grid-row:auto; }
          .cs-wf-steps { grid-template-columns:1fr 1fr; }
          .cs-wf-steps.three { grid-template-columns:1fr 1fr; }
          .cs-insight-row { grid-template-columns:1fr; }
          .cs-sol-grid { grid-template-columns:1fr; }
          .cs-impact-grid { grid-template-columns:1fr; }
        }
        @media (max-width:700px) {
          .cs-nav { padding:0 20px; }
          .cs-nav-links { display:none; }
          .cs-wrap { padding:0 20px; }
          .cs-hero { padding:48px 0; }
          .cs-meta { grid-template-columns:1fr 1fr; }
          .cs-meta-cell:nth-child(2n) { border-right:none; }
          .cs-meta-cell:nth-child(n+3) { border-top:1px solid #e7e5e4; }
          .cs-tier-grid { grid-template-columns:1fr; }
          .cs-wf-steps, .cs-wf-steps.three { grid-template-columns:1fr; }
          .cs-reliability-body { grid-template-columns:1fr; }
          .cs-reliability-col:first-child { border-right:none; border-bottom:1px solid #e7e5e4; }
          .cs-metrics { grid-template-columns:1fr; }
          .cs-metric { border-right:none; border-bottom:1px solid #e7e5e4; }
          .cs-metric:last-child { border-bottom:none; }
          .cs-foot { flex-direction:column; gap:14px; align-items:flex-start; padding:32px 20px 56px; }
        }
      `}</style>

      {/* ── LIGHTBOX ── */}
      {lightbox && (
        <div className="cs-lightbox" onClick={closeLightbox}>
          <div className="cs-lightbox-inner" onClick={(e) => e.stopPropagation()}>
            <button className="cs-lightbox-close" onClick={closeLightbox} aria-label="Close">×</button>
            <img src={lightbox} alt="Enlarged view" />
          </div>
        </div>
      )}

      <div className="cs-root" ref={rootRef}>

        {/* ── NAV ── */}
        <nav className={`cs-nav${scrolled ? " on" : ""}`}>
          <button className="cs-nav-back" type="button" onClick={onClose}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.7">
              <path d="M10 12.5L5.5 8 10 3.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Projects
          </button>
          <span className="cs-nav-id">SamaCare · CoPilot</span>
          <ul className="cs-nav-links">
            {NAV_SECTION_IDS.map((id) => (
              <li key={id}>
                <a href={`#${id}`} className={activeSection === id ? "cs-nav-active" : ""}>{NAV_LABELS[id]}</a>
              </li>
            ))}
          </ul>
        </nav>

        {/* ── HERO ── */}
        <header className="cs-hero">
          <div className="cs-hero-tex"/>
          <div className="cs-hero-wash"/>
          <div className="cs-wrap">
            <div className="cs-tags" style={{ marginBottom: 28 }}>
              <span className="cs-pill cs-pill-green">0 to 1 design</span>
              <span className="cs-pill cs-pill-brand">Chrome extension</span>
              <span className="cs-pill cs-pill-stone">Healthcare SaaS</span>
            </div>
            <h1 className="cs-h1">
              {"Bring portal work".split(" ").map((w, i) => (
                <span key={w+i} className="cs-h1-word" style={{ animationDelay:`${i*0.1}s`, marginRight:"0.22em" }}>{w}</span>
              ))}
              <br/>
              <em className="cs-h1-word" style={{ animationDelay:"0.4s" }}>home to SamaCare</em>
            </h1>
            <p className="cs-h1-sub">SamaCare CoPilot</p>
            <img
              className="cs-hero-gif"
              src="/Projects/SamaCare/Copilot/deck_09.gif"
              alt="SamaCare CoPilot workflow animation"
            />
            <p className="cs-hero-lead">
              Prior authorization teams live inside payer portals all day — but SamaCare, the system of record, lived somewhere else. <strong>CoPilot is the Chrome extension that closes that gap</strong>, letting staff capture submissions, check status, and sync records without ever leaving the site where the work happens.
            </p>
            <div className="cs-meta">
              {[["Role","Sole Staff Product Designer"],["Scope","Discovery, concept, validation, launch"],["Timeline","~6 months"],["Collaboration","Engineering and product"]].map(([k,v])=>(
                <div className="cs-meta-cell" key={k}>
                  <div className="cs-meta-k">{k}</div>
                  <div className="cs-meta-v">{v}</div>
                </div>
              ))}
            </div>
          </div>
        </header>

        <div className="cs-wrap">

          {/* ── 01 CONTEXT ── */}
          <section className="cs-sec" id="context">
            <div className="cs-kicker reveal"><span className="cs-kicker-dot"/>01 · Context</div>
            <div className="cs-split reveal">
              <div className="cs-split-copy">
                <h2 className="cs-sh">The workflow<br/><em>landscape</em></h2>
                <p className="cs-p">SamaCare is a prior authorization management platform used by practice admins. It serves as the system of record for tracking authorization status and supporting billing workflows. Practice admins must interact with multiple payer portals to submit and check authorization status. Patient data originates from EHR systems, which introduces another system dependency.</p>
                <p className="cs-p" style={{ marginTop: 16 }}>This creates a workflow that spans EHR, payer portals, and SamaCare.</p>
                <div style={{ marginTop: 28, display: "grid", gridTemplateColumns: "1fr auto 1fr auto 1fr", gap: "0", alignItems: "center" }}>
                  {[
                    { k: "EHR", sub: "Patient data", bg: "#f5f3ff", border: "#c4b5fd", kc: "#7c3aed" },
                    { k: "SamaCare", sub: "Manage Prior Authorization", bg: "#ede9fe", border: "#a78bfa", kc: "#6d28d9" },
                    { k: "Payer Portal", sub: "Submit, Check Status, Follow-up", bg: "#fafaf9", border: "#e7e5e4", kc: "#a8a29e" },
                  ].map((node, i) => (
                    <React.Fragment key={node.k}>
                      <div style={{ background: node.bg, border: `1px solid ${node.border}`, borderRadius: 10, padding: "14px 12px", textAlign: "center" }}>
                        <div style={{ fontSize: 13, fontWeight: 700, color: "#0c0a09", lineHeight: 1.3, marginBottom: 4 }}>{node.k}</div>
                        <div style={{ fontSize: 11, color: "#78716c", lineHeight: 1.4 }}>{node.sub}</div>
                      </div>
                      {i < 2 && <div style={{ textAlign: "center", color: "#c4b5a5", fontSize: 18, fontWeight: 300, padding: "0 4px" }}>→</div>}
                    </React.Fragment>
                  ))}
                </div>
                <p className="cs-p" style={{ marginTop: 16, fontSize: 13, color: "#a8a29e", fontStyle: "italic" }}>Prior authorization is a multi-system operational workflow</p>
              </div>
              <div className="cs-split-img">
                <img
                  className="cs-photo"
                  src="/Projects/SamaCare/Copilot/deck_03.avif"
                  alt="Healthcare operations context"
                  loading="lazy"
                />
              </div>
            </div>
          </section>

          {/* ── 02 INSIGHT ── */}
          <section className="cs-sec" id="insight">
            <div className="cs-kicker reveal"><span className="cs-kicker-dot"/>02 · Key Insight</div>
            <h2 className="cs-sh reveal">Where the work<br/><em>actually happens</em></h2>

            <div className="cs-insight-row reveal">
              <div className="cs-insight-card blind">
                <div className="cs-insight-label">SamaCare was a tracking tool, not where work happens</div>
                <div className="cs-insight-h">Users relied on SamaCare to track, not to complete work</div>
                <p className="cs-insight-p">Most critical actions happen outside SamaCare. Submission and status checks happen inside payer portals, not just SamaCare.</p>
              </div>
              <div className="cs-insight-card field">
                <div className="cs-insight-label">Insight discovered through field research, not analytics</div>
                <div className="cs-insight-h">Analytics had a blind spot</div>
                <p className="cs-insight-p">In-product analytic metrics did not capture this behavior. On-site observation showed constant switching across systems.</p>
              </div>
            </div>

            {/* SamaCare UI before CoPilot */}
            <div className="cs-img-full reveal" style={{ marginTop: 32 }}>
              <button className="cs-ui-wrap" style={{ all: "unset", display: "block", cursor: "zoom-in", width: "100%" }} onClick={() => openLightbox("/Projects/SamaCare/Copilot/deck_01.avif")} aria-label="View SamaCare patient interface">
                <img className="cs-ui-img" src="/Projects/SamaCare/Copilot/deck_01.avif" alt="SamaCare patient view — the tracking interface before CoPilot" loading="lazy" style={{ borderRadius: 12 }}/>
              </button>
              <div style={{ padding: "10px 16px", background: "#fcfbfa", borderTop: "1px solid #e7e5e4", fontSize: 11.5, color: "#a8a29e", fontWeight: 500 }}>SamaCare — the system of record that lived separately from where work happened</div>
            </div>
          </section>

          {/* ── 03 PROBLEM ── */}
          <section className="cs-sec" id="problem">
            <div className="cs-kicker reveal"><span className="cs-kicker-dot"/>03 · Problem</div>
            <h2 className="cs-sh reveal">Fragmented and manual<br/><em>workflows</em></h2>
            <p className="cs-p reveal">Core work happens across disconnected systems. The copy → switch → upload loop repeated dozens of times per day creates compounding inefficiency and error risk. Compliance requirements require proof of submission and status.</p>

            <ul className="cs-pain-list reveal">
              {PAIN_POINTS.map((pt) => (
                <li key={pt} className="cs-pain-item">
                  <span className="cs-pain-dot"/>
                  {pt}
                </li>
              ))}
            </ul>

            <div className="cs-diff reveal">
              <div className="cs-diff-head">Opportunity — shift the product boundary</div>
              <div className="cs-diff-row">
                <span className="cs-diff-badge before">The old approach</span>
                <span className="cs-diff-body">Improving SamaCare's internal UI would not address the core workflow problem. Users still had to leave the portal, navigate to SamaCare, and manually reconstruct context.</span>
              </div>
              <div className="cs-diff-row">
                <span className="cs-diff-badge after">Bridging the gap</span>
                <div className="cs-diff-body">
                  <p style={{ marginBottom: 10, color: "#15803d", fontWeight: 600 }}>Meet users where they already work. The problem is not the UI, it is where the product exists.</p>
                  <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: 6 }}>
                    {OPPORTUNITY_BULLETS.map((b) => (
                      <li key={b} style={{ display: "flex", gap: 8, alignItems: "flex-start", fontSize: 13.5, lineHeight: 1.65, color: "#44403c" }}>
                        <span style={{ color: "#16a34a", marginTop: 1, flexShrink: 0 }}>→</span>
                        {b}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </section>

          {/* ── 04 SOLUTION ── */}
          <section className="cs-sec" id="solution">
            <div className="cs-kicker reveal"><span className="cs-kicker-dot"/>04 · Solution</div>
            <h2 className="cs-sh reveal">SamaCare Copilot</h2>
            <p className="cs-p reveal">A browser-based integration layer.</p>

            {/* Feature cards + panel screenshot */}
            <div className="cs-sol-grid reveal">
              {SOLUTION_FEATURES.map((f) => (
                <div key={f.title} className="cs-sol-card">
                  <div className="cs-sol-card-icon" aria-hidden>{f.icon}</div>
                  <div>
                    <div className="cs-sol-card-t">{f.title}</div>
                    <p className="cs-sol-card-p">{f.body}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="cs-sol-footnote reveal" style={{ marginTop: 14 }}>
              <span aria-hidden>📄</span>
              <span>Designed without direct API access to payer portals.</span>
            </div>

            {/* Extension panel screenshot — full width, clickable */}
            <div className="cs-img-full reveal" style={{ marginTop: 36 }}>
              <button className="cs-ui-wrap" style={{ all: "unset", display: "block", cursor: "zoom-in", width: "100%" }} onClick={() => openLightbox("/Projects/SamaCare/Copilot/solution-copilot-panel.png")} aria-label="View CoPilot panel">
                <img className="cs-ui-img" src="/Projects/SamaCare/Copilot/solution-copilot-panel.png" alt="SamaCare CoPilot extension panel" loading="lazy" style={{ borderRadius: 12 }}/>
              </button>
              <div style={{ padding: "10px 16px", background: "#fcfbfa", borderTop: "1px solid #e7e5e4", fontSize: 11.5, color: "#a8a29e", fontWeight: 500 }}>The CoPilot panel — lives alongside the payer portal in the browser sidebar</div>
            </div>

            {/* Reliability */}
            <div className="cs-reliability reveal">
              <div className="cs-reliability-head">Designing for real-world variability · Automation cannot cover all cases</div>
              <div className="cs-reliability-body">
                <div className="cs-reliability-col">
                  <div className="cs-rel-label supported">Supported Portals</div>
                  <div className="cs-rel-h">Automatic Detection</div>
                  <p className="cs-rel-p">Works well for supported portals. Copilot detects confirmation states, extracts structured data, and captures screenshots without user intervention.</p>
                </div>
                <div className="cs-reliability-col">
                  <div className="cs-rel-label fallback">All Other Portals</div>
                  <div className="cs-rel-h">Manual Fallback Flow</div>
                  <p className="cs-rel-p">Designed a manual fallback flow that allows users to trigger capture and save actions. Ensures that users can always complete their workflow regardless of portal support. Avoids failure states where users are blocked or forced to revert to manual processes.</p>
                </div>
              </div>
              <div style={{ padding: "12px 24px", borderTop: "1px solid #e7e5e4", fontSize: 12, color: "#a8a29e", fontStyle: "italic" }}>
                Payer portals vary widely in structure, behavior, and consistency. Designed for non-deterministic environments.
              </div>
            </div>
          </section>

          {/* ── 05 WORKFLOWS ── */}
          <section className="cs-sec" id="workflows">
            <div className="cs-kicker reveal"><span className="cs-kicker-dot"/>05 · Workflows</div>
            <h2 className="cs-sh reveal">Supporting submission and status<br/><em>directly within payer portals</em></h2>

            {/* Submission */}
            <div style={{ marginTop: 8 }} className="reveal">
              <div className="cs-wf-label">Submission Workflow · From manual entry to automated capture</div>
              <div className="cs-wf-steps">
                {SUBMISSION_STEPS.map((s) => (
                  <div key={s.n} className="cs-wf-step">
                    <div className="cs-wf-step-n">{s.n}</div>
                    <div className="cs-wf-step-label">{s.label}</div>
                    <div className="cs-wf-step-body">{s.body}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="cs-img-full reveal">
              <button className="cs-ui-wrap" style={{ all: "unset", display: "block", cursor: "zoom-in", width: "100%" }} onClick={() => openLightbox("/Projects/SamaCare/Copilot/deck_05.avif")} aria-label="View submission workflow designs">
                <img className="cs-ui-img" src="/Projects/SamaCare/Copilot/deck_05.avif" alt="Submission workflow designs" loading="lazy" style={{ borderRadius: "12px 12px 0 0" }}/>
              </button>
              <div style={{ padding: "10px 16px", background: "#fcfbfa", borderTop: "1px solid #e7e5e4", fontSize: 11.5, color: "#a8a29e", fontWeight: 500 }}>Submission flow — patient search, autofill, confirmation detection, and save to SamaCare</div>
            </div>

            {/* Status */}
            <div style={{ marginTop: 56 }} className="reveal">
              <div className="cs-wf-label">Status Workflow · Updating without switching · Keep users in the same context</div>
              <div className="cs-wf-steps three">
                {STATUS_STEPS.map((s) => (
                  <div key={s.n} className="cs-wf-step">
                    <div className="cs-wf-step-n">{s.n}</div>
                    <div className="cs-wf-step-label">{s.label}</div>
                    <div className="cs-wf-step-body">{s.body}</div>
                  </div>
                ))}
              </div>
              <div style={{ marginTop: 12, padding: "16px 20px", background: "#f5f3ff", border: "1px solid #ddd6fe", borderRadius: 10 }}>
                <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: ".12em", textTransform: "uppercase", color: "#7c3aed", marginBottom: 6 }}>No Return Trip Required</div>
                <p style={{ fontSize: 13.5, lineHeight: 1.7, color: "#44403c", margin: 0 }}>Eliminates the need to return to SamaCare and manually update records.</p>
              </div>
            </div>

            <div className="cs-img-full reveal">
              <button className="cs-ui-wrap" style={{ all: "unset", display: "block", cursor: "zoom-in", width: "100%" }} onClick={() => openLightbox("/Projects/SamaCare/Copilot/deck_06.avif")} aria-label="View status workflow designs">
                <img className="cs-ui-img" src="/Projects/SamaCare/Copilot/deck_06.avif" alt="Status workflow designs" loading="lazy" style={{ borderRadius: "12px 12px 0 0" }}/>
              </button>
              <div style={{ padding: "10px 16px", background: "#fcfbfa", borderTop: "1px solid #e7e5e4", fontSize: 11.5, color: "#a8a29e", fontWeight: 500 }}>Status flow — check and update authorization status without leaving the portal</div>
            </div>

            <div className="cs-wf-note reveal">By keeping users inside the payer portal context, Copilot eliminates an entire round-trip navigation loop that previously interrupted every status check. Reduces workflow latency and missed updates.</div>

            {/* How Copilot works in context */}
            <div className="reveal" style={{ marginTop: 40, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              <div style={{ background: "#fff", border: "1px solid #e7e5e4", borderRadius: 12, padding: "22px 24px" }}>
                <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: ".12em", textTransform: "uppercase", color: "#a8a29e", marginBottom: 14, paddingBottom: 12, borderBottom: "1px solid #f5f5f4" }}>Core capabilities</div>
                <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: 10 }}>
                  {COPILOT_CAPABILITIES.map((c) => (
                    <li key={c.text} style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 14, fontWeight: 500, color: "#1c1917" }}>
                      <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#6d28d9", flexShrink: 0 }}/>
                      {c.text}
                    </li>
                  ))}
                </ul>
              </div>
              <div style={{ background: "#fff", border: "1px solid #e7e5e4", borderRadius: 12, padding: "22px 24px" }}>
                <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: ".12em", textTransform: "uppercase", color: "#a8a29e", marginBottom: 14, paddingBottom: 12, borderBottom: "1px solid #f5f5f4" }}>Why this works</div>
                <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: 10 }}>
                  {COPILOT_WHY.map((w) => (
                    <li key={w} style={{ display: "flex", alignItems: "flex-start", gap: 10, fontSize: 13.5, lineHeight: 1.65, color: "#57534e" }}>
                      <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#16a34a", flexShrink: 0, marginTop: 6 }}/>
                      {w}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </section>

          {/* ── 06 SYSTEM ── */}
          <section className="cs-sec" id="system">
            <div className="cs-kicker reveal"><span className="cs-kicker-dot"/>06 · System</div>

            {/* System Depth */}
            <h2 className="cs-sh reveal">Beyond UI,<br/><em>a system layer</em></h2>
            <div className="cs-split reveal">
              <div className="cs-split-copy">
                <p className="cs-p">Connecting data across systems.</p>
                <ul className="cs-system-bullets" style={{ marginTop: 16 }}>
                  {SYSTEM_DEPTH_BULLETS.map((b) => (
                    <li key={b} className="cs-system-bullet">
                      <span className="cs-system-dot"/>
                      {b}
                    </li>
                  ))}
                </ul>
                <p className="cs-p" style={{ marginTop: 16, fontSize: 13, color: "#a8a29e", fontStyle: "italic" }}>Removes entire categories of work such as file handling.</p>
              </div>
              <div className="cs-split-img">
                <button className="cs-ui-wrap" style={{ all: "unset", display: "block", cursor: "zoom-in", width: "100%" }} onClick={() => openLightbox("/Projects/SamaCare/Copilot/deck_04.avif")} aria-label="View system context diagram">
                  <img className="cs-ui-img" src="/Projects/SamaCare/Copilot/deck_04.avif" alt="System context — portal and SamaCare as paired workflows" loading="lazy"/>
                </button>
              </div>
            </div>

            {/* Scalability */}
            <div style={{ marginTop: 56 }} className="reveal">
              <div className="cs-wf-label">Scalability · Supporting an evolving ecosystem</div>
              <p className="cs-p">Not all portals are equally supported due to variability and lack of standardization. Defined three levels of support to allow the system to function across all portals while improving over time.</p>
              <div className="cs-tier-grid">
                {SCALE_TIERS.map((t) => (
                  <div key={t.label} className={`cs-tier ${t.tier}`}>
                    <div className="cs-tier-label">{t.label}</div>
                    <div className="cs-tier-h">{t.head}</div>
                    <p className="cs-tier-p">{t.desc}</p>
                  </div>
                ))}
              </div>
              <p style={{ marginTop: 14, fontSize: 13, color: "#78716c", lineHeight: 1.7 }}>Enables prioritization of portals based on user usage patterns. Provides a clear path for incremental automation expansion.</p>
            </div>

            {/* Launch + education visual */}
            <div className="cs-img-full reveal" style={{ marginTop: 40 }}>
              <button className="cs-ui-wrap" style={{ all: "unset", display: "block", cursor: "zoom-in", width: "100%" }} onClick={() => openLightbox("/Projects/SamaCare/Copilot/deck_08.avif")} aria-label="View launch and education materials">
                <img className="cs-ui-img" src="/Projects/SamaCare/Copilot/deck_08.avif" alt="Launch documentation and education materials" loading="lazy" style={{ borderRadius: "12px 12px 0 0" }}/>
              </button>
              <div style={{ padding: "10px 16px", background: "#fcfbfa", borderTop: "1px solid #e7e5e4", fontSize: 11.5, color: "#a8a29e", fontWeight: 500 }}>Install steps, login requirements, notification glossary, and video walkthroughs — help center parity was a design requirement</div>
            </div>
          </section>

          {/* ── 07 IMPACT ── */}
          <section className="cs-sec" id="impact">
            <div className="cs-kicker reveal"><span className="cs-kicker-dot"/>07 · Adoption and Business Impact</div>
            <h2 className="cs-sh reveal">From concept<br/><em>to core workflow</em></h2>

            <div className="cs-metrics">
              {[
                { ref: (el) => (metricRefs.current[0] = el), initial: "3,000+", lbl: "Users Adopted", sub: "Across the platform", cls: "violet" },
                { ref: (el) => (metricRefs.current[1] = el), initial: "40%",    lbl: "Time Reduction", sub: "Time spent switching between systems", cls: "green" },
                { ref: (el) => (metricRefs.current[2] = el), initial: "40,000+", lbl: "Providers", sub: "Platform scale", cls: "amber" },
              ].map((m) => (
                <div key={m.lbl} className="cs-metric">
                  <div className={`cs-metric-num ${m.cls}`} ref={m.ref}>{m.initial}</div>
                  <div className="cs-metric-lbl">{m.lbl}</div>
                  <div className="cs-metric-sub">{m.sub}</div>
                </div>
              ))}
            </div>

            <div className="cs-impact-grid reveal">
              <div className="cs-outcome-card">
                <div className="cs-outcome-head">Outcomes</div>
                {IMPACT_OUTCOMES.map((o) => (
                  <div key={o} className="cs-outcome-row">
                    <div className="cs-outcome-dot"/>
                    <div className="cs-outcome-h" style={{ fontWeight: 400, fontSize: 13.5, lineHeight: 1.7, color: "#44403c" }}>{o}</div>
                  </div>
                ))}
              </div>
              <div className="cs-stat-col">
                <div className="cs-stat-hero">
                  <div className="cs-stat-hero-n">6 mo</div>
                  <div className="cs-stat-hero-l">Research to launch</div>
                  <p className="cs-stat-hero-s">Drove discovery, concept, validation, and launch. Partnered closely with engineering and product to build initial POC and scale.</p>
                </div>
                <div className="cs-stat-next">
                  <div className="cs-stat-next-k">Collaboration</div>
                  <p className="cs-stat-next-p">Sole Staff product designer leading this initiative end-to-end. <strong>Partnered closely with engineering and product</strong> to build initial POC and scale.</p>
                </div>
              </div>
            </div>
          </section>

        </div>

        {/* ── FOOTER ── */}
        <footer className="cs-foot">
          <button className="cs-foot-back" type="button" onClick={onClose}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.7">
              <path d="M10 12.5L5.5 8 10 3.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Back to Projects
          </button>
          <span className="cs-foot-sig">Edward Chu · SamaCare CoPilot</span>
        </footer>

      </div>
    </>
  );
}
