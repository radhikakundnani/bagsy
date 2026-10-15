import { useMemo, useRef, useState } from 'react';
import {
  Building2,
  Check,
  CloudDrizzle,
  CloudSnow,
  CloudSunRain,
  Droplets,
  FileText,
  Heart,
  MapPin,
  Mountain,
  Package,
  Plug,
  Shirt,
  Snowflake,
  Umbrella,
} from 'lucide-react';
import confetti from './confetti';

// Sample trips for the demo. The real app uses live weather and the full rules engine.
const DESTS = {
  Goa: { temp: 31, icon: CloudSunRain, sky: 'Humid, afternoon showers', note: 'Forecast for 20–25 Oct', rain: true },
  Manali: { temp: 6, icon: Snowflake, sky: 'Cold nights, clear days', note: 'Typical for those dates' },
  London: { temp: 12, icon: CloudDrizzle, sky: 'Grey with drizzle', note: 'Typical for those dates', rain: true },
  Toronto: { temp: -2, icon: CloudSnow, sky: 'Snow likely', note: 'Typical for those dates' },
};
const VIBES = { Beach: Umbrella, Wedding: Heart, Trek: Mountain, 'City break': Building2 };
const BASE = {
  documents: ['Passport / ID', 'Bookings saved offline'],
  toiletries: ['Toothbrush', 'Deodorant'],
  electronics: ['Phone charger', 'Power bank'],
  clothing: ['Underwear ×5', 'Sleepwear'],
};
const byTemp = (t) =>
  t >= 25
    ? { clothing: ['Linen shirts', 'Shorts'], toiletries: ['Sunscreen SPF 50'] }
    : t >= 10
      ? { clothing: ['Light jacket', 'Jeans'] }
      : { clothing: ['Heavy coat', 'Thermals', 'Wool socks'], toiletries: ['Lip balm'] };
const BY_VIBE = {
  Beach: { clothing: ['Swimsuit', 'Flip flops'], misc: ['Beach towel'] },
  Wedding: { clothing: ['Outfit for each function', 'Heels'], misc: ['Gift envelope'] },
  Trek: { clothing: ['Hiking boots'], misc: ['Daypack', 'Trail snacks'] },
  'City break': { clothing: ['Walking shoes'], misc: ['Tote bag'] },
};
const CATS = {
  clothing: ['Clothing', Shirt, 'text-sun-deep'],
  toiletries: ['Toiletries', Droplets, 'text-lilac-deep'],
  electronics: ['Electronics', Plug, 'text-sky-deep'],
  documents: ['Documents', FileText, 'text-lime-deep'],
  misc: ['Everything else', Package, 'text-tomato'],
};

function buildList(dest, vibe) {
  const d = DESTS[dest];
  const list = {};
  [BASE, byTemp(d.temp), BY_VIBE[vibe], d.rain ? { misc: ['Compact umbrella'] } : {}].forEach((src) => {
    Object.entries(src).forEach(([cat, items]) => (list[cat] = [...(list[cat] || []), ...items]));
  });
  return list;
}

const Chip = ({ active, icon: Icon, children, ...props }) => (
  <button
    type="button"
    aria-pressed={active}
    className={`smooth inline-flex items-center gap-2 rounded-full border border-ink px-4 py-2 text-sm font-extrabold hover:-translate-y-0.5 ${active ? 'bg-ink text-card' : 'bg-card'}`}
    {...props}
  >
    <Icon size={16} aria-hidden="true" />
    {children}
  </button>
);

export default function PackDemo() {
  const [dest, setDest] = useState('Goa');
  const [vibe, setVibe] = useState('Beach');
  const [done, setDone] = useState(() => new Set());
  const stampRef = useRef(null);
  const celebrated = useRef(false);

  const list = useMemo(() => buildList(dest, vibe), [dest, vibe]);
  const all = Object.values(list).flat();
  const packed = all.filter((t) => done.has(t)).length;
  const complete = all.length > 0 && packed === all.length;
  const d = DESTS[dest];
  const WeatherIcon = d.icon;

  const choose = (setter) => (value) => {
    setter(value);
    setDone(new Set());
    celebrated.current = false;
  };

  const toggle = (item) => {
    const next = new Set(done);
    next.has(item) ? next.delete(item) : next.add(item);
    setDone(next);
    const nowComplete = all.every((t) => next.has(t));
    if (nowComplete && !celebrated.current) {
      celebrated.current = true;
      const r = stampRef.current?.getBoundingClientRect();
      setTimeout(() => confetti(r ? r.left + r.width / 2 : undefined, r ? r.top : undefined), 150);
    }
    if (!nowComplete) celebrated.current = false;
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
      <div className="flex flex-col gap-6 rounded-[22px] border border-ink bg-sun p-6 shadow-pop">
        <div>
          <h3 className="mb-3 text-sm font-black">Where to?</h3>
          <div className="flex flex-wrap gap-2">
            {Object.keys(DESTS).map((k) => (
              <Chip key={k} icon={MapPin} active={k === dest} onClick={() => choose(setDest)(k)}>
                {k}
              </Chip>
            ))}
          </div>
        </div>
        <div>
          <h3 className="mb-3 text-sm font-black">What's the vibe?</h3>
          <div className="flex flex-wrap gap-2">
            {Object.entries(VIBES).map(([k, Icon]) => (
              <Chip key={k} icon={Icon} active={k === vibe} onClick={() => choose(setVibe)(k)}>
                {k}
              </Chip>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-4 rounded-2xl border border-ink bg-card p-4">
          <span className="grid h-14 w-14 shrink-0 place-items-center rounded-full border border-ink bg-sky">
            <WeatherIcon size={24} aria-hidden="true" />
          </span>
          <div>
            <p className="lp-display text-5xl">{d.temp}°</p>
            <p className="mt-1 text-sm text-muted">
              {d.sky} · {d.note}
            </p>
          </div>
        </div>
      </div>

      <div className="relative min-h-[420px] overflow-hidden rounded-[22px] border border-ink bg-card p-6 shadow-pop">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h3 className="lp-display text-3xl">
            {dest}, {vibe.toLowerCase()}
          </h3>
          <b className="tabular-nums">
            {packed} of {all.length} packed
          </b>
        </div>
        <div className="my-4 h-3.5 overflow-hidden rounded-full border border-ink bg-paper">
          <div className={`h-full transition-[width] duration-500 ${complete ? 'bg-lime-deep' : 'bg-ink'}`} style={{ width: `${(packed / all.length) * 100}%` }} />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          {Object.keys(CATS)
            .filter((c) => list[c])
            .map((c) => {
              const [label, Icon, colour] = CATS[c];
              return (
                <div key={`${dest}-${vibe}-${c}`}>
                  <h4 className={`mb-1 flex items-center gap-1.5 text-[11px] font-black uppercase tracking-widest ${colour}`}>
                    <Icon size={14} aria-hidden="true" />
                    {label}
                  </h4>
                  {list[c].map((item, i) => {
                    const isDone = done.has(item);
                    return (
                      <button
                        key={item}
                        type="button"
                        role="checkbox"
                        aria-checked={isDone}
                        onClick={() => toggle(item)}
                        className="lp-item smooth flex w-full items-center gap-2.5 rounded-lg px-1 py-1.5 text-left font-semibold hover:bg-paper"
                        style={{ animationDelay: `${i * 50}ms` }}
                      >
                        <span className={`grid h-[22px] w-[22px] shrink-0 place-items-center rounded-md border border-ink ${isDone ? 'bg-lime-deep text-card' : 'bg-card'}`}>
                          {isDone && <Check size={14} strokeWidth={3} aria-hidden="true" />}
                        </span>
                        <span className={isDone ? 'text-muted line-through decoration-2' : ''}>{item}</span>
                      </button>
                    );
                  })}
                </div>
              );
            })}
        </div>
        <div
          ref={stampRef}
          aria-hidden={!complete}
          className={`lp-stamp lp-display pointer-events-none absolute bottom-6 right-6 rounded-xl border-4 border-tomato bg-card px-4 py-2 text-3xl text-tomato ${complete ? 'on' : ''}`}
        >
          ALL PACKED
        </div>
      </div>
    </div>
  );
}
