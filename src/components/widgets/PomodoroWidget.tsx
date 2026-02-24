import React, { useState, useEffect, useRef, useCallback } from 'react';

const WORK_SEC = 25 * 60;
const SHORT_BREAK_SEC = 5 * 60;
const LONG_BREAK_SEC = 15 * 60;

type Mode = 'work' | 'shortBreak' | 'longBreak';

const MODE_DURATIONS: Record<Mode, number> = {
  work: WORK_SEC,
  shortBreak: SHORT_BREAK_SEC,
  longBreak: LONG_BREAK_SEC,
};

function playCompletionSound() {
  try {
    const ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.setValueAtTime(880, ctx.currentTime);
    osc.frequency.setValueAtTime(1100, ctx.currentTime + 0.1);
    gain.gain.setValueAtTime(0.15, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.3);
  } catch {
    // ignore
  }
}

function formatTime(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

export default function PomodoroWidget() {
  const [mode, setMode] = useState<Mode>('work');
  const [secondsLeft, setSecondsLeft] = useState(WORK_SEC);
  const [isRunning, setIsRunning] = useState(false);
  const [session, setSession] = useState(1);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const modeRef = useRef(mode);
  modeRef.current = mode;
  const totalForMode = MODE_DURATIONS[mode];
  const progress = 1 - secondsLeft / totalForMode;

  const switchMode = useCallback((newMode: Mode) => {
    setMode(newMode);
    setSecondsLeft(MODE_DURATIONS[newMode]);
    setIsRunning(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (!isRunning) return;
    intervalRef.current = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          if (intervalRef.current) clearInterval(intervalRef.current);
          intervalRef.current = null;
          setIsRunning(false);
          playCompletionSound();
          if (modeRef.current === 'work') setSession((s) => Math.min(s + 1, 4));
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isRunning]);

  const handleModeChange = (newMode: Mode) => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setIsRunning(false);
    setMode(newMode);
    setSecondsLeft(MODE_DURATIONS[newMode]);
  };

  const reset = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setIsRunning(false);
    setSecondsLeft(MODE_DURATIONS[mode]);
  };

  const size = 200;
  const stroke = 8;
  const r = (size - stroke) / 2;
  const circumference = 2 * Math.PI * r;
  const dash = progress * circumference;

  return (
    <div className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-sm p-6 md:p-8 max-w-sm mx-auto">
      <h3 className="text-lg font-bold text-stone-900 dark:text-white mb-4 text-center">Pomodoro</h3>

      {/* Mode tabs */}
      <div className="flex p-1 bg-stone-100 dark:bg-stone-800 rounded-xl mb-6">
        {(['work', 'shortBreak', 'longBreak'] as const).map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => handleModeChange(m)}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
              mode === m
                ? 'bg-white dark:bg-stone-700 text-stone-900 dark:text-white shadow-sm'
                : 'text-stone-500 dark:text-stone-400 hover:text-stone-700 dark:hover:text-stone-200'
            }`}
          >
            {m === 'work' ? 'Work' : m === 'shortBreak' ? 'Short' : 'Long'}
          </button>
        ))}
      </div>

      {/* Circular countdown */}
      <div className="relative flex justify-center items-center mb-6" style={{ width: size, height: size, margin: '0 auto' }}>
        <svg width={size} height={size} className="-rotate-90">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            fill="none"
            stroke="currentColor"
            strokeWidth={stroke}
            className="text-stone-200 dark:text-stone-700"
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            fill="none"
            stroke="var(--accent, #3b82f6)"
            strokeWidth={stroke}
            strokeDasharray={circumference}
            strokeDashoffset={circumference - dash}
            strokeLinecap="round"
            className="transition-all duration-1000 ease-linear"
          />
        </svg>
        <span className="absolute text-3xl font-bold text-stone-900 dark:text-white tabular-nums">
          {formatTime(secondsLeft)}
        </span>
      </div>

      {/* Session counter */}
      <p className="text-xs text-stone-500 dark:text-stone-400 text-center mb-4">
        Session {Math.min(session, 4)} of 4
      </p>

      {/* Controls */}
      <div className="flex justify-center gap-2">
        <button
          type="button"
          onClick={() => setIsRunning(true)}
          disabled={isRunning}
          className="px-4 py-2 bg-stone-900 dark:bg-white text-white dark:text-stone-900 rounded-xl text-sm font-bold disabled:opacity-50 hover:bg-stone-800 dark:hover:bg-stone-200 transition-colors"
        >
          Start
        </button>
        <button
          type="button"
          onClick={() => setIsRunning(false)}
          disabled={!isRunning}
          className="px-4 py-2 bg-stone-200 dark:bg-stone-700 text-stone-900 dark:text-white rounded-xl text-sm font-bold disabled:opacity-50 hover:bg-stone-300 dark:hover:bg-stone-600 transition-colors"
        >
          Pause
        </button>
        <button
          type="button"
          onClick={reset}
          className="px-4 py-2 bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-200 rounded-xl text-sm font-bold hover:bg-stone-200 dark:hover:bg-stone-700 transition-colors"
        >
          Reset
        </button>
      </div>
    </div>
  );
}
