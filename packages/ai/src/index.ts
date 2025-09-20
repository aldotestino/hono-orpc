import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import { generateText, type ModelMessage, stepCountIs } from "ai";
import * as tools from "./tools";
import { availableModelsInfo, type OpenRouterModel } from "./types";
import { SYSTEM_PROMPT } from "./utils";

const openRouter = createOpenRouter({
  apiKey: process.env.OPENROUTER_API_KEY,
});

export function generateResponse({
  messages,
  model = "openai/gpt-oss-120b:free",
}: {
  messages: ModelMessage[];
  model?: OpenRouterModel;
}) {
  const modelInfo = availableModelsInfo[model];

  return generateText({
    model: openRouter(model),
    system: SYSTEM_PROMPT,
    stopWhen: stepCountIs(10),
    ...(modelInfo.tools && { tools }),
    messages,
  });
}
