import { greet, greetRandom } from '@hono-orpc/example';
import { os } from '@orpc/server';
import { z } from 'zod/v4';

const greetingsRouter = os.route({
  tags: ['greetings'],
});

const user = greetingsRouter
  .route({
    method: 'GET',
    description: 'Greet a user',
    path: '/greetings',
  })
  .input(
    z.object({
      name: z.string().min(1).describe('The name of the user to greet'),
    })
  )
  .output(z.object({ message: z.string().describe('The greeting message') }))
  .handler(({ input: { name } }) => {
    return { message: greet(name) };
  });

const random = greetingsRouter
  .route({
    method: 'GET',
    description: 'Greet a random user',
    path: '/greetings/random',
  })
  .output(z.object({ message: z.string().describe('The greeting message') }))
  .handler(() => {
    return { message: greetRandom() };
  });

// const stream = greetingsRouter
//   .route({
//     method: 'GET',
//     description: 'Stream greetings',
//     path: '/greetings/stream',
//   })
//   .output(
//     eventIterator(
//       z.object({ message: z.string().describe('The greeting message') })
//     )
//   )
//   .handler(async function* ({ signal }) {
//     const TIMEOUT_MS = 1000;

//     while (!signal?.aborted) {
//       yield { message: greetRandom() };
//       await new Promise((resolve) => setTimeout(resolve, TIMEOUT_MS));
//     }
//   });

export default {
  user,
  random,
};
