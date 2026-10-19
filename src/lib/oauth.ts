// "Connect" logins for autofill. Hugging Face runs entirely in the browser (a public OAuth app
// with PKCE). GitHub needs one server step to swap the login code for a token, because GitHub
// won't let browsers call its token endpoint. Nothing is stored on the server either way.

const HF_CLIENT_ID = process.env.NEXT_PUBLIC_HF_CLIENT_ID ?? "";
const HF_STATE_KEY = "localaitest:hf-oauth";

export type ConnectResult =
  | { provider: "huggingface"; username: string }
  | { provider: "github"; token: string }
  | { provider: "huggingface" | "github"; error: string };

function randomString(bytes = 32): string {
  const values = crypto.getRandomValues(new Uint8Array(bytes));
  return btoa(String.fromCharCode(...values))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

async function sha256Base64Url(input: string): Promise<string> {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(input));
  return btoa(String.fromCharCode(...new Uint8Array(digest)))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

/** Hugging Face must redirect back to an exact registered URL, so it's always the site root. */
function hfRedirectUri(): string {
  return `${window.location.origin}/`;
}

export function huggingFaceConfigured(): boolean {
  return HF_CLIENT_ID.length > 0;
}

export async function connectHuggingFace(): Promise<void> {
  const state = randomString(16);
  const verifier = randomString(48);
  sessionStorage.setItem(HF_STATE_KEY, JSON.stringify({ state, verifier }));
  const params = new URLSearchParams({
    client_id: HF_CLIENT_ID,
    redirect_uri: hfRedirectUri(),
    response_type: "code",
    scope: "openid profile",
    state,
    code_challenge: await sha256Base64Url(verifier),
    code_challenge_method: "S256",
  });
  window.location.assign(`https://huggingface.co/oauth/authorize?${params}`);
}

export function connectGitHub(): void {
  // A full page load, not a client-side route change: this is an API route that redirects to GitHub.
  // eslint-disable-next-line @next/next/no-location-assign-relative-destination
  window.location.href = "/api/auth/github/start";
}

/** Removes login details from the address bar, so they don't end up in history or shared links. */
function cleanUrl(): void {
  window.history.replaceState(null, "", window.location.pathname);
}

/**
 * Finishes a login if the page was just opened by a Hugging Face or GitHub redirect.
 * Returns null on a normal page load.
 */
export async function finishConnect(): Promise<ConnectResult | null> {
  const query = new URLSearchParams(window.location.search);
  const hash = new URLSearchParams(window.location.hash.slice(1));

  const githubToken = hash.get("github_token");
  const connectError = hash.get("connect_error");
  if (githubToken || connectError) {
    cleanUrl();
    if (githubToken) return { provider: "github", token: githubToken };
    return {
      provider: connectError?.startsWith("huggingface") ? "huggingface" : "github",
      error:
        connectError === "github-setup"
          ? "GitHub connect isn't set up yet."
          : "GitHub didn't finish connecting. Try again.",
    };
  }

  const code = query.get("code");
  const state = query.get("state");
  if (!code || !state) return null;
  cleanUrl();

  const saved = JSON.parse(sessionStorage.getItem(HF_STATE_KEY) ?? "null") as {
    state: string;
    verifier: string;
  } | null;
  sessionStorage.removeItem(HF_STATE_KEY);
  if (!saved || saved.state !== state) {
    return { provider: "huggingface", error: "Hugging Face login expired. Try connecting again." };
  }

  try {
    const tokenRes = await fetch("https://huggingface.co/oauth/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type: "authorization_code",
        code,
        redirect_uri: hfRedirectUri(),
        client_id: HF_CLIENT_ID,
        code_verifier: saved.verifier,
      }),
    });
    if (!tokenRes.ok) return { provider: "huggingface", error: "Hugging Face didn't finish connecting. Try again." };
    const { access_token } = await tokenRes.json();
    const infoRes = await fetch("https://huggingface.co/oauth/userinfo", {
      headers: { Authorization: `Bearer ${access_token}` },
    });
    const info = infoRes.ok ? await infoRes.json() : null;
    const username = info?.preferred_username;
    if (typeof username !== "string")
      return { provider: "huggingface", error: "Couldn't read your Hugging Face profile." };
    return { provider: "huggingface", username };
  } catch {
    return { provider: "huggingface", error: "Couldn't reach Hugging Face. Check your connection." };
  }
}

/** Asks GitHub to cancel the token once autofill is done with it. */
export function revokeGitHubToken(token: string): void {
  fetch("/api/auth/github/revoke", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token }),
    keepalive: true,
  }).catch(() => {});
}
