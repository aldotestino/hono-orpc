import db from '@hono-orpc/db';
import type { User } from '@hono-orpc/db/schema';
import { user } from '@hono-orpc/db/tables';

export const CHAT_AI_USER: User = {
  id: 'ai',
  email: 'chatai@hono-orpc.com',
  name: 'ChatAI',
  image: null,
};

export const seedChatAIUser = async () => {
  await db
    .insert(user)
    .values(CHAT_AI_USER)
    .onConflictDoUpdate({
      target: [user.id],
      set: CHAT_AI_USER,
    });
};
