import router from '@hono-orpc/api';
import { createORPCClient } from '@orpc/client';
import type { ContractRouterClient } from '@orpc/contract';
import type { JsonifiedClient } from '@orpc/openapi-client';
import { OpenAPILink } from '@orpc/openapi-client/fetch';
import { createTanstackQueryUtils } from '@orpc/tanstack-query';

const link = new OpenAPILink(router, {
  url: `${window.location.origin}/api/rpc`,
  eventIteratorKeepAliveEnabled: true,
  eventIteratorKeepAliveInterval: 5000,
  eventIteratorKeepAliveComment: '',
});

const client: JsonifiedClient<ContractRouterClient<typeof router>> =
  createORPCClient(link);

export const orpc = createTanstackQueryUtils(client);
