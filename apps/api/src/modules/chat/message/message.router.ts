import db from "@hono-orpc/db";
import type { Message, User } from "@hono-orpc/db/schema";
import { message } from "@hono-orpc/db/tables";
import { EventPublisher, implement } from "@orpc/server";
import { eq } from "drizzle-orm";
import { CHAT_AI_USER } from "../../../lib/seed";
import { generateAIResponse, getChannelSettings } from "../../../lib/utils";
import { authMiddleware } from "../../../middlewares/auth-middleware";
import { userInChannelMiddleware } from "../../../middlewares/user-in-channel-middleware";
import messageContract from "./message.contract";

const publisher = new EventPublisher<
  Record<string, Message & { sender: User | null }>
>();

const saveAndPublishMessage = async ({
  channelUuid,
  content,
  sender,
}: {
  channelUuid: string;
  content: string;
  sender: User;
}) => {
  const [msg] = await db
    .insert(message)
    .values({
      channelUuid,
      content,
      senderId: sender.id,
    })
    .returning();

  if (!msg) {
    // biome-ignore lint/suspicious/noConsole: DEBUG
    console.error(
      `[saveAndPublishMessage] Failed to save message: ${JSON.stringify({ channelUuid, content, sender })}`
    );
    return null;
  }

  publisher.publish(channelUuid, {
    ...msg,
    sender,
  });

  return msg;
};

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
    const msg = await saveAndPublishMessage({
      channelUuid: input.uuid,
      content: input.content,
      sender: context.user as User,
    });

    if (!msg) {
      throw errors.INTERNAL_SERVER_ERROR();
    }

    if (input.content.includes("@ai")) {
      const settings = await getChannelSettings(input.uuid);

      if (!settings) {
        throw errors.INTERNAL_SERVER_ERROR();
      }

      if (!settings.ai.enabled) {
        // biome-ignore lint/suspicious/noConsole: DEBUG
        console.log(
          `[sendMessageToChannel] AI is not enabled for channel: ${input.uuid}`
        );
        return msg;
      }

      const aiResponse = await generateAIResponse(input.uuid, settings.ai);

      await saveAndPublishMessage({
        channelUuid: input.uuid,
        content: aiResponse,
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
