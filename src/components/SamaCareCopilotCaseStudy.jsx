import React, { useEffect, useRef, useState } from "react";

/* ─── data · SamaCare CoPilot (Gamma deck order, 6 month program) ─── */

/** Chapters follow the published Gamma narrative (visuals deck_04–08), not a generic "iteration" template. */
const DECK_CHAPTERS = [
  {
    version: "framing",
    iterLabel: "Framing",
    label: "Two worlds of work",
    vColor: "#fff",
    vBg: "#6d28d9",
    headline: "Staff live in payer portals; SamaCare stays the system of record. CoPilot had to respect both without asking teams to start over in a new tab.",
    mediaSrc: "/Projects/SamaCare/Copilot/deck_04.avif",
    mediaLabel: "Deck beat: portal and SamaCare as paired contexts",
    wins: ["Positioned CoPilot as a bridge, not a portal replacement", "Made save semantics and payer reference IDs first-class"],
    gaps: ["Early mocks underplayed how different each payer UI could feel", "Needed a stance on recognized versus unknown portals"],
  },
  {
    version: "save",
    iterLabel: "Save flow",
    label: "Fields that match real work",
    vColor: "#fff",
    vBg: "#6d28d9",
    headline: "The deck centers a disciplined save path: patient, new or existing authorization, payor, HCPCS or drug, status, payer reference ID.",
    mediaSrc: "/Projects/SamaCare/Copilot/deck_05.avif",
    mediaLabel: "Deck beat: structured capture aligned to ops language",
    wins: ["Same field order staff already use when they talk to each other", "Autocomplete when SamaCare has a match, manual entry when it does not"],
    gaps: ["Screenshot timing and “stay on this tab” behavior needed engineering and UX lockstep", "Half-filled portal pages created edge cases in pilot"],
  },
  {
    version: "trust",
    iterLabel: "Trust",
    label: "Feedback people can act on",
    vColor: "#fff",
    vBg: "#6d28d9",
    headline: "Success states link straight back to the authorization in SamaCare. Async capture states say clearly when a screenshot is still running.",
    mediaSrc: "/Projects/SamaCare/Copilot/deck_06.avif",
    mediaLabel: "Deck beat: honest notifications",
    wins: ["Toasts that deep-link into the web app after save", "Plain language while screenshots finish so nobody scrolls away too early"],
    gaps: ["Portal reminders only where detection exists; coverage grows over time"],
  },
  {
    version: "access",
    iterLabel: "Presence",
    label: "Meeting people in Chrome",
    vColor: "#fff",
    vBg: "#6d28d9",
    headline: "Toolbar pin, in-page widget on returning portals, and a hard gate back through SamaCare login when session is missing.",
    mediaSrc: "/Projects/SamaCare/Copilot/deck_07.avif",
    mediaLabel: "Deck beat: how CoPilot shows up beside the job",
    wins: ["Two front doors: omnibox icon and contextual widget", "Login path keeps every save tied to the right account and policy"],
    gaps: ["First visit to a portal can lack the widget until a successful save teaches the site"],
  },
  {
    version: "launch",
    iterLabel: "Rollout",
    label: "Docs and demos",
    vColor: "#fff",
    vBg: "#6d28d9",
    headline: "Install steps, login requirements, notification glossary, and video walkthroughs matched how Customer Success already talks on the phone.",
    mediaSrc: "/Projects/SamaCare/Copilot/deck_08.avif",
    mediaLabel: "Deck beat: launch and education",
    wins: ["Help article parity with shipped behavior", "Video covers end-to-end prior auth quest including waiting on capture"],
    gaps: [],
  },
];

const CHAPTER_BRIDGES = [
  "Once the deck lands the two-world story, the next question is which fields must move in lockstep with operations.",
  "After the field model felt credible, the deck pushes hard on honesty during async capture, especially screenshots.",
  "Feedback patterns hold only if Chrome entry and session rules stay as strict as the web app.",
  "When access patterns stabilize, scale is mostly teaching: docs, video, and support language.",
];

const PRINCIPLES = [
  { n: "01", title: "Meet operators in the portal, record truth in SamaCare.", body: "The extension wins when it respects payer workflows and still produces clean records in one system of record, without doubling data entry." },
  { n: "02", title: "Structure beats heroic copy.", body: "Field order, defaults, and escape hatches matter more than clever onboarding. Ops teams pattern-match to the forms they file hundreds of times a week." },
  { n: "03", title: "Tell the truth about partial automation.", body: "When reminders or detection lag, the UI should say so. Quiet limits erode trust faster than honest scope." },
  { n: "04", title: "Every save needs a door back to the app.", body: "Deep links and login gates keep the extension tied to permissions and audit trails in core SamaCare, which matters in regulated healthcare SaaS." },
];

const RESEARCH_METHODS = [
  { icon: "🧪", label: "Workflow observation", note: "Shadowed prior auth staff on portal-heavy days" },
  { icon: "📞", label: "Support and CS listening", note: "Stayed close to churn drivers, rework, and portal friction" },
  { icon: "✅", label: "Prototype walkthroughs", note: "Walked early admins through save flows before store listing" },
  { icon: "📋", label: "Content QA", note: "Matched extension strings to help center and compliance language" },
  { icon: "🔐", label: "Security and privacy review", note: "Chrome permissions, sessions, screenshot handling with engineering" },
  { icon: "📈", label: "Pilot feedback", note: "Tuned notifications, widget presence, and defaults as installs landed" },
];

/** Gamma “Solution: SamaCare Copilot” slide (feature column + extension mockup). */
const SOLUTION_FEATURES = [
  { icon: "🖥", title: "Chrome extension", body: "Lives alongside payer portals as a persistent surface." },
  { icon: "🎧", title: "Contextual assistant", body: "Acts during submission and status workflows in real time." },
  { icon: "🔗", title: "System connector", body: "Connects payer portals, SamaCare, and EHR systems in real time." },
  { icon: "✨", title: "Future expansion", body: "Creates a persistent surface for workflow support and future expansion." },
];

const SOLUTION_CONSTRAINT_NOTE =
  "Designed without direct API access to payer portals.";

/* ─── component ──────────────────────────────────────────── */

const NAV_SECTION_IDS = ["challenge", "people", "discovery", "journey", "principles", "solution", "impact"];

const NAV_LABELS = {
  challenge: "Challenge",
  people: "Who we serve",
  discovery: "Discovery",
  journey: "Design journey",
  principles: "Principles",
  solution: "Solution",
  impact: "Impact",
};
export default function SamaCareCopilotCaseStudy({ onClose }) {
  const [scrolled, setScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState("challenge");
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
        }
        .cs-nav-pres {
          display:inline-flex;
          align-items:center;
          gap:6px;
          padding:6px 12px 6px 10px;
          border-radius:999px;
          border:1px solid #e7e5e4;
          background:#fff;
          font-family:inherit;
          font-size:12px;
          font-weight:600;
          letter-spacing:0.02em;
          color:#44403c;
          cursor:pointer;
          transition:background .15s, border-color .15s, color .15s, box-shadow .15s;
          box-shadow:0 1px 2px rgba(28,25,23,.04);
        }
        .cs-nav-pres:hover {
          background:#f5f5f4;
          border-color:#d6d3d1;
          color:#0c0a09;
        }
        .cs-nav-pres svg {
          flex-shrink:0;
          color:#6d28d9;
        }

        .cs-wip-banner {
          background:#fef3c7; color:#92400e;
          text-align:center; padding:8px 16px;
          font-size:12px; font-weight:500;
          border-bottom:1px solid #fde68a;
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
            radial-gradient(ellipse 65% 50% at 70% 0%, rgba(237,233,254,.88) 0%, transparent 60%),
            radial-gradient(ellipse 40% 35% at 0% 85%, rgba(220,252,231,.55) 0%, transparent 55%),
            linear-gradient(to bottom, rgba(252,251,250,0) 0%, rgba(252,251,250,.9) 100%);
        }
        .cs-hero-inner { position:relative; z-index:2; max-width:880px; margin:0 auto; padding:0 48px; }

        .cs-tags { display:flex; gap:8px; flex-wrap:wrap; margin-bottom:28px; }
        .cs-pill {
          font-size:10px; font-weight:700; letter-spacing:.11em;
          text-transform:uppercase; padding:4px 11px;
          border-radius:100px; border:1px solid; white-space:nowrap;
        }
        .cs-pill-brand { color:#6d28d9; border-color:#c4b5fd; background:#f5f3ff; }
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
        .cs-h1 em { font-style:italic; color:#6d28d9; }
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
          width:100%;
          max-width:100%;
          height:auto;
          border-radius:12px;
          margin-bottom:32px;
          display:block;
          box-shadow:0 2px 12px rgba(0,0,0,.06);
          border:1px solid #e7e5e4;
          opacity:0; animation:wordUp .55s .58s ease forwards;
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
        .cs-sh em { font-style:italic; color:#6d28d9; }

        .cs-p { font-size:15px; line-height:1.85; color:#57534e; max-width:800px; }
        .cs-p + .cs-p { margin-top:16px; }
        .cs-p strong { color:#1c1917; font-weight:600; }

        .cs-hero .cs-wrap {
          position:relative;
          z-index:2;
        }

        /* ── SPLIT LAYOUTS (Gamma deck) ── */
        .cs-hero-tags { margin-bottom:20px; }
        .cs-hero-title-row { width:100%; margin-bottom:20px; }
        .cs-hero-title-row .cs-h1 { max-width:none; }
        .cs-hero-lead { max-width:none; }
        .cs-challenge-split {
          display:grid; grid-template-columns:1fr minmax(260px,400px); gap:36px; align-items:start; margin-top:8px;
        }
        .cs-challenge-visual { position:sticky; top:80px; }
        .cs-challenge-visual img {
          width:100%; height:auto; border-radius:12px; border:1px solid #e7e5e4;
          box-shadow:0 6px 28px rgba(28,25,23,.08);
        }
        .cs-deck-split {
          display:grid; grid-template-columns:1fr minmax(260px,44%); gap:32px; align-items:start; margin-top:4px;
        }
        .cs-deck-split-media { min-width:0; }
        .cs-deck-split-media .cs-iter-media { margin-bottom:0; }
        .cs-deck-split.is-rev .cs-deck-split-copy { grid-column:2; grid-row:1; }
        .cs-deck-split.is-rev .cs-deck-split-media { grid-column:1; grid-row:1; }
        .cs-deck-split-copy .cs-iter-headline { margin-bottom:0; }
        .cs-iter-wide .cs-iter-analysis { margin-top:24px; }
        .cs-sol-deck-head { margin-bottom:28px; }
        .cs-sol-kicker-deck {
          font-size:11px; font-weight:700; letter-spacing:.12em; text-transform:uppercase;
          color:#4338ca; margin-bottom:8px;
        }
        .cs-sol-title-deck {
          font-family:'Lora',Georgia,serif; font-size:clamp(28px,4vw,38px);
          font-weight:700; letter-spacing:-.02em; color:#2563eb; margin:0 0 6px;
        }
        .cs-sol-tagline {
          font-size:16px; font-weight:500; color:#57534e; margin:0 0 20px;
        }
        .cs-solution-split {
          display:grid; grid-template-columns:1fr minmax(280px,46%); gap:36px; align-items:start;
        }
        .cs-sol-card {
          display:flex; gap:14px; align-items:flex-start;
          padding:16px 18px; border:1px solid #e7e5e4; border-radius:12px; background:#fff;
          margin-bottom:10px; box-shadow:0 1px 3px rgba(0,0,0,.04);
        }
        .cs-sol-card-icon {
          width:40px; height:40px; flex-shrink:0; border-radius:10px; background:#f5f3ff;
          border:1px solid #ddd6fe; display:flex; align-items:center; justify-content:center;
          font-size:18px;
        }
        .cs-sol-card-t { font-size:14px; font-weight:700; color:#1c1917; margin-bottom:4px; }
        .cs-sol-card-p { font-size:13px; line-height:1.65; color:#57534e; margin:0; }
        .cs-sol-footnote {
          margin-top:16px; padding:14px 16px; border-radius:12px;
          background:linear-gradient(135deg,#eef2ff,#f5f3ff); border:1px solid #c4b5fd;
          font-size:13px; line-height:1.6; color:#4338ca; font-weight:600;
          display:flex; gap:10px; align-items:flex-start;
        }
        .cs-solution-visual img {
          width:100%; height:auto; border-radius:12px; display:block;
          border:1px solid #e7e5e4; box-shadow:0 12px 48px rgba(67,56,202,.12);
        }
        /* ── CALLOUT ── */
        .cs-callout {
          margin:32px 0; padding:28px 32px 24px;
          background:linear-gradient(140deg,#f5f3ff,#faf5ff); border:1px solid #ddd6fe; border-radius:14px;
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
          color:#ede9fe; line-height:1; user-select:none; pointer-events:none;
        }
        .cs-callout-text {
          font-family:'Lora',Georgia,serif;
          font-size:18px; font-style:italic; font-weight:500;
          line-height:1.65; color:#5b21b6;
          position:relative; z-index:1; max-width:680px;
        }
        .cs-callout-label {
          display:block; margin-top:12px;
          font-size:10px; font-weight:700; letter-spacing:.12em;
          text-transform:uppercase; color:#c4b5fd;
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
        .cs-research-card:hover { border-color:#c4b5fd; }
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
        .cs-prin:hover { border-color:#c4b5fd; box-shadow:0 6px 24px rgba(109,40,217,.08); transform:translateY(-2px); }
        .cs-prin::after {
          content:''; position:absolute; inset:0; border-radius:12px; pointer-events:none; opacity:.02;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
          background-size:160px;
        }
        .cs-prin-num {
          font-size:10px; font-weight:700; letter-spacing:.14em;
          text-transform:uppercase; color:#7c3aed; margin-bottom:12px;
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
        .cs-arch-root { background:#ede9fe; border-radius:10px; padding:14px 32px; text-align:center; min-width:180px; }
        .cs-arch-root-k { font-size:9px; font-weight:700; letter-spacing:.14em; text-transform:uppercase; color:#6d28d9; margin-bottom:4px; }
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
        .cs-arch-ui.act { background:#f5f3ff; border-color:#a78bfa; }
        .cs-arch-ui.act .cs-arch-node-k { color:#7c3aed; }
        .cs-arch-ui.act .cs-arch-node-v { color:#6d28d9; }
        .cs-arch-type   { background:#f5f3ff; border-color:#c4b5fd; }
        .cs-arch-type   .cs-arch-node-k { color:#7c3aed; }
        .cs-arch-type   .cs-arch-node-v { color:#6d28d9; }
        .cs-arch-today  { background:#fafaf9; border-color:#e7e5e4; }
        .cs-arch-today  .cs-arch-node-k { color:#a8a29e; }
        .cs-arch-today  .cs-arch-node-v { color:#44403c; }
        .cs-arch-future { background:linear-gradient(135deg,#f5f3ff,#faf5ff); border-color:#a78bfa; }
        .cs-arch-future .cs-arch-node-k { color:#7c3aed; }
        .cs-arch-future .cs-arch-node-v { color:#6d28d9; }
        .cs-arch-sync {
          display:flex; align-items:center; gap:10px;
          margin:12px 0; font-size:10px; font-weight:600;
          letter-spacing:.08em; text-transform:uppercase; color:#a78bfa;
        }
        .cs-arch-sync::before, .cs-arch-sync::after { content:''; flex:1; height:1px; background:#c4b5fd; }
        .cs-arch-users { display:grid; grid-template-columns:1fr 1fr; gap:10px; margin-top:20px; padding-top:16px; border-top:1px solid #f5f5f4; }
        .cs-arch-user { border-radius:9px; padding:14px 16px; border:1px solid; }
        .cs-arch-user-pm  { background:#fafaf9; border-color:#e7e5e4; }
        .cs-arch-user-eng { background:#f5f3ff; border-color:#c4b5fd; }
        .cs-arch-user-k { font-size:9px; font-weight:700; letter-spacing:.12em; text-transform:uppercase; margin-bottom:5px; }
        .cs-arch-user-pm  .cs-arch-user-k { color:#a8a29e; }
        .cs-arch-user-eng .cs-arch-user-k { color:#7c3aed; }
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
          font-size:clamp(28px,4vw,44px); font-weight:700; line-height:1.1;
          letter-spacing:-.02em; margin-bottom:8px; position:relative; z-index:1;
        }
        .cs-metric-num.violet { color:#6d28d9; }
        .cs-metric-num.green  { color:#16a34a; }
        .cs-metric-num.amber { color:#d97706; }
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
        .cs-stat-hero {
          background:linear-gradient(140deg,#f5f3ff,#ede9fe);
          border:1px solid #c4b5fd; border-radius:12px; padding:24px;
          position:relative; overflow:hidden;
        }
        .cs-stat-hero::before {
          content:''; position:absolute; inset:0; border-radius:12px; pointer-events:none;
          background-image: repeating-linear-gradient(-45deg, transparent, transparent 5px, rgba(109,40,217,.04) 5px, rgba(109,40,217,.04) 6px);
        }
        .cs-stat-hero-n { font-family:'Lora',serif; font-size:42px; font-weight:700; letter-spacing:-.035em; color:#6d28d9; line-height:1; margin-bottom:6px; position:relative; z-index:1; }
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
          background:linear-gradient(135deg,#f5f3ff,#ede9fe);
          border:1px solid #c4b5fd;
          display:flex; align-items:center; justify-content:center;
          font-size:13px; font-weight:700; color:#6d28d9;
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
        @media (max-width:960px) {
          .cs-challenge-split { grid-template-columns:1fr; }
          .cs-challenge-visual { position:relative; top:0; order:-1; }
          .cs-deck-split, .cs-deck-split.is-rev { grid-template-columns:1fr; }
          .cs-deck-split.is-rev .cs-deck-split-copy,
          .cs-deck-split.is-rev .cs-deck-split-media { grid-column:1; grid-row:auto; }
          .cs-solution-split { grid-template-columns:1fr; }
        }
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
          <span className="cs-nav-id">SamaCare · CoPilot</span>
          <div className="cs-nav-right">
            <ul className="cs-nav-links">
              {NAV_SECTION_IDS.map((id) => (
                <li key={id}>
                  <a
                    href={`#${id}`}
                    className={activeSection === id ? "cs-nav-active" : ""}
                  >
                    {NAV_LABELS[id] || id}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </nav>

        <div className="cs-wip-banner" role="status">Work in progress, not finalized</div>

        {/* HERO */}
        <header className="cs-hero" id="top">
            <div className="cs-hero-tex"/>
            <div className="cs-hero-wash"/>
            <div className="cs-wrap">
              <div className="cs-tags cs-hero-tags">
                <span className="cs-pill cs-pill-green">0 to 1 design</span>
                <span className="cs-pill cs-pill-brand">Chrome extension</span>
                <span className="cs-pill cs-pill-stone">Healthcare SaaS</span>
              </div>
              <div className="cs-hero-title-row">
                <h1 className="cs-h1">
                  {"Bring portal work".split(" ").map((w, i) => (
                    <span key={w+i} className="cs-h1-word" style={{ animationDelay:`${i*0.1}s`, marginRight:"0.22em" }}>{w}</span>
                  ))}
                  <br/>
                  <em className="cs-h1-word" style={{ animationDelay:"0.4s" }}>home to SamaCare</em>
                </h1>
              </div>
              <img
                className="cs-hero-gif"
                src="/Projects/SamaCare/Copilot/deck_09.gif"
                alt="SamaCare CoPilot workflow animation from the Gamma deck"
              />
              <p className="cs-h1-sub">SamaCare CoPilot</p>
              <p className="cs-hero-lead">
                CoPilot is the Chrome extension from my Gamma deck: it lets authorization teams <strong>capture payer portal work into SamaCare</strong> with patient, payor, codes, status, and payer reference IDs, without walking away from the site where the work happens. This page follows the same story arc as that presentation: six months of discovery, design, and rollout support in a regulated, ops-heavy setting.
              </p>
              <div className="cs-meta">
                {[["Role","Staff Product Designer"],["Scope","0 to 1 extension and onboarding"],["Timeline","6 months"],["Surface","B2B healthcare SaaS"]].map(([k,v])=>(
                  <div className="cs-meta-cell" key={k}>
                    <div className="cs-meta-k">{k}</div>
                    <div className="cs-meta-v">{v}</div>
                  </div>
                ))}
              </div>
            </div>
        </header>

        <div className="cs-wrap">

          {/* 01 CHALLENGE */}
          <section className="cs-sec reveal" id="challenge">
            <div className="cs-kicker"><span className="cs-kicker-dot"/>01 · The challenge</div>
            <h2 className="cs-sh">Capture at the <em>portal</em>,<br/>truth in SamaCare</h2>
            <div className="cs-challenge-split">
              <div className="cs-challenge-copy">
                <p className="cs-p">
                  The presentation opens from the same operational reality SamaCare already serves: prior authorization, benefit checks, and enrollment. <strong>CoPilot carries that workflow onto payer websites.</strong> Staff finish or review work on the insurer site, then save or update the authorization in SamaCare, with optional screenshots, so every determination stays tied to a single record.
                </p>
                <p className="cs-p">
                  Over six months I owned interaction design, onboarding content, and the feedback patterns that make a browser extension feel as trustworthy as the core app, where HIPAA-adjacent expectations and support load leave no room for “good enough” states.
                </p>
                <div className="cs-callout reveal">
                  <span className="cs-callout-mark">"</span>
                  <p className="cs-callout-text">If the extension misleads on save state, portal coverage, or what actually happened on the payer site, teams remove it. Forensic honesty, not clever defaults, is the north star.</p>
                  <span className="cs-callout-label">The core design challenge</span>
                </div>
                <div className="cs-diff reveal">
                  <div className="cs-diff-head">Why CoPilot exists</div>
                  <div className="cs-diff-row">
                    <span className="cs-diff-badge before">Without CoPilot</span>
                    <span className="cs-diff-body">Portal work and SamaCare records drift apart. Staff re-type details, lose reference IDs, or skip proof, which creates rework, audit anxiety, and a fuzzy picture of status.</span>
                  </div>
                  <div className="cs-diff-row">
                    <span className="cs-diff-badge after">With CoPilot</span>
                    <span className="cs-diff-body">Teams <strong>save from the payer site into SamaCare in one structured flow</strong>, with optional screenshots and explicit success paths back into the main application.</span>
                  </div>
                </div>
              </div>
              <div className="cs-challenge-visual">
                <img
                  src="/Projects/SamaCare/Copilot/deck_03.avif"
                  alt="Supporting deck visual for operational context of portal and SamaCare work"
                  loading="lazy"
                />
              </div>
            </div>
          </section>

          {/* 02 WHO WE SERVE */}
          <section className="cs-sec reveal" id="people">
            <div className="cs-kicker"><span className="cs-kicker-dot"/>02 · Who we serve</div>
            <h2 className="cs-sh">Ops at the payer edge,<br/><em>product in the record</em></h2>
            <p className="cs-p">
              CoPilot is for the people who live in payer portals all day: prior authorization specialists, benefits coordinators, and practice admins who already file the same forms hundreds of times a week. They are not looking for a new destination. They need <strong>the portal they are in</strong> to stay honest while SamaCare remains the system of record.
            </p>
            <div className="cs-persona-wrap reveal">
              <div className="cs-persona cs-persona-pm">
                <div className="cs-persona-avatar">📋</div>
                <div className="cs-persona-body">
                  <div className="cs-persona-role">Primary · Clinical operations</div>
                  <div className="cs-persona-name">Prior authorization specialist</div>
                  <p className="cs-persona-desc">Juggles multiple payer sites, tight turnaround times, and audit expectations. Needs the extension to mirror how they already describe work to peers: patient, authorization, payor, codes, status, reference ID.</p>
                  <span className="cs-persona-need">Needs: speed without rework, proof on save</span>
                </div>
              </div>
              <div className="cs-persona cs-persona-pm" style={{ marginTop: 14 }}>
                <div className="cs-persona-avatar">🏥</div>
                <div className="cs-persona-body">
                  <div className="cs-persona-role">Secondary · IT and admin</div>
                  <div className="cs-persona-name">Practice administrator</div>
                  <p className="cs-persona-desc">Owns Chrome install policy, training, and escalation when something blocks in the browser. Needs clear login boundaries, permissions language, and help-center parity with what ships.</p>
                  <span className="cs-persona-need">Needs: trust, compliance-friendly rollout</span>
                </div>
              </div>
            </div>
          </section>

          {/* 03 DISCOVERY */}
          <section className="cs-sec reveal" id="discovery">
            <div className="cs-kicker"><span className="cs-kicker-dot"/>03 · Discovery</div>
            <h2 className="cs-sh">Grounding the extension<br/><em>in real portals</em></h2>
            <p className="cs-p">
              Discovery mixed live observation with support listening and security review. The goal was not “more interviews” but a shared picture of where portals diverge, where staff distrust automation, and where screenshots and sessions actually matter.
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

          {/* 04 DESIGN JOURNEY */}
          <section className="cs-sec reveal" id="journey">
            <div className="cs-kicker"><span className="cs-kicker-dot"/>04 · Design journey</div>
            <h2 className="cs-sh">The deck’s five beats,<br/><em>in the order we told them</em></h2>
            <p className="cs-p">
              The Gamma presentation is organized as a story, not a lab note. Each beat below mirrors a chapter from that deck (with matching visuals). The columns record what advanced the work and what we kept watching as pilots landed.
            </p>
            <div className="cs-iters">
              {DECK_CHAPTERS.map((iter, i) => (
                <React.Fragment key={iter.version}>
                  <div className="cs-iter cs-iter-wide reveal">
                    <div className={`cs-deck-split${i % 2 === 1 ? " is-rev" : ""}`}>
                      <div className="cs-deck-split-copy">
                        <div className="cs-iter-header">
                          <div className="cs-iter-badge" style={{ background: iter.vBg }}>
                            {iter.iterLabel}
                          </div>
                          <div className="cs-iter-name">{iter.label}</div>
                        </div>
                        <div className="cs-iter-headline">{iter.headline}</div>
                      </div>
                      <div className="cs-deck-split-media">
                        <div className="cs-iter-media">
                          <img
                            src={iter.mediaSrc}
                            alt={iter.mediaLabel}
                            loading="lazy"
                          />
                        </div>
                      </div>
                    </div>

                    <div className={`cs-iter-analysis${!iter.gaps || iter.gaps.length === 0 ? " single-col" : ""}`}>
                      <div className="cs-iter-col">
                        <div className="cs-iter-col-head worked">
                          <svg className="cs-iter-col-head-icon" viewBox="0 0 14 14" fill="none">
                            <path d="M2.5 7.5l3 3 6-6" stroke="#16a34a" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                          What advanced
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

                      {iter.gaps && iter.gaps.length > 0 && (
                        <div className="cs-iter-col">
                          <div className="cs-iter-col-head learned">
                            <svg className="cs-iter-col-head-icon" viewBox="0 0 14 14" fill="none">
                              <circle cx="7" cy="7" r="5" stroke="#ea580c" strokeWidth="1.6"/>
                              <path d="M7 4.5v3M7 9.5v.5" stroke="#ea580c" strokeWidth="1.6" strokeLinecap="round"/>
                            </svg>
                            What we watched
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
                  {i < DECK_CHAPTERS.length - 1 && (
                    <div style={{ borderTop: "1px solid #e7e5e4", padding: "20px 0", textAlign: "center", fontSize: 13, fontStyle: "italic", color: "#a8a29e" }}>
                      <p style={{ margin: 0 }}>{CHAPTER_BRIDGES[i]}</p>
                    </div>
                  )}
                </React.Fragment>
              ))}
            </div>
          </section>

          {/* 05 PRINCIPLES */}
          <section className="cs-sec reveal" id="principles">
            <div className="cs-kicker"><span className="cs-kicker-dot"/>05 · Principles</div>
            <h2 className="cs-sh">Rules pulled<br/><em>from the deck</em></h2>
            <p className="cs-p">
              These are the lines that stayed taped above my monitor once pilots began, the non-negotiables for regulated ops tooling.
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
            <div className="cs-kicker"><span className="cs-kicker-dot"/>06 · Solution</div>
            <div className="cs-sol-deck-head">
              <div className="cs-sol-kicker-deck">Solution</div>
              <h2 className="cs-sol-title-deck">SamaCare CoPilot</h2>
              <p className="cs-sol-tagline">A browser-based integration layer.</p>
            </div>
            <div className="cs-solution-split">
              <div className="cs-solution-copy">
                <p className="cs-p" style={{ maxWidth: "none", marginBottom: 18 }}>
                  The live panel matches what we shipped: a <strong>save and update surface</strong> from Chrome after people authenticate into SamaCare. Structured fields, optional screenshots, and success with deep links align with the help article and with the workflow motion further down this page.
                </p>
                {SOLUTION_FEATURES.map((f) => (
                  <div key={f.title} className="cs-sol-card">
                    <div className="cs-sol-card-icon" aria-hidden>{f.icon}</div>
                    <div>
                      <div className="cs-sol-card-t">{f.title}</div>
                      <p className="cs-sol-card-p">{f.body}</p>
                    </div>
                  </div>
                ))}
                <div className="cs-sol-footnote">
                  <span aria-hidden>📄</span>
                  <span>{SOLUTION_CONSTRAINT_NOTE}</span>
                </div>
              </div>
              <div className="cs-solution-visual">
                <img
                  src="/Projects/SamaCare/Copilot/solution-copilot-panel.png"
                  alt="SamaCare CoPilot extension panel: save prior authorization form alongside deck feature list"
                  loading="lazy"
                />
              </div>
            </div>

            <div className="cs-arch reveal">
              <div className="cs-arch-head">
                <span className="cs-arch-head-title">Extension → platform record</span>
                <span className="cs-arch-head-hint">Session, capture, notify</span>
              </div>
              <div className="cs-arch-body">
                <div className="cs-arch-root-wrap">
                  <div className="cs-arch-root">
                    <div className="cs-arch-root-k">Surface</div>
                    <div className="cs-arch-root-v">SamaCare CoPilot</div>
                  </div>
                </div>
                <div className="cs-arch-vline-wrap"><div className="cs-arch-vline"/></div>

                <div className="cs-arch-hrow c4 arch-row-anim">
                  {[["Gate","SamaCare login",true],["Form","Patient + auth fields",false],["Capture","Optional screenshot",false],["Sync","Save / update APIs",false]].map(([k,v,a])=>(
                    <div key={k} className={`cs-arch-node cs-arch-ui${a?" act":""}`}>
                      <div className="cs-arch-node-k">{k}</div>
                      <div className="cs-arch-node-v">{v}</div>
                    </div>
                  ))}
                </div>

                <div className="cs-arch-sync">Structured fields · autocomplete when data exists, manual entry when it does not</div>

                <div className="cs-arch-hrow c4 arch-row-anim">
                  {["Patient","Authorization","Payor","HCPCS / J-code"].map((v)=>(
                    <div key={v} className="cs-arch-node cs-arch-type">
                      <div className="cs-arch-node-k">Field</div>
                      <div className="cs-arch-node-v">{v}</div>
                    </div>
                  ))}
                </div>

                <div className="cs-arch-sync">Notifications · deep link back to authorization in the web app</div>

                <div className="cs-arch-hrow c2 arch-row-anim">
                  <div className="cs-arch-node cs-arch-today">
                    <div className="cs-arch-node-k">Today</div>
                    <div className="cs-arch-node-v">Payer portals + Chrome</div>
                  </div>
                  <div className="cs-arch-node cs-arch-future">
                    <div className="cs-arch-node-k">Roadmap</div>
                    <div className="cs-arch-node-v">Broader workflow surfaces</div>
                  </div>
                </div>

                <div className="cs-arch-users">
                  <div className="cs-arch-user cs-arch-user-pm">
                    <div className="cs-arch-user-k">Authorization staff get</div>
                    <div className="cs-arch-user-v">A disciplined save path beside the portal, optional proof capture, and clear success that returns them to the record in SamaCare.</div>
                  </div>
                  <div className="cs-arch-user cs-arch-user-eng">
                    <div className="cs-arch-user-k">Platform gets</div>
                    <div className="cs-arch-user-v">Session-bound actions, structured payloads into core SamaCare, and notification copy aligned to the help center for support.</div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* 07 IMPACT */}
          <section className="cs-sec reveal" id="impact">
            <div className="cs-kicker"><span className="cs-kicker-dot"/>07 · Impact</div>
            <h2 className="cs-sh">What changed<br/><em>for teams and support</em></h2>
            <p className="cs-p">
              I am not quoting hard percentages without a shared analytics definition across customers. The impact story here is operational: fewer duplicate entries, clearer audit trails, and extension behavior that matches the help center so support can trust what they read on the phone.
            </p>

            <div className="cs-metrics">
              {[
                { t: "Aligned", l: "Help center parity", s: "Extension strings and flows matched public documentation" },
                { t: "Faster", l: "Less re-keying", s: "Structured capture from the portal into one authorization record" },
                { t: "Safer", l: "Honest scope", s: "Async capture and portal detection called out in plain language" },
              ].map((m) => (
                <div key={m.l} className="cs-metric">
                  <div className="cs-metric-num violet">{m.t}</div>
                  <div className="cs-metric-lbl">{m.l}</div>
                  <div className="cs-metric-sub">{m.s}</div>
                </div>
              ))}
            </div>

            <div className="cs-impact-grid reveal">
              <div className="cs-outcome-card">
                <div className="cs-outcome-head">Outcomes we optimized for</div>
                {[
                  { h: "Single record of truth", p: "Authorization details and payer reference IDs land in SamaCare without a second pass of manual entry from notes." },
                  { h: "Defensible audit posture", p: "Optional screenshots and explicit success paths give teams proof they can stand behind." },
                  { h: "Supportable rollout", p: "Install, login, and notification language stayed consistent with Customer Success scripts and the published FAQ." },
                ].map((o) => (
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
                  <div className="cs-stat-hero-n">6 mo</div>
                  <div className="cs-stat-hero-l">Program timeline</div>
                  <p className="cs-stat-hero-s">Discovery through pilot support for a regulated B2B healthcare workflow surface, with design and content in lockstep with engineering and compliance.</p>
                </div>
                <div className="cs-stat-next">
                  <div className="cs-stat-next-k">What stayed open</div>
                  <p className="cs-stat-next-p">Payer coverage and portal detection continue to expand. The product pattern that scales is honest scope: say what the extension does on this site, today, and route everything else back to human workflow.</p>
                </div>
              </div>
            </div>
          </section>

          {/* 08 REFLECTION */}
          <section className="cs-sec reveal">
            <div className="cs-kicker"><span className="cs-kicker-dot"/>08 · Reflection</div>
            <h2 className="cs-sh">What I carry<br/><em>into the next regulated surface</em></h2>
            <p className="cs-p">
              Building in browser extensions next to third-party sites means you own the honesty of every line of copy. Small exaggerations show up as support tickets and uninstalls.
            </p>
            <ul className="cs-learnings">
              {[
                {
                  h: "Design for the worst portal day",
                  b: "If flows only work on happy paths, teams will blame the product when a payer throws a curveball. Edge cases belong in the same story as the demo.",
                },
                {
                  h: "Pair every promise with a recovery path",
                  b: "Screenshots, sessions, and sync will fail sometimes. The UI has to say what is still running, what to avoid clicking, and when it is safe to retry.",
                },
                {
                  h: "Treat the help article as part of the interface",
                  b: "When CS and customers read different words than the extension shows, trust erodes. Content QA is product work.",
                },
                {
                  h: "Keep scope visible",
                  b: "Unknown portals and partial automation are fine if labeled clearly. Quiet limits read like bugs.",
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
          <span className="cs-foot-sig">Edward Chu · SamaCare CoPilot</span>
        </footer>

      </div>

    </>
  );
}
