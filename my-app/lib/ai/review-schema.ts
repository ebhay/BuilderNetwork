import { z } from "zod";

export const aiAlternativeSchema = z.object({
  name: z.string().min(1),
  difference: z.string().min(1),
});

export const aiReviewSchema = z.object({
  qualityScore: z.number().min(0).max(10),
  qualityBand: z.enum(["NEEDS_REVISION", "GOOD", "STRONG", "EXCELLENT"]),
  publishRecommendation: z.string().min(1),
  projectLevel: z.enum(["BEGINNER", "INTERMEDIATE", "EXPERT"]),
  requiredSkills: z.array(z.string().min(1)).min(1),
  tags: z.array(z.string().min(1)).min(1),
  marketAlternatives: z.array(aiAlternativeSchema).min(1),
  worthinessReview: z.string().min(1),
  feasibilityReview: z.string().min(1),
  brutalFeedback: z.string().min(1),
  suggestions: z.array(z.string().min(1)).min(1),
});

export type AiReview = z.infer<typeof aiReviewSchema>;
