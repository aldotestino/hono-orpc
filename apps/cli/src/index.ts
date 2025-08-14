/** biome-ignore-all lint/suspicious/noConsole: cli */
import router from '@hono-orpc/api';
import { createORPCClient } from '@orpc/client';
import type { ContractRouterClient } from '@orpc/contract';
import type { JsonifiedClient } from '@orpc/openapi-client';
import { OpenAPILink } from '@orpc/openapi-client/fetch';

const link = new OpenAPILink(router, {
  url: 'http://localhost:3000/api/rpc',
});

const client: JsonifiedClient<ContractRouterClient<typeof router>> =
  createORPCClient(link);

async function main() {
  const name = prompt("What's your name?") ?? '';

  try {
    if (name) {
      const res = await client.greetings.user({ name });
      console.log(`System says: ${res.message}!`);
    } else {
      const res = await client.greetings.random();
      console.log(`All right, then. Keep your secrets: ${res.message}!`);
    }
  } catch (e: unknown) {
    console.error(e instanceof Error ? e.message : 'Unknown error');
  }
}

main();
