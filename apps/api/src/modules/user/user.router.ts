import db from '@hono-orpc/db';
import { user } from '@hono-orpc/db/tables';
import { implement } from '@orpc/server';
import { and, eq, like, not, or } from 'drizzle-orm';
import { authMiddleware } from '../../middlewares/auth-middleware';
import userContract from './user.contract';

const userRouter = implement(userContract).$context<{ headers: Headers }>();

const searchUser = userRouter.searchUser
  .use(authMiddleware)
  .handler(async ({ input, context }) => {
    const users = await db.query.user.findMany({
      where: and(
        not(eq(user.id, context.user.id)),
        or(
          like(user.name, `%${input.query}%`),
          like(user.email, `%${input.query}%`)
        )
      ),
    });

    return users;
  });

export default {
  searchUser,
};
