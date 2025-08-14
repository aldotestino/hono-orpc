import { OpenAPIHandler } from '@orpc/openapi/fetch';
import { OpenAPIReferencePlugin } from '@orpc/openapi/plugins';
import { ZodToJsonSchemaConverter } from '@orpc/zod/zod4';
import { Hono } from 'hono';
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
      },
    }),
  ],
});

const app = new Hono();

app.get('/api/version', (c) =>
  c.json({
    name: 'Hono ORPC',
    version: 'v0.0.1',
    github: 'https://github.com/aldotestino/hono-orpc',
    docs: 'http://localhost:3000/api/rpc',
  })
);

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
