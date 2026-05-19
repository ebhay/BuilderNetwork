import OpenAI from "openai";

export function createAiClient() {
  const apiKey = process.env.AI_API_KEY ?? process.env.NVIDIA_API_KEY;
  const baseURL =
    process.env.AI_BASE_URL ?? "https://integrate.api.nvidia.com/v1";

  if (!apiKey) {
    return null;
  }

  return new OpenAI({
    apiKey,
    baseURL,
  });
}
