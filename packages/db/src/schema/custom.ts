import { z } from "zod/v4";

export const channelSettingsSchema = z.object({
  ai: z.object({
    enabled: z.boolean().default(false),
    model: z
      .enum([
        "openrouter/sonoma-dusk-alpha",
        "openrouter/sonoma-sky-alpha",
        "openai/gpt-oss-120b:free",
        "openai/gpt-oss-20b:free",
      ])
      .default("openrouter/sonoma-dusk-alpha"),
    maxMessages: z.number().default(10),
  }),
});
export type ChannelSettings = z.infer<typeof channelSettingsSchema>;
