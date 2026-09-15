import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Compass, Play, Pause, X } from 'lucide-react';
import { createSkyIslands, SKY_ISLANDS } from './skyIslandsScene';

interface SkyIslandsWidgetProps {
  onClose: () => void;
}

type Sky = ReturnType<typeof createSkyIslands>;

// Full-screen overlay for the airship flight. The world, the flight model and the
// discovery state live in skyIslandsScene.js; this shell owns the HUD: title and
// key legend, compass, counter, throttle lever, buttons, island card, radar, and
// the close control.
export default function SkyIslandsWidget({ onClose }: SkyIslandsWidgetProps) {
  const stageRef = useRef<HTMLDivElement>(null);
  const compassRef = useRef<HTMLCanvasElement>(null);
  const radarRef = useRef<HTMLCanvasElement>(null);
  const leverTrackRef = useRef<HTMLDivElement>(null);
  const skyRef = useRef<Sky | null>(null);
  const [island, setIsland] = useState({ index: 0, here: false, label: 'Ahead' });
  const [found, setFound] = useState(0);
  const [toast, setToast] = useState<{ big: string; small: string } | null>(null);
  const [plus, setPlus] = useState(false);
  const [lever, setLever] = useState(0.3);
  const [tour, setTour] = useState(false);
  const [intro, setIntro] = useState(true);
  const leverDrag = useRef<number | null>(null);

  useEffect(() => {
    const stage = stageRef.current, compass = compassRef.current, radar = radarRef.current;
    if (!stage || !compass || !radar) return;
    let toastTimer = 0, plusTimer = 0;
    const sky = createSkyIslands(stage, {
      compass,
      radar,
      onIsland: (index: number, here: boolean, label: string) => setIsland({ index, here, label }),
      onFound: (i: number, count: number) => {
        const d = SKY_ISLANDS[i];
        setFound(count);
        setToast({ big: d.company, small: (d.summit ? 'Summit reached · ' : 'Island found · ') + d.year });
        setPlus(true);
        window.clearTimeout(toastTimer); toastTimer = window.setTimeout(() => setToast(null), 2400);
        window.clearTimeout(plusTimer); plusTimer = window.setTimeout(() => setPlus(false), 1600);
      },
      onLever: setLever,
      onTour: setTour,
      onTouched: () => setIntro(false),
    });
    skyRef.current = sky;
    stage.focus({ preventScroll: true });
    return () => { window.clearTimeout(toastTimer); window.clearTimeout(plusTimer); sky.dispose(); skyRef.current = null; };
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') { e.preventDefault(); onClose(); } };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  // The lever: drag anywhere on it; the value is read from the track height.
  const leverFromY = useCallback((y: number) => {
    const r = leverTrackRef.current?.getBoundingClientRect();
    if (!r) return 0;
    return Math.min(1, Math.max(0, 1 - (y - r.top) / r.height));
  }, []);
  const onLeverDown = (e: React.PointerEvent<HTMLDivElement>) => { e.preventDefault(); e.currentTarget.setPointerCapture(e.pointerId); leverDrag.current = e.pointerId; skyRef.current?.setLever(leverFromY(e.clientY)); };
  const onLeverMove = (e: React.PointerEvent<HTMLDivElement>) => { if (leverDrag.current !== e.pointerId) return; skyRef.current?.setLever(leverFromY(e.clientY)); };
  const onLeverUp = (e: React.PointerEvent<HTMLDivElement>) => { if (leverDrag.current === e.pointerId) leverDrag.current = null; };
  const onLeverKey = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'ArrowUp') { e.preventDefault(); skyRef.current?.setLever(lever + 0.1); }
    if (e.key === 'ArrowDown') { e.preventDefault(); skyRef.current?.setLever(lever - 0.1); }
  };

  const d = SKY_ISLANDS[island.index];
  const pct = `${(lever * 100).toFixed(1)}%`;

  return (
    <div className="sky-islands" role="dialog" aria-modal="true" aria-label="Ed's Sky Islands">
      <div
        ref={stageRef}
        className="si-stage"
        tabIndex={0}
        role="application"
        aria-label="Ed's career as floating islands in a sea of clouds. Drag to steer, push the throttle lever up to fly, press N to head for the next island. Press Escape to close."
      />
      <div className="si-vignette" aria-hidden="true" />

      <div className="si-top">
        <div className="si-brand">
          <div className="si-title">Ed's Sky Islands<i>✦</i></div>
          <div className="si-sub">The floating career</div>
          <div className="si-keys"><span><kbd>drag</kbd> steer</span><span><kbd>W</kbd><kbd>S</kbd> throttle</span><span><kbd>shift</kbd> boost</span><span><kbd>Q</kbd><kbd>E</kbd> altitude</span><span><kbd>N</kbd> next island</span><span><kbd>space</kbd> tour</span></div>
        </div>
        <div className="si-compass" aria-hidden="true"><canvas ref={compassRef} width={440} height={72} /></div>
        <div className="si-topright">
          <div className="si-score">
            <div className="si-score-text">
              <div className="si-n">{found}<span> / {SKY_ISLANDS.length}</span></div>
              <div className="si-l">Islands found</div>
              <div className={`si-plus${plus ? ' show' : ''}`}>+1 island</div>
            </div>
            <div className="si-coin" />
          </div>
          <button type="button" className="si-close" aria-label="Close" onClick={onClose}><X size={18} strokeWidth={2} /></button>
        </div>
      </div>

      <div className={`si-toast${toast ? ' show' : ''}`} aria-live="polite">
        <div className="si-toast-big">{toast?.big}</div>
        <div className="si-toast-small">{toast?.small}</div>
      </div>
      <div className={`si-intro${intro ? '' : ' hide'}`} aria-hidden={!intro}>Swipe to steer · push the lever up for speed · N heads for the next island</div>

      <div className="si-bottom">
        <div
          className="si-lever"
          data-si-lever="true"
          role="slider"
          aria-label="Throttle"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(lever * 100)}
          tabIndex={0}
          onPointerDown={onLeverDown}
          onPointerMove={onLeverMove}
          onPointerUp={onLeverUp}
          onPointerCancel={onLeverUp}
          onKeyDown={onLeverKey}
        >
          <div className="si-lever-track" ref={leverTrackRef}>
            <div className="si-lever-fill" style={{ height: pct }} />
            <div className="si-lever-knob" style={{ bottom: pct }} />
          </div>
          <div className="si-lever-lbl">Throttle</div>
        </div>

        <div className="si-centre">
          <div className="si-group" role="group" aria-label="Flight">
            <button type="button" className="si-btn" aria-label="Head for the next island" onClick={() => skyRef.current?.headForNext()}><Compass size={16} strokeWidth={2.2} /><span>Next island</span></button>
            <button type="button" className="si-btn" aria-pressed={tour} aria-label="Auto tour" onClick={() => skyRef.current?.toggleTour()}>
              {tour ? <Pause size={16} strokeWidth={2.2} /> : <Play size={16} strokeWidth={2.2} />}
              <span>{tour ? 'Touring' : 'Tour'}</span>
            </button>
          </div>
          <div className={`si-card${island.here ? '' : ' far'}${d.summit ? ' summit' : ''}`}>
            <div className="si-eyebrow"><i /><span>{island.label}</span></div>
            <div>
              <div className="si-role">{d.role}</div>
              <div className="si-company">{d.company}</div>
            </div>
            <div className="si-period">{d.period}</div>
          </div>
        </div>

        <div className="si-radar" aria-hidden="true"><canvas ref={radarRef} width={224} height={224} /></div>
      </div>
    </div>
  );
}
