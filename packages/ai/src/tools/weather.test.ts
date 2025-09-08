import { test, expect, mock } from 'bun:test';
import { getCurrentWeather, getWeatherForecast } from './weather';

// Mock the environment variable
process.env.WEATHER_SERVICE_API_KEY = 'test-api-key';

// Mock fetch for testing
const mockFetch = mock();
global.fetch = mockFetch;

test('getCurrentWeather - successful response', async () => {
  const mockWeatherData = {
    name: 'London',
    sys: { country: 'GB', sunrise: 1609459200, sunset: 1609495200 },
    main: {
      temp: 15.5,
      feels_like: 14.2,
      humidity: 80,
      pressure: 1013
    },
    weather: [{ description: 'clear sky' }],
    wind: { speed: 3.5, deg: 270 },
    clouds: { all: 20 },
    visibility: 10000
  };

  mockFetch.mockResolvedValueOnce({
    ok: true,
    json: () => Promise.resolve(mockWeatherData)
  });

  const result = await getCurrentWeather.execute({ location: 'London' });

  expect(result).toEqual({
    location: 'London',
    country: 'GB',
    temperature: 16,
    feelsLike: 14,
    description: 'clear sky',
    humidity: 80,
    windSpeed: 13, // 3.5 m/s * 3.6 = 12.6, rounded to 13
    windDirection: 270,
    pressure: 1013,
    visibility: 10,
    cloudiness: 20,
    sunrise: expect.any(String),
    sunset: expect.any(String)
  });
});

test('getCurrentWeather - location not found', async () => {
  mockFetch.mockResolvedValueOnce({
    ok: false,
    status: 404,
    statusText: 'Not Found'
  });

  await expect(getCurrentWeather.execute({ location: 'InvalidCity' }))
    .rejects.toThrow('Location "InvalidCity" not found');
});

test('getWeatherForecast - successful response', async () => {
  const mockForecastData = {
    city: { name: 'Paris', country: 'FR' },
    list: [
      {
        dt: Date.now() / 1000 + 3600, // 1 hour from now
        main: { temp: 18.5, feels_like: 17.2, humidity: 75 },
        weather: [{ description: 'partly cloudy' }],
        wind: { speed: 2.8 },
        rain: { '3h': 0.5 },
        clouds: { all: 40 }
      },
      {
        dt: Date.now() / 1000 + 7200, // 2 hours from now
        main: { temp: 20.1, feels_like: 19.8, humidity: 70 },
        weather: [{ description: 'sunny' }],
        wind: { speed: 3.2 },
        rain: {},
        clouds: { all: 10 }
      }
    ]
  };

  mockFetch.mockResolvedValueOnce({
    ok: true,
    json: () => Promise.resolve(mockForecastData)
  });

  const result = await getWeatherForecast.execute({ location: 'Paris', days: 1 });

  expect(result.location).toBe('Paris');
  expect(result.country).toBe('FR');
  expect(result.forecast).toHaveLength(2);
  expect(result.forecast[0]).toEqual({
    datetime: expect.any(String),
    temperature: 19,
    feelsLike: 17,
    description: 'partly cloudy',
    humidity: 75,
    windSpeed: 10, // 2.8 m/s * 3.6 = 10.08, rounded to 10
    precipitation: 0.5,
    cloudiness: 40
  });
});

test('getCurrentWeather - missing API key', async () => {
  const originalApiKey = process.env.WEATHER_SERVICE_API_KEY;
  delete process.env.WEATHER_SERVICE_API_KEY;

  await expect(getCurrentWeather.execute({ location: 'London' }))
    .rejects.toThrow('WEATHER_SERVICE_API_KEY environment variable is not set');

  // Restore the API key
  process.env.WEATHER_SERVICE_API_KEY = originalApiKey;
});