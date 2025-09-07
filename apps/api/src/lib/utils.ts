import { generateResponse } from "@hono-orpc/ai";
import db from "@hono-orpc/db";
import type { ChannelSettings } from "@hono-orpc/db/schema";
import { channelParticipant, message } from "@hono-orpc/db/tables";
import { tool } from "ai";
import { desc, eq } from "drizzle-orm";
import { z } from "zod/v4";
import fs from "fs";

const getExtraTools = (channelUuid: string) => ({
  channelMembers: tool({
    description: "Get the members of the channel",
    inputSchema: z.object({}),
    execute: async () => {
      const members = await db.query.channelParticipant.findMany({
        where: eq(channelParticipant.channelUuid, channelUuid),
        with: {
          user: true,
        },
      });
      return members.map(m => ({
        role: m.role,
        name: m.user.name,
        email: m.user.email
      }));
    },
  })
});

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

    const response = await generateResponse({
      messages: invertedMessages,
      model: channelAISettings.model,
      extraTools: getExtraTools(channelUuid),
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
