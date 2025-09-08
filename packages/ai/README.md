# AI Package

AI tools and utilities for the Hono-ORPC chat application.

## Installation

```bash
bun install
```

## Available Tools

### Calculator
Basic arithmetic operations (add, subtract, multiply, divide, power).

### Weather Tools
Get current weather and forecast information for any location worldwide.

#### getCurrentWeather
Get current weather conditions for a specific location.

**Parameters:**
- `location` (string): City name, optionally with country code (e.g., "London", "New York, US", "Paris, FR")

**Returns:**
- Current temperature (°C), feels like temperature
- Weather description (e.g., "clear sky", "light rain")
- Humidity, wind speed (km/h), wind direction
- Atmospheric pressure, visibility (km), cloudiness
- Sunrise and sunset times

#### getWeatherForecast
Get weather forecast for a specific location.

**Parameters:**
- `location` (string): City name, optionally with country code
- `days` (number, optional): Number of forecast days to return (1-5, default: 3)

**Returns:**
- 5-day forecast with 3-hour intervals
- Temperature, weather conditions, precipitation
- Humidity, wind speed, cloudiness for each time period

## Configuration

### Environment Variables

Set the following environment variable to use weather tools:

```bash
export WEATHER_SERVICE_API_KEY="your_openweathermap_api_key"
```

Get your free API key from [OpenWeatherMap](https://openweathermap.org/api).

## Usage

```typescript
import { generateResponse } from '@hono-orpc/ai';

// The AI will automatically use weather tools when users ask about weather
const response = await generateResponse({
  messages: [
    {
      id: '1',
      content: 'What\'s the weather like in Tokyo?',
      senderId: 'user1',
      channelId: 'channel1',
      createdAt: new Date(),
      sender: { id: 'user1', name: 'John', email: 'john@example.com' }
    }
  ]
});
```

This project was created using `bun init` in bun v1.2.21. [Bun](https://bun.com) is a fast all-in-one JavaScript runtime.
