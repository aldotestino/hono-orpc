import { drizzle } from 'drizzle-orm/neon-http';
import {
  account,
  channel,
  channelParticipant,
  channelRole,
  message,
  session,
  user,
  verification,
} from './schema';

const schema = {
  account,
  channel,
  message,
  session,
  user,
  verification,
  channelParticipant,
  channelRole,
};

// biome-ignore lint/style/noNonNullAssertion: DATABASE_URL is set in the .env file
const db = drizzle(process.env.DATABASE_URL!, { schema });

export default db;
