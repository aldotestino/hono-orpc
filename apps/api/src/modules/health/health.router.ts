import { implement } from '@orpc/server';
import healthContract from './health.contract';

const healthRouter = implement(healthContract);

const health = healthRouter.health.handler(() => {
  return {
    status: 'ok',
  };
});

export default {
  health,
};
