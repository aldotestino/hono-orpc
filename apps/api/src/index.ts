import { OpenAPIHandler } from '@orpc/openapi/fetch';
import { OpenAPIReferencePlugin } from '@orpc/openapi/plugins';
import { ZodToJsonSchemaConverter } from '@orpc/zod/zod4';
import { Hono } from 'hono';
import { logger } from 'hono/logger';
import { auth } from './lib/auth';
import { seedChatAIUser } from './lib/seed';
import { serveWebApp } from './middlewares/serve-web-app';
import router from './modules/router';

// seed db with ai user
await seedChatAIUser();

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
