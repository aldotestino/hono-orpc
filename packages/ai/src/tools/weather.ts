import { tool } from 'ai';
import { z } from 'zod/v4';

// Weather data types
interface WeatherData {
  location: string;
  country: string;
  temperature: number;
  feelsLike: number;
  description: string;
  humidity: number;
  windSpeed: number;
  windDirection: number;
  pressure: number;
  visibility: number;
  cloudiness: number;
  sunrise: string;
  sunset: string;
}

interface ForecastItem {
  datetime: string;
  temperature: number;
  feelsLike: number;
  description: string;
  humidity: number;
  windSpeed: number;
  precipitation: number;
  cloudiness: number;
}

interface ForecastData {
  location: string;
  country: string;
  forecast: ForecastItem[];
}

const API_BASE_URL = 'https://api.openweathermap.org/data/2.5';

const getApiKey = (): string => {
  const apiKey = process.env.WEATHER_SERVICE_API_KEY;
  if (!apiKey) {
    throw new Error('WEATHER_SERVICE_API_KEY environment variable is not set');
  }
  return apiKey;
};

const formatTemperature = (temp: number): number => {
  return Math.round(temp);
};

const formatTime = (timestamp: number): string => {
  return new Date(timestamp * 1000).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });
};

const formatDateTime = (timestamp: number): string => {
  return new Date(timestamp * 1000).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });
};

export const getCurrentWeather = tool({
  description: 'Get current weather information for a specific city or location. Provides temperature, conditions, humidity, wind, and other weather details.',
  inputSchema: z.object({
    location: z.string().describe('The city name, optionally with country code (e.g., "London", "New York, US", "Paris, FR")'),
  }),
  execute: async ({ location }) => {
    const apiKey = getApiKey();
    
    try {
      const response = await fetch(
        `${API_BASE_URL}/weather?q=${encodeURIComponent(location)}&appid=${apiKey}&units=metric`
      );
      
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error(`Location "${location}" not found. Please check the spelling and try again.`);
        }
        if (response.status === 401) {
          throw new Error('Invalid API key. Please check your WEATHER_SERVICE_API_KEY environment variable.');
        }
        throw new Error(`Weather service error: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      
      return {
        location: data.name,
        country: data.sys.country,
        temperature: formatTemperature(data.main.temp),
        feelsLike: formatTemperature(data.main.feels_like),
        description: data.weather[0].description,
        humidity: data.main.humidity,
        windSpeed: Math.round(data.wind.speed * 3.6), // Convert m/s to km/h
        windDirection: data.wind.deg || 0,
        pressure: data.main.pressure,
        visibility: Math.round(data.visibility / 1000), // Convert m to km
        cloudiness: data.clouds.all,
        sunrise: formatTime(data.sys.sunrise),
        sunset: formatTime(data.sys.sunset),
      };
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Failed to fetch weather data. Please try again later.');
    }
  },
});

export const getWeatherForecast = tool({
  description: 'Get weather forecast for a specific city or location. Provides 5-day forecast with 3-hour intervals including temperature, conditions, and precipitation.',
  inputSchema: z.object({
    location: z.string().describe('The city name, optionally with country code (e.g., "London", "New York, US", "Paris, FR")'),
    days: z.number().optional().default(3).describe('Number of forecast days to return (1-5, default: 3)'),
  }),
  execute: async ({ location, days = 3 }) => {
    const apiKey = getApiKey();
    
    try {
      const response = await fetch(
        `${API_BASE_URL}/forecast?q=${encodeURIComponent(location)}&appid=${apiKey}&units=metric`
      );
      
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error(`Location "${location}" not found. Please check the spelling and try again.`);
        }
        if (response.status === 401) {
          throw new Error('Invalid API key. Please check your WEATHER_SERVICE_API_KEY environment variable.');
        }
        throw new Error(`Weather service error: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      
      // Filter forecast items based on requested days
      const maxTimestamp = Date.now() + (days * 24 * 60 * 60 * 1000);
      const filteredList = data.list.filter((item: any) => 
        item.dt * 1000 <= maxTimestamp
      );
      
      const forecast: ForecastItem[] = filteredList.map((item: any) => ({
        datetime: formatDateTime(item.dt),
        temperature: formatTemperature(item.main.temp),
        feelsLike: formatTemperature(item.main.feels_like),
        description: item.weather[0].description,
        humidity: item.main.humidity,
        windSpeed: Math.round(item.wind.speed * 3.6), // Convert m/s to km/h
        precipitation: Math.round((item.rain?.['3h'] || 0) * 10) / 10, // mm
        cloudiness: item.clouds.all,
      }));
      
      return {
        location: data.city.name,
        country: data.city.country,
        forecast,
      };
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Failed to fetch weather forecast. Please try again later.');
    }
  },
});