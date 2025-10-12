import { NextResponse } from "next/server";

import { getNowPlaying } from "@/lib/spotify";

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
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    );
  }
}
