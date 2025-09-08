import { test, expect, beforeEach, afterEach } from 'bun:test';
import { getCurrentDateTime, getRelativeDate } from './datetime';

// Mock Date to have consistent test results
const MOCK_DATE = new Date('2024-03-15T14:30:00.000Z'); // Friday, March 15, 2024, 2:30 PM UTC

beforeEach(() => {
  // Mock Date constructor and now()
  global.Date = class extends Date {
    constructor(...args: any[]) {
      if (args.length === 0) {
        super(MOCK_DATE);
      } else {
        super(...args);
      }
    }
    
    static now() {
      return MOCK_DATE.getTime();
    }
  } as any;
});

afterEach(() => {
  // Restore original Date
  global.Date = Date;
});

test('getCurrentDateTime - full format', () => {
  const result = getCurrentDateTime.execute({ format: 'full' });
  
  expect(result.dayOfWeek).toBe('Friday');
  expect(result.month).toBe('March');
  expect(result.monthNumber).toBe(3);
  expect(result.year).toBe(2024);
  expect(result.dayOfMonth).toBe(15);
  expect(typeof result.currentDateTime).toBe('string');
  expect(typeof result.currentDate).toBe('string');
  expect(typeof result.currentTime).toBe('string');
  expect(typeof result.timezone).toBe('string');
  expect(typeof result.utcOffset).toBe('string');
  expect(result.timestamp).toBe(MOCK_DATE.getTime());
  expect(typeof result.weekOfYear).toBe('number');
  expect(typeof result.dayOfYear).toBe('number');
});

test('getCurrentDateTime - date format only', () => {
  const result = getCurrentDateTime.execute({ format: 'date' });
  
  expect(result.dayOfWeek).toBe('Friday');
  expect(result.month).toBe('March');
  expect(result.year).toBe(2024);
  expect(result.currentTime).toBe('');
  expect(typeof result.currentDate).toBe('string');
});

test('getCurrentDateTime - time format only', () => {
  const result = getCurrentDateTime.execute({ format: 'time' });
  
  expect(result.dayOfWeek).toBe('Friday');
  expect(typeof result.currentTime).toBe('string');
  expect(result.currentDate).toBe(result.currentTime);
  expect(result.currentDateTime).toBe(result.currentTime);
});

test('getCurrentDateTime - with timezone', () => {
  const result = getCurrentDateTime.execute({ 
    timezone: 'America/New_York',
    format: 'full' 
  });
  
  expect(result.timezone).toBe('America/New_York');
  expect(result.dayOfWeek).toBe('Friday');
  expect(result.month).toBe('March');
  expect(result.year).toBe(2024);
});

test('getRelativeDate - today', () => {
  const result = getRelativeDate.execute({ daysOffset: 0 });
  
  expect(result.daysFromToday).toBe(0);
  expect(result.relativeDescription).toBe('today');
  expect(result.dayOfWeek).toBe('Friday');
  expect(result.month).toBe('March');
  expect(result.dayOfMonth).toBe(15);
  expect(result.year).toBe(2024);
});

test('getRelativeDate - tomorrow', () => {
  const result = getRelativeDate.execute({ daysOffset: 1 });
  
  expect(result.daysFromToday).toBe(1);
  expect(result.relativeDescription).toBe('tomorrow');
  expect(result.dayOfWeek).toBe('Saturday');
  expect(result.month).toBe('March');
  expect(result.dayOfMonth).toBe(16);
  expect(result.year).toBe(2024);
});

test('getRelativeDate - yesterday', () => {
  const result = getRelativeDate.execute({ daysOffset: -1 });
  
  expect(result.daysFromToday).toBe(-1);
  expect(result.relativeDescription).toBe('yesterday');
  expect(result.dayOfWeek).toBe('Thursday');
  expect(result.month).toBe('March');
  expect(result.dayOfMonth).toBe(14);
  expect(result.year).toBe(2024);
});

test('getRelativeDate - future date', () => {
  const result = getRelativeDate.execute({ daysOffset: 5 });
  
  expect(result.daysFromToday).toBe(5);
  expect(result.relativeDescription).toBe('in 5 days');
  expect(result.dayOfWeek).toBe('Wednesday');
  expect(result.month).toBe('March');
  expect(result.dayOfMonth).toBe(20);
  expect(result.year).toBe(2024);
});

test('getRelativeDate - past date', () => {
  const result = getRelativeDate.execute({ daysOffset: -7 });
  
  expect(result.daysFromToday).toBe(-7);
  expect(result.relativeDescription).toBe('7 days ago');
  expect(result.dayOfWeek).toBe('Friday');
  expect(result.month).toBe('March');
  expect(result.dayOfMonth).toBe(8);
  expect(result.year).toBe(2024);
});

test('getRelativeDate - with timezone', () => {
  const result = getRelativeDate.execute({ 
    daysOffset: 1,
    timezone: 'Europe/London'
  });
  
  expect(result.timezone).toBe('Europe/London');
  expect(result.daysFromToday).toBe(1);
  expect(result.relativeDescription).toBe('tomorrow');
  expect(typeof result.date).toBe('string');
});

test('getRelativeDate - cross month boundary', () => {
  // Test going from March to April
  const result = getRelativeDate.execute({ daysOffset: 17 }); // March 15 + 17 days = April 1
  
  expect(result.month).toBe('April');
  expect(result.monthNumber).toBe(4);
  expect(result.dayOfMonth).toBe(1);
  expect(result.year).toBe(2024);
  expect(result.relativeDescription).toBe('in 17 days');
});

test('getCurrentDateTime - week and day of year calculations', () => {
  const result = getCurrentDateTime.execute({ format: 'full' });
  
  // March 15, 2024 should be around week 11 and day 75 of the year
  expect(result.weekOfYear).toBeGreaterThan(10);
  expect(result.weekOfYear).toBeLessThan(15);
  expect(result.dayOfYear).toBeGreaterThan(70);
  expect(result.dayOfYear).toBeLessThan(80);
});