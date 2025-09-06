import { createSelectSchema } from 'drizzle-zod';
import type { z } from 'zod/v4';
import { channel, channelParticipant, message, user } from '../tables';

export const channelSchema = createSelectSchema(channel);
export type Channel = z.infer<typeof channelSchema>;

export const channelParticipantSchema = createSelectSchema(channelParticipant);
export type ChannelParticipant = z.infer<typeof channelParticipantSchema>;

export const messageSchema = createSelectSchema(message);
export type Message = z.infer<typeof messageSchema>;

export const userSchema = createSelectSchema(user).pick({
  email: true,
  name: true,
  image: true,
  id: true,
});
export type User = z.infer<typeof userSchema>;
