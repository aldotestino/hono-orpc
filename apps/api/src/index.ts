import { OpenAPIHandler } from '@orpc/openapi/fetch';
import { OpenAPIReferencePlugin } from '@orpc/openapi/plugins';
import { ZodToJsonSchemaConverter } from '@orpc/zod/zod4';
import { auth } from 'apps/api/src/lib/auth';
import { serveWebApp } from 'apps/api/src/middlewares/serve-web-app';
import { Hono } from 'hono';
import { logger } from 'hono/logger';
import router from './modules/router';

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

const app = new Hono();

app.use('*', serveWebApp);

app.use(logger());

app.on(['POST', 'GET'], '/api/auth/**', (c) => auth.handler(c.req.raw));

app.use('/api/rpc/*', async (c, next) => {
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
