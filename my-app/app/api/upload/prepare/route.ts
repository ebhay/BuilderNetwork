import { NextResponse } from "next/server";
import { z } from "zod";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabaseServiceClient } from "@/lib/supabase/service";
import { IMAGE_LIMITS, STORAGE_BUCKETS } from "@/lib/constants";

const prepareSchema = z.object({
  kind: z.enum(["profile", "screenshot"]),
  fileName: z.string().min(1),
  contentType: z.string().min(1),
  size: z.number().int().positive(),
  width: z.number().int().positive().optional(),
  height: z.number().int().positive().optional(),
});

function sanitizeName(fileName: string) {
  return fileName.toLowerCase().replace(/[^a-z0-9.\-_]/g, "-");
}

export async function POST(request: Request) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const parsed = prepareSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: "Invalid payload" }, { status: 400 });
  }

  const input = parsed.data;
  const limits = IMAGE_LIMITS[input.kind];
  if (!limits.allowedMimeTypes.includes(input.contentType as never)) {
    return NextResponse.json({ ok: false, error: "Unsupported file type" }, { status: 400 });
  }

  if (input.size > limits.maxBytes) {
    return NextResponse.json({ ok: false, error: "File exceeds allowed size" }, { status: 400 });
  }

  if ("maxWidth" in limits && input.width && input.width > limits.maxWidth) {
    return NextResponse.json({ ok: false, error: "Image width too large" }, { status: 400 });
  }
  if ("maxHeight" in limits && input.height && input.height > limits.maxHeight) {
    return NextResponse.json({ ok: false, error: "Image height too large" }, { status: 400 });
  }
  if ("maxLongEdge" in limits && input.width && input.height) {
    if (Math.max(input.width, input.height) > limits.maxLongEdge) {
      return NextResponse.json({ ok: false, error: "Image dimensions too large" }, { status: 400 });
    }
  }

  const bucket =
    input.kind === "profile" ? STORAGE_BUCKETS.profileImages : STORAGE_BUCKETS.ideaScreenshots;
  const ext = input.contentType.includes("webp")
    ? "webp"
    : input.contentType.includes("png")
      ? "png"
      : "jpg";
  const path = `${user.id}/${Date.now()}-${sanitizeName(input.fileName)}.${ext}`;

  const service = createSupabaseServiceClient();
  const { data: signed, error } = await service.storage
    .from(bucket)
    .createSignedUploadUrl(path, { upsert: false });

  if (error || !signed) {
    return NextResponse.json({ ok: false, error: "Failed to prepare upload" }, { status: 500 });
  }

  const { data: publicData } = service.storage.from(bucket).getPublicUrl(path);
  return NextResponse.json({
    ok: true,
    bucket,
    path,
    token: signed.token,
    publicUrl: publicData.publicUrl,
  });
}
