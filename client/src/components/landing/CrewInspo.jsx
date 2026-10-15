import InspoBoard from './InspoBoard';

const CREW = [
  ['R', 'You', 34, 'bg-sun'],
  ['P', 'Priya', 83, 'bg-sky'],
  ['M', 'Mum', 100, 'bg-lime'],
  ['A', 'Arjun', 8, 'bg-peach'],
];

export default function CrewInspo() {
  return (
    <div className="grid gap-6 md:grid-cols-[5fr_7fr]">
      <div className="flex flex-col rounded-[22px] border border-ink bg-lilac p-7 shadow-pop">
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
        <p className="mt-auto pt-3 text-sm text-muted">Arjun is at 8%. You know what to do.</p>
      </div>

      <InspoBoard />
    </div>
  );
}
