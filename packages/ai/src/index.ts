import type { Message, User } from '@hono-orpc/db/schema';
import { createOpenRouter } from '@openrouter/ai-sdk-provider';
import { generateText, type ModelMessage } from 'ai';
import tools from './tools';

type GenerateResponseProps = {
  messages: (Message & { sender: User | null })[];
  model?: string;
  toolCalling?: boolean;
};

const SYSTEM_PROMPT =
  "You are a helpful assistant that answers to users in a chat application. You have to be concise and to the point, imagine being one of the users of the application. If the message is from a user you will find his name in the top of the content, with the format 'Member: <name>\n<content>'.";

const openRouter = createOpenRouter({
  apiKey: process.env.OPEN_ROUTER_API_KEY,
});

const toModelMessage = (
  message: Message & { sender: User | null }
): ModelMessage => {
  if (message.sender) {
    return {
      role: 'user',
      content: `Member: ${message.sender.name}\n${message.content}`,
    };
  }

  return {
    role: 'assistant',
    content: message.content,
  };
};

export function generateResponse({
  messages,
  model = 'openai/gpt-oss-120b:free',
  toolCalling = false,
}: GenerateResponseProps) {
  const modelMessages = messages.map(toModelMessage);

  return generateText({
    model: openRouter(model),
    system: SYSTEM_PROMPT,
    ...(toolCalling ? { tools } : {}),
    messages: modelMessages,
  });
}
