import { NextResponse, type NextRequest } from "next/server";
import { GITHUB_STATE_COOKIE, githubCallbackUrl } from "../shared";

/** Sends the browser to GitHub's login page. Asks for no scopes, so the token can only read public data. */
export function GET(request: NextRequest) {
  const clientId = process.env.GITHUB_CLIENT_ID;
  if (!clientId || !process.env.GITHUB_CLIENT_SECRET) {
    return NextResponse.redirect(new URL("/#connect_error=github-setup", request.nextUrl.origin));
  }
  const state = crypto.randomUUID();
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: githubCallbackUrl(request),
    state,
    allow_signup: "false",
  });
  const response = NextResponse.redirect(`https://github.com/login/oauth/authorize?${params}`);
  response.cookies.set(GITHUB_STATE_COOKIE, state, {
    httpOnly: true,
    secure: request.nextUrl.protocol === "https:",
    sameSite: "lax",
    path: "/api/auth/github",
    maxAge: 600,
  });
  return response;
}
