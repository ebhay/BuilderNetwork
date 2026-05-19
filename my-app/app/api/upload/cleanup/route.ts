import { NextResponse } from "next/server";
import { z } from "zod";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabaseServiceClient } from "@/lib/supabase/service";
import { STORAGE_BUCKETS } from "@/lib/constants";

const cleanupSchema = z.object({
  bucket: z.enum([STORAGE_BUCKETS.profileImages, STORAGE_BUCKETS.ideaScreenshots]),
  path: z.string().min(1),
});

export async function POST(request: Request) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const parsed = cleanupSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: "Invalid payload" }, { status: 400 });
  }

  const { bucket, path } = parsed.data;
  if (!path.startsWith(`${user.id}/`)) {
    return NextResponse.json({ ok: false, error: "Invalid file path" }, { status: 403 });
  }

  const service = createSupabaseServiceClient();
  const { error } = await service.storage.from(bucket).remove([path]);

  if (error) {
    return NextResponse.json({ ok: false, error: "Failed to remove file" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}

