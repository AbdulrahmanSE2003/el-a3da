import "server-only"

import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import {
  ADMIN_SESSION_COOKIE,
  ADMIN_SESSION_TTL_SECONDS,
  createSessionToken,
  safeAdminRedirect,
  verifySessionToken,
  type AdminSession,
} from "./auth-core"

export {
  ADMIN_SESSION_COOKIE,
  ADMIN_SESSION_TTL_SECONDS,
  AuthConfigurationError,
  safeAdminRedirect,
  verifyAdminCredentials,
} from "./auth-core"

const DEFAULT_ADMIN_PATH = "/admin"

export class AdminAuthenticationError extends Error {
  constructor() {
    super("Admin authentication is required.")
    this.name = "AdminAuthenticationError"
  }
}

function cookieOptions(expires: Date) {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    expires,
    maxAge: ADMIN_SESSION_TTL_SECONDS,
  }
}

/** قراءة الجلسة الحالية والتحقق من التوقيع والانتهاء. */
export async function getAdminSession(): Promise<AdminSession | null> {
  const token = (await cookies()).get(ADMIN_SESSION_COOKIE)?.value
  return verifySessionToken(token)
}

/** حارس لصفحات الأدمن: يعمل redirect بدل ما يكسر الصفحة. */
export async function requireAdminPage(
  nextPath = DEFAULT_ADMIN_PATH
): Promise<AdminSession> {
  const session = await getAdminSession()
  if (session) return session

  const safeNext = safeAdminRedirect(nextPath)
  redirect(`/login?next=${encodeURIComponent(safeNext)}`)
}

/** حارس لطبقة البيانات/الـ route handlers: يرفض الوصول بدون جلسة صالحة. */
export async function requireAdmin(): Promise<AdminSession> {
  const session = await getAdminSession()
  if (!session) throw new AdminAuthenticationError()
  return session
}

export async function createAdminSession(): Promise<void> {
  const expires = new Date(Date.now() + ADMIN_SESSION_TTL_SECONDS * 1000)
  const token = createSessionToken()

  const cookieStore = await cookies()
  cookieStore.set(ADMIN_SESSION_COOKIE, token, cookieOptions(expires))
}

export async function destroyAdminSession(): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.set(ADMIN_SESSION_COOKIE, "", {
    ...cookieOptions(new Date(0)),
    maxAge: 0,
  })
}
