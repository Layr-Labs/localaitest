/** Cancels a GitHub token once the browser has finished autofill, so it can't be used again. */
export async function POST(request: Request) {
  const clientId = process.env.GITHUB_CLIENT_ID;
  const clientSecret = process.env.GITHUB_CLIENT_SECRET;
  const { token } = await request.json().catch(() => ({ token: null }));
  if (!clientId || !clientSecret || typeof token !== "string") return new Response(null, { status: 400 });

  await fetch(`https://api.github.com/applications/${clientId}/token`, {
    method: "DELETE",
    headers: {
      Accept: "application/vnd.github+json",
      Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString("base64")}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ access_token: token }),
    cache: "no-store",
  }).catch(() => {});
  return new Response(null, { status: 204 });
}
