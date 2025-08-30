import { drizzle } from 'drizzle-orm/neon-http';
import {
  account,
  channels,
  messages,
  session,
  user,
  verification,
} from './schema';

const schema = { account, channels, messages, session, user, verification };

// biome-ignore lint/style/noNonNullAssertion: DATABASE_URL is set in the .env file
const db = drizzle(process.env.DATABASE_URL!, { schema });

export default db;
