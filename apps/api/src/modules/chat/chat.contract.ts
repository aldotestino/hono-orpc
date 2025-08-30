import {
  channelSchema,
  channelsInputSchema,
  messageInputSchema,
  messageSchema,
} from '@hono-orpc/db/schema';
import { eventIterator, oc } from '@orpc/contract';
import { z } from 'zod/v4';

const chatContract = oc.route({
  tags: ['chat'],
});

const createChannelContract = chatContract
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
  .output(channelSchema);

const messagesContract = chatContract
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
  .input(channelSchema.pick({ uuid: true }))
  .output(
    z.object({
      channel: channelSchema,
      messages: z.array(messageSchema),
    })
  );

const sendMessageContract = chatContract
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
  .input(messageInputSchema)
  .output(messageSchema);

const streamMessagesContract = chatContract
  .route({
    method: 'GET',
    description: 'Stream messages by channel',
    path: '/chat/messages/stream',
  })
  .input(channelSchema.pick({ uuid: true }))
  .output(eventIterator(messageSchema));

export default {
  createChannel: createChannelContract,
  messages: messagesContract,
  sendMessage: sendMessageContract,
  streamMessages: streamMessagesContract,
};
