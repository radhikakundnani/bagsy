import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import Layout from '../components/Layout';
import WeatherCard from '../components/WeatherCard';
import CrewPanel from '../components/CrewPanel';
import { Alert, Button, Card, ProgressBar, Spinner, Toast } from '../components/ui';
import { activityMeta, formatDate, tripLength, tripTypeMeta } from '../utils/tripMeta';
import API from '../api/axios';

export default function TripDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [trip, setTrip] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleting, setDeleting] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    API.get(`/trips/${id}`)
      .then((res) => setTrip(res.data.data))
      .catch((err) => setError(err.response?.data?.message || "We couldn't load this trip."))
      .finally(() => setLoading(false));
  }, [id]);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 2500);
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await API.delete(`/trips/${id}`);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || "We couldn't delete this trip.");
      setDeleting(false);
      setConfirmingDelete(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <Spinner label="Loading trip" />
      </Layout>
    );
  }

  if (error && !trip) {
    return (
      <Layout>
        <Alert>{error}</Alert>
      </Layout>
    );
  }

  const type = tripTypeMeta(trip.tripType);
  const TypeIcon = type.icon;
  const days = tripLength(trip.startDate, trip.endDate);
  const { packed = 0, total = 0 } = trip.progress || {};
  const isAdmin = trip.myRole === 'admin';

  return (
    <Layout>
      <Toast toast={toast} />
      <Link to="/dashboard" className="smooth inline-flex items-center gap-1 text-sm font-bold underline decoration-2 underline-offset-4 hover:text-tomato">
        <ArrowLeft size={16} strokeWidth={2.4} aria-hidden="true" /> All trips
      </Link>

      <header className="mt-6">
        <p className="eyebrow flex items-center gap-1.5">
          <TypeIcon size={14} strokeWidth={2.2} aria-hidden="true" />
          {type.label} trip{trip.mode === 'group' ? ' · group' : ''}
        </p>
        <h1 className="font-display mt-2 break-words text-5xl sm:text-6xl">{trip.destination}</h1>
        <p className="mt-3 text-lg text-muted">
          {formatDate(trip.startDate, { weekday: 'short', day: 'numeric', month: 'long' })} –{' '}
          {formatDate(trip.endDate, { weekday: 'short', day: 'numeric', month: 'long', year: 'numeric' })} · {days}{' '}
          {days === 1 ? 'day' : 'days'}
        </p>
      </header>

      {error && (
        <div className="mt-6">
          <Alert>{error}</Alert>
        </div>
      )}

      {/* The list comes first */}
      <Card className="mt-10 flex flex-col items-start gap-6 sm:flex-row sm:items-center">
        <div className="w-full flex-1">
          <p className="eyebrow">Your packing list</p>
          <p className="font-display mt-2 text-3xl">
            {total && packed === total ? 'All packed' : `${packed} of ${total} packed`}
          </p>
          <ProgressBar packed={packed} total={total} className="mt-3 h-3" />
        </div>
        <Button variant="tomato" onClick={() => navigate(`/trips/${id}/packing`)}>
          Review list <ArrowRight size={16} strokeWidth={2.4} aria-hidden="true" />
        </Button>
      </Card>

      <div className="mt-6">
        <CrewPanel trip={trip} onTripChange={setTrip} showToast={showToast} />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2">
        <WeatherCard weather={trip.weather} />
        <Card shadow={false}>
          <p className="eyebrow">Plans</p>
          {trip.activities?.length > 0 ? (
            <div className="mt-4 flex flex-wrap gap-2">
              {trip.activities.map((value) => {
                const { label, icon: Icon } = activityMeta(value);
                return (
                  <span key={value} className="inline-flex items-center gap-1.5 rounded-full border-2 border-ink px-3 py-1 text-sm font-bold">
                    <Icon size={15} strokeWidth={2.2} aria-hidden="true" />
                    {label}
                  </span>
                );
              })}
            </div>
          ) : (
            <p className="mt-4 text-sm text-muted">No activities picked.</p>
          )}
        </Card>
      </div>

      {isAdmin && (
        <div className="mt-10 border-t-2 border-ink/20 pt-6">
          {confirmingDelete ? (
            <div className="flex flex-wrap items-center gap-3">
              <p className="font-bold">
                Delete this trip{trip.mode === 'group' ? ' and everyone’s lists' : ' and its packing list'} for good?
              </p>
              <Button variant="tomato" size="sm" onClick={handleDelete} disabled={deleting}>
                {deleting ? 'Deleting…' : 'Yes, delete'}
              </Button>
              <Button variant="paper" size="sm" onClick={() => setConfirmingDelete(false)}>
                Keep it
              </Button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setConfirmingDelete(true)}
              className="smooth text-sm font-bold text-muted underline decoration-2 underline-offset-4 hover:text-tomato"
            >
              Delete trip
            </button>
          )}
        </div>
      )}
    </Layout>
  );
}
