import React, { useState, useEffect } from 'react';

const CARD_SIZE = { width: 340, height: 240 };
const POSITIONS = [
  { x: 0, y: 0, z: 0, zIndex: 30 },
  { x: 55, y: -55, z: -80, zIndex: 20 },
  { x: 110, y: -90, z: -200, zIndex: 10 },
];
const TRANSITION_DELAY_BY_SLOT = { 0: 150, 1: 300, 2: 0 };
const TRANSITION = 'transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)';

const PLACEHOLDER_TITLES = ['Project One', 'Project Two', 'Project Three'];
const PLACEHOLDER_CAPTIONS = ['Case study coming soon', 'Case study coming soon', 'Case study coming soon'];

export default function StackedCards() {
  const [frontIndex, setFrontIndex] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setFrontIndex((prev) => (prev + 1) % 3);
    }, 3000);
    return () => clearInterval(id);
  }, []);

  return (
    <div
      className="relative w-full"
      style={{
        perspective: '900px',
        height: '320px',
        overflow: 'visible',
      }}
    >
      <div
        className="relative w-full h-full overflow-visible"
        style={{ perspectiveOrigin: '50% 50%' }}
      >
        {[0, 1, 2].map((cardIndex) => {
          const posIndex = (cardIndex - frontIndex + 3) % 3;
          const pos = POSITIONS[posIndex];
          const delayMs = TRANSITION_DELAY_BY_SLOT[posIndex];
          return (
            <div
              key={cardIndex}
              className="absolute rounded-xl bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 shadow-lg flex flex-col overflow-hidden"
              style={{
                width: CARD_SIZE.width,
                height: CARD_SIZE.height,
                left: '50%',
                top: '50%',
                marginLeft: -CARD_SIZE.width / 2,
                marginTop: -CARD_SIZE.height / 2 + 25,
                transform: `translate3d(${pos.x}px, ${pos.y}px, ${pos.z}px) skew(0deg, 5deg)`,
                zIndex: pos.zIndex,
                transition: TRANSITION,
                transitionDelay: `${delayMs}ms`,
              }}
            >
              {/* macOS-style header bar */}
              <div className="flex items-center gap-1.5 px-3 py-2 border-b border-stone-200 dark:border-stone-700 shrink-0">
                <span className="w-2.5 h-2.5 rounded-full bg-red-400" />
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                <span className="ml-2 text-xs font-medium text-stone-500 dark:text-stone-400 truncate">
                  {PLACEHOLDER_TITLES[cardIndex]}
                </span>
              </div>
              {/* Screenshot placeholder */}
              <div className="flex-1 min-h-0 p-2">
                <div className="w-full h-full rounded-md bg-stone-200 dark:bg-stone-700" />
              </div>
              {/* Caption */}
              <div className="px-3 py-2 border-t border-stone-200 dark:border-stone-700 shrink-0">
                <p className="text-xs text-stone-500 dark:text-stone-400">
                  {PLACEHOLDER_CAPTIONS[cardIndex]}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
