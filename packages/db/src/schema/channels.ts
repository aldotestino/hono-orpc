import { integer, pgTable, text, timestamp } from 'drizzle-orm/pg-core';
import { createSelectSchema } from 'drizzle-zod';
import { z } from 'zod/v4';

export const channels = pgTable('channels', {
  id: integer().notNull().primaryKey().generatedAlwaysAsIdentity(),
  name: text().notNull().unique(),
  createdAt: timestamp().notNull().defaultNow(),
  owner: text().notNull(),
});

export const channelsSchema = createSelectSchema(channels, {
  id: z.number().int().positive().min(1),
});
export type Channel = z.infer<typeof channelsSchema>;

export const channelsInputSchema = channelsSchema.omit({
  id: true,
  createdAt: true,
});
export type ChannelInput = z.infer<typeof channelsInputSchema>;
