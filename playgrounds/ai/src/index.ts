/** biome-ignore-all lint/suspicious/noConsole: playground */
import { generateResponse } from "@hono-orpc/ai";
import type { ModelMessage } from "ai";

const messages: ModelMessage[] = [];

// biome-ignore lint/nursery/noUnnecessaryConditions: cli app
while (true) {
  const input = prompt("Ask something to ChatAI:");

  if (!input || input.trim() === "") {
    continue;
  }

  messages.push({role: "user", content: input});

  const response = await generateResponse({
    messages,
    model: "x-ai/grok-4-fast:free",
  });

  const now = new Date().toISOString();

  await Bun.write(`${now}.json`, JSON.stringify(response, null, 2));

  const output = response.content.at(-1);

  if(!output) {
    console.log("No output");
    continue;
  }

  if(output.type !== "text") {
    console.log(`Last output is not of type text ${output.type}`);
    continue;
  }

  console.log(output.text);
  messages.push({ role: "assistant", content: output.text });
}
