/**
 * One-shot restore: rebuild SamaCareCopilotCaseStudy.jsx from AdoptAICaseStudy.jsx
 * with Gamma deck data, purple theme, split layouts, and SamaCare sections.
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const adoptPath = path.join(root, "src/components/AdoptAICaseStudy.jsx");
const outPath = path.join(root, "src/components/SamaCareCopilotCaseStudy.jsx");

let s = fs.readFileSync(adoptPath, "utf8");

const DATA_BLOCK = `import React, { useEffect, useRef, useState } from "react";

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
`;

s = s.replace(/^import React[\s\S]*?const NAV_SECTION_IDS = \["context", "users", "research", "process", "principles", "solution", "impact"\];\s*\n/m, DATA_BLOCK);

s = s.replace(
  /export default function AdoptAICaseStudy\(\{ onClose \}\) \{\s*\n  const \[scrolled, setScrolled\] = useState\(false\);\s*\n  const \[activeSection, setActiveSection\] = useState\("context"\);/,
  `export default function SamaCareCopilotCaseStudy({ onClose }) {
  const [scrolled, setScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState("challenge");`
);

s = s.replace(
  /  const metricRefs = useRef\(\[\]\);\s*\n  const \[metricCounted, setMetricCounted\] = useState\(false\);\s*\n/,
  ""
);

s = s.replace(
  /  useEffect\(\(\) => \{\s*if \(metricCounted\) return;[\s\S]*?\}, \[metricCounted\]\);\s*\n/,
  ""
);

s = s.replace(
  /\.cs-hero-wash \{[^}]+\}/,
  `.cs-hero-wash {
          position:absolute; top:0; bottom:0; left:50%; transform:translateX(-50%);
          width:100vw; z-index:1; pointer-events:none;
          background:
            radial-gradient(ellipse 65% 50% at 70% 0%, rgba(237,233,254,.88) 0%, transparent 60%),
            radial-gradient(ellipse 40% 35% at 0% 85%, rgba(220,252,231,.55) 0%, transparent 55%),
            linear-gradient(to bottom, rgba(252,251,250,0) 0%, rgba(252,251,250,.9) 100%);
        }`
);

s = s.replace(/\.cs-pill-blue  \{[^}]+\}/, `.cs-pill-brand { color:#6d28d9; border-color:#c4b5fd; background:#f5f3ff; }`);

s = s.replace(/\.cs-h1 em \{ font-style:italic; color:#2563eb; \}/, `.cs-h1 em { font-style:italic; color:#6d28d9; }`);
s = s.replace(/\.cs-sh em \{ font-style:italic; color:#2563eb; \}/, `.cs-sh em { font-style:italic; color:#6d28d9; }`);

s = s.replace(
  /        \.cs-nav-pres svg \{\s*flex-shrink:0;\s*color:#2563eb;\s*\}/,
  `        .cs-nav-pres svg {
          flex-shrink:0;
          color:#6d28d9;
        }`
);

s = s.replace(
  /        \.cs-p strong \{ color:#1c1917; font-weight:600; \}\s*\n\s*\/\* ── CALLOUT/,
  `        .cs-p strong { color:#1c1917; font-weight:600; }

        /* ── SPLIT LAYOUTS (Gamma deck) ── */
        .cs-hero-split-wrap {
          position:relative; z-index:2; max-width:1120px; margin:0 auto; padding:0 48px;
        }
        .cs-hero-title-row { width:100%; margin-bottom:28px; }
        .cs-hero-title-row .cs-h1 { max-width:none; }
        .cs-hero-split {
          display:grid; grid-template-columns:1fr minmax(260px,420px); gap:40px; align-items:start;
        }
        .cs-hero-split-copy .cs-hero-lead { max-width:none; }
        .cs-hero-visual { position:sticky; top:72px; }
        .cs-hero-visual img {
          width:100%; height:auto; border-radius:12px; display:block;
          box-shadow:0 10px 48px rgba(28,25,23,.12); border:1px solid #e7e5e4;
          opacity:0; animation:wordUp .55s .6s ease forwards;
        }
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
        .cs-sol-after {
          margin-top:40px; padding-top:32px; border-top:1px solid #e7e5e4;
        }
        .cs-sol-after .cs-p { max-width:none; }

        /* ── CALLOUT`
);

s = s.replace(
  /background:linear-gradient\(140deg,#eff6ff,#f0f9ff\);\s*border:1px solid #bfdbfe;/,
  "background:linear-gradient(140deg,#f5f3ff,#faf5ff); border:1px solid #ddd6fe;"
);
s = s.replace(/color:#1e40af;/, "color:#5b21b6;");
s = s.replace(/color:#dbeafe;/, "color:#ede9fe;");
s = s.replace(/color:#93c5fd;/, "color:#c4b5fd;");

s = s.replace(
  /\.cs-research-card:hover \{ border-color:#93c5fd; \}/,
  ".cs-research-card:hover { border-color:#c4b5fd; }"
);

s = s.replace(
  /\.cs-prin:hover \{ border-color:#93c5fd; box-shadow:0 6px 24px rgba\(59,130,246,\.08\);/,
  ".cs-prin:hover { border-color:#c4b5fd; box-shadow:0 6px 24px rgba(109,40,217,.08);"
);
s = s.replace(
  /\.cs-prin-num \{[^}]+\}/,
  `.cs-prin-num {
          font-size:10px; font-weight:700; letter-spacing:.14em;
          text-transform:uppercase; color:#7c3aed; margin-bottom:12px;
          display:flex; align-items:center; gap:8px;
        }`
);

s = s.replace(
  /\.cs-arch-root \{ background:#ffedd5[^}]+\}/,
  `.cs-arch-root { background:#ede9fe; border-radius:10px; padding:14px 32px; text-align:center; min-width:180px; }`
);
s = s.replace(
  /\.cs-arch-root-k \{ font-size:9px[^}]+\}/,
  `.cs-arch-root-k { font-size:9px; font-weight:700; letter-spacing:.14em; text-transform:uppercase; color:#6d28d9; margin-bottom:4px; }`
);

s = s.replace(
  /\.cs-arch-ui\.act \{ background:#eff6ff; border-color:#93c5fd; \}\s*\.cs-arch-ui\.act \.cs-arch-node-k \{ color:#3b82f6; \}\s*\.cs-arch-ui\.act \.cs-arch-node-v \{ color:#1d4ed8; \}/,
  `.cs-arch-ui.act { background:#f5f3ff; border-color:#a78bfa; }
        .cs-arch-ui.act .cs-arch-node-k { color:#7c3aed; }
        .cs-arch-ui.act .cs-arch-node-v { color:#6d28d9; }`
);

s = s.replace(
  /\.cs-arch-type   \{ background:#eff6ff; border-color:#bfdbfe; \}\s*\.cs-arch-type   \.cs-arch-node-k \{ color:#3b82f6; \}\s*\.cs-arch-type   \.cs-arch-node-v \{ color:#1d4ed8; \}/,
  `.cs-arch-type   { background:#f5f3ff; border-color:#c4b5fd; }
        .cs-arch-type   .cs-arch-node-k { color:#7c3aed; }
        .cs-arch-type   .cs-arch-node-v { color:#6d28d9; }`
);

s = s.replace(
  /\.cs-arch-future \{ background:linear-gradient\(135deg,#eff6ff,#f0f9ff\); border-color:#93c5fd; \}\s*\.cs-arch-future \.cs-arch-node-k \{ color:#3b82f6; \}\s*\.cs-arch-future \.cs-arch-node-v \{ color:#1d4ed8; \}/,
  `.cs-arch-future { background:linear-gradient(135deg,#f5f3ff,#faf5ff); border-color:#a78bfa; }
        .cs-arch-future .cs-arch-node-k { color:#7c3aed; }
        .cs-arch-future .cs-arch-node-v { color:#6d28d9; }`
);

s = s.replace(
  /\.cs-arch-sync \{[^}]+\}\s*\.cs-arch-sync::before, \.cs-arch-sync::after \{[^}]+\}/,
  `.cs-arch-sync {
          display:flex; align-items:center; gap:10px;
          margin:12px 0; font-size:10px; font-weight:600;
          letter-spacing:.08em; text-transform:uppercase; color:#a78bfa;
        }
        .cs-arch-sync::before, .cs-arch-sync::after { content:''; flex:1; height:1px; background:#c4b5fd; }`
);

s = s.replace(
  /\.cs-arch-user-eng \{ background:#eff6ff; border-color:#bfdbfe; \}/,
  `.cs-arch-user-eng { background:#f5f3ff; border-color:#c4b5fd; }`
);
s = s.replace(
  /\.cs-arch-user-eng \.cs-arch-user-k \{ color:#3b82f6; \}/,
  `.cs-arch-user-eng .cs-arch-user-k { color:#7c3aed; }`
);

s = s.replace(
  /\.cs-metric-num\.blue   \{ color:#2563eb; \}/,
  `.cs-metric-num.violet { color:#6d28d9; }`
);
s = s.replace(
  /\.cs-metric-num\.green  \{ color:#16a34a; \}/,
  `.cs-metric-num.green  { color:#16a34a; }`
);
s = s.replace(
  /\.cs-metric-num\.orange \{ color:#ea580c; \}/,
  `.cs-metric-num.amber { color:#d97706; }`
);

s = s.replace(
  /\.cs-outcome-dot \{[^}]+\}/,
  `.cs-outcome-dot { width:6px; height:6px; border-radius:50%; background:#7c3aed; margin-top:6px; }`
);

s = s.replace(
  /\.cs-stat-hero \{[^}]+\}/,
  `.cs-stat-hero {
          background:linear-gradient(140deg,#f5f3ff,#ede9fe);
          border:1px solid #c4b5fd; border-radius:12px; padding:24px;
          position:relative; overflow:hidden;
        }`
);
s = s.replace(
  /rgba\(37,99,235,\.04\)/g,
  "rgba(109,40,217,.04)"
);
s = s.replace(
  /\.cs-stat-hero-n \{[^}]+\}/,
  `.cs-stat-hero-n { font-family:'Lora',serif; font-size:42px; font-weight:700; letter-spacing:-.035em; color:#6d28d9; line-height:1; margin-bottom:6px; position:relative; z-index:1; }`
);

s = s.replace(
  /\.cs-learning-n \{[^}]+\}/,
  `.cs-learning-n {
          width:44px; height:44px; border-radius:12px; flex-shrink:0;
          background:linear-gradient(135deg,#f5f3ff,#ede9fe);
          border:1px solid #c4b5fd;
          display:flex; align-items:center; justify-content:center;
          font-size:13px; font-weight:700; color:#6d28d9;
        }`
);

s = s.replace(
  /        \/\* ── RESPONSIVE ── \*\/\s*@media \(max-width:700px\) \{/,
  `        /* ── RESPONSIVE ── */
        @media (max-width:960px) {
          .cs-hero-split {
            grid-template-columns:1fr;
            display:flex; flex-direction:column;
          }
          .cs-hero-visual { position:relative; top:0; order:-1; }
          .cs-challenge-split { grid-template-columns:1fr; }
          .cs-challenge-visual { position:relative; top:0; order:-1; }
          .cs-deck-split, .cs-deck-split.is-rev { grid-template-columns:1fr; }
          .cs-deck-split.is-rev .cs-deck-split-copy,
          .cs-deck-split.is-rev .cs-deck-split-media { grid-column:1; grid-row:auto; }
          .cs-solution-split { grid-template-columns:1fr; }
        }
        @media (max-width:700px) {`
);

s = s.replace(
  /          \.cs-wrap \{ padding:0 20px; \}\s*          \.cs-hero \{ padding:48px 0; \};/,
  `          .cs-wrap { padding:0 20px; }
          .cs-hero-split-wrap { padding:0 20px; }
          .cs-hero { padding:48px 0; };`
);

// Nav links use NAV_LABELS
s = s.replace(
  /\{NAV_SECTION_IDS\.map\(\(id\) => \(\s*<li key=\{id\}>\s*<a[^>]+>\s*\{id\.charAt\(0\)\.toUpperCase\(\) \+ id\.slice\(1\)\}\s*<\/a>/,
  `{NAV_SECTION_IDS.map((id) => (
                <li key={id}>
                  <a
                    href={\`#$\{id\}\`}
                    className={activeSection === id ? "cs-nav-active" : ""}
                  >
                    {NAV_LABELS[id] || id}`
);

// Fix the template - I may have broken the href - let me check - actually the original was href={\`#${id}\`} - I need to fix

fs.writeFileSync(outPath, s);
console.log("Wrote", outPath, "bytes", fs.statSync(outPath).size);
