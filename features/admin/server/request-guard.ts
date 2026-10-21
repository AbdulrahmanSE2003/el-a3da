import "server-only"

import type { NextRequest } from "next/server"

/**
 * حماية بسيطة من الطلبات cross-origin على مسارات المصادقة. الـ SameSite=Lax
 * cookie يقلل المخاطر، لكن الفحص ده يمنع أي form/fetch من أصل تاني.
 */
export function isSameOriginRequest(request: NextRequest): boolean {
  const origin = request.headers.get("origin")
  if (origin) {
    try {
      if (new URL(origin).host !== request.headers.get("host")) return false
    } catch {
      return false
    }
  }

  const fetchSite = request.headers.get("sec-fetch-site")
  if (fetchSite && fetchSite !== "same-origin" && fetchSite !== "none") {
    return false
  }

  return true
}

export function getClientKey(request: NextRequest): string {
  const forwarded = request.headers.get("x-forwarded-for")
  if (forwarded) return forwarded.split(",")[0]?.trim() || "unknown"
  return request.headers.get("x-real-ip")?.trim() || "unknown"
}
