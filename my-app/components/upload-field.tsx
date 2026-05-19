"use client";

import { useRef, useState } from "react";
import { CloudUpload, Upload, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";
import { IMAGE_LIMITS } from "@/lib/constants";
import { compressImageFile } from "@/lib/image/client";

type UploadKind = "profile" | "screenshot";

type UploadFieldProps = {
  id: string;
  kind: UploadKind;
  label: string;
  value: string;
  onChange: (value: string) => void;
  variant?: "default" | "profileTop";
};

export function UploadField({
  id,
  kind,
  label,
  value,
  onChange,
  variant = "default",
}: UploadFieldProps) {
  const [status, setStatus] = useState<string>("");
  const [uploading, setUploading] = useState(false);
  const lastUploadedRef = useRef<{ bucket: string; path: string } | null>(null);
  const limits = IMAGE_LIMITS[kind];

  async function handleFile(file: File | undefined) {
    if (!file) return;
    setUploading(true);
    setStatus("Compressing...");
    try {
      const maxLongEdge =
        "maxLongEdge" in limits
          ? limits.maxLongEdge
          : Math.max(limits.maxWidth, limits.maxHeight);
      const compressed = await compressImageFile(file, maxLongEdge, limits.maxBytes);

      setStatus("Preparing upload...");
      const prepare = await fetch("/api/upload/prepare", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          kind,
          fileName: compressed.file.name,
          contentType: compressed.file.type,
          size: compressed.file.size,
          width: compressed.width,
          height: compressed.height,
        }),
      });
      const prepared = await prepare.json();
      if (!prepare.ok || !prepared.ok) {
        throw new Error(prepared.error ?? "Upload preparation failed");
      }

      setStatus("Uploading...");
      const supabase = createSupabaseBrowserClient();
      const { error } = await supabase.storage
        .from(prepared.bucket)
        .uploadToSignedUrl(prepared.path, prepared.token, compressed.file);
      if (error) throw error;

      const previous = lastUploadedRef.current;
      lastUploadedRef.current = { bucket: prepared.bucket, path: prepared.path };
      onChange(prepared.publicUrl);

      if (previous) {
        void fetch("/api/upload/cleanup", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(previous),
        });
      }

      setStatus("Upload complete");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  if (variant === "profileTop") {
    return (
      <div className="space-y-2.5 text-center">
        <Label htmlFor={id}>{label}</Label>
        <div className="mx-auto flex w-28 flex-col items-end gap-1">
          {value ? (
            <button
              type="button"
              onClick={() => onChange("")}
              className="inline-flex h-6 w-6 items-center justify-center rounded-full border border-border/80 bg-background text-muted-foreground hover:bg-accent hover:text-ink"
              aria-label="Remove profile image"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          ) : (
            <span className="h-6 w-6" aria-hidden />
          )}
          <div className="relative flex h-28 w-28 items-center justify-center overflow-hidden rounded-full border border-dashed border-primary/40 bg-background text-primary">
          {value ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={value} alt="Profile preview" className="h-full w-full object-cover" />
          ) : (
            <CloudUpload className="h-6 w-6" />
          )}
          </div>
        </div>
        <p className="text-[11px] text-muted-foreground">
          JPG, PNG or WEBP.
          <br />
          Max 2MB
        </p>
        <label
          htmlFor={`${id}-file`}
          className="inline-flex h-8 cursor-pointer items-center gap-2 rounded-md border border-border px-3 text-xs font-medium text-ink"
        >
          <Upload className="h-3.5 w-3.5" />
          {value ? "Replace image" : "Upload image"}
        </label>
        <Input
          id={`${id}-file`}
          type="file"
          accept="image/png,image/jpeg,image/webp"
          disabled={uploading}
          className="hidden"
          onChange={(event) => void handleFile(event.target.files?.[0])}
        />
        {status ? <p className="text-xs text-muted-foreground">{status}</p> : null}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <Input
        id={id}
        type="url"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="https://..."
      />
      <Input
        id={`${id}-file`}
        type="file"
        accept="image/png,image/jpeg,image/webp"
        disabled={uploading}
        onChange={(event) => void handleFile(event.target.files?.[0])}
      />
      {status ? <p className="text-xs text-muted-foreground">{status}</p> : null}
    </div>
  );
}
