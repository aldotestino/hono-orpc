import {
  channelSchema,
  channelsInputSchema,
  messageInputSchema,
  messageSchema,
} from '@hono-orpc/db/schema';
import { eventIterator, oc } from '@orpc/contract';

const chatContract = oc.route({
  tags: ['chat'],
});

const createChannel = chatContract
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

const getChannel = chatContract
  .route({
    method: 'GET',
    description: 'Get a channel by id',
    path: '/chat/channel/:id',
  })
  .input(channelSchema.pick({ uuid: true }))
  .output(channelSchema);

const sendMessage = chatContract
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

const streamMessages = chatContract
  .route({
    method: 'GET',
    description: 'Stream messages by channel',
    path: '/chat/messages/stream',
  })
  .input(channelSchema.pick({ uuid: true }))
  .output(eventIterator(messageSchema));

export default {
  createChannel,
  getChannel,
  sendMessage,
  streamMessages,
};
