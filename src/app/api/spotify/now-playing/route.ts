import { NextResponse } from "next/server";

import {
  SpotifyNetworkError,
  SpotifyPremiumRequiredError,
  getNowPlaying,
} from "@/lib/spotify";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  try {
    const payload = await getNowPlaying();
    return NextResponse.json(payload, {
      headers: {
        "Cache-Control": "public, s-maxage=15, stale-while-revalidate=45",
      },
    });
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
