import type { NextRequest } from "next/server";

export const GITHUB_STATE_COOKIE = "gh_oauth_state";

/** Must match the callback URL registered on the GitHub OAuth app for this environment. */
export function githubCallbackUrl(request: NextRequest): string {
  return `${request.nextUrl.origin}/api/auth/github/callback`;
}
