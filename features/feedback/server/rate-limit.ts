import "server-only"

interface RateLimitBucket {
  count: number
  resetAt: number
}

const buckets = new Map<string, RateLimitBucket>()
const MAX_BUCKETS = 5000

export interface RateLimitResult {
  allowed: boolean
  retryAfterSeconds: number
}

function prune(now: number) {
  for (const [key, bucket] of buckets) {
    if (bucket.resetAt <= now) buckets.delete(key)
  }
  if (buckets.size > MAX_BUCKETS) {
    const excess = buckets.size - MAX_BUCKETS
    let removed = 0
    for (const key of buckets.keys()) {
      buckets.delete(key)
      removed += 1
      if (removed >= excess) break
    }
  }
}

export function checkRateLimit(
  scope: string,
  key: string,
  limit: number,
  windowMs: number
): RateLimitResult {
  const now = Date.now()
  if (buckets.size > MAX_BUCKETS) prune(now)

  const bucketKey = `${scope}:${key}`
  const existing = buckets.get(bucketKey)

  if (!existing || existing.resetAt <= now) {
    buckets.set(bucketKey, { count: 1, resetAt: now + windowMs })
    return { allowed: true, retryAfterSeconds: 0 }
  }

  if (existing.count >= limit) {
    return {
      allowed: false,
      retryAfterSeconds: Math.max(1, Math.ceil((existing.resetAt - now) / 1000)),
    }
  }

  existing.count += 1
  return { allowed: true, retryAfterSeconds: 0 }
}
