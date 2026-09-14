import React, { useEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, Play, Pause, Plus, Minus, Sun, Moon, X } from 'lucide-react';
import { createTinyPlanet, STOPS } from './tinyPlanetScene';

interface TinyPlanetWidgetProps {
  /** The site's current dark-mode setting; the planet opens on the matching time of day. */
  darkMode?: boolean;
  onClose: () => void;
}

type Planet = ReturnType<typeof createTinyPlanet>;

// Full-screen overlay for the career planet. The canvas and all of the motion
// live in tinyPlanetScene.js; this shell owns the HUD (stop card, tour and zoom
// controls, day/night, close) and tears the scene down when it unmounts.
export default function TinyPlanetWidget({ darkMode = false, onClose }: TinyPlanetWidgetProps) {
  const stageRef = useRef<HTMLDivElement>(null);
  const planetRef = useRef<Planet | null>(null);
  const [night, setNight] = useState(darkMode);
  const [auto, setAuto] = useState(false);
  const [active, setActive] = useState(STOPS.length - 1);
  const [shown, setShown] = useState(STOPS.length - 1);
  const [fading, setFading] = useState(false);

  // The planet follows the site's theme, but the sun/moon button can override it
  // for this visit without flipping the whole site.
  useEffect(() => { setNight(darkMode); }, [darkMode]);
  useEffect(() => { planetRef.current?.setNight(night); }, [night]);

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;
    const planet = createTinyPlanet(stage, { night, onStop: setActive, onAuto: setAuto });
    planetRef.current = planet;
    stage.focus({ preventScroll: true });
    return () => { planet.dispose(); planetRef.current = null; };
    // The scene is built once per open; night is synced through its own effect above.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') { e.preventDefault(); onClose(); } };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  // The stop card crossfades: fade the old text out, swap, fade back in.
  useEffect(() => {
    if (active === shown) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) { setShown(active); return; }
    setFading(true);
    const t = window.setTimeout(() => { setShown(active); setFading(false); }, 180);
    return () => window.clearTimeout(t);
  }, [active, shown]);

  const stop = STOPS[shown];

  return (
    <div className={`tiny-planet${night ? ' night' : ''}`} role="dialog" aria-modal="true" aria-label="Ed's Tiny Planet">
      <div
        ref={stageRef}
        className="tp-stage"
        tabIndex={0}
        role="application"
        aria-label="Ed's career on a tiny planet. Drag in any direction to roll the world, or use the left and right arrow keys to step through roles in order. Press Escape to close."
      />

      <div className="tp-top">
        <div className="tp-title">Ed's Tiny Planet</div>
        <div className="tp-group">
          <button type="button" className="tp-btn tp-theme" aria-pressed={night} aria-label={night ? 'Switch to day' : 'Switch to night'} onClick={() => setNight((n) => !n)}>
            {night ? <Moon size={16} strokeWidth={2.2} /> : <Sun size={16} strokeWidth={2.2} />}
          </button>
          <button type="button" className="tp-btn" aria-label="Close" onClick={onClose}>
            <X size={18} strokeWidth={2.2} />
          </button>
        </div>
      </div>

      <div className="tp-hud">
        <div className="tp-dots" aria-hidden="true">
          {STOPS.map((s, i) => <i key={s.company} className={i === shown ? 'on' : undefined} />)}
        </div>
        <div className="tp-controls">
          <div className="tp-group" role="group" aria-label="Step through the timeline">
            <button type="button" className="tp-btn" aria-label="Previous stop" onClick={() => planetRef.current?.step(-1)}><ChevronLeft size={16} strokeWidth={2.2} /></button>
            <button type="button" className="tp-btn tp-auto" aria-pressed={auto} aria-label="Auto tour" onClick={() => planetRef.current?.toggleAuto()}>
              {auto ? <Pause size={16} strokeWidth={2.2} /> : <Play size={16} strokeWidth={2.2} />}
              <span>{auto ? 'Touring' : 'Auto'}</span>
            </button>
            <button type="button" className="tp-btn" aria-label="Next stop" onClick={() => planetRef.current?.step(1)}><ChevronRight size={16} strokeWidth={2.2} /></button>
          </div>
          <div className="tp-group" role="group" aria-label="Zoom">
            <button type="button" className="tp-btn" aria-label="Zoom out" onClick={() => planetRef.current?.zoomOut()}><Minus size={16} strokeWidth={2.2} /></button>
            <button type="button" className="tp-btn" aria-label="Zoom in" onClick={() => planetRef.current?.zoomIn()}><Plus size={16} strokeWidth={2.2} /></button>
          </div>
        </div>
        <div className="tp-card" aria-live="polite">
          <div className="tp-eyebrow"><i /><span>You are here</span></div>
          <div className={`tp-swap${fading ? ' out' : ''}`}>
            <div className="tp-role">{stop.role}</div>
            <div className="tp-company">{stop.company}</div>
          </div>
          <div className={`tp-period tp-swap${fading ? ' out' : ''}`}>{stop.period}</div>
          <div className="tp-hint"><span>Drag to roll · pinch or scroll to zoom · ← →</span><span>{stop.year}</span></div>
        </div>
      </div>
    </div>
  );
}
