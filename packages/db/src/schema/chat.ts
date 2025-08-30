import { pgEnum, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';
import { createSelectSchema } from 'drizzle-zod';
import type { z } from 'zod/v4';
import { user } from './auth';

export const channel = pgTable('channel', {
  uuid: uuid().notNull().primaryKey().defaultRandom(),
  name: text().notNull().unique(),
  ownerId: text()
    .notNull()
    .references(() => user.id, {
      onDelete: 'cascade',
    }),
  createdAt: timestamp({ mode: 'string' }).notNull().defaultNow(),
});

export const channelSchema = createSelectSchema(channel);
export type Channel = z.infer<typeof channelSchema>;

export const channelsInputSchema = channelSchema.omit({
  ownerId: true,
  uuid: true,
  createdAt: true,
});
export type ChannelInput = z.infer<typeof channelsInputSchema>;

export const channelRole = pgEnum('channel_role', ['owner', 'member']);

export const channelParticipant = pgTable('channel_participant', {
  userId: text()
    .notNull()
    .references(() => user.id, {
      onDelete: 'cascade',
    }),
  channelUuid: uuid()
    .notNull()
    .references(() => channel.uuid, {
      onDelete: 'cascade',
    }),
  role: channelRole().notNull().default('member'),
  createdAt: timestamp({ mode: 'string' }).notNull().defaultNow(),
});

export const message = pgTable('message', {
  uuid: uuid().notNull().primaryKey().defaultRandom(),
  senderId: text()
    .notNull()
    .references(() => user.id, {
      onDelete: 'cascade',
    }),
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
  senderId: true,
  uuid: true,
  createdAt: true,
});
export type MessageInput = z.infer<typeof messageInputSchema>;
