import { z } from 'zod/v4';

export const MessageSchema = z.object({
  id: z.number().int().positive().describe('The message id'),
  channelId: z.string().min(2).describe('The unique channel name'),
  sender: z.string().describe('The sender of the message'),
  content: z.string().min(1).describe('The content of the message'),
  createdAt: z.iso
    .datetime()
    .describe('The date and time the message was created'),
});

export type Message = z.infer<typeof MessageSchema>;

export const MessageInputSchema = MessageSchema.pick({
  content: true,
  channelId: true,
  sender: true,
});

export type MessageInput = z.infer<typeof MessageInputSchema>;

export const SigninSchema = MessageSchema.pick({
  channelId: true,
  sender: true,
});

export type Signin = z.infer<typeof SigninSchema>;
