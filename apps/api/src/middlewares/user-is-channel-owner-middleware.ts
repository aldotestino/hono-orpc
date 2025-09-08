import { channel } from "@hono-orpc/db/tables";
import { ORPCError, os } from "@orpc/server";
import type { User } from "better-auth";
import { eq } from "drizzle-orm";
import db from "packages/db/src";

export const userIsChannelOwnerMiddleware = os
  .$context<{ headers: Headers; user: User }>()
  .middleware(async ({ context, next }, input: { uuid: string }) => {
    const ch = await db.query.channel.findFirst({
      where: eq(channel.uuid, input.uuid),
    });

    if (!ch) {
      throw new ORPCError("NOT_FOUND");
    }

    if (ch.ownerId !== context.user.id) {
      throw new ORPCError("FORBIDDEN");
    }

    return next();
  });
