import { useState } from 'react';
import { CalendarDays, ListChecks, Sparkles } from 'lucide-react';
import API from '../api/axios';

export const SECTIONS = [
  { key: 'packing', label: 'Packing list', icon: ListChecks, about: 'Always on', fixed: true },
  { key: 'itinerary', label: 'Itinerary', icon: CalendarDays, about: 'Plan each day together' },
  { key: 'inspo', label: 'Inspo board', icon: Sparkles, about: 'Reels, pins and ideas to shoot' },
];

export const isOn = (trip, key) => key === 'packing' || trip.sections?.[key] !== false;

// Trip admin turns the optional tabs on and off. Switching one off keeps what's in it.
export default function SectionsPanel({ trip, onChange, showToast }) {
  const [busy, setBusy] = useState(null);

  const toggle = async ({ key, label }) => {
    const next = !isOn(trip, key);
    setBusy(key);
    try {
      const res = await API.put(`/trips/${trip._id}`, { sections: { [key]: next } });
      onChange(res.data.data.sections, next ? key : null);
      showToast(`${label} switched ${next ? 'on' : 'off'}`);
    } catch (err) {
      showToast(err.response?.data?.message || "We couldn't change that.", 'error');
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-ink bg-card p-5 shadow-pop">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <p className="font-display text-xl">Trip sections</p>
        <p className="text-xs text-muted">Only you, the trip admin, can change these. Switching one off keeps what's in it.</p>
      </div>
      <div className="grid gap-2 sm:grid-cols-3">
        {SECTIONS.map((s) => {
          const on = isOn(trip, s.key);
          const Icon = s.icon;
          return (
            <button
              key={s.key}
              type="button"
              role="switch"
              aria-checked={on}
              disabled={s.fixed || busy === s.key}
              onClick={() => toggle(s)}
              className={`smooth flex items-center gap-3 rounded-xl border border-ink p-3 text-left ${s.fixed ? 'cursor-default bg-paper' : 'hover:bg-sun'}`}
            >
              <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-ink bg-card">
                <Icon size={18} aria-hidden="true" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-bold">{s.label}</span>
                <span className="block text-xs text-muted">{s.about}</span>
              </span>
              <span
                className={`relative h-5 w-9 shrink-0 rounded-full border border-ink ${on ? 'bg-ink' : 'bg-card'} ${s.fixed ? 'opacity-40' : ''}`}
                aria-hidden="true"
              >
                <span
                  className="smooth absolute top-0.5 h-3.5 w-3.5 rounded-full border border-ink bg-card"
                  style={{ left: on ? 17 : 2 }}
                />
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
