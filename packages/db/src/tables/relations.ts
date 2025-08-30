import { relations } from 'drizzle-orm';
import { channel, channelParticipant, message, user } from '../tables';

export const userRelations = relations(user, ({ many }) => ({
  messages: many(message),
  channels: many(channel),
}));

export const channelRelations = relations(channel, ({ one, many }) => ({
  owner: one(user, {
    fields: [channel.ownerId],
    references: [user.id],
  }),
  participants: many(channelParticipant),
}));

export const channelParticipantRelations = relations(
  channelParticipant,
  ({ one }) => ({
    user: one(user, {
      fields: [channelParticipant.userId],
      references: [user.id],
    }),
    channel: one(channel, {
      fields: [channelParticipant.channelUuid],
      references: [channel.uuid],
    }),
  })
);

export const messageRelations = relations(message, ({ one }) => ({
  sender: one(user, {
    fields: [message.senderId],
    references: [user.id],
  }),
  channel: one(channel, {
    fields: [message.channelUuid],
    references: [channel.uuid],
  }),
}));
