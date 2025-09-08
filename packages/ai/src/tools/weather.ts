import { tool } from 'ai';
import { z } from 'zod/v4';
import { format } from 'date-fns';

const API_BASE_URL = 'https://api.openweathermap.org/data/2.5';
const GEO_API_URL = 'http://api.openweathermap.org/geo/1.0';

const getApiKey = () => process.env.WEATHER_SERVICE_API_KEY!;

const geocodeLocation = async (location: string) => {
  const response = await fetch(
    `${GEO_API_URL}/direct?q=${encodeURIComponent(location)}&limit=1&appid=${getApiKey()}`
  );
  const data = await response.json();
  return data[0];
};

export const getCurrentWeather = tool({
  description: 'Get current weather information for a city.',
  inputSchema: z.object({
    location: z.string().describe('City name (e.g., "London", "New York, US")'),
  }),
  execute: async ({ location }) => {
    const geo = await geocodeLocation(location);
    const response = await fetch(
      `${API_BASE_URL}/weather?lat=${geo.lat}&lon=${geo.lon}&appid=${getApiKey()}&units=metric`
    );
    const data = await response.json();
    
    return {
      location: geo.name,
      temperature: Math.round(data.main.temp),
      description: data.weather[0].description,
      humidity: data.main.humidity,
      windSpeed: Math.round(data.wind.speed * 3.6)
    };
  },
});

export const getWeatherForecast = tool({
  description: 'Get weather forecast for a city.',
  inputSchema: z.object({
    location: z.string().describe('City name (e.g., "London", "New York, US")'),
    days: z.number().optional().default(3).describe('Number of forecast days (1-5, default: 3)'),
  }),
  execute: async ({ location, days = 3 }) => {
    const geo = await geocodeLocation(location);
    const response = await fetch(
      `${API_BASE_URL}/forecast?lat=${geo.lat}&lon=${geo.lon}&appid=${getApiKey()}&units=metric`
    );
    const data = await response.json();
    
    const maxTimestamp = Date.now() + (days * 24 * 60 * 60 * 1000);
    const forecast = data.list
      .filter((item: any) => item.dt * 1000 <= maxTimestamp)
      .map((item: any) => ({
        datetime: format(new Date(item.dt * 1000), 'EEE MMM d, h:mm a'),
        temperature: Math.round(item.main.temp),
        description: item.weather[0].description,
        humidity: item.main.humidity,
        windSpeed: Math.round(item.wind.speed * 3.6)
      }));
    
    return {
      location: geo.name,
      forecast
    };
  },
});