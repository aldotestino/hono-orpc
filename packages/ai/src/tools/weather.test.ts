import { test, expect, mock } from 'bun:test';
import { getCurrentWeather, getWeatherForecast } from './weather';

process.env.WEATHER_SERVICE_API_KEY = 'test-key';
const mockFetch = mock();
global.fetch = mockFetch;

test('getCurrentWeather works', async () => {
  mockFetch.mockResolvedValueOnce({
    json: () => Promise.resolve([{ name: 'London', lat: 51.5, lon: -0.1 }])
  });
  
  mockFetch.mockResolvedValueOnce({
    json: () => Promise.resolve({
      main: { temp: 15.5, humidity: 80 },
      weather: [{ description: 'clear sky' }],
      wind: { speed: 3.5 }
    })
  });

  const result = await getCurrentWeather.execute({ location: 'London' });
  
  expect(result.location).toBe('London');
  expect(result.temperature).toBe(16);
  expect(result.description).toBe('clear sky');
});

test('getWeatherForecast works', async () => {
  mockFetch.mockResolvedValueOnce({
    json: () => Promise.resolve([{ name: 'Paris', lat: 48.8, lon: 2.3 }])
  });
  
  mockFetch.mockResolvedValueOnce({
    json: () => Promise.resolve({
      list: [{
        dt: Date.now() / 1000 + 3600,
        main: { temp: 18.5, humidity: 75 },
        weather: [{ description: 'sunny' }],
        wind: { speed: 2.8 }
      }]
    })
  });

  const result = await getWeatherForecast.execute({ location: 'Paris' });
  
  expect(result.location).toBe('Paris');
  expect(result.forecast).toHaveLength(1);
  expect(result.forecast[0].temperature).toBe(19);
});