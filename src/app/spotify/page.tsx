import { Metadata } from "next";

import {
  SpotifyPremiumRequiredError,
  SpotifyNetworkError,
  getNowPlaying,
  getTopTracks,
} from "@/lib/spotify";

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

  const metadata = {
    generatedAt: new Date().toISOString(),
  } as const;

  const payload: {
    description: string;
    endpoints: typeof endpoints;
    metadata: typeof metadata;
    nowPlaying?: Awaited<ReturnType<typeof getNowPlaying>>;
    topTracks?: Awaited<ReturnType<typeof getTopTracks>>;
    actions?: {
      stopPlayback: {
        description: string;
        request: typeof endpoints.pause;
      };
      playTopTracks?: Array<{
        rank: number;
        title: string;
        artists: string[];
        request: {
          method: typeof endpoints.play.method;
          path: typeof endpoints.play.path;
          body: { uri: string };
        };
        uri: string;
        url: string;
      }>;
    };
    error?: string | string[];
    premiumRequired?: boolean;
    networkIssue?: boolean;
  } = {
    description: "Server-rendered view of Spotify data exposed via this portfolio's API routes.",
    endpoints,
    metadata,
  };

  const [tracksResult, nowPlayingResult] = await Promise.allSettled([
    getTopTracks(),
    getNowPlaying(),
  ]);

  const errors: string[] = [];

  if (tracksResult.status === "fulfilled") {
    payload.topTracks = tracksResult.value;
    payload.actions = {
      stopPlayback: {
        description: "POST to pause the current Spotify playback session.",
        request: endpoints.pause,
      },
      playTopTracks: tracksResult.value.map((track, index) => ({
        rank: index + 1,
        title: track.title,
        artists: track.artists,
        uri: track.uri,
        url: track.url,
        request: {
          method: endpoints.play.method,
          path: endpoints.play.path,
          body: { uri: track.uri },
        },
      })),
    };
  } else {
    const reason = tracksResult.reason;
    errors.push(
      reason instanceof Error
        ? reason.message
        : "Failed to load Spotify top tracks. Check environment configuration.",
    );

    if (reason instanceof SpotifyNetworkError) {
      payload.networkIssue = true;
    }

    payload.actions = {
      stopPlayback: {
        description: "POST to pause the current Spotify playback session.",
        request: endpoints.pause,
      },
    };
  }

  if (nowPlayingResult.status === "fulfilled") {
    payload.nowPlaying = nowPlayingResult.value;
  } else {
    const reason = nowPlayingResult.reason;

    if (reason instanceof SpotifyNetworkError) {
      payload.networkIssue = true;
    }

    if (reason instanceof SpotifyPremiumRequiredError) {
      payload.premiumRequired = true;
      errors.push(reason.message);
    } else {
      errors.push(
        reason instanceof Error
          ? reason.message
          : "Failed to load currently playing track. Check environment configuration.",
      );
    }
  }

  if (errors.length === 1) {
    payload.error = errors[0];
  } else if (errors.length > 1) {
    payload.error = errors;
  }

  return payload;
}

export default async function SpotifyPage() {
  const payload = await fetchSpotifyPayload();

  const errorMessages = Array.isArray(payload.error)
    ? payload.error
    : payload.error
      ? [payload.error]
      : [];

  const notices: string[] = [];

  if (payload.premiumRequired) {
    notices.push(
      "Spotify playback features require a Spotify Premium subscription. Playback controls are disabled for non-Premium accounts.",
    );
  }

  if (errorMessages.length) {
    const filteredErrors = payload.premiumRequired
      ? errorMessages.filter((message) => !message.toLowerCase().includes("premium"))
      : errorMessages;

    notices.push(...filteredErrors);
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-4xl flex-col gap-8 px-6 py-16 sm:px-10">
      <header className="space-y-3">
        <h1 className="text-3xl font-semibold text-white">Spotify API Surface</h1>
        <p className="max-w-2xl text-sm text-slate-300/80">
          These responses are live from Spotify. Pretty-printing is intentional so you can inspect the JSON or call the endpoints directly.
        </p>
      </header>
      {notices.length > 0 && (
        <div className="rounded-2xl border border-amber-400/40 bg-amber-500/10 p-5 text-sm text-amber-100">
          <ul className="space-y-2">
            {notices.map((message, index) => (
              <li key={index}>{message}</li>
            ))}
          </ul>
        </div>
      )}
      <pre className="overflow-x-auto rounded-2xl border border-white/10 bg-slate-950/80 p-6 text-left text-sm leading-relaxed text-sky-100">
        {JSON.stringify(payload, null, 2)}
      </pre>
    </main>
  );
}
