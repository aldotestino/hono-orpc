import { createSelectSchema } from 'drizzle-zod';
import type { z } from 'zod/v4';
import { channel, channelParticipant, message } from '../tables';

export const channelSchema = createSelectSchema(channel);
export type Channel = z.infer<typeof channelSchema>;

export const channelParticipantSchema = createSelectSchema(channelParticipant);
export type ChannelParticipant = z.infer<typeof channelParticipantSchema>;

export const messageSchema = createSelectSchema(message);
export type Message = z.infer<typeof messageSchema>;
