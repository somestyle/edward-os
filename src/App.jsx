import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  Send, Sparkles, ChevronRight, User, 
  Home, Briefcase, Award, Zap,
  Layout, Moon, Sun, GraduationCap, Layers,
  BookOpen, Mail, Linkedin, ExternalLink, Folder
} from 'lucide-react';

// --- CONFIGURATION ---
// ⚠️ IMPORTANT: Uncomment the line below when deploying to Vercel to enable the AI Chat.
const apiKey = import.meta.env.VITE_GEMINI_API_KEY || ""; 
const apiKey = "";

// --- CV DATA ---
const cvData = {
  about: "I design complex, high-stakes products where automation, control, and trust must coexist. My work focuses on reducing system friction, clarifying decision paths, and turning ambiguous technical constraints into usable, scalable experiences.",
  experience: [
    {
      company: "Adopt AI",
      role: "Founding Staff Product Designer",
      period: "Oct 2024 - Present",
      location: "San Francisco, CA",
      summary: "Leading end-to-end 0-to-1 product design for AI Copilot solutions.",
      highlights: [
        "Led 0-to-1 design of AI Copilot solutions across SaaS platforms.",
        "Collaborated with CEO/CTO on product vision and ML integration.",
        "Designed agentic workflows reducing UI drift by 90%."
      ],
      tags: ["AI Agents", "0-to-1", "Strategy"]
    },
    {
      company: "SamaCare",
      role: "Staff Product Designer",
      period: "Aug 2022 - Oct 2024",
      location: "San Francisco, CA",
      summary: "Sole designer leading product design for Series B growth.",
      highlights: [
        "Independently led design for 2+ years, contributing to Series B funding.",
        "Designed a Chrome Extension that reduced churn.",
        "Overhauled prior auth workflows, reducing friction by 40%."
      ],
      tags: ["Healthcare", "Series B", "Growth"]
    },
    {
      company: "Kea AI",
      role: "Head of Product Design",
      period: "Mar 2021 - Aug 2022",
      location: "San Francisco, CA",
      summary: "Led design of flagship operation console and design systems.",
      highlights: [
        "Designed flagship operation console for B2B2C model.",
        "Built company design system and voice UX patterns.",
        "Established AI suggestion interfaces."
      ],
      tags: ["Leadership", "Design Systems", "AI"]
    },
    {
      company: "Flybits",
      role: "Product Design Manager",
      period: "Jul 2020 - Mar 2021",
      location: "Toronto, ON",
      summary: "Led a team of 5 designers and improved collaborative processes.",
      highlights: [
        "Managed 5 designers and established cross-functional processes.",
        "Created 'Designer Circle' to improve team synergy.",
        "Implemented UserTesting.com and WCAG AA accessibility audits."
      ],
      tags: ["Management", "Accessibility", "FinTech"]
    },
    {
      company: "Tier1 Financial",
      role: "UX Manager & Lead Product Designer",
      period: "Jan 2017 - Apr 2020",
      location: "Toronto, ON",
      summary: "First designer hire; built and led a team of 5 for Enterprise SaaS.",
      highlights: [
        "Built and mentored a UX team of 5 from scratch.",
        "Designed unified top bar and comprehensive Design System.",
        " contributed to $34M funding and multiple industry awards."
      ],
      tags: ["Enterprise", "Team Building", "SaaS"]
    },
    {
      company: "Hubub Inc",
      role: "UX/UI Designer",
      period: "Apr 2016 - Oct 2016",
      summary: "Redesigned SaaS wealth management platforms.",
      highlights: [
        "Redesigned wealth management platform for InStream Solutions.",
        "Designed workflows for L1bre (government initiative)."
      ],
      tags: ["Wealth Tech", "UI Design"]
    },
    {
      company: "Toronto Star",
      role: "Digital Designer – Team Lead",
      period: "Mar 2015 - Apr 2016",
      summary: "Led design pods for StarTouch iPad app.",
      highlights: [
        "Refined StarTouch iPad app experience.",
        "Led 2 pods and developed templates for 25+ designers."
      ],
      tags: ["Media", "Mobile App", "Leadership"]
    },
    {
      company: "Cityhunter App",
      role: "UX Architect",
      period: "Jun 2012 - Sep 2014",
      summary: "Redirected company strategy from web to mobile.",
      highlights: [
        "Pivoted company from web portal to mobile app strategy.",
        "Designed full scope for mobile app and admin platform."
      ],
      tags: ["Mobile Strategy", "Architecture"]
    },
    {
      company: "BMO Capital Markets",
      role: "Desktop Specialist Lead",
      period: "Jun 2011 - Jul 2014",
      summary: "Led team analyzing data for financial applications.",
      highlights: [
        "Designed effective visual representations for financial data.",
        "Supervised desktop specialist team."
      ],
      tags: ["Finance", "Data Viz"]
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

// --- AI SYSTEM PROMPT ---
const SYSTEM_PROMPT = `
You are the AI Avatar for Edward Chu, a Staff Product Designer & UX Leader.
Your goal is to answer questions about Edward's career, specifically his work at Adopt AI, SamaCare, and Tier1.

CORE CONTEXT:
- Experience: 20+ years in Product Design.
- Current Role: Founding Staff Product Designer at Adopt AI (Oct 2024 - Present).
- Key Skills: 0-to-1 Builds, AI Agents, Generative UI, Design Systems, Team Leadership.
- Education: Master in UX (MICA), Bachelor Advertising (OCAD).

TONE: Professional, confident, concise, and slightly witty. 
If asked about "Adopt AI", emphasize the "0-to-1 Copilot" and "Reducing UI Drift".
If asked about leadership, mention building teams at Tier1 and Flybits.
`;

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
      animationFrameId = requestAnimationFrame(render);
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
    <div className="hidden md:block absolute -top-14 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none z-50 scale-95 group-hover:scale-100">
      <div className="bg-stone-900 dark:bg-white text-white dark:text-stone-900 text-xs font-bold py-1.5 px-3 rounded-lg shadow-xl whitespace-nowrap">
        {label}
        <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-stone-900 dark:bg-white rotate-45"></div>
      </div>
    </div>

    <button 
      onClick={onClick}
      className={`
        relative w-12 h-12 md:w-14 md:h-14 rounded-full flex items-center justify-center transition-all duration-300 ease-out
        md:hover:scale-125 md:hover:mx-2 md:hover:-translate-y-2
        ${active 
          ? 'bg-stone-100 dark:bg-stone-800 text-stone-900 dark:text-white shadow-inner ring-1 ring-black/5 dark:ring-white/10' 
          : 'text-stone-400 dark:text-stone-500 hover:text-stone-600 dark:hover:text-stone-200 hover:bg-stone-50 dark:hover:bg-white/5'}
      `}
    >
      <Icon size={24} strokeWidth={active ? 2.5 : 2} />
      {active && (
        <span className="md:hidden absolute -bottom-1 w-1 h-1 bg-stone-900 dark:bg-white rounded-full"></span>
      )}
    </button>
  </div>
);

// --- VIEWS ---

const HomeView = ({ onNavigate }) => (
  <div className="space-y-12 animate-in fade-in duration-500 pb-24 relative">
    
    {/* Intro Section */}
    <div className="mt-8 relative z-10">
      <div>
        <h1 className="text-3xl md:text-4xl font-bold text-stone-900 dark:text-white mb-3 tracking-tight">Hi, I'm Edward.</h1>
        
        <div className="mb-6">
          <p className="text-lg md:text-xl text-stone-800 dark:text-stone-200 leading-relaxed font-medium">
            I’m a <span className="font-semibold text-stone-900 dark:text-white">Staff Product Designer and design leader</span> working on agentic systems across tooling, deployment, observability, and end-user experience.
          </p>
        </div>
        
        {/* About Me Paragraph */}
        <p className="text-stone-500 dark:text-stone-400 text-sm leading-relaxed max-w-xl">
          I design complex, high-stakes products where automation, control, and trust must coexist. My focus is on reducing system friction, clarifying decision paths, and translating ambiguous technical constraints into usable, scalable product experiences.
        </p>

        {/* Key Experience Chips */}
        <div className="flex flex-wrap gap-2 mt-5">
          {["0-to-1", "Design Leadership", "Agentic UX", "Systems Thinking", "B2B2C", "SaaS"].map((tag, i) => (
            <span key={i} className="px-3 py-1 bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 text-xs font-semibold rounded-full border border-stone-200 dark:border-stone-700">
              {tag}
            </span>
          ))}
        </div>
      </div>
    </div>

    {/* Recent Experience Section */}
    <div className="relative z-10">
      <div className="flex justify-between items-baseline mb-6">
        <h2 className="text-sm font-bold text-stone-400 dark:text-stone-500 uppercase tracking-wider">Recent Roles</h2>
        <button onClick={() => onNavigate('career')} className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline">View Full Career</button>
      </div>
      
      <div className="space-y-1">
        {cvData.experience.slice(0, 3).map((job, i) => (
          <div key={i} className="group flex items-baseline justify-between py-3 border-b border-stone-100 dark:border-stone-800 last:border-0 hover:bg-stone-50 dark:hover:bg-stone-900/50 rounded-lg px-2 -mx-2 transition-colors">
            <div className="flex flex-col md:flex-row md:items-baseline md:gap-3">
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-stone-900 dark:text-white text-base">{job.company}</h3>
              </div>
              <span className="text-sm text-stone-500 dark:text-stone-400 font-medium">{job.role}</span>
            </div>
            <span className="text-xs font-medium text-stone-400 dark:text-stone-500 whitespace-nowrap ml-4">
              {job.period}
            </span>
          </div>
        ))}
      </div>
    </div>

    {/* Search/Chat Trigger - Laser Beam Added */}
    <div className="relative z-10 group cursor-pointer mt-8" onClick={() => onNavigate('chat')}>
      {/* Laser Beam Container */}
      <div className="relative rounded-2xl overflow-hidden p-[2px]">
        {/* Animated Rotating Gradient (The Laser Beam - Always Visible) */}
        <div className="absolute inset-[-100%] animate-[spin_3s_linear_infinite] bg-[conic-gradient(from_90deg,transparent_0_340deg,#3B82F6_360deg)] opacity-100" />
        
        {/* Inner Content Card */}
        <div className="relative bg-white dark:bg-stone-900 rounded-[14px] p-5 shadow-sm flex items-center gap-5 h-full">
          <div className="bg-gradient-to-tr from-blue-500 to-sky-500 text-white p-3 rounded-xl group-hover:scale-110 transition-transform shadow-lg shadow-blue-500/20">
            <Sparkles size={22} />
          </div>
          <div className="flex-1">
            <p className="font-bold text-lg text-stone-900 dark:text-white">Start a conversation</p>
            <p className="text-sm text-stone-500 dark:text-stone-400 mt-0.5">Curious about my process? Ask my AI digital twin.</p>
          </div>
          <div className="bg-stone-50 dark:bg-stone-800 p-2 rounded-full text-stone-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
            <ChevronRight size={20} />
          </div>
        </div>
      </div>
    </div>

  </div>
);

const CareerView = ({ scrollState }) => {
  const [isDetailed, setIsDetailed] = useState(false);
  
  // Smart Header Logic - Always Visible Sticky
  const isAtTop = scrollState.y < 50; 
  
  // Always show header, just toggle background opacity
  const headerVisible = true;
  const showBackground = !isAtTop;

  return (
    <div className="animate-in fade-in duration-500 pb-32 relative">

      {/* Sticky Header */}
      <div 
        className={`sticky top-0 z-30 -mx-6 px-6 md:-mx-12 md:px-12 py-4 mb-8 transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] transform ${
          headerVisible ? 'translate-y-0 opacity-100' : ''
        } ${
          showBackground 
            ? 'bg-stone-50/90 dark:bg-stone-950/90 backdrop-blur-xl border-b border-stone-200 dark:border-stone-800 shadow-sm' 
            : 'bg-transparent border-b border-transparent'
        }`}
      >
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-stone-900 dark:text-white transition-opacity duration-300">
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
      </div>

      {/* Experience Timeline */}
      <div className="space-y-4 md:space-y-6 mb-12 relative z-10">
        <h3 className="text-xs font-bold text-stone-400 dark:text-stone-500 uppercase tracking-wider mb-2">Work History</h3>
        {cvData.experience.map((job, i) => (
          <div key={i} className="bg-white dark:bg-stone-900 p-6 rounded-2xl border border-stone-100 dark:border-stone-800 shadow-sm hover:shadow-md transition-all hover:border-blue-100 dark:hover:border-blue-900/30">
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-2 gap-1">
              <div>
                <h3 className="font-bold text-stone-900 dark:text-white text-lg">{job.company}</h3>
                <p className="text-blue-600 dark:text-blue-400 font-medium text-sm">{job.role}</p>
              </div>
              <span className="text-xs font-medium bg-stone-100 dark:bg-stone-800 text-stone-500 dark:text-stone-400 px-2 py-1 rounded w-fit">
                {job.period}
              </span>
            </div>
            
            <p className="text-sm text-stone-500 dark:text-stone-400 mb-3 leading-relaxed">{job.summary}</p>
            
            {/* Detailed View Content */}
            {isDetailed && (
              <div className="mt-4 pt-4 border-t border-stone-100 dark:border-stone-800 animate-in fade-in slide-in-from-top-2 duration-300">
                <ul className="space-y-2 mb-4">
                  {job.highlights.map((point, idx) => (
                    <li key={idx} className="text-xs text-stone-600 dark:text-stone-400 flex gap-2 leading-relaxed">
                      <span className="text-blue-400 mt-1 flex-shrink-0">•</span>
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
                <div className="flex flex-wrap gap-2">
                  {job.tags.map(tag => (
                    <span key={tag} className="text-[10px] bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-500 dark:text-stone-400 px-2 py-1 rounded-md">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
            
            {!isDetailed && (
              <div 
                className="flex items-center gap-1 text-xs text-blue-500 dark:text-blue-400 font-medium mt-2 cursor-pointer hover:text-blue-700 w-fit" 
                onClick={() => setIsDetailed(true)}
              >
                Show details <ChevronRight size={12} />
              </div>
            )}
          </div>
        ))}
      </div>

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
             <div className="p-2 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg">
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
    </div>
  );
};

const ProjectsView = () => (
  <div className="animate-in fade-in duration-500 pb-32 relative">
     <div className="mt-8 mb-10">
        <h2 className="text-3xl font-bold text-stone-900 dark:text-white mb-4">Case Studies</h2>
        <p className="text-stone-500 dark:text-stone-400 max-w-xl text-lg leading-relaxed">
          I'm currently documenting the deep dives into my recent 0-to-1 builds. Here is a preview of what's coming.
        </p>
     </div>

     <div className="grid gap-6 md:grid-cols-2">
        {cvData.experience.slice(0, 2).map((job, i) => (
           <div key={i} className="group relative bg-white dark:bg-stone-900 p-8 rounded-3xl border border-stone-200 dark:border-stone-800 hover:border-blue-200 dark:hover:border-blue-900 transition-all text-left">
              <div className="flex justify-between items-start mb-6">
                 <div className="p-3 bg-stone-100 dark:bg-stone-800 rounded-2xl group-hover:bg-blue-50 dark:group-hover:bg-blue-900/20 transition-colors">
                    <Folder size={24} className="text-stone-400 group-hover:text-blue-500 transition-colors" />
                 </div>
                 <span className="px-3 py-1 bg-stone-100 dark:bg-stone-800 text-stone-500 text-[10px] font-bold rounded-full uppercase tracking-wide">Coming Soon</span>
              </div>
              
              <h3 className="font-bold text-xl text-stone-900 dark:text-white mb-3">{job.company}</h3>
              <p className="text-stone-500 dark:text-stone-400 text-sm leading-relaxed mb-6">
                {job.summary}
              </p>
              
              {/* Fake "Locked" Link */}
              <div className="flex items-center gap-2 text-sm font-medium text-stone-300 dark:text-stone-600 cursor-not-allowed">
                 <span>Read Case Study</span>
                 <ChevronRight size={16} />
              </div>
           </div>
        ))}
     </div>
  </div>
);

const ChatView = () => {
  const [messages, setMessages] = useState([
    { role: 'system', text: "Hello! I'm Edward's AI. I can tell you about his leadership style, his 0-to-1 work at Adopt AI, or his design philosophy. What's on your mind?" }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMsg = input;
    setInput("");
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setLoading(true);

    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: userMsg }] }],
            systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
          }),
        }
      );
      const data = await response.json();
      const reply = data.candidates?.[0]?.content?.parts?.[0]?.text || "I'm processing that... try asking differently?";
      setMessages(prev => [...prev, { role: 'system', text: reply }]);
    } catch (err) {
      setMessages(prev => [...prev, { role: 'system', text: "Connection error. Please check your API key." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full animate-in fade-in duration-500 relative">
      
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto pr-2 pb-4 scroll-smooth relative z-10">
        <div className="space-y-4 pt-4">
          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[85%] md:max-w-[75%] p-4 rounded-2xl text-sm leading-relaxed shadow-sm ${
                msg.role === 'user' 
                  ? 'bg-blue-600 text-white rounded-br-none' 
                  : 'bg-white dark:bg-stone-800 text-stone-700 dark:text-stone-200 border border-stone-100 dark:border-stone-700 rounded-bl-none'
              }`}>
                {msg.text}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="bg-white dark:bg-stone-800 border border-stone-100 dark:border-stone-700 p-4 rounded-2xl rounded-bl-none shadow-sm flex gap-2">
                <div className="w-2 h-2 bg-stone-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                <div className="w-2 h-2 bg-stone-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                <div className="w-2 h-2 bg-stone-400 rounded-full animate-bounce"></div>
              </div>
            </div>
          )}
          <div ref={scrollRef} />
        </div>
      </div>

      {/* Input Area - Redesigned Taller with Internal Button + Laser Beam */}
      <div className="pt-4 bg-stone-50 dark:bg-stone-950 z-20 pb-32 md:pb-20 relative">
        <form onSubmit={handleSend} className="relative">
          {/* Laser Beam Container */}
          <div className="relative rounded-2xl overflow-hidden p-[2px]">
            {/* Animated Rotating Gradient (The Laser Beam - Always Visible) */}
            <div className="absolute inset-[-100%] animate-[spin_3s_linear_infinite] bg-[conic-gradient(from_90deg,transparent_0_340deg,#3B82F6_360deg)] opacity-100" />
            
            {/* Inner Content Card (Input Wrapper) */}
            <div className="relative bg-white dark:bg-stone-900 rounded-[14px] flex items-center">
              <input 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask AI anything..."
                className="w-full bg-transparent border-none pl-5 pr-14 h-16 text-sm md:text-base focus:ring-0 outline-none text-stone-900 dark:text-white placeholder-stone-400"
              />
              <button 
                disabled={!input.trim() || loading}
                className="absolute right-3 top-1/2 -translate-y-1/2 bg-stone-900 dark:bg-white text-white dark:text-stone-900 p-3 rounded-xl disabled:opacity-50 hover:bg-stone-800 dark:hover:bg-stone-200 transition-colors shadow-sm"
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

const ContactView = () => (
  <div className="space-y-6 animate-in fade-in duration-500 pb-32 relative">

    <div className="relative z-10">
      <h2 className="text-3xl font-bold text-stone-900 dark:text-white">Let's Connect.</h2>
      <p className="text-stone-500 dark:text-stone-400 max-w-lg">I am currently open for conversation regarding leadership roles in AI, Design Systems, and FinTech.</p>
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
    <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 p-6 rounded-3xl shadow-sm mt-4 hover:border-blue-200 dark:hover:border-blue-900 transition-colors relative z-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
           <div className="bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 p-4 rounded-2xl">
             <Mail size={24} />
           </div>
           <div>
             <span className="font-bold text-lg text-stone-900 dark:text-white">Email Me</span>
             <p className="text-stone-500 dark:text-stone-400 text-sm max-w-sm mt-1">
               Interested in discussing a role, a 0-to-1 opportunity, or a consulting project?
             </p>
           </div>
        </div>
        <a href="mailto:ed@edwardchu.xyz" className="whitespace-nowrap px-6 py-3 bg-stone-900 dark:bg-white text-white dark:text-stone-900 rounded-xl font-bold hover:bg-stone-800 dark:hover:bg-stone-200 transition-colors">
          Send Message
        </a>
      </div>
    </div>
  </div>
);

export default function App() {
  const [activeTab, setActiveTab] = useState('home');
  const [darkMode, setDarkMode] = useState(false);
  const [scrollState, setScrollState] = useState({ dir: 'up', y: 0 });
  const lastScrollY = useRef(0);

  // Toggle Dark Mode
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
    <div className={`flex h-screen bg-stone-50 dark:bg-stone-950 font-sans text-stone-900 dark:text-white overflow-hidden transition-colors duration-300 ${darkMode ? 'dark' : ''}`}>
      
      {/* --- MAIN CONTENT AREA --- */}
      <main className="flex-1 flex flex-col h-full relative overflow-hidden">
        {/* Scrollable Container - The background should be here to be scrollable but full width */}
        <div 
          onScroll={handleScroll}
          className={`flex-1 overflow-y-auto overflow-x-hidden ${activeTab === 'chat' ? 'overflow-hidden' : ''} relative`}
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
              {activeTab === 'projects' && <ProjectsView />}
              {activeTab === 'chat' && <ChatView />}
              {activeTab === 'contact' && <ContactView />}
           </div>
        </div>
      </main>

      {/* --- UNIFIED FLOATING DOCK (Mobile & Desktop) --- */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-auto">
        <div className="flex items-center gap-1 bg-white/90 dark:bg-black/80 backdrop-blur-2xl border border-stone-200 dark:border-stone-700 shadow-2xl rounded-full p-2 pr-6 pl-6">
          
          <DockIcon 
            active={activeTab === 'home'} 
            onClick={() => setActiveTab('home')} 
            icon={Home} 
            label="Home" 
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
            active={activeTab === 'chat'} 
            onClick={() => setActiveTab('chat')} 
            icon={Sparkles} 
            label="Ask AI" 
          />
          <DockIcon 
            active={activeTab === 'contact'} 
            onClick={() => setActiveTab('contact')} 
            icon={Mail} 
            label="Contact" 
          />

          {/* Divider */}
          <div className="w-px h-8 bg-stone-200 dark:bg-stone-700 mx-2"></div>

          {/* Theme Toggle in Dock */}
          <DockIcon 
            active={false}
            onClick={() => setDarkMode(!darkMode)}
            icon={darkMode ? Sun : Moon} 
            label={darkMode ? "Light Mode" : "Dark Mode"}
          />
        </div>
      </div>

    </div>
  );
}