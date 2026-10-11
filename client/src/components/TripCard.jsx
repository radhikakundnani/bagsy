import { useNavigate } from 'react-router-dom';
import { UsersRound } from 'lucide-react';
import { ProgressBar } from './ui';
import { weatherIcon } from '../utils/weatherLabels';
import { formatDate, tripLength, tripTypeMeta } from '../utils/tripMeta';

// A trip, with a colour strip for its type and how much of my list is packed
export default function TripCard({ trip }) {
  const navigate = useNavigate();
  const type = tripTypeMeta(trip.tripType);
  const TypeIcon = type.icon;
  const WeatherIcon = weatherIcon(trip.weather);
  const days = tripLength(trip.startDate, trip.endDate);
  const { packed = 0, total = 0 } = trip.progress || {};
  const pct = total ? Math.round((packed / total) * 100) : 0;

  return (
    <button
      type="button"
      onClick={() => navigate(`/trips/${trip._id}`)}
      className="lift flex w-full flex-col overflow-hidden rounded-2xl border border-ink bg-card text-left shadow-pop"
    >
      <span className={`h-2 w-full border-b border-ink ${type.accent}`} aria-hidden="true" />
      <span className="flex flex-col gap-4 p-6">
        <span className="flex items-center justify-between gap-3">
          <span className="eyebrow inline-flex items-center gap-1.5">
            <TypeIcon size={14} strokeWidth={2.2} aria-hidden="true" />
            {type.label}
            {trip.mode === 'group' && (
              <span className="ml-1 inline-flex items-center gap-1 rounded-full border border-ink px-1.5 py-px text-ink normal-case tracking-normal">
                <UsersRound size={12} strokeWidth={2.4} aria-hidden="true" />
                {trip.memberCount}
              </span>
            )}
          </span>
          {trip.weather?.temp != null && (
            <span className="inline-flex items-center gap-1.5 text-sm font-bold">
              <WeatherIcon size={16} strokeWidth={2.2} aria-hidden="true" />
              {Math.round(trip.weather.temp)}°
            </span>
          )}
        </span>

        <span>
          <span className="font-display block break-words text-2xl">{trip.destination}</span>
          <span className="mt-1 block text-sm text-muted">
            {formatDate(trip.startDate, { day: 'numeric', month: 'short' })} – {formatDate(trip.endDate)} · {days}{' '}
            {days === 1 ? 'day' : 'days'}
          </span>
        </span>

        <span className="flex flex-col gap-2">
          <span className="flex justify-between text-sm">
            <span className="font-bold">{total && packed === total ? 'All packed' : `${packed} of ${total} packed`}</span>
            <span className="text-muted tabular-nums">{pct}%</span>
          </span>
          <ProgressBar packed={packed} total={total} />
        </span>
      </span>
    </button>
  );
}
