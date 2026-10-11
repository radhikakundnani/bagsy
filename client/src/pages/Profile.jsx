import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { ArrowRight, UsersRound } from 'lucide-react';
import { Alert, Button, Card, Spinner, Title, Toast, inputClass } from '../components/ui';
import { formatDate, tripTypeMeta } from '../utils/tripMeta';
import { weatherIcon } from '../utils/weatherLabels';
import API from '../api/axios';

export default function Profile() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState('');
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    API.get('/profile')
      .then((res) => {
        setProfile(res.data.data);
        setEditName(res.data.data.user.name);
      })
      .catch((err) => setError(err.response?.data?.message || "We couldn't load your profile."))
      .finally(() => setLoading(false));
  }, []);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 2500);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!editName.trim()) return;
    setSaving(true);
    try {
      const res = await API.put('/profile', { name: editName.trim() });
      setProfile((prev) => ({ ...prev, user: { ...prev.user, name: res.data.data.name } }));
      setEditing(false);
      showToast('Name updated');
    } catch (err) {
      showToast(err.response?.data?.message || "Couldn't save your name.", 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <Spinner label="Loading profile" />
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <Alert>{error}</Alert>
      </Layout>
    );
  }

  const { user, stats, tripHistory } = profile;
  const now = new Date();

  return (
    <Layout>
      <Toast toast={toast} />
      <Title accent="you">Hello,</Title>

      {/* Name card */}
      <Card className="mt-10 flex flex-col gap-6 sm:flex-row sm:items-center">
        <span
          className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full border-2 border-ink bg-tomato font-display text-3xl text-card"
          aria-hidden="true"
        >
          {user.name.charAt(0).toUpperCase()}
        </span>
        <div className="min-w-0 flex-1">
          {editing ? (
            <form onSubmit={handleSave} className="flex flex-col gap-3 sm:flex-row">
              <label htmlFor="pf-name" className="sr-only">
                Your name
              </label>
              <input id="pf-name" value={editName} onChange={(e) => setEditName(e.target.value)} className={`${inputClass} sm:flex-1`} autoFocus />
              <div className="flex gap-2">
                <Button type="submit" variant="ink" disabled={saving || !editName.trim()}>
                  {saving ? 'Saving…' : 'Save'}
                </Button>
                <Button
                  variant="paper"
                  onClick={() => {
                    setEditing(false);
                    setEditName(user.name);
                  }}
                >
                  Cancel
                </Button>
              </div>
            </form>
          ) : (
            <div className="flex flex-wrap items-center gap-3">
              <h2 className="font-display break-words text-3xl">{user.name}</h2>
              <button
                type="button"
                onClick={() => setEditing(true)}
                className="smooth rounded-full border-2 border-ink px-3 py-0.5 text-xs font-bold hover:bg-sun"
              >
                Edit
              </button>
            </div>
          )}
          <p className="mt-1 break-all text-muted">{user.email}</p>
          <p className="mt-1 text-sm text-muted">Packing with Bagsy since {formatDate(user.createdAt, { month: 'long', year: 'numeric' })}</p>
        </div>
      </Card>

      {/* Stats */}
      <div className="mt-6 grid grid-cols-3 gap-3 sm:gap-6">
        {[
          ['Trips', stats.totalTrips, 'bg-sun'],
          ['Coming up', stats.upcomingTrips, 'bg-lime'],
          ['Done', stats.completedTrips, 'bg-lilac'],
        ].map(([label, value, tint]) => (
          <div key={label} className={`rounded-2xl border-2 border-ink p-4 text-center sm:p-6 ${tint}`}>
            <p className="font-display text-4xl tabular-nums sm:text-5xl">{value}</p>
            <p className="eyebrow mt-2 text-ink">{label}</p>
          </div>
        ))}
      </div>

      {/* History */}
      <h2 className="font-display mt-10 text-3xl">Every trip so far</h2>
      {tripHistory.length === 0 ? (
        <div className="mt-6 rounded-2xl border-2 border-dashed border-ink bg-card p-6 text-center">
          <p className="text-muted">No trips yet.</p>
          <Button variant="ink" className="mt-4" onClick={() => navigate('/create-trip')}>
            Plan your first one
          </Button>
        </div>
      ) : (
        <ul className="mt-6 flex flex-col gap-3">
          {tripHistory.map((trip) => {
            const start = new Date(trip.startDate);
            const end = new Date(trip.endDate);
            const status = end < now ? { label: 'Done', style: 'bg-paper' } : start <= now ? { label: 'Happening now', style: 'bg-lime' } : null;
            const WIcon = weatherIcon(trip.weather);
            const type = tripTypeMeta(trip.tripType);
            return (
              <li key={trip._id}>
                <button
                  type="button"
                  onClick={() => navigate(`/trips/${trip._id}`)}
                  className="lift flex w-full items-center gap-4 rounded-2xl border-2 border-ink bg-card p-4 text-left"
                >
                  <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full border-2 border-ink ${type.tint}`} aria-hidden="true">
                    <WIcon size={20} strokeWidth={2.2} />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center gap-1.5 truncate font-bold">
                      {trip.destination}
                      {trip.mode === 'group' && <UsersRound size={14} strokeWidth={2.4} aria-label="Group trip" />}
                    </span>
                    <span className="block text-sm text-muted">
                      {formatDate(trip.startDate)} – {formatDate(trip.endDate)}
                    </span>
                  </span>
                  {status && (
                    <span className={`hidden shrink-0 rounded-full border-2 border-ink px-2.5 py-0.5 text-xs font-bold sm:inline ${status.style}`}>
                      {status.label}
                    </span>
                  )}
                  <ArrowRight size={18} strokeWidth={2.4} aria-hidden="true" />
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </Layout>
  );
}
