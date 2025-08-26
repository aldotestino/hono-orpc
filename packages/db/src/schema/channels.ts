// import { relations } from 'drizzle-orm';
import { integer, pgTable, text, timestamp } from 'drizzle-orm/pg-core';
// import { messages } from './messages';

export const channels = pgTable('channels', {
  id: integer().notNull().primaryKey().generatedAlwaysAsIdentity(),
  name: text().notNull().unique(),
  createdAt: timestamp().notNull().defaultNow(),
});

// export const channelRelations = relations(channels, ({ many }) => ({
//   messages: many(messages),
// }));
