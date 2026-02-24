import React from 'react';
import { Sun, Moon } from 'lucide-react';

interface ThemeWidgetProps {
  style: string;
  onStyleChange: (s: string) => void;
  darkMode: boolean;
  onDarkModeChange: (v: boolean) => void;
  onChangelogClick?: () => void;
}

export default function ThemeWidget({
  style,
  onStyleChange,
  darkMode,
  onDarkModeChange,
  onChangelogClick,
}: ThemeWidgetProps) {
  return (
    <div className="w-full max-w-sm mx-auto bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-sm p-6 md:p-8">
      <h3 className="text-lg font-bold text-stone-900 dark:text-white mb-4 text-center">Themes</h3>
      <div className="space-y-4">
        <div>
          <p className="text-[11px] font-semibold text-stone-400 dark:text-stone-500 uppercase tracking-wider mb-2">Style</p>
          <div className="p-1 bg-stone-100 dark:bg-stone-800 rounded-xl flex">
            {['Modern', 'Retro'].map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => onStyleChange(s.toLowerCase())}
                className={`
                  flex-1 py-2 text-xs font-bold rounded-lg transition-all
                  ${style === s.toLowerCase()
                    ? 'bg-white dark:bg-stone-700 text-stone-900 dark:text-white shadow-sm'
                    : 'text-stone-500 dark:text-stone-400 hover:text-stone-700 dark:hover:text-stone-200'}
                `}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
        <div>
          <p className="text-[11px] font-semibold text-stone-400 dark:text-stone-500 uppercase tracking-wider mb-2">Mode</p>
          <button
            type="button"
            onClick={() => onDarkModeChange(!darkMode)}
            className="w-full p-2.5 rounded-xl bg-stone-100 dark:bg-stone-800 flex items-center justify-between gap-3 transition-colors hover:bg-stone-50 dark:hover:bg-stone-700/80"
          >
            <span className="text-sm font-medium text-stone-700 dark:text-stone-200">
              {darkMode ? 'Dark' : 'Light'}
            </span>
            <div className="flex items-center gap-2">
              <Sun size={16} className={darkMode ? 'text-stone-400' : 'text-stone-700 dark:text-stone-300'} />
              <div
                className={`
                  w-9 h-5 rounded-full p-0.5 flex transition-colors
                  ${darkMode ? 'justify-end bg-stone-900 dark:bg-stone-600' : 'justify-start bg-stone-300 dark:bg-stone-500'}
                `}
              >
                <div className="w-4 h-4 rounded-full bg-white shadow-sm shrink-0 transition-transform" />
              </div>
              <Moon size={16} className={darkMode ? 'text-stone-700 dark:text-stone-300' : 'text-stone-400'} />
            </div>
          </button>
        </div>
        {onChangelogClick && (
          <div className="pt-2 mt-2 border-t border-stone-100 dark:border-stone-800">
            <button
              type="button"
              onClick={onChangelogClick}
              className="text-xs text-stone-400 dark:text-stone-500 hover:text-stone-600 dark:hover:text-stone-300 transition-colors"
            >
              v1.2 (Changelog)
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
