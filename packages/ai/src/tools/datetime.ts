import { tool } from 'ai';
import { z } from 'zod/v4';
import { format, addDays } from 'date-fns';

export const getCurrentDateTime = tool({
  description: 'Get current date and time information. Useful for providing context when discussing forecasts.',
  inputSchema: z.object({}),
  execute: () => {
    const now = new Date();
    return {
      date: format(now, 'EEEE, MMMM do, yyyy'),
      time: format(now, 'h:mm a'),
      dayOfWeek: format(now, 'EEEE')
    };
  },
});

export const getRelativeDate = tool({
  description: 'Get date information for a specific number of days from today.',
  inputSchema: z.object({
    daysOffset: z.number().describe('Number of days from today (0 = today, 1 = tomorrow, -1 = yesterday)'),
  }),
  execute: ({ daysOffset }) => {
    const targetDate = addDays(new Date(), daysOffset);
    const relativeText = daysOffset === 0 ? 'today' :
                        daysOffset === 1 ? 'tomorrow' :
                        daysOffset === -1 ? 'yesterday' :
                        daysOffset > 1 ? `in ${daysOffset} days` :
                        `${Math.abs(daysOffset)} days ago`;
    
    return {
      date: format(targetDate, 'EEEE, MMMM do'),
      dayOfWeek: format(targetDate, 'EEEE'),
      relativeText
    };
  },
});