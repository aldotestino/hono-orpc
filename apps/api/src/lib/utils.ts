import db from "@hono-orpc/db";
import { channel, message } from "@hono-orpc/db/tables";
import { desc, eq } from "drizzle-orm";
import { generateResponse } from "packages/ai/src";
import type { ChannelSettings } from "packages/db/src/schema";

export const getChannelSettings = async (channelUuid: string) => {
  const ch = await db.query.channel.findFirst({
    where: eq(channel.uuid, channelUuid),
  });

  if (!ch) {
    return null;
  }

  return ch?.settings;
};

export const generateAIResponse = async (
  channelUuid: string,
  channelAISettings: ChannelSettings["ai"]
) => {
  const lastMessages = await db.query.message.findMany({
    where: eq(message.channelUuid, channelUuid),
    orderBy: desc(message.createdAt),
    limit: 10,
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

    const response = await generateResponse({
      messages: invertedMessages,
      model: channelAISettings.model,
      enableTools: channelAISettings.tools,
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
