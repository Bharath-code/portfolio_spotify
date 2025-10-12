type SpotifyEnv = {
  clientId: string;
  clientSecret: string;
  refreshToken: string;
};

let cachedEnv: SpotifyEnv | null = null;

export function getSpotifyEnv(): SpotifyEnv {
  if (cachedEnv) {
    return cachedEnv;
  }

  const clientId = process.env.SPOTIFY_CLIENT_ID;
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;
  const refreshToken = process.env.SPOTIFY_REFRESH_TOKEN;

  if (!clientId || !clientSecret || !refreshToken) {
    throw new Error("Spotify environment variables are not fully configured.");
  }

  cachedEnv = { clientId, clientSecret, refreshToken };
  return cachedEnv;
}
