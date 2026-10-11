import { useState } from 'react';
import { Check, Plus, Sparkles, X } from 'lucide-react';
import { Button } from './ui';
import { CATEGORIES } from '../utils/tripMeta';
import API from '../api/axios';

// AI suggestions waiting to be kept or dismissed. Shown at the top of the packing list.
export default function SuggestionsPanel({ tripId, packingList, brief, onListChange, showToast }) {
  const [busy, setBusy] = useState(false);
  const pending = (packingList.suggestions || []).filter((s) => s.status === 'new');
  if (pending.length === 0) return null;

  const resolve = async (action, ids) => {
    setBusy(true);
    try {
      const res = await API.put(`/packing/${tripId}/suggestions`, { action, ids });
      onListChange(res.data.data);
      if (action === 'keep') showToast(ids === 'all' ? 'All suggestions added' : 'Added to your list');
    } catch (err) {
      showToast(err.response?.data?.message || "Couldn't update suggestions.", 'error');
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="animate-pop-in overflow-hidden rounded-2xl border border-ink bg-card shadow-pop" aria-label="AI suggestions">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-ink bg-lilac px-6 py-4">
        <div className="min-w-0">
          <h2 className="font-display inline-flex items-center gap-2 text-lg">
            <Sparkles size={20} strokeWidth={2.2} aria-hidden="true" /> Suggested for this trip
          </h2>
          {brief && <p className="truncate text-sm text-muted">From your note: “{brief}”</p>}
        </div>
        <div className="flex gap-2">
          <Button size="sm" onClick={() => resolve('keep', 'all')} disabled={busy}>
            Keep all
          </Button>
          <Button variant="paper" size="sm" onClick={() => resolve('dismiss', 'all')} disabled={busy}>
            Dismiss all
          </Button>
        </div>
      </div>

      <ul>
        {pending.map((sug) => {
          const { icon: Icon } = CATEGORIES[sug.category] || CATEGORIES.misc;
          return (
            <li key={sug._id} className="flex flex-wrap items-center gap-3 border-b border-ink/25 px-6 py-4 last:border-b-0">
              <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-ink bg-paper" aria-hidden="true">
                <Icon size={16} strokeWidth={2.2} />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block font-bold">{sug.name}</span>
                {sug.reason && <span className="block text-sm text-muted">{sug.reason}</span>}
              </span>
              <span className="flex gap-2">
                <Button size="sm" onClick={() => resolve('keep', [sug._id])} disabled={busy}>
                  <Plus size={16} strokeWidth={2.6} aria-hidden="true" /> Keep
                </Button>
                <Button variant="paper" size="sm" onClick={() => resolve('dismiss', [sug._id])} disabled={busy} aria-label={`Dismiss ${sug.name}`}>
                  <X size={16} strokeWidth={2.6} aria-hidden="true" />
                </Button>
              </span>
            </li>
          );
        })}
      </ul>

      <p className="flex items-center gap-1.5 border-t border-ink/25 px-6 py-3 text-xs text-muted">
        <Check size={14} strokeWidth={2.4} aria-hidden="true" /> AI suggestions can be wrong. Kept items join your list marked “suggested”.
      </p>
    </section>
  );
}
