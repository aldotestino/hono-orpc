import { messageSchema, userSchema } from "@hono-orpc/db/schema";
import { eventIterator, oc } from "@orpc/contract";
import { z } from "zod/v4";

const messageContract = oc
  .route({
    tags: ["chat", "message"],
  })
  .errors({
    UNAUTHORIZED: {},
  });

const getChannelMessages = messageContract
  .route({
    method: "GET",
    description: "Get messages of a channel",
    path: "/chat/channel/{uuid}/message",
  })
  .errors({
    FORBIDDEN: {
      message: "You are not a member of this channel",
    },
    NOT_FOUND: {
      message: "Channel not found",
    },
  })
  .input(
    z.object({
      uuid: z.uuid().describe("The uuid of the channel"),
    })
  )
  .output(z.array(messageSchema.extend({ sender: userSchema.nullable() })));

const sendMessageToChannel = messageContract
  .route({
    method: "POST",
    description: "Send a message to a channel",
    path: "/chat/channel/{uuid}/message",
  })
  .errors({
    FORBIDDEN: {
      message: "You are not a member of this channel",
    },
    INTERNAL_SERVER_ERROR: {
      message: "Something went wrong",
    },
  })
  .input(
    z.object({
      uuid: z.uuid().describe("The uuid of the channel"),
      content: z.string().min(1).describe("The content of the message"),
    })
  )
  .output(messageSchema);

const streamChannelMessages = messageContract
  .route({
    method: "GET",
    description: "Stream messages by channel",
    path: "/chat/channel/{uuid}/message/stream",
  })
  .errors({
    FORBIDDEN: {
      message: "You are not a member of this channel",
    },
  })
  .input(z.object({ uuid: z.uuid().describe("The uuid of the channel") }))
  .output(
    eventIterator(messageSchema.extend({ sender: userSchema.nullable() }))
  );

export default {
  getChannelMessages,
  sendMessageToChannel,
  streamChannelMessages,
};
