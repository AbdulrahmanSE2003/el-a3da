import { NextResponse, type NextRequest } from "next/server"
import { destroyAdminSession } from "@/features/admin/server/auth"
import { isSameOriginRequest } from "@/features/admin/server/request-guard"

export const runtime = "nodejs"

export async function POST(request: NextRequest) {
  if (!isSameOriginRequest(request)) {
    return NextResponse.json(
      { ok: false, error: "طلب غير مسموح." },
      { status: 403, headers: { "Cache-Control": "no-store" } }
    )
  }

  await destroyAdminSession()

  const contentType = request.headers.get("content-type") ?? ""
  const accept = request.headers.get("accept") ?? ""
  const wantsJson =
    contentType.includes("application/json") || accept.includes("application/json")

  if (wantsJson) {
    return NextResponse.json(
      { ok: true },
      { headers: { "Cache-Control": "no-store" } }
    )
  }

  return NextResponse.redirect(new URL("/login", request.url), 303)
}
