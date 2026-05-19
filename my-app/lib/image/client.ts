export async function compressImageFile(
  file: File,
  maxLongEdge: number,
  maxBytes: number,
): Promise<{ file: File; width: number; height: number }> {
  const bitmap = await createImageBitmap(file);
  const ratio = Math.min(1, maxLongEdge / Math.max(bitmap.width, bitmap.height));
  const width = Math.max(1, Math.round(bitmap.width * ratio));
  const height = Math.max(1, Math.round(bitmap.height * ratio));

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas context unavailable");
  ctx.drawImage(bitmap, 0, 0, width, height);

  let quality = 0.9;
  let blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, "image/webp", quality),
  );
  if (!blob) throw new Error("Failed to encode image");

  while (blob.size > maxBytes && quality > 0.45) {
    quality -= 0.1;
    blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, "image/webp", quality),
    );
    if (!blob) throw new Error("Failed to encode image");
  }

  const compressed = new File([blob], file.name.replace(/\.[^.]+$/, ".webp"), {
    type: "image/webp",
  });

  return { file: compressed, width, height };
}
