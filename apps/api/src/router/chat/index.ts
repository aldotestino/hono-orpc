import db from '@hono-orpc/db';
import {
  channels,
  channelsInputSchema,
  channelsSchema,
  type Message,
  messages,
  messagesInputSchema,
  messagesSchema,
} from '@hono-orpc/db/schema';
import { EventPublisher, eventIterator, os } from '@orpc/server';
import { eq } from 'drizzle-orm';
import { z } from 'zod/v4';

const publisher = new EventPublisher<Record<string, Message>>();

const chatRouter = os.route({
  tags: ['chat'],
});

const createChannelRoute = chatRouter
  .route({
    method: 'POST',
    description: 'Create a new channel',
    path: '/chat/channel',
  })
  .errors({
    BAD_REQUEST: {
      message: 'Channel already exists',
    },
  })
  .input(channelsInputSchema)
  .output(channelsSchema)
  .handler(async ({ input, errors }) => {
    const [channel] = await db.insert(channels).values(input).returning();

    if (!channel) {
      throw errors.BAD_REQUEST;
    }

    return channel;
  });

const messagesRoute = chatRouter
  .route({
    method: 'GET',
    description: 'Get messages by channel',
    path: '/chat/messages',
  })
  .errors({
    NOT_FOUND: {
      message: 'Channel not found',
    },
  })
  .input(
    z.object({
      id: z.coerce.number().int().positive().min(1),
    })
  )
  .output(
    z.object({
      channel: channelsSchema,
      messages: z.array(messagesSchema),
    })
  )
  .handler(async ({ input, errors }) => {
    const channel = await db.query.channels.findFirst({
      where: eq(channels.id, input.id),
    });

    if (!channel) {
      throw errors.NOT_FOUND;
    }

    const rawMessages = await db.query.messages.findMany({
      where: eq(messages.channelId, input.id),
    });

    return {
      channel,
      messages: rawMessages,
    };
  });

const sendMessageRoute = chatRouter
  .route({
    method: 'POST',
    description: 'Send a message to a channel',
    path: '/chat/messages',
  })
  .errors({
    BAD_REQUEST: {
      message: 'Failed to send message',
    },
  })
  .input(messagesInputSchema)
  .output(messagesSchema)
  .handler(async ({ input, errors }) => {
    const [message] = await db.insert(messages).values(input).returning();

    if (!message) {
      throw errors.BAD_REQUEST;
    }

    publisher.publish(input.channelId.toString(), message);

    return message;
  });

const streamMessagesRoute = chatRouter
  .route({
    method: 'GET',
    description: 'Stream messages by channel',
    path: '/chat/messages/stream',
  })
  .input(channelsSchema.pick({ id: true }))
  .output(eventIterator(messagesSchema))
  .handler(async function* ({ input, signal }) {
    for await (const payload of publisher.subscribe(input.id.toString(), {
      signal,
    })) {
      yield payload;
    }
  });

// const statsRoute = chatRouter
//   .route({
//     method: 'GET',
//     description: 'Get stats',
//     path: '/chat/stats',
//   })
//   .output(
//     z.object({
//       channels: z
//         .object({
//           count: z.number().describe('The number of channels'),
//           names: z.array(z.string()).describe('The names of the channels'),
//         })
//         .describe('The channels stats'),
//       messages: z
//         .object({
//           count: z.number().describe('The total number of messages'),
//         })
//         .describe('The messages stats'),
//       users: z
//         .object({
//           count: z.number().describe('The number of users'),
//         })
//         .describe('The users stats'),
//     })
//   )
//   .handler(() => {
//     const msgs = Array.from(messagesByChannel.values()).flat();
//     const uniqueUsers = new Set(msgs.map((m) => m.sender));

//     return {
//       channels: {
//         count: messagesByChannel.size,
//         names: Array.from(messagesByChannel.keys()),
//       },
//       messages: {
//         count: msgs.length,
//       },
//       users: {
//         count: uniqueUsers.size,
//       },
//     };
//   });

export default {
  createChannel: createChannelRoute,
  messages: messagesRoute,
  sendMessage: sendMessageRoute,
  streamMessages: streamMessagesRoute,
  // stats: statsRoute,
};
