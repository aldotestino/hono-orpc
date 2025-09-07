/** biome-ignore-all lint/suspicious/noConsole: playground */
import { generateResponse } from '@hono-orpc/ai';
import type { Message, User } from '@hono-orpc/db/schema';

function userMessage(content: string) {
  return {
    uuid: "1",
    senderId: "1",
    content,
    channelUuid: "1",
    createdAt: new Date().toISOString(),
    sender: {
      name: "John Doe",
      id: "1",
      email: "john.doe@example.com",
      image: null,
    },
  } as Message & { sender: User }
}

function botMessage(content: string) {
  return {
    uuid: "1",
    senderId: "bot",
    content,
    channelUuid: "1",
    createdAt: new Date().toISOString(),
    sender: null,
  } as Message & { sender: null }
}

const response = await generateResponse({ 
  messages: [
    userMessage("Hello, how are you?"),
    botMessage("I'm good, thank you! How can I help you today?"),
    userMessage("Can you help me with a math problem?"),
    botMessage("Sure, what's the problem?"),
    userMessage("What's 2 + 2?"),
  ],
  model: process.env.MODEL,
  toolCalling: true,
});

console.log(response);