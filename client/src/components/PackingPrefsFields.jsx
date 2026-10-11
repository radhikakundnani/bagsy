import { Lock } from 'lucide-react';
import { COUNTRIES, ITEMS_FOR, NEEDS } from '../utils/tripMeta';
import { inputClass } from './ui';

// The optional "about you" answers. Used when creating a trip and on the Profile page.
// value = { itemsFor, homeCountry, needs: [] }
export default function PackingPrefsFields({ value, onChange, showNote = true }) {
  const prefs = { itemsFor: '', homeCountry: '', needs: [], ...value };
  const set = (patch) => onChange({ ...prefs, ...patch });
  const toggleNeed = (need) =>
    set({ needs: prefs.needs.includes(need) ? prefs.needs.filter((n) => n !== need) : [...prefs.needs, need] });

  return (
    <div className="flex flex-col gap-8">
      {showNote && (
        <div className="flex items-start gap-3 rounded-xl border border-ink bg-sky p-4 text-sm">
          <Lock size={18} strokeWidth={2.2} className="mt-0.5 shrink-0" aria-hidden="true" />
          <p>
            <b>All optional, and only used to tailor your list.</b> We remember it for next time, and you can change it any
            time in Profile. It's never shown to the people you travel with.
          </p>
        </div>
      )}

      <fieldset>
        <legend className="font-bold">Which items should we include?</legend>
        <p className="mt-1 text-sm text-muted">Decides things like period products, a shaving kit or makeup.</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {ITEMS_FOR.map((opt) => {
            const selected = prefs.itemsFor === opt.value;
            return (
              <button
                key={opt.value}
                type="button"
                role="radio"
                aria-checked={selected}
                onClick={() => set({ itemsFor: opt.value })}
                className={`smooth rounded-full border border-ink px-3.5 py-1.5 text-sm font-bold ${selected ? 'bg-ink text-card' : 'bg-card hover:bg-sun'}`}
              >
                {opt.label}
              </button>
            );
          })}
        </div>
      </fieldset>

      <div>
        <label htmlFor="pref-country" className="font-bold">
          Where are you travelling from?
        </label>
        <p className="mt-1 text-sm text-muted">So we can flag plug adapters, passports, visas and currency for international trips.</p>
        <input
          id="pref-country"
          list="pref-countries"
          value={prefs.homeCountry}
          onChange={(e) => set({ homeCountry: e.target.value })}
          placeholder="e.g. India"
          maxLength={60}
          className={`${inputClass} mt-3 sm:w-80`}
        />
        <datalist id="pref-countries">
          {COUNTRIES.map((c) => (
            <option key={c} value={c} />
          ))}
        </datalist>
      </div>

      <fieldset>
        <legend className="font-bold">Anything that applies to you?</legend>
        <div className="mt-3 flex flex-wrap gap-2">
          {NEEDS.map(({ value: need, label, icon: Icon }) => {
            const selected = prefs.needs.includes(need);
            return (
              <button
                key={need}
                type="button"
                aria-pressed={selected}
                onClick={() => toggleNeed(need)}
                className={`smooth inline-flex items-center gap-1.5 rounded-full border border-ink px-3.5 py-1.5 text-sm font-bold ${
                  selected ? 'bg-ink text-card' : 'bg-card hover:bg-sun'
                }`}
              >
                <Icon size={15} strokeWidth={2.2} aria-hidden="true" />
                {label}
              </button>
            );
          })}
        </div>
      </fieldset>
    </div>
  );
}
