import db from '@hono-orpc/db';
import { channel, type Message, message } from '@hono-orpc/db/schema';
import { EventPublisher, implement } from '@orpc/server';
import { eq } from 'drizzle-orm';
import chatContract from './chat.contract';

const publisher = new EventPublisher<Record<string, Message>>();

const chatRouter = implement(chatContract);

const createChannelRoute = chatRouter.createChannel.handler(
  async ({ input, errors }) => {
    try {
      const [ch] = await db.insert(channel).values(input).returning();

      if (!ch) {
        throw errors.BAD_REQUEST();
      }

      return ch;
    } catch {
      throw errors.BAD_REQUEST();
    }
  }
);

const messagesRoute = chatRouter.messages.handler(async ({ input, errors }) => {
  const ch = await db.query.channel.findFirst({
    where: eq(channel.uuid, input.uuid),
  });

  if (!ch) {
    throw errors.NOT_FOUND();
  }

  const rawMessages = await db.query.message.findMany({
    where: eq(message.channelUuid, input.uuid),
  });

  return {
    channel: ch,
    messages: rawMessages,
  };
});

const sendMessageRoute = chatRouter.sendMessage.handler(
  async ({ input, errors }) => {
    const [msg] = await db.insert(message).values(input).returning();

    if (!msg) {
      throw errors.BAD_REQUEST();
    }

    publisher.publish(input.channelUuid, msg);

    return msg;
  }
);

const streamMessagesRoute = chatRouter.streamMessages.handler(async function* ({
  input,
  signal,
}) {
  for await (const payload of publisher.subscribe(input.uuid, {
    signal,
  })) {
    yield payload;
  }
});

export default {
  createChannel: createChannelRoute,
  messages: messagesRoute,
  sendMessage: sendMessageRoute,
  streamMessages: streamMessagesRoute,
};
