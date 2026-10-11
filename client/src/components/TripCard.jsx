import { weatherEmoji, weatherSourceLabel } from '../utils/weatherLabels';
import { useNavigate } from 'react-router-dom';

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export default function TripCard({ trip }) {
  const navigate = useNavigate();

  const duration = Math.ceil(
    (new Date(trip.endDate) - new Date(trip.startDate)) / (1000 * 60 * 60 * 24)
  );

  return (
    <div
      onClick={() => navigate(`/trips/${trip._id}`)}
      className="bg-white rounded-xl p-5 cursor-pointer hover:shadow-lg transition-all hover:-translate-y-0.5 border border-beige-dark/50"
    >
      <div className="flex items-start justify-between mb-3">
        <h3 className="font-serif text-xl font-semibold text-brown truncate pr-2">
          {trip.destination}
        </h3>
        <span className="text-2xl flex-shrink-0">
          {weatherEmoji(trip.weather)}
        </span>
      </div>

      <div className="flex items-center gap-2 text-brown/60 text-sm mb-2">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="3" y="4" width="18" height="18" rx="2" />
          <path d="M16 2v4M8 2v4M3 10h18" />
        </svg>
        <span>
          {formatDate(trip.startDate)} – {formatDate(trip.endDate)}
        </span>
      </div>

      <div className="flex items-center justify-between mt-3">
        <span className="inline-block px-3 py-1 bg-orange/10 text-orange text-xs font-medium rounded-full capitalize">
          {trip.tripType || 'leisure'}
        </span>
        <span className="text-brown/50 text-xs">{duration} days</span>
      </div>

      {trip.weather?.temp != null && (
        <div className="mt-3 pt-3 border-t border-beige-dark/30 flex items-center gap-2 text-sm text-brown/60">
          <span className="font-medium text-brown">{Math.round(trip.weather.temp)}°C</span>
          <span className="capitalize truncate">{trip.weather.description}</span>
          <span className="ml-auto text-xs text-brown/40 whitespace-nowrap">
            {weatherSourceLabel(trip.weather)}
          </span>
        </div>
      )}
    </div>
  );
}
