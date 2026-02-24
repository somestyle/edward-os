import React, { useState, useRef, useEffect } from 'react';
import { LayoutGrid, Timer, Grid3X3, Quote, X } from 'lucide-react';
import PomodoroWidget from './PomodoroWidget';
import SudokuWidget from './SudokuWidget';
import QuotesWidget from './QuotesWidget';

type AppId = 'pomodoro' | 'sudoku' | 'quotes' | null;

const APPS: { id: AppId; label: string; icon: React.ElementType }[] = [
  { id: 'pomodoro', label: 'Pomodoro', icon: Timer },
  { id: 'sudoku', label: 'Sudoku', icon: Grid3X3 },
  { id: 'quotes', label: 'Quotes', icon: Quote },
];

export default function WidgetLauncher() {
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

  return (
    <>
      {/* Dock button: fixed bottom center, above main dock (dock is bottom-6) */}
      <div ref={panelRef} className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 flex flex-col items-center">
        {panelOpen && (
          <div
            className="absolute bottom-full mb-2 w-64 bg-white/95 dark:bg-stone-900/98 backdrop-blur-2xl border border-stone-200 dark:border-stone-700 rounded-2xl shadow-xl p-3 animate-in fade-in slide-in-from-bottom-2 duration-200"
            style={{ zIndex: 60 }}
          >
            <div className="flex justify-around gap-2">
              {APPS.map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => openApp(id)}
                  className="flex flex-col items-center gap-1.5 p-3 rounded-xl hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors min-w-[72px]"
                >
                  <div className="w-12 h-12 rounded-xl bg-stone-100 dark:bg-stone-800 flex items-center justify-center text-stone-600 dark:text-stone-300">
                    <Icon size={24} />
                  </div>
                  <span className="text-xs font-bold text-stone-700 dark:text-stone-200">{label}</span>
                </button>
              ))}
            </div>
          </div>
        )}
        <button
          type="button"
          onClick={() => setPanelOpen((o) => !o)}
          aria-label="Open widget launcher"
          className="w-12 h-12 md:w-14 md:h-14 rounded-full flex items-center justify-center bg-white/95 dark:bg-stone-900/98 border border-stone-200 dark:border-stone-700 shadow-lg text-stone-600 dark:text-stone-300 hover:text-stone-900 dark:hover:text-white hover:bg-stone-100 dark:hover:bg-stone-800 transition-all"
        >
          <LayoutGrid size={24} strokeWidth={2} />
        </button>
      </div>

      {/* Modal */}
      {modalApp && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={() => setModalApp(null)}
          role="dialog"
          aria-modal="true"
          aria-label="Widget"
        >
          <div
            className="relative bg-stone-50 dark:bg-stone-950 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-2xl max-h-[90dvh] w-full max-w-md overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setModalApp(null)}
              aria-label="Close"
              className="absolute top-3 right-3 z-10 w-10 h-10 rounded-full bg-stone-200 dark:bg-stone-700 text-stone-700 dark:text-stone-200 flex items-center justify-center hover:bg-stone-300 dark:hover:bg-stone-600 transition-colors"
            >
              <X size={20} />
            </button>
            <div className="p-4 pt-14 pb-8">
              {modalApp === 'pomodoro' && <PomodoroWidget />}
              {modalApp === 'sudoku' && <SudokuWidget />}
              {modalApp === 'quotes' && <QuotesWidget />}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
