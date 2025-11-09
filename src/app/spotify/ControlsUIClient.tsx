'use client';

import { useState } from 'react';

export default function ControlsUIClient(props: {
  artists: Array<{ id: string; name: string; url: string; artwork: { url: string } | null }>;
  tracks: Array<{ id: string; title: string; artists: string[]; uri: string; url: string }>;
  nowPlaying: { id: string | null; title: string | null; artists: string[]; isPlaying: boolean; progressMs: number; uri: string | null } | null;
}) {
  const { artists, tracks, nowPlaying } = props;
  const [message, setMessage] = useState<string | null>(null);
  const [messageType, setMessageType] = useState<'success' | 'error' | null>(null);
  const [pauseLoading, setPauseLoading] = useState(false);
  const [playLoading, setPlayLoading] = useState<string | null>(null);

  async function pause() {
    setMessage(null);
    setMessageType(null);
    setPauseLoading(true);
    try {
      const res = await fetch('/api/spotify/pause', { method: 'POST' });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        setMessage(json.error || 'Failed to pause playback');
        setMessageType('error');
      } else {
        setMessage('Playback paused');
        setMessageType('success');
      }
    } catch {
      setMessage('Network error while pausing');
      setMessageType('error');
    } finally {
      setPauseLoading(false);
    }
  }

  async function play(uri: string) {
    setMessage(null);
    setMessageType(null);
    setPlayLoading(uri);
    try {
      const res = await fetch('/api/spotify/play', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ uri }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        setMessage(json.error || 'Failed to start playback');
        setMessageType('error');
      } else {
        setMessage('Playing track');
        setMessageType('success');
      }
    } catch {
      setMessage('Network error while playing');
      setMessageType('error');
    } finally {
      setPlayLoading(null);
    }
  }

  return (
    <section className="mx-auto max-w-4xl px-6 py-6 sm:px-8 sm:py-8 flex flex-col gap-6">
      <header className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-white">Interactive UI</h2>
          <p className="text-sm text-white/60">Use the controls to pause or play top tracks. Below is a JSON view of the same data.</p>
        </div>
      </header>

      {/* Status message */}
      {message && (
        <div
          role="status"
          aria-live="polite"
          className={`rounded-md border px-4 py-3 text-sm ${
            messageType === 'error'
              ? 'border-red-600/40 bg-red-950/50 text-red-300'
              : 'border-emerald-600/40 bg-emerald-950/50 text-emerald-300'
          }`}
        >
          {message}
        </div>
      )}

      {/* Now playing */}
      <div className="rounded-xl border border-white/10 bg-slate-900/60 p-4">
        <h3 className="text-lg font-medium text-white mb-2">Now playing</h3>
        {nowPlaying ? (
          <div className="flex items-center justify-between gap-4">
            <div className="min-w-0">
              <p className="truncate text-white">
                {nowPlaying.title ?? 'Unknown'}
              </p>
              <p className="truncate text-white/70 text-sm">
                {nowPlaying.artists.join(', ')}
              </p>
            </div>
            <span className="shrink-0 rounded-full bg-emerald-700/30 px-3 py-1 text-xs text-emerald-300">
              {nowPlaying.isPlaying ? 'Playing' : 'Idle'}
            </span>
          </div>
        ) : (
          <p className="text-white/70">Nothing is playing</p>
        )}
      </div>

      {/* Controls */}
      <div className="flex items-center gap-3">
        <button
          onClick={pause}
          disabled={pauseLoading}
          className={`inline-flex items-center gap-2 rounded-md bg-red-600 px-3 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-red-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-red-500 focus-visible:ring-offset-slate-900 ${
            pauseLoading ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'
          }`}
        >
          <span>Stop current song</span>
        </button>
      </div>

      {/* Top 10 tracks */}
      <div className="rounded-xl border border-white/10 bg-slate-900/60">
        <div className="flex items-center justify-between px-4 py-3">
          <h3 className="text-lg font-medium text-white">Top 10 tracks</h3>
        </div>
        <ol className="divide-y divide-white/5">
          {tracks.map((t, idx) => (
            <li key={t.id} className="flex items-center justify-between gap-4 px-4 py-3">
              <div className="min-w-0">
                <p className="truncate text-white">
                  {idx + 1}. {t.title}
                </p>
                <p className="truncate text-white/70 text-sm">
                  {t.artists.join(', ')}
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <a
                  href={t.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-md border border-white/20 px-3 py-1.5 text-sm text-white/90 transition-colors hover:bg-white/10 cursor-pointer"
                >
                  Open
                </a>
                <button
                  onClick={() => play(t.uri)}
                  disabled={playLoading === t.uri}
                  className={`inline-flex items-center gap-2 rounded-md bg-emerald-600 px-3 py-1.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-emerald-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-slate-900 ${
                    playLoading === t.uri ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'
                  }`}
                >
                  <span>Play</span>
                </button>
              </div>
            </li>
          ))}
        </ol>
      </div>

      {/* Followed artists */}
      <div>
        <h3 className="text-lg font-medium text-white mb-2">Artists you follow</h3>
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
          {artists.map((a) => (
            <li key={a.id} className="rounded-xl border border-white/10 bg-slate-900/60 p-2">
              {a.artwork ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={a.artwork.url}
                  alt={a.name}
                  className="mb-2 h-28 w-full rounded-lg object-cover"
                />
              ) : (
                <div className="mb-2 h-28 w-full rounded-lg bg-slate-800" />
              )}
              <a
                href={a.url}
                target="_blank"
                rel="noopener noreferrer"
                className="line-clamp-1 text-sm text-white/90 underline-offset-2 hover:underline cursor-pointer"
                title={a.name}
              >
                {a.name}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}