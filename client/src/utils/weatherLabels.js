import { Cloud, CloudDrizzle, CloudFog, CloudLightning, CloudRain, CloudSnow, CloudSun, Sun } from 'lucide-react';

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

// Pick a line icon from the main condition, falling back to the description.
export const weatherIcon = (weather) => {
  const text = `${weather?.weatherMain || ''} ${weather?.description || ''}`.toLowerCase();
  if (text.includes('thunder') || text.includes('storm')) return CloudLightning;
  if (text.includes('snow')) return CloudSnow;
  if (text.includes('drizzle')) return CloudDrizzle;
  if (text.includes('rain')) return CloudRain;
  if (text.includes('mist') || text.includes('fog') || text.includes('haze')) return CloudFog;
  if (text.includes('cloud')) return Cloud;
  if (text.includes('clear') || text.includes('sun') || text.includes('dry')) return Sun;
  return CloudSun;
};
