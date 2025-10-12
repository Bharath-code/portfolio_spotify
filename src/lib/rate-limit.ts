type Bucket = {
  tokens: number;
  lastRefill: number;
};

const limiterStore = new Map<string, Bucket>();

export function consumeToken(key: string, limit: number, refillMs: number) {
  const now = Date.now();
  const bucket = limiterStore.get(key) ?? {
    tokens: limit,
    lastRefill: now,
  };

  if (now - bucket.lastRefill >= refillMs) {
    const cycles = Math.floor((now - bucket.lastRefill) / refillMs);
    bucket.tokens = Math.min(limit, bucket.tokens + cycles * limit);
    bucket.lastRefill = now;
  }

  if (bucket.tokens <= 0) {
    limiterStore.set(key, bucket);
    return false;
  }

  bucket.tokens -= 1;
  limiterStore.set(key, bucket);
  return true;
}
