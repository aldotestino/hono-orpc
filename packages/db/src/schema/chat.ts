import { pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';
import { createSelectSchema } from 'drizzle-zod';
import type { z } from 'zod/v4';

export const channel = pgTable('channel', {
  uuid: uuid().notNull().primaryKey().defaultRandom(),
  name: text().notNull().unique(),
  owner: text().notNull(),
  createdAt: timestamp({ mode: 'string' }).notNull().defaultNow(),
});

export const channelSchema = createSelectSchema(channel);
export type Channel = z.infer<typeof channelSchema>;

export const channelsInputSchema = channelSchema.omit({
  uuid: true,
  createdAt: true,
});
export type ChannelInput = z.infer<typeof channelsInputSchema>;

export const message = pgTable('message', {
  uuid: uuid().notNull().primaryKey().defaultRandom(),
  sender: text().notNull(),
  content: text().notNull(),
  channelUuid: uuid()
    .notNull()
    .references(() => channel.uuid, {
      onDelete: 'cascade',
    }),
  createdAt: timestamp({ mode: 'string' }).notNull().defaultNow(),
});

export const messageSchema = createSelectSchema(message);
export type Message = z.infer<typeof messageSchema>;

export const messageInputSchema = messageSchema.omit({
  uuid: true,
  createdAt: true,
});
export type MessageInput = z.infer<typeof messageInputSchema>;
