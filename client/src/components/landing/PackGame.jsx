import { useEffect, useRef, useState } from 'react';
import { Play, RotateCcw, Star, Timer, Trophy } from 'lucide-react';
import confetti from './confetti';

// "Pack the bag": catch what the trip needs, dodge what it doesn't. 30 seconds a round.
const TRIPS = [
  {
    name: 'Goa',
    temp: 31,
    good: ['Swimsuit', 'SPF 50', 'Flip flops', 'Sunglasses', 'Linen shirt', 'Shorts', 'Umbrella', 'Charger'],
    bad: ['Heavy coat', 'Snow boots', 'Thermals', 'Wool scarf', 'Ski goggles'],
    roasts: {
      'Heavy coat': 'A heavy coat. To Goa. Bold.',
      'Snow boots': 'Snow boots on a beach? Brave.',
      Thermals: "It's 31°. Put the thermals down.",
      'Wool scarf': 'A wool scarf in 31° heat?',
      'Ski goggles': 'There is no skiing in Goa.',
    },
  },
  {
    name: 'Manali',
    temp: 4,
    good: ['Heavy coat', 'Thermals', 'Wool socks', 'Gloves', 'Beanie', 'Lip balm', 'Hiking boots', 'Charger'],
    bad: ['Swimsuit', 'Flip flops', 'Beach towel', 'Linen shirt', 'Tank top'],
    roasts: {
      Swimsuit: 'A swimsuit for 4°? Ambitious.',
      'Flip flops': 'Flip flops in the snow. No.',
      'Beach towel': "There's no beach in Manali.",
      'Linen shirt': "Linen won't help at 4°.",
      'Tank top': "Tank top? You'll freeze.",
    },
  },
  {
    name: 'London',
    temp: 11,
    good: ['Rain jacket', 'Umbrella', 'Jeans', 'Sweater', 'Boots', 'Adapter', 'Charger', 'Oyster card'],
    bad: ['Swimsuit', 'Snow boots', 'Flip flops', 'Beach towel', 'Ski goggles'],
    roasts: {
      Swimsuit: "It's London. It's raining.",
      'Snow boots': 'Overkill for drizzle.',
      'Flip flops': 'Wet socks waiting to happen.',
      'Beach towel': "London doesn't do beaches.",
      'Ski goggles': 'No slopes on the Tube.',
    },
  },
];
const ROUND = 30;
const FILL = { good: '#E7F2C4', bad: '#FADACB', passport: '#FBE6B5' };

const readBest = () => {
  try {
    return Number(localStorage.getItem('bagsy-best') || 0);
  } catch {
    return 0;
  }
};

export default function PackGame({ onSignup }) {
  const canvasRef = useRef(null);
  const game = useRef(null); // everything the loop changes 60 times a second lives here, not in state
  const [screen, setScreen] = useState('start'); // 'start' | 'playing' | 'paused' | 'end'
  const [trip, setTrip] = useState(TRIPS[0]);
  const [hud, setHud] = useState({ time: ROUND, score: 0 });
  const [best, setBest] = useState(readBest);
  const [result, setResult] = useState(null);
  const [toast, setToast] = useState('');

  // Drawing helpers
  const draw = () => {
    const canvas = canvasRef.current;
    const g = game.current;
    if (!canvas || !g) return;
    const ctx = canvas.getContext('2d');
    const { w, h } = g;
    ctx.clearRect(0, 0, w, h);
    ctx.strokeStyle = 'rgba(20,16,11,.08)';
    ctx.lineWidth = 1;
    for (let x = 30; x < w; x += 40) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, h);
      ctx.stroke();
    }
    const round = (x, y, rw, rh, r) => {
      ctx.beginPath();
      ctx.moveTo(x + r, y);
      ctx.arcTo(x + rw, y, x + rw, y + rh, r);
      ctx.arcTo(x + rw, y + rh, x, y + rh, r);
      ctx.arcTo(x, y + rh, x, y, r);
      ctx.arcTo(x, y, x + rw, y, r);
      ctx.closePath();
    };
    g.items.forEach((it) => {
      ctx.font = '800 15px Archivo, "Arial Black", sans-serif';
      const pw = ctx.measureText(it.label).width + 30;
      ctx.fillStyle = '#14100B';
      round(it.x - pw / 2 + 3, it.y - 14, pw, 34, 17);
      ctx.fill();
      ctx.fillStyle = FILL[it.kind];
      round(it.x - pw / 2, it.y - 17, pw, 34, 17);
      ctx.fill();
      ctx.lineWidth = 1.5;
      ctx.strokeStyle = '#14100B';
      ctx.stroke();
      ctx.fillStyle = '#14100B';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(it.label, it.x, it.y + 1);
    });
    // the suitcase
    const y = h - 70;
    const bw = 120;
    const bh = 58;
    ctx.save();
    ctx.translate(g.bagX + (g.shake ? (Math.random() - 0.5) * 10 : 0), 0);
    ctx.lineWidth = 2;
    ctx.strokeStyle = '#14100B';
    ctx.beginPath();
    ctx.moveTo(-22, y);
    ctx.lineTo(-22, y - 16);
    ctx.lineTo(22, y - 16);
    ctx.lineTo(22, y);
    ctx.stroke();
    ctx.fillStyle = '#14100B';
    round(-bw / 2 + 4, y + 4, bw, bh, 12);
    ctx.fill();
    ctx.fillStyle = '#E5532D';
    round(-bw / 2, y, bw, bh, 12);
    ctx.fill();
    ctx.stroke();
    ctx.strokeStyle = 'rgba(255,252,247,.7)';
    [-30, 30].forEach((sx) => {
      ctx.beginPath();
      ctx.moveTo(sx, y + 8);
      ctx.lineTo(sx, y + bh - 8);
      ctx.stroke();
    });
    ctx.restore();
  };

  // Size the canvas to its box (sharp on retina screens)
  useEffect(() => {
    game.current = { w: 0, h: 0, items: [], bagX: 0, targetX: 0, running: false, score: 0, time: ROUND, spawnIn: 0, shake: 0, forgot: [], last: 0, trip: TRIPS[0] };
    const size = () => {
      const canvas = canvasRef.current;
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      const g = game.current;
      g.w = canvas.clientWidth;
      g.h = canvas.clientHeight;
      canvas.width = g.w * dpr;
      canvas.height = g.h * dpr;
      canvas.getContext('2d').setTransform(dpr, 0, 0, dpr, 0, 0);
      if (!g.running) g.bagX = g.targetX = g.w / 2;
      draw();
    };
    size();
    window.addEventListener('resize', size);
    // Pause if the tab is hidden, so the clock doesn't run out in the background
    const onHide = () => {
      if (document.hidden && game.current.running) {
        game.current.running = false;
        setScreen('paused');
      }
    };
    document.addEventListener('visibilitychange', onHide);
    const onKey = (e) => {
      const g = game.current;
      if (!g.running) return;
      if (e.key === 'ArrowLeft') g.targetX = Math.max(64, g.targetX - 60);
      else if (e.key === 'ArrowRight') g.targetX = Math.min(g.w - 64, g.targetX + 60);
      else return;
      e.preventDefault();
    };
    window.addEventListener('keydown', onKey);
    return () => {
      game.current.running = false;
      window.removeEventListener('resize', size);
      document.removeEventListener('visibilitychange', onHide);
      window.removeEventListener('keydown', onKey);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const toastTimer = useRef(null);
  const say = (text) => {
    setToast(text);
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(''), 1300);
  };

  const finish = () => {
    const g = game.current;
    g.running = false;
    const score = g.score;
    if (score > readBest()) {
      try {
        localStorage.setItem('bagsy-best', String(score));
      } catch {
        /* private mode: just don't save */
      }
    }
    setBest(Math.max(score, readBest()));
    const missed = [...new Set(g.forgot)].slice(0, 3);
    const verdict =
      score >= 22 ? 'Packing legend. Your crew wants you as trip admin.' : score >= 12 ? 'Solid. You only forgot a few things.' : 'Rough trip. This is exactly why Bagsy exists.';
    setResult({ score, verdict, missed });
    setScreen('end');
    if (score >= 22) confetti();
  };

  const loop = (t) => {
    const g = game.current;
    if (!g.running) return;
    const dt = Math.min(0.05, (t - g.last) / 1000 || 0);
    g.last = t;
    g.time = Math.max(0, g.time - dt);
    g.spawnIn -= dt;
    if (g.spawnIn <= 0) {
      const r = Math.random();
      const kind = r < 0.1 ? 'passport' : r < 0.64 ? 'good' : 'bad';
      const pool = kind === 'good' ? g.trip.good : g.trip.bad;
      const label = kind === 'passport' ? 'Passport' : pool[Math.floor(Math.random() * pool.length)];
      g.items.push({ label, kind, x: 70 + Math.random() * (g.w - 140), y: -20, v: 120 + Math.random() * 60 + (ROUND - g.time) * 6 });
      g.spawnIn = Math.max(0.38, 0.85 - (ROUND - g.time) * 0.015);
    }
    g.bagX += (g.targetX - g.bagX) * Math.min(1, dt * 14);
    if (g.shake) g.shake = Math.max(0, g.shake - dt);
    const bagTop = g.h - 74;
    g.items = g.items.filter((it) => {
      it.y += it.v * dt;
      if (it.y > bagTop - 10 && it.y < bagTop + 30 && Math.abs(it.x - g.bagX) < 76) {
        if (it.kind === 'bad') {
          g.score = Math.max(0, g.score - 1);
          g.shake = 0.3;
          say(g.trip.roasts[it.label]);
        } else g.score += it.kind === 'passport' ? 2 : 1;
        return false;
      }
      if (it.y > g.h + 20) {
        if (it.kind === 'passport') {
          g.score = Math.max(0, g.score - 2);
          say('You dropped your passport!');
          g.forgot.push('Passport');
        } else if (it.kind === 'good') g.forgot.push(it.label);
        return false;
      }
      return true;
    });
    setHud({ time: Math.ceil(g.time), score: g.score });
    draw();
    if (g.time <= 0) finish();
    else requestAnimationFrame(loop);
  };

  const start = () => {
    const next = TRIPS[Math.floor(Math.random() * TRIPS.length)];
    setTrip(next);
    Object.assign(game.current, { trip: next, items: [], score: 0, time: ROUND, spawnIn: 0, forgot: [], running: true, last: performance.now() });
    game.current.bagX = game.current.targetX = game.current.w / 2;
    setHud({ time: ROUND, score: 0 });
    setScreen('playing');
    requestAnimationFrame(loop);
  };
  const resume = () => {
    Object.assign(game.current, { running: true, last: performance.now() });
    setScreen('playing');
    requestAnimationFrame(loop);
  };

  const aim = (e) => {
    const g = game.current;
    const r = canvasRef.current.getBoundingClientRect();
    g.targetX = Math.max(64, Math.min(g.w - 64, e.clientX - r.left));
  };

  const Pill = ({ icon: Icon, children }) => (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-ink bg-paper px-3.5 py-1.5 tabular-nums">
      <Icon size={15} aria-hidden="true" />
      {children}
    </span>
  );

  return (
    <div className="relative overflow-hidden rounded-[22px] border border-ink bg-sky shadow-pop">
      <div className="flex h-[67px] flex-wrap items-center justify-between gap-2 border-b border-ink bg-card px-5 font-extrabold">
        <span>
          Packing for: {trip.name}, {trip.temp}°
        </span>
        <span className="flex flex-wrap gap-2">
          <Pill icon={Timer}>{hud.time}s</Pill>
          <Pill icon={Star}>{hud.score}</Pill>
          <Pill icon={Trophy}>Best {best}</Pill>
        </span>
      </div>
      <canvas
        ref={canvasRef}
        onPointerMove={aim}
        onPointerDown={aim}
        className="block h-[440px] w-full cursor-none touch-none"
        role="img"
        aria-label="Pack the bag game"
      />
      <div
        className={`pointer-events-none absolute left-1/2 top-[80px] max-w-[92%] -translate-x-1/2 truncate rounded-full bg-ink px-4 py-2 text-sm font-extrabold text-card transition-opacity ${toast ? 'opacity-100' : 'opacity-0'}`}
        aria-live="polite"
      >
        {toast}
      </div>

      {screen !== 'playing' && (
        <div className="absolute inset-x-0 bottom-0 top-[67px] flex flex-col items-center justify-center gap-3.5 bg-sky/95 p-5 text-center">
          {screen === 'end' && result ? (
            <>
              <p className="eyebrow !text-ink">
                {trip.name}, {trip.temp}°
              </p>
              <h3 className="lp-display text-[clamp(34px,5vw,56px)]">
                {result.score} point{result.score === 1 ? '' : 's'}
              </h3>
              <p className="max-w-[30em] text-muted">
                {result.verdict}
                {result.missed.length > 0 && ` You left behind: ${result.missed.join(', ')}.`}
              </p>
              <div className="flex flex-wrap justify-center gap-3">
                <button type="button" onClick={start} className="btn inline-flex items-center gap-2 rounded-full border border-ink bg-card px-6 py-3 font-extrabold shadow-pop hover:bg-sun">
                  Play again <RotateCcw size={17} aria-hidden="true" />
                </button>
                <button type="button" onClick={onSignup} className="btn inline-flex items-center gap-2 rounded-full border border-ink bg-tomato px-6 py-3 font-extrabold text-card shadow-pop hover:bg-ink">
                  Let Bagsy pack for you
                </button>
              </div>
            </>
          ) : (
            <>
              <p className="eyebrow !text-ink">Mini game</p>
              <h3 className="lp-display text-[clamp(34px,5vw,56px)]">Pack the bag</h3>
              <p className="max-w-[30em] text-muted">
                Catch things the trip needs. Skip the ones it doesn't. The passport is worth double, and dropping it costs you.
              </p>
              <div className="flex flex-wrap justify-center gap-2 text-[13px] font-extrabold">
                <span className="rounded-full border border-ink bg-lime px-3 py-1">+1 useful</span>
                <span className="rounded-full border border-ink bg-sun px-3 py-1">+2 passport</span>
                <span className="rounded-full border border-ink bg-peach px-3 py-1">−1 silly</span>
              </div>
              <button
                type="button"
                onClick={screen === 'paused' ? resume : start}
                className="btn inline-flex items-center gap-2 rounded-full border border-ink bg-tomato px-7 py-3.5 font-extrabold text-card shadow-pop hover:bg-ink"
              >
                {screen === 'paused' ? 'Resume packing' : 'Start packing'} <Play size={17} aria-hidden="true" />
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
