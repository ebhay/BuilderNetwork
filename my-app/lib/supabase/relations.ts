export function firstRelation<T>(value: T | T[] | null | undefined): T | null {
  if (!value) return null;
  return Array.isArray(value) ? (value[0] ?? null) : value;
}

export function displayBuilderName(
  profile: { name?: string | null; username?: string | null } | null | undefined,
  fallback = "Builder",
) {
  if (!profile) return fallback;
  return profile.username ? `@${profile.username}` : (profile.name ?? fallback);
}
