import { NextResponse } from "next/server";

import { getTopTracks } from "@/lib/spotify";

export const revalidate = 3600;
export const runtime = "nodejs";

export async function GET() {
  try {
    const tracks = await getTopTracks();
    const response = NextResponse.json({ tracks });
    response.headers.set(
      "Cache-Control",
      "public, s-maxage=3600, stale-while-revalidate=1200",
    );
    return response;
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    );
  }
}
