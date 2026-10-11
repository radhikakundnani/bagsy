import { Card, IconBadge } from './ui';
import { weatherIcon, weatherSourceLabel } from '../utils/weatherLabels';

export default function WeatherCard({ weather }) {
  if (!weather) {
    return (
      <Card shadow={false}>
        <p className="eyebrow">Weather</p>
        <p className="mt-3 text-sm text-muted">We couldn't get weather for this trip.</p>
      </Card>
    );
  }

  const stats = [
    ['Low', weather.tempMin != null ? `${Math.round(weather.tempMin)}°` : '—'],
    ['High', weather.tempMax != null ? `${Math.round(weather.tempMax)}°` : '—'],
    ['Humidity', weather.humidity != null ? `${weather.humidity}%` : '—'],
  ];

  return (
    <Card shadow={false}>
      <div className="flex items-start justify-between gap-3">
        <p className="eyebrow">{weatherSourceLabel(weather)}</p>
        <IconBadge icon={weatherIcon(weather)} tint="bg-sky" />
      </div>
      <p className="font-display text-5xl">{weather.temp != null ? `${Math.round(weather.temp)}°` : '—'}</p>
      <p className="mt-1 font-medium first-letter:uppercase">{weather.description || 'Unknown'}</p>
      <dl className="mt-6 grid grid-cols-3 border-t border-ink pt-4 text-center">
        {stats.map(([label, value]) => (
          <div key={label}>
            <dt className="eyebrow">{label}</dt>
            <dd className="font-display mt-1 text-xl tabular-nums">{value}</dd>
          </div>
        ))}
      </dl>
      {weather.note && <p className="mt-4 text-xs text-muted">{weather.note}</p>}
    </Card>
  );
}
