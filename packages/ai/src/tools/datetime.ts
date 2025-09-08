import { tool } from 'ai';
import { z } from 'zod/v4';

interface DateTimeInfo {
  currentDateTime: string;
  currentDate: string;
  currentTime: string;
  dayOfWeek: string;
  dayOfMonth: number;
  month: string;
  monthNumber: number;
  year: number;
  timezone: string;
  utcOffset: string;
  timestamp: number;
  weekOfYear: number;
  dayOfYear: number;
}

const getWeekOfYear = (date: Date): number => {
  const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
  const pastDaysOfYear = (date.getTime() - firstDayOfYear.getTime()) / 86400000;
  return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
};

const getDayOfYear = (date: Date): number => {
  const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
  return Math.floor((date.getTime() - firstDayOfYear.getTime()) / 86400000) + 1;
};

export const getCurrentDateTime = tool({
  description: 'Get current date and time information including day of week, month, year, and timezone. Useful for providing context when discussing forecasts, schedules, or time-sensitive information.',
  inputSchema: z.object({
    timezone: z.string().optional().describe('Optional timezone (e.g., "America/New_York", "Europe/London", "Asia/Tokyo"). Defaults to system timezone.'),
    format: z.enum(['full', 'date', 'time']).optional().default('full').describe('Output format: "full" (all info), "date" (date only), or "time" (time only)'),
  }),
  execute: ({ timezone, format = 'full' }): DateTimeInfo => {
    try {
      const now = new Date();
      
      // Create date object with specified timezone if provided
      const targetDate = timezone ? new Date(now.toLocaleString("en-US", { timeZone: timezone })) : now;
      
      const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      const monthNames = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
      ];
      
      // Get timezone information
      const timezoneName = timezone || Intl.DateTimeFormat().resolvedOptions().timeZone;
      const utcOffset = now.toLocaleString('en', {
        timeZone: timezoneName,
        timeZoneName: 'longOffset'
      }).split(' ').pop() || 'UTC';
      
      const dateTimeInfo: DateTimeInfo = {
        currentDateTime: targetDate.toLocaleString('en-US', {
          timeZone: timezoneName,
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: true
        }),
        currentDate: targetDate.toLocaleDateString('en-US', {
          timeZone: timezoneName,
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        }),
        currentTime: targetDate.toLocaleTimeString('en-US', {
          timeZone: timezoneName,
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: true
        }),
        dayOfWeek: dayNames[targetDate.getDay()],
        dayOfMonth: targetDate.getDate(),
        month: monthNames[targetDate.getMonth()],
        monthNumber: targetDate.getMonth() + 1,
        year: targetDate.getFullYear(),
        timezone: timezoneName,
        utcOffset: utcOffset,
        timestamp: targetDate.getTime(),
        weekOfYear: getWeekOfYear(targetDate),
        dayOfYear: getDayOfYear(targetDate)
      };
      
      // Return filtered info based on format
      if (format === 'date') {
        return {
          ...dateTimeInfo,
          currentTime: '',
        };
      } else if (format === 'time') {
        return {
          ...dateTimeInfo,
          currentDate: dateTimeInfo.currentTime,
          currentDateTime: dateTimeInfo.currentTime,
        };
      }
      
      return dateTimeInfo;
    } catch (error) {
      throw new Error(`Failed to get current date/time: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  },
});

export const getRelativeDate = tool({
  description: 'Get date information for a specific number of days from now (past or future). Useful for understanding what dates forecasts refer to.',
  inputSchema: z.object({
    daysOffset: z.number().describe('Number of days from today (positive for future, negative for past, 0 for today)'),
    timezone: z.string().optional().describe('Optional timezone (e.g., "America/New_York", "Europe/London", "Asia/Tokyo"). Defaults to system timezone.'),
  }),
  execute: ({ daysOffset, timezone }) => {
    try {
      const now = new Date();
      const targetDate = new Date(now.getTime() + (daysOffset * 24 * 60 * 60 * 1000));
      
      const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      const monthNames = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
      ];
      
      const timezoneName = timezone || Intl.DateTimeFormat().resolvedOptions().timeZone;
      
      // Adjust for timezone if specified
      const displayDate = timezone ? 
        new Date(targetDate.toLocaleString("en-US", { timeZone: timezone })) : 
        targetDate;
      
      const relativeDescription = daysOffset === 0 ? 'today' :
                                daysOffset === 1 ? 'tomorrow' :
                                daysOffset === -1 ? 'yesterday' :
                                daysOffset > 1 ? `in ${daysOffset} days` :
                                `${Math.abs(daysOffset)} days ago`;
      
      return {
        date: displayDate.toLocaleDateString('en-US', {
          timeZone: timezoneName,
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        }),
        dayOfWeek: dayNames[displayDate.getDay()],
        dayOfMonth: displayDate.getDate(),
        month: monthNames[displayDate.getMonth()],
        monthNumber: displayDate.getMonth() + 1,
        year: displayDate.getFullYear(),
        daysFromToday: daysOffset,
        relativeDescription: relativeDescription,
        timezone: timezoneName,
        timestamp: displayDate.getTime()
      };
    } catch (error) {
      throw new Error(`Failed to calculate relative date: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  },
});