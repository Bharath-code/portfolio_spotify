import { Metadata } from "next";
import {
  SpotifyPremiumRequiredError,
  SpotifyNetworkError,
  getNowPlaying,
  getTopTracks,
  getFollowedArtists,
} from "@/lib/spotify";
import type { SimplifiedTrack, SimplifiedArtist, NowPlaying } from "@/lib/spotify";
import ControlsUIClient from "./ControlsUIClient";

export const metadata: Metadata = {
  title: "Spotify Controls",
  description:
    "Followed artists, top tracks, current playback state, and controls for pause/play.",
};

async function buildPayload() {
  try {
    const [tracks, nowPlaying, artists] = await Promise.all([
      getTopTracks(),
      getNowPlaying(),
      getFollowedArtists(),
    ]);

    const topTracks = (tracks as SimplifiedTrack[]).map((t) => ({
      id: t.id,
      title: t.title,
      artists: t.artists,
      uri: t.uri,
      url: t.url,
    }));

    const followedArtists = (artists as SimplifiedArtist[]).map((a) => ({
      id: a.id,
      name: a.name,
      url: a.url,
      artwork: a.artwork,
    }));

    const np = nowPlaying as NowPlaying;
    const nowPlayingOut = np.isPlaying
      ? {
          id: np.track.id,
          title: np.track.title,
          artists: np.track.artists,
          isPlaying: true,
          progressMs: np.progressMs,
          uri: np.track.uri,
        }
      : null;

    return {
      ok: true as const,
      metadata: {
        generatedAt: new Date().toISOString(),
        description:
          "Consolidated Spotify data for UI and pretty-printed JSON output",
      },
      endpoints: {
        nowPlaying: "/api/spotify/now-playing",
        topTracks: "/api/spotify/top-tracks",
        play: "/api/spotify/play",
        pause: "/api/spotify/pause",
        followedArtists: "/api/spotify/followed-artists",
      },
      actions: {
        pausePlayback: { method: "POST", endpoint: "/api/spotify/pause" },
        playTrack: {
          method: "POST",
          endpoint: "/api/spotify/play",
          body: { uri: "spotify:track:<TRACK_ID_OR_URI>" },
        },
      },
      followedArtists,
      topTracks,
      nowPlaying: nowPlayingOut,
      error: null,
      premiumRequired: false,
      networkIssue: false,
    };
  } catch (err: unknown) {
    if (err instanceof SpotifyPremiumRequiredError) {
      return {
        ok: false as const,
        metadata: {
          generatedAt: new Date().toISOString(),
          description:
            "Premium is required to control playback. Viewing data still works.",
        },
        endpoints: {
          nowPlaying: "/api/spotify/now-playing",
          topTracks: "/api/spotify/top-tracks",
          play: "/api/spotify/play",
          pause: "/api/spotify/pause",
          followedArtists: "/api/spotify/followed-artists",
        },
        actions: {
          pausePlayback: { method: "POST", endpoint: "/api/spotify/pause" },
          playTrack: {
            method: "POST",
            endpoint: "/api/spotify/play",
            body: { uri: "spotify:track:<TRACK_ID_OR_URI>" },
          },
        },
        followedArtists: [],
        topTracks: [],
        nowPlaying: null,
        error: "Spotify Premium is required to use playback controls.",
        premiumRequired: true,
        networkIssue: false,
      };
    }

    if (err instanceof SpotifyNetworkError) {
      return {
        ok: false as const,
        metadata: {
          generatedAt: new Date().toISOString(),
          description: "Network error while fetching Spotify data.",
        },
        endpoints: {
          nowPlaying: "/api/spotify/now-playing",
          topTracks: "/api/spotify/top-tracks",
          play: "/api/spotify/play",
          pause: "/api/spotify/pause",
          followedArtists: "/api/spotify/followed-artists",
        },
        actions: {
          pausePlayback: { method: "POST", endpoint: "/api/spotify/pause" },
          playTrack: {
            method: "POST",
            endpoint: "/api/spotify/play",
            body: { uri: "spotify:track:<TRACK_ID_OR_URI>" },
          },
        },
        followedArtists: [],
        topTracks: [],
        nowPlaying: null,
        error: "Network error while communicating with Spotify API.",
        premiumRequired: false,
        networkIssue: true,
      };
    }

    return {
      ok: false as const,
      metadata: {
        generatedAt: new Date().toISOString(),
        description: "Unexpected error while building Spotify payload.",
      },
      endpoints: {
        nowPlaying: "/api/spotify/now-playing",
        topTracks: "/api/spotify/top-tracks",
        play: "/api/spotify/play",
        pause: "/api/spotify/pause",
        followedArtists: "/api/spotify/followed-artists",
      },
      actions: {
        pausePlayback: { method: "POST", endpoint: "/api/spotify/pause" },
        playTrack: {
          method: "POST",
          endpoint: "/api/spotify/play",
          body: { uri: "spotify:track:<TRACK_ID_OR_URI>" },
        },
      },
      followedArtists: [],
      topTracks: [],
      nowPlaying: null,
      error: "Unknown error occurred",
      premiumRequired: false,
      networkIssue: false,
    };
  }
}

export default async function SpotifyPage() {
  const payload = await buildPayload();

  // UI section (client component for interactivity)
  const artistsUI = payload.followedArtists.map((a) => ({
    id: a.id,
    name: a.name,
    url: a.url,
    artwork: a.artwork ? { url: a.artwork.url } : null,
  }));
  const tracksUI = payload.topTracks.map((t) => ({
    id: t.id,
    title: t.title,
    artists: t.artists,
    uri: t.uri,
    url: t.url,
  }));

  // JSON payload pretty-print section
  const pretty = JSON.stringify(payload, null, 2);

  return (
    <main style={{ padding: 24 }}>
      <h1 style={{ marginTop: 0 }}>Spotify Controls</h1>
      <p style={{ marginTop: 4 }}>
        This page provides both a minimal UI and a pretty-printed JSON payload of
        Spotify data and actions.
      </p>

      {/* Client UI */}
      <ControlsUIClient artists={artistsUI} tracks={tracksUI} nowPlaying={payload.nowPlaying} />

      {/* JSON payload */}
      <section>
        <h2 style={{ margin: 0, marginBottom: 8 }}>JSON payload</h2>
        <pre style={{ whiteSpace: "pre-wrap", background: "#0d0d0d", padding: 12, borderRadius: 8, overflowX: "auto" }}>
          {pretty}
        </pre>
      </section>
    </main>
  );
}
