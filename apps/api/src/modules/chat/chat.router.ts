import db from '@hono-orpc/db';
import {
  channel,
  channelParticipant,
  type Message,
  message,
} from '@hono-orpc/db/schema';
import { EventPublisher, implement } from '@orpc/server';
import { authMiddleware } from 'apps/api/src/middlewares/auth-middleware';
import chatContract from './chat.contract';

const publisher = new EventPublisher<Record<string, Message>>();

const chatRouter = implement(chatContract).$context<{ headers: Headers }>();

const createChannel = chatRouter.createChannel
  .use(authMiddleware)
  .handler(async ({ context, input, errors }) => {
    try {
      const [ch] = await db
        .insert(channel)
        .values({
          ...input,
          ownerId: context.user.id,
        })
        .returning();

      if (!ch) {
        throw errors.BAD_REQUEST();
      }

      // add owner to channel participants
      await db.insert(channelParticipant).values({
        channelUuid: ch.uuid,
        userId: context.user.id,
        role: 'owner',
      });

      return ch;
    } catch {
      throw errors.BAD_REQUEST();
    }
  });

const sendMessage = chatRouter.sendMessage
  .use(authMiddleware)
  .handler(async ({ context, input, errors }) => {
    const [msg] = await db
      .insert(message)
      .values({
        ...input,
        senderId: context.user.id,
      })
      .returning();

    if (!msg) {
      throw errors.BAD_REQUEST();
    }

    publisher.publish(input.channelUuid, msg);

    return msg;
  });

const streamMessages = chatRouter.streamMessages
  .use(authMiddleware)
  .handler(async function* ({ input, signal }) {
    for await (const payload of publisher.subscribe(input.uuid, {
      signal,
    })) {
      yield payload;
    }
  });

export default {
  createChannel,
  sendMessage,
  streamMessages,
};
