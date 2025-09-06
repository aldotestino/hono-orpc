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

const deleteChannel = chatContract
  .route({
    method: 'DELETE',
    description: 'Delete a channel',
    path: '/chat/channel/{uuid}',
  })
  .errors({
    FORBIDDEN: {
      message: 'You are not the owner of this channel',
    },
    NOT_FOUND: {
      message: 'Channel not found',
    },
  })
  .input(z.object({ uuid: z.uuid().describe('The uuid of the channel') }));

const leaveChannel = chatContract
  .route({
    method: 'POST',
    description: 'Leave a channel',
    path: '/chat/channel/{uuid}/leave',
  })
  .errors({
    FORBIDDEN: {
      message: 'You are not a member of this channel',
    },
  })
  .input(z.object({ uuid: z.uuid().describe('The uuid of the channel') }));

const removeMemberFromChannel = chatContract
  .route({
    method: 'POST',
    description: 'Remove a user from a channel',
    path: '/chat/channel/{uuid}/remove-member',
  })
  .errors({
    FORBIDDEN: {
      message: 'You are not the owner of this channel',
    },
  })
  .input(
    z.object({
      uuid: z.uuid().describe('The uuid of the channel'),
      memberId: z.string().describe('The id of the member to remove'),
    })
  );

const addMembersToChannel = chatContract
  .route({
    method: 'POST',
    description: 'Add members to a channel',
    path: '/chat/channel/{uuid}/add-members',
  })
  .errors({
    FORBIDDEN: {
      message: 'You are not the owner of this channel',
    },
  })
  .input(
    z.object({
      uuid: z.uuid().describe('The uuid of the channel'),
      memberIds: z.array(z.string()).describe('The ids of the members to add'),
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
  addMembersToChannel,
  removeMemberFromChannel,
  deleteChannel,
  leaveChannel,
  getChannelMessages,
  sendMessageToChannel,
  streamChannelMessages,
};
