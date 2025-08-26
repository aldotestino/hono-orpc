import { integer, pgTable, text, timestamp } from 'drizzle-orm/pg-core';
import { createSelectSchema } from 'drizzle-zod';
import { z } from 'zod/v4';
import { channels } from './channels';

export const messages = pgTable('messages', {
  id: integer().notNull().primaryKey().generatedAlwaysAsIdentity(),
  sender: text().notNull(),
  content: text().notNull(),
  channelId: integer()
    .notNull()
    .references(() => channels.id, { onDelete: 'cascade' }),
  createdAt: timestamp().notNull().defaultNow(),
});

export const messagesSchema = createSelectSchema(messages, {
  id: z.number().int().positive().min(1),
  channelId: z.number().int().positive().min(1),
});
export type Message = z.infer<typeof messagesSchema>;

export const messagesInputSchema = messagesSchema.omit({
  id: true,
  createdAt: true,
});
export type MessageInput = z.infer<typeof messagesInputSchema>;
