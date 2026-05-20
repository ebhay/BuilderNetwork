"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requireUser } from "@/lib/auth/session";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const skillSchema = z.object({
  name: z.string().trim().min(1),
  level: z.enum(["BEGINNER", "INTERMEDIATE", "EXPERT"]),
});

const socialLinkSchema = z.object({
  type: z.enum(["GITHUB", "LINKEDIN", "DISCORD", "TWITTER", "PORTFOLIO", "OTHER"]),
  url: z.string().trim().url(),
  isPublic: z.boolean(),
});

const onboardingSchema = z.object({
  name: z.string().trim().min(2),
  username: z
    .string()
    .trim()
    .toLowerCase()
    .regex(/^[a-z0-9_]{3,30}$/, "Username must be 3-30 chars using lowercase letters, numbers, or underscore."),
  headline: z.string().trim().max(120).optional(),
  location: z.string().trim().max(80).optional(),
  bio: z.string().trim().max(500).optional(),
  codingLevel: z.enum(["BEGINNER", "INTERMEDIATE", "EXPERT"]),
  profileImageUrl: z.string().trim().url().optional().or(z.literal("")),
  skills: z.array(skillSchema).min(5, "Add at least 5 skills."),
  socialLinks: z.array(socialLinkSchema),
});

function parseJsonArray<T>(value: FormDataEntryValue | null, fallback: T): T {
  if (typeof value !== "string" || !value.trim()) return fallback;
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

function sanitizeNextPath(value: FormDataEntryValue | null): string {
  if (typeof value !== "string" || !value.trim()) return "/ideas";
  if (!value.startsWith("/") || value.startsWith("//")) return "/ideas";
  return value;
}

export async function completeOnboarding(formData: FormData) {
  const user = await requireUser("/onboarding");
  const supabase = await createSupabaseServerClient();

  const input = onboardingSchema.parse({
    name: formData.get("name"),
    username: formData.get("username"),
    headline: formData.get("headline") ?? undefined,
    location: formData.get("location") ?? undefined,
    bio: formData.get("bio") ?? undefined,
    codingLevel: formData.get("codingLevel"),
    profileImageUrl: formData.get("profileImageUrl"),
    skills: parseJsonArray(formData.get("skills"), []),
    socialLinks: parseJsonArray(formData.get("socialLinks"), []),
  });
  const uniqueSkills = Array.from(
    new Map(
      input.skills.map((skill) => [
        skill.name.trim().toLowerCase(),
        { ...skill, name: skill.name.trim().replace(/\s+/g, " ") },
      ]),
    ).values(),
  );
  if (uniqueSkills.length < 5) {
    throw new Error("Add at least 5 unique skills.");
  }
  const nextPath = sanitizeNextPath(formData.get("nextPath"));

  const { error: profileError } = await supabase.from("profiles").upsert({
    id: user.id,
    name: input.name,
    username: input.username,
    headline: input.headline || null,
    location: input.location || null,
    bio: input.bio || null,
    coding_level: input.codingLevel,
    profile_image_url: input.profileImageUrl || null,
    onboarded_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  });
  if (profileError) throw new Error(profileError.message);

  const { error: deleteSkillsError } = await supabase
    .from("skills")
    .delete()
    .eq("user_id", user.id);
  if (deleteSkillsError) throw new Error(deleteSkillsError.message);
  if (uniqueSkills.length > 0) {
    const { error: insertSkillsError } = await supabase.from("skills").insert(
      uniqueSkills.map((skill) => ({
        user_id: user.id,
        name: skill.name,
        level: skill.level,
      })),
    );
    if (insertSkillsError) throw new Error(insertSkillsError.message);
  }

  const { error: deleteSocialError } = await supabase
    .from("social_links")
    .delete()
    .eq("user_id", user.id);
  if (deleteSocialError) throw new Error(deleteSocialError.message);
  if (input.socialLinks.length > 0) {
    const { error: insertSocialError } = await supabase.from("social_links").insert(
      input.socialLinks.map((link) => ({
        user_id: user.id,
        type: link.type,
        url: link.url,
        is_public: link.isPublic,
      })),
    );
    if (insertSocialError) throw new Error(insertSocialError.message);
  }

  revalidatePath("/onboarding");
  revalidatePath("/ideas");
  revalidatePath("/dashboard");
  redirect(nextPath);
}
