import { z } from "zod";

export const githubUrlSchema = z.string().url().transform((value) => {
  const parsed = new URL(value.trim());
  if (parsed.hostname !== "github.com" && parsed.hostname !== "www.github.com") {
    throw new Error("Must be a GitHub URL.");
  }
  const segments = parsed.pathname.split("/").filter(Boolean);
  if (segments.length < 2) {
    throw new Error("Must be a GitHub repository URL.");
  }
  const owner = segments[0];
  const repo = segments[1].replace(/\.git$/i, "");
  if (!owner || !repo) {
    throw new Error("Must be a GitHub repository URL.");
  }
  return `https://github.com/${owner}/${repo}`;
});

export const deployedUrlSchema = z.string().url().transform((value) => {
  const parsed = new URL(value.trim());
  return parsed.toString().replace(/\/$/, "");
});
