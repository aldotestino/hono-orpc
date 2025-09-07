import { user } from '@hono-orpc/db/tables';
import { OpenAPIHandler } from '@orpc/openapi/fetch';
import { OpenAPIReferencePlugin } from '@orpc/openapi/plugins';
import { ZodToJsonSchemaConverter } from '@orpc/zod/zod4';
import { auth } from 'apps/api/src/lib/auth';
import { serveWebApp } from 'apps/api/src/middlewares/serve-web-app';
import { Hono } from 'hono';
import { logger } from 'hono/logger';
import db from 'packages/db/src';
import router from './modules/router';

// seed db with ai user
try {
  await db
    .insert(user)
    .values({
      id: 'ai',
      name: 'ChatAI',
      email: 'chatai@hono-orpc.com',
    })
    .onConflictDoNothing();
} catch (error) {
  // biome-ignore lint/suspicious/noConsole: seed db
  console.error(error);
  process.exit(1);
}

const handler = new OpenAPIHandler(router, {
  plugins: [
    new OpenAPIReferencePlugin({
      schemaConverters: [new ZodToJsonSchemaConverter()],
      specGenerateOptions: {
        info: {
          title: 'Hono oRPC Chat',
          version: '0.0.1',
        },
        servers: [{ url: '/api/rpc' }],
      },
    }),
  ],
});

const app = new Hono()
  .use('*', serveWebApp)
  .use(logger())
  .basePath('/api')
  .on(['POST', 'GET'], '/auth/**', (c) => auth.handler(c.req.raw))
  .use('/rpc/*', async (c, next) => {
    const { matched, response } = await handler.handle(c.req.raw, {
      prefix: '/api/rpc',
      context: {
        headers: c.req.raw.headers,
      },
    });

    if (matched) {
      return c.newResponse(response.body, response);
    }

    await next();
  });

export default app;
