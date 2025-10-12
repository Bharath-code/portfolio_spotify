import { getSpotifyEnv } from "@/lib/env";

const TOKEN_ENDPOINT = "https://accounts.spotify.com/api/token";
const API_BASE = "https://api.spotify.com/v1";

type AccessTokenResponse = {
  access_token: string;
  token_type: string;
  expires_in: number;
};

type SpotifyImage = {
  url: string;
  width: number | null;
  height: number | null;
};

type SpotifyTrack = {
  id: string;
  name: string;
  uri: string;
  preview_url: string | null;
  external_urls: { spotify: string };
  artists: { name: string }[];
  album: { images: SpotifyImage[] };
  duration_ms: number;
};

export type SimplifiedTrack = {
  id: string;
  title: string;
  artists: string[];
  uri: string;
  url: string;
  previewUrl: string | null;
  artwork: SpotifyImage | null;
  durationMs: number;
};

export type NowPlaying =
  | {
      isPlaying: true;
      progressMs: number;
      durationMs: number;
      track: SimplifiedTrack;
    }
  | {
      isPlaying: false;
    };

type AccessTokenCache = {
  token: string;
  expiresAt: number;
};

let tokenCache: AccessTokenCache | null = null;

export class SpotifyPremiumRequiredError extends Error {
  readonly status = 403;

  constructor(message = "Spotify playback features require a Spotify Premium subscription.") {
    super(message);
    this.name = "SpotifyPremiumRequiredError";
  }
}

export class SpotifyNetworkError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "SpotifyNetworkError";
  }
}

function isPremiumRequiredError(status: number) {
  return status === 403;
}

function encodeBasicAuth(clientId: string, clientSecret: string) {
  const raw = `${clientId}:${clientSecret}`;
  if (typeof Buffer !== "undefined") {
    return Buffer.from(raw, "utf-8").toString("base64");
  }
  if (typeof btoa !== "undefined") {
    return btoa(raw);
  }
  throw new Error("Base64 encoding is not supported in this runtime.");
}

async function getAccessToken(): Promise<string> {
  if (tokenCache && tokenCache.expiresAt > Date.now() + 10_000) {
    return tokenCache.token;
  }

  const env = getSpotifyEnv();
  const body = new URLSearchParams({
    grant_type: "refresh_token",
    refresh_token: env.refreshToken,
  });

  const response = await fetch(TOKEN_ENDPOINT, {
    method: "POST",
    headers: {
      Authorization: `Basic ${encodeBasicAuth(env.clientId, env.clientSecret)}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body,
    cache: "no-store",
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Failed to refresh Spotify token: ${response.status} ${text}`);
  }

  const data = (await response.json()) as AccessTokenResponse;
  tokenCache = {
    token: data.access_token,
    expiresAt: Date.now() + data.expires_in * 1000,
  };

  return tokenCache.token;
}

async function spotifyFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const accessToken = await getAccessToken();
  let response: Response;

  try {
    response = await fetch(`${API_BASE}${path}`, {
      ...init,
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
        ...(init?.headers ?? {}),
      },
      cache: "no-store",
    });
  } catch (error) {
    const cause = (error as { cause?: unknown })?.cause;
    const causeMessage = cause instanceof Error ? cause.message : undefined;
    const hint = causeMessage ? ` (${causeMessage})` : "";
    throw new SpotifyNetworkError(`Spotify network request failed for ${path}: ${(error as Error)?.message ?? String(error)}${hint}`);
  }

  if (!response.ok) {
    const message = await response.text();

    if (isPremiumRequiredError(response.status)) {
      throw new SpotifyPremiumRequiredError();
    }

    throw new Error(`Spotify request failed ${response.status}: ${message}`);
  }

  if (response.status === 204 || response.status === 202) {
    return undefined as T;
  }

  return (await response.json()) as T;
}

function transformTrack(track: SpotifyTrack): SimplifiedTrack {
  const artwork = track.album.images.at(0) ?? null;
  return {
    id: track.id,
    title: track.name,
    artists: track.artists.map((artist) => artist.name),
    uri: track.uri,
    url: track.external_urls.spotify,
    previewUrl: track.preview_url,
    artwork,
    durationMs: track.duration_ms,
  };
}

export async function getTopTracks() {
  const data = await spotifyFetch<{ items: SpotifyTrack[] }>(
    "/me/top/tracks?limit=10&time_range=short_term",
  );
  return data.items.map(transformTrack);
}

export async function getNowPlaying(): Promise<NowPlaying> {
  let response: Response;

  try {
    response = await fetch(`${API_BASE}/me/player/currently-playing`, {
      headers: {
        Authorization: `Bearer ${await getAccessToken()}`,
      },
      cache: "no-store",
    });
  } catch (error) {
    const cause = (error as { cause?: unknown })?.cause;
    const causeMessage = cause instanceof Error ? cause.message : undefined;
    const hint = causeMessage ? ` (${causeMessage})` : "";
    throw new SpotifyNetworkError(`Spotify network request failed for /me/player/currently-playing: ${(error as Error)?.message ?? String(error)}${hint}`);
  }

  if (response.status === 204 || response.status === 202) {
    return { isPlaying: false };
  }

  if (!response.ok) {
    const message = await response.text();

    if (isPremiumRequiredError(response.status)) {
      throw new SpotifyPremiumRequiredError();
    }

    throw new Error(`Spotify request failed ${response.status}: ${message}`);
  }

  const data = (await response.json()) as {
    is_playing: boolean;
    progress_ms: number;
    item: SpotifyTrack | null;
  };

  if (!data.item || !data.is_playing) {
    return { isPlaying: false };
  }

  return {
    isPlaying: true,
    progressMs: data.progress_ms ?? 0,
    durationMs: data.item.duration_ms ?? 0,
    track: transformTrack(data.item as SpotifyTrack),
  };
}

export async function pausePlayback() {
  await spotifyFetch<void>("/me/player/pause", {
    method: "PUT",
  });
}

export async function playTrack(uri: string) {
  await spotifyFetch<void>("/me/player/play", {
    method: "PUT",
    body: JSON.stringify({ uris: [uri] }),
  });
}

export function clearSpotifyTokenCache() {
  tokenCache = null;
}
