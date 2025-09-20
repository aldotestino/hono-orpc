export const availableModels = [
  "openai/gpt-oss-20b:free",
  "openai/gpt-oss-120b:free",
  "x-ai/grok-4-fast:free",
  "nvidia/nemotron-nano-9b-v2:free",
  "moonshotai/kimi-k2:free",
] as const;

export type OpenRouterModel = (typeof availableModels)[number];

export type OpenRouterModelInfo = {
  tools: boolean;
  name: string;
};

export const availableModelsInfo: Record<OpenRouterModel, OpenRouterModelInfo> =
  {
    "openai/gpt-oss-20b:free": {
      tools: false,
      name: "OpenAI GPT-OSS 20B",
    },
    "openai/gpt-oss-120b:free": {
      tools: false,
      name: "OpenAI GPT-OSS 120B",
    },
    "x-ai/grok-4-fast:free": {
      tools: true,
      name: "Grok 4 Fast",
    },
    "nvidia/nemotron-nano-9b-v2:free": {
      tools: true,
      name: "Nemotron Nano 9B v2",
    },
    "moonshotai/kimi-k2:free": {
      tools: true,
      name: "Kimi K2",
    },
  };
