import { drizzle } from 'drizzle-orm/neon-http';
import { channels, messages } from './schema';

const schema = { channels, messages };

// biome-ignore lint/style/noNonNullAssertion: DATABASE_URL is set in the .env file
const db = drizzle(process.env.DATABASE_URL!, { schema });

export default db;
