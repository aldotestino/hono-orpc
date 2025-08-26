// import { relations } from 'drizzle-orm';
import { integer, pgTable, text, timestamp } from 'drizzle-orm/pg-core';
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

// export const messageRelations = relations(messages, ({ one }) => ({
//   channel: one(channels, {
//     fields: [messages.channelId],
//     references: [channels.id],
//   }),
// }));
