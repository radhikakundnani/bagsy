import { useEffect, useMemo, useState } from 'react';
import { Check, MapPin, Plus, Sparkles, X } from 'lucide-react';
import API from '../api/axios';
import PersonDot from './PersonDot';
import { Alert, Button, Spinner, inputClass } from './ui';
import { dayLabel, ideaTitle } from '../utils/sections';

const byTime = (a, b) => (a.time || '99').localeCompare(b.time || '99');

// A shared, day-by-day plan for the trip. Anyone on the trip can add a stop.
export default function ItineraryTab({ trip, inspoOn, onOpenInspo, showToast }) {
  const isGroup = trip.mode === 'group';
  const [days, setDays] = useState(1);
  const [stops, setStops] = useState([]);
  const [ideas, setIdeas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [openDay, setOpenDay] = useState(null);

  const loadIdeas = () =>
    inspoOn
      ? API.get(`/trips/${trip._id}/inspo`)
          .then((res) => setIdeas(res.data.data))
          .catch(() => setIdeas([]))
      : Promise.resolve(setIdeas([]));

  useEffect(() => {
    Promise.all([
      API.get(`/trips/${trip._id}/itinerary`).then((res) => {
        setDays(res.data.data.days);
        setStops(res.data.data.stops);
      }),
      loadIdeas(),
    ])
      .catch((err) => setError(err.response?.data?.message || "We couldn't load the itinerary."))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trip._id, inspoOn]);

  const ideaById = useMemo(() => new Map(ideas.map((i) => [i._id, i])), [ideas]);
  const planned = new Set(stops.map((s) => s.inspoId).filter(Boolean));
  const unplanned = ideas.filter((i) => !planned.has(i._id) && !i.done);
  // Stops left behind if the trip dates were shortened
  const outside = stops.filter((s) => s.day >= days).sort(byTime);

  const addStop = async (fields) => {
    const res = await API.post(`/trips/${trip._id}/itinerary`, fields);
    setStops((list) => [...list, res.data.data]);
    return res.data.data;
  };

  const planIdea = async (idea, day) => {
    try {
      await addStop({ day, title: ideaTitle(idea).slice(0, 80), inspoId: idea._id });
      if (idea.visibility === 'me') await loadIdeas(); // it's now on the group board
      showToast(`Added to Day ${day + 1}`);
    } catch (err) {
      showToast(err.response?.data?.message || "We couldn't add that.", 'error');
    }
  };

  const removeStop = async (stop) => {
    try {
      await API.delete(`/trips/${trip._id}/itinerary/${stop._id}`);
      setStops((list) => list.filter((s) => s._id !== stop._id));
    } catch (err) {
      showToast(err.response?.data?.message || "We couldn't remove that.", 'error');
    }
  };

  const jumpTo = (i) => document.getElementById(`day-${i}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' });

  if (loading) return <Spinner label="Loading itinerary" />;
  if (error) return <Alert>{error}</Alert>;

  const stopList = (list) => (
    <ol className="flex flex-col">
      {list.map((stop, k) => (
        <StopRow
          key={stop._id}
          stop={stop}
          idea={stop.inspoId ? ideaById.get(stop.inspoId) : null}
          last={k === list.length - 1}
          showWho={isGroup}
          onRemove={() => removeStop(stop)}
          onOpenInspo={onOpenInspo}
        />
      ))}
    </ol>
  );

  return (
    <div className="grid gap-6 lg:grid-cols-[260px_1fr]">
      <aside className="order-last flex flex-col gap-4 lg:sticky lg:top-24 lg:order-none lg:self-start">
        <div className="flex flex-col gap-2 rounded-2xl border border-ink bg-card p-5">
          <p className="eyebrow">Jump to a day</p>
          <div className="flex flex-col">
            {Array.from({ length: days }, (_, i) => {
              const n = stops.filter((s) => s.day === i).length;
              return (
                <button
                  key={i}
                  type="button"
                  onClick={() => jumpTo(i)}
                  className="smooth flex items-center justify-between rounded-lg px-2 py-1.5 text-left text-sm hover:bg-sun"
                >
                  <span>
                    <b>Day {i + 1}</b> <span className="text-muted">{dayLabel(trip.startDate, i)}</span>
                  </span>
                  <span className="text-xs tabular-nums text-muted">{n || 'Free'}</span>
                </button>
              );
            })}
          </div>
        </div>

        {inspoOn && (
          <div className="flex flex-col gap-3 rounded-2xl border border-ink bg-card p-5">
            <div>
              <p className="font-display text-lg">Not planned yet</p>
              <p className="mt-1 text-xs text-muted">Ideas from the Inspo board that aren't on a day</p>
            </div>
            {unplanned.length === 0 ? (
              <p className="text-sm text-muted">{ideas.length ? 'Every idea has a day.' : 'Nothing on the Inspo board yet.'}</p>
            ) : (
              unplanned.map((idea) => (
                <div key={idea._id} className="flex flex-col gap-2 border-t border-ink/20 pt-3 first:border-0 first:pt-0">
                  <p className="line-clamp-2 break-words text-sm font-bold">{ideaTitle(idea)}</p>
                  {isGroup && idea.visibility === 'me' && (
                    <p className="text-xs text-muted">Private. Adding it to a day shares it with the group.</p>
                  )}
                  <label className="sr-only" htmlFor={`plan-${idea._id}`}>
                    Add to a day
                  </label>
                  <select
                    id={`plan-${idea._id}`}
                    value=""
                    onChange={(e) => e.target.value !== '' && planIdea(idea, Number(e.target.value))}
                    className={`${inputClass} px-3 py-1.5 text-sm`}
                  >
                    <option value="">Add to a day…</option>
                    {Array.from({ length: days }, (_, i) => (
                      <option key={i} value={i}>
                        Day {i + 1} · {dayLabel(trip.startDate, i)}
                      </option>
                    ))}
                  </select>
                </div>
              ))
            )}
          </div>
        )}
      </aside>

      <section className="flex min-w-0 flex-col gap-4">
        <p className="text-sm">
          <b>
            {stops.length} {stops.length === 1 ? 'stop' : 'stops'} over {days} {days === 1 ? 'day' : 'days'}
          </b>{' '}
          <span className="text-muted">{isGroup ? '· anyone on the trip can add a stop' : '· times are local to your trip'}</span>
        </p>

        {Array.from({ length: days }, (_, i) => {
          const list = stops.filter((s) => s.day === i).sort(byTime);
          return (
            <article key={i} id={`day-${i}`} className="scroll-mt-24 overflow-hidden rounded-2xl border border-ink bg-card">
              <header className="border-b border-ink px-5 py-3">
                <h2 className="font-display text-lg">
                  Day {i + 1} <span className="font-accent text-[1.15em] font-normal">{dayLabel(trip.startDate, i)}</span>
                </h2>
              </header>
              <div className="flex flex-col gap-3 p-5">
                {list.length ? (
                  stopList(list)
                ) : (
                  <p className="text-sm text-muted">
                    <span className="font-accent text-lg text-ink">Free day.</span> Nothing planned yet, and that's fine.
                  </p>
                )}
                {openDay === i ? (
                  <AddStopForm
                    onCancel={() => setOpenDay(null)}
                    onSave={async (fields) => {
                      await addStop({ ...fields, day: i });
                      setOpenDay(null);
                    }}
                  />
                ) : (
                  <button
                    type="button"
                    onClick={() => setOpenDay(i)}
                    className="smooth inline-flex w-fit items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-bold text-muted hover:bg-sun hover:text-ink"
                  >
                    <Plus size={16} aria-hidden="true" /> Add a stop
                  </button>
                )}
              </div>
            </article>
          );
        })}

        {outside.length > 0 && (
          <article className="overflow-hidden rounded-2xl border border-dashed border-ink bg-card">
            <header className="border-b border-dashed border-ink px-5 py-3">
              <h2 className="font-display text-lg">Outside the trip dates</h2>
              <p className="text-xs text-muted">The trip got shorter. Remove these or re-add them to a day.</p>
            </header>
            <div className="p-5">{stopList(outside)}</div>
          </article>
        )}
      </section>
    </div>
  );
}

function StopRow({ stop, idea, last, showWho, onRemove, onOpenInspo }) {
  return (
    <li className="grid grid-cols-[3.75rem_1fr] gap-3">
      <span className={`pt-0.5 text-sm font-bold tabular-nums ${stop.time ? '' : 'text-muted'}`}>{stop.time || 'Any time'}</span>
      <div className={`relative flex min-w-0 flex-col gap-1.5 border-l border-ink pl-4 ${last ? 'pb-1' : 'pb-5'}`}>
        <span
          className={`absolute -left-[5px] top-1.5 h-2.5 w-2.5 rounded-full border border-ink ${stop.inspoId ? 'bg-tomato' : 'bg-card'}`}
          aria-hidden="true"
        />
        <div className="flex items-start justify-between gap-2">
          <p className="break-words font-bold leading-snug">{stop.title}</p>
          <span className="flex shrink-0 items-center gap-1">
            {showWho && <PersonDot person={stop.addedBy} />}
            {stop.canEdit && (
              <button
                type="button"
                onClick={onRemove}
                aria-label={`Remove ${stop.title}`}
                className="smooth inline-flex h-6 w-6 items-center justify-center rounded-full hover:bg-peach"
              >
                <X size={14} aria-hidden="true" />
              </button>
            )}
          </span>
        </div>
        {stop.where && (
          <p className="inline-flex items-center gap-1 text-sm text-muted">
            <MapPin size={14} aria-hidden="true" />
            {stop.where}
          </p>
        )}
        {stop.note && <p className="break-words text-sm">{stop.note}</p>}
        {idea && (
          <button
            type="button"
            onClick={onOpenInspo}
            className="smooth inline-flex w-fit max-w-full items-center gap-1.5 rounded-full border border-ink bg-peach px-2.5 py-1 text-xs font-bold hover:bg-sun"
          >
            <Sparkles size={14} aria-hidden="true" />
            <span className="truncate">{ideaTitle(idea)}</span>
            {idea.done && <Check size={14} aria-hidden="true" />}
          </button>
        )}
      </div>
    </li>
  );
}

function AddStopForm({ onSave, onCancel }) {
  const [time, setTime] = useState('');
  const [title, setTitle] = useState('');
  const [where, setWhere] = useState('');
  const [note, setNote] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    if (!title.trim()) return setError('Add a short plan first.');
    setSaving(true);
    try {
      await onSave({ time, title, where, note });
    } catch (err) {
      setError(err.response?.data?.message || "We couldn't add that.");
      setSaving(false);
    }
  };

  const small = `${inputClass} px-3 py-2 text-sm`;
  return (
    <form onSubmit={submit} className="flex flex-col gap-3 rounded-xl border border-ink bg-paper p-4">
      <div className="grid gap-3 sm:grid-cols-[8rem_1fr]">
        <div className="flex flex-col gap-1">
          <label htmlFor="stop-time" className="text-xs font-bold">
            Time <span className="font-normal text-muted">(optional)</span>
          </label>
          <input id="stop-time" type="time" value={time} onChange={(e) => setTime(e.target.value)} className={small} />
        </div>
        <div className="flex flex-col gap-1">
          <label htmlFor="stop-title" className="text-xs font-bold">
            What's the plan?
          </label>
          <input
            id="stop-title"
            autoFocus
            maxLength={80}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Dinner at the beach shack"
            className={small}
          />
        </div>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="flex flex-col gap-1">
          <label htmlFor="stop-where" className="text-xs font-bold">
            Where <span className="font-normal text-muted">(optional)</span>
          </label>
          <input
            id="stop-where"
            maxLength={80}
            value={where}
            onChange={(e) => setWhere(e.target.value)}
            placeholder="Morjim"
            className={small}
          />
        </div>
        <div className="flex flex-col gap-1">
          <label htmlFor="stop-note" className="text-xs font-bold">
            Note <span className="font-normal text-muted">(optional)</span>
          </label>
          <input
            id="stop-note"
            maxLength={200}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Book a table"
            className={small}
          />
        </div>
      </div>
      {error && <p className="text-xs font-bold text-tomato">{error}</p>}
      <div className="flex flex-wrap gap-2">
        <Button type="submit" size="sm" disabled={saving}>
          {saving ? 'Adding…' : 'Add stop'}
        </Button>
        <Button variant="paper" size="sm" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
