function parseGitHubRepo(repoUrl: string) {
  try {
    const url = new URL(repoUrl);
    if (url.hostname !== "github.com" && url.hostname !== "www.github.com") return null;
    const parts = url.pathname.split("/").filter(Boolean);
    if (parts.length < 2) return null;
    return { owner: parts[0], repo: parts[1].replace(/\.git$/i, "") };
  } catch {
    return null;
  }
}

function parseLastPage(linkHeader: string | null) {
  if (!linkHeader) return null;
  const segments = linkHeader.split(",").map((segment) => segment.trim());
  const last = segments.find((segment) => segment.includes('rel="last"'));
  if (!last) return null;
  const match = last.match(/[?&]page=(\d+)/);
  if (!match) return null;
  const value = Number.parseInt(match[1], 10);
  return Number.isFinite(value) ? value : null;
}

export async function getGithubCommitCount(repoUrl: string): Promise<number | null> {
  const parsed = parseGitHubRepo(repoUrl);
  if (!parsed) return null;

  const endpoint = `https://api.github.com/repos/${parsed.owner}/${parsed.repo}/commits?per_page=1`;
  const token = process.env.GITHUB_TOKEN?.trim() || "";
  const response = await fetch(endpoint, {
    headers: {
      Accept: "application/vnd.github+json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    next: { revalidate: 1800 },
  }).catch(() => null);

  if (!response || !response.ok) return null;
  const lastPage = parseLastPage(response.headers.get("link"));
  if (lastPage) return lastPage;

  const body = await response.json().catch(() => []);
  if (Array.isArray(body)) return body.length;
  return null;
}

export async function getGithubCommitCounts(repoUrls: string[]) {
  const unique = Array.from(new Set(repoUrls.filter(Boolean)));
  const rows = await Promise.all(
    unique.map(async (url) => ({ url, count: await getGithubCommitCount(url) })),
  );
  return new Map(rows.map((row) => [row.url, row.count] as const));
}

