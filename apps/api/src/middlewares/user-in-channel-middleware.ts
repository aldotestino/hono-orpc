import { ORPCError, os } from '@orpc/server';
import type { User } from 'better-auth';
import { and, eq } from 'drizzle-orm';
import db from 'packages/db/src';
import { channelParticipant } from 'packages/db/src/tables';

export const userInChannelMiddleware = os
  .$context<{ headers: Headers; user: User }>()
  .middleware(async ({ context, next }, input: { uuid: string }) => {
    const [userInChannel] = await db
      .select()
      .from(channelParticipant)
      .where(
        and(
          eq(channelParticipant.channelUuid, input.uuid),
          eq(channelParticipant.userId, context.user.id)
        )
      );

    if (!userInChannel) {
      throw new ORPCError('FORBIDDEN');
    }

    return next();
  });
