import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { UsersRound } from 'lucide-react';
import Layout from '../components/Layout';
import { Alert, Button, Card, IconBadge, Spinner } from '../components/ui';
import { formatDate, tripTypeMeta } from '../utils/tripMeta';
import API from '../api/axios';

// Opened from an invite link: /join/<code>
export default function JoinTrip() {
  const { code } = useParams();
  const navigate = useNavigate();
  const [invite, setInvite] = useState(null);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    API.get(`/trips/join/${code}`)
      .then((res) => setInvite(res.data.data))
      .catch((err) => setError(err.response?.data?.message || 'This invite link is invalid.'))
      .finally(() => setLoading(false));
  }, [code]);

  const join = async () => {
    setJoining(true);
    try {
      const res = await API.post(`/trips/join/${code}`);
      navigate(`/trips/${res.data.data.tripId}`, { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || "We couldn't add you to this trip.");
      setJoining(false);
    }
  };

  return (
    <Layout>
      {loading ? (
        <Spinner label="Loading invite" />
      ) : error ? (
        <Alert>{error}</Alert>
      ) : (
        <Card className="mx-auto max-w-lg text-center sm:p-8">
          <div className="flex justify-center">
            <IconBadge icon={UsersRound} tint="bg-lilac" size="lg" />
          </div>
          <p className="eyebrow mt-6">{invite.invitedBy} invited you</p>
          <h1 className="font-display mt-2 text-4xl">{invite.destination}</h1>
          <p className="mt-2 text-muted">
            {formatDate(invite.startDate, { day: 'numeric', month: 'short' })} – {formatDate(invite.endDate)} ·{' '}
            {tripTypeMeta(invite.tripType).label} · {invite.memberCount} {invite.memberCount === 1 ? 'person' : 'people'} so far
          </p>
          <p className="mt-6 text-sm text-muted">You'll get your own packing list for this trip. The trip admin will be able to see it.</p>
          <Button variant="tomato" size="lg" className="mt-6 w-full" onClick={join} disabled={joining}>
            {joining ? 'Joining…' : 'Join the trip'}
          </Button>
        </Card>
      )}
    </Layout>
  );
}
