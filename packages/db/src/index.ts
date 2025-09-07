import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./tables";

// biome-ignore lint/style/noNonNullAssertion: DATABASE_URL is set in the .env file
const db = drizzle(process.env.DATABASE_URL!, { schema });

export default db;
