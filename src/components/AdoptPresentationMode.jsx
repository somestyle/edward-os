import React, { Fragment, useEffect, useState, useCallback } from "react";
import { createPortal } from "react-dom";
import { X, ChevronUp, ChevronDown } from "lucide-react";

const TOTAL_SLIDES = 16;

const PROCESS_STEPS = ["1", "2", "3", "4", "5", "Final"];

function ProcessIterationInfographic() {
  return (
    <div className="apm-process-infographic shrink-0" aria-hidden>
      <div className="apm-process-infographic-track">
        {PROCESS_STEPS.map((label, i) => (
          <Fragment key={label}>
            <div className="apm-process-infographic-node">
              <span>{label}</span>
            </div>
            {i < PROCESS_STEPS.length - 1 ? <div className="apm-process-infographic-connector" /> : null}
          </Fragment>
        ))}
      </div>
      <p className="apm-process-infographic-caption">Five iterations to v2</p>
    </div>
  );
}

const REFLECTION_ITEMS = [
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
];

function SlideChrome({ children, className = "" }) {
  return (
    <div
      className={`apm-slide flex h-full min-h-0 w-full flex-1 flex-col overflow-hidden overflow-x-hidden bg-[#fcfbfa] px-5 py-4 sm:px-8 sm:py-5 md:px-10 md:py-6 ${className}`}
    >
      <div className="mx-auto flex h-full min-h-0 w-full max-w-[min(1200px,100%)] flex-1 flex-col overflow-hidden">
        {children}
      </div>
    </div>
  );
}

function IterationSlide({ iter, bridgeCaption, hideLearned }) {
  const singleCol = hideLearned || !iter.gaps?.length;
  return (
    <SlideChrome>
      <div
        className="cs-iter apm-iter flex min-h-0 flex-1 flex-col gap-1.5"
        style={{ border: "none" }}
      >
        <div className="shrink-0">
          <div className="cs-iter-header">
            <div className="cs-iter-badge" style={{ background: iter.vBg }}>
              {iter.iterLabel}
            </div>
            <div className="cs-iter-name">{iter.label}</div>
          </div>
          <div className="cs-iter-headline">{iter.headline}</div>
        </div>
        <div className="cs-iter-media apm-iter-media">
          <img src={iter.mediaSrc} alt={iter.mediaLabel} />
        </div>
        <div className={`cs-iter-analysis shrink-0${singleCol ? " single-col" : ""}`}>
          <div className="cs-iter-col">
            <div className="cs-iter-col-head worked">
              <svg className="cs-iter-col-head-icon" viewBox="0 0 14 14" fill="none" aria-hidden>
                <path d="M2.5 7.5l3 3 6-6" stroke="#16a34a" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
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
          {!hideLearned && iter.gaps?.length > 0 && (
            <div className="cs-iter-col">
              <div className="cs-iter-col-head learned">
                <svg className="cs-iter-col-head-icon" viewBox="0 0 14 14" fill="none" aria-hidden>
                  <circle cx="7" cy="7" r="5" stroke="#ea580c" strokeWidth="1.6" />
                  <path d="M7 4.5v3M7 9.5v.5" stroke="#ea580c" strokeWidth="1.6" strokeLinecap="round" />
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
        {bridgeCaption ? (
          <p className="shrink-0 text-center text-[11px] italic leading-snug text-stone-400">{bridgeCaption}</p>
        ) : null}
      </div>
    </SlideChrome>
  );
}

function ArchDiagram({ presentation = false }) {
  return (
    <div className={`cs-arch${presentation ? " apm-arch-presentation" : ""}`}>
      {!presentation ? (
        <div className="cs-arch-head">
          <span className="cs-arch-head-title">System Architecture · How the layers connect</span>
          <span className="cs-arch-head-hint">Read top to bottom</span>
        </div>
      ) : null}
      <div className="cs-arch-body">
        <div className="cs-arch-root-wrap">
          <div className="cs-arch-root">
            <div className="cs-arch-root-k">Product</div>
            <div className="cs-arch-root-v">Action Builder</div>
          </div>
        </div>
        <div className="cs-arch-vline-wrap">
          <div className="cs-arch-vline" />
        </div>
        <div className="cs-arch-hrow c4 arch-row-in">
          {[
            ["View", "Instructions View", false],
            ["Edit", "Structured Editor", false],
            ["Code", "WDL Editor", true],
            ["Validate", "Test + Debug", false],
          ].map(([k, v, act]) => (
            <div key={k} className={`cs-arch-node cs-arch-ui${act ? " act" : ""}`}>
              <div className="cs-arch-node-k">{k}</div>
              <div className="cs-arch-node-v">{v}</div>
            </div>
          ))}
        </div>
        <div className="cs-arch-sync">Real-time bidirectional sync · UI and WDL always in agreement</div>
        <div className="cs-arch-hrow c4 arch-row-in">
          {["Input", "API Call", "Data Processing", "Output"].map((v) => (
            <div key={v} className="cs-arch-node cs-arch-type">
              <div className="cs-arch-node-k">Step Type</div>
              <div className="cs-arch-node-v">{v}</div>
            </div>
          ))}
        </div>
        <div className="cs-arch-sync">Structured step templates · reusable, validatable, composable across customers</div>
        <div className="cs-arch-hrow c2 arch-row-in">
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
            <div className="cs-arch-user-v">
              Instructions View shows what will happen before it runs. Edit mode to adjust steps without touching code. Validation surfaces every error before it ships.
            </div>
          </div>
          <div className="cs-arch-user cs-arch-user-eng">
            <div className="cs-arch-user-k">Forward Deploy Engineer gets</div>
            <div className="cs-arch-user-v">
              Live-synced WDL editor for surgical edits. Step-level code access without leaving the surface. Inline test and debug with no context-switching.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AdoptPresentationMode({
  open,
  onClose,
  iterations,
  iterationBridges,
  principles,
  researchMethods,
}) {
  const [slideIndex, setSlideIndex] = useState(0);

  const go = useCallback(
    (delta) => {
      setSlideIndex((i) => Math.min(TOTAL_SLIDES - 1, Math.max(0, i + delta)));
    },
    []
  );

  const handleClose = useCallback(() => {
    setSlideIndex(0);
    onClose();
  }, [onClose]);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === "Escape") {
        e.preventDefault();
        handleClose();
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        go(1);
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        go(-1);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, handleClose, go]);

  if (!open || typeof document === "undefined") return null;

  const iter = iterations;

  const slideContent = (() => {
    switch (slideIndex) {
      case 0:
        return (
          <SlideChrome className="min-h-0 flex-col">
            <div className="shrink-0">
              <div className="cs-tags mb-2 flex flex-wrap gap-1.5 md:gap-2">
                <span className="cs-pill cs-pill-green">0 to 1 Design</span>
                <span className="cs-pill cs-pill-warm">Agentic AI</span>
                <span className="cs-pill cs-pill-stone">Enterprise SaaS</span>
              </div>
              <h1
                className="cs-h1 mb-0.5"
                style={{
                  fontSize: "clamp(22px, 3.2vw, 42px)",
                  lineHeight: 1.04,
                }}
              >
                Building trust into <em>agentic AI</em>
              </h1>
              <p className="cs-h1-sub !mt-2 !mb-2" style={{ animation: "none", opacity: 1 }}>
                Adopt AI
              </p>
            </div>
            <div className="apm-media-frame apm-media-frame--hero min-h-0 flex-1 py-1">
              <img
                src="/Projects/Adopt/Adopt_main.gif"
                alt="Adopt AI dashboard in action"
                className="cs-hero-gif apm-hero-gif"
                style={{ animation: "none", opacity: 1 }}
              />
            </div>
            <div className="shrink-0">
              <p
                className="cs-hero-lead !mb-2 !max-w-none text-[12.5px] leading-snug md:text-[13px]"
                style={{ animation: "none", opacity: 1 }}
              >
                When AI stops <strong>advising</strong> and starts <strong>acting</strong>, the design problem changes entirely. The challenge shifts to making system behavior understandable and predictable. This is the story of how I designed a workflow system that gave enterprise teams the confidence to let AI execute on their behalf.
              </p>
            </div>
            <div className="cs-meta mt-auto shrink-0" style={{ animation: "none", opacity: 1 }}>
              {[
                ["Role", "Founding Staff Designer"],
                ["Scope", "0 to 1 · End-to-End"],
                ["Timeline", "6 Months"],
                ["Platform", "Enterprise SaaS · B2B2C"],
              ].map(([k, v]) => (
                <div className="cs-meta-cell" key={k}>
                  <div className="cs-meta-k">{k}</div>
                  <div className="cs-meta-v">{v}</div>
                </div>
              ))}
            </div>
          </SlideChrome>
        );
      case 1:
        return (
          <SlideChrome className="apm-slide-readable apm-slide-context min-h-0 flex-col">
            <div className="shrink-0">
              <div className="cs-kicker">
                <span className="cs-kicker-dot" />
                01 · Context
              </div>
              <h2 className="cs-sh apm-headline-display">
                The product that <em>acts</em>, not just advises
              </h2>
              <p className="cs-p apm-body !max-w-none">
                Adopt AI embeds a Copilot inside enterprise SaaS tools. Instead of answering questions, Adopt <strong>completes the entire workflow on the user&apos;s behalf</strong>. A rep types a natural language request. Adopt navigates the product, fills the form, and submits the record. The Action Builder is the internal tool that lets customers configure those workflows, deciding what steps the AI takes, in what order, and with what data.
              </p>
              <p className="cs-p apm-body !max-w-none">
                As the <strong>founding staff designer</strong>, I owned the full design from first principles: system architecture, interaction model, and the trust model that makes autonomous AI safe inside regulated enterprise environments.
              </p>
            </div>
            <div className="apm-context-lower">
              <div className="apm-context-blocks">
                <div className="cs-callout apm-callout apm-callout--context apm-readable-callout">
                  <span className="cs-callout-mark">&quot;</span>
                  <p className="cs-callout-text">
                    The shift from &quot;here is how&quot; to &quot;done&quot; sounds trivial. When software acts autonomously inside production systems on behalf of real users, every design decision carries real consequence.
                  </p>
                  <span className="cs-callout-label">The core design challenge</span>
                </div>
                <div className="cs-diff apm-diff apm-diff--context apm-readable-diff">
                  <div className="cs-diff-head">What changes when AI acts instead of advises</div>
                  <div className="cs-diff-row">
                    <span className="cs-diff-badge before">Before Adopt</span>
                    <span className="cs-diff-body">
                      &quot;How do I add a customer?&quot; returns a walkthrough or link to a knowledge base. The user has to follow the guide and clicks through every step. Every manual action is a chance for error.
                    </span>
                  </div>
                  <div className="cs-diff-row">
                    <span className="cs-diff-badge after">With Adopt</span>
                    <span className="cs-diff-body">
                      &quot;Add John Doe, john@acme.com as a customer&quot; and <strong>Adopt executes the full workflow end-to-end</strong>. Every action is logged, transparent, and reversible while keeping human in the loop.
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </SlideChrome>
        );
      case 2:
        return (
          <SlideChrome className="apm-slide-user apm-slide-readable apm-slide-user-layout min-h-0 flex-col">
            <div className="shrink-0">
              <div className="cs-kicker">
                <span className="cs-kicker-dot" />
                02 · User
              </div>
              <h2 className="cs-sh apm-headline-display">
                One original target. <em>A constraint that changed everything</em>
              </h2>
              <p className="cs-p apm-body !max-w-none">
                Adopt is B2B2C. Adopt&apos;s customers are SaaS companies that embed the Copilot into their own product. The Action Builder is the tool their internal team uses to configure, refine, and maintain the workflows their end users will execute. We are not designing for Adopt&apos;s own team. We are designing for the people inside each customer&apos;s organization.
              </p>
              <p className="cs-p apm-body !max-w-none">
                We started with one primary target user. Too much flexibility made it hard for users to predict what would happen when an action executed. We introduced constraints to make the system easier to reason about.
              </p>
            </div>
            <div className="apm-user-lower">
              <div className="apm-user-blocks">
                <div className="cs-persona-wrap apm-persona-wrap apm-persona-wrap--slide">
                  <div className="cs-persona cs-persona-pm">
                    <div className="cs-persona-avatar">🧭</div>
                    <div className="cs-persona-body">
                      <div className="cs-persona-role">Original Target User · Customer&apos;s Team</div>
                      <div className="cs-persona-name">SaaS Product Manager</div>
                      <p className="cs-persona-desc">
                        Configures and publishes AI-powered workflows for their end users. Needs to understand what a workflow will do without reading code. Must feel confident before pressing publish.
                      </p>
                      <span className="cs-persona-need">Needs: clarity, structure, confidence</span>
                    </div>
                  </div>
                </div>
                <div className="cs-fde-reveal apm-fde apm-fde--slide">
                  <div className="cs-fde-reveal-icon">⚡</div>
                  <p className="cs-fde-reveal-body">
                    <strong>A second user emerged mid-project.</strong> When the AI studio agent could not handle workflow editing reliably, Adopt needed Forward Deploy Engineers to do that work manually. This was not in the original plan. It changed the design problem entirely and is explained in the iteration section below.
                  </p>
                </div>
              </div>
            </div>
          </SlideChrome>
        );
      case 3:
        return (
          <SlideChrome className="apm-slide-research apm-slide-readable apm-slide-research-layout min-h-0 flex-col">
            <div className="shrink-0">
              <div className="cs-kicker">
                <span className="cs-kicker-dot" />
                03 · Research
              </div>
              <h2 className="cs-sh apm-headline-display">
                How I grounded <em>every decision</em>
              </h2>
              <p className="cs-p apm-body apm-research-intro !max-w-none">
                The platform was technically complex. Research had to bridge product managers who could not read code and engineers who thought in execution layers. I used six methods across the full six-month timeline.
              </p>
            </div>
            <div className="apm-research-lower">
              <div className="apm-research-blocks">
                <div className="cs-research-grid apm-research-grid apm-research-grid--tiles apm-research-grid--centered">
                  {researchMethods.map((m) => (
                    <div key={m.label} className="cs-research-card">
                      <div className="cs-research-icon">{m.icon}</div>
                      <div className="cs-research-label">{m.label}</div>
                      <div className="cs-research-note">{m.note}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </SlideChrome>
        );
      case 4:
        return (
          <SlideChrome className="apm-slide-process apm-slide-process-with-infographic min-h-0 flex-col">
            <div className="shrink-0">
              <div className="cs-kicker">
                <span className="cs-kicker-dot" />
                04 · Design Process
              </div>
              <h2 className="cs-sh apm-headline-display">
                Five iterations. <em>Each one earned.</em>
              </h2>
            </div>
            <div className="apm-process-lower min-h-0 flex-1">
              <ProcessIterationInfographic />
              <div className="apm-process-body">
                <p className="cs-p apm-body apm-body-lead !max-w-none">
                  The path to v2 was not planned in advance.
                </p>
                <p className="apm-process-emphasis mt-5">
                  Each version made sense given what we knew at the time.
                </p>
                <p className="cs-p apm-body apm-body-lead !mt-6 !max-w-none">
                  The learning from each iteration is what decided the next move.
                </p>
              </div>
            </div>
          </SlideChrome>
        );
      case 5:
        return <IterationSlide iter={iter[0]} bridgeCaption={iterationBridges[0]} />;
      case 6:
        return <IterationSlide iter={iter[1]} bridgeCaption={iterationBridges[1]} />;
      case 7:
        return (
          <SlideChrome className="apm-slide-readable apm-fde-slide min-h-0 flex-col">
            <div className="apm-fde-hero shrink-0 w-full text-left">
              <p className="apm-fde-pivot-label">When the problem shifted</p>
              <h2 className="cs-sh apm-headline-display apm-fde-pivot-title">
                A second user enters the picture
              </h2>
            </div>
            <div className="apm-fde-lower">
              <div className="apm-fde-pivot apm-fde-pivot--wide">
              <div className="apm-fde-pivot-highlight">
                <p className="apm-fde-pivot-highlight-k">Who</p>
                <p className="apm-fde-pivot-highlight-name">
                  <span className="apm-fde-fde-mark">Forward Deploy Engineers</span>{" "}
                  <span className="text-stone-500">(FDEs)</span>
                </p>
                <p className="apm-fde-pivot-highlight-sub">
                  The team responsible for debugging and maintaining actions in production.
                </p>
              </div>
              <div className="apm-fde-pivot-copy">
                <p className="apm-body">
                  They were using the builder far more intensively than we had anticipated. They needed surgical code-level access, not just a visual interface.
                </p>
                <p className="apm-body">
                  Designing for one user had left the other without the tools they needed. Both had to be served from the same surface.
                </p>
              </div>
              <p className="apm-fde-pivot-closing">
                This fundamentally changed the product from a self-serve tool into a system that needed to balance{" "}
                <strong>usability</strong> with <strong>deep technical control</strong>.
              </p>
              </div>
            </div>
          </SlideChrome>
        );
      case 8:
        return <IterationSlide iter={iter[2]} bridgeCaption={iterationBridges[2]} />;
      case 9:
        return <IterationSlide iter={iter[3]} bridgeCaption={iterationBridges[3]} />;
      case 10:
        return <IterationSlide iter={iter[4]} bridgeCaption={null} hideLearned />;
      case 11:
        return (
          <SlideChrome className="apm-slide-readable apm-slide-principles min-h-0 flex-col">
            <div className="shrink-0">
              <div className="cs-kicker">
                <span className="cs-kicker-dot" />
                05 · Design Principles
              </div>
              <h2 className="cs-sh apm-headline-display">
                Not guidelines. <em>Hard-won constraints</em>
              </h2>
              <p className="cs-p apm-body !max-w-none">
                These emerged mid-project, each time an iteration revealed what the previous version had gotten structurally wrong.
              </p>
            </div>
            <div className="apm-principles-lower">
              <div className="cs-prin-grid apm-prin-grid apm-prin-grid--spaced apm-prin-grid--slide">
                {principles.map((p) => (
                  <div key={p.n} className="cs-prin">
                    <div className="cs-prin-num">{p.n}</div>
                    <h4 className="cs-prin-h">{p.title}</h4>
                    <p className="cs-prin-p">{p.body}</p>
                  </div>
                ))}
              </div>
            </div>
          </SlideChrome>
        );
      case 12:
        return (
          <SlideChrome className="apm-slide-solution apm-slide-readable apm-slide-solution-layout min-h-0 flex-1 flex-col">
            <div className="shrink-0">
              <div className="cs-kicker">
                <span className="cs-kicker-dot" />
                06 · The Solution
              </div>
              <h2 className="cs-sh apm-headline-display">
                A system designed to <em>earn trust</em>
              </h2>
              <p className="cs-p apm-body apm-slide-solution-intro !max-w-none">
                The v2 Action Builder is a layered system. Starting with what users can read, connecting through to what actually executes, and built to scale toward full agent orchestration.
              </p>
            </div>
            <div className="apm-solution-lower">
              <div className="apm-solution-figure apm-solution-figure--700">
                <div className="apm-media-frame apm-media-frame--border apm-media-frame--solution apm-media-frame--solution-tight min-h-0 flex-1 overflow-hidden rounded-lg border border-stone-200 bg-white shadow-sm">
                  <img src="/Projects/Adopt/Adopt_builder_prod.gif" alt="Action Builder final design" />
                </div>
              </div>
            </div>
          </SlideChrome>
        );
      case 13:
        return (
          <SlideChrome className="apm-slide-arch apm-slide-arch--overflow min-h-0 flex-col">
            <h2 className="cs-sh apm-headline-display apm-arch-slide-title shrink-0">
              System Architecture · How the layers connect
            </h2>
            <div className="apm-arch-stage apm-arch-stage--centered min-h-0 flex-1">
              <ArchDiagram presentation />
            </div>
          </SlideChrome>
        );
      case 14:
        return (
          <SlideChrome className="apm-slide-readable apm-slide-impact min-h-0 flex-col">
            <div className="shrink-0">
              <div className="cs-kicker">
                <span className="cs-kicker-dot" />
                07 · Impact
              </div>
              <h2 className="cs-sh apm-headline-display">
                Results that proved <em>the decisions right</em>
              </h2>
              <p className="cs-p apm-body !max-w-none">
                Each number maps directly to a design decision made during the iteration process and a real cost that existed before v2 shipped.
              </p>
            </div>
            <div className="apm-impact-lower">
            <div className="cs-metrics apm-metrics apm-metrics--spaced">
              <div className="cs-metric">
                <div className="cs-metric-num blue">50%</div>
                <div className="cs-metric-lbl">Faster to debug</div>
                <div className="cs-metric-sub">After UI to WDL sync shipped</div>
              </div>
              <div className="cs-metric">
                <div className="cs-metric-num green">+25%</div>
                <div className="cs-metric-lbl">Higher publish success</div>
                <div className="cs-metric-sub">Deployment rate post-v2</div>
              </div>
              <div className="cs-metric">
                <div className="cs-metric-num orange">90%</div>
                <div className="cs-metric-lbl">Reduction in drift errors</div>
                <div className="cs-metric-sub">Code and interface near-perfectly aligned</div>
              </div>
            </div>
            <div className="cs-impact-grid apm-impact-grid apm-impact-grid--spaced apm-impact-grid--balanced">
              <div className="cs-outcome-card">
                <div className="cs-outcome-head">Qualitative shifts</div>
                {[
                  {
                    h: "PMs could validate before deploying",
                    p: "Non-engineers saw exactly what would execute and confirmed it was correct before it ran in front of a customer.",
                  },
                  {
                    h: "Engineers stopped context-switching",
                    p: "One surface for editing, testing, and debugging replaced a fragmented multi-tool workflow that had been silently reintroducing bugs.",
                  },
                  {
                    h: "Step reuse became the default",
                    p: "Structured step templates grew into a shared library across every enterprise customer, cutting setup time per new client significantly.",
                  },
                ].map((o) => (
                  <div key={o.h} className="cs-outcome-row">
                    <div className="cs-outcome-dot" />
                    <div>
                      <div className="cs-outcome-h">{o.h}</div>
                      <p className="cs-outcome-p">{o.p}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="cs-stat-col apm-stat-col">
                <div className="cs-stat-hero">
                  <div className="cs-stat-hero-n">7×</div>
                  <div className="cs-stat-hero-l">Workflow step reuse across customers</div>
                  <p className="cs-stat-hero-s">
                    Structured step templates grew into a shared library. Each new customer came pre-loaded with reusable building blocks, cutting onboarding measurably.
                  </p>
                </div>
                <div className="cs-stat-next">
                  <div className="cs-stat-next-k">What this unlocked</div>
                  <p className="cs-stat-next-p">
                    The structured step architecture became the direct foundation for <strong>Studio Agent Orchestration</strong>, Adopt&apos;s next product milestone.
                  </p>
                </div>
              </div>
            </div>
            </div>
          </SlideChrome>
        );
      case 15:
        return (
          <SlideChrome className="apm-slide-readable min-h-0 flex-col">
            <div className="cs-kicker">
              <span className="cs-kicker-dot" />
              08 · Reflection
            </div>
            <h2 className="cs-sh apm-headline-display">
              What I would <em>do differently</em>
            </h2>
            <p className="cs-p apm-body !max-w-none">
              Four things I carry forward from this project into every complex systems problem I take on next.
            </p>
            <ul className="cs-learnings apm-learnings apm-learnings--spaced mt-3 min-h-0 flex-1">
              {REFLECTION_ITEMS.map((l, i) => (
                <li key={l.h} className="cs-learning">
                  <div className="cs-learning-n">{String(i + 1).padStart(2, "0")}</div>
                  <div>
                    <div className="cs-learning-h">{l.h}</div>
                    <p className="cs-learning-p">{l.b}</p>
                  </div>
                </li>
              ))}
            </ul>
          </SlideChrome>
        );
      default:
        return null;
    }
  })();

  const portal = (
    <div
      className="apm-root fixed inset-0 z-[70] flex h-[100dvh] w-full flex-row bg-stone-100 text-stone-800 antialiased"
      role="dialog"
      aria-modal="true"
      aria-label="Presentation mode"
    >
      <div className="min-h-0 min-w-0 flex-1 overflow-hidden">
        <div
          key={slideIndex}
          className="h-full min-h-0 w-full"
          style={{ animation: "apmSlideIn 280ms ease-out both" }}
        >
          <div className="apm-stage-wrap">
            <div className="apm-stage">{slideContent}</div>
          </div>
        </div>
      </div>

      <div className="pointer-events-auto flex shrink-0 items-center border-l border-stone-200/90 bg-stone-100 py-4 pl-2 pr-3 md:pr-4">
        <div className="flex flex-col items-center gap-1.5 rounded-full border border-stone-300/90 bg-stone-900/92 px-2 py-3 shadow-xl backdrop-blur-sm">
          <button
            type="button"
            onClick={handleClose}
            className="flex h-10 w-10 items-center justify-center rounded-full text-stone-100 transition hover:bg-white/10"
            aria-label="Close presentation"
          >
            <X size={18} />
          </button>
          <div className="my-0.5 h-px w-7 bg-stone-600" />
          <button
            type="button"
            onClick={() => go(-1)}
            disabled={slideIndex === 0}
            className="flex h-10 w-10 items-center justify-center rounded-full text-stone-100 transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-35"
            aria-label="Previous slide"
          >
            <ChevronUp size={20} />
          </button>
          <button
            type="button"
            onClick={() => go(1)}
            disabled={slideIndex >= TOTAL_SLIDES - 1}
            className="flex h-10 w-10 items-center justify-center rounded-full text-stone-100 transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-35"
            aria-label="Next slide"
          >
            <ChevronDown size={20} />
          </button>
          <p className="mt-1 px-1 text-center text-[10px] font-semibold tabular-nums text-stone-400">
            {slideIndex + 1} / {TOTAL_SLIDES}
          </p>
        </div>
      </div>

      <style>{`
        @keyframes apmSlideIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }

        /* Presentation mode: no in-slide scroll; compact type + spacing */
        .apm-root .apm-slide {
          overflow: hidden;
        }

        /* 16:10 stage - centered, uses full height, letterboxes horizontally when needed */
        .apm-root .apm-stage-wrap {
          container-type: size;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 100%;
          height: 100%;
          min-height: 0;
          padding: clamp(8px, 1dvh, 18px) clamp(10px, 1.2vw, 20px);
          box-sizing: border-box;
        }
        .apm-root .apm-stage {
          display: flex;
          flex-direction: column;
          min-height: 0;
          overflow: hidden;
          aspect-ratio: 16 / 10;
          width: min(100cqw, calc(100cqh * 16 / 10));
          height: min(100cqh, calc(100cqw * 10 / 16));
          max-width: min(1200px, 100%);
          margin: 0 auto;
          border-radius: 10px;
          box-shadow: 0 0 0 1px rgba(28, 25, 23, 0.04);
          background: #fcfbfa;
        }

        /* User slide: same lower-band layout as Context */
        .apm-root .apm-slide-user-layout .apm-user-lower {
          flex: 1 1 0%;
          min-height: 0;
          display: flex;
          flex-direction: column;
          justify-content: center;
          padding-top: clamp(10px, 2cqh, 24px);
          padding-bottom: clamp(10px, 2cqh, 24px);
        }
        .apm-root .apm-slide-user-layout .apm-user-blocks {
          width: 100%;
          max-width: min(600px, 92%);
          margin-left: auto;
          margin-right: auto;
          display: flex;
          flex-direction: column;
          gap: clamp(16px, 3cqh, 28px);
        }
        .apm-root .apm-slide-user-layout .apm-persona-wrap--slide {
          margin-top: 0 !important;
        }
        .apm-root .apm-slide-user-layout .apm-fde--slide {
          margin-top: 0 !important;
        }

        /* Research: intro + centered tile band */
        .apm-root .apm-slide-research-layout .apm-research-intro {
          font-size: clamp(14px, 1.55cqw, 16px);
          line-height: 1.58;
        }
        .apm-root .apm-slide-research-layout .apm-research-lower {
          flex: 1 1 0%;
          min-height: 0;
          display: flex;
          flex-direction: column;
          justify-content: center;
          padding-top: clamp(8px, 1.5cqh, 20px);
        }
        .apm-root .apm-slide-research-layout .apm-research-blocks {
          width: 100%;
          max-width: min(960px, 98%);
          margin: 0 auto;
        }
        .apm-root .apm-slide-research-layout .apm-research-grid--centered {
          min-height: 0;
        }
        .apm-root .apm-slide-research-layout .apm-research-grid--centered .cs-research-card {
          padding: clamp(14px, 2.2cqh, 20px) clamp(14px, 2cqw, 18px);
        }
        .apm-root .apm-slide-research-layout .apm-research-grid--centered .cs-research-icon {
          font-size: clamp(17px, 2.3cqw, 24px);
        }
        .apm-root .apm-slide-research-layout .apm-research-grid--centered .cs-research-label {
          font-size: clamp(12.5px, 1.5cqw, 14.5px);
        }
        .apm-root .apm-slide-research-layout .apm-research-grid--centered .cs-research-note {
          font-size: clamp(11.5px, 1.35cqw, 14px);
          line-height: 1.55;
        }

        /* Design process: 1-5-Final infographic */
        .apm-root .apm-slide-process-with-infographic .apm-process-lower {
          flex: 1 1 0%;
          min-height: 0;
          display: flex;
          flex-direction: column;
          justify-content: center;
          gap: clamp(14px, 2.5cqh, 24px);
          padding-top: clamp(4px, 1cqh, 12px);
        }
        .apm-root .apm-process-infographic {
          width: 100%;
          max-width: min(1100px, 100%);
          margin: 0 auto;
        }
        .apm-root .apm-process-infographic-track {
          display: flex;
          align-items: center;
          justify-content: center;
          flex-wrap: wrap;
          gap: 0;
          row-gap: 12px;
        }
        .apm-root .apm-process-infographic-node {
          display: flex;
          align-items: center;
          justify-content: center;
          min-width: 108px;
          height: 108px;
          padding: 0 18px;
          border-radius: 999px;
          font-size: clamp(22px, 3.2cqw, 34px);
          font-weight: 800;
          letter-spacing: 0.02em;
          color: #1c1917;
          background: #fff;
          border: 4px solid #93c5fd;
          box-shadow: 0 2px 8px rgba(37, 99, 235, 0.14);
        }
        .apm-root .apm-process-infographic-node span {
          line-height: 1;
        }
        .apm-root .apm-process-infographic-connector {
          width: clamp(36px, 8cqw, 84px);
          height: 9px;
          background: linear-gradient(90deg, #bfdbfe, #93c5fd);
          border-radius: 4px;
          flex-shrink: 0;
        }
        .apm-root .apm-process-infographic-caption {
          margin: clamp(18px, 3cqh, 28px) auto 0;
          text-align: center;
          width: 100%;
          max-width: 42rem;
          font-size: clamp(11px, 1.2cqw, 13px);
          font-weight: 700;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: #a8a29e;
        }
        .apm-root .apm-slide-process-with-infographic .apm-process-body {
          border-top: 1px solid rgba(231, 229, 228, 0.95);
          padding-top: clamp(14px, 2.2cqh, 22px);
          text-align: center;
          max-width: min(52rem, 100%);
          margin-left: auto;
          margin-right: auto;
        }
        .apm-root .apm-slide-process-with-infographic .apm-body-lead {
          font-size: clamp(15px, 1.75cqw, 18px);
          line-height: 1.55;
        }
        .apm-root .apm-slide-process-with-infographic .apm-process-emphasis {
          max-width: none;
          font-size: clamp(18px, 2.1cqw, 24px);
        }

        /* FDE pivot: key-slide headline band + full-width body */
        .apm-root .apm-fde-slide .apm-fde-hero {
          text-align: left;
        }
        .apm-root .apm-fde-slide .apm-fde-pivot-label {
          margin-bottom: 6px;
        }
        .apm-root .apm-fde-slide .apm-fde-pivot-title {
          margin-bottom: 0;
          text-align: left;
        }
        .apm-root .apm-fde-slide .apm-fde-lower {
          flex: 1 1 0%;
          min-height: 0;
          display: flex;
          flex-direction: column;
          justify-content: center;
          padding-top: clamp(8px, 1.5cqh, 20px);
        }
        .apm-root .apm-fde-pivot--wide {
          width: 100%;
          max-width: min(720px, 100%);
          margin: 0;
          gap: clamp(14px, 2.5cqh, 22px);
        }

        /* Principles + Solution: vertical centering of lower band */
        .apm-root .apm-slide-principles .apm-principles-lower {
          flex: 1 1 0%;
          min-height: 0;
          display: flex;
          flex-direction: column;
          justify-content: center;
          padding-top: clamp(8px, 1.5cqh, 18px);
          padding-bottom: clamp(8px, 1.5cqh, 18px);
        }
        .apm-root .apm-slide-readable.apm-slide-principles .apm-prin-grid--spaced.apm-prin-grid--slide {
          flex: 0 1 auto !important;
          margin-top: 0 !important;
          align-content: center;
        }
        .apm-root .apm-slide-principles .apm-prin-grid--slide .cs-prin-h {
          font-size: clamp(14px, 1.5cqw, 16px);
        }
        .apm-root .apm-slide-principles .apm-prin-grid--slide .cs-prin-p {
          font-size: clamp(12.5px, 1.35cqw, 14.5px);
          line-height: 1.55;
        }

        .apm-root .apm-slide-solution-layout .apm-slide-solution-intro {
          font-size: clamp(14.5px, 1.6cqw, 17px);
          line-height: 1.55;
        }
        .apm-root .apm-slide-solution-layout .apm-solution-lower {
          flex: 1 1 0%;
          min-height: 0;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          padding-top: clamp(8px, 1.5cqh, 16px);
        }
        .apm-root .apm-solution-figure--700 {
          width: 100%;
          max-width: 700px;
          align-items: center;
          padding: 0 !important;
        }
        .apm-root .apm-solution-figure--700 .apm-media-frame {
          width: 100%;
          max-width: 700px;
          padding: 0 !important;
        }
        .apm-root .apm-media-frame--solution-tight img {
          display: block;
          width: 100%;
          height: auto;
        }

        /* Impact: fill column; right stack equal split to match left card height */
        .apm-root .apm-slide-impact .apm-impact-lower {
          flex: 1 1 0%;
          min-height: 0;
          display: flex;
          flex-direction: column;
          justify-content: center;
          gap: clamp(10px, 1.8cqh, 16px);
          padding-top: clamp(4px, 1cqh, 12px);
        }
        .apm-root .apm-slide-impact .apm-impact-grid--balanced {
          display: grid;
          grid-template-columns: 1fr 1fr;
          align-items: stretch;
          gap: clamp(12px, 2cqh, 18px);
        }
        .apm-root .apm-slide-impact .apm-stat-col {
          display: flex;
          flex-direction: column;
          gap: 10px;
          min-height: 100%;
        }
        .apm-root .apm-slide-impact .apm-stat-col .cs-stat-hero,
        .apm-root .apm-slide-impact .apm-stat-col .cs-stat-next {
          flex: 1 1 0%;
          min-height: 0;
          display: flex;
          flex-direction: column;
        }

        .apm-root .apm-headline-display {
          font-size: clamp(22px, 2.95cqw, 40px);
          line-height: 1.07;
          letter-spacing: -0.03em;
          margin-bottom: 14px;
        }
        .apm-root .apm-headline-display em {
          font-style: italic;
          color: #2563eb;
        }

        /* Readable deck slides: larger body + section rhythm */
        .apm-root .apm-slide-readable .apm-body {
          font-size: clamp(13.5px, 1.55cqw, 15.5px);
          line-height: 1.58;
        }
        .apm-root .apm-slide-readable .cs-p + .cs-p {
          margin-top: 14px;
        }
        .apm-root .apm-slide-readable .cs-kicker {
          margin-bottom: 8px;
        }
        .apm-root .apm-slide-readable .apm-readable-callout {
          margin-top: 16px;
        }
        .apm-root .apm-slide-readable .apm-readable-diff {
          margin-top: 16px;
        }

        /* Context slide: intro up top; callout + diff in a narrower column using space below */
        .apm-root .apm-slide-context .apm-readable-callout,
        .apm-root .apm-slide-context .apm-readable-diff {
          margin-top: 0 !important;
        }
        .apm-root .apm-slide-context .apm-context-lower {
          flex: 1 1 0%;
          min-height: 0;
          display: flex;
          flex-direction: column;
          justify-content: center;
          padding-top: clamp(12px, 2.5cqh, 28px);
          padding-bottom: clamp(12px, 2.5cqh, 28px);
        }
        .apm-root .apm-slide-context .apm-context-blocks {
          width: 100%;
          max-width: min(600px, 92%);
          margin-left: auto;
          margin-right: auto;
          display: flex;
          flex-direction: column;
          gap: clamp(20px, 3.5cqh, 36px);
        }
        .apm-root .apm-slide-context .apm-callout--context {
          margin: 0;
          padding: clamp(18px, 2.6cqh, 24px) clamp(20px, 2.5cqw, 26px) clamp(16px, 2.2cqh, 20px);
          border-radius: 14px;
        }
        .apm-root .apm-slide-context .apm-callout--context .cs-callout-mark {
          font-size: clamp(72px, 8cqw, 88px);
          top: -12px;
          left: 16px;
        }
        .apm-root .apm-slide-context .apm-callout--context .cs-callout-text {
          font-size: clamp(15px, 1.55cqw, 18px);
          line-height: 1.5;
          max-width: none;
        }
        .apm-root .apm-slide-context .apm-callout--context .cs-callout-label {
          font-size: clamp(10px, 0.95cqw, 11px);
          margin-top: 10px;
        }
        .apm-root .apm-slide-context .apm-diff--context {
          margin-top: 0;
          border-radius: 12px;
        }
        .apm-root .apm-slide-context .apm-diff--context .cs-diff-head {
          padding: clamp(10px, 1.35cqh, 14px) clamp(16px, 2cqw, 20px);
          font-size: clamp(10.5px, 1.05cqw, 11.5px);
        }
        .apm-root .apm-slide-context .apm-diff--context .cs-diff-row {
          padding: clamp(14px, 2cqh, 18px) clamp(16px, 2cqw, 20px);
          gap: clamp(14px, 2.2cqw, 18px);
        }
        .apm-root .apm-slide-context .apm-diff--context .cs-diff-body {
          font-size: clamp(13px, 1.35cqw, 15px);
          line-height: 1.52;
        }
        .apm-root .apm-slide-context .apm-diff--context .cs-diff-badge {
          font-size: clamp(9.5px, 0.95cqw, 10.5px);
        }
        .apm-root .apm-slide-readable .apm-prin-grid--spaced {
          flex: 1 1 0%;
          min-height: 0;
          margin-top: 14px;
          gap: clamp(12px, 2cqh, 18px);
          align-content: start;
        }
        .apm-root .apm-slide-readable .apm-prin-grid--spaced .cs-prin {
          padding: clamp(16px, 2.2cqh, 22px);
        }
        .apm-root .apm-slide-readable .apm-prin-grid--spaced .cs-prin-h {
          font-size: clamp(13.5px, 1.45cqw, 15px);
        }
        .apm-root .apm-slide-readable .apm-prin-grid--spaced .cs-prin-p {
          font-size: clamp(12px, 1.25cqw, 13.5px);
          line-height: 1.52;
        }
        .apm-root .apm-slide-readable .apm-metrics--spaced {
          margin-top: 12px;
        }
        .apm-root .apm-slide-readable .apm-impact-grid--spaced {
          margin-top: 12px;
          gap: 14px;
        }
        .apm-root .apm-slide-readable .apm-impact-grid--spaced .cs-outcome-card {
          padding: 14px 16px;
        }
        .apm-root .apm-slide-readable .apm-impact-grid--spaced .cs-outcome-h {
          font-size: 13px;
        }
        .apm-root .apm-slide-readable .apm-impact-grid--spaced .cs-outcome-p {
          font-size: 12px;
          line-height: 1.5;
        }
        .apm-root .apm-slide-readable .apm-impact-grid--spaced .cs-stat-hero-n {
          font-size: 40px;
        }
        .apm-root .apm-slide-readable .apm-learnings--spaced {
          flex: 1 1 0%;
          min-height: 0;
          margin-top: 12px;
          display: flex;
          flex-direction: column;
          justify-content: space-evenly;
          gap: clamp(10px, 1.8cqh, 18px);
        }
        .apm-root .apm-slide-readable .apm-learnings--spaced .cs-learning {
          padding: 12px 0;
        }
        .apm-root .apm-slide-readable .apm-learnings--spaced .cs-learning-h {
          font-size: 14px;
        }
        .apm-root .apm-slide-readable .apm-learnings--spaced .cs-learning-p {
          font-size: 12.5px;
          line-height: 1.52;
        }

        .apm-root .apm-solution-figure {
          display: flex;
          flex-direction: column;
          flex: 1 1 0%;
          min-height: 0;
          padding: 2px;
        }
        .apm-root .apm-media-frame--solution {
          padding: clamp(12px, 2cqh, 20px);
        }
        .apm-root .apm-media-frame--solution.apm-media-frame--solution-tight {
          padding: 0 !important;
        }
        .apm-root .apm-media-frame--solution img {
          transform: scale(1.035);
          transform-origin: center center;
        }
        .apm-root .apm-media-frame--solution.apm-media-frame--solution-tight img {
          transform: none;
        }

        .apm-root .apm-slide-user .cs-persona-wrap {
          margin-top: 14px;
        }
        .apm-root .apm-slide-user .apm-fde {
          margin-top: 14px;
        }
        .apm-root .apm-slide-readable.apm-slide-user .cs-persona-wrap {
          margin-top: 18px;
        }
        .apm-root .apm-slide-readable.apm-slide-user .apm-fde {
          margin-top: 18px;
        }

        .apm-root .apm-slide-research .apm-research-grid--tiles {
          flex: 1 1 0%;
          min-height: 0;
          margin-top: 14px;
          gap: clamp(10px, 1.8cqh, 16px);
          align-content: start;
        }
        .apm-root .apm-slide-research .apm-research-grid--tiles .cs-research-card {
          padding: clamp(12px, 2cqh, 18px) clamp(12px, 1.8cqw, 16px);
          min-height: 0;
        }
        .apm-root .apm-slide-research .apm-research-grid--tiles .cs-research-icon {
          font-size: clamp(16px, 2.2cqw, 22px);
          margin-bottom: 8px;
        }
        .apm-root .apm-slide-research .apm-research-grid--tiles .cs-research-label {
          font-size: clamp(11.5px, 1.35cqw, 13px);
        }
        .apm-root .apm-slide-research .apm-research-grid--tiles .cs-research-note {
          font-size: clamp(11px, 1.2cqw, 12.5px);
          line-height: 1.5;
        }
        .apm-root .apm-slide-readable.apm-slide-research .apm-research-grid--tiles {
          gap: clamp(12px, 2.2cqh, 20px);
          margin-top: 16px;
        }
        .apm-root .apm-slide-readable.apm-slide-research .apm-research-grid--tiles .cs-research-label {
          font-size: clamp(12px, 1.45cqw, 14px);
        }
        .apm-root .apm-slide-readable.apm-slide-research .apm-research-grid--tiles .cs-research-note {
          font-size: clamp(11.5px, 1.35cqw, 13.5px);
          line-height: 1.55;
        }

        .apm-root .apm-slide-process .apm-process-body {
          display: flex;
          flex-direction: column;
          justify-content: center;
          padding: clamp(12px, 2.5cqh, 32px) 0 clamp(8px, 1.5cqh, 20px);
          border-top: 1px solid rgba(231, 229, 228, 0.95);
        }
        .apm-root .apm-slide-process .apm-body-lead {
          font-size: clamp(14px, 1.65cqw, 17px);
          line-height: 1.55;
        }
        .apm-root .apm-slide-process .apm-process-emphasis {
          font-family: "Lora", Georgia, serif;
          font-size: clamp(17px, 2cqw, 22px);
          font-weight: 600;
          line-height: 1.35;
          color: #0c0a09;
          letter-spacing: -0.02em;
          max-width: 42ch;
        }

        .apm-root .apm-fde-pivot {
          display: flex;
          flex-direction: column;
          gap: clamp(12px, 2cqh, 20px);
          width: 100%;
          max-width: min(640px, 100%);
          margin: 0 auto;
        }
        .apm-root .apm-fde-pivot-label {
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.16em;
          text-transform: uppercase;
          color: #b45309;
          margin: 0;
        }
        .apm-root .apm-fde-pivot-title {
          margin-bottom: 0;
          text-wrap: balance;
        }
        .apm-root .apm-fde-pivot-highlight {
          border-radius: 12px;
          border: 1px solid rgba(251, 191, 36, 0.55);
          background: linear-gradient(145deg, rgba(255, 251, 235, 0.98), rgba(254, 243, 199, 0.45));
          padding: clamp(14px, 2.2cqh, 20px) clamp(16px, 2.5cqw, 22px);
          box-shadow: 0 1px 0 rgba(255, 255, 255, 0.8) inset;
        }
        .apm-root .apm-fde-pivot-highlight-k {
          font-size: 9px;
          font-weight: 700;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: #92400e;
          margin: 0 0 6px;
        }
        .apm-root .apm-fde-pivot-highlight-name {
          font-size: clamp(15px, 1.75cqw, 18px);
          font-weight: 700;
          color: #0c0a09;
          line-height: 1.35;
          margin: 0;
        }
        .apm-root .apm-fde-fde-mark {
          color: #b45309;
          font-weight: 800;
          letter-spacing: -0.02em;
        }
        .apm-root .apm-fde-pivot-highlight-sub {
          font-size: clamp(12px, 1.35cqw, 13.5px);
          line-height: 1.5;
          color: #57534e;
          margin: 10px 0 0;
        }
        .apm-root .apm-fde-pivot-copy {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .apm-root .apm-fde-pivot-copy .apm-body {
          font-size: 13px;
          line-height: 1.55;
          color: #44403c;
          margin: 0;
        }
        .apm-root .apm-fde-pivot-closing {
          margin: 4px 0 0;
          padding-top: clamp(14px, 2cqh, 18px);
          border-top: 1px solid #e7e5e4;
          font-size: 13px;
          line-height: 1.55;
          color: #57534e;
        }
        .apm-root .apm-fde-pivot-closing strong {
          color: #1c1917;
          font-weight: 600;
        }

        .apm-root .apm-slide-solution .apm-slide-solution-intro {
          font-size: clamp(14px, 1.5cqw, 16px);
          line-height: 1.55;
          margin-bottom: 0;
        }

        /* Images / GIFs: use all remaining vertical space in the slide */
        .apm-root .apm-media-frame {
          min-height: 0;
          flex: 1 1 0%;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
        }
        .apm-root .apm-media-frame img {
          max-height: 100%;
          max-width: 100%;
          height: auto;
          width: auto;
          min-height: 0;
          object-fit: contain;
        }
        /*
         * Hero GIF: global .cs-hero-gif sets width:100%, which scales by width first and
         * overflows the flex frame vertically. Scale by bounding box instead (no crop).
         */
        .apm-root .apm-media-frame--hero .apm-hero-gif {
          display: block;
          box-sizing: border-box;
          width: auto;
          max-width: 100%;
          height: auto;
          max-height: 100%;
          min-height: 0;
          margin: 0;
          object-fit: contain;
          object-position: center center;
          flex-shrink: 1;
          align-self: center;
        }
        .apm-root .apm-media-frame--border {
          background: #fff;
        }
        .apm-root .cs-kicker {
          margin-bottom: 6px;
        }
        .apm-root .apm-headline-tight {
          font-size: clamp(17px, 2.15vw, 30px);
          line-height: 1.06;
          letter-spacing: -0.02em;
          margin-bottom: 8px;
        }
        .apm-root .apm-body {
          font-size: 13px;
          line-height: 1.5;
        }
        .apm-root .cs-p + .cs-p {
          margin-top: 10px;
        }

        .apm-root .apm-callout {
          margin: 12px 0;
          padding: 14px 18px 12px;
        }
        .apm-root .apm-callout .cs-callout-mark {
          font-size: 64px;
          top: -10px;
          left: 14px;
        }
        .apm-root .apm-callout .cs-callout-text {
          font-size: 15px;
          line-height: 1.45;
        }
        .apm-root .apm-callout .cs-callout-label {
          margin-top: 8px;
        }
        .apm-root .apm-diff {
          margin-top: 10px;
        }
        .apm-root .apm-diff .cs-diff-head {
          padding: 8px 14px;
        }
        .apm-root .apm-diff .cs-diff-row {
          padding: 10px 14px;
          gap: 12px;
        }
        .apm-root .apm-diff .cs-diff-body {
          font-size: 12.5px;
          line-height: 1.45;
        }

        .apm-root .apm-persona-wrap {
          margin-top: 10px;
        }
        .apm-root .apm-persona-wrap .cs-persona {
          padding: 10px 14px;
          gap: 10px;
        }
        .apm-root .apm-persona-wrap .cs-persona-avatar {
          width: 38px;
          height: 38px;
          font-size: 18px;
        }
        .apm-root .apm-persona-wrap .cs-persona-name {
          font-size: 16px;
          margin-bottom: 6px;
        }
        .apm-root .apm-persona-wrap .cs-persona-desc {
          font-size: 12px;
          line-height: 1.45;
          margin-bottom: 8px;
        }
        .apm-root .apm-fde {
          margin-top: 10px;
          padding: 10px 14px;
          gap: 10px;
        }
        .apm-root .apm-fde .cs-fde-reveal-icon {
          width: 38px;
          height: 38px;
          font-size: 18px;
        }
        .apm-root .apm-fde .cs-fde-reveal-body {
          font-size: 12px;
          line-height: 1.45;
        }
        .apm-root .apm-fde-slide {
          align-items: flex-start;
        }

        .apm-root .apm-research-grid {
          margin-top: 8px;
          gap: 8px;
        }
        .apm-root .apm-research-grid .cs-research-card {
          padding: 10px 12px;
        }
        .apm-root .apm-research-grid .cs-research-icon {
          font-size: 15px;
          margin-bottom: 4px;
        }
        .apm-root .apm-research-grid .cs-research-label {
          font-size: 11px;
        }
        .apm-root .apm-research-grid .cs-research-note {
          font-size: 10.5px;
          line-height: 1.45;
        }

        .apm-root .apm-prin-grid {
          margin-top: 8px;
          gap: 10px;
        }
        .apm-root .apm-prin-grid .cs-prin {
          padding: 14px 16px;
        }
        .apm-root .apm-prin-grid .cs-prin-h {
          font-size: 13px;
          margin-bottom: 6px;
        }
        .apm-root .apm-prin-grid .cs-prin-p {
          font-size: 11.5px;
          line-height: 1.45;
        }
        .apm-root .apm-prin-grid .cs-prin-num {
          margin-bottom: 8px;
        }

        .apm-root .apm-iter {
          padding: 4px 0 6px;
          min-height: 0;
          container-type: inline-size;
        }
        .apm-root .apm-iter .cs-iter-header {
          margin-bottom: 8px;
        }
        /* One line: scale with slide width so long headlines still fit */
        .apm-root .apm-iter .cs-iter-headline {
          margin-bottom: 8px;
          line-height: 1.05;
          letter-spacing: -0.035em;
          white-space: nowrap;
          font-size: clamp(10px, 2.08cqw, 16px);
        }
        @container (max-width: 420px) {
          .apm-root .apm-iter .cs-iter-headline {
            white-space: normal;
            line-height: 1.2;
            font-size: clamp(11px, 3.1cqw, 13px);
          }
        }
        .apm-root .apm-iter .apm-iter-media {
          flex: 1 1 0%;
          min-height: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          margin-bottom: 0;
        }
        .apm-root .apm-iter .apm-iter-media img {
          max-height: 100%;
          max-width: 100%;
          width: auto;
          height: auto;
          object-fit: contain;
        }
        .apm-root .apm-iter .cs-iter-analysis {
          gap: 10px;
        }
        .apm-root .apm-iter .cs-iter-col {
          padding: 12px 14px;
        }
        .apm-root .apm-iter .cs-iter-col-head {
          margin-bottom: 8px;
          padding-bottom: 8px;
        }
        .apm-root .apm-iter .cs-iter-bullets {
          gap: 6px;
        }
        .apm-root .apm-iter .cs-iter-bullet {
          font-size: 11.5px;
          line-height: 1.4;
        }

        .apm-root .apm-metrics {
          margin-top: 8px;
        }
        .apm-root .apm-metrics .cs-metric {
          padding: 12px 14px;
        }
        .apm-root .apm-metrics .cs-metric-num {
          font-size: 36px;
          margin-bottom: 4px;
        }
        .apm-root .apm-metrics .cs-metric-lbl {
          font-size: 11px;
        }
        .apm-root .apm-metrics .cs-metric-sub {
          font-size: 9px;
        }

        .apm-root .apm-impact-grid {
          margin-top: 8px;
          gap: 10px;
        }
        .apm-root .apm-impact-grid .cs-outcome-card {
          padding: 12px 14px;
        }
        .apm-root .apm-impact-grid .cs-outcome-head {
          margin-bottom: 8px;
          padding-bottom: 8px;
        }
        .apm-root .apm-impact-grid .cs-outcome-row {
          padding: 8px 0;
          gap: 8px;
        }
        .apm-root .apm-impact-grid .cs-outcome-h {
          font-size: 12px;
        }
        .apm-root .apm-impact-grid .cs-outcome-p {
          font-size: 11px;
          line-height: 1.45;
        }
        .apm-root .apm-impact-grid .cs-stat-hero {
          padding: 12px 14px;
        }
        .apm-root .apm-impact-grid .cs-stat-hero-n {
          font-size: 36px;
        }
        .apm-root .apm-impact-grid .cs-stat-hero-l {
          font-size: 11px;
        }
        .apm-root .apm-impact-grid .cs-stat-hero-s {
          font-size: 10.5px;
          line-height: 1.4;
        }
        .apm-root .apm-impact-grid .cs-stat-next {
          padding: 12px 14px;
        }
        .apm-root .apm-impact-grid .cs-stat-next-p {
          font-size: 11.5px;
          line-height: 1.45;
        }

        .apm-root .apm-learnings {
          margin-top: 8px;
        }
        .apm-root .apm-learnings .cs-learning {
          padding: 10px 0;
          gap: 12px;
        }
        .apm-root .apm-learnings .cs-learning-n {
          width: 36px;
          height: 36px;
          font-size: 11px;
        }
        .apm-root .apm-learnings .cs-learning-h {
          font-size: 13px;
          margin-bottom: 3px;
        }
        .apm-root .apm-learnings .cs-learning-p {
          font-size: 11px;
          line-height: 1.45;
        }

        .apm-root .apm-slide-arch .apm-arch-slide-title {
          font-size: clamp(18px, 2.15cqw, 30px);
          line-height: 1.12;
          margin-bottom: 8px;
          letter-spacing: -0.02em;
        }
        .apm-root .apm-slide-arch--overflow.apm-slide {
          overflow: visible !important;
        }
        .apm-root .apm-slide-arch--overflow > div {
          overflow: visible !important;
        }
        .apm-root .apm-arch-stage {
          display: flex;
          flex-direction: column;
          min-height: 0;
          flex: 1 1 0%;
          overflow: visible;
          align-items: stretch;
        }
        .apm-root .apm-arch-stage--centered {
          justify-content: center;
          align-items: center;
          padding: clamp(10px, 2cqh, 24px) clamp(8px, 1.2cqw, 16px);
        }
        .apm-root .apm-arch-stage--centered .apm-arch-presentation {
          width: 100%;
          max-width: min(880px, 100%);
        }
        .apm-root .apm-arch-presentation {
          margin-top: 0 !important;
          flex: 1 1 auto;
          min-height: 0;
          display: flex;
          flex-direction: column;
          height: auto;
          max-width: 100%;
        }
        .apm-root .apm-arch-presentation .cs-arch-body {
          flex: 0 1 auto;
          min-height: 0;
          display: flex;
          flex-direction: column;
          justify-content: center;
          gap: 0;
          padding: clamp(22px, 4cqh, 36px) clamp(20px, 3cqw, 32px) clamp(24px, 4cqh, 36px);
        }
        .apm-root .apm-arch-presentation .cs-arch-vline-wrap {
          padding: 4px 0 6px;
        }
        .apm-root .apm-arch-presentation .cs-arch-vline {
          width: 3px;
          margin: 0 auto;
          height: clamp(22px, 3.5cqh, 32px);
          border-radius: 2px;
          background: #78716c;
        }
        .apm-root .apm-arch-presentation .cs-arch-hrow::before {
          height: 3px;
          background: #78716c;
          border-radius: 2px;
        }
        .apm-root .apm-arch-presentation .cs-arch-node::before {
          width: 3px;
          height: 14px;
          top: -14px;
          background: #78716c;
          border-radius: 1px;
        }
        .apm-root .apm-arch-presentation .cs-arch-root {
          padding: 14px 32px;
        }
        .apm-root .apm-arch-presentation .cs-arch-root-v {
          font-size: clamp(15px, 1.65cqw, 18px);
        }
        .apm-root .apm-arch-presentation .cs-arch-hrow {
          gap: clamp(10px, 1.6cqw, 14px);
        }
        .apm-root .apm-arch-presentation .cs-arch-node {
          padding: clamp(11px, 1.8cqh, 14px) clamp(10px, 1.4cqw, 12px);
          min-height: clamp(64px, 10cqh, 88px);
          display: flex;
          flex-direction: column;
          justify-content: center;
        }
        .apm-root .apm-arch-presentation .cs-arch-node-k {
          font-size: clamp(8px, 0.9cqw, 10px);
          margin-bottom: 4px;
        }
        .apm-root .apm-arch-presentation .cs-arch-node-v {
          font-size: clamp(11px, 1.25cqw, 13px);
          line-height: 1.32;
        }
        .apm-root .apm-arch-presentation .cs-arch-sync {
          margin: clamp(10px, 1.8cqh, 16px) 0;
          font-size: clamp(8px, 0.95cqw, 10px);
          gap: 10px;
        }
        .apm-root .apm-arch-presentation .cs-arch-sync::before,
        .apm-root .apm-arch-presentation .cs-arch-sync::after {
          background: #d6d3d1;
        }
        .apm-root .apm-arch-presentation .cs-arch-users {
          margin-top: clamp(12px, 2cqh, 20px);
          padding-top: clamp(12px, 2cqh, 20px);
          gap: clamp(10px, 1.6cqh, 14px);
        }
        .apm-root .apm-arch-presentation .cs-arch-user-v {
          font-size: clamp(11px, 1.25cqw, 13px);
          line-height: 1.45;
        }
        .apm-root .apm-arch-presentation .cs-arch-user {
          padding: clamp(12px, 1.8cqh, 16px) clamp(12px, 1.6cqw, 16px);
          min-height: clamp(72px, 12cqh, 120px);
        }

        .apm-root .cs-meta {
          padding: 8px 0 0;
        }
        .apm-root .cs-meta-cell {
          padding: 8px 12px;
        }
        .apm-root .cs-meta-v {
          font-size: 12px;
        }

        .apm-root .apm-slide .cs-h1-sub {
          margin-top: 6px;
          margin-bottom: 6px;
        }
        .apm-root .apm-slide .cs-pill {
          font-size: 10px;
          padding: 3px 8px;
        }

        @media (max-height: 780px) {
          .apm-root .apm-headline-tight {
            font-size: clamp(15px, 1.9vw, 26px);
          }
          .apm-root .apm-body {
            font-size: 12px;
          }
          .apm-root .apm-learnings .cs-learning-p {
            font-size: 10px;
            line-height: 1.4;
          }
          .apm-root .apm-impact-grid .cs-outcome-p {
            font-size: 10px;
          }
        }
      `}</style>
    </div>
  );

  return createPortal(portal, document.body);
}
