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
Get current date, time, and contextual information to help with time-sensitive queries and forecasts.

#### getCurrentDateTime
Get comprehensive current date and time information.

**Parameters:**
- `timezone` (string, optional): Specific timezone (e.g., "America/New_York", "Europe/London", "Asia/Tokyo"). Defaults to system timezone.
- `format` (string, optional): Output format - "full" (all info), "date" (date only), or "time" (time only). Default: "full".

**Returns:**
- Current date and time in readable format
- Day of week, month name, year
- Timezone information and UTC offset
- Week of year, day of year
- Unix timestamp

#### getRelativeDate
Get date information for a specific number of days from today.

**Parameters:**
- `daysOffset` (number): Days from today (positive for future, negative for past, 0 for today)
- `timezone` (string, optional): Specific timezone. Defaults to system timezone.

**Returns:**
- Date information for the target day
- Relative description ("today", "tomorrow", "in 3 days", "2 days ago")
- Day of week, month, year for the target date

**Use Cases:**
- Providing context for weather forecasts ("Today is Friday, so the 3-day forecast covers Friday through Sunday")
- Understanding time-sensitive queries
- Converting relative dates to absolute dates

### Weather Tools
Get current weather and forecast information for any location worldwide using OpenWeatherMap API.

**How it works:**
1. First, the location name is geocoded to get precise latitude/longitude coordinates
2. Then, weather data is fetched using these coordinates for maximum accuracy
3. Results are formatted and returned with comprehensive weather information

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

**Location Resolution:**
The tools support various location formats:
- City name: "London", "Tokyo", "Sydney"
- City with country: "London, GB", "New York, US", "Paris, FR"
- City with state: "Austin, TX, US", "Toronto, ON, CA"

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

// The AI will automatically use appropriate tools based on user queries
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

// The AI will:
// 1. Use getCurrentDateTime to understand what "today" is
// 2. Use getRelativeDate to understand what "next 3 days" means
// 3. Use getWeatherForecast to get Tokyo's forecast
// 4. Provide a contextual response like:
//    "Today is Friday, March 15th. Here's Tokyo's forecast for the next 3 days (Friday-Sunday)..."
```

### Example Tool Interactions

**Weather Forecast Query:**
- User: "What's the 5-day forecast for London?"
- AI uses: `getCurrentDateTime()` → `getWeatherForecast(location: "London", days: 5)`
- Response includes context: "Today is Monday, so the 5-day forecast covers Monday through Friday..."

**Date Context Query:**
- User: "What day is it?"
- AI uses: `getCurrentDateTime(format: "date")`
- Response: "Today is Friday, March 15th, 2024"

**Relative Date Query:**
- User: "What's the weather going to be like tomorrow?"
- AI uses: `getRelativeDate(daysOffset: 1)` → `getCurrentWeather(location: userLocation)`
- Response: "Tomorrow is Saturday, March 16th. Here's the forecast..."

This project was created using `bun init` in bun v1.2.21. [Bun](https://bun.com) is a fast all-in-one JavaScript runtime.
