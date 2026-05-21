import OpenAI from "openai";

type Provider = "openrouter" | "nim" | "default";

function pickEnv(value: string | undefined) {
  const v = value?.trim();
  return v ? v : null;
}

export function createAiClient(provider: Provider = "default") {
  const config =
    provider === "openrouter"
      ? {
          apiKey: pickEnv(process.env.OPENROUTER_API_KEY),
          baseURL: pickEnv(process.env.OPENROUTER_BASE_URL) ?? "https://openrouter.ai/api/v1",
        }
      : provider === "nim"
        ? {
            apiKey: pickEnv(process.env.NVIDIA_API_KEY) ?? pickEnv(process.env.AI_API_KEY),
            baseURL: pickEnv(process.env.NVIDIA_BASE_URL) ?? "https://integrate.api.nvidia.com/v1",
          }
        : {
            apiKey: pickEnv(process.env.AI_API_KEY) ?? pickEnv(process.env.NVIDIA_API_KEY),
            baseURL: pickEnv(process.env.AI_BASE_URL) ?? "https://integrate.api.nvidia.com/v1",
          };

  if (!config.apiKey) {
    return null;
  }

  return new OpenAI({
    apiKey: config.apiKey,
    baseURL: config.baseURL,
  });
}
