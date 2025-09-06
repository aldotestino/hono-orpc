import { oc } from '@orpc/contract';
import { z } from 'zod/v4';

const health = oc
  .route({
    tags: ['health'],
    method: 'GET',
    description: 'Check the health of the server',
    path: '/health',
  })
  .output(z.object({ status: z.literal('ok') }));

export default {
  health,
};
