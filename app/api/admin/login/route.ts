import { NextResponse, type NextRequest } from "next/server"
import {
  AuthConfigurationError,
  createAdminSession,
  safeAdminRedirect,
  verifyAdminCredentials,
} from "@/features/admin/server/auth"
import {
  checkLoginRateLimit,
  clearLoginFailures,
  recordLoginFailure,
} from "@/features/admin/server/login-rate-limit"
import {
  getClientKey,
  isSameOriginRequest,
} from "@/features/admin/server/request-guard"

export const runtime = "nodejs"

const INVALID_CREDENTIALS = "البريد الإلكتروني أو كلمة المرور غير صحيحة."
const TOO_MANY_ATTEMPTS = "محاولات كتير. استنى شوية وبعدين جرّب تاني."
const UNAVAILABLE = "تسجيل الدخول غير متاح حاليًا. راجع إعداد الخادم."
const MAX_BODY_BYTES = 8 * 1024

type LoginPayload = {
  email?: unknown
  password?: unknown
  next?: unknown
}

function jsonError(message: string, status: number) {
  return NextResponse.json(
    { ok: false, error: message },
    { status, headers: { "Cache-Control": "no-store" } }
  )
}

async function readPayload(request: NextRequest): Promise<LoginPayload | null> {
  const contentType = request.headers.get("content-type") ?? ""
  const contentLength = Number(request.headers.get("content-length") ?? 0)
  if (contentLength > MAX_BODY_BYTES) return null

  if (contentType.includes("application/json")) {
    try {
      const text = await request.text()
      if (Buffer.byteLength(text, "utf8") > MAX_BODY_BYTES) return null
      return JSON.parse(text) as LoginPayload
    } catch {
      return null
    }
  }

  if (
    contentType.includes("application/x-www-form-urlencoded") ||
    contentType.includes("multipart/form-data")
  ) {
    try {
      const form = await request.formData()
      return {
        email: form.get("email"),
        password: form.get("password"),
        next: form.get("next"),
      }
    } catch {
      return null
    }
  }

  return null
}

export async function POST(request: NextRequest) {
  if (!isSameOriginRequest(request)) {
    return jsonError("طلب غير مسموح.", 403)
  }

  const contentType = request.headers.get("content-type") ?? ""
  const wantsJson = contentType.includes("application/json")

  const payload = await readPayload(request)
  if (!payload) {
    return jsonError("طلب غير صالح.", 400)
  }

  const email = typeof payload.email === "string" ? payload.email.trim() : ""
  const password =
    typeof payload.password === "string" ? payload.password : ""
  const next = typeof payload.next === "string" ? payload.next : null

  if (
    !email ||
    !password ||
    email.length > 254 ||
    password.length > 1024
  ) {
    return jsonError(INVALID_CREDENTIALS, 401)
  }

  const clientKey = `login:${getClientKey(request)}`
  const rateLimit = checkLoginRateLimit(clientKey)
  if (!rateLimit.allowed) {
    return NextResponse.json(
      { ok: false, error: TOO_MANY_ATTEMPTS },
      {
        status: 429,
        headers: {
          "Cache-Control": "no-store",
          "Retry-After": String(rateLimit.retryAfterSeconds),
        },
      }
    )
  }

  try {
    const valid = await verifyAdminCredentials(email, password)
    if (!valid) {
      recordLoginFailure(clientKey)
      return jsonError(INVALID_CREDENTIALS, 401)
    }

    clearLoginFailures(clientKey)
    await createAdminSession()

    const redirectTo = safeAdminRedirect(next)
    if (!wantsJson) {
      return NextResponse.redirect(new URL(redirectTo, request.url), 303)
    }

    return NextResponse.json(
      { ok: true, redirectTo },
      { headers: { "Cache-Control": "no-store" } }
    )
  } catch (error) {
    if (error instanceof AuthConfigurationError) {
      console.error("[admin-auth] configuration is incomplete")
      return jsonError(UNAVAILABLE, 503)
    }

    console.error(
      "[admin-auth] login failed:",
      error instanceof Error ? error.name : "unknown error"
    )
    return jsonError(UNAVAILABLE, 500)
  }
}
