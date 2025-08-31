import db from '@hono-orpc/db';
import type { Message, User } from '@hono-orpc/db/schema';
import { channel, channelParticipant, message } from '@hono-orpc/db/tables';
import { EventPublisher, implement } from '@orpc/server';
import { eq } from 'drizzle-orm';
import { authMiddleware } from '../../middlewares/auth-middleware';
import { userInChannelMiddleware } from '../../middlewares/user-in-channel-middleware';
import chatContract from './chat.contract';

const publisher = new EventPublisher<
  Record<string, Message & { sender: User }>
>();

const chatRouter = implement(chatContract).$context<{ headers: Headers }>();

const getChannels = chatRouter.getChannels
  .use(authMiddleware)
  .handler(async ({ context }) => {
    const userChannels = await db.query.channelParticipant.findMany({
      where: eq(channelParticipant.userId, context.user.id),
      with: {
        channel: true,
      },
    });

    return userChannels.map((uc) => uc.channel);
  });

const createChannel = chatRouter.createChannel
  .use(authMiddleware)
  .handler(async ({ context, input, errors }) => {
    const [ch] = await db
      .insert(channel)
      .values({
        ...input,
        ownerId: context.user.id,
      })
      .returning();

    if (!ch) {
      throw errors.INTERNAL_SERVER_ERROR({
        message: 'Failed to create channel',
      });
    }

    // add owner to channel participants
    await db.insert(channelParticipant).values({
      channelUuid: ch.uuid,
      userId: context.user.id,
      role: 'owner',
    });

    return ch;
  });

const getChannel = chatRouter.getChannel
  .use(authMiddleware)
  .use(userInChannelMiddleware)
  .handler(async ({ input, errors }) => {
    const ch = await db.query.channel.findFirst({
      where: eq(channel.uuid, input.uuid),
      with: {
        participants: {
          with: {
            user: true,
          },
        },
      },
    });

    if (!ch) {
      throw errors.NOT_FOUND();
    }

    return ch;
  });

const getChannelMessages = chatRouter.getChannelMessages
  .use(authMiddleware)
  .use(userInChannelMiddleware)
  .handler(({ input }) => {
    return db.query.message.findMany({
      where: eq(message.channelUuid, input.uuid),
      with: {
        sender: true,
      },
    });
  });

const sendMessageToChannel = chatRouter.sendMessageToChannel
  .use(authMiddleware)
  .use(userInChannelMiddleware)
  .handler(async ({ context, input, errors }) => {
    const [msg] = await db
      .insert(message)
      .values({
        channelUuid: input.uuid,
        content: input.content,
        senderId: context.user.id,
      })
      .returning();

    if (!msg) {
      throw errors.INTERNAL_SERVER_ERROR();
    }

    publisher.publish(input.uuid, {
      ...msg,
      sender: context.user as User,
    });

    return msg;
  });

const streamChannelMessages = chatRouter.streamChannelMessages
  .use(authMiddleware)
  .use(userInChannelMiddleware)
  .handler(async function* ({ input, signal }) {
    for await (const payload of publisher.subscribe(input.uuid, {
      signal,
    })) {
      yield payload;
    }
  });

export default {
  getChannels,
  createChannel,
  getChannel,
  getChannelMessages,
  sendMessageToChannel,
  streamChannelMessages,
};
