import { z } from "zod/v4";

export const channelSettingsSchema = z.object({
  ai: z.object({
    enabled: z.boolean().default(false),
    model: z
      .enum([
        "openrouter/sonoma-dusk-alpha",
        "openai/gpt-oss-120b:free",
        "openai/gpt-oss-20b:free",
      ])
      .default("openrouter/sonoma-dusk-alpha"),
    tools: z.boolean().default(false),
  }),
});
export type ChannelSettings = z.infer<typeof channelSettingsSchema>;
