import { useState } from 'react';
import { Globe, Search } from 'lucide-react';
import Layout from '../components/Layout';
import { Alert, Button, Card, IconBadge, Title, inputClass } from '../components/ui';
import { weatherIcon } from '../utils/weatherLabels';
import API from '../api/axios';

export default function Weather() {
  const [city, setCity] = useState('');
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!city.trim()) return;
    setError('');
    setWeather(null);
    setLoading(true);
    try {
      const res = await API.get(`/weather?city=${encodeURIComponent(city.trim())}`);
      setWeather(res.data.data);
    } catch (err) {
      setError(err.response?.data?.message || "We couldn't find that city. Try another spelling.");
    } finally {
      setLoading(false);
    }
  };

  const stats = weather
    ? [
        ['Feels like', weather.feelsLike != null ? `${Math.round(weather.feelsLike)}°` : '—'],
        ['Humidity', `${weather.humidity}%`],
        ['Wind', weather.windSpeed != null ? `${Math.round(weather.windSpeed)} m/s` : '—'],
      ]
    : [];

  return (
    <Layout>
      <Title accent="now?">What's it like there</Title>
      <p className="mt-4 text-muted">Today's weather anywhere. Your trips get the forecast for their own dates.</p>

      <form onSubmit={handleSearch} className="mt-10 flex flex-col gap-3 sm:flex-row">
        <label htmlFor="w-city" className="sr-only">
          City
        </label>
        <input id="w-city" type="text" value={city} onChange={(e) => setCity(e.target.value)} placeholder="Try Goa, Paris or Tokyo" className={`${inputClass} text-lg sm:flex-1`} />
        <Button type="submit" size="lg" disabled={loading || !city.trim()}>
          <Search size={18} strokeWidth={2.4} aria-hidden="true" />
          {loading ? 'Looking…' : 'Check'}
        </Button>
      </form>

      {error && (
        <div className="mt-6">
          <Alert>{error}</Alert>
        </div>
      )}

      {weather && (
        <Card className="animate-pop-in mt-10 sm:p-8">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="font-display text-4xl capitalize">{weather.city}</h2>
              <p className="mt-1 font-medium first-letter:uppercase">{weather.description}</p>
            </div>
            <IconBadge icon={weatherIcon(weather)} tint="bg-sky" size="lg" />
          </div>
          <p className="font-display mt-6 text-7xl">{Math.round(weather.temp)}°</p>
          <dl className="mt-6 grid grid-cols-3 border-t-2 border-ink pt-4 text-center">
            {stats.map(([label, value]) => (
              <div key={label}>
                <dt className="eyebrow">{label}</dt>
                <dd className="font-display mt-1 text-2xl tabular-nums">{value}</dd>
              </div>
            ))}
          </dl>
        </Card>
      )}

      {!weather && !loading && !error && (
        <div className="mt-16 flex flex-col items-center text-center text-muted">
          <IconBadge icon={Globe} tint="bg-sky" size="lg" />
          <p className="mt-4">Type a city to see what it's doing right now.</p>
        </div>
      )}
    </Layout>
  );
}
