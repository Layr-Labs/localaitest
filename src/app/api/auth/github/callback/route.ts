import { NextResponse, type NextRequest } from "next/server";
import { GITHUB_STATE_COOKIE, githubCallbackUrl } from "../shared";

/**
 * GitHub sends the browser back here with a one-time code. We swap it for a token and hand the
 * token to the browser in the URL fragment, which never reaches a server. Nothing is stored or logged.
 */
export async function GET(request: NextRequest) {
  const home = request.nextUrl.origin;
  const fail = () => {
    const response = NextResponse.redirect(new URL("/#connect_error=github", home));
    response.cookies.delete({ name: GITHUB_STATE_COOKIE, path: "/api/auth/github" });
    return response;
  };

  const code = request.nextUrl.searchParams.get("code");
  const state = request.nextUrl.searchParams.get("state");
  const expected = request.cookies.get(GITHUB_STATE_COOKIE)?.value;
  if (!code || !state || !expected || state !== expected) return fail();

  try {
    const res = await fetch("https://github.com/login/oauth/access_token", {
      method: "POST",
      headers: { Accept: "application/json", "Content-Type": "application/json" },
      body: JSON.stringify({
        client_id: process.env.GITHUB_CLIENT_ID,
        client_secret: process.env.GITHUB_CLIENT_SECRET,
        code,
        redirect_uri: githubCallbackUrl(request),
      }),
      cache: "no-store",
    });
    const body = await res.json();
    if (typeof body.access_token !== "string") return fail();
    const response = NextResponse.redirect(new URL(`/#github_token=${encodeURIComponent(body.access_token)}`, home));
    response.cookies.delete({ name: GITHUB_STATE_COOKIE, path: "/api/auth/github" });
    return response;
  } catch {
    return fail();
  }
}
