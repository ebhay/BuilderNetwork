import type { SupabaseClient } from "@supabase/supabase-js";

export type IdeaDerivedStatus = "IDEA" | "IN_PROGRESS" | "BUILT";

export async function fetchIdeaStatsMap(
  supabase: SupabaseClient,
  ideaIds: string[],
): Promise<Record<string, { implementationCount: number; builtCount: number; derivedStatus: IdeaDerivedStatus }>> {
  if (ideaIds.length === 0) return {};

  const { data } = await supabase
    .from("idea_status_stats")
    .select("idea_id,implementation_count,built_count,derived_status")
    .in("idea_id", ideaIds);

  const map: Record<string, { implementationCount: number; builtCount: number; derivedStatus: IdeaDerivedStatus }> = {};
  for (const row of data ?? []) {
    map[row.idea_id] = {
      implementationCount: row.implementation_count ?? 0,
      builtCount: row.built_count ?? 0,
      derivedStatus: (row.derived_status ?? "IDEA") as IdeaDerivedStatus,
    };
  }
  return map;
}
