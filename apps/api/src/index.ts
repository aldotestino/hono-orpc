import { greetings } from '@hono-orpc/example';
import { Hono } from 'hono';

const app = new Hono();

app.get('/', (c) => c.text(greetings(c.req.query('name') ?? 'World')));

export default app;
