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
  const score = Number((4.5 + ((seed % 50) / 10)).toFixed(1));
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

function normalizeAiReviewPayload(raw: unknown): unknown {
  const source = (raw ?? {}) as Record<string, unknown>;

  const rawScore =
    typeof source.qualityScore === "number"
      ? source.qualityScore
      : typeof source.qualityScore === "string"
        ? Number.parseFloat(source.qualityScore)
        : 0;
  const qualityScore = Number.isFinite(rawScore) ? Math.min(10, Math.max(0, rawScore)) : 0;

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

  const suggestions = Array.isArray(source.suggestions)
    ? source.suggestions.map(String).map((s) => s.trim()).filter(Boolean)
    : typeof source.suggestions === "string"
      ? splitTextList(source.suggestions)
      : [];

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
    worthinessReview: String(source.worthinessReview ?? source.worthReview ?? "").trim() || "Needs clearer differentiation.",
    feasibilityReview: String(source.feasibilityReview ?? source.feasibility ?? "").trim() || "Feasible with staged MVP execution.",
    brutalFeedback: String(source.brutalFeedback ?? source.feedback ?? "").trim() || "Clarify the strongest unique value proposition.",
    suggestions: suggestions.length ? suggestions : ["Define one clear differentiator for the first release."],
  };
}

export async function generateAiReview(input: {
  title: string;
  description: string;
}): Promise<{ review: AiReview; source: "nim" | "mock" }> {
  const client = createAiClient();
  const model = process.env.AI_MODEL ?? "deepseek-ai/deepseek-v4-pro";

  if (!client) {
    if (process.env.NODE_ENV !== "production") {
      return { review: deterministicMockReview(input), source: "mock" };
    }
    throw new Error("AI API key is missing in production environment.");
  }

  const systemPrompt =
    "You are an AI reviewer. Return strict JSON only with keys: qualityScore, qualityBand, publishRecommendation, projectLevel, requiredSkills, tags, marketAlternatives, worthinessReview, feasibilityReview, brutalFeedback, suggestions. Never rewrite user title/description. Use broad skill categories. Use quality bands: NEEDS_REVISION, GOOD, STRONG, EXCELLENT.";
  const userPrompt = `Title: ${input.title}\nDescription: ${input.description}`;

  const completion = await client.chat.completions.create({
    model,
    temperature: 0.2,
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
    response_format: { type: "json_object" },
  });

  const content = completion.choices[0]?.message?.content;
  if (!content) {
    throw new Error("AI response content was empty.");
  }

  const parsedJson = JSON.parse(content);
  const normalized = normalizeAiReviewPayload(parsedJson);
  const review = aiReviewSchema.parse(normalized);
  return { review, source: "nim" };
}
