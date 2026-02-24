import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { LayoutGrid, Timer, Grid3X3, Quote, Paintbrush, X } from 'lucide-react';
import PomodoroWidget from './PomodoroWidget';
import SudokuWidget from './SudokuWidget';
import QuotesWidget from './QuotesWidget';
import ThemeWidget from './ThemeWidget';

type AppId = 'pomodoro' | 'sudoku' | 'quotes' | 'theme' | null;

export interface WidgetLauncherThemeProps {
  themeStyle: string;
  onThemeStyleChange: (s: string) => void;
  darkMode: boolean;
  onDarkModeChange: (v: boolean) => void;
  onChangelogClick?: () => void;
}

const APPS: { id: AppId; label: string; icon: React.ElementType }[] = [
  { id: 'pomodoro', label: 'Pomodoro', icon: Timer },
  { id: 'sudoku', label: 'Sudoku', icon: Grid3X3 },
  { id: 'quotes', label: 'Quotes', icon: Quote },
  { id: 'theme', label: 'Themes', icon: Paintbrush },
];

interface WidgetLauncherProps extends Partial<WidgetLauncherThemeProps> {}

export default function WidgetLauncher({
  themeStyle,
  onThemeStyleChange,
  darkMode,
  onDarkModeChange,
  onChangelogClick,
}: WidgetLauncherProps) {
  const [panelOpen, setPanelOpen] = useState(false);
  const [modalApp, setModalApp] = useState<AppId>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!panelOpen) return;
    const handleClick = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setPanelOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [panelOpen]);

  const openApp = (id: AppId) => {
    if (id) setModalApp(id);
    setPanelOpen(false);
  };

  const handleChangelogClick = () => {
    setModalApp(null);
    onChangelogClick?.();
  };

  return (
    <>
      {/* In-dock trigger + launcher panel (positioned above this block, same as old Theme) */}
      <div ref={panelRef} className="relative group flex flex-col items-center">
        {/* Tooltip - same behaviour as DockIcon */}
        <div className="hidden md:block absolute -top-14 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none z-50 scale-95 group-hover:scale-100">
          <div className="bg-stone-900 dark:bg-white text-white dark:text-stone-900 text-xs font-bold py-1.5 px-3 rounded-lg shadow-xl whitespace-nowrap">
            Widgets
            <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-stone-900 dark:bg-white rotate-45"></div>
          </div>
        </div>
        {panelOpen && (
          <div
            className="
              fixed left-4 right-4 bottom-20 w-auto max-w-sm mx-auto
              md:absolute md:bottom-full md:mb-2 md:left-1/2 md:right-auto md:-translate-x-1/2 md:w-64 md:max-w-none md:mx-0
              bg-white/95 dark:bg-stone-900/98 backdrop-blur-2xl border border-stone-200 dark:border-stone-700 rounded-2xl shadow-xl p-3 animate-in fade-in slide-in-from-bottom-2 duration-200
            "
            style={{ zIndex: 60 }}
          >
            <div className="flex flex-wrap justify-center gap-2">
              {APPS.map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => openApp(id)}
                  className="flex flex-col items-center gap-1.5 p-2 sm:p-3 rounded-xl hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors min-w-[64px] sm:min-w-[72px]"
                >
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-stone-100 dark:bg-stone-800 flex items-center justify-center text-stone-600 dark:text-stone-300 shrink-0">
                    <Icon size={20} />
                  </div>
                  <span className="text-[10px] sm:text-xs font-bold text-stone-700 dark:text-stone-200 leading-tight">{label}</span>
                </button>
              ))}
            </div>
          </div>
        )}
        <button
          type="button"
          onClick={() => setPanelOpen((o) => !o)}
          aria-label="Open widget launcher"
          className={`
            relative w-12 h-12 md:w-14 md:h-14 rounded-full flex items-center justify-center transition-all duration-300 ease-out
            md:hover:scale-125 md:hover:mx-2 md:hover:-translate-y-2
            ${panelOpen
              ? 'bg-stone-100 dark:bg-stone-800 text-stone-900 dark:text-white shadow-inner ring-1 ring-black/5 dark:ring-white/10'
              : 'text-stone-400 dark:text-stone-500 hover:text-stone-600 dark:hover:text-stone-200 hover:bg-stone-50 dark:hover:bg-white/5'}
          `}
        >
          <LayoutGrid size={24} strokeWidth={panelOpen ? 2.5 : 2} />
        </button>
      </div>

      {/* Modal - portaled to body so it's truly viewport-centered (avoids dock transform containing block) */}
      {modalApp &&
        typeof document !== 'undefined' &&
        createPortal(
          <div
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200 min-h-[100dvh]"
            onClick={() => setModalApp(null)}
            role="dialog"
            aria-modal="true"
            aria-label="Widget"
          >
            <div
              className="relative flex flex-col bg-stone-50 dark:bg-stone-950 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-2xl w-full max-w-md min-h-[50dvh] max-h-[90dvh] my-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                type="button"
                onClick={() => setModalApp(null)}
                aria-label="Close"
                className="absolute top-3 right-3 z-10 w-10 h-10 rounded-full bg-stone-200 dark:bg-stone-700 text-stone-700 dark:text-stone-200 flex items-center justify-center hover:bg-stone-300 dark:hover:bg-stone-600 transition-colors shrink-0"
              >
                <X size={20} />
              </button>
              <div className="p-4 pt-14 pb-8 flex-1 flex flex-col items-center justify-center overflow-y-auto min-h-0">
                {modalApp === 'pomodoro' && <PomodoroWidget />}
                {modalApp === 'sudoku' && <SudokuWidget />}
                {modalApp === 'quotes' && <QuotesWidget />}
                {modalApp === 'theme' && themeStyle != null && onThemeStyleChange && darkMode != null && onDarkModeChange && (
                  <ThemeWidget
                    style={themeStyle}
                    onStyleChange={onThemeStyleChange}
                    darkMode={darkMode}
                    onDarkModeChange={onDarkModeChange}
                    onChangelogClick={handleChangelogClick}
                  />
                )}
              </div>
            </div>
          </div>,
          document.body
        )}
    </>
  );
}
