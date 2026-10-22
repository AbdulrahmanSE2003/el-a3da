import "server-only"

import {
  createHash,
  createHmac,
  scrypt as scryptCallback,
  timingSafeEqual,
} from "node:crypto"
import { promisify } from "node:util"

/**
 * Server-only auth primitives shared by the admin session guard, the login
 * route, and the optimistic proxy check.
 *
 * This module must never be imported by a Client Component.
 */

export const ADMIN_SESSION_COOKIE = "qa3da_admin_session"
export const ADMIN_SESSION_TTL_SECONDS = 8 * 60 * 60
const DEFAULT_ADMIN_PATH = "/admin"
const MIN_AUTH_SECRET_BYTES = 32
const MAX_PASSWORD_LENGTH = 1024
const MAX_EMAIL_LENGTH = 254

export class AuthConfigurationError extends Error {
  constructor() {
    super("Admin authentication is not configured.")
    this.name = "AuthConfigurationError"
  }
}

export interface AdminSession {
  sub: "admin"
  iat: number
  exp: number
}

interface PasswordHash {
  N: number
  r: number
  p: number
  salt: Buffer
  hash: Buffer
}

const scryptAsync = promisify(scryptCallback) as (
  password: string,
  salt: Buffer,
  keylen: number,
  options: { N: number; r: number; p: number; maxmem: number }
) => Promise<Buffer>

const normalizeEmail = (value: string) => value.trim().toLowerCase()

function getAuthSecret(): string {
  const secret = process.env.AUTH_SECRET?.trim()
  if (!secret || Buffer.byteLength(secret, "utf8") < MIN_AUTH_SECRET_BYTES) {
    throw new AuthConfigurationError()
  }
  return secret
}

function getAdminEmail(): string {
  const email = process.env.ADMIN_EMAIL?.trim()
  if (!email || email.length > MAX_EMAIL_LENGTH) {
    throw new AuthConfigurationError()
  }
  return normalizeEmail(email)
}

function getAdminPasswordHash(): string {
  const hash = process.env.ADMIN_PASSWORD_HASH?.trim()
  if (!hash) throw new AuthConfigurationError()
  return hash
}

function parsePasswordHash(value: string): PasswordHash {
  // Colon-separated is the preferred format because Next.js expands `$VAR`
  // sequences inside .env files. The legacy `$` format is still accepted when
  // it is passed literally (for example by a test or a quoted env value).
  const separator = value.includes("$") ? "$" : ":"
  const parts = value.split(separator)
  if (parts.length !== 4 || parts[0] !== "scrypt") {
    throw new AuthConfigurationError()
  }

  const params = /^N=(\d+),r=(\d+),p=(\d+)$/.exec(parts[1])
  if (!params) throw new AuthConfigurationError()

  const N = Number(params[1])
  const r = Number(params[2])
  const p = Number(params[3])

  if (
    !Number.isInteger(N) ||
    !Number.isInteger(r) ||
    !Number.isInteger(p) ||
    N < 1024 ||
    N > 2 ** 20 ||
    (N & (N - 1)) !== 0 ||
    r < 1 ||
    r > 32 ||
    p < 1 ||
    p > 16
  ) {
    throw new AuthConfigurationError()
  }

  let salt: Buffer
  let hash: Buffer
  try {
    salt = Buffer.from(parts[2], "base64url")
    hash = Buffer.from(parts[3], "base64url")
  } catch {
    throw new AuthConfigurationError()
  }

  if (
    salt.length < 8 ||
    salt.length > 64 ||
    hash.length < 16 ||
    hash.length > 128
  ) {
    throw new AuthConfigurationError()
  }

  return { N, r, p, salt, hash }
}

/** مقارنة نصية ثابتة الزمن عن طريق مقارنة digest ثابت الطول. */
function safeEqualString(left: string, right: string): boolean {
  const leftDigest = createHash("sha256").update(left, "utf8").digest()
  const rightDigest = createHash("sha256").update(right, "utf8").digest()
  return timingSafeEqual(leftDigest, rightDigest)
}

async function verifyPassword(
  password: string,
  hash: PasswordHash
): Promise<boolean> {
  const derived = await scryptAsync(password, hash.salt, hash.hash.length, {
    N: hash.N,
    r: hash.r,
    p: hash.p,
    maxmem: 64 * 1024 * 1024,
  })

  return timingSafeEqual(derived, hash.hash)
}

/**
 * التحقق يتم دائمًا للبريد وكلمة المرور معًا حتى لا يكشف توقيت الرد أي حقل
 * كان غلط. أي خطأ في الإعداد يرمي AuthConfigurationError ولا يسمح بالدخول.
 */
export async function verifyAdminCredentials(
  emailInput: string,
  passwordInput: string
): Promise<boolean> {
  if (
    emailInput.length > MAX_EMAIL_LENGTH ||
    passwordInput.length > MAX_PASSWORD_LENGTH
  ) {
    return false
  }

  const configuredEmail = getAdminEmail()
  const passwordHash = parsePasswordHash(getAdminPasswordHash())

  const emailMatches = safeEqualString(
    normalizeEmail(emailInput),
    configuredEmail
  )
  const passwordMatches = await verifyPassword(passwordInput, passwordHash)

  return emailMatches && passwordMatches
}

export function createSessionToken(nowMs = Date.now()): string {
  const secret = getAuthSecret()
  const issuedAt = Math.floor(nowMs / 1000)
  const payload: AdminSession = {
    sub: "admin",
    iat: issuedAt,
    exp: issuedAt + ADMIN_SESSION_TTL_SECONDS,
  }

  const payloadPart = Buffer.from(JSON.stringify(payload), "utf8").toString(
    "base64url"
  )
  const signaturePart = createHmac("sha256", secret)
    .update(payloadPart)
    .digest("base64url")

  return `${payloadPart}.${signaturePart}`
}

export function verifySessionToken(
  token: string | null | undefined,
  nowMs = Date.now()
): AdminSession | null {
  if (!token) return null

  let secret: string
  try {
    secret = getAuthSecret()
  } catch {
    return null
  }

  const parts = token.split(".")
  if (parts.length !== 2 || !parts[0] || !parts[1]) return null

  const [payloadPart, signaturePart] = parts
  const expectedSignature = createHmac("sha256", secret)
    .update(payloadPart)
    .digest()
  const providedSignature = Buffer.from(signaturePart, "base64url")

  if (
    providedSignature.length !== expectedSignature.length ||
    !timingSafeEqual(providedSignature, expectedSignature)
  ) {
    return null
  }

  let payload: unknown
  try {
    payload = JSON.parse(Buffer.from(payloadPart, "base64url").toString("utf8"))
  } catch {
    return null
  }

  if (!payload || typeof payload !== "object") return null

  const candidate = payload as Record<string, unknown>
  if (candidate.sub !== "admin") return null
  if (
    typeof candidate.iat !== "number" ||
    typeof candidate.exp !== "number" ||
    !Number.isInteger(candidate.iat) ||
    !Number.isInteger(candidate.exp)
  ) {
    return null
  }

  const now = Math.floor(nowMs / 1000)
  if (candidate.exp <= now) return null
  if (candidate.iat > now + 60) return null
  if (candidate.exp <= candidate.iat) return null
  if (candidate.exp - candidate.iat > ADMIN_SESSION_TTL_SECONDS + 60) {
    return null
  }

  return {
    sub: "admin",
    iat: candidate.iat,
    exp: candidate.exp,
  }
}

/**
 * Only allow redirects inside the admin area. Rejects absolute URLs,
 * protocol-relative URLs, backslashes, encoded separators, and traversal.
 */
export function safeAdminRedirect(value: string | null | undefined): string {
  if (!value) return DEFAULT_ADMIN_PATH
  if (
    !value.startsWith("/") ||
    value.startsWith("//") ||
    value.includes("\\") ||
    /%2f|%5c|[\u0000-\u001f]/i.test(value)
  ) {
    return DEFAULT_ADMIN_PATH
  }

  try {
    const url = new URL(value, "https://qa3da.local")
    if (url.origin !== "https://qa3da.local") return DEFAULT_ADMIN_PATH
    if (url.pathname !== "/admin" && !url.pathname.startsWith("/admin/")) {
      return DEFAULT_ADMIN_PATH
    }
    return `${url.pathname}${url.search}${url.hash}`
  } catch {
    return DEFAULT_ADMIN_PATH
  }
}
