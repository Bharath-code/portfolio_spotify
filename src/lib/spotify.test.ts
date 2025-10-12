import { afterAll, beforeEach, describe, expect, it } from "bun:test";

import {
  clearSpotifyTokenCache,
  getNowPlaying,
  getTopTracks,
  pausePlayback,
  playTrack,
} from "./spotify";

const originalFetch = globalThis.fetch;
const originalEnv = {
  clientId: process.env.SPOTIFY_CLIENT_ID,
  clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
  refreshToken: process.env.SPOTIFY_REFRESH_TOKEN,
};

function createJsonResponse(data: unknown, init?: ResponseInit) {
  return new Response(JSON.stringify(data), {
    status: 200,
    headers: { "Content-Type": "application/json" },
    ...init,
  });
}

beforeEach(() => {
  process.env.SPOTIFY_CLIENT_ID = "test-client";
  process.env.SPOTIFY_CLIENT_SECRET = "test-secret";
  process.env.SPOTIFY_REFRESH_TOKEN = "test-refresh";
  clearSpotifyTokenCache();
});

afterAll(() => {
  globalThis.fetch = originalFetch;
  if (originalEnv.clientId) {
    process.env.SPOTIFY_CLIENT_ID = originalEnv.clientId;
  } else {
    delete process.env.SPOTIFY_CLIENT_ID;
  }
  if (originalEnv.clientSecret) {
    process.env.SPOTIFY_CLIENT_SECRET = originalEnv.clientSecret;
  } else {
    delete process.env.SPOTIFY_CLIENT_SECRET;
  }
  if (originalEnv.refreshToken) {
    process.env.SPOTIFY_REFRESH_TOKEN = originalEnv.refreshToken;
  } else {
    delete process.env.SPOTIFY_REFRESH_TOKEN;
  }
});

describe("spotify helpers", () => {
  it("transforms top tracks payload", async () => {
    const calls: { url: string; init?: RequestInit }[] = [];

    globalThis.fetch = (async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = typeof input === "string" ? input : input instanceof URL ? input.toString() : input.url;
      calls.push({ url, init });

      if (url === "https://accounts.spotify.com/api/token") {
        return createJsonResponse({
          access_token: "access-token",
          token_type: "Bearer",
          expires_in: 3600,
        });
      }

      if (url === "https://api.spotify.com/v1/me/top/tracks?limit=10&time_range=short_term") {
        return createJsonResponse({
          items: [
            {
              id: "track-1",
              name: "Edge Runner",
              uri: "spotify:track:track-1",
              preview_url: "https://p.scdn.co/mp3-preview/sample",
              external_urls: { spotify: "https://open.spotify.com/track/track-1" },
              artists: [{ name: "Synth Lord" }],
              album: {
                images: [
                  { url: "https://i.scdn.co/image/example", width: 640, height: 640 },
                ],
              },
              duration_ms: 201000,
            },
          ],
        });
      }

      throw new Error(`Unhandled fetch call: ${url}`);
    }) as typeof fetch;

    const tracks = await getTopTracks();

    expect(tracks).toHaveLength(1);
    expect(tracks[0]).toMatchObject({
      id: "track-1",
      title: "Edge Runner",
      artists: ["Synth Lord"],
      uri: "spotify:track:track-1",
      url: "https://open.spotify.com/track/track-1",
      durationMs: 201000,
    });
    expect(calls.map((call) => call.url)).toEqual([
      "https://accounts.spotify.com/api/token",
      "https://api.spotify.com/v1/me/top/tracks?limit=10&time_range=short_term",
    ]);
  });

  it("returns inactive now playing state when nothing is playing", async () => {
    const calls: { url: string }[] = [];

    globalThis.fetch = (async (input: RequestInfo | URL, _init?: RequestInit) => {
      const url = typeof input === "string" ? input : input instanceof URL ? input.toString() : input.url;
      calls.push({ url });
      void _init;

      if (url === "https://accounts.spotify.com/api/token") {
        return createJsonResponse({
          access_token: "access-token",
          token_type: "Bearer",
          expires_in: 3600,
        });
      }

      if (url === "https://api.spotify.com/v1/me/player/currently-playing") {
        return new Response(null, { status: 204 });
      }

      throw new Error(`Unhandled fetch call: ${url}`);
    }) as typeof fetch;

    const nowPlaying = await getNowPlaying();
    expect(nowPlaying).toEqual({ isPlaying: false });
    expect(calls.map((call) => call.url)).toEqual([
      "https://accounts.spotify.com/api/token",
      "https://api.spotify.com/v1/me/player/currently-playing",
    ]);
  });

  it("pauses and resumes playback", async () => {
    const calls: { url: string; method: string | undefined; body?: unknown }[] = [];

    globalThis.fetch = (async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = typeof input === "string" ? input : input instanceof URL ? input.toString() : input.url;
      const method = init?.method;
      let body: unknown = undefined;
      if (init?.body && typeof init.body === "string") {
        try {
          body = JSON.parse(init.body);
        } catch {
          body = init.body;
        }
      }
      calls.push({ url, method, body });

      if (url === "https://accounts.spotify.com/api/token") {
        return createJsonResponse({
          access_token: "access-token",
          token_type: "Bearer",
          expires_in: 3600,
        });
      }

      if (
        url === "https://api.spotify.com/v1/me/player/play" ||
        url === "https://api.spotify.com/v1/me/player/pause"
      ) {
        return new Response(null, { status: 204 });
      }

      throw new Error(`Unhandled fetch call: ${url}`);
    }) as typeof fetch;

    await playTrack("spotify:track:test");
    await pausePlayback();

    expect(calls.map((call) => [call.url, call.method])).toEqual([
      ["https://accounts.spotify.com/api/token", "POST"],
      ["https://api.spotify.com/v1/me/player/play", "PUT"],
      ["https://api.spotify.com/v1/me/player/pause", "PUT"],
    ]);
    expect(calls[1].body).toEqual({ uris: ["spotify:track:test"] });
  });
});
