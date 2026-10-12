import { useEffect, useMemo, useState } from 'react';
import { ArrowUpRight, CalendarDays, Check, Lightbulb, Lock, Plus, Trash2, UsersRound, Video } from 'lucide-react';
import API from '../api/axios';
import PersonDot from './PersonDot';
import { Alert, Button, Spinner, inputClass } from './ui';
import { detectSource, ideaTitle, shortUrl, sourceMeta, timeAgo } from '../utils/sections';

const TYPES = [
  { key: 'all', label: 'All' },
  { key: 'reel', label: 'Reels & videos' },
  { key: 'pin', label: 'Pins & links' },
  { key: 'note', label: 'Ideas' },
];
const typeOf = (item) => (item.kind === 'note' ? 'note' : ['instagram', 'tiktok', 'youtube'].includes(item.source) ? 'reel' : 'pin');

const Chip = ({ active, children, ...props }) => (
  <button
    type="button"
    aria-pressed={active}
    className={`smooth rounded-full border border-ink px-3 py-1 text-xs font-bold ${active ? 'bg-ink text-card' : 'bg-card hover:bg-sun'}`}
    {...props}
  >
    {children}
  </button>
);

// Reels, pins and ideas for the trip. Group trips have a shared board plus a private one for each person.
export default function InspoTab({ trip, itineraryOn, onOpenItinerary, showToast }) {
  const isGroup = trip.mode === 'group';
  const isAdmin = trip.myRole === 'admin';
  const [items, setItems] = useState([]);
  const [stops, setStops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [board, setBoard] = useState('group'); // 'group' | 'me'
  const [type, setType] = useState('all');
  const [person, setPerson] = useState('all');
  const [hideDone, setHideDone] = useState(false);

  const [kind, setKind] = useState('link');
  const [url, setUrl] = useState('');
  const [note, setNote] = useState('');
  const [visibility, setVisibility] = useState(isGroup ? 'group' : 'me');
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const loads = [API.get(`/trips/${trip._id}/inspo`).then((res) => setItems(res.data.data))];
    if (itineraryOn)
      loads.push(
        API.get(`/trips/${trip._id}/itinerary`)
          .then((res) => setStops(res.data.data.stops))
          .catch(() => setStops([])),
      );
    Promise.all(loads)
      .catch((err) => setError(err.response?.data?.message || "We couldn't load the inspo board."))
      .finally(() => setLoading(false));
  }, [trip._id, itineraryOn]);

  // Solo trips just have one board, so show everything
  const pool = useMemo(() => (isGroup ? items.filter((i) => i.visibility === board) : items), [items, board, isGroup]);
  const people = useMemo(() => {
    const seen = new Map();
    items.filter((i) => i.visibility === 'group').forEach((i) => seen.set(String(i.addedBy._id), i.addedBy));
    return [...seen.values()];
  }, [items]);
  const shown = pool.filter(
    (i) => (type === 'all' || typeOf(i) === type) && (person === 'all' || String(i.addedBy._id) === person) && !(hideDone && i.done),
  );
  const dayOf = (item) => stops.find((s) => s.inspoId === item._id);
  const detected = url ? detectSource(url) : null;

  const switchBoard = (key) => {
    setBoard(key);
    setVisibility(key);
    setType('all');
    setPerson('all');
  };

  const replace = (updated) => setItems((list) => list.map((i) => (i._id === updated._id ? updated : i)));

  const add = async (e) => {
    e.preventDefault();
    setFormError('');
    if (kind === 'link' && !detected) return setFormError('Paste a full link, starting with https://');
    if (kind === 'note' && !note.trim()) return setFormError('Write your idea first.');
    setSaving(true);
    try {
      const res = await API.post(`/trips/${trip._id}/inspo`, { kind, url: kind === 'link' ? url : undefined, note, visibility });
      setItems((list) => [res.data.data, ...list]);
      setUrl('');
      setNote('');
      if (isGroup) setBoard(visibility);
      setType('all');
      setPerson('all');
      showToast(visibility === 'me' && isGroup ? 'Saved to your board' : 'Added to the board');
    } catch (err) {
      setFormError(err.response?.data?.message || "We couldn't save that.");
    } finally {
      setSaving(false);
    }
  };

  const update = async (item, changes, message) => {
    try {
      const res = await API.put(`/trips/${trip._id}/inspo/${item._id}`, changes);
      replace(res.data.data);
      if (message) showToast(message);
    } catch (err) {
      showToast(err.response?.data?.message || "We couldn't update that.", 'error');
    }
  };

  const remove = async (item) => {
    try {
      await API.delete(`/trips/${trip._id}/inspo/${item._id}`);
      setItems((list) => list.filter((i) => i._id !== item._id));
      setStops((list) => list.map((s) => (s.inspoId === item._id ? { ...s, inspoId: null } : s)));
      showToast('Removed');
    } catch (err) {
      showToast(err.response?.data?.message || "We couldn't remove that.", 'error');
    }
  };

  if (loading) return <Spinner label="Loading inspo board" />;
  if (error) return <Alert>{error}</Alert>;

  return (
    <div className="grid gap-6 lg:grid-cols-[300px_1fr]">
      <aside className="flex flex-col gap-4 lg:sticky lg:top-24 lg:self-start">
        <form onSubmit={add} className="flex flex-col gap-3 rounded-2xl border border-ink bg-card p-5 shadow-pop">
          <p className="font-display text-xl">Add inspo</p>
          <div className="flex gap-1 rounded-full border border-ink p-1 text-xs font-bold">
            {[
              ['link', 'Link'],
              ['note', 'Idea'],
            ].map(([key, label]) => (
              <button
                key={key}
                type="button"
                aria-pressed={kind === key}
                onClick={() => setKind(key)}
                className={`smooth flex-1 rounded-full px-2 py-1.5 ${kind === key ? 'bg-ink text-card' : 'hover:bg-sun'}`}
              >
                {label}
              </button>
            ))}
          </div>

          {kind === 'link' && (
            <div className="flex flex-col gap-1">
              <label htmlFor="inspo-url" className="text-sm font-bold">
                Paste a reel, pin or video link
              </label>
              <input
                id="inspo-url"
                type="url"
                inputMode="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://www.instagram.com/reel/…"
                className={`${inputClass} px-3 py-2.5 text-sm`}
              />
              <p className="text-xs text-muted">
                {detected ? `Looks like: ${sourceMeta(detected).label}` : "We'll spot Instagram, TikTok, YouTube and Pinterest."}
              </p>
            </div>
          )}

          <div className="flex flex-col gap-1">
            <label htmlFor="inspo-note" className="text-sm font-bold">
              {kind === 'note' ? 'Your idea' : 'Note'} {kind === 'link' && <span className="font-normal text-muted">(optional)</span>}
            </label>
            <textarea
              id="inspo-note"
              rows={2}
              maxLength={200}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder={kind === 'note' ? 'Group jump off the fort wall, everyone in white' : 'Shoot this at golden hour'}
              className={`${inputClass} resize-none px-3 py-2.5 text-sm`}
            />
          </div>

          {isGroup && (
            <div className="flex flex-col gap-1">
              <span className="text-sm font-bold">Who can see it</span>
              <div className="flex gap-1 rounded-full border border-ink p-1 text-xs font-bold">
                {[
                  ['group', 'Group board', UsersRound],
                  ['me', 'Only me', Lock],
                ].map(([key, label, Icon]) => (
                  <button
                    key={key}
                    type="button"
                    aria-pressed={visibility === key}
                    onClick={() => setVisibility(key)}
                    className={`smooth inline-flex flex-1 items-center justify-center gap-1 rounded-full px-2 py-1.5 ${visibility === key ? 'bg-ink text-card' : 'hover:bg-sun'}`}
                  >
                    <Icon size={14} aria-hidden="true" />
                    {label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {formError && <p className="text-xs font-bold text-tomato">{formError}</p>}
          <Button type="submit" disabled={saving}>
            <Plus size={16} aria-hidden="true" /> {saving ? 'Adding…' : 'Add to board'}
          </Button>
        </form>

        <div className="flex flex-col gap-3 rounded-2xl border border-ink bg-card p-5">
          <p className="eyebrow">Show</p>
          <div className="flex flex-wrap gap-2">
            {TYPES.map((t) => (
              <Chip key={t.key} active={type === t.key} onClick={() => setType(t.key)}>
                {t.label}{' '}
                <span className="opacity-60">{t.key === 'all' ? pool.length : pool.filter((i) => typeOf(i) === t.key).length}</span>
              </Chip>
            ))}
          </div>
          {isGroup && board === 'group' && people.length > 1 && (
            <>
              <p className="eyebrow mt-2">Added by</p>
              <div className="flex flex-wrap gap-2">
                <Chip active={person === 'all'} onClick={() => setPerson('all')}>
                  Everyone
                </Chip>
                {people.map((p) => (
                  <Chip key={p._id} active={person === String(p._id)} onClick={() => setPerson(String(p._id))}>
                    {items.find((i) => String(i.addedBy._id) === String(p._id))?.isMine ? 'You' : p.name.split(' ')[0]}
                  </Chip>
                ))}
              </div>
            </>
          )}
          <label className="mt-2 flex items-center gap-2 text-sm">
            <input type="checkbox" checked={hideDone} onChange={(e) => setHideDone(e.target.checked)} className="h-4 w-4 accent-ink" />
            Hide what's been shot
          </label>
        </div>
      </aside>

      <section className="flex min-w-0 flex-col gap-4">
        {isGroup && (
          <div className="grid grid-cols-2 gap-2 sm:max-w-md">
            {[
              ['group', 'Group board', UsersRound, 'Everyone on the trip'],
              ['me', 'My board', Lock, 'Only you'],
            ].map(([key, label, Icon, sub]) => (
              <button
                key={key}
                type="button"
                aria-pressed={board === key}
                onClick={() => switchBoard(key)}
                className={`smooth flex items-center gap-2.5 rounded-xl border border-ink px-3 py-2.5 text-left ${board === key ? 'bg-ink text-card shadow-pop-sm' : 'bg-card hover:bg-sun'}`}
              >
                <Icon size={16} aria-hidden="true" />
                <span className="min-w-0">
                  <span className="block text-sm font-bold">
                    {label} <span className="font-normal opacity-70">{items.filter((i) => i.visibility === key).length}</span>
                  </span>
                  <span className="block text-xs opacity-70">{sub}</span>
                </span>
              </button>
            ))}
          </div>
        )}

        <div className="flex flex-wrap items-baseline justify-between gap-2 text-sm">
          <p>
            <b>{pool.length} saved</b>{' '}
            <span className="text-muted">
              {!isGroup
                ? '· only you can see these until you invite people'
                : board === 'me'
                  ? '· only you can see these. Share one to move it to the group board.'
                  : '· everyone on the trip can add and see these'}
            </span>
          </p>
          {pool.length > 0 && (
            <p className="text-muted">
              <b className="text-ink">
                {pool.filter((i) => i.done).length} of {pool.length}
              </b>{' '}
              shot so far
            </p>
          )}
        </div>

        {shown.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-ink p-10 text-center text-sm text-muted">
            {pool.length
              ? 'Nothing matches these filters.'
              : board === 'me' && isGroup
                ? 'Your private board is empty. Save ideas here that are just for you.'
                : 'No inspo yet. Paste a reel or pin you want to recreate on this trip.'}
          </div>
        ) : (
          <div className="columns-1 gap-4 sm:columns-2 xl:columns-3">
            {shown.map((item) => (
              <IdeaCard
                key={item._id}
                item={item}
                isGroup={isGroup}
                stop={itineraryOn ? dayOf(item) : null}
                canDelete={item.isMine || (isAdmin && item.visibility === 'group')}
                onToggleDone={() => update(item, { done: !item.done })}
                onShare={() => update(item, { visibility: 'group' }, 'Shared with the group')}
                onDelete={() => remove(item)}
                onOpenItinerary={onOpenItinerary}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function IdeaCard({ item, isGroup, stop, canDelete, onToggleDone, onShare, onDelete, onOpenItinerary }) {
  const src = sourceMeta(item.source);
  const SrcIcon = src.icon;
  const isPrivate = isGroup && item.visibility === 'me';

  return (
    <article
      className={`lift smooth mb-4 break-inside-avoid overflow-hidden rounded-2xl border border-ink bg-card ${item.done ? 'opacity-60' : ''}`}
    >
      {item.kind === 'link' ? (
        <a
          href={item.url}
          target="_blank"
          rel="noopener noreferrer"
          className={`smooth flex items-center gap-3 border-b border-ink px-4 py-5 hover:brightness-95 ${src.tint}`}
        >
          <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-ink bg-card">
            <SrcIcon size={20} aria-hidden="true" />
          </span>
          <span className="min-w-0">
            <span className="eyebrow block !text-ink">{src.label}</span>
            <span className="block truncate text-sm font-bold">{shortUrl(item.url)}</span>
          </span>
          <ArrowUpRight size={16} className="ml-auto shrink-0" aria-hidden="true" />
          <span className="sr-only">(opens in a new tab)</span>
        </a>
      ) : (
        <div className="border-b border-ink bg-paper px-5 py-6">
          <span className="eyebrow inline-flex items-center gap-1.5">
            <Lightbulb size={14} aria-hidden="true" />
            Idea
          </span>
          <p className="font-accent mt-2 break-words text-2xl leading-snug">{item.note}</p>
        </div>
      )}

      <div className="flex flex-col gap-3 p-4">
        {item.kind === 'link' && item.note && <p className="break-words text-sm">{item.note}</p>}
        {stop && (
          <button
            type="button"
            onClick={onOpenItinerary}
            className="smooth inline-flex w-fit items-center gap-1.5 rounded-full border border-ink bg-sky px-2.5 py-1 text-xs font-bold hover:bg-sun"
          >
            <CalendarDays size={14} aria-hidden="true" />
            Day {stop.day + 1}
            {stop.time ? ` · ${stop.time}` : ''}
          </button>
        )}
        <div className="flex flex-wrap items-center justify-between gap-2">
          {isPrivate ? (
            <span className="inline-flex items-center gap-1.5 text-xs text-muted">
              <Lock size={14} aria-hidden="true" />
              Only you · {timeAgo(item.createdAt)}
            </span>
          ) : (
            <span className="inline-flex min-w-0 items-center gap-1.5 text-xs text-muted">
              <PersonDot person={item.addedBy} />
              <span className="truncate">
                {item.isMine ? 'You' : item.addedBy.name.split(' ')[0]} · {timeAgo(item.createdAt)}
              </span>
            </span>
          )}
          <span className="flex items-center gap-1">
            <button
              type="button"
              onClick={onToggleDone}
              aria-pressed={item.done}
              className={`smooth inline-flex items-center gap-1 rounded-full border border-ink px-2.5 py-1 text-xs font-bold ${item.done ? 'bg-lime-deep text-card' : 'bg-card hover:bg-lime'}`}
            >
              {item.done ? <Check size={14} aria-hidden="true" /> : <Video size={14} aria-hidden="true" />}
              {item.done ? 'Shot it' : 'To shoot'}
            </button>
            {isPrivate && (
              <button
                type="button"
                onClick={onShare}
                className="smooth inline-flex items-center gap-1 rounded-full border border-ink bg-card px-2.5 py-1 text-xs font-bold hover:bg-sky"
              >
                <UsersRound size={14} aria-hidden="true" />
                Share
              </button>
            )}
            {canDelete && (
              <button
                type="button"
                onClick={onDelete}
                aria-label={`Remove ${ideaTitle(item)}`}
                className="smooth inline-flex h-7 w-7 items-center justify-center rounded-full hover:bg-peach"
              >
                <Trash2 size={14} aria-hidden="true" />
              </button>
            )}
          </span>
        </div>
      </div>
    </article>
  );
}
