import {
  channelParticipantSchema,
  channelSchema,
  messageSchema,
  userSchema,
} from '@hono-orpc/db/schema';
import { eventIterator, oc } from '@orpc/contract';
import { z } from 'zod/v4';

const chatContract = oc
  .route({
    tags: ['chat'],
  })
  .errors({
    UNAUTHORIZED: {},
  });

const getChannels = chatContract
  .route({
    method: 'GET',
    description: "Get user's channels",
    path: '/chat/channels',
  })
  .errors({
    UNAUTHORIZED: {},
  })
  .output(z.array(channelSchema));

const createChannel = chatContract
  .route({
    method: 'POST',
    description: 'Create a new channel',
    path: '/chat/channel',
    successStatus: 201,
  })
  .errors({
    INTERNAL_SERVER_ERROR: {},
  })
  .input(
    z.object({
      name: z.string().min(1).describe('The name of the channel'),
      members: z
        .array(z.string())
        .min(1)
        .describe('The members of the channel'),
    })
  )
  .output(channelSchema);

const getChannel = chatContract
  .route({
    method: 'GET',
    description: 'Get a channel by id',
    path: '/chat/channel/{uuid}',
  })
  .errors({
    FORBIDDEN: {
      message: 'You are not a member of this channel',
    },
    NOT_FOUND: {
      message: 'Channel not found',
    },
  })
  .input(z.object({ uuid: z.uuid().describe('The uuid of the channel') }))
  .output(
    channelSchema.extend({
      participants: z
        .array(channelParticipantSchema.extend({ user: userSchema.nullable() }))
        .nullable(),
    })
  );

const getChannelMessages = chatContract
  .route({
    method: 'GET',
    description: 'Get messages of a channel',
    path: '/chat/channel/{uuid}/messages',
  })
  .errors({
    FORBIDDEN: {
      message: 'You are not a member of this channel',
    },
    NOT_FOUND: {
      message: 'Channel not found',
    },
  })
  .input(
    z.object({
      uuid: z.uuid().describe('The uuid of the channel'),
    })
  )
  .output(z.array(messageSchema.extend({ sender: userSchema.nullable() })));

const sendMessageToChannel = chatContract
  .route({
    method: 'POST',
    description: 'Send a message to a channel',
    path: '/chat/channel/{uuid}/messages',
  })
  .errors({
    FORBIDDEN: {
      message: 'You are not a member of this channel',
    },
    NOT_FOUND: {
      message: 'Channel not found',
    },
    INTERNAL_SERVER_ERROR: {},
  })
  .input(
    z.object({
      uuid: z.uuid().describe('The uuid of the channel'),
      content: z.string().min(1).describe('The content of the message'),
    })
  )
  .output(messageSchema);

const streamChannelMessages = chatContract
  .route({
    method: 'GET',
    description: 'Stream messages by channel',
    path: '/chat/channel/{uuid}/messages/stream',
  })
  .errors({
    FORBIDDEN: {
      message: 'You are not a member of this channel',
    },
    NOT_FOUND: {
      message: 'Channel not found',
    },
  })
  .input(z.object({ uuid: z.uuid().describe('The uuid of the channel') }))
  .output(eventIterator(messageSchema.extend({ sender: userSchema })));

export default {
  getChannels,
  createChannel,
  getChannel,
  getChannelMessages,
  sendMessageToChannel,
  streamChannelMessages,
};
