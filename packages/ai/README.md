# AI Package

AI tools and utilities for the Hono-ORPC chat application.

## Installation

```bash
bun install
```

## Available Tools

### Calculator
Basic arithmetic operations (add, subtract, multiply, divide, power).

### Date & Time Tools
Simple date/time context for weather forecasts and time-sensitive queries.

#### getCurrentDateTime
Get current date and time information.

**Returns:**
- Current date in readable format
- Current time
- Day of week

#### getRelativeDate
Get date information for days relative to today.

**Parameters:**
- `daysOffset` (number): Days from today (0=today, 1=tomorrow, -1=yesterday)

**Returns:**
- Target date in readable format
- Day of week
- Relative description ("today", "tomorrow", etc.)

### Weather Tools
Get weather information using OpenWeatherMap API with geocoding.

#### getCurrentWeather
Get current weather for a city.

**Parameters:**
- `location` (string): City name (e.g., "London", "New York, US")

**Returns:**
- Temperature (°C), description, humidity, wind speed

#### getWeatherForecast
Get weather forecast for a city.

**Parameters:**
- `location` (string): City name
- `days` (number, optional): Forecast days (1-5, default: 3)

**Returns:**
- Array of forecast items with temperature, description, humidity, wind

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

const response = await generateResponse({
  messages: [
    {
      id: '1',
      content: 'What\'s the weather forecast for Tokyo for the next 3 days?',
      senderId: 'user1',
      channelId: 'channel1',
      createdAt: new Date(),
      sender: { id: 'user1', name: 'John', email: 'john@example.com' }
    }
  ]
});

// AI automatically uses:
// - getCurrentDateTime() for current date context
// - getWeatherForecast(location: "Tokyo", days: 3) for forecast
// - Provides contextual response with dates
```

This project was created using `bun init` in bun v1.2.21. [Bun](https://bun.com) is a fast all-in-one JavaScript runtime.
