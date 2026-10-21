import "server-only"

export function getClientAddress(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for")
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim()
    if (first) return first
  }

  return (
    request.headers.get("cf-connecting-ip")?.trim() ||
    request.headers.get("x-real-ip")?.trim() ||
    "unknown"
  )
}

/**
 * طلبات الملاحظات عامة، فبنرفض أي POST جاي من origin مختلف. لو الـ header
 * مش موجود (curl أو اختبار محلي) بنكمّل، والـ route نفسه بيطبق rate limit.
 */
export function isSameOrigin(request: Request): boolean {
  if (request.headers.get("sec-fetch-site") === "cross-site") return false

  const origin = request.headers.get("origin")
  if (!origin) return true

  const forwardedHost = request.headers.get("x-forwarded-host")
  const host =
    forwardedHost?.split(",")[0]?.trim() || request.headers.get("host")
  if (!host) return false

  try {
    return new URL(origin).host === host
  } catch {
    return false
  }
}

export function getDeviceInfo(request: Request, clientInfo: string): string {
  const userAgent = request.headers.get("user-agent")?.trim() ?? ""
  return [clientInfo.trim(), userAgent]
    .filter(Boolean)
    .join(" | ")
    .slice(0, 500)
}
