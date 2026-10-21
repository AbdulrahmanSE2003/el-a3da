import "server-only"

const WINDOW_MS = 10 * 60 * 1000
const MAX_ATTEMPTS = 10
const MAX_TRACKED_KEYS = 2_000

interface Bucket {
  count: number
  resetAt: number
}

const buckets = new Map<string, Bucket>()

function pruneExpired(now: number) {
  if (buckets.size <= MAX_TRACKED_KEYS) return
  for (const [key, bucket] of buckets) {
    if (bucket.resetAt <= now) buckets.delete(key)
  }
}

/**
 * حد بسيط داخل نفس عملية السيرفر. ليس بديلًا عن rate limiting موزّع في
 * الإنتاج متعدد الـ instances، لكنه يقلل المحاولات المتكررة محليًا.
 */
export function checkLoginRateLimit(key: string): {
  allowed: boolean
  retryAfterSeconds: number
} {
  const now = Date.now()
  pruneExpired(now)

  const bucket = buckets.get(key)
  if (!bucket || bucket.resetAt <= now) {
    buckets.delete(key)
    return { allowed: true, retryAfterSeconds: 0 }
  }

  if (bucket.count >= MAX_ATTEMPTS) {
    return {
      allowed: false,
      retryAfterSeconds: Math.max(1, Math.ceil((bucket.resetAt - now) / 1000)),
    }
  }

  return { allowed: true, retryAfterSeconds: 0 }
}

export function recordLoginFailure(key: string): void {
  const now = Date.now()
  const bucket = buckets.get(key)

  if (!bucket || bucket.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + WINDOW_MS })
    return
  }

  bucket.count += 1
}

export function clearLoginFailures(key: string): void {
  buckets.delete(key)
}
