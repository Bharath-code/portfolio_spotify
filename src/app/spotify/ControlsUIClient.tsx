'use client';

import { useState } from 'react';

export default function ControlsUIClient(props: {
  artists: Array<{ id: string; name: string; url: string; artwork: { url: string } | null }>;
  tracks: Array<{ id: string; title: string; artists: string[]; uri: string; url: string }>;
  nowPlaying: { id: string | null; title: string | null; artists: string[]; isPlaying: boolean; progressMs: number; uri: string | null } | null;
}) {
  const { artists, tracks, nowPlaying } = props;
  const [message, setMessage] = useState<string | null>(null);

  async function pause() {
    setMessage(null);
    try {
      const res = await fetch('/api/spotify/pause', { method: 'POST' });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) setMessage(json.error || 'Failed to pause playback');
      else setMessage('Playback paused');
    } catch {
      setMessage('Network error while pausing');
    }
  }

  async function play(uri: string) {
    setMessage(null);
    try {
      const res = await fetch('/api/spotify/play', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ uri }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) setMessage(json.error || 'Failed to start playback');
      else setMessage('Playing track');
    } catch {
      setMessage('Network error while playing');
    }
  }

  return (
    <section style={{ marginBottom: 24 }}>
      <h2 style={{ margin: 0, marginBottom: 8 }}>Interactive UI</h2>
      {message ? <p style={{ color: 'tomato' }}>{message}</p> : null}
      <div style={{ marginBottom: 12 }}>
        <h3 style={{ margin: 0, marginBottom: 6 }}>Now playing</h3>
        {nowPlaying ? (
          <p style={{ margin: 0 }}>{nowPlaying.title ?? 'Unknown'} — {nowPlaying.artists.join(', ')}</p>
        ) : (
          <p style={{ margin: 0 }}>Nothing is playing</p>
        )}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
        <button onClick={pause} style={{ padding: '6px 10px', cursor: 'pointer' }}>Stop current song</button>
      </div>
      <div style={{ marginBottom: 16 }}>
        <h3 style={{ margin: 0, marginBottom: 6 }}>Top 10 tracks</h3>
        <ol style={{ paddingLeft: 20 }}>
          {tracks.map((t, idx) => (
            <li key={t.id} style={{ marginBottom: 8 }}>
              <span>{idx + 1}. {t.title} — {t.artists.join(', ')}</span>
              <button onClick={() => play(t.uri)} style={{ marginLeft: 8, padding: '4px 8px', cursor: 'pointer' }}>Play</button>
              <a href={t.url} target="_blank" rel="noopener noreferrer" style={{ marginLeft: 8 }}>Open</a>
            </li>
          ))}
        </ol>
      </div>
      <div>
        <h3 style={{ margin: 0, marginBottom: 6 }}>Artists you follow</h3>
        <ul style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 12, listStyle: 'none', padding: 0 }}>
          {artists.map((a) => (
            <li key={a.id} style={{ border: '1px solid #222', borderRadius: 8, padding: 8 }}>
              {a.artwork ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={a.artwork.url} alt={a.name} style={{ width: '100%', borderRadius: 6 }} />
              ) : null}
              <a href={a.url} target="_blank" rel="noopener noreferrer">{a.name}</a>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}