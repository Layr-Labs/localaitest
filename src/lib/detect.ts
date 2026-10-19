import type { DetectRule } from "@/data/items";
import { devicesFromHf, hardwareMatches, type Device } from "./rig";

// Every request here goes straight from the user's browser to Hugging Face or GitHub.
// Nothing is sent to our own server.

export type LookupResult = { rules: DetectRule[]; devices: Device[]; error?: string };

const TRACKED_REPOS = ["ggml-org/llama.cpp", "ollama/ollama", "vllm-project/vllm"];
const USERNAME = /^[A-Za-z0-9][A-Za-z0-9._-]{0,95}$/;

export function cleanUsername(input: string): string {
  return input.trim().replace(/^@/, "").replace(/^https?:\/\/(www\.)?(huggingface\.co|github\.com)\//i, "").replace(/\/.*$/, "");
}

type HfModel = { tags?: string[]; downloads?: number; library_name?: string };

export async function lookupHuggingFace(rawUser: string): Promise<LookupResult> {
  const user = cleanUsername(rawUser);
  if (!USERNAME.test(user)) return { rules: [], devices: [], error: "That doesn't look like a Hugging Face username." };
  try {
    const overviewRes = await fetch(`https://huggingface.co/api/users/${encodeURIComponent(user)}/overview`);
    if (overviewRes.status === 404) return { rules: [], devices: [], error: `No Hugging Face user called "${user}".` };
    if (overviewRes.status === 429) return { rules: [], devices: [], error: "Hugging Face is rate limiting us. Try again in a minute." };
    if (!overviewRes.ok) return { rules: [], devices: [], error: "Hugging Face didn't answer. Try again later." };
    const overview = await overviewRes.json();

    const modelsRes = await fetch(
      `https://huggingface.co/api/models?author=${encodeURIComponent(user)}&limit=1000&expand[]=tags&expand[]=downloads&expand[]=library_name`,
    );
    const models: HfModel[] = modelsRes.ok ? await modelsRes.json() : [];

    const devices = devicesFromHf(overview?.hardwareItems);
    const rules: DetectRule[] = [...hardwareMatches(devices)];
    const tagsOf = (m: HfModel) => (m.tags ?? []).map((t) => t.toLowerCase());

    const numModels = Number(overview?.numModels ?? models.length);
    if (numModels > 0 || models.length > 0) rules.push("hf-uploaded");
    if (models.some((m) => tagsOf(m).includes("gguf"))) rules.push("hf-gguf");
    if (
      models.some(
        (m) =>
          m.library_name === "peft" ||
          tagsOf(m).some((t) => t === "lora" || t === "peft" || t.startsWith("base_model:adapter:")),
      )
    )
      rules.push("hf-lora");
    if (models.some((m) => tagsOf(m).some((t) => t === "mergekit" || t === "merge" || t.startsWith("base_model:merge:"))))
      rules.push("hf-merge");
    const downloads = models.reduce((sum, m) => sum + (m.downloads ?? 0), 0);
    const followers = Number(overview?.numFollowers);
    if (models.length > 0 && Number.isFinite(followers) && downloads > followers) rules.push("hf-downloads-beat-followers");

    return { rules, devices };
  } catch {
    return { rules: [], devices: [], error: "Couldn't reach Hugging Face. Check your connection." };
  }
}

function githubError(res: Response): string | null {
  if (res.status === 404) return "not-found";
  if (res.status === 403 || res.status === 429) {
    return "GitHub's free API limit is used up for your network. Try again in a few minutes.";
  }
  if (!res.ok) return "GitHub didn't answer. Try again later.";
  return null;
}

function githubHeaders(token?: string): HeadersInit {
  return token
    ? { Accept: "application/vnd.github+json", Authorization: `Bearer ${token}` }
    : { Accept: "application/vnd.github+json" };
}

async function githubSearchCount(query: string, token?: string): Promise<number | string> {
  const res = await fetch(`https://api.github.com/search/issues?per_page=1&q=${encodeURIComponent(query)}`, {
    headers: githubHeaders(token),
  });
  const error = githubError(res);
  if (error) return error === "not-found" ? 0 : error;
  const body = await res.json();
  return Number(body?.total_count ?? 0);
}

/** Looks up the account behind a "Connect GitHub" token. The token only has public read access. */
export async function lookupGitHubConnected(token: string): Promise<LookupResult & { username?: string }> {
  try {
    const res = await fetch("https://api.github.com/user", { headers: githubHeaders(token) });
    if (!res.ok) return { rules: [], devices: [], error: "GitHub didn't finish connecting. Try again." };
    const { login } = await res.json();
    if (typeof login !== "string") return { rules: [], devices: [], error: "Couldn't read your GitHub profile." };
    return { ...(await lookupGitHub(login, token)), username: login };
  } catch {
    return { rules: [], devices: [], error: "Couldn't reach GitHub. Check your connection." };
  }
}

export async function lookupGitHub(rawUser: string, token?: string): Promise<LookupResult> {
  const user = cleanUsername(rawUser);
  if (!USERNAME.test(user)) return { rules: [], devices: [], error: "That doesn't look like a GitHub username." };
  try {
    const userRes = await fetch(`https://api.github.com/users/${encodeURIComponent(user)}`, {
      headers: githubHeaders(token),
    });
    const userError = githubError(userRes);
    if (userError === "not-found") return { rules: [], devices: [], error: `No GitHub user called "${user}".` };
    if (userError) return { rules: [], devices: [], error: userError };

    const rules: DetectRule[] = [];
    let error: string | undefined;

    for (let page = 1; page <= 3; page++) {
      const res = await fetch(`https://api.github.com/users/${encodeURIComponent(user)}/starred?per_page=100&page=${page}`, {
        headers: githubHeaders(token),
      });
      const starredError = githubError(res);
      if (starredError) {
        error = starredError === "not-found" ? undefined : starredError;
        break;
      }
      const repos: { full_name?: string }[] = await res.json();
      if (repos.some((r) => r.full_name?.toLowerCase() === "ggml-org/llama.cpp")) {
        rules.push("gh-starred-llamacpp");
        break;
      }
      if (repos.length < 100) break;
    }

    const repoQuery = TRACKED_REPOS.map((r) => `repo:${r}`).join(" ");
    const issues = await githubSearchCount(`author:${user} type:issue ${repoQuery}`, token);
    if (typeof issues === "string") error = issues;
    else if (issues > 0) rules.push("gh-issue");

    const prs = await githubSearchCount(`author:${user} type:pr is:merged ${repoQuery}`, token);
    if (typeof prs === "string") error = prs;
    else if (prs > 0) rules.push("gh-merged-pr");

    return { rules, devices: [], error };
  } catch {
    return { rules: [], devices: [], error: "Couldn't reach GitHub. Check your connection." };
  }
}
