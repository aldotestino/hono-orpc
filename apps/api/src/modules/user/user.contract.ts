import { userSchema } from '@hono-orpc/db/schema';
import { oc } from '@orpc/contract';
import { z } from 'zod/v4';

const userContract = oc
  .route({
    tags: ['user'],
  })
  .errors({
    UNAUTHORIZED: {},
  });

const searchUser = userContract
  .route({
    method: 'POST',
    description: 'Search for a user',
    path: '/user/search',
  })
  .input(
    z.object({
      query: z.string().describe('The query to search for a user'),
    })
  )
  .output(z.array(userSchema));

export default {
  searchUser,
};
