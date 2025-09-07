import { generateResponse } from '@hono-orpc/ai';
import db from '@hono-orpc/db';
import type { Message, User } from '@hono-orpc/db/schema';
import { message } from '@hono-orpc/db/tables';
import { EventPublisher, implement } from '@orpc/server';
import { desc, eq } from 'drizzle-orm';
import { CHAT_AI_USER } from '../../../lib/seed';
import { authMiddleware } from '../../../middlewares/auth-middleware';
import { userInChannelMiddleware } from '../../../middlewares/user-in-channel-middleware';
import messageContract from './message.contract';

const publisher = new EventPublisher<
  Record<string, Message & { sender: User | null }>
>();

const messageRouter = implement(messageContract).$context<{
  headers: Headers;
}>();

const getChannelMessages = messageRouter.getChannelMessages
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

const sendMessageToChannel = messageRouter.sendMessageToChannel
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
          model: 'openrouter/sonoma-dusk-alpha',
          enableTools: true,
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
          senderId: CHAT_AI_USER.id,
        })
        .returning();

      if (!aiMsg) {
        throw errors.INTERNAL_SERVER_ERROR();
      }

      publisher.publish(input.uuid, {
        ...aiMsg,
        sender: CHAT_AI_USER,
      });
    }

    return msg;
  });

const streamChannelMessages = messageRouter.streamChannelMessages
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
  getChannelMessages,
  sendMessageToChannel,
  streamChannelMessages,
};
