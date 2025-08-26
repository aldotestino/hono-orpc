import { pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';
import { createSelectSchema } from 'drizzle-zod';
import type { z } from 'zod/v4';

export const channels = pgTable('channels', {
  uuid: uuid().notNull().primaryKey().defaultRandom(),
  name: text().notNull().unique(),
  owner: text().notNull(),
  createdAt: timestamp({ mode: 'string' }).notNull().defaultNow(),
});

export const channelsSchema = createSelectSchema(channels);
export type Channel = z.infer<typeof channelsSchema>;

export const channelsInputSchema = channelsSchema.omit({
  uuid: true,
  createdAt: true,
});
export type ChannelInput = z.infer<typeof channelsInputSchema>;
