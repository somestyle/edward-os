import React, { useState, useEffect, useRef, useMemo, useCallback, lazy, Suspense } from 'react';
import { createPortal } from 'react-dom';
import { 
  Send, Sparkles, ChevronRight, ChevronDown, User, 
  Home, Briefcase, Award, Zap,
  Layout, GraduationCap, Layers,
  BookOpen, Mail, Linkedin, ExternalLink, Lock,
  FileText, Mic2, Newspaper, Download, X
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import WidgetLauncher from './components/widgets/WidgetLauncher';

const AdoptAICaseStudy = lazy(() => import('./components/AdoptAICaseStudy'));
const AdoptAIPlatform = lazy(() => import('./components/AdoptAIPlatform'));
const SamaCareCopilotCaseStudy = lazy(() => import('./components/SamaCareCopilotCaseStudy'));

const prefersReducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

// Random per-tab id so chat turns can be read back as a conversation.
// Not tied to identity and cleared when the tab closes.
const CHAT_SESSION_KEY = 'chat_session_id';
function getChatSessionId() {
  try {
    let id = sessionStorage.getItem(CHAT_SESSION_KEY);
    if (!id) {
      id = crypto.randomUUID();
      sessionStorage.setItem(CHAT_SESSION_KEY, id);
    }
    return id;
  } catch {
    return null; // private mode: log the turn without a thread id
  }
}

// --- Typewriter streaming hook: reveals text word-by-word ---
function useTypewriter(fullText, { speedMs = 45, enabled = true } = {}) {
  const [displayedLength, setDisplayedLength] = useState(0);
  const fullLength = fullText?.length ?? 0;

  useEffect(() => {
    if (!enabled || fullLength === 0) {
      setDisplayedLength(0);
      return;
    }
    // Reduced motion: skip the animation and show the full reply at once
    setDisplayedLength(prefersReducedMotion() ? fullLength : 0);
  }, [enabled, fullText, fullLength]);

  useEffect(() => {
    if (!enabled || fullLength === 0) return;
    if (displayedLength >= fullLength) return;
    const t = setTimeout(() => {
      setDisplayedLength((n) => {
        if (n >= fullLength) return n;
        const nextSpace = fullText.indexOf(' ', n + 1);
        return nextSpace === -1 ? fullLength : Math.min(nextSpace + 1, fullLength);
      });
    }, speedMs);
    return () => clearTimeout(t);
  }, [enabled, fullText, fullLength, displayedLength, speedMs]);

  const displayed = fullText?.slice(0, displayedLength) ?? '';
  const isComplete = fullLength > 0 && displayedLength >= fullLength;
  const skip = useCallback(() => setDisplayedLength(fullLength), [fullLength]);
  return [displayed, isComplete, skip];
}

// --- Typewriter component: reveals text word-by-word and calls onComplete when done ---
function TypewriterText({ content, onComplete, speedMs = 45 }) {
  const [displayed, isComplete, skip] = useTypewriter(content, { speedMs, enabled: !!content });
  const onCompleteRef = useRef(onComplete);
  const hasCalledRef = useRef(false);
  onCompleteRef.current = onComplete;
  useEffect(() => {
    if (!content || content.length === 0) {
      if (!hasCalledRef.current && onCompleteRef.current) {
        hasCalledRef.current = true;
        onCompleteRef.current();
      }
      return;
    }
    if (isComplete && !hasCalledRef.current && onCompleteRef.current) {
      hasCalledRef.current = true;
      onCompleteRef.current();
    }
  }, [content, isComplete]);
  if (!content || content.length === 0) return null;
  return (
    <span onClick={isComplete ? undefined : skip} className={isComplete ? '' : 'cursor-pointer'} title={isComplete ? undefined : 'Click to show full reply'}>
      <MarkdownRenderer>{displayed}</MarkdownRenderer>
    </span>
  );
}

// --- Markdown renderer for chat (bold, links, etc.) ---
function MarkdownRenderer({ children, className = '' }) {
  if (typeof children !== 'string') return <span className={className}>{children}</span>;
  return (
    <span className={className}>
      <ReactMarkdown
        components={{
          a: ({ href, children }) => (
            <a href={href} target="_blank" rel="noreferrer" className="underline text-inherit font-medium hover:opacity-80">
              {children}
            </a>
          ),
          strong: ({ children }) => <strong className="font-bold">{children}</strong>,
          p: ({ children }) => <span className="block">{children}</span>,
        }}
      >
        {children}
      </ReactMarkdown>
    </span>
  );
}

// --- CONFIGURATION ---
// Chat uses /api/chat (Vercel serverless) so the Gemini API key stays on the server.

// --- CV DATA ---
const cvData = {
  about: "I design complex, high-stakes products where automation, control, and trust must coexist. My work focuses on reducing system friction, clarifying decision paths, and turning ambiguous technical constraints into usable, scalable experiences.",
  experience: [
    {
      company: "Adopt AI",
      role: "Design Advisor (Founding Staff Product Designer)",
      period: "Oct 2024 – Present",
      summary: "Led end-to-end experience for the AI Copilot platform spanning agent workflows, tooling, and system UX.",
      highlights: [
        "Led 0–1 design of an agentic copilot across both customer console and end-user experiences",
        "Owned core system surfaces including Tools, Actions, Agents, Data, and integration setup flows",
        "Designed interaction patterns enabling AI-driven actions, orchestration, and natural language control",
        "Translated ambiguous customer needs and technical constraints into clear product decisions balancing automation and user control",
        "Partnered closely with CEO, CTO, and engineering to define product direction and ship foundational platform capabilities"
      ],
      tags: ["AI Agents", "0–1", "System UX", "Platform Design", "SaaS"]
    },
    {
      company: "SamaCare",
      role: "Staff Product Designer",
      period: "Aug 2022 – Sept 2024",
      summary: "First design hire and sole designer, leading healthcare workflows and expanding product offerings through Series B growth.",
      highlights: [
        "First and sole designer for a healthcare SaaS platform managing prior authorization, benefit verification, and enrollment workflows",
        "Designed complex, state-heavy, multi-role workflows in a regulated healthcare environment",
        "Led discovery, prototyping, and usability testing to simplify decision paths and improve system clarity",
        "Built a Chrome extension to extend core workflows and improve day-to-day operational efficiency"
      ],
      tags: ["Healthcare", "Regulated UX", "Workflow Design", "Chrome Extension", "SaaS"]
    },
    {
      company: "Kea AI",
      role: "Head of Product Design",
      period: "Mar 2021 – Jul 2022",
      summary: "First design hire, establishing the design function for an AI-powered voice ordering platform running in live restaurant environments.",
      highlights: [
        "Led 0–1 design for a voice ordering platform spanning restaurant operators, staff, and end customers",
        "Built the company's first design system and established scalable interaction patterns",
        "Defined conversational and suggestion-driven UX patterns to support AI learning and iteration"
      ],
      tags: ["AI", "0–1", "Design Systems", "Conversational UX", "Leadership"]
    },
    {
      company: "Tier1 Financial Solutions (acquired by SS&C Technologies)",
      role: "UX Manager and Lead Product Designer",
      period: "Jan 2017 – Apr 2020",
      summary: "First designer hired; built design foundations for enterprise financial platforms prior to acquisition.",
      highlights: [
        "Led design for portfolio management and trading platforms used by institutional financial services teams",
        "Designed complex, state-heavy workflows across desktop and mobile while balancing regulatory constraints",
        "Established foundational design practices, team norms, and review culture as the organization scaled"
      ],
      tags: ["Enterprise SaaS", "Fintech", "Design Leadership", "Complex Systems"]
    },
    {
      company: "Flybits",
      role: "Product Design Manager",
      period: "Jul 2020 – Mar 2021",
      summary: "Led product design for a B2B fintech platform focused on customer engagement and personalization.",
      highlights: [
        "Partnered cross-functionally with product and engineering during a period of platform growth",
        "Contributed to evolving design culture and collaboration practices"
      ],
      tags: ["Fintech", "B2B SaaS", "Product Design", "Team Leadership"]
    },
    {
      company: "Hubub Inc. (acquired by Stagwell Technologies)",
      role: "UX/UI Designer",
      period: "Apr 2016 – Oct 2016",
      summary: "Redesigned SaaS wealth management platforms to improve usability and system coherence.",
      highlights: [
        "Redesigned core wealth management workflows for institutional users",
        "Improved information architecture and interaction clarity across complex financial products"
      ],
      tags: ["Wealth Tech", "UX/UI", "Information Architecture"]
    },
    {
      company: "Toronto Star",
      role: "Digital Designer, Team Lead",
      period: "Mar 2015 – Apr 2016",
      summary: "Led design pods for the StarTouch iPad app.",
      highlights: [
        "Designed and refined the StarTouch iPad app experience, recognized on Apple's App Store Best of Year list with over 200,000 downloads within 4 months of launch",
        "Led small design pods and developed reusable templates for editorial workflows"
      ],
      tags: ["Media", "Mobile Design", "Team Leadership"]
    },
    {
      company: "Cityhunter App",
      role: "UX Architect",
      period: "Jun 2012 – Sep 2014",
      summary: "Redirected company strategy from web to mobile.",
      highlights: [
        "Led the shift from web to mobile app strategy",
        "Designed end-to-end mobile and admin platform experiences"
      ],
      tags: ["Mobile", "0–1", "UX Architecture", "Product Strategy"]
    },
    {
      company: "BMO Capital Markets",
      role: "Desktop Specialist Lead",
      period: "Jun 2011 – Jul 2014",
      summary: "Led design and analysis for financial desktop applications.",
      highlights: [
        "Designed effective visual representations for complex financial data",
        "Supported and supervised desktop specialist workflows"
      ],
      tags: ["Finance", "Data Visualization", "Desktop UX"]
    }
  ],
  education: [
    { school: "Maryland Institute College of Art", degree: "Master UX Design" },
    { school: "University of California, San Diego", degree: "Certificate Interaction Design" },
    { school: "OCAD University", degree: "Bachelor Advertising & Graphic Design" }
  ],
  skills: [
    "Product Vision", "User Research", "UX/UI Design", "Design Systems", 
    "Interaction Design", "AI-driven Features", "Prototyping", "Strategy"
  ]
};

// --- COMPONENTS ---

// Magic UI Inspired Flickering Grid
const FlickeringGrid = ({
  squareSize = 4,
  gridGap = 6,
  flickerChance = 0.3,
  color = "#60A5FA",
  maxOpacity = 0.3,
  className,
}) => {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const [isInView, setIsInView] = useState(false);
  const [memoizedColor, setMemoizedColor] = useState(color);

  useEffect(() => {
    setMemoizedColor(color);
  }, [color]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId;
    let gridParams;

    const updateCanvasSize = () => {
      const width = container.clientWidth;
      const height = container.clientHeight;
      const dpr = window.devicePixelRatio || 1;
      
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.scale(dpr, dpr);

      const cols = Math.floor(width / (squareSize + gridGap));
      const rows = Math.floor(height / (squareSize + gridGap));

      const squares = new Float32Array(cols * rows);
      for (let i = 0; i < squares.length; i++) {
        squares[i] = Math.random() * maxOpacity;
      }

      gridParams = { cols, rows, squares, dpr };
    };

    updateCanvasSize();
    
    const resizeObserver = new ResizeObserver(() => {
      updateCanvasSize();
    });
    resizeObserver.observe(container);

    const intersectionObserver = new IntersectionObserver(
      ([entry]) => {
        setIsInView(entry.isIntersecting);
      },
      { threshold: 0 }
    );
    intersectionObserver.observe(container);

    const reducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

    const render = () => {
      if (!gridParams) return;
      const { cols, rows, squares } = gridParams;

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = memoizedColor;

      for (let i = 0; i < squares.length; i++) {
        if (Math.random() < flickerChance * 0.05) {
          squares[i] = Math.random() * maxOpacity;
        }
        
        if (squares[i] > 0.01) {
          ctx.globalAlpha = squares[i];
          const col = i % cols;
          const row = Math.floor(i / cols);
          const x = col * (squareSize + gridGap);
          const y = row * (squareSize + gridGap);
          ctx.fillRect(x, y, squareSize, squareSize);
        }
      }
      ctx.globalAlpha = 1;
      // Reduced motion: draw a single static frame instead of flickering
      if (!reducedMotion) animationFrameId = requestAnimationFrame(render);
    };

    if (isInView) {
      render();
    }

    return () => {
      resizeObserver.disconnect();
      intersectionObserver.disconnect();
      cancelAnimationFrame(animationFrameId);
    };
  }, [memoizedColor, squareSize, gridGap, flickerChance, maxOpacity, isInView]);

  return (
    <div ref={containerRef} className={`absolute inset-0 z-0 size-full pointer-events-none ${className}`}>
      <canvas ref={canvasRef} />
    </div>
  );
};

// Mac-Style Dock Button
const DockIcon = ({ active, onClick, icon: Icon, label }) => (
  <div className="relative group flex flex-col items-center">
    <div className="hidden md:block absolute -top-11 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none z-50 scale-95 group-hover:scale-100">
      <div className="bg-stone-900 dark:bg-white text-white dark:text-stone-900 text-[11px] font-bold py-1 px-2.5 rounded-md shadow-xl whitespace-nowrap">
        {label}
        <div className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-stone-900 dark:bg-white rotate-45"></div>
      </div>
    </div>

    <button 
      onClick={onClick}
      className={`
        relative w-9 h-9 md:w-11 md:h-11 rounded-full flex items-center justify-center transition-all duration-300 ease-out
        md:hover:scale-125 md:hover:mx-1.5 md:hover:-translate-y-1.5
        ${active 
          ? 'bg-stone-100 dark:bg-stone-800 text-stone-900 dark:text-white shadow-inner ring-1 ring-black/5 dark:ring-white/10' 
          : 'text-stone-400 dark:text-stone-500 hover:text-stone-600 dark:hover:text-stone-200 hover:bg-stone-50 dark:hover:bg-white/5'}
      `}
    >
      <Icon size={20} strokeWidth={active ? 2.5 : 2} />
      {active && (
        <span className="md:hidden absolute -bottom-0.5 w-0.5 h-0.5 bg-stone-900 dark:bg-white rounded-full"></span>
      )}
    </button>
  </div>
);

// Theme menu bubble: Style (segmented), Mode (toggle)
// Accent hex values for CSS variable --accent (Tailwind 500 shades)
const ACCENT_HEX = {
  blue: '#3b82f6',
  purple: '#a855f7',
  emerald: '#10b981',
  orange: '#f97316',
};

const THEME_STORAGE_KEY = 'edward-os-theme';

// --- VIEWS ---

const HomeView = ({ onNavigate }) => {
  const [waveKey, setWaveKey] = useState(0);
  const [panchiModalOpen, setPanchiModalOpen] = useState(false);
  const [panchiModalClosing, setPanchiModalClosing] = useState(false);

  const closePanchiModal = useCallback(() => {
    setPanchiModalClosing(true);
    setTimeout(() => {
      setPanchiModalOpen(false);
      setPanchiModalClosing(false);
    }, 150);
  }, []);

  useEffect(() => {
    if (!panchiModalOpen) return;
    const onEscape = (e) => { if (e.key === 'Escape') closePanchiModal(); };
    document.addEventListener('keydown', onEscape);
    document.body.style.overflow = 'hidden';
    return () => { document.removeEventListener('keydown', onEscape); document.body.style.overflow = ''; };
  }, [panchiModalOpen, closePanchiModal]);

  return (
  <div className="space-y-12 pb-24 relative">

    {/* Intro Section */}
    <div className="mt-8 relative z-10 stagger-item" style={{ '--stagger-index': 0 }}>
      <div>
        <h1 className="text-3xl md:text-4xl font-bold text-stone-900 dark:text-white mb-3 tracking-tight">
          <span
            key={waveKey}
            role="img"
            aria-label="Wave"
            className="wave-emoji inline-block cursor-pointer select-none"
            onClick={() => setWaveKey((k) => k + 1)}
          >
            👋
          </span>
          {' '}Hi, I'm Edward.
        </h1>
        
        <div className="mb-6">
          <p className="text-lg md:text-xl text-stone-800 dark:text-stone-200 leading-relaxed font-medium">
            I’m a <span className="font-semibold shimmer-text">Staff Product Designer</span> working on agentic workflows, and an <span className="font-semibold shimmer-text">Advisor</span> helping startups build delightful product and AI experiences.
          </p>
        </div>
        
        {/* Key Experience Chips */}
        <div className="flex flex-wrap gap-2 mt-8">
          {["0-to-1", "Design Leadership", "Agentic UX", "Systems Thinking", "B2B2C", "SaaS"].map((tag, i) => (
            <span key={i} className="px-3 py-1 bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 text-xs font-semibold rounded-full border border-stone-200 dark:border-stone-700">
              {tag}
            </span>
          ))}
        </div>
      </div>
    </div>

    {/* What I'm up to recently */}
    <div className="relative z-10 stagger-item" style={{ '--stagger-index': 1 }}>
      <h2 className="text-sm font-bold text-stone-400 dark:text-stone-500 uppercase tracking-wider mb-4">What I'm up to recently</h2>
      <p className="text-stone-500 dark:text-stone-400 text-sm mb-2">👨🏻‍💻 Designing with AI, Designing for AI and Designing the AI</p>
      <p className="text-stone-500 dark:text-stone-400 text-sm mb-6 text-pretty">
        Building with AI daily. Advising early-stage teams on agentic products, product discovery, and prototyping. Also helping small businesses automate everyday workflows.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 text-sm text-stone-600 dark:text-stone-300">
        {/* Left: Listening */}
        <div>
          <p className="font-semibold text-stone-500 dark:text-stone-400 mb-3">🎧 Listening</p>
          <ul className="space-y-4">
            <li>
              <a href="https://open.spotify.com/show/2dR1MUZEHCOnz1LVfNac0j" target="_blank" rel="noopener noreferrer" className="block group/link hover:text-stone-900 dark:hover:text-white transition-colors underline underline-offset-2 decoration-stone-200 dark:decoration-stone-700 hover:decoration-stone-400">
                <span className="block font-medium">Lenny's Podcast</span>
                <span className="text-stone-400 dark:text-stone-500 group-hover/link:text-stone-500 dark:group-hover/link:text-stone-400 text-xs inline-flex items-center gap-1 mt-0.5">
                  Lenny Rachitsky
                  <ExternalLink size={10} className="shrink-0 opacity-70" />
                </span>
              </a>
            </li>
            <li>
              <a href="https://open.spotify.com/show/5Y1NyT6srGx38f5LINbH6c" target="_blank" rel="noopener noreferrer" className="block group/link hover:text-stone-900 dark:hover:text-white transition-colors underline underline-offset-2 decoration-stone-200 dark:decoration-stone-700 hover:decoration-stone-400">
                <span className="block font-medium">Moonshots</span>
                <span className="text-stone-400 dark:text-stone-500 group-hover/link:text-stone-500 dark:group-hover/link:text-stone-400 text-xs inline-flex items-center gap-1 mt-0.5">
                  Peter Diamandis
                  <ExternalLink size={10} className="shrink-0 opacity-70" />
                </span>
              </a>
            </li>
            <li>
              <a href="https://open.spotify.com/show/7qZAVw03FuurfYnWIWwkHY" target="_blank" rel="noopener noreferrer" className="block group/link hover:text-stone-900 dark:hover:text-white transition-colors underline underline-offset-2 decoration-stone-200 dark:decoration-stone-700 hover:decoration-stone-400">
                <span className="block font-medium">Naval</span>
                <span className="text-stone-400 dark:text-stone-500 group-hover/link:text-stone-500 dark:group-hover/link:text-stone-400 text-xs inline-flex items-center gap-1 mt-0.5">
                  Naval Ravikant
                  <ExternalLink size={10} className="shrink-0 opacity-70" />
                </span>
              </a>
            </li>
            <li>
              <a href="https://open.spotify.com/show/4aRP2XSavdtrLG5FZoonOK" target="_blank" rel="noopener noreferrer" className="block group/link hover:text-stone-900 dark:hover:text-white transition-colors underline underline-offset-2 decoration-stone-200 dark:decoration-stone-700 hover:decoration-stone-400">
                <span className="block font-medium">How I AI</span>
                <span className="text-stone-400 dark:text-stone-500 group-hover/link:text-stone-500 dark:group-hover/link:text-stone-400 text-xs inline-flex items-center gap-1 mt-0.5">
                  Claire Vo
                  <ExternalLink size={10} className="shrink-0 opacity-70" />
                </span>
              </a>
            </li>
          </ul>
        </div>
        {/* Right: Practicing + Tools + Following */}
        <div className="space-y-5">
          <div>
            <p className="font-semibold text-stone-500 dark:text-stone-400 mb-1.5">☕ Practicing</p>
            <p>Latte art, 🦞, ✍️</p>
          </div>
          <div>
            <p className="font-semibold text-stone-500 dark:text-stone-400 mb-1.5">🛠️ Tools</p>
            <p>Claude Code, Cursor, v0, Storybook</p>
          </div>
          <div>
            <p className="font-semibold text-stone-500 dark:text-stone-400 mb-1.5">🧪 Playing</p>
            <p>
              Multimodal Gemini Live agents,{' '}
              <a
                href="https://devpost.com/software/recykle-ai-recycling-assistant"
                target="_blank"
                rel="noopener noreferrer"
                className="underline underline-offset-2 decoration-stone-300 dark:decoration-stone-600 hover:decoration-stone-500 dark:hover:decoration-stone-400"
              >
                Recykle
              </a>
            </p>
          </div>
          <div>
            <p className="font-semibold text-stone-500 dark:text-stone-400 mb-2">🐵 Following</p>
            <div className="flex items-start gap-3">
              <button
                type="button"
                onClick={() => setPanchiModalOpen(true)}
                className="shrink-0 rounded overflow-hidden border border-stone-200 dark:border-stone-700 hover:border-stone-300 dark:hover:border-stone-600 transition-colors focus:outline-none focus:ring-2 focus:ring-stone-400/50"
              >
                <img src="/panchi.png" alt="Panchi the Japanese macaque" className="w-10 h-10 object-cover object-center cursor-zoom-in" />
              </button>
              <a href="https://x.com/ichikawa_zoo/status/2025498126325612595?s=20" target="_blank" rel="noopener noreferrer" className="inline group/panchi hover:text-stone-900 dark:hover:text-white transition-colors underline underline-offset-2 decoration-stone-200 dark:decoration-stone-700 hover:decoration-stone-400">
                Panchi the Japanese macaque at Ichikawa Zoo
                <ExternalLink size={12} className="inline-block align-middle ml-1 opacity-70" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>

    {/* Panchi photo lightbox */}
    {panchiModalOpen && (
      <div
        className={`fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm ${panchiModalClosing ? 'lightbox-fade-out' : 'animate-in fade-in duration-200'}`}
        onClick={closePanchiModal}
        role="button"
        tabIndex={0}
        aria-label="Close"
      >
        <div
          className={`relative max-w-2xl w-full ${panchiModalClosing ? 'lightbox-fade-out' : 'lightbox-zoom-in'}`}
          onClick={(e) => e.stopPropagation()}
        >
          <img src="/panchi.png" alt="Panchi the Japanese macaque" className="w-full h-auto rounded-xl shadow-2xl" />
          <button
            type="button"
            onClick={closePanchiModal}
            className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-white dark:bg-stone-800 shadow-lg flex items-center justify-center text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-700 transition-colors focus:outline-none"
            aria-label="Close"
          >
            ×
          </button>
        </div>
      </div>
    )}

    {/* Recent Experience Section */}
    <div className="relative z-10 stagger-item" style={{ '--stagger-index': 2 }}>
      <div className="flex justify-between items-baseline mb-6">
        <h2 className="text-sm font-bold text-stone-400 dark:text-stone-500 uppercase tracking-wider">Recent roles shaping my work today</h2>
      </div>

      {/* Ask my AI twin - below section title */}
      <div className="group cursor-pointer mb-6" onClick={() => onNavigate('chat')}>
        <div className="relative rounded-2xl overflow-hidden p-[2px]">
          <div className="absolute inset-[-100%] animate-[spin_3s_linear_infinite] bg-[conic-gradient(from_90deg,transparent_0_340deg,#3B82F6_360deg)] opacity-100" />
          <div className="relative bg-white dark:bg-stone-900 rounded-[14px] p-5 shadow-sm flex items-center gap-5 h-full">
            <div className="bg-gradient-to-tr from-blue-500 to-sky-500 text-white p-3 rounded-xl group-hover:scale-110 transition-transform shadow-lg shadow-blue-500/20">
              <Sparkles size={22} />
            </div>
            <div className="flex-1">
              <p className="font-bold text-lg text-stone-900 dark:text-white">Ask my AI twin about my work</p>
              <p className="text-sm text-stone-500 dark:text-stone-400 mt-0.5">Learn more about my experience, design thinking, and problem-solving.</p>
            </div>
            <div className="bg-stone-50 dark:bg-stone-800 p-2 rounded-full text-stone-400 group-hover:text-brand dark:group-hover:text-blue-400 transition-colors">
              <ChevronRight size={20} />
            </div>
          </div>
        </div>
      </div>
      
      <div className="space-y-0">
        {cvData.experience.slice(0, 3).map((job, i) => (
          <div 
            key={i} 
            onClick={() => onNavigate('career')}
            className="group flex flex-col py-4 border-b border-stone-100 dark:border-stone-800 last:border-0 hover:bg-stone-50 dark:hover:bg-stone-900/50 rounded-lg px-2 -mx-2 transition-colors cursor-pointer"
          >
            <div className="flex flex-col md:flex-row md:items-baseline md:justify-between md:gap-3">
              <div className="flex flex-col md:flex-row md:items-baseline md:gap-3">
                <h3 className="font-bold text-stone-900 dark:text-white text-base">{job.company}</h3>
                <span className="text-sm text-stone-500 dark:text-stone-400 font-medium">{job.role}</span>
              </div>
              <span className="text-xs font-medium text-stone-400 dark:text-stone-500 mt-0.5 md:mt-0 md:whitespace-nowrap">
                {job.period}
              </span>
            </div>
            {(job.tagline || job.summary) && (
              <p className="text-sm text-stone-500 dark:text-stone-400 mt-1.5 leading-snug">
                {(job.tagline || job.summary).replace(/\.$/, '')}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>

    {/* Footer */}
    <footer className="mt-12 mb-8 text-center relative z-10 stagger-item" style={{ '--stagger-index': 3 }}>
      <p className="text-xs text-stone-400 dark:text-stone-500 mb-2 leading-relaxed">
        Built with{' '}
        <a href="https://react.dev/" target="_blank" rel="noreferrer" className="hover:text-stone-600 dark:hover:text-stone-300 underline underline-offset-2 decoration-stone-200 dark:decoration-stone-700 transition-colors">React</a>,{' '}
        <a href="https://tailwindcss.com/" target="_blank" rel="noreferrer" className="hover:text-stone-600 dark:hover:text-stone-300 underline underline-offset-2 decoration-stone-200 dark:decoration-stone-700 transition-colors">Tailwind CSS</a>,{' '}
        <a href="https://vercel.com/" target="_blank" rel="noreferrer" className="hover:text-stone-600 dark:hover:text-stone-300 underline underline-offset-2 decoration-stone-200 dark:decoration-stone-700 transition-colors">Vercel</a>,{' '}
        <a href="https://claude.ai/" target="_blank" rel="noreferrer" className="hover:text-stone-600 dark:hover:text-stone-300 underline underline-offset-2 decoration-stone-200 dark:decoration-stone-700 transition-colors">Claude Code</a>,{' '}
        <a href="https://cursor.com/" target="_blank" rel="noreferrer" className="hover:text-stone-600 dark:hover:text-stone-300 underline underline-offset-2 decoration-stone-200 dark:decoration-stone-700 transition-colors">Cursor</a>, and the{' '}
        <a href="https://ai.google.dev/" target="_blank" rel="noreferrer" className="hover:text-stone-600 dark:hover:text-stone-300 underline underline-offset-2 decoration-stone-200 dark:decoration-stone-700 transition-colors">Gemini API</a>.
      </p>
      <p className="text-[10px] text-stone-300 dark:text-stone-600">
        © 2026 Edward Chu. All rights reserved.{' '}
        <button
          type="button"
          onClick={() => onNavigate('privacy')}
          className="underline underline-offset-2 decoration-stone-200 dark:decoration-stone-700 hover:text-stone-500 dark:hover:text-stone-400 transition-colors"
        >
          Privacy & Use
        </button>
      </p>
    </footer>

  </div>
  );
};

const BRIEF_ROLE_COUNT = 4; // Adopt AI, SamaCare, Kea AI, Tier1

// Brief mode leads with the four roles that carry the most weight, which is why
// cvData keeps Tier1 (and its acquisition) ahead of the shorter Flybits stint.
// Detailed mode is a full history, so it sorts strictly by start date instead.
const MONTH_INDEX = {
  Jan: 0, Feb: 1, Mar: 2, Apr: 3, May: 4, Jun: 5,
  Jul: 6, Aug: 7, Sep: 8, Sept: 8, Oct: 9, Nov: 10, Dec: 11,
};

function roleStartValue(period) {
  const [month, year] = period.split('–')[0].trim().split(/\s+/);
  return Number(year) * 12 + (MONTH_INDEX[month] ?? 0);
}

const rolesByStartDate = [...cvData.experience].sort(
  (a, b) => roleStartValue(b.period) - roleStartValue(a.period)
);

const CareerView = ({ scrollState }) => {
  const [isDetailed, setIsDetailed] = useState(false);
  const [expandedIndex, setExpandedIndex] = useState(() =>
    cvData.experience.map((_, i) => i < BRIEF_ROLE_COUNT)
  );

  const isAtTop = scrollState.y < 50;
  const showBackground = !isAtTop;

  const toggleExpanded = (i) => setExpandedIndex((prev) => prev.map((v, idx) => idx === i ? !v : v));

  const briefRoles = cvData.experience.slice(0, BRIEF_ROLE_COUNT);
  const allRoles = rolesByStartDate;

  return (
    <div className="animate-in fade-in duration-500 pb-32 relative">

      {/* Sticky Header */}
      <div 
        className={`sticky top-0 z-30 -mx-6 px-6 md:-mx-12 md:px-12 py-4 mb-8 transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${
          showBackground 
            ? 'bg-stone-50/90 dark:bg-stone-950/90 backdrop-blur-xl border-b border-stone-200 dark:border-stone-800 shadow-sm' 
            : 'bg-transparent border-b border-transparent'
        }`}
      >
        <div className="flex flex-col gap-2">
          <div className="flex justify-between items-center">
            <h2 className="text-3xl font-bold text-stone-900 dark:text-white tracking-tight">
              Career
            </h2>
            <div className="bg-white dark:bg-stone-900 p-1 rounded-lg border border-stone-200 dark:border-stone-800 shadow-sm flex">
              <button 
                onClick={() => setIsDetailed(false)}
                className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all ${!isDetailed ? 'bg-stone-900 dark:bg-stone-700 text-white shadow-sm' : 'text-stone-400 hover:text-stone-600 dark:hover:text-stone-300'}`}
              >
                Brief
              </button>
              <button 
                onClick={() => setIsDetailed(true)}
                className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all ${isDetailed ? 'bg-stone-900 dark:bg-stone-700 text-white shadow-sm' : 'text-stone-400 hover:text-stone-600 dark:hover:text-stone-300'}`}
              >
                Detailed
              </button>
            </div>
          </div>
          <div className="flex items-center justify-between gap-4">
            <p className="text-xs text-stone-400 dark:text-stone-500">
              Brief shows recent roles. Detailed shows full history.
            </p>
            <a
              href="/Edward_Chu_Resume.pdf"
              download
              className="shrink-0 inline-flex items-center gap-1.5 text-xs font-semibold text-stone-500 dark:text-stone-400 hover:text-brand dark:hover:text-blue-400 transition-colors"
            >
              <Download size={14} className="shrink-0" />
              Download Resume
            </a>
          </div>
        </div>
      </div>

      {/* Experience: Brief (4 roles) or Detailed (accordion) */}
      <div className="space-y-4 md:space-y-6 mb-12 relative z-10">
        <h3 className="text-xs font-bold text-stone-400 dark:text-stone-500 uppercase tracking-wider mb-2">Work History</h3>

        {!isDetailed ? (
          /* Brief (Recent) mode: 4 roles only, no bullets */
          briefRoles.map((job, i) => (
            <div key={i} className="bg-white dark:bg-stone-900 p-6 rounded-2xl border border-stone-100 dark:border-stone-800 shadow-sm hover:shadow-md transition-all hover:border-blue-100 dark:hover:border-blue-900/30">
              <div className="flex flex-col md:flex-row md:items-center justify-between mb-2 gap-1">
                <div>
                  <h3 className="font-bold text-stone-900 dark:text-white text-lg">
                    {job.company.includes(' (acquired by') ? (
                      <> {job.company.split(' (acquired by')[0]} <span className="text-sm font-normal text-stone-600 dark:text-stone-400">(acquired by {job.company.split(' (acquired by')[1]}</span> </>
                    ) : job.company}
                  </h3>
                  <p className="text-brand dark:text-blue-400 font-medium text-sm">{job.role}</p>
                </div>
                <span className="text-xs font-medium bg-stone-100 dark:bg-stone-800 text-stone-500 dark:text-stone-400 px-2 py-1 rounded w-fit whitespace-nowrap">
                  {job.period}
                </span>
              </div>
              <p className="text-sm text-stone-500 dark:text-stone-400 leading-relaxed">{job.summary}</p>
              {job.tags && job.tags.length > 0 && (
                <p className="text-[10px] text-stone-400 dark:text-stone-500 mt-2 truncate">
                  {job.tags.join(" · ")}
                </p>
              )}
            </div>
          ))
        ) : (
          /* Detailed (Full History) mode: all roles, accordion */
          allRoles.map((job, i) => (
            <div key={i} className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-100 dark:border-stone-800 shadow-sm hover:shadow-md transition-all hover:border-blue-100 dark:hover:border-blue-900/30 overflow-hidden">
              <button
                type="button"
                onClick={() => toggleExpanded(i)}
                className="w-full p-6 text-left flex flex-col md:flex-row md:items-center justify-between gap-2"
              >
                <div>
                  <h3 className="font-bold text-stone-900 dark:text-white text-lg">
                    {job.company.includes(' (acquired by') ? (
                      <> {job.company.split(' (acquired by')[0]} <span className="text-sm font-normal text-stone-600 dark:text-stone-400">(acquired by {job.company.split(' (acquired by')[1]}</span> </>
                    ) : job.company}
                  </h3>
                  <p className="text-brand dark:text-blue-400 font-medium text-sm">{job.role}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium bg-stone-100 dark:bg-stone-800 text-stone-500 dark:text-stone-400 px-2 py-1 rounded w-fit whitespace-nowrap shrink-0">
                    {job.period}
                  </span>
                  <ChevronDown 
                    size={18} 
                    className={`text-stone-400 transition-transform duration-200 flex-shrink-0 ${expandedIndex[i] ? 'rotate-180' : ''}`} 
                  />
                </div>
              </button>
              {expandedIndex[i] && (
                <div className="px-6 pb-6 pt-0 border-t border-stone-100 dark:border-stone-800 animate-in fade-in slide-in-from-top-2 duration-200">
                  <p className="text-sm text-stone-500 dark:text-stone-400 mb-4 leading-relaxed">{job.summary}</p>
                  <ul className="space-y-2 mb-4">
                    {job.highlights.map((point, idx) => (
                      <li key={idx} className="text-xs text-stone-600 dark:text-stone-400 flex gap-2 leading-relaxed">
                        <span className="text-blue-400 mt-1 flex-shrink-0">•</span>
                        <span>{point}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="flex flex-wrap gap-2">
                    {job.tags.map((tag) => (
                      <span key={tag} className="text-[10px] bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-500 dark:text-stone-400 px-2 py-1 rounded-md">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Additional Clients & Advisory Work — only in Detailed mode */}
      {isDetailed && (
        <div className="mb-12 relative z-10">
          <div className="bg-white dark:bg-stone-900 p-6 rounded-2xl border border-stone-100 dark:border-stone-800 shadow-sm">
            <h3 className="text-sm font-semibold text-stone-600 dark:text-stone-400 uppercase tracking-wider mb-2">
              Additional Clients & Advisory Work
            </h3>
            <p className="text-xs text-stone-500 dark:text-stone-400 leading-relaxed mb-3 max-w-2xl">
              Selected product and design engagements across fintech, healthcare, and consumer products, spanning early-stage exploration and advisory support.
            </p>
            <p className="text-xs text-stone-400 dark:text-stone-500 font-normal">
              SomeDesign, Elion Health, Toronto Raptors × Tangerine, UrbanEater, Blinki.io, L1bre
            </p>
          </div>
        </div>
      )}

      {/* Education & Skills Section */}
      <div className="grid md:grid-cols-2 gap-6 relative z-10">
        
        {/* Education */}
        <div className="bg-white dark:bg-stone-900 p-6 rounded-2xl border border-stone-100 dark:border-stone-800 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
             <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-lg">
               <GraduationCap size={18} />
             </div>
             <h3 className="font-bold text-stone-900 dark:text-white">Education</h3>
          </div>
          <div className="space-y-4">
            {cvData.education.map((edu, i) => (
              <div key={i} className="border-l-2 border-emerald-100 dark:border-emerald-900 pl-3">
                <p className="text-sm font-semibold text-stone-900 dark:text-stone-200">{edu.school}</p>
                <p className="text-xs text-stone-500 dark:text-stone-400">{edu.degree}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Skills */}
        <div className="bg-white dark:bg-stone-900 p-6 rounded-2xl border border-stone-100 dark:border-stone-800 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
             <div className="p-2 bg-blue-100 dark:bg-blue-900/30 text-brand dark:text-blue-400 rounded-lg">
               <Layers size={18} />
             </div>
             <h3 className="font-bold text-stone-900 dark:text-white">Expertise</h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {cvData.skills.map((skill, i) => (
              <span key={i} className="px-3 py-1.5 bg-stone-50 dark:bg-stone-800 text-stone-600 dark:text-stone-300 text-xs font-medium rounded-lg border border-stone-100 dark:border-stone-700">
                {skill}
              </span>
            ))}
          </div>
        </div>

      </div>

      {/* Publications & Media */}
      <div className="mt-12 relative z-10">
        <div className="bg-white dark:bg-stone-900 p-6 rounded-2xl border border-stone-100 dark:border-stone-800 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 rounded-lg">
              <BookOpen size={18} />
            </div>
            <h3 className="font-bold text-stone-900 dark:text-white">Recognition & Publications</h3>
          </div>
          <div className="space-y-8">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Award size={16} className="text-rose-600 dark:text-rose-400 shrink-0" />
                <span className="text-xs font-bold text-stone-500 dark:text-stone-400 uppercase tracking-wider">Recognition</span>
              </div>
              <ul className="space-y-3">
                <li className="text-sm text-stone-700 dark:text-stone-300">
                  <span className="font-semibold">Apple App Store, Best of Year</span>
                  <span className="block text-xs text-stone-500 dark:text-stone-400 mt-0.5">Toronto Star StarTouch iPad app, over 200,000 downloads within 4 months of launch</span>
                </li>
                <li className="text-sm text-stone-700 dark:text-stone-300">
                  <span className="font-semibold">Best Mobile Solutions Provider, Waters Rankings</span>
                  <span className="block text-xs text-stone-500 dark:text-stone-400 mt-0.5">Tier1 Financial Solutions</span>
                </li>
              </ul>
            </div>

            <div>
              <div className="flex items-center gap-2 mb-3">
                <FileText size={16} className="text-amber-600 dark:text-amber-400 shrink-0" />
                <span className="text-xs font-bold text-stone-500 dark:text-stone-400 uppercase tracking-wider">Patents</span>
              </div>
              <a href="https://patents.google.com/patent/US12430227B1" target="_blank" rel="noreferrer" className="group block w-full text-sm text-stone-700 dark:text-stone-300 hover:text-brand dark:hover:text-blue-400 transition-colors">
                AI-based system and method for automated API discovery and action workflow generation <ExternalLink size={12} className="inline-block ml-0.5 align-baseline opacity-60 group-hover:opacity-100" />
              </a>
            </div>

            <div>
              <div className="flex items-center gap-2 mb-3">
                <BookOpen size={16} className="text-brand dark:text-blue-400 shrink-0" />
                <span className="text-xs font-bold text-stone-500 dark:text-stone-400 uppercase tracking-wider">Writing</span>
              </div>
              <ul className="space-y-2">
                <li>
                  <a href="https://www.linkedin.com/pulse/building-collaborative-design-culture-todays-world-edward-chu/" target="_blank" rel="noreferrer" className="group block w-full text-sm text-stone-700 dark:text-stone-300 hover:text-brand dark:hover:text-blue-400 transition-colors">
                    Building a collaborative design culture for today's world <ExternalLink size={12} className="inline-block ml-0.5 align-baseline opacity-60 group-hover:opacity-100" />
                  </a>
                </li>
                <li>
                  <a href="https://www.linkedin.com/pulse/storytelling-data-making-analytics-work-your-user-edward-chu%3FtrackingId=VE%252BSYf93TJmyileXyo1E6g%253D%253D/?trackingId=VE%2BSYf93TJmyileXyo1E6g%3D%3D" target="_blank" rel="noreferrer" className="group block w-full text-sm text-stone-700 dark:text-stone-300 hover:text-brand dark:hover:text-blue-400 transition-colors">
                    Storytelling with data: Making data analytics work for your user <ExternalLink size={12} className="inline-block ml-0.5 align-baseline opacity-60 group-hover:opacity-100" />
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <div className="flex items-center gap-2 mb-3">
                <Mic2 size={16} className="text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span className="text-xs font-bold text-stone-500 dark:text-stone-400 uppercase tracking-wider">Webinars & Talks</span>
              </div>
              <ul className="space-y-2">
                <li>
                  <a href="https://www.adopt.ai/webinar/uncovering-blind-spots-agentic-ai-ux" target="_blank" rel="noreferrer" className="group block w-full text-sm text-stone-700 dark:text-stone-300 hover:text-brand dark:hover:text-blue-400 transition-colors">
                    Designing Agentic AI Experiences Beyond the GUI <ExternalLink size={12} className="inline-block ml-0.5 align-baseline opacity-60 group-hover:opacity-100" />
                  </a>
                </li>
                <li>
                  <a href="https://www.youtube.com/watch?v=VzQ5U_inmGM" target="_blank" rel="noreferrer" className="group block w-full text-sm text-stone-700 dark:text-stone-300 hover:text-brand dark:hover:text-blue-400 transition-colors">
                    The Journey into Product Design – ADPList x Sketch x Springboard <ExternalLink size={12} className="inline-block ml-0.5 align-baseline opacity-60 group-hover:opacity-100" />
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <div className="flex items-center gap-2 mb-3">
                <Newspaper size={16} className="text-violet-600 dark:text-violet-400 shrink-0" />
                <span className="text-xs font-bold text-stone-500 dark:text-stone-400 uppercase tracking-wider">Interviews & Press</span>
              </div>
              <a href="https://www.builtinsf.com/2022/03/24/how-designers-simplify-user-journey" target="_blank" rel="noreferrer" className="group block w-full text-sm text-stone-700 dark:text-stone-300 hover:text-brand dark:hover:text-blue-400 transition-colors">
                Seeking a Simplified User Journey? Stop Adding Solutions - BuiltinSF <ExternalLink size={12} className="inline-block ml-0.5 align-baseline opacity-60 group-hover:opacity-100" />
              </a>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};

const PROJECTS_UNLOCK_KEY = 'projects_unlocked';
const PROJECTS_PASSWORDS = ['action builder', 'somedesign'];

const ProjectsView = ({ scrollState }) => {
  const isAtTop = scrollState.y < 50;
  const showBackground = !isAtTop;

  const [isUnlocked, setIsUnlocked] = useState(() => {
    if (typeof sessionStorage === 'undefined') return false;
    return sessionStorage.getItem(PROJECTS_UNLOCK_KEY) === 'true';
  });
  const [passwordInput, setPasswordInput] = useState('');
  const [shake, setShake] = useState(false);
  const [caseStudyOpen, setCaseStudyOpen] = useState(null);
  const passwordInputRef = useRef(null);

  useEffect(() => {
    if (typeof sessionStorage !== 'undefined' && sessionStorage.getItem(PROJECTS_UNLOCK_KEY) === 'true') {
      setIsUnlocked(true);
    }
  }, []);

  const handleUnlock = () => {
    const trimmed = passwordInput.trim();
    const match = PROJECTS_PASSWORDS.some((p) => trimmed.toLowerCase() === p.toLowerCase());
    if (match) {
      setIsUnlocked(true);
      if (typeof sessionStorage !== 'undefined') sessionStorage.setItem(PROJECTS_UNLOCK_KEY, 'true');
      setPasswordInput('');
    } else {
      setShake(true);
      setPasswordInput('');
      setTimeout(() => setShake(false), 400);
    }
  };

  const handleLock = () => {
    setIsUnlocked(false);
    if (typeof sessionStorage !== 'undefined') sessionStorage.removeItem(PROJECTS_UNLOCK_KEY);
  };

  return (
    <div className="animate-in fade-in duration-500 pb-32 relative">
       {/* Sticky Header with password control */}
       <div 
        className={`sticky top-0 z-30 -mx-6 px-6 md:-mx-12 md:px-12 py-4 mb-4 transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${
          showBackground 
            ? 'bg-stone-50/90 dark:bg-stone-950/90 backdrop-blur-xl border-b border-stone-200 dark:border-stone-800 shadow-sm' 
            : 'bg-transparent border-b border-transparent'
        }`}
      >
        <div className="flex justify-between items-center">
          <h2 className="text-3xl font-bold text-stone-900 dark:text-white tracking-tight">
            Projects
          </h2>
          {isUnlocked ? (
            <button
              type="button"
              onClick={handleLock}
              title="Click to lock projects"
              className="group flex items-center gap-2 px-3 py-1.5 rounded-lg border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 shadow-sm hover:bg-stone-50 dark:hover:bg-stone-800 hover:border-stone-300 dark:hover:border-stone-700 active:scale-[0.98] cursor-pointer transition-all duration-150"
            >
              <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
              <span className="relative inline-flex h-4 min-w-[4.75rem] items-center justify-end">
                <span className="text-xs font-bold text-stone-600 dark:text-stone-300 transition-opacity duration-150 group-hover:opacity-0">
                  Unlocked
                </span>
                <span className="absolute right-0 text-xs font-bold text-stone-600 dark:text-stone-300 opacity-0 transition-opacity duration-150 group-hover:opacity-100">
                  Lock it
                </span>
              </span>
            </button>
          ) : (
            <div className="bg-white dark:bg-stone-900 p-1 rounded-lg border border-stone-200 dark:border-stone-800 shadow-sm flex items-center gap-1">
              <input
                ref={passwordInputRef}
                type="password"
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleUnlock()}
                placeholder="Password"
                className={`px-3 py-1.5 text-xs rounded-md w-28 bg-transparent border-0 outline-none text-stone-900 dark:text-white placeholder-stone-400 focus:ring-0 ${shake ? 'animate-shake' : ''}`}
              />
              <button
                type="button"
                onClick={handleUnlock}
                className="px-3 py-1.5 text-xs font-bold rounded-md bg-stone-900 dark:bg-stone-700 text-white shadow-sm hover:bg-stone-800 dark:hover:bg-stone-600 transition-all"
              >
                Unlock
              </button>
            </div>
          )}
        </div>
      </div>

       <div className="relative z-10 mb-6">
          <p className="text-stone-500 dark:text-stone-400 max-w-full text-base leading-relaxed">
            Select recent projects case study adding soon.
          </p>
       </div>

       {(() => {
          const projects = [
            { title: 'Adopt AI · Action Builder', description: 'End-to-end workflow design for an AI action builder: 0-to-1 through five iterations, from node canvas to structured step templates.', caseStudyKey: 'adopt-action-builder' },
            { title: 'Adopt AI · Platform Vision', description: 'Founding designer shaping an AI copilot platform from whiteboard to dozens of signed enterprise customers in 6 months.', caseStudyKey: 'adopt-platform' },
            {
              title: 'SamaCare · CoPilot',
              description:
                'Payer-portal Chrome extension that syncs prior authorization work into SamaCare without leaving the insurer site.',
              caseStudyKey: 'samacare-copilot',
            },
            {
              title: 'Recykle App',
              description:
                'Gemini Live with camera and voice to identify waste and suggest the right bin from local rules.',
              projectUrl: 'https://github.com/somestyle/recykle-app',
            },
            { title: 'Blunt App', description: 'A savage AI life coach that roasts your bad habits with data, sarcasm, and zero sympathy.', caseStudyKey: null },
            { title: 'Kea AI', description: '0–1 design for flagship AI product serving B2B2C users focusing on conversational UX.', caseStudyKey: null },
          ];
          return (
       <div className="grid gap-4 md:grid-cols-2 relative z-10">
          {projects.map((proj, i) => {
            const showCaseStudyLink = isUnlocked && proj.caseStudyKey;
            if (proj.projectUrl) {
              return (
                <a
                  key={i}
                  href={proj.projectUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group relative bg-white dark:bg-stone-900 p-5 rounded-2xl border border-stone-200 dark:border-stone-800 hover:border-blue-200 dark:hover:border-blue-900 transition-all text-left flex flex-col cursor-pointer no-underline"
                >
                  <h3 className="font-bold text-lg mb-2 leading-snug text-stone-900 dark:text-white">{proj.title}</h3>
                  <p className="text-stone-500 dark:text-stone-400 text-sm leading-relaxed mb-4 flex-1 min-h-0 line-clamp-3">
                    {proj.description}
                  </p>
                  <div className="flex items-center gap-2 text-sm font-medium mt-auto pt-1 text-stone-700 dark:text-stone-200 group-hover:text-brand dark:group-hover:text-blue-400">
                    <span>View Project</span>
                    <ExternalLink size={16} className="shrink-0 opacity-70 group-hover:opacity-100" aria-hidden />
                  </div>
                </a>
              );
            }
            return (
             <div
               key={i}
               role={showCaseStudyLink ? 'button' : undefined}
               tabIndex={showCaseStudyLink ? 0 : undefined}
               onClick={showCaseStudyLink ? () => setCaseStudyOpen(proj.caseStudyKey) : undefined}
               onKeyDown={showCaseStudyLink ? (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setCaseStudyOpen(proj.caseStudyKey); } } : undefined}
               className={`group relative bg-white dark:bg-stone-900 p-5 rounded-2xl border border-stone-200 dark:border-stone-800 hover:border-blue-200 dark:hover:border-blue-900 transition-all text-left flex flex-col ${showCaseStudyLink ? 'cursor-pointer' : ''}`}
             >
                <h3 className={`font-bold text-lg mb-2 leading-snug transition-colors ${isUnlocked ? 'text-stone-900 dark:text-white' : 'text-stone-700 dark:text-stone-300'}`}>{proj.title}</h3>
                <p className={`text-stone-500 dark:text-stone-400 text-sm leading-relaxed mb-4 flex-1 min-h-0 line-clamp-3 ${!isUnlocked ? 'opacity-80' : ''}`}>
                  {proj.description}
                </p>
                <div
                  className={`flex items-center gap-2 text-sm font-medium mt-auto pt-1 ${
                    showCaseStudyLink
                      ? 'text-stone-700 dark:text-stone-200 group-hover:text-brand dark:group-hover:text-blue-400'
                      : 'text-stone-500 dark:text-stone-400'
                  }`}
                >
                  {!isUnlocked ? (
                    <Lock size={16} className="shrink-0 text-stone-400 dark:text-stone-500" aria-hidden />
                  ) : null}
                  {proj.caseStudyKey ? (
                    <>
                      <span>Read Case Study</span>
                      {showCaseStudyLink ? <ChevronRight size={16} className="shrink-0 opacity-70 group-hover:opacity-100" aria-hidden /> : null}
                    </>
                  ) : (
                    <span className="text-stone-400 dark:text-stone-500">Coming Soon</span>
                  )}
                </div>
             </div>
            );
          })}
       </div>
          );
       })()}

       {caseStudyOpen === 'adopt-action-builder' && typeof document !== 'undefined' && createPortal(
         <div style={{ position: 'relative', zIndex: 60 }}>
           <Suspense fallback={
             <div className="fixed inset-0 z-[60] flex items-center justify-center bg-stone-50 dark:bg-stone-950">
               <span className="text-stone-400 dark:text-stone-500 text-sm">Loading case study…</span>
             </div>
           }>
             <AdoptAICaseStudy onClose={() => setCaseStudyOpen(null)} />
           </Suspense>
         </div>,
         document.body
       )}

       {caseStudyOpen === 'adopt-platform' && typeof document !== 'undefined' && createPortal(
         <div style={{ position: 'relative', zIndex: 60 }}>
           <Suspense fallback={
             <div className="fixed inset-0 z-[60] flex items-center justify-center bg-stone-50 dark:bg-stone-950">
               <span className="text-stone-400 dark:text-stone-500 text-sm">Loading case study…</span>
             </div>
           }>
             <AdoptAIPlatform onClose={() => setCaseStudyOpen(null)} />
           </Suspense>
         </div>,
         document.body
       )}

       {caseStudyOpen === 'samacare-copilot' && typeof document !== 'undefined' && createPortal(
         <div style={{ position: 'relative', zIndex: 60 }}>
           <Suspense fallback={
             <div className="fixed inset-0 z-[60] flex items-center justify-center bg-stone-50 dark:bg-stone-950">
               <span className="text-stone-400 dark:text-stone-500 text-sm">Loading case study…</span>
             </div>
           }>
             <SamaCareCopilotCaseStudy onClose={() => setCaseStudyOpen(null)} />
           </Suspense>
         </div>,
         document.body
       )}
    </div>
  );
};

const CHAT_STORAGE_KEY = 'edward_chat_history';
const DEFAULT_INTRO = {
  role: 'system',
  text: "I'm grounded in Edward's real work including talks, presentations, portfolio case studies, and product artifacts.\n\n\nAsk about projects like Adopt AI, SamaCare, and Kea, or how he designs AI agents, complex SaaS systems, and 0→1 products across healthcare, fintech, and AI platforms.",
};

function loadChatFromSession() {
  try {
    const raw = typeof sessionStorage !== 'undefined' ? sessionStorage.getItem(CHAT_STORAGE_KEY) : null;
    if (!raw) return [DEFAULT_INTRO];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) return [DEFAULT_INTRO];
    const valid = parsed.every((m) => m && typeof m.role === 'string' && typeof m.text === 'string');
    return valid ? parsed : [DEFAULT_INTRO];
  } catch {
    return [DEFAULT_INTRO];
  }
}

const ChatView = () => {
  const [messages, setMessages] = useState(loadChatFromSession);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [streamingForIndex, setStreamingForIndex] = useState(null);
  const [isLiveStream, setIsLiveStream] = useState(false);
  const inputRef = useRef(null);
  const abortControllerRef = useRef(null);
  const lastUserMessageRef = useRef(null);
  const messagesContainerRef = useRef(null);

  useEffect(() => {
    sessionStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(messages));
  }, [messages]);

  const handleTypewriterComplete = useCallback(() => {
    setLoading(false);
    setStreamingForIndex(null);
    requestAnimationFrame(() => {
      inputRef.current?.focus();
    });
  }, []);

  // Snap the user's question to the top when they send it
  useEffect(() => {
    if (loading && lastUserMessageRef.current) {
      // Snap the user's question to the top
      lastUserMessageRef.current.scrollIntoView({
        behavior: prefersReducedMotion() ? 'auto' : 'smooth',
        block: 'start'
      });
    }
  }, [loading, messages.length]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMsg = input;
    setInput("");
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setLoading(true);

    // Index where the model reply will land: existing messages + the user message above
    const replyIndex = messages.length + 1;

    let unlockInFinally = true;
    abortControllerRef.current = new AbortController();
    const signal = abortControllerRef.current.signal;
    try {
      const history = messages.map((msg) => ({
        role: msg.role === 'user' ? 'user' : 'model',
        parts: [{ text: msg.text }],
      }));
      history.push({ role: 'user', parts: [{ text: userMsg }] });

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: history,
          sessionId: getChatSessionId(),
        }),
        signal,
      });
      if (response.status === 429) {
        setMessages(prev => [...prev, { role: 'system', text: "I've been chatting a little too much today and reached my limit. Check out the rest of the site to learn more about my experience and background in the meantime." }]);
        return;
      }
      if (response.status === 500) {
        setMessages(prev => [...prev, { role: 'system', text: "I'm having trouble connecting to my AI services right now. While I'm offline, you can reach the real me at [ed@edwardchu.xyz](mailto:ed@edwardchu.xyz)." }]);
        return;
      }

      const contentType = response.headers.get('content-type') || '';
      if (contentType.includes('text/event-stream') && response.body) {
        // Live SSE stream from the Gemini proxy: render tokens as they arrive
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = '';
        let fullText = '';
        let started = false;
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          buffer = lines.pop() ?? '';
          for (const line of lines) {
            if (!line.startsWith('data:')) continue;
            const payload = line.slice(5).trim();
            if (!payload || payload === '[DONE]') continue;
            let chunkText = '';
            try {
              chunkText = JSON.parse(payload).candidates?.[0]?.content?.parts?.[0]?.text || '';
            } catch { /* incomplete JSON across chunks; skip */ }
            if (!chunkText) continue;
            fullText += chunkText;
            const snapshot = fullText;
            if (!started) {
              started = true;
              setIsLiveStream(true);
              setStreamingForIndex(replyIndex);
              setMessages(prev => [...prev, { role: 'system', text: snapshot }]);
            } else {
              setMessages(prev => prev.map((m, idx) => idx === replyIndex ? { ...m, text: snapshot } : m));
            }
          }
        }
        if (!started) {
          setMessages(prev => [...prev, { role: 'system', text: "I'm processing that... try asking differently?" }]);
        }
        setStreamingForIndex(null);
        setIsLiveStream(false);
      } else {
        // Non-streaming fallback: full JSON reply revealed with the typewriter
        const data = await response.json();
        const reply = data.candidates?.[0]?.content?.parts?.[0]?.text || "I'm processing that... try asking differently?";
        setMessages(prev => {
          const next = [...prev, { role: 'system', text: reply }];
          setStreamingForIndex(next.length - 1);
          return next;
        });
        unlockInFinally = false;
      }
    } catch (err) {
      if (err?.name !== 'AbortError') {
        setMessages(prev => [...prev, { role: 'system', text: "Connection error. Please try again." }]);
      }
      setStreamingForIndex(null);
      setIsLiveStream(false);
    } finally {
      abortControllerRef.current = null;
      if (unlockInFinally) {
        setLoading(false);
        inputRef.current?.focus();
      }
    }
  };

  const isStreaming = streamingForIndex !== null;
  const isBusy = loading || isStreaming;
  const hasStarted = messages.length > 1;

  const clearChat = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    setLoading(false);
    setStreamingForIndex(null);
    setIsLiveStream(false);
    setMessages([DEFAULT_INTRO]);
    sessionStorage.removeItem(CHAT_STORAGE_KEY);
    inputRef.current?.focus();
  };

  return (
    <div className="flex flex-col h-full animate-in fade-in duration-500 relative">
      
      {/* 3. Header: Consistent Typography, Hide on Start */}
      {!hasStarted && (
        <div className="shrink-0 -mx-6 px-6 md:-mx-12 md:px-12 py-4 z-30">
           <h2 className="text-3xl font-bold text-stone-900 dark:text-white tracking-tight">
              Edward's AI
            </h2>
        </div>
      )}
      {hasStarted && (
        <div className="shrink-0 -mx-6 px-6 md:-mx-12 md:px-12 py-3 z-30 flex items-center justify-between">
          <h2 className="text-xl font-bold text-stone-900 dark:text-white tracking-tight">
            Edward's AI
          </h2>
          <button
            type="button"
            onClick={clearChat}
            className="text-sm font-medium text-stone-500 dark:text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Clear chat
          </button>
        </div>
      )}

      {/* Messages Area */}
      <div ref={messagesContainerRef} className="flex-1 overflow-y-auto pr-2 pb-4 relative z-10">
        <div className="space-y-4 pt-4">
          {messages.map((msg, i) => {
            // Find the last user message in the entire list
            const lastUserMessageIndex = messages.map((m, idx) => m.role === 'user' ? idx : -1).filter(idx => idx !== -1).pop();
            const isLastUserMessage = msg.role === 'user' && i === lastUserMessageIndex;
            return (
            <div 
              key={i} 
              ref={isLastUserMessage ? lastUserMessageRef : null}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} ${msg.role === 'user' ? 'scroll-mt-32' : ''}`}
            >
              <div className={`max-w-[85%] md:max-w-[75%] p-4 rounded-2xl text-sm leading-relaxed shadow-sm ${
                msg.role === 'user'
                  ? 'bg-blue-600 text-white rounded-br-none'
                  : 'bg-white dark:bg-stone-800 text-stone-700 dark:text-stone-200 border border-stone-100 dark:border-stone-700 rounded-bl-none'
              }`}>
                {msg.role === 'user' ? (
                  msg.text
                ) : i === streamingForIndex ? (
                  isLiveStream ? (
                    <MarkdownRenderer>{msg.text}</MarkdownRenderer>
                  ) : (
                    <TypewriterText
                      content={msg.text}
                      onComplete={handleTypewriterComplete}
                      speedMs={45}
                    />
                  )
                ) : (
                  <MarkdownRenderer>{msg.text}</MarkdownRenderer>
                )}
              </div>
            </div>
            );
          })}
          {loading && streamingForIndex === null && (
            <div className="flex justify-start">
              <div className="bg-white dark:bg-stone-800 border border-stone-100 dark:border-stone-700 p-4 rounded-2xl rounded-bl-none shadow-sm flex gap-2">
                <div className="w-2 h-2 bg-stone-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                <div className="w-2 h-2 bg-stone-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                <div className="w-2 h-2 bg-stone-400 rounded-full animate-bounce"></div>
              </div>
            </div>
          )}
          {/* Scroll spacer to allow last message to scroll to top */}
          <div className="shrink-0 h-[50vh]"></div>
        </div>
      </div>

      {/* Input Area */}
      <div className="pt-4 bg-[var(--bg-app)] transition-colors duration-300 z-20 pb-32 md:pb-20 relative">
        <form onSubmit={handleSend} className="relative">
          {/* Laser Beam Container */}
          <div className="relative rounded-2xl overflow-hidden p-[2px]">
            {/* Animated Rotating Gradient */}
            <div className="absolute inset-[-100%] animate-[spin_3s_linear_infinite] bg-[conic-gradient(from_90deg,transparent_0_340deg,#3B82F6_360deg)] opacity-100" />
            
            {/* Inner Content Card (Input Wrapper) - Use inset ring for focus state instead of outline */}
            <div className="relative bg-white dark:bg-stone-900 rounded-[14px] flex items-center transition-all duration-200 focus-within:ring-1 focus-within:ring-inset focus-within:ring-stone-200 dark:focus-within:ring-stone-700">
              <input 
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask AI anything..."
                autoFocus
                className="w-full bg-transparent border-none pl-5 pr-14 h-16 text-base md:text-sm focus:ring-0 outline-none text-stone-900 dark:text-white placeholder-stone-400"
              />
              <button 
                disabled={!input.trim() || isBusy}
                className="absolute right-3 top-1/2 -translate-y-1/2 bg-gradient-to-tr from-blue-500 to-sky-500 text-white p-3 rounded-xl disabled:opacity-50 disabled:from-stone-400 disabled:to-stone-500 hover:from-blue-600 hover:to-sky-600 transition-all shadow-lg shadow-blue-500/20"
              >
                <Send size={18} />
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

const EMAIL_ADDRESS = 'ed' + '@' + 'edwardchu.xyz';

const AVATAR_SOURCES = {
  default: '/avartar/edward_avatar.png',
  left: '/avartar/edward_avatar_left.png',
  right: '/avartar/edward_avatar_right.png',
  click: '/avartar/edward_avatar_click.png',
};

const VERTICAL_THRESHOLD = 20;
const HORIZONTAL_TRIGGER_MIN = 5;   // min 5px from image edge to trigger left/right
const HORIZONTAL_TRIGGER_MAX = 250; // max 250px from image edge

const ContactView = ({ scrollState }) => {
  const isAtTop = scrollState.y < 50; 
  const showBackground = !isAtTop;
  const [showCopied, setShowCopied] = useState(false);
  const fadeRef = useRef(null);

  const [avatarState, setAvatarState] = useState('default');
  const avatarRef = useRef(null);
  const containerRef = useRef(null);
  const clickTimeoutRef = useRef(null);

  const handleAvatarMouseMove = useCallback((e) => {
    if (avatarState === 'click') return;
    const img = avatarRef.current;
    if (!img) return;
    const rect = img.getBoundingClientRect();
    const { clientX: x, clientY: y } = e;
    const top = rect.top - VERTICAL_THRESHOLD;
    const bottom = rect.bottom + VERTICAL_THRESHOLD;
    const inVerticalZone = y >= top && y <= bottom;
    if (!inVerticalZone) {
      setAvatarState('default');
      return;
    }
    const distRight = x - rect.right;
    const distLeft = rect.left - x;
    if (distRight >= HORIZONTAL_TRIGGER_MIN && distRight <= HORIZONTAL_TRIGGER_MAX) setAvatarState('right');
    else if (distLeft >= HORIZONTAL_TRIGGER_MIN && distLeft <= HORIZONTAL_TRIGGER_MAX) setAvatarState('left');
    else setAvatarState('default');
  }, [avatarState]);

  const handleAvatarMouseLeave = useCallback(() => {
    if (avatarState !== 'click') setAvatarState('default');
  }, [avatarState]);

  const handleAvatarClick = useCallback(() => {
    setAvatarState('click');
    if (clickTimeoutRef.current) clearTimeout(clickTimeoutRef.current);
    clickTimeoutRef.current = setTimeout(() => {
      setAvatarState('default');
      clickTimeoutRef.current = null;
    }, 1000);
  }, []);

  useEffect(() => () => {
    if (clickTimeoutRef.current) clearTimeout(clickTimeoutRef.current);
  }, []);

  const copyEmail = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(EMAIL_ADDRESS);
      setShowCopied(true);
      if (fadeRef.current) clearTimeout(fadeRef.current);
      fadeRef.current = setTimeout(() => setShowCopied(false), 4000);
    } catch (_) {}
  }, []);

  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key !== 'c' && e.key !== 'C') return;
      const active = document.activeElement;
      const isInput = active?.tagName === 'INPUT' || active?.tagName === 'TEXTAREA' || active?.isContentEditable;
      if (isInput) return;
      e.preventDefault();
      copyEmail();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      if (fadeRef.current) clearTimeout(fadeRef.current);
    };
  }, [copyEmail]);

  return (
    <div className="animate-in fade-in duration-500 pb-32 relative">

      {/* Consistent Sticky Header - mb-4 to reduce spacing */}
      <div 
        className={`sticky top-0 z-30 -mx-6 px-6 md:-mx-12 md:px-12 py-4 mb-4 transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${
          showBackground 
            ? 'bg-stone-50/90 dark:bg-stone-950/90 backdrop-blur-xl border-b border-stone-200 dark:border-stone-800 shadow-sm' 
            : 'bg-transparent border-b border-transparent'
        }`}
      >
        <h2 className="text-3xl font-bold text-stone-900 dark:text-white tracking-tight">
          Let's Connect
        </h2>
      </div>

      <div
        ref={containerRef}
        onMouseMove={handleAvatarMouseMove}
        onMouseLeave={handleAvatarMouseLeave}
        className="relative z-10 mb-8 flex items-start gap-4 md:gap-6 -mx-6 px-6 md:-mx-12 md:px-12"
      >
        <button
          type="button"
          onClick={handleAvatarClick}
          className="shrink-0 rounded-full cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
          aria-label="Edward Chu"
        >
          <img
            ref={avatarRef}
            src={AVATAR_SOURCES[avatarState]}
            alt="Edward Chu"
            className="w-16 h-16 md:w-20 md:h-20 rounded-full object-cover border-2 border-stone-200 dark:border-stone-700"
            draggable={false}
          />
        </button>
        <p className="text-stone-500 dark:text-stone-400 max-w-full text-base leading-relaxed pt-1">
          Building a complex product or designing an agentic experience? I partner with early-stage startups and founders to navigate 0-to-1 design challenges. My inbox is open for new connections and advisory roles.
        </p>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 relative z-10">
        <a href="https://www.linkedin.com/in/edwardchu1/" target="_blank" rel="noreferrer" className="flex items-center gap-4 bg-white dark:bg-stone-900 p-4 rounded-2xl shadow-sm border border-stone-100 dark:border-stone-800 hover:border-blue-300 transition-colors group">
          <div className="bg-blue-600 text-white p-3 rounded-xl">
            <Linkedin size={24} />
          </div>
          <div>
            <h3 className="font-bold text-stone-900 dark:text-white">LinkedIn</h3>
            <p className="text-xs text-stone-400 group-hover:text-blue-500 transition-colors">Professional Profile</p>
          </div>
          <ExternalLink size={16} className="ml-auto text-stone-300" />
        </a>

        <a href="https://adplist.org/mentors/edward-chu" target="_blank" rel="noreferrer" className="flex items-center gap-4 bg-white dark:bg-stone-900 p-4 rounded-2xl shadow-sm border border-stone-100 dark:border-stone-800 hover:border-blue-300 transition-colors group">
          <div className="bg-stone-900 dark:bg-white text-white dark:text-stone-900 p-3 rounded-xl">
            <Briefcase size={24} />
          </div>
          <div>
            <h3 className="font-bold text-stone-900 dark:text-white">ADPList</h3>
            <p className="text-xs text-stone-400 group-hover:text-blue-500 transition-colors">Mentorship & Booking</p>
          </div>
          <ExternalLink size={16} className="ml-auto text-stone-300" />
        </a>
      </div>

      {/* New Lighter Email Me Section */}
      <button
        type="button"
        onClick={() => { window.location.href = 'mailto:' + EMAIL_ADDRESS; }}
        className="w-full text-left bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 p-6 rounded-3xl shadow-sm mt-4 hover:border-blue-200 dark:hover:border-blue-900 transition-colors relative z-10 cursor-pointer group"
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
             <div className="bg-blue-50 dark:bg-blue-900/30 text-brand dark:text-blue-400 p-4 rounded-2xl">
               <Mail size={24} />
             </div>
             <div>
               <span className="font-bold text-lg text-stone-900 dark:text-white">Email Me</span>
               <p className="text-stone-400 dark:text-stone-500 text-xs mt-2">
                 Press <kbd className="px-1.5 py-0.5 rounded bg-stone-200 dark:bg-stone-700 font-mono text-[10px]">C</kbd> to copy my email
               </p>
             </div>
          </div>
          <span className="whitespace-nowrap px-4 py-2 text-sm font-medium bg-gradient-to-tr from-blue-500 to-sky-500 text-white rounded-lg shadow-md shadow-blue-500/15 group-hover:from-blue-600 group-hover:to-sky-600 transition-all">
            Send Message
          </span>
        </div>
      </button>

      {/* Email copied notification */}
      {showCopied && (
        <div
          role="status"
          aria-live="polite"
          className="fixed top-[60px] left-1/2 z-50 px-4 py-2 text-[13px] text-stone-600 dark:text-white bg-white/90 dark:bg-stone-900/90 backdrop-blur-sm rounded-lg shadow-sm border border-stone-200/80 dark:border-stone-700/80 font-normal email-copied-toast"
        >
          Email copied!
        </div>
      )}
    </div>
  );
};

// --- RELEASE NOTES / CHANGELOG (hidden view, no dock icon) ---
const CHANGELOG_ENTRIES = [
  {
    version: '1.3',
    date: 'Early March 2026',
    title: 'Projects & Stacked Cards',
    items: [
      'Homepage: Added shimmer text effect on the intro headline.',
      'Projects: Added a sliding card stack with placeholder cards and rotating animation.',
      'Content: Updated projects intro and other copy.',
      'Widgets: Updated design and cleaned up styling.',
    ],
  },
  {
    version: '1.2',
    date: 'Late Feb 2026',
    title: 'Widgets & Dock',
    items: [
      'Widgets: Added a widget launcher with Pomodoro clock, Sudoku, and Inspiration Quotes mini-apps.',
      'Themes: Moved Theme (Style + Dark mode) into the Widgets folder; opens in the same centered modal as other widgets.',
      'Dock: Reorganized the dock bar. Ask AI is now second (between Home and Career); Widgets folder is on the right.',
      'Modals: Widget modals are now portaled to the viewport so they center on the full screen instead of anchoring to the dock.',
    ],
  },
  {
    version: '1.1',
    date: 'Mid Feb 2026',
    title: 'Intelligence & Refinement',
    items: [
      'AI Persona: Refined the agent\'s voice using Gemini 2.5 Flash with a "Pro-casual" system prompt and rich Markdown rendering.',
      'Theme Engine: Built a custom styling engine supporting dynamic "Modern" and "Retro" aesthetic modes.',
      'Visual FX: Added "Laser Beam" borders, interactive Flickering Grid background, and entry animations.',
      'Infrastructure: Integrated analytics for privacy-focused observability.',
      'Meta: Added this Changelog to track product evolution.',
    ],
  },
  {
    version: '1.0',
    date: 'Early Feb 2026',
    title: 'Initial Launch',
    items: [
      'Core OS: Public release of Edward OS with Home, Career, and Contact views.',
      'Conversational UI: Integrated initial Gemini AI agent for natural language interaction.',
      'System: Implemented responsive layout and system-aware Dark Mode.',
      'Stack: Built and deployed using React, Tailwind CSS, and Vercel.',
    ],
  },
];

const PrivacySection = ({ title, children }) => (
  <div className="mb-8">
    <h3 className="text-sm font-bold text-stone-900 dark:text-white mb-2">{title}</h3>
    <div className="text-sm text-stone-600 dark:text-stone-400 leading-relaxed space-y-2">{children}</div>
  </div>
);

const ConnectLink = ({ onNavigate, children }) => (
  <button
    type="button"
    onClick={() => onNavigate('contact')}
    className="underline underline-offset-2 decoration-stone-300 dark:decoration-stone-600 hover:text-brand dark:hover:text-blue-400 transition-colors"
  >
    {children}
  </button>
);

const PrivacyView = ({ scrollState, onNavigate }) => {
  const isAtTop = scrollState?.y < 50;
  const showBackground = !isAtTop;

  return (
    <div className="animate-in fade-in duration-500 pb-32 relative">
      <div
        className={`sticky top-0 z-30 -mx-6 px-6 md:-mx-12 md:px-12 py-4 mb-8 transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${
          showBackground
            ? 'bg-stone-50/90 dark:bg-stone-950/90 backdrop-blur-xl border-b border-stone-200 dark:border-stone-800 shadow-sm'
            : 'bg-transparent border-b border-transparent'
        }`}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-3xl font-bold text-stone-900 dark:text-white tracking-tight">
              Privacy & Use
            </h2>
            <p className="text-sm text-stone-500 dark:text-stone-400 mt-1">
              What this site collects, and what the AI can and cannot tell you
            </p>
          </div>
          <button
            type="button"
            onClick={() => onNavigate('home')}
            aria-label="Close and return home"
            className="shrink-0 p-2 -mr-2 rounded-lg text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
          >
            <X size={20} />
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-stone-900 p-6 md:p-8 rounded-2xl border border-stone-100 dark:border-stone-800 shadow-sm relative z-10">
        <PrivacySection title="What this site collects">
          <p>
            <strong className="text-stone-800 dark:text-stone-200">Aggregate visitor analytics.</strong> Page views and
            general traffic patterns through Vercel Analytics. No cookies, and no profile of you as an individual.
          </p>
          <p>
            <strong className="text-stone-800 dark:text-stone-200">Your theme preference,</strong> stored in your own
            browser so the site remembers light or dark mode. It never leaves your device.
          </p>
          <p>
            <strong className="text-stone-800 dark:text-stone-200">Conversations with my AI twin.</strong> Messages you
            send and the replies you get are saved, along with a random session ID that groups one conversation
            together. I read these to find questions it answers badly. Your IP address is not stored, and the session ID
            is not linked to you.
          </p>
        </PrivacySection>

        <PrivacySection title="Who else sees it">
          <p>
            Chat messages are sent to Google's Gemini API to generate a reply. Conversations are stored in a Supabase
            database hosted in Canada. Hosting and analytics run on Vercel. Nothing is sold, and nothing is shared for
            advertising.
          </p>
        </PrivacySection>

        <PrivacySection title="How long it is kept">
          <p>
            Conversation logs are kept for 90 days, then deleted. If you would like a conversation removed sooner,
            {' '}<ConnectLink onNavigate={onNavigate}>get in touch</ConnectLink> and tell me roughly when we spoke.
          </p>
        </PrivacySection>

        <PrivacySection title="About the AI twin">
          <p>
            The chat is an AI trained on notes about my career. It speaks as me, but it is not me. It can be wrong, it
            can miss context, and nothing it says is a commitment, an offer, or a formal representation of my work
            history. For anything that matters, <ConnectLink onNavigate={onNavigate}>reach the real me</ConnectLink> and
            we will talk properly.
          </p>
          <p>
            Please do not enter passwords, financial details, or anyone else's personal information into the chat.
          </p>
        </PrivacySection>

        <PrivacySection title="Using this site">
          <p>
            Everything here is my own work, shared so you can get a sense of how I think. The writing, case studies, and
            images are mine. Feel free to link to any of it. Please ask before republishing it as your own.
          </p>
        </PrivacySection>

        <p className="text-xs text-stone-400 dark:text-stone-500 pt-2 border-t border-stone-100 dark:border-stone-800">
          Last updated August 2026. Questions about any of this are welcome from the{' '}
          <ConnectLink onNavigate={onNavigate}>Connect page</ConnectLink>.
        </p>
      </div>
    </div>
  );
};

const ReleaseNotesView = ({ scrollState }) => {
  const isAtTop = scrollState?.y < 50;
  const showBackground = !isAtTop;

  return (
    <div className="animate-in fade-in duration-500 pb-32 relative">
      <div
        className={`sticky top-0 z-30 -mx-6 px-6 md:-mx-12 md:px-12 py-4 mb-8 transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${
          showBackground
            ? 'bg-stone-50/90 dark:bg-stone-950/90 backdrop-blur-xl border-b border-stone-200 dark:border-stone-800 shadow-sm'
            : 'bg-transparent border-b border-transparent'
        }`}
      >
        <h2 className="text-3xl font-bold text-stone-900 dark:text-white tracking-tight">
          Changelog
        </h2>
        <p className="text-sm text-stone-500 dark:text-stone-400 mt-1">
          Recent updates to this site
        </p>
      </div>

      <div className="relative z-10">
        <div className="relative pl-6 border-l-2 border-stone-200 dark:border-stone-700 space-y-8">
          {CHANGELOG_ENTRIES.map((entry, i) => (
            <div key={i} className="relative -left-6">
              <div className="absolute left-0 w-3 h-3 rounded-full bg-stone-400 dark:bg-stone-500 border-2 border-white dark:border-stone-900 -translate-x-[7px] mt-1.5" />
              <div className="pl-4">
                <div className="flex flex-wrap items-baseline gap-2 mb-1">
                  <span className="text-xs font-bold text-stone-400 dark:text-stone-500 uppercase tracking-wider">
                    v{entry.version}
                  </span>
                  <span className="text-xs text-stone-400 dark:text-stone-500">• {entry.date}</span>
                </div>
                <h3 className="font-bold text-stone-900 dark:text-white text-lg mb-2">
                  {entry.title}
                </h3>
                <ul className="space-y-1.5 text-sm text-stone-600 dark:text-stone-300 leading-relaxed list-disc list-outside pl-5">
                  {entry.items.map((item, j) => (
                    <li key={j}>{item}</li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const systemPrefersDark = () =>
  typeof window !== 'undefined' && window.matchMedia?.('(prefers-color-scheme: dark)').matches;

function loadThemePreferences() {
  try {
    const raw = localStorage.getItem(THEME_STORAGE_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw);
    return {
      themeStyle: data.themeStyle === 'retro' ? 'retro' : 'modern',
      accentColor: ['blue', 'purple', 'emerald', 'orange'].includes(data.accentColor) ? data.accentColor : 'blue',
      darkMode: !!data.darkMode,
      // Preferences saved before the toggle was tracked have no flag. Dark could only
      // have come from a deliberate toggle back then, so treat it as explicit.
      darkModeExplicit: !!data.darkModeExplicit || data.darkMode === true,
    };
  } catch {
    return null;
  }
}

// An explicit toggle wins; otherwise follow the visitor's OS setting.
function resolveInitialDarkMode() {
  const stored = loadThemePreferences();
  return stored?.darkModeExplicit ? stored.darkMode : systemPrefersDark();
}

export default function App() {
  const [activeTab, setActiveTab] = useState('home');
  const [darkMode, setDarkMode] = useState(resolveInitialDarkMode);
  const [darkModeExplicit, setDarkModeExplicit] = useState(() => !!loadThemePreferences()?.darkModeExplicit);
  const [themeStyle, setThemeStyle] = useState(() => loadThemePreferences()?.themeStyle ?? 'modern');
  const [themeAccent, setThemeAccent] = useState(() => loadThemePreferences()?.accentColor ?? 'blue');
  const [scrollState, setScrollState] = useState({ dir: 'up', y: 0 });
  const lastScrollY = useRef(0);
  // Persist theme preferences to localStorage
  useEffect(() => {
    localStorage.setItem(THEME_STORAGE_KEY, JSON.stringify({
      themeStyle,
      accentColor: themeAccent,
      darkMode,
      darkModeExplicit,
    }));
  }, [themeStyle, themeAccent, darkMode, darkModeExplicit]);

  // Follow the OS setting live, until the visitor picks a theme themselves.
  useEffect(() => {
    if (darkModeExplicit) return;
    const query = window.matchMedia?.('(prefers-color-scheme: dark)');
    if (!query) return;
    const onChange = (e) => setDarkMode(e.matches);
    query.addEventListener('change', onChange);
    return () => query.removeEventListener('change', onChange);
  }, [darkModeExplicit]);

  const handleDarkModeChange = useCallback((value) => {
    setDarkModeExplicit(true);
    setDarkMode(value);
  }, []);

  // Apply --accent CSS variable when accent color changes
  useEffect(() => {
    document.documentElement.style.setProperty('--accent', ACCENT_HEX[themeAccent] ?? ACCENT_HEX.blue);
  }, [themeAccent]);

  // Toggle Dark Mode (class on <html> for Tailwind dark:)
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  // Scroll Handler
  const handleScroll = (e) => {
    const currentY = e.currentTarget.scrollTop;
    const direction = currentY > lastScrollY.current ? 'down' : 'up';
    lastScrollY.current = currentY;
    setScrollState({ dir: direction, y: currentY });
  };

  return (
    <div
      className={`theme-${themeStyle} flex h-[100dvh] pb-[env(safe-area-inset-bottom)] font-sans text-stone-900 dark:text-white overflow-hidden transition-colors duration-300 ${darkMode ? 'dark' : ''}`}
      style={{ background: 'var(--bg-app)' }}
    >
      {/* --- MAIN CONTENT AREA --- */}
      <main className="flex-1 flex flex-col h-full relative overflow-hidden">
        {/* Scrollable Container - The background should be here to be scrollable but full width */}
        <div 
          onScroll={handleScroll}
          className={`flex-1 overflow-y-auto overflow-x-hidden ${activeTab === 'chat' ? 'overflow-hidden' : ''} relative pt-[env(safe-area-inset-top)] h-[100dvh]`}
        >
           
           {/* New Flickering Grid Background - Reduced size & restricted height */}
           <FlickeringGrid 
             squareSize={2}
             gridGap={4}
             color={darkMode ? "#60A5FA" : "#60A5FA"}
             maxOpacity={darkMode ? 0.2 : 0.4}
             flickerChance={0.3}
             className="absolute top-0 left-0 w-full h-[400px] z-0 [mask-image:linear-gradient(to_bottom,black,transparent)]"
           />

           <div className={`w-full max-w-3xl mx-auto p-6 md:p-12 relative z-10 ${activeTab === 'chat' ? 'h-full' : ''}`}>
              {activeTab === 'home' && <HomeView onNavigate={setActiveTab} />}
              {activeTab === 'career' && <CareerView scrollState={scrollState} />}
              {activeTab === 'projects' && <ProjectsView scrollState={scrollState} />}
              {activeTab === 'chat' && <ChatView />}
              {activeTab === 'contact' && <ContactView scrollState={scrollState} />}
              {activeTab === 'changelog' && <ReleaseNotesView scrollState={scrollState} />}
              {activeTab === 'privacy' && <PrivacyView scrollState={scrollState} onNavigate={setActiveTab} />}
           </div>
        </div>
      </main>

      {/* --- UNIFIED FLOATING DOCK (Mobile & Desktop) --- */}
      <div className="fixed bottom-5 left-1/2 -translate-x-1/2 z-50 w-auto">
        <div className="app-dock flex items-center gap-0.5 p-1.5 pr-4 pl-4">
          
          <DockIcon 
            active={activeTab === 'home'} 
            onClick={() => setActiveTab('home')} 
            icon={Home} 
            label="Home" 
          />
          <DockIcon 
            active={activeTab === 'chat'} 
            onClick={() => setActiveTab('chat')} 
            icon={Sparkles} 
            label="Ask AI" 
          />
          <DockIcon 
            active={activeTab === 'career'} 
            onClick={() => setActiveTab('career')} 
            icon={BookOpen} 
            label="Career" 
          />
          <DockIcon 
            active={activeTab === 'projects'} 
            onClick={() => setActiveTab('projects')} 
            icon={Layers} 
            label="Projects" 
          />
          <DockIcon 
            active={activeTab === 'contact'} 
            onClick={() => setActiveTab('contact')} 
            icon={Mail} 
            label="Contact" 
          />

          {/* Divider */}
          <div className="w-px h-6 bg-stone-200 dark:bg-stone-700 mx-1.5"></div>

          <WidgetLauncher
            themeStyle={themeStyle}
            onThemeStyleChange={setThemeStyle}
            darkMode={darkMode}
            onDarkModeChange={handleDarkModeChange}
            onChangelogClick={() => setActiveTab('changelog')}
          />
        </div>
      </div>
    </div>
  );
}