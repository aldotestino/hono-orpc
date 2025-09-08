import { test, expect } from 'bun:test';
import { getCurrentDateTime, getRelativeDate } from './datetime';

test('getCurrentDateTime returns current date info', () => {
  const result = getCurrentDateTime.execute({});
  
  expect(typeof result.date).toBe('string');
  expect(typeof result.time).toBe('string');
  expect(typeof result.dayOfWeek).toBe('string');
});

test('getRelativeDate works for different offsets', () => {
  const today = getRelativeDate.execute({ daysOffset: 0 });
  const tomorrow = getRelativeDate.execute({ daysOffset: 1 });
  const yesterday = getRelativeDate.execute({ daysOffset: -1 });
  
  expect(today.relativeText).toBe('today');
  expect(tomorrow.relativeText).toBe('tomorrow');
  expect(yesterday.relativeText).toBe('yesterday');
  
  expect(typeof today.date).toBe('string');
  expect(typeof today.dayOfWeek).toBe('string');
});