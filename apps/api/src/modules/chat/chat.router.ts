import { generateResponse } from '@hono-orpc/ai';
import db from '@hono-orpc/db';
import type { Message, User } from '@hono-orpc/db/schema';
import { channel, channelParticipant, message } from '@hono-orpc/db/tables';
import { EventPublisher, implement } from '@orpc/server';
import { userIsChannelOwnerMiddleware } from 'apps/api/src/middlewares/user-is-channel-owner-middleware';
import { and, desc, eq } from 'drizzle-orm';
import { authMiddleware } from '../../middlewares/auth-middleware';
import { userInChannelMiddleware } from '../../middlewares/user-in-channel-middleware';
import chatContract from './chat.contract';

const publisher = new EventPublisher<
  Record<string, Message & { sender: User | null }>
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

    // add members and owner
    await db.insert(channelParticipant).values([
      {
        channelUuid: ch.uuid,
        userId: context.user.id,
        role: 'owner',
      },
      ...input.members.map((userId) => ({
        channelUuid: ch.uuid,
        userId,
      })),
    ]);

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

const addMembersToChannel = chatRouter.addMembersToChannel
  .use(authMiddleware)
  .use(userIsChannelOwnerMiddleware)
  .handler(async ({ input }) => {
    await db.insert(channelParticipant).values(
      input.memberIds.map((memberId) => ({
        channelUuid: input.uuid,
        userId: memberId,
      }))
    );
  });

const removeMemberFromChannel = chatRouter.removeMemberFromChannel
  .use(authMiddleware)
  .use(userIsChannelOwnerMiddleware)
  .handler(async ({ input }) => {
    await db
      .delete(channelParticipant)
      .where(
        and(
          eq(channelParticipant.channelUuid, input.uuid),
          eq(channelParticipant.userId, input.memberId)
        )
      );
  });

const deleteChannel = chatRouter.deleteChannel
  .use(authMiddleware)
  .use(userIsChannelOwnerMiddleware)
  .handler(async ({ input }) => {
    await db.delete(channel).where(eq(channel.uuid, input.uuid));
  });

const leaveChannel = chatRouter.leaveChannel
  .use(authMiddleware)
  .use(userInChannelMiddleware)
  .handler(async ({ input, context }) => {
    await db
      .delete(channelParticipant)
      .where(
        and(
          eq(channelParticipant.channelUuid, input.uuid),
          eq(channelParticipant.userId, context.user.id)
        )
      );
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

    if (input.content.includes('@ai')) {
      const lastMessages = await db.query.message.findMany({
        where: eq(message.channelUuid, input.uuid),
        orderBy: desc(message.createdAt),
        limit: 10,
        with: {
          sender: true,
        },
      });

      const invertedMessages = lastMessages.reverse();

      let aiTextContent: string;

      try {
        const response = await generateResponse({
          messages: invertedMessages,
        });

        const lastResponse = response.content.at(-1);

        if (!lastResponse || lastResponse.type !== 'text') {
          throw new Error('Last response is not a text');
        }

        aiTextContent = lastResponse.text;
      } catch (error) {
        // biome-ignore lint/suspicious/noConsole: debug ai response error
        console.error(error);
        aiTextContent = 'Failed to generate response';
      }

      const [aiMsg] = await db
        .insert(message)
        .values({
          channelUuid: input.uuid,
          content: aiTextContent,
          senderId: 'ai',
        })
        .returning();

      if (!aiMsg) {
        throw errors.INTERNAL_SERVER_ERROR();
      }

      publisher.publish(input.uuid, {
        ...aiMsg,
        sender: {
          id: 'ai',
          name: 'ChatAI',
          email: 'chatai@hono-orpc.com',
          image: null,
        },
      });
    }

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
  addMembersToChannel,
  removeMemberFromChannel,
  deleteChannel,
  leaveChannel,
  getChannelMessages,
  sendMessageToChannel,
  streamChannelMessages,
};
