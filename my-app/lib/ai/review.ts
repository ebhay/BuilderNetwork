import { createHash } from "node:crypto";
import { createAiClient } from "@/lib/ai/client";
import { aiReviewSchema, type AiReview } from "@/lib/ai/review-schema";

function scoreToBand(score: number): AiReview["qualityBand"] {
  if (score < 6) return "NEEDS_REVISION";
  if (score < 7.5) return "GOOD";
  if (score < 9) return "STRONG";
  return "EXCELLENT";
}

function deterministicMockReview(input: { title: string; description: string }): AiReview {
  const hash = createHash("sha256")
    .update(`${input.title}|${input.description}`)
    .digest("hex");
  const seed = Number.parseInt(hash.slice(0, 8), 16);
  // Generate a deterministic score between 0 and 10 with one decimal place
  const rawScore = (seed % 101) / 10;
  const score = Number(rawScore.toFixed(1));
  const qualityScore = Math.min(10, Math.max(0, score));
  const projectLevel: AiReview["projectLevel"] =
    qualityScore >= 8 ? "EXPERT" : qualityScore >= 6.5 ? "INTERMEDIATE" : "BEGINNER";

  return {
    qualityScore,
    qualityBand: scoreToBand(qualityScore),
    publishRecommendation: qualityScore >= 6 ? "publishable" : "revise-first",
    projectLevel,
    requiredSkills: ["Frontend", "Backend", "Database", "API Integration"],
    tags: ["Web App", "AI", "Builder Network"],
    marketAlternatives: [
      {
        name: "Similar category product",
        difference: "Targets related workflows with a different builder audience.",
      },
    ],
    worthinessReview:
      "The idea is practical and usable for builders, with clear room to sharpen differentiation.",
    feasibilityReview:
      "This is feasible as a staged MVP using common web infrastructure and API integrations.",
    brutalFeedback:
      "The concept is useful but needs one sharper reason users would pick it over existing tools.",
    suggestions: [
      "Add one concrete differentiator in the description.",
      "Narrow the first release to one core user workflow.",
      "State the minimum deliverable outcome for version one.",
    ],
  };
}

function splitTextList(input: string): string[] {
  return input
    .split(/\r?\n|•|- |\d+\.\s+/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function ensureMinWords(text: string, minWords: number) {
  const cleaned = text.trim().replace(/\s+/g, " ");
  const words = cleaned ? cleaned.split(" ") : [];
  if (words.length >= minWords) return cleaned;
  return `${cleaned} ${"This idea needs sharper problem definition, stronger user validation evidence, clearer first-release boundaries, measurable outcome targets, realistic differentiation from adjacent tools, and explicit tradeoff handling across scope, onboarding complexity, acquisition channels, retention mechanics, and execution risk before being considered high-quality and ready for confident public publication."
    .trim()}`.trim();
}

function expandSuggestion(text: string) {
  const cleaned = text.trim().replace(/\s+/g, " ");
  if (!cleaned) return "";
  const words = cleaned.split(" ").length;
  if (words >= 12) return cleaned;
  return `${cleaned} Include a concrete metric, target user segment, and first release scope boundary so execution decisions remain measurable and practical.`;
}

function normalizeAiReviewPayload(raw: unknown): unknown {
  const source = (raw ?? {}) as Record<string, unknown>;

  const normalizeScore = (value: unknown) => {
    const parsed =
      typeof value === "number"
        ? value
        : typeof value === "string"
          ? Number.parseFloat(value)
          : NaN;
    if (!Number.isFinite(parsed)) return null;
    const normalized = parsed > 10 && parsed <= 100 ? parsed / 10 : parsed;
    return Math.min(10, Math.max(0, Number(normalized.toFixed(1))));
  };

  const rawScore =
    typeof source.qualityScore === "number"
      ? source.qualityScore
      : typeof source.qualityScore === "string"
        ? Number.parseFloat(source.qualityScore)
        : 0;
  const normalizedRawScore = normalizeScore(rawScore) ?? 0;

  const rubricScores = [
    normalizeScore(source.clarityScore),
    normalizeScore(source.differentiationScore),
    normalizeScore(source.feasibilityScore),
    normalizeScore(source.mvpScopeScore),
  ].filter((v): v is number => typeof v === "number");

  const qualityScore =
    rubricScores.length >= 2
      ? Number((rubricScores.reduce((sum, value) => sum + value, 0) / rubricScores.length).toFixed(1))
      : normalizedRawScore;

  const qualityBand =
    source.qualityBand === "NEEDS_REVISION" ||
    source.qualityBand === "GOOD" ||
    source.qualityBand === "STRONG" ||
    source.qualityBand === "EXCELLENT"
      ? source.qualityBand
      : scoreToBand(qualityScore);

  const projectLevel =
    source.projectLevel === "BEGINNER" ||
    source.projectLevel === "INTERMEDIATE" ||
    source.projectLevel === "EXPERT"
      ? source.projectLevel
      : qualityScore >= 8
        ? "EXPERT"
        : qualityScore >= 6.5
          ? "INTERMEDIATE"
          : "BEGINNER";

  const requiredSkills = Array.isArray(source.requiredSkills)
    ? source.requiredSkills.map(String).map((s) => s.trim()).filter(Boolean)
    : typeof source.requiredSkills === "string"
      ? splitTextList(source.requiredSkills)
      : [];

  const tags = Array.isArray(source.tags)
    ? source.tags.map(String).map((s) => s.trim()).filter(Boolean)
    : typeof source.tags === "string"
      ? splitTextList(source.tags)
      : [];

  const marketAlternativesRaw = Array.isArray(source.marketAlternatives)
    ? source.marketAlternatives
    : typeof source.marketAlternatives === "string"
      ? splitTextList(source.marketAlternatives)
      : [];

  const marketAlternatives = marketAlternativesRaw
    .map((item) => {
      if (typeof item === "string") {
        return { name: item.trim(), difference: "Similar category option." };
      }
      const obj = item as Record<string, unknown>;
      const name = String(obj.name ?? obj.title ?? "").trim();
      const difference = String(obj.difference ?? obj.note ?? obj.description ?? "").trim();
      if (!name) return null;
      return {
        name,
        difference: difference || "Similar category option.",
      };
    })
    .filter((item): item is { name: string; difference: string } => Boolean(item));

  const suggestionsRaw = Array.isArray(source.suggestions)
    ? source.suggestions.map(String).map((s) => s.trim()).filter(Boolean)
    : typeof source.suggestions === "string"
      ? splitTextList(source.suggestions)
      : [];
  const suggestions = suggestionsRaw
    .map(expandSuggestion)
    .filter(Boolean)
    .slice(0, 6);

  return {
    qualityScore,
    qualityBand,
    publishRecommendation:
      String(source.publishRecommendation ?? "").trim() || (qualityScore >= 6 ? "publishable" : "revise-first"),
    projectLevel,
    requiredSkills: requiredSkills.length ? requiredSkills : ["General Development"],
    tags: tags.length ? tags : ["Builder"],
    marketAlternatives: marketAlternatives.length
      ? marketAlternatives
      : [{ name: "Similar category product", difference: "Comparable use case with different execution." }],
    worthinessReview: ensureMinWords(
      String(source.worthinessReview ?? source.worthReview ?? "").trim() ||
        "The idea solves a real builder workflow, but the current framing is still generic and lacks a decisive value edge. It needs sharper audience targeting, clearer problem severity, and measurable expected outcomes so builders can quickly validate whether this is worth prioritizing over adjacent alternatives.",
      35,
    ),
    feasibilityReview: ensureMinWords(
      String(source.feasibilityReview ?? source.feasibility ?? "").trim() ||
        "The concept is technically feasible, but execution risk depends on strict scope control and realistic sequencing. Integration complexity, onboarding friction, and data assumptions should be validated early. Without narrower boundaries and explicit dependency planning, implementation effort can expand quickly and reduce delivery confidence.",
      35,
    ),
    brutalFeedback: ensureMinWords(
      String(source.brutalFeedback ?? source.feedback ?? "").trim() ||
        "Your current concept is too broad, and the value proposition remains under-defined across user segment, acquisition, activation, and retention. Without a narrow MVP scope, concrete differentiation, and measurable success criteria, execution risk stays high. The idea needs stronger focus, explicit tradeoffs, and realistic validation signals before it can be considered investment-worthy or truly builder-ready.",
      50,
    ),
    suggestions: suggestions.length
      ? suggestions
      : [
          "Define one exact user persona and one painful job-to-be-done with measurable success criteria for week one.",
          "Reduce MVP scope to one core workflow and defer all secondary features until initial usage and retention evidence appears.",
          "Add explicit differentiation versus alternatives using pricing, workflow speed, or outcome quality with concrete benchmark targets.",
        ],
  };
}

export async function generateAiReview(input: {
  title: string;
  description: string;
}): Promise<{ review: AiReview; source: "openrouter" | "nim" | "mock" }> {
  const systemPrompt =
    "You are a strict startup idea reviewer. Return strict JSON only with keys: qualityScore, qualityBand, publishRecommendation, projectLevel, requiredSkills, tags, marketAlternatives, worthinessReview, feasibilityReview, brutalFeedback, suggestions, clarityScore, differentiationScore, feasibilityScore, mvpScopeScore. All score fields must be numeric in 0-10 with one decimal, not percent. Avoid score inflation: 9-10 only for truly exceptional ideas with clear proof in the text. worthinessReview must be at least 35 words with specific strengths, weaknesses, and market clarity. feasibilityReview must be at least 35 words with explicit MVP constraints, execution risks, and dependency concerns. brutalFeedback must be at least 50 words and contain specific, actionable critical analysis. suggestions must contain 3 to 6 concrete items, each at least 12 words, each with measurable action language. Never rewrite user title/description. Use broad skill categories. Use quality bands: NEEDS_REVISION, GOOD, STRONG, EXCELLENT.";
  const userPrompt = `Title: ${input.title}\nDescription: ${input.description}`;

  const tryGenerate = async ({
    provider,
    model,
    timeoutMs,
  }: {
    provider: "openrouter" | "nim";
    model: string;
    timeoutMs?: number;
  }) => {
    const client = createAiClient(provider);
    if (!client) throw new Error(`${provider} client not configured (missing API key/env).`);

    const timeout = timeoutMs
      ? new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error(`${provider} timeout after ${timeoutMs}ms`)), timeoutMs),
        )
      : null;

    const request = client.chat.completions.create(
      {
        model,
        temperature: 0.2,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        response_format: { type: "json_object" },
        stream: false,
      },
      provider === "openrouter"
        ? {
            headers: {
              "HTTP-Referer": process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
              "X-Title": "Builder Network",
            },
          }
        : undefined,
    );

    const completion = timeout ? await Promise.race([request, timeout]) : await request;
    const content = completion.choices[0]?.message?.content;
    if (!content) throw new Error(`${provider} returned empty content`);

    const parsedJson = JSON.parse(content);
    const normalized = normalizeAiReviewPayload(parsedJson);
    const review = aiReviewSchema.parse(normalized);
    return review;
  };

  const openRouterModel = process.env.OPENROUTER_MODEL ?? process.env.AI_MODEL ?? "deepseek/deepseek-chat-v3-0324:free";
  const nimModel = process.env.NVIDIA_MODEL ?? process.env.AI_MODEL ?? "deepseek-ai/deepseek-v4-pro";
  const openRouterTimeoutMs = Number.parseInt(process.env.OPENROUTER_TIMEOUT_MS ?? "45000", 10);
  const nimTimeoutMs = Number.parseInt(process.env.NVIDIA_TIMEOUT_MS ?? "45000", 10);
  const strictOpenRouterTimeoutFallback =
    (process.env.OPENROUTER_TIMEOUT_ONLY_FALLBACK ?? "true").toLowerCase() !== "false";
  const providerErrors: string[] = [];

  try {
    const openRouterReview = await tryGenerate({
      provider: "openrouter",
      model: openRouterModel,
      timeoutMs: Number.isFinite(openRouterTimeoutMs) ? openRouterTimeoutMs : 45_000,
    });
    if (openRouterReview) {
      return { review: openRouterReview, source: "openrouter" };
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : "unknown error";
    providerErrors.push(`openrouter: ${message}`);
    const isTimeout = message.toLowerCase().includes("timeout");
    if (strictOpenRouterTimeoutFallback && !isTimeout) {
      throw new Error(`OpenRouter failed before timeout. ${message}`);
    }
  }

  try {
    const nimReview = await tryGenerate({
      provider: "nim",
      model: nimModel,
      timeoutMs: Number.isFinite(nimTimeoutMs) ? nimTimeoutMs : 45_000,
    });
    if (nimReview) {
      return { review: nimReview, source: "nim" };
    }
  } catch (error) {
    providerErrors.push(`nim: ${error instanceof Error ? error.message : "unknown error"}`);
  }

  if (process.env.NODE_ENV !== "production") {
    return { review: deterministicMockReview(input), source: "mock" };
  }
  throw new Error(`AI providers failed. ${providerErrors.join(" | ")}`);
}
