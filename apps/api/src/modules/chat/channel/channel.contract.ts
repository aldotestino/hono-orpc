import {
  channelParticipantSchema,
  channelSchema,
  channelSettingsSchema,
  userSchema,
} from "@hono-orpc/db/schema";
import { oc } from "@orpc/contract";
import { z } from "zod/v4";

const channelContract = oc
  .route({
    tags: ["chat", "channel"],
  })
  .errors({
    UNAUTHORIZED: {},
  });

const getChannels = channelContract
  .route({
    method: "GET",
    description: "Get user's channels",
    path: "/chat/channel",
  })
  .errors({
    UNAUTHORIZED: {},
  })
  .output(z.array(channelSchema));

const createChannel = channelContract
  .route({
    method: "POST",
    description: "Create a new channel",
    path: "/chat/channel",
    successStatus: 201,
  })
  .errors({
    INTERNAL_SERVER_ERROR: {},
  })
  .input(
    z.object({
      name: z.string().min(1).describe("The name of the channel"),
      members: z
        .array(z.string())
        .min(1)
        .describe("The members of the channel"),
    })
  )
  .output(channelSchema);

const getChannel = channelContract
  .route({
    method: "GET",
    description: "Get a channel by id",
    path: "/chat/channel/{uuid}",
  })
  .errors({
    FORBIDDEN: {
      message: "You are not a member of this channel",
    },
    NOT_FOUND: {
      message: "Channel not found",
    },
  })
  .input(z.object({ uuid: z.uuid().describe("The uuid of the channel") }))
  .output(
    channelSchema.extend({
      participants: z
        .array(channelParticipantSchema.extend({ user: userSchema.nullable() }))
        .nullable(),
    })
  );

const deleteChannel = channelContract
  .route({
    method: "DELETE",
    description: "Delete a channel",
    path: "/chat/channel/{uuid}",
    successStatus: 204,
  })
  .errors({
    FORBIDDEN: {
      message: "You are not the owner of this channel",
    },
    NOT_FOUND: {
      message: "Channel not found",
    },
  })
  .input(z.object({ uuid: z.uuid().describe("The uuid of the channel") }));

const leaveChannel = channelContract
  .route({
    method: "POST",
    description: "Leave a channel",
    path: "/chat/channel/{uuid}/leave",
    successStatus: 204,
  })
  .errors({
    FORBIDDEN: {
      message: "You are not a member of this channel",
    },
  })
  .input(z.object({ uuid: z.uuid().describe("The uuid of the channel") }));

const removeMemberFromChannel = channelContract
  .route({
    method: "POST",
    description: "Remove a user from a channel",
    path: "/chat/channel/{uuid}/remove-member",
    successStatus: 204,
  })
  .errors({
    FORBIDDEN: {
      message: "You are not the owner of this channel",
    },
  })
  .input(
    z.object({
      uuid: z.uuid().describe("The uuid of the channel"),
      memberId: z.string().describe("The id of the member to remove"),
    })
  );

const addMembersToChannel = channelContract
  .route({
    method: "POST",
    description: "Add members to a channel",
    path: "/chat/channel/{uuid}/add-members",
    successStatus: 204,
  })
  .errors({
    FORBIDDEN: {
      message: "You are not the owner of this channel",
    },
  })
  .input(
    z.object({
      uuid: z.uuid().describe("The uuid of the channel"),
      memberIds: z.array(z.string()).describe("The ids of the members to add"),
    })
  );

const getChannelSettings = channelContract
  .route({
    method: "GET",
    description: "Get the settings of a channel",
    path: "/chat/channel/{uuid}/settings",
  })
  .errors({
    FORBIDDEN: {
      message: "You are not the owner of this channel",
    },
    NOT_FOUND: {
      message: "Channel not found",
    },
  })
  .input(z.object({ uuid: z.uuid().describe("The uuid of the channel") }))
  .output(channelSettingsSchema);

const setChannelSettings = channelContract
  .route({
    method: "POST",
    description: "Set the settings of a channel",
    path: "/chat/channel/{uuid}/settings",
  })
  .errors({
    FORBIDDEN: {
      message: "You are not the owner of this channel",
    },
  })
  .input(
    z.object({
      uuid: z.uuid().describe("The uuid of the channel"),
      settings: channelSettingsSchema,
    })
  )
  .output(channelSettingsSchema);

export default {
  getChannels,
  createChannel,
  getChannel,
  deleteChannel,
  leaveChannel,
  removeMemberFromChannel,
  addMembersToChannel,
  getChannelSettings,
  setChannelSettings,
};
