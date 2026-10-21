import { NextResponse, type NextRequest } from "next/server"
import {
  ADMIN_SESSION_COOKIE,
  verifySessionToken,
} from "@/features/admin/server/auth-core"

const PUBLIC_ADMIN_ENDPOINTS = new Set([
  "/api/admin/login",
  "/api/admin/login/",
  "/api/admin/logout",
  "/api/admin/logout/",
])

/**
 * فحص optimistic لتجربة المستخدم: يمنع تحميل صفحات الأدمن أو استدعاء أي
 * admin API بدون جلسة. الحماية الفعلية موجودة أيضًا في admin layout وفي
 * طبقة الاستعلامات.
 */
export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl

  if (PUBLIC_ADMIN_ENDPOINTS.has(pathname)) {
    return NextResponse.next()
  }

  const token = request.cookies.get(ADMIN_SESSION_COOKIE)?.value
  const session = verifySessionToken(token)

  if (session) return NextResponse.next()

  if (pathname.startsWith("/api/admin")) {
    return NextResponse.json(
      { ok: false, error: "Unauthorized" },
      { status: 401, headers: { "Cache-Control": "no-store" } }
    )
  }

  const loginUrl = new URL("/login", request.url)
  loginUrl.searchParams.set("next", `${pathname}${search}`)
  return NextResponse.redirect(loginUrl)
}

export const config = {
  matcher: ["/admin", "/admin/:path*", "/api/admin/:path*"],
}
