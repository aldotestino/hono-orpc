import db from "@hono-orpc/db";
import { channel, channelParticipant } from "@hono-orpc/db/tables";
import { implement } from "@orpc/server";
import { and, eq } from "drizzle-orm";
import { authMiddleware } from "../../../middlewares/auth-middleware";
import { userInChannelMiddleware } from "../../../middlewares/user-in-channel-middleware";
import { userIsChannelOwnerMiddleware } from "../../../middlewares/user-is-channel-owner-middleware";
import channelContract from "./channel.contract";

const chatRouter = implement(channelContract).$context<{ headers: Headers }>();

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
        message: "Failed to create channel",
      });
    }

    // add members and owner
    await db.insert(channelParticipant).values([
      {
        channelUuid: ch.uuid,
        userId: context.user.id,
        role: "owner",
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

const getChannelSettings = chatRouter.getChannelSettings
  .use(authMiddleware)
  .use(userIsChannelOwnerMiddleware)
  .handler(async ({ input, errors }) => {
    const ch = await db.query.channel.findFirst({
      where: eq(channel.uuid, input.uuid),
    });

    if (!ch) {
      throw errors.NOT_FOUND();
    }

    return ch.settings;
  });

const setChannelSettings = chatRouter.setChannelSettings
  .use(authMiddleware)
  .use(userIsChannelOwnerMiddleware)
  .handler(async ({ input }) => {
    await db
      .update(channel)
      .set({ settings: input.settings })
      .where(eq(channel.uuid, input.uuid));

    return input.settings;
  });

export default {
  getChannels,
  createChannel,
  getChannel,
  addMembersToChannel,
  removeMemberFromChannel,
  deleteChannel,
  leaveChannel,
  getChannelSettings,
  setChannelSettings,
};
