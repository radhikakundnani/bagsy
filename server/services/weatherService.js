const axios = require('axios');

const OWM = 'https://api.openweathermap.org/data/2.5';
const DAY_MS = 24 * 60 * 60 * 1000;
const FORECAST_DAYS = 5; // OpenWeatherMap's free forecast covers the next 5 days

const getApiKey = () => {
  const apiKey = process.env.WEATHER_API_KEY;
  if (!apiKey || apiKey === 'your_openweathermap_key_here') return null;
  return apiKey;
};

const cityFrom = (destination) => destination.split(',')[0].trim();
const average = (nums) => nums.reduce((sum, n) => sum + n, 0) / nums.length;
const toISODate = (d) => d.toISOString().slice(0, 10);

// ── Today's weather (used by the Weather page, and as a fallback) ─────────
const getWeather = async (destination) => {
  try {
    const apiKey = getApiKey();
    if (!apiKey) {
      console.warn('Weather API key not configured, skipping weather fetch');
      return null;
    }

    const { data } = await axios.get(`${OWM}/weather`, {
      params: { q: cityFrom(destination), appid: apiKey, units: 'metric' },
    });

    return {
      temp: data.main.temp,
      feelsLike: data.main.feels_like,
      tempMin: data.main.temp_min,
      tempMax: data.main.temp_max,
      humidity: data.main.humidity,
      description: data.weather[0].description,
      icon: data.weather[0].icon,
      windSpeed: data.wind?.speed || 0,
      weatherMain: data.weather[0].main, // "Rain", "Snow", "Clear", "Clouds", "Thunderstorm", etc.
      lat: data.coord.lat,
      lon: data.coord.lon,
    };
  } catch (error) {
    console.error(`Weather fetch failed for "${destination}": ${error.message}`);
    return null;
  }
};

// Pick the condition that matters most for packing.
// One rainy forecast slot is enough to pack an umbrella.
const mostImportantCondition = (conditions) => {
  const priority = ['Snow', 'Thunderstorm', 'Rain', 'Drizzle', 'Clouds', 'Clear'];
  return priority.find((c) => conditions.includes(c)) || conditions[0] || 'Clear';
};

// ── Forecast for trips starting within the next 5 days ───────────────────
// The free forecast gives one reading every 3 hours for 5 days.
// We keep only the readings that fall inside the trip and summarise them.
const getForecastForTrip = async (destination, start, end) => {
  const { data } = await axios.get(`${OWM}/forecast`, {
    params: { q: cityFrom(destination), appid: getApiKey(), units: 'metric' },
  });

  const tripEnd = new Date(end.getTime() + DAY_MS); // include the whole last day
  const slots = data.list.filter((s) => {
    const t = new Date(s.dt * 1000);
    return t >= start && t < tripEnd;
  });
  if (slots.length === 0) return null;

  const conditions = slots.map((s) => s.weather[0].main);
  const weatherMain = mostImportantCondition(conditions);
  const slot = slots.find((s) => s.weather[0].main === weatherMain);
  const coveredUntil = new Date(slots[slots.length - 1].dt * 1000);

  return {
    temp: average(slots.map((s) => s.main.temp)),
    feelsLike: average(slots.map((s) => s.main.feels_like)),
    tempMin: Math.min(...slots.map((s) => s.main.temp_min)),
    tempMax: Math.max(...slots.map((s) => s.main.temp_max)),
    humidity: Math.round(average(slots.map((s) => s.main.humidity))),
    windSpeed: Math.max(...slots.map((s) => s.wind?.speed || 0)),
    weatherMain,
    description: slot.weather[0].description,
    icon: slot.weather[0].icon,
    source: 'forecast',
    note: coveredUntil < end ? `Forecast covers up to ${toISODate(coveredUntil)}` : 'Forecast for your trip dates',
  };
};

// ── Typical weather for trips further away ───────────────────────────────
// Nobody can forecast months ahead, so we look at what the weather was on the
// same dates last year, using Open-Meteo's free historical API (no key needed).
const getTypicalForTrip = async (lat, lon, start, end) => {
  const lastYear = (d) => {
    const copy = new Date(d);
    copy.setUTCFullYear(copy.getUTCFullYear() - 1);
    return copy;
  };
  // Keep the request to at most 31 days
  const cappedEnd = new Date(Math.min(end.getTime(), start.getTime() + 30 * DAY_MS));
  let from = lastYear(start);
  let to = lastYear(cappedEnd);
  // Historical data lags a few days behind today; step back another year if needed
  if (to > new Date(Date.now() - 7 * DAY_MS)) {
    from = lastYear(from);
    to = lastYear(to);
  }

  const { data } = await axios.get('https://archive-api.open-meteo.com/v1/archive', {
    params: {
      latitude: lat,
      longitude: lon,
      start_date: toISODate(from),
      end_date: toISODate(to),
      daily: [
        'temperature_2m_mean',
        'temperature_2m_min',
        'temperature_2m_max',
        'rain_sum',
        'snowfall_sum',
        'wind_speed_10m_max',
        'relative_humidity_2m_mean',
      ].join(','),
      wind_speed_unit: 'ms',
      timezone: 'auto',
    },
  });

  const d = data.daily;
  const clean = (arr) => (arr || []).filter((n) => n != null);
  const temps = clean(d.temperature_2m_mean);
  if (temps.length === 0) return null;

  const days = temps.length;
  const rainyDays = clean(d.rain_sum).filter((mm) => mm >= 1).length;
  const snowyDays = clean(d.snowfall_sum).filter((cm) => cm > 0).length;
  const humidity = clean(d.relative_humidity_2m_mean);
  const wind = clean(d.wind_speed_10m_max);

  // Rain counts if it rained on at least 1 day in 4
  let weatherMain = 'Clear';
  let description = 'mostly dry';
  if (snowyDays > 0) {
    weatherMain = 'Snow';
    description = `snow on ${snowyDays} of ${days} days`;
  } else if (rainyDays / days >= 0.25) {
    weatherMain = 'Rain';
    description = `rain on ${rainyDays} of ${days} days`;
  } else if (rainyDays > 0) {
    weatherMain = 'Clouds';
    description = `mostly dry, rain on ${rainyDays} of ${days} days`;
  }

  return {
    temp: average(temps),
    feelsLike: null,
    tempMin: Math.min(...clean(d.temperature_2m_min)),
    tempMax: Math.max(...clean(d.temperature_2m_max)),
    humidity: humidity.length ? Math.round(average(humidity)) : null,
    windSpeed: wind.length ? average(wind) : 0,
    weatherMain,
    description,
    icon: null,
    source: 'typical',
    note: `Based on the same dates in ${from.getUTCFullYear()}`,
  };
};

// ── The one function trips use ───────────────────────────────────────────
// Picks the best weather we can honestly give for the trip's dates.
const getTripWeather = async (destination, startDate, endDate) => {
  const current = await getWeather(destination); // also tells us the city's coordinates
  if (!current) return null;

  const start = new Date(startDate);
  const end = new Date(endDate);
  const now = new Date();
  const daysAway = (start - now) / DAY_MS;

  const withoutCoords = ({ lat, lon, ...rest }) => rest;
  const fallback = {
    ...withoutCoords(current),
    source: 'current',
    note: "Today's weather (couldn't get weather for your trip dates)",
  };

  try {
    if (end < now) {
      return { ...withoutCoords(current), source: 'current', note: "Today's weather (this trip is in the past)" };
    }
    if (daysAway <= FORECAST_DAYS) {
      return (await getForecastForTrip(destination, start, end)) || fallback;
    }
    return (await getTypicalForTrip(current.lat, current.lon, start, end)) || fallback;
  } catch (error) {
    console.error(`Trip weather failed for "${destination}": ${error.message}`);
    return fallback;
  }
};

module.exports = { getWeather, getTripWeather };
