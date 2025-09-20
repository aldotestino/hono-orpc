import { generateResponse } from "@hono-orpc/ai";
import db from "@hono-orpc/db";
import type { ChannelSettings, Message, User } from "@hono-orpc/db/schema";
import { message } from "@hono-orpc/db/tables";
import type { ModelMessage } from "ai";
import { desc, eq } from "drizzle-orm";

const toModelMessage = (
  msg: Message & { sender: User | null }
): ModelMessage => {
  if (msg.sender && msg.senderId !== "ai") {
    return {
      role: "user",
      content: `${msg.sender.name}\n\n${msg.content.replace("@ai", "")}`,
    };
  }

  return {
    role: "assistant",
    content: msg.content,
  };
};

export const generateAIResponse = async (
  channelUuid: string,
  channelAISettings: ChannelSettings["ai"]
) => {
  const lastMessages = await db.query.message.findMany({
    where: eq(message.channelUuid, channelUuid),
    orderBy: desc(message.createdAt),
    limit: channelAISettings.maxMessages,
    with: {
      sender: true,
    },
  });

  const invertedMessages = lastMessages.reverse();

  try {
    // biome-ignore lint/suspicious/noConsole: DEBUG
    console.log(
      `[generateAIResponse] Generating AI response with: ${JSON.stringify(channelAISettings)}`
    );

    const modelMessages = invertedMessages.map(toModelMessage);

    const response = await generateResponse({
      messages: modelMessages,
      model: channelAISettings.model,
    });

    // biome-ignore lint/suspicious/noConsole: DEBUG
    console.log(
      `[generateAIResponse] Generated AI response usage: ${JSON.stringify(response.usage)}`
    );

    if (response.content.length === 0) {
      throw new Error("No response content");
    }

    const lastResponse = response.content.at(-1);

    if (lastResponse?.type !== "text") {
      throw new Error("Last response is not a text");
    }

    return lastResponse.text;
  } catch (error) {
    // biome-ignore lint/suspicious/noConsole: DEBUG
    console.error(
      `[generateAIResponse] Failed to generate AI response: ${error instanceof Error ? error.message : JSON.stringify(error)}`
    );
    return "Failed to generate AI response";
  }
};
