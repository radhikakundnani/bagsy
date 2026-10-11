import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlarmClock, Luggage, Plus } from 'lucide-react';
import Layout from '../components/Layout';
import TripCard from '../components/TripCard';
import { Alert, Button, IconBadge, Spinner, Title } from '../components/ui';
import { useAuth } from '../context/AuthContext';
import API from '../api/axios';

export default function Dashboard() {
  const [trips, setTrips] = useState([]);
  const [reminders, setReminders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    Promise.all([API.get('/trips'), API.get('/reminders').catch(() => ({ data: { data: [] } }))])
      .then(([tripsRes, remindersRes]) => {
        setTrips(tripsRes.data.data);
        setReminders(remindersRes.data.data || []);
      })
      .catch((err) => setError(err.response?.data?.message || "We couldn't load your trips."))
      .finally(() => setLoading(false));
  }, []);

  const firstName = user?.name?.split(' ')[0];
  const whenText = (days) => (days <= 0 ? 'today' : days === 1 ? 'tomorrow' : `in ${days} days`);
  const now = new Date();
  const upcoming = trips.filter((t) => new Date(t.endDate) >= now);
  const past = trips.filter((t) => new Date(t.endDate) < now).reverse();

  return (
    <Layout wide>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          {firstName && <p className="mb-2 font-medium text-muted">Hey {firstName}</p>}
          <Title accent="trips">Your</Title>
        </div>
        <Button variant="tomato" onClick={() => navigate('/create-trip')}>
          <Plus size={16} strokeWidth={2.6} aria-hidden="true" /> New trip
        </Button>
      </div>

      {reminders.length > 0 && (
        <div className="mt-10 flex flex-col gap-4">
          {reminders.map((r) => (
            <div key={r.trip._id} className="flex flex-wrap items-center gap-4 rounded-2xl border-2 border-ink bg-sun p-6">
              <IconBadge icon={AlarmClock} />
              <div className="min-w-0 flex-1">
                <p className="font-bold">
                  {r.trip.destination} starts {whenText(r.daysUntilTrip)}
                </p>
                <p className="text-sm text-muted">
                  {r.unpackedCount} {r.unpackedCount === 1 ? 'thing' : 'things'} still to pack
                </p>
              </div>
              <Button variant="ink" size="sm" onClick={() => navigate(`/trips/${r.trip._id}/packing`)}>
                Review list
              </Button>
            </div>
          ))}
        </div>
      )}

      {error && (
        <div className="mt-10">
          <Alert>{error}</Alert>
        </div>
      )}

      {loading ? (
        <Spinner label="Loading trips" />
      ) : trips.length === 0 ? (
        <div className="mt-10 flex flex-col items-center rounded-2xl border-2 border-dashed border-ink bg-card p-6 py-16 text-center">
          <IconBadge icon={Luggage} tint="bg-sun" size="lg" />
          <h2 className="font-display mt-6 text-3xl">Nothing packed yet</h2>
          <p className="mt-2 max-w-sm text-muted">Add your first trip and Bagsy will build the list for you.</p>
          <Button variant="ink" size="lg" className="mt-6" onClick={() => navigate('/create-trip')}>
            Plan a trip
          </Button>
        </div>
      ) : (
        <>
          {upcoming.length > 0 && (
            <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {upcoming.map((trip) => (
                <TripCard key={trip._id} trip={trip} />
              ))}
            </div>
          )}
          {past.length > 0 && (
            <>
              <h2 className="eyebrow mt-10">Past trips</h2>
              <div className="mt-4 grid grid-cols-1 gap-6 opacity-80 sm:grid-cols-2 lg:grid-cols-3">
                {past.map((trip) => (
                  <TripCard key={trip._id} trip={trip} />
                ))}
              </div>
            </>
          )}
        </>
      )}
    </Layout>
  );
}
