import { OpenAPIHandler } from '@orpc/openapi/fetch';
import { OpenAPIReferencePlugin } from '@orpc/openapi/plugins';
import { ZodToJsonSchemaConverter } from '@orpc/zod/zod4';
import { serveWebApp } from 'apps/api/src/middlewares/serve-web-app';
import { Hono } from 'hono';
import { logger } from 'hono/logger';
import router from './router';

const handler = new OpenAPIHandler(router, {
  plugins: [
    new OpenAPIReferencePlugin({
      schemaConverters: [new ZodToJsonSchemaConverter()],
      specGenerateOptions: {
        info: {
          title: 'Hono ORPC',
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

app.get('/api/version', (c) => {
  const domain = process.env.RAILWAY_PUBLIC_DOMAIN
    ? `https://${process.env.RAILWAY_PUBLIC_DOMAIN}`
    : 'http://localhost:3000';

  return c.json({
    name: 'Hono oRPC Chat',
    version: 'v0.0.1',
    github: 'https://github.com/aldotestino/hono-orpc',
    docs: `${domain}/api/rpc`,
  });
});

app.use('/api/rpc/*', async (c, next) => {
  const { matched, response } = await handler.handle(c.req.raw, {
    prefix: '/api/rpc',
    context: {},
  });

  if (matched) {
    return c.newResponse(response.body, response);
  }

  await next();
});

export default app;
