import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function invokeLLM(
  prompt: string,
  systemPrompt?: string,
  maxTokens = 4096
): Promise<string> {
  const response = await client.messages.create({
    model: "claude-opus-4-6",
    max_tokens: maxTokens,
    ...(systemPrompt ? { system: systemPrompt } : {}),
    messages: [{ role: "user", content: prompt }],
  });
  const block = response.content[0];
  return block.type === "text" ? block.text : "";
}

export async function invokeLLMJson<T>(
  prompt: string,
  systemPrompt?: string
): Promise<T> {
  const raw = await invokeLLM(prompt, systemPrompt);
  const match = raw.match(/```json\s*([\s\S]*?)\s*```/) || raw.match(/(\[[\s\S]*\]|\{[\s\S]*\})/);
  if (\!match) throw new Error("LLM did not return parseable JSON");
  return JSON.parse(match[1]) as T;
}
