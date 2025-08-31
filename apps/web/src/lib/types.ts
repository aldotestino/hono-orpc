import type { User } from '@hono-orpc/db/schema';

export type SimpleUser = Pick<User, 'id' | 'name' | 'image' | 'email'>;
