import { type Message, MessageSchema } from '@hono-orpc/schema';
import { EventPublisher, eventIterator, os } from '@orpc/server';
import { z } from 'zod/v4';

const publisher = new EventPublisher<Record<string, Message>>();

const chatRouter = os.route({
  tags: ['chat'],
});

const messagesByChannel = new Map<string, Message[]>();

const messages = chatRouter
  .route({
    method: 'GET',
    description: 'Get messages by channel',
    path: '/chat/messages',
  })
  .input(MessageSchema.pick({ channelId: true }))
  .output(z.array(MessageSchema).describe('The messages in the channel'))
  .handler(({ input: { channelId } }) => {
    return messagesByChannel.get(channelId) || [];
  });

const sendMessage = chatRouter
  .route({
    method: 'POST',
    description: 'Send a message to a channel',
    path: '/chat/messages',
  })
  .input(MessageSchema.omit({ id: true, createdAt: true }))
  .output(MessageSchema)
  .handler(({ input }) => {
    const { channelId } = input;

    if (!messagesByChannel.has(channelId)) {
      messagesByChannel.set(channelId, []);
    }

    const oldMessages = messagesByChannel.get(channelId) || [];

    const message: Message = {
      ...input,
      id: oldMessages.length + 1,
      createdAt: new Date().toISOString(),
    };

    messagesByChannel.set(message.channelId, [...oldMessages, message]);

    publisher.publish(channelId, message);

    return message;
  });

const streamMessages = chatRouter
  .route({
    method: 'GET',
    description: 'Stream messages by channel',
    path: '/chat/messages/stream',
  })
  .input(MessageSchema.pick({ channelId: true }))
  .output(eventIterator(MessageSchema))
  .handler(async function* ({ input, signal }) {
    for await (const payload of publisher.subscribe(input.channelId, {
      signal,
    })) {
      yield payload;
    }
  });

export default {
  messages,
  sendMessage,
  streamMessages,
};
