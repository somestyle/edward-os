import React, { useState, useCallback, useMemo } from 'react';

type Difficulty = 'easy' | 'medium' | 'hard';

// One valid solved grid; we mask by difficulty to get puzzles
const SOLVED = [
  [5, 3, 4, 6, 7, 8, 9, 1, 2],
  [6, 7, 2, 1, 9, 5, 3, 4, 8],
  [1, 9, 8, 3, 4, 2, 5, 6, 7],
  [8, 5, 9, 7, 6, 1, 4, 2, 3],
  [4, 2, 6, 8, 5, 3, 7, 9, 1],
  [7, 1, 3, 9, 2, 4, 8, 5, 6],
  [9, 6, 1, 5, 3, 7, 2, 8, 4],
  [2, 8, 7, 4, 1, 9, 6, 3, 5],
  [3, 4, 5, 2, 8, 6, 1, 7, 9],
];

// Mask: true = given (fixed), false = empty for player
const EASY_MASK = [
  [true, true, false, true, true, true, false, true, true],
  [true, true, true, true, false, true, true, true, true],
  [false, true, true, true, true, true, true, false, true],
  [true, true, false, true, true, true, true, true, true],
  [true, true, true, true, true, true, true, true, false],
  [true, true, true, true, true, true, false, true, true],
  [true, false, true, true, true, true, true, true, true],
  [true, true, true, true, false, true, true, true, true],
  [true, true, true, false, true, true, true, true, true],
];

const MEDIUM_MASK = [
  [true, true, false, false, true, true, false, true, false],
  [true, false, true, true, false, true, true, true, true],
  [false, true, true, true, true, false, true, false, true],
  [true, true, false, true, false, true, true, true, false],
  [false, true, true, true, true, true, true, true, false],
  [true, false, true, true, true, false, false, true, true],
  [true, false, true, false, true, true, true, true, true],
  [true, true, true, true, true, true, false, true, false],
  [false, true, false, true, true, false, true, true, true],
];

const HARD_MASK = [
  [true, false, false, false, true, false, false, false, true],
  [false, true, true, false, false, true, true, true, false],
  [false, true, false, true, false, true, false, true, false],
  [true, false, true, false, false, true, false, true, false],
  [false, true, false, true, true, false, true, false, true],
  [false, true, false, true, false, false, true, false, true],
  [false, true, false, true, false, true, false, true, false],
  [false, true, true, true, false, false, true, true, false],
  [true, false, false, false, true, false, false, false, true],
];

const BOARDS: Record<Difficulty, boolean[][]> = {
  easy: EASY_MASK,
  medium: MEDIUM_MASK,
  hard: HARD_MASK,
};

function getConflicts(
  grid: (number | null)[][],
  row: number,
  col: number,
  value: number | null
): Set<string> {
  const conflicts = new Set<string>();
  if (value === null) return conflicts;
  for (let r = 0; r < 9; r++) {
    if (r !== row && grid[r][col] === value) conflicts.add(`${r}-${col}`);
  }
  for (let c = 0; c < 9; c++) {
    if (c !== col && grid[row][c] === value) conflicts.add(`${row}-${c}`);
  }
  const br = Math.floor(row / 3) * 3;
  const bc = Math.floor(col / 3) * 3;
  for (let r = br; r < br + 3; r++) {
    for (let c = bc; c < bc + 3; c++) {
      if ((r !== row || c !== col) && grid[r][c] === value) conflicts.add(`${r}-${c}`);
    }
  }
  return conflicts;
}

export default function SudokuWidget() {
  const [difficulty, setDifficulty] = useState<Difficulty>('easy');
  const [grid, setGrid] = useState<(number | null)[][]>(() =>
    SOLVED.map((row, r) =>
      row.map((val, c) => (BOARDS.easy[r][c] ? val : null))
    )
  );
  const [fixed, setFixed] = useState<boolean[][]>(() => BOARDS.easy);
  const [selected, setSelected] = useState<[number, number] | null>(null);
  const [elapsed, setElapsed] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const timerRef = React.useRef<ReturnType<typeof setInterval> | null>(null);

  const startTimer = useCallback(() => {
    if (timerRef.current) return;
    timerRef.current = setInterval(() => setElapsed((e) => e + 1), 1000);
  }, []);

  React.useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const newGame = useCallback((diff: Difficulty) => {
    setDifficulty(diff);
    const mask = BOARDS[diff];
    setGrid(SOLVED.map((row, r) => row.map((val, c) => (mask[r][c] ? val : null))));
    setFixed(mask);
    setSelected(null);
    setElapsed(0);
    setRevealed(false);
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = null;
  }, []);

  const setCell = useCallback((r: number, c: number, value: number | null) => {
    if (fixed[r][c]) return;
    setGrid((g) => {
      const next = g.map((row, i) => row.map((v, j) => (i === r && j === c ? value : v)));
      return next;
    });
    startTimer();
  }, [fixed, startTimer]);

  const allConflicts = useMemo(() => {
    const set = new Set<string>();
    for (let r = 0; r < 9; r++) {
      for (let c = 0; c < 9; c++) {
        const v = grid[r][c];
        if (v === null) continue;
        const conflicts = getConflicts(grid, r, c, v);
        conflicts.forEach((k) => set.add(k));
        if (conflicts.size > 0) set.add(`${r}-${c}`);
      }
    }
    return set;
  }, [grid]);

  const isCorrect = useMemo(() => {
    for (let r = 0; r < 9; r++) {
      for (let c = 0; c < 9; c++) {
        if (grid[r][c] !== SOLVED[r][c]) return false;
      }
    }
    return true;
  }, [grid]);

  const checkSolution = () => {
    if (isCorrect) alert('Correct! Well done.');
    else alert('Not quite. Keep trying!');
  };

  const revealSolution = () => {
    setRevealed(true);
    setGrid(SOLVED.map((row) => [...row]));
  };

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!selected) return;
      const [r, c] = selected;
      if (e.key >= '1' && e.key <= '9') {
        setCell(r, c, parseInt(e.key, 10));
      } else if (e.key === 'Backspace' || e.key === 'Delete') {
        setCell(r, c, null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selected, setCell]);

  const selectedRow = selected?.[0] ?? -1;
  const selectedCol = selected?.[1] ?? -1;
  const selectedVal = selected ? grid[selected[0]][selected[1]] : null;
  const sameRowColBox = useMemo(() => {
    const set = new Set<string>();
    if (!selected) return set;
    const [sr, sc] = selected;
    for (let i = 0; i < 9; i++) set.add(`${sr}-${i}`);
    for (let i = 0; i < 9; i++) set.add(`${i}-${sc}`);
    const br = Math.floor(sr / 3) * 3, bc = Math.floor(sc / 3) * 3;
    for (let r = br; r < br + 3; r++) for (let c = bc; c < bc + 3; c++) set.add(`${r}-${c}`);
    return set;
  }, [selected]);

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
  };

  return (
    <div className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-sm p-4 md:p-6 max-w-sm mx-auto overflow-x-auto">
      <h3 className="text-lg font-bold text-stone-900 dark:text-white mb-3 text-center">Sudoku</h3>

      <div className="flex gap-2 mb-3">
        {(['easy', 'medium', 'hard'] as const).map((d) => (
          <button
            key={d}
            type="button"
            onClick={() => newGame(d)}
            className={`flex-1 py-1.5 text-xs font-bold rounded-lg capitalize ${
              difficulty === d
                ? 'bg-stone-900 dark:bg-white text-white dark:text-stone-900'
                : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300'
            }`}
          >
            {d}
          </button>
        ))}
      </div>

      <p className="text-xs text-stone-500 dark:text-stone-400 text-center mb-2">Time: {formatTime(elapsed)}</p>

      <div className="inline-grid grid-cols-9 gap-0 border-2 border-stone-800 dark:border-stone-200 w-full max-w-[280px] mx-auto">
        {grid.map((row, r) =>
          row.map((val, c) => {
            const key = `${r}-${c}`;
            const isSelected = selectedRow === r && selectedCol === c;
            const isRelated = sameRowColBox.has(key) && !isSelected;
            const isConflict = allConflicts.has(key);
            const isFixed = fixed[r][c];
            const isSameNumber = selectedVal !== null && val === selectedVal;
            return (
              <button
                key={key}
                type="button"
                onClick={() => {
                  if (isFixed) return;
                  setSelected([r, c]);
                }}
                className={`
                  w-8 h-8 md:w-9 md:h-9 flex items-center justify-center text-sm font-bold border
                  border-stone-300 dark:border-stone-600
                  ${(r + 1) % 3 === 0 && r < 8 ? 'border-b-2 border-b-stone-800 dark:border-b-stone-200' : ''}
                  ${(c + 1) % 3 === 0 && c < 8 ? 'border-r-2 border-r-stone-800 dark:border-r-stone-200' : ''}
                  ${isSelected ? 'ring-2 ring-[var(--accent,#3b82f6)] ring-inset bg-blue-50 dark:bg-blue-900/20' : ''}
                  ${isRelated && !isSelected ? 'bg-stone-100 dark:bg-stone-800' : ''}
                  ${isSameNumber && !isSelected ? 'text-[var(--accent,#3b82f6)]' : 'text-stone-900 dark:text-white'}
                  ${isConflict ? '!text-red-600 dark:!text-red-400 bg-red-50 dark:bg-red-900/20' : ''}
                  ${isFixed ? 'bg-stone-50 dark:bg-stone-800/50' : ''}
                `}
              >
                {val ?? ''}
              </button>
            );
          })
        )}
      </div>

      <div className="flex flex-wrap gap-2 justify-center mt-4">
        <button
          type="button"
          onClick={() => newGame(difficulty)}
          className="px-3 py-2 bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-200 rounded-xl text-xs font-bold"
        >
          New Game
        </button>
        <button
          type="button"
          onClick={checkSolution}
          className="px-3 py-2 bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-200 rounded-xl text-xs font-bold"
        >
          Check Solution
        </button>
        <button
          type="button"
          onClick={revealSolution}
          className="px-3 py-2 bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-200 rounded-xl text-xs font-bold"
        >
          Reveal
        </button>
      </div>
    </div>
  );
}