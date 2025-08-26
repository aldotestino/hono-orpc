import { pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';
import { createSelectSchema } from 'drizzle-zod';
import type { z } from 'zod/v4';
import { channels } from './channels';

export const messages = pgTable('messages', {
  uuid: uuid().notNull().primaryKey().defaultRandom(),
  sender: text().notNull(),
  content: text().notNull(),
  channelUuid: uuid()
    .notNull()
    .references(() => channels.uuid, {
      onDelete: 'cascade',
    }),
  createdAt: timestamp({ mode: 'string' }).notNull().defaultNow(),
});

export const messagesSchema = createSelectSchema(messages);
export type Message = z.infer<typeof messagesSchema>;

export const messagesInputSchema = messagesSchema.omit({
  uuid: true,
  createdAt: true,
});
export type MessageInput = z.infer<typeof messagesInputSchema>;
