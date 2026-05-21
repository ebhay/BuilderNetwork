import { z } from "zod";

export const aiAlternativeSchema = z.object({
  name: z.string().min(1),
  difference: z.string().min(1),
});

function hasMinWords(value: string, minWords: number) {
  return value.trim().split(/\s+/).filter(Boolean).length >= minWords;
}

export const aiReviewSchema = z.object({
  qualityScore: z.number().min(0).max(10),
  qualityBand: z.enum(["NEEDS_REVISION", "GOOD", "STRONG", "EXCELLENT"]),
  publishRecommendation: z.string().min(1),
  projectLevel: z.enum(["BEGINNER", "INTERMEDIATE", "EXPERT"]),
  requiredSkills: z.array(z.string().min(1)).min(1),
  tags: z.array(z.string().min(1)).min(1),
  marketAlternatives: z.array(aiAlternativeSchema).min(1),
  worthinessReview: z
    .string()
    .min(1)
    .refine((value) => hasMinWords(value, 35), {
      message: "Worthiness review must be at least 35 words.",
    }),
  feasibilityReview: z
    .string()
    .min(1)
    .refine((value) => hasMinWords(value, 35), {
      message: "Feasibility review must be at least 35 words.",
    }),
  brutalFeedback: z
    .string()
    .min(1)
    .refine((value) => hasMinWords(value, 50), {
      message: "Brutal critique must be at least 50 words.",
    }),
  suggestions: z.array(z.string().min(12)).min(3).max(6),
});

export type AiReview = z.infer<typeof aiReviewSchema>;
