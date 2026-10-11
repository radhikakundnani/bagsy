import { weatherEmoji, weatherSourceLabel } from '../utils/weatherLabels';

export default function WeatherCard({ weather }) {
  if (!weather) {
    return (
      <div className="bg-white rounded-xl p-5 border border-beige-dark/50">
        <p className="text-brown/50 text-sm">Weather data unavailable</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl p-5 border border-beige-dark/50">
      <h3 className="text-xs font-semibold text-brown/50 uppercase tracking-wider mb-3">
        {weatherSourceLabel(weather)}
      </h3>
      <div className="flex items-center gap-4">
        <span className="text-4xl">{weatherEmoji(weather)}</span>
        <div>
          <p className="text-3xl font-bold text-brown">
            {weather.temp != null ? `${Math.round(weather.temp)}°C` : 'N/A'}
          </p>
          <p className="text-brown/60 text-sm first-letter:uppercase">{weather.description || 'Unknown'}</p>
          {weather.tempMin != null && weather.tempMax != null && (
            <p className="text-brown/50 text-xs mt-0.5">
              Low {Math.round(weather.tempMin)}°C · High {Math.round(weather.tempMax)}°C
            </p>
          )}
        </div>
      </div>
      {weather.note && <p className="text-brown/50 text-xs mt-3">{weather.note}</p>}
      {weather.humidity != null && (
        <div className="mt-3 pt-3 border-t border-beige-dark/30">
          <div className="flex items-center gap-2 text-sm text-brown/60">
            <span>💧</span>
            <span>Humidity: {weather.humidity}%</span>
          </div>
        </div>
      )}
    </div>
  );
}
