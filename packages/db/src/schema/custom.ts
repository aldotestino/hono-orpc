import { availableModels } from "@hono-orpc/ai/types";
import { z } from "zod/v4";

export const channelSettingsSchema = z.object({
  ai: z.object({
    enabled: z.boolean().default(false),
    model: z.enum(availableModels).default("openai/gpt-oss-120b:free"),
    maxMessages: z.number().default(10),
  }),
});

export type ChannelSettings = z.infer<typeof channelSettingsSchema>;
