import { useState } from 'react';
import { Clapperboard, Lightbulb, Pin } from 'lucide-react';

const CREW = [
  ['R', 'You', 34, 'bg-sun'],
  ['P', 'Priya', 83, 'bg-sky'],
  ['M', 'Mum', 100, 'bg-lime'],
  ['A', 'Arjun', 8, 'bg-peach'],
];
const IDEAS = [
  { icon: Clapperboard, kind: 'Reel', text: 'Slow-mo walk into the sea at sunset', bg: 'bg-card' },
  { icon: Lightbulb, kind: 'Idea', text: 'Group jump off the fort wall, all in white', bg: 'bg-sun' },
  { icon: Pin, kind: 'Pin', text: 'Beach shack outfits', bg: 'bg-peach' },
];

export default function CrewInspo() {
  const [spread, setSpread] = useState(false);
  return (
    <div className="grid gap-6 md:grid-cols-2">
      <div className="rounded-[22px] border border-ink bg-lilac p-7 shadow-pop">
        <h3 className="lp-display mb-2 text-2xl">Goa, 20–25 Oct</h3>
        {CREW.map(([initial, name, pct, tint], i) => (
          <div key={name} className={`grid grid-cols-[44px_1fr_48px] items-center gap-3 py-3 ${i ? 'border-t border-dashed border-ink/25' : ''}`}>
            <span className={`grid h-11 w-11 place-items-center rounded-full border border-ink font-black ${tint}`}>{initial}</span>
            <div>
              <b>{name}</b>
              <div className="mt-1.5 h-3 overflow-hidden rounded-full border border-ink bg-paper">
                <div className={`h-full ${pct === 100 ? 'bg-lime-deep' : 'bg-ink'}`} style={{ width: `${pct}%` }} />
              </div>
            </div>
            <b className="text-right tabular-nums">{pct === 100 ? 'Done' : `${pct}%`}</b>
          </div>
        ))}
        <p className="mt-3 text-sm text-muted">Arjun is at 8%. You know what to do.</p>
      </div>

      <button
        type="button"
        onClick={() => setSpread((s) => !s)}
        aria-pressed={spread}
        aria-label="The inspo board: tap to spread the cards"
        className={`lp-fan relative h-[340px] overflow-hidden rounded-[22px] border border-ink bg-lime p-7 text-left shadow-pop ${spread ? 'spread' : ''}`}
      >
        <span className="lp-display relative z-10 text-2xl">The inspo board</span>
        {IDEAS.map(({ icon: Icon, kind, text, bg }, i) => (
          <span key={kind} className={`lp-card c${i + 1} absolute left-1/2 top-[70px] block w-[190px] rounded-[18px] border border-ink p-4 ${bg}`}>
            <span className="eyebrow flex items-center gap-1.5 !text-ink">
              <Icon size={14} aria-hidden="true" />
              {kind}
            </span>
            <span className="font-accent mt-2.5 block text-[22px] leading-tight">{text}</span>
          </span>
        ))}
      </button>
    </div>
  );
}
