// Turns the server's weather `source` into words people understand.
// Trips saved before this feature have no source; they used today's weather.
export const weatherSourceLabel = (weather) => {
  switch (weather?.source) {
    case 'forecast':
      return 'Forecast';
    case 'typical':
      return 'Typical for these dates';
    default:
      return "Today's weather";
  }
};

// Pick an emoji from the main condition, falling back to the description.
export const weatherEmoji = (weather) => {
  const text = `${weather?.weatherMain || ''} ${weather?.description || ''}`.toLowerCase();
  if (!text.trim()) return '🌍';
  if (text.includes('thunder') || text.includes('storm')) return '⛈️';
  if (text.includes('snow')) return '❄️';
  if (text.includes('rain') || text.includes('drizzle')) return '🌧️';
  if (text.includes('cloud')) return '☁️';
  if (text.includes('mist') || text.includes('fog') || text.includes('haze')) return '🌫️';
  if (text.includes('clear') || text.includes('sun') || text.includes('dry')) return '☀️';
  return '🌤️';
};
