import { NextResponse } from "next/server";

import { consumeToken } from "@/lib/rate-limit";
import { playTrack } from "@/lib/spotify";

const LIMIT = 5;
const WINDOW_MS = 60_000;

export const runtime = "nodejs";

function getKey(request: Request) {
  return request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "global";
}

type Body = {
  uri?: unknown;
};

export async function POST(request: Request) {
  if (!consumeToken(`play:${getKey(request)}`, LIMIT, WINDOW_MS)) {
    return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 });
  }

  let body: Body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const uri = typeof body.uri === "string" ? body.uri.trim() : "";
  if (!uri) {
    return NextResponse.json(
      { error: "Provide a Spotify track URI in the body" },
      { status: 400 },
    );
  }

  try {
    await playTrack(uri);
    return NextResponse.json({ status: "playing", uri });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    );
  }
}
