import { NextResponse } from "next/server";

import { consumeToken } from "@/lib/rate-limit";
import {
  SpotifyNetworkError,
  SpotifyPremiumRequiredError,
  pausePlayback,
} from "@/lib/spotify";

const LIMIT = 5;
const WINDOW_MS = 60_000;

export const runtime = "nodejs";

function getKey(request: Request) {
  return request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "global";
}

function methodNotAllowedResponse() {
  return NextResponse.json(
    { error: "Use POST to pause the current Spotify playback session." },
    {
      status: 405,
      headers: {
        Allow: "POST",
      },
    },
  );
}

export function GET() {
  return methodNotAllowedResponse();
}

export async function POST(request: Request) {
  if (!consumeToken(`pause:${getKey(request)}`, LIMIT, WINDOW_MS)) {
    return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 });
  }

  try {
    await pausePlayback();
    return NextResponse.json({ status: "paused" });
  } catch (error) {
    if (error instanceof SpotifyPremiumRequiredError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }

    if (error instanceof SpotifyNetworkError) {
      return NextResponse.json({ error: error.message }, { status: 502 });
    }

    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    );
  }
}
