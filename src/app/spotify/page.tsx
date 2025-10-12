import { Metadata } from "next";

import { getNowPlaying, getTopTracks } from "@/lib/spotify";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Spotify API • Bharath",
  description: "Top tracks and playback status sourced live from the Spotify Web API.",
};

async function fetchSpotifyPayload() {
  const endpoints = {
    topTracks: { method: "GET", path: "/api/spotify/top-tracks" },
    nowPlaying: { method: "GET", path: "/api/spotify/now-playing" },
    pause: { method: "POST", path: "/api/spotify/pause" },
    play: {
      method: "POST",
      path: "/api/spotify/play",
      body: { uri: "spotify:track:<TRACK_ID>" },
    },
  } as const;

  try {
    const [tracks, nowPlaying] = await Promise.all([getTopTracks(), getNowPlaying()]);

    return {
      description: "Server-rendered view of Spotify data exposed via this portfolio's API routes.",
      endpoints,
      nowPlaying,
      topTracks: tracks,
      metadata: {
        generatedAt: new Date().toISOString(),
      },
    } as const;
  } catch (error) {
    return {
      description: "Server-rendered view of Spotify data exposed via this portfolio's API routes.",
      endpoints,
      error:
        error instanceof Error
          ? error.message
          : "Failed to load Spotify data. Check environment configuration.",
      metadata: {
        generatedAt: new Date().toISOString(),
      },
    } as const;
  }
}

export default async function SpotifyPage() {
  const payload = await fetchSpotifyPayload();

  return (
    <main className="mx-auto flex min-h-screen max-w-4xl flex-col gap-8 px-6 py-16 sm:px-10">
      <header className="space-y-3">
        <h1 className="text-3xl font-semibold text-white">Spotify API Surface</h1>
        <p className="max-w-2xl text-sm text-slate-300/80">
          These responses are live from Spotify. Pretty-printing is intentional so you can inspect the JSON or call the endpoints directly.
        </p>
      </header>
      <pre className="overflow-x-auto rounded-2xl border border-white/10 bg-slate-950/80 p-6 text-left text-sm leading-relaxed text-sky-100">
        {JSON.stringify(payload, null, 2)}
      </pre>
    </main>
  );
}
