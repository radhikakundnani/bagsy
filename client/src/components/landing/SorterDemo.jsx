import { useEffect, useRef, useState } from 'react';
import { CircleHelp, LoaderCircle, Sparkles } from 'lucide-react';
import API from '../../api/axios';

const LABEL = { clothing: 'Clothing', toiletries: 'Toiletries', electronics: 'Electronics', documents: 'Documents', misc: 'Everything else' };
const BAR = { clothing: 'bg-sun-deep', toiletries: 'bg-lilac-deep', electronics: 'bg-sky-deep', documents: 'bg-lime-deep', misc: 'bg-tomato' };
const TEXT = { clothing: 'text-sun-deep', toiletries: 'text-lilac-deep', electronics: 'text-sky-deep', documents: 'text-lime-deep', misc: 'text-tomato' };
const TRIES = ['type c cable', 'kajal', 'aadhaar card', 'kurta', 'sunnies', 'airpods'];

// Asks the real item-sorter model (public demo endpoint) to sort whatever the visitor types
export default function SorterDemo() {
  const [text, setText] = useState('');
  const [state, setState] = useState({ status: 'idle' });
  const latest = useRef(0);

  useEffect(() => {
    const name = text.trim();
    if (name.length < 2) {
      setState({ status: 'idle' });
      return undefined;
    }
    setState({ status: 'loading' });
    const id = ++latest.current;
    const timer = setTimeout(async () => {
      try {
        const res = await API.get('/sort-demo', { params: { name } });
        if (id !== latest.current) return;
        setState(res.data.data ? { status: 'done', result: res.data.data } : { status: 'waking' });
      } catch (err) {
        if (id !== latest.current) return;
        setState({ status: err.response?.status === 429 ? 'limited' : 'waking', message: err.response?.data?.message });
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [text]);

  let body;
  if (state.status === 'idle') {
    body = (
      <>
        <p className="eyebrow">Waiting for something to sort…</p>
        <p className="text-sm text-muted">Try the examples, or anything in your actual bag.</p>
      </>
    );
  } else if (state.status === 'loading') {
    body = (
      <p className="eyebrow flex items-center gap-2">
        <LoaderCircle size={16} className="animate-spin" aria-hidden="true" /> Sorting…
      </p>
    );
  } else if (state.status === 'done') {
    const { category, confidence, confident, probs } = state.result;
    const rows = Object.entries(probs).sort((a, b) => b[1] - a[1]);
    body = (
      <>
        <p className="eyebrow flex items-center gap-2">
          {confident ? <Sparkles size={16} aria-hidden="true" /> : <CircleHelp size={16} aria-hidden="true" />}
          {confident ? 'Sorted into' : 'Not sure. Maybe'}
        </p>
        <p className={`lp-display text-[clamp(40px,5vw,60px)] ${TEXT[category]}`}>{LABEL[category]}</p>
        <div className="flex flex-col gap-2">
          {rows.map(([cat, p]) => (
            <div key={cat} className="grid grid-cols-[92px_1fr_44px] items-center gap-2.5 text-[13px] font-bold">
              <span>{cat === 'misc' ? 'Misc' : LABEL[cat]}</span>
              <span className="h-3 overflow-hidden rounded-full border border-ink bg-paper">
                <span className={`block h-full transition-[width] duration-500 ${BAR[cat]}`} style={{ width: `${Math.round(p * 100)}%` }} />
              </span>
              <span className="text-right tabular-nums">{Math.round(p * 100)}%</span>
            </div>
          ))}
        </div>
        <p className="text-sm text-muted">
          {confident ? `${Math.round(confidence * 100)}% sure, so it files it for you.` : 'Under 50%, so Bagsy suggests it and lets you pick.'}
        </p>
      </>
    );
  } else if (state.status === 'limited') {
    body = <p className="text-sm font-bold">{state.message || 'That was a lot of sorting. Sign up to keep going.'}</p>;
  } else {
    body = (
      <>
        <p className="eyebrow">The model is waking up</p>
        <p className="text-sm text-muted">The free server naps when it's quiet. Give it a few seconds and type again.</p>
      </>
    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <div className="rounded-[22px] border border-ink bg-sky p-7 shadow-pop">
        <label htmlFor="lp-sort" className="eyebrow !text-ink">
          Add something only you'd remember
        </label>
        <input
          id="lp-sort"
          autoComplete="off"
          maxLength={60}
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="type c cable"
          className="mt-3 w-full rounded-2xl border border-ink bg-card px-4 py-4 text-xl font-bold placeholder:text-muted"
        />
        <div className="mt-4 flex flex-wrap gap-2">
          {TRIES.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setText(t)}
              className="smooth rounded-full border border-ink bg-card px-3.5 py-1.5 text-sm font-extrabold hover:-translate-y-0.5 hover:bg-sun"
            >
              {t}
            </button>
          ))}
        </div>
      </div>
      <div className="flex min-h-[280px] flex-col justify-center gap-4 rounded-[22px] border border-ink bg-card p-7 shadow-pop" aria-live="polite">
        {body}
      </div>
    </div>
  );
}
