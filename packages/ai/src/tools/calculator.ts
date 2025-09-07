import { tool } from 'ai';
import { z } from 'zod/v4';

export const calculator = tool({
  description: 'A calculator tool',
  inputSchema: z.object({
    a: z.number(),
    b: z.number(),
    operation: z.enum(['add', 'subtract', 'multiply', 'divide', 'power']),
  }),
  execute: ({ a, b, operation }) => {
    switch (operation) {
      case 'add':
        return a + b;
      case 'subtract':
        return a - b;
      case 'multiply':
        return a * b;
      case 'divide':
        return a / b;
      case 'power':
        return a ** b;
      default:
        throw new Error('Invalid operation');
    }
  },
});
