import { createHash } from "node:crypto";

type HashInput = {
  title: string;
  description: string;
  screenshotUrl?: string | null;
  referenceLinks: string[];
};

export function createIdeaContentHash(input: HashInput) {
  const payload = JSON.stringify({
    title: input.title.trim(),
    description: input.description.trim(),
    screenshotUrl: input.screenshotUrl?.trim() || "",
    referenceLinks: input.referenceLinks.map((link) => link.trim()).sort(),
  });

  return createHash("sha256").update(payload).digest("hex");
}
