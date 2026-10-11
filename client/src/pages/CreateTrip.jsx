import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Check, Sparkles, User, UsersRound } from 'lucide-react';
import Layout from '../components/Layout';
import { Alert, Button, Card, Field, Title, inputClass } from '../components/ui';
import { ACTIVITIES, OCCASIONS, TRIP_TYPES } from '../utils/tripMeta';
import PackingPrefsFields from '../components/PackingPrefsFields';
import API from '../api/axios';

const POPULAR_DESTINATIONS = [
  'Goa, India', 'Mumbai, India', 'Jaipur, India', 'Manali, India', 'Paris, France', 'London, UK',
  'New York City, USA', 'Tokyo, Japan', 'Rome, Italy', 'Dubai, UAE', 'Bali, Indonesia',
  'Barcelona, Spain', 'Bangkok, Thailand', 'Toronto, Canada', 'Maldives',
];

const STEPS = ['Where & when', 'Who & what kind', 'Occasion', 'About you'];

const MODES = [
  { value: 'solo', label: 'Just me', icon: User, blurb: 'One list, all yours.' },
  { value: 'group', label: 'With others', icon: UsersRound, blurb: 'Invite family or friends with a link. Everyone gets their own list and you can check them.' },
];

// One selectable tile, used for "who" and "trip type"
function ChoiceTile({ selected, onClick, icon: Icon, label, blurb, tint }) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      onClick={onClick}
      className={`smooth flex items-start gap-4 rounded-xl border border-ink p-4 text-left ${
        selected ? `${tint} shadow-pop` : 'bg-card hover:bg-paper'
      }`}
    >
      <span className={`smooth mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-ink ${selected ? 'bg-card' : 'bg-paper'}`}>
        <Icon size={20} strokeWidth={2} aria-hidden="true" />
      </span>
      <span className="min-w-0">
        <span className="block font-bold">{label}</span>
        <span className="block text-sm text-muted">{blurb}</span>
      </span>
    </button>
  );
}

export default function CreateTrip() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [destination, setDestination] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [mode, setMode] = useState('solo');
  const [tripType, setTripType] = useState('');
  const [activities, setActivities] = useState([]);
  const [brief, setBrief] = useState('');
  const [occasions, setOccasions] = useState([]);
  const [prefs, setPrefs] = useState({ itemsFor: '', homeCountry: '', needs: [] });

  // Prefill "About you" from last time
  useEffect(() => {
    API.get('/profile')
      .then((res) => {
        const saved = res.data.data.user.packingProfile || {};
        setPrefs({ itemsFor: saved.itemsFor || '', homeCountry: saved.homeCountry || '', needs: saved.needs || [] });
      })
      .catch(() => {});
  }, []);

  const toggleOccasion = (value) => {
    setOccasions((prev) => (prev.includes(value) ? prev.filter((o) => o !== value) : [...prev, value]));
  };

  const isDateInvalid = startDate && endDate && new Date(endDate) <= new Date(startDate);

  const toggleActivity = (value) => {
    setActivities((prev) => (prev.includes(value) ? prev.filter((a) => a !== value) : [...prev, value]));
  };

  const handleSubmit = async () => {
    setError('');
    if (!destination || !startDate || !endDate) {
      setError('Add a destination and both dates first.');
      setStep(1);
      return;
    }

    setLoading(true);
    try {
      const res = await API.post('/trips', {
        destination,
        startDate,
        endDate,
        activities,
        occasions,
        tripType: tripType || 'leisure',
        mode,
        brief: brief.trim(),
        packingProfile: { ...prefs, itemsFor: prefs.itemsFor || undefined },
      });
      navigate(`/trips/${res.data.data.trip._id}`);
    } catch (err) {
      setError(err.response?.data?.message || "We couldn't create that trip. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <Title accent="trip">New</Title>

      <ol className="mt-6 flex flex-wrap gap-2" aria-label="Progress">
        {STEPS.map((label, i) => {
          const n = i + 1;
          const state = n < step ? 'done' : n === step ? 'current' : 'todo';
          return (
            <li
              key={label}
              aria-current={state === 'current' ? 'step' : undefined}
              className={`smooth inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-sm font-bold ${
                state === 'current' ? 'border-ink bg-ink text-card' : state === 'done' ? 'border-ink bg-lime' : 'border-ink/30 text-muted'
              }`}
            >
              {state === 'done' ? <Check size={14} strokeWidth={3} aria-hidden="true" /> : <span aria-hidden="true">{n}</span>}
              {label}
            </li>
          );
        })}
      </ol>

      {error && (
        <div className="mt-6">
          <Alert>{error}</Alert>
        </div>
      )}

      <Card className="mt-10 sm:p-8" key={step}>
        <div className="animate-page-in">
          {step === 1 && (
            <div className="flex flex-col gap-6">
              <Field label="Destination" htmlFor="ct-dest" hint="City name works best, e.g. “Goa, India”.">
                <input
                  id="ct-dest"
                  type="text"
                  list="destinations"
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  placeholder="Where are you headed?"
                  className={`${inputClass} text-lg`}
                />
                <datalist id="destinations">
                  {POPULAR_DESTINATIONS.map((city) => (
                    <option key={city} value={city} />
                  ))}
                </datalist>
              </Field>

              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <Field label="Leaving" htmlFor="ct-start">
                  <input id="ct-start" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className={inputClass} />
                </Field>
                <Field label="Coming back" htmlFor="ct-end">
                  <input
                    id="ct-end"
                    type="date"
                    min={startDate || undefined}
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className={`${inputClass} ${isDateInvalid ? 'bg-peach' : ''}`}
                  />
                </Field>
              </div>
              {isDateInvalid && <p className="-mt-3 text-sm font-bold text-tomato">You need to come back after you leave.</p>}

              <div className="flex justify-end">
                <Button onClick={() => setStep(2)} disabled={!destination || !startDate || !endDate || isDateInvalid}>
                  Next <ArrowRight size={16} strokeWidth={2.4} aria-hidden="true" />
                </Button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="flex flex-col gap-6">
              <div>
                <h2 className="font-bold">Who's packing?</h2>
                <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2" role="radiogroup" aria-label="Who's packing">
                  {MODES.map((m) => (
                    <ChoiceTile key={m.value} selected={mode === m.value} onClick={() => setMode(m.value)} icon={m.icon} label={m.label} blurb={m.blurb} tint="bg-sun" />
                  ))}
                </div>
              </div>

              <div>
                <h2 className="font-bold">What kind of trip?</h2>
                <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2" role="radiogroup" aria-label="Trip type">
                  {Object.entries(TRIP_TYPES).map(([value, t]) => (
                    <ChoiceTile key={value} selected={tripType === value} onClick={() => setTripType(value)} icon={t.icon} label={t.label} blurb={t.blurb} tint={t.tint} />
                  ))}
                </div>
              </div>

              <div className="flex justify-between gap-3">
                <Button variant="paper" onClick={() => setStep(1)}>
                  <ArrowLeft size={16} strokeWidth={2.4} aria-hidden="true" /> Back
                </Button>
                <Button onClick={() => setStep(3)} disabled={!tripType}>
                  Next <ArrowRight size={16} strokeWidth={2.4} aria-hidden="true" />
                </Button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="flex flex-col gap-8">
              <fieldset>
                <legend className="font-bold">What's the occasion?</legend>
                <p className="text-sm text-muted">Pick any that fit. This changes the list the most.</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {OCCASIONS.map(({ value, label, icon: Icon }) => {
                    const selected = occasions.includes(value);
                    return (
                      <button
                        key={value}
                        type="button"
                        aria-pressed={selected}
                        onClick={() => toggleOccasion(value)}
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

              <fieldset>
                <legend className="font-bold">What will you get up to?</legend>
                <p className="text-sm text-muted">Each one adds the right gear.</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {ACTIVITIES.map(({ value, label, icon: Icon }) => {
                    const selected = activities.includes(value);
                    return (
                      <button
                        key={value}
                        type="button"
                        aria-pressed={selected}
                        onClick={() => toggleActivity(value)}
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

              <div>
                <Field
                  label={
                    <>
                      Anything else? <span className="font-normal text-muted">(optional)</span>
                    </>
                  }
                  htmlFor="ct-brief"
                  hint="e.g. which events you're going to, or plans the options above don't cover."
                >
                  <textarea
                    id="ct-brief"
                    rows={2}
                    maxLength={300}
                    value={brief}
                    onChange={(e) => setBrief(e.target.value)}
                    placeholder="e.g. Cousin's wedding (sangeet + pheras), then 2 days trekking near Rishikesh"
                    className={`${inputClass} resize-y`}
                  />
                </Field>
                <p className="mt-2 flex items-center justify-between gap-3 text-xs text-muted">
                  <span className="inline-flex items-center gap-1.5">
                    <Sparkles size={14} strokeWidth={2.2} aria-hidden="true" /> AI suggestions by Google Gemini. Don't include anything private.
                  </span>
                  <span className="tabular-nums">{brief.length}/300</span>
                </p>
              </div>

              <div className="flex justify-between gap-3">
                <Button variant="paper" onClick={() => setStep(2)}>
                  <ArrowLeft size={16} strokeWidth={2.4} aria-hidden="true" /> Back
                </Button>
                <Button onClick={() => setStep(4)}>
                  Next <ArrowRight size={16} strokeWidth={2.4} aria-hidden="true" />
                </Button>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="flex flex-col gap-8">
              <PackingPrefsFields value={prefs} onChange={setPrefs} />
              <div className="flex flex-wrap justify-between gap-3">
                <Button variant="paper" onClick={() => setStep(3)}>
                  <ArrowLeft size={16} strokeWidth={2.4} aria-hidden="true" /> Back
                </Button>
                <Button variant="tomato" size="lg" onClick={handleSubmit} disabled={loading}>
                  <Sparkles size={18} strokeWidth={2.2} aria-hidden="true" />
                  {loading ? 'Making your list…' : 'Make my list'}
                </Button>
              </div>
            </div>
          )}
        </div>
      </Card>
    </Layout>
  );
}
