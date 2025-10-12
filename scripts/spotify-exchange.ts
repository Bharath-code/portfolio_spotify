#!/usr/bin/env bun

const TOKEN_ENDPOINT = "https://accounts.spotify.com/api/token";

type CliArgs = {
  code?: string;
  redirectUri?: string;
};

function parseArgs(): CliArgs {
  const result: CliArgs = {};
  for (const raw of process.argv.slice(2)) {
    const [key, value] = raw.split("=");
    if (!key.startsWith("--")) continue;
    const normalizedKey = key.slice(2);
    if (normalizedKey === "code") {
      result.code = value ?? "";
    }
    if (normalizedKey === "redirect-uri") {
      result.redirectUri = value ?? "";
    }
  }
  return result;
}

function encodeBasic(clientId: string, clientSecret: string) {
  const raw = `${clientId}:${clientSecret}`;
  if (typeof Buffer !== "undefined") {
    return Buffer.from(raw, "utf-8").toString("base64");
  }
  if (typeof btoa !== "undefined") {
    return btoa(raw);
  }
  throw new Error("Unable to encode Spotify credentials in this runtime.");
}

async function main() {
  const args = parseArgs();

  const clientId = process.env.SPOTIFY_CLIENT_ID;
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;
  const redirectUri = args.redirectUri || process.env.SPOTIFY_REDIRECT_URI;
  const code = args.code;

  if (!clientId || !clientSecret) {
    console.error("Set SPOTIFY_CLIENT_ID and SPOTIFY_CLIENT_SECRET before running.");
    process.exit(1);
  }

  if (!redirectUri) {
    console.error(
      "Provide a redirect URI via --redirect-uri=<URI> or SPOTIFY_REDIRECT_URI environment variable.",
    );
    process.exit(1);
  }

  if (!code) {
    console.error("Usage: bun run spotify:exchange --code=<authorization_code>");
    console.error("Hint: after authorizing, copy the ?code= value from your redirect URI.");
    process.exit(1);
  }

  const params = new URLSearchParams({
    grant_type: "authorization_code",
    code,
    redirect_uri: redirectUri,
  });

  const response = await fetch(TOKEN_ENDPOINT, {
    method: "POST",
    headers: {
      Authorization: `Basic ${encodeBasic(clientId, clientSecret)}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: params,
  });

  if (!response.ok) {
    const body = await response.text();
    console.error(`Token exchange failed (${response.status}): ${body}`);
    process.exit(1);
  }

  const data = (await response.json()) as {
    access_token: string;
    refresh_token?: string;
    expires_in: number;
    scope: string;
  };

  if (!data.refresh_token) {
    console.warn("Received response without a refresh token. Spotify only returns it once per authorization code.");
  }

  console.log("Access token:", data.access_token);
  if (data.refresh_token) {
    console.log("Refresh token:", data.refresh_token);
  }
  console.log("Expires in:", `${data.expires_in}s`);
  console.log("Scopes:", data.scope);
  console.log("Next: place the refresh token in .env.local as SPOTIFY_REFRESH_TOKEN.");
}

main().catch((error) => {
  console.error("Unexpected error while exchanging token:", error);
  process.exit(1);
});
