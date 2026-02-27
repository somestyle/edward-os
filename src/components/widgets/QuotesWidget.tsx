import React, { useState, useCallback } from 'react';
import { ChevronLeft, ChevronRight, Shuffle } from 'lucide-react';

type Category = 'all' | 'design' | 'engineering' | 'invention';

interface Quote {
  text: string;
  author: string;
  role: string;
  category: Category;
}

const QUOTES: Quote[] = [
  { text: 'Good design is as little design as possible.', author: 'Dieter Rams', role: 'Industrial Designer', category: 'design' },
  { text: 'Design is not just what it looks like and feels like. Design is how it works.', author: 'Steve Jobs', role: 'Co-founder, Apple', category: 'design' },
  { text: 'Simplicity is the ultimate sophistication.', author: 'Leonardo da Vinci', role: 'Inventor & Artist', category: 'invention' },
  { text: 'The details are not the details. They make the design.', author: 'Charles Eames', role: 'Designer & Architect', category: 'design' },
  { text: 'Form follows function – that has been misunderstood. Form and function should be one.', author: 'Frank Lloyd Wright', role: 'Architect', category: 'design' },
  { text: 'If you want to make something great, you need to start with what the user sees and feels.', author: 'Jony Ive', role: 'Chief Design Officer, Apple', category: 'design' },
  { text: 'The present is theirs; the future, for which I really worked, is mine.', author: 'Nikola Tesla', role: 'Inventor & Engineer', category: 'invention' },
  { text: 'Design can be art. Design can be aesthetics. Design is so simple, that’s why it is so complicated.', author: 'Paul Rand', role: 'Graphic Designer', category: 'design' },
  { text: 'Typography is the craft of endowing human language with a durable visual form.', author: 'Robert Bringhurst', role: 'Typographer', category: 'design' },
  { text: 'The best way to predict the future is to invent it.', author: 'Alan Kay', role: 'Computer Scientist', category: 'engineering' },
  { text: 'Make it work, make it right, make it fast.', author: 'Kent Beck', role: 'Software Engineer', category: 'engineering' },
  { text: 'First, solve the problem. Then, write the code.', author: 'John Johnson', role: 'Programmer', category: 'engineering' },
  { text: 'The only way to do great work is to love what you do.', author: 'Steve Jobs', role: 'Co-founder, Apple', category: 'invention' },
  { text: 'I have not failed. I\'ve just found 10,000 ways that won\'t work.', author: 'Thomas Edison', role: 'Inventor', category: 'invention' },
  { text: 'We are what we repeatedly do. Excellence, then, is not an act, but a habit.', author: 'Aristotle', role: 'Philosopher', category: 'invention' },
  { text: 'Design is a plan for arranging elements in such a way as best to accomplish a particular purpose.', author: 'Charles Eames', role: 'Designer', category: 'design' },
  { text: 'Everything is designed. Few things are designed well.', author: 'Brian Reed', role: 'Designer', category: 'design' },
  { text: 'The goal of design is to raise the expectation of what design can be.', author: 'Paula Scher', role: 'Graphic Designer', category: 'design' },
  { text: 'Innovation distinguishes between a leader and a follower.', author: 'Steve Jobs', role: 'Co-founder, Apple', category: 'invention' },
  { text: 'The engineer has been, and is, a maker of history.', author: 'James Kip Finch', role: 'Engineer', category: 'engineering' },
  { text: 'Technology is nothing. What\'s important is that you have a faith in people.', author: 'Steve Jobs', role: 'Co-founder, Apple', category: 'engineering' },
  { text: 'Less but better.', author: 'Dieter Rams', role: 'Industrial Designer', category: 'design' },
  { text: 'Design is intelligence made visible.', author: 'Alina Wheeler', role: 'Design Author', category: 'design' },
  { text: 'The best designs are invisible.', author: 'Jared Spool', role: 'UX Researcher', category: 'design' },
  { text: 'Any sufficiently advanced technology is indistinguishable from magic.', author: 'Arthur C. Clarke', role: 'Science Writer', category: 'invention' },
  { text: 'The future belongs to those who believe in the beauty of their dreams.', author: 'Eleanor Roosevelt', role: 'First Lady & Activist', category: 'invention' },
  { text: 'It is not the strongest of the species that survive, but the most adaptable.', author: 'Charles Darwin', role: 'Naturalist', category: 'engineering' },
  { text: 'We need to make the best use of what we have.', author: 'Buckminster Fuller', role: 'Inventor & Architect', category: 'invention' },
  { text: 'Design is not for philosophy. It\'s for life.', author: 'Issey Miyake', role: 'Fashion Designer', category: 'design' },
  { text: 'The only limit to our realization of tomorrow is our doubts of today.', author: 'Franklin D. Roosevelt', role: 'U.S. President', category: 'invention' },
];

export default function QuotesWidget() {
  const [index, setIndex] = useState(0);
  const [category, setCategory] = useState<Category>('all');
  const [direction, setDirection] = useState<'in' | 'out'>('in');

  const filtered = category === 'all'
    ? QUOTES
    : QUOTES.filter((q) => q.category === category);
  const quote = filtered[index % Math.max(1, filtered.length)];
  const total = filtered.length;

  const goNext = useCallback(() => {
    setDirection('out');
    setTimeout(() => {
      setIndex((i) => (i + 1) % total);
      setDirection('in');
    }, 150);
  }, [total]);

  const goPrev = useCallback(() => {
    setDirection('out');
    setTimeout(() => {
      setIndex((i) => (total + i - 1) % total);
      setDirection('in');
    }, 150);
  }, [total]);

  const shuffle = useCallback(() => {
    setDirection('out');
    setTimeout(() => {
      setIndex(Math.floor(Math.random() * total));
      setDirection('in');
    }, 150);
  }, [total]);

  const setCat = useCallback((c: Category) => {
    setCategory(c);
    setIndex(0);
  }, []);

  return (
    <div className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-sm p-6 md:p-8 max-w-lg mx-auto">
      <h3 className="text-lg font-bold text-stone-900 dark:text-white mb-4 text-center">Inspiration</h3>

      {/* Category filter */}
      <div className="flex p-1.5 bg-stone-100 dark:bg-stone-800 rounded-xl mb-6">
        {(['all', 'design', 'engineering', 'invention'] as const).map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => setCat(c)}
            className={`flex-1 py-2 text-xs font-bold rounded-lg capitalize transition-all active:scale-[0.98] ${
              category === c
                ? 'bg-white dark:bg-stone-700 text-stone-900 dark:text-white shadow-sm'
                : 'text-stone-500 dark:text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 active:bg-stone-200 dark:active:bg-stone-600'
            }`}
          >
            {c === 'all' ? 'All' : c}
          </button>
        ))}
      </div>

      {/* Quote with fade */}
      <div
        className={`relative transition-opacity duration-150 ${direction === 'in' ? 'opacity-100' : 'opacity-0'}`}
        key={index}
      >
        <span className="absolute -top-2 -left-1 text-6xl font-serif text-stone-200 dark:text-stone-700 select-none" aria-hidden>"</span>
        <blockquote className="text-lg md:text-xl text-stone-700 dark:text-stone-200 leading-relaxed pl-6 pr-2 py-2 min-h-[4rem]">
          {quote?.text}
        </blockquote>
        <p className="text-sm font-bold text-[var(--accent,#3b82f6)] mt-4 pl-6">
          — {quote?.author}
        </p>
        <p className="text-xs text-stone-500 dark:text-stone-400 pl-6 mt-0.5">
          {quote?.role}
        </p>
      </div>

      <div className="flex items-center justify-between gap-4 mt-8">
        <button
          type="button"
          onClick={goPrev}
          aria-label="Previous quote"
          className="p-2.5 rounded-xl bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-200 hover:bg-stone-200 dark:hover:bg-stone-700 active:scale-[0.98] active:bg-stone-300 dark:active:bg-stone-600 transition-all"
        >
          <ChevronLeft size={20} strokeWidth={2.5} />
        </button>
        <button
          type="button"
          onClick={shuffle}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-stone-700 dark:bg-stone-200 text-white dark:text-stone-900 rounded-xl text-sm font-bold hover:bg-stone-900 dark:hover:bg-white active:scale-[0.98] active:opacity-90 transition-all"
        >
          <Shuffle size={18} strokeWidth={2.5} />
          Shuffle
        </button>
        <button
          type="button"
          onClick={goNext}
          aria-label="Next quote"
          className="p-2.5 rounded-xl bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-200 hover:bg-stone-200 dark:hover:bg-stone-700 active:scale-[0.98] active:bg-stone-300 dark:active:bg-stone-600 transition-all"
        >
          <ChevronRight size={20} strokeWidth={2.5} />
        </button>
      </div>
      <p className="text-center text-xs text-stone-400 dark:text-stone-500 mt-3">
        {((index % total) + 1)} / {total}
      </p>
    </div>
  );
}
