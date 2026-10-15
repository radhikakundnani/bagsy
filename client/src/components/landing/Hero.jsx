import { useEffect, useRef } from 'react';
import { ArrowRight, BookOpen, Cable, CloudRain, Hand, Shirt, Sun } from 'lucide-react';

// Stickers you can drag around the hero. x/y are where they start, as a share of the hero's size.
const STICKERS = [
  { text: 'SPF 50', icon: Sun, bg: 'bg-sun', x: 0.55, y: 0.06, r: -8 },
  { text: 'passport', icon: BookOpen, bg: 'bg-lime', x: 0.8, y: 0.88, r: 6 },
  { text: 'type c cable', icon: Cable, bg: 'bg-sky', x: 0.64, y: 0.72, r: -5 },
  { text: 'kurta', icon: Shirt, bg: 'bg-lilac', x: 0.86, y: 0.58, r: 10 },
  { text: 'rain jacket', icon: CloudRain, bg: 'bg-peach', x: 0.44, y: 0.94, r: 4 },
];

function Sticker({ sticker, heroRef }) {
  const ref = useRef(null);
  const drag = useRef(null);
  const Icon = sticker.icon;

  // Place it once the hero has a size, and again if the window changes
  useEffect(() => {
    const place = () => {
      const hero = heroRef.current;
      const el = ref.current;
      if (!hero || !el || el.dataset.moved) return;
      el.style.left = `${Math.min(hero.clientWidth - el.offsetWidth - 4, sticker.x * hero.clientWidth)}px`;
      el.style.top = `${Math.min(hero.clientHeight - el.offsetHeight - 4, sticker.y * hero.clientHeight)}px`;
    };
    place();
    window.addEventListener('resize', place);
    document.fonts?.ready.then(place);
    return () => window.removeEventListener('resize', place);
  }, [heroRef, sticker]);

  const onDown = (e) => {
    const el = ref.current;
    el.setPointerCapture(e.pointerId);
    drag.current = { x: e.clientX - el.offsetLeft, y: e.clientY - el.offsetTop };
    el.classList.add('dragging');
    el.dataset.moved = '1';
  };
  const onMove = (e) => {
    if (!drag.current) return;
    const el = ref.current;
    const hero = heroRef.current.getBoundingClientRect();
    el.style.left = `${Math.max(0, Math.min(hero.width - el.offsetWidth, e.clientX - drag.current.x))}px`;
    el.style.top = `${Math.max(0, Math.min(hero.height - el.offsetHeight, e.clientY - drag.current.y))}px`;
  };
  const onUp = () => {
    drag.current = null;
    ref.current.classList.remove('dragging');
    ref.current.style.transform = `rotate(${Math.round(Math.random() * 20 - 10)}deg)`;
  };

  return (
    <div
      ref={ref}
      aria-hidden="true"
      onPointerDown={onDown}
      onPointerMove={onMove}
      onPointerUp={onUp}
      onPointerCancel={onUp}
      className={`lp-sticker flex items-center gap-1.5 rounded-full border border-ink px-4 py-2 text-[15px] font-extrabold shadow-pop ${sticker.bg}`}
      style={{ transform: `rotate(${sticker.r}deg)` }}
    >
      <Icon size={17} strokeWidth={1.75} />
      {sticker.text}
    </div>
  );
}

export default function Hero({ onStart }) {
  const heroRef = useRef(null);
  const stageRef = useRef(null);
  const tagRef = useRef(null);

  // The big tag leans towards the cursor
  const onPointerMove = (e) => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const r = stageRef.current.getBoundingClientRect();
    const dx = (e.clientX - (r.left + r.width / 2)) / r.width;
    const dy = (e.clientY - (r.top + r.height / 2)) / r.height;
    tagRef.current.style.transform = `rotate(${-14 + dx * 22}deg) translateY(${dy * 10}px)`;
  };
  const onPointerLeave = () => {
    tagRef.current.style.transform = 'rotate(-14deg)';
  };

  return (
    <header ref={heroRef} onPointerMove={onPointerMove} onPointerLeave={onPointerLeave} className="relative pb-16 pt-2 md:min-h-[600px]">
      <div className="grid items-center gap-8 md:grid-cols-[1.25fr_0.75fr]">
        <div>
          <p className="eyebrow !text-ink">The trip planner for people who overpack</p>
          <h1 className="lp-display mt-4 text-[clamp(52px,9vw,118px)]">
            <span className="lp-word bg-sun" style={{ transform: 'rotate(-2deg)' }}>
              Plan it,
            </span>{' '}
            <span className="lp-word bg-sky" style={{ transform: 'rotate(1.5deg)' }}>
              pack it,
            </span>
            <br />
            <span className="lp-word bg-lilac" style={{ transform: 'rotate(-1deg)' }}>
              post it.
            </span>{' '}
            <span className="font-accent relative inline-block text-[1.05em] text-tomato">
              Together.
              <svg className="absolute -bottom-[0.06em] left-0 h-[0.22em] w-full" viewBox="0 0 120 10" preserveAspectRatio="none" aria-hidden="true">
                <path d="M2 6 Q 12 1, 22 6 T 42 6 T 62 6 T 82 6 T 102 6 T 118 6" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
              </svg>
            </span>
          </h1>
          <p className="mt-7 max-w-[34em] text-lg leading-relaxed text-muted">
            Bagsy builds your packing list from the weather on your actual dates, plans the days with your crew, and keeps the reels you want to
            recreate in one place. You just tick things off.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <button type="button" onClick={onStart} className="btn inline-flex items-center gap-2 rounded-full border border-ink bg-tomato px-7 py-3.5 font-extrabold text-card shadow-pop hover:bg-ink">
              Make my packing list <ArrowRight size={18} aria-hidden="true" />
            </button>
            <a href="#play" className="btn inline-flex items-center gap-2 rounded-full border border-ink bg-card px-7 py-3.5 font-extrabold shadow-pop hover:bg-sun">
              Play the game
            </a>
          </div>
          <p className="mt-5 flex items-center gap-1.5 text-sm text-muted">
            <Hand size={16} aria-hidden="true" /> The stickers are draggable. Go on.
          </p>
        </div>

        <div ref={stageRef} className="relative flex h-[280px] items-center justify-center md:h-[420px]" aria-hidden="true">
          <div className="lp-burst absolute left-[4%] top-[4%] grid h-[110px] w-[110px] place-items-center text-center text-[12px] font-black leading-tight">
            <svg viewBox="0 0 120 120" className="absolute inset-0 h-full w-full">
              <polygon
                fill="#F2A818"
                stroke="#14100B"
                strokeWidth="2"
                points="60,2 70,22 92,10 90,34 116,36 100,54 118,72 94,76 100,100 76,92 66,116 54,94 34,112 32,88 8,88 22,68 2,52 26,44 18,20 42,26"
              />
            </svg>
            <span className="relative block">
              FREE
              <br />
              FOREVER
            </span>
          </div>
          <svg ref={tagRef} className="lp-tag w-[min(320px,75%)]" viewBox="0 0 40 40" style={{ transform: 'rotate(-14deg)' }}>
            <path d="M18 19 C 8 19, 3 10, 8 6 C 13 2, 19 8, 18 19" fill="none" stroke="#14100B" strokeWidth="1.4" strokeLinecap="round" />
            <path d="M13 13 L19 8 L36 8 L36 31 L19 31 L13 26 Z" fill="#E5532D" stroke="#14100B" strokeWidth="1.1" strokeLinejoin="round" />
            <circle cx="18" cy="19.5" r="2.2" fill="#FFFCF7" stroke="#14100B" strokeWidth="1" />
            <path d="M23.5 14 H33 M23.5 18 H33 M23.5 22 H30 M23.5 26 H31" stroke="#FFFCF7" strokeWidth="1.2" strokeLinecap="round" />
          </svg>
        </div>
      </div>

      {STICKERS.map((s) => (
        <Sticker key={s.text} sticker={s} heroRef={heroRef} />
      ))}
    </header>
  );
}
