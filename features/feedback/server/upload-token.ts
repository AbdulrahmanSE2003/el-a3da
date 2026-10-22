import "server-only"

import { createHmac, timingSafeEqual } from "node:crypto"
import {
  FEEDBACK_MAX_FILES,
  isFeedbackMimeType,
  validateFeedbackDraft,
  type FeedbackDraft,
  type FeedbackMimeType,
} from "../lib/feedback"

/**
 * توكين موقّع بيربط بيانات الملاحظة بالصور اللي اتطلب رفعها.
 *
 * العميل بياخد التوكين بعد ما السيرفر يتحقق من البيانات، بيرفع الصور مباشرة
 * لـ Neon Storage، وبعدها بيرجع التوكين عشان السيرفر يتأكد إن الصور موجودة
 * وبالحجم والنوع الصح قبل ما يكتب في قاعدة البيانات.
 */

const TOKEN_TTL_MS = 15 * 60 * 1000
const TOKEN_VERSION = 1
const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
const OBJECT_KEY_PATTERN =
  /^feedback\/\d{4}-\d{2}-\d{2}\/[0-9a-f-]{36}\/[0-9a-f-]{36}\.(png|jpg|webp)$/i

export interface FeedbackUploadFile {
  key: string
  contentType: FeedbackMimeType
  size: number
}

interface UploadTokenPayload {
  v: typeof TOKEN_VERSION
  sid: string
  draft: FeedbackDraft
  files: FeedbackUploadFile[]
  exp: number
}

export interface VerifiedUploadToken {
  sid: string
  draft: FeedbackDraft
  files: FeedbackUploadFile[]
}

export class FeedbackUploadTokenConfigurationError extends Error {
  constructor() {
    super("Feedback upload tokens are not configured.")
    this.name = "FeedbackUploadTokenConfigurationError"
  }
}

function getSigningSecret(): Buffer {
  const authSecret = process.env.AUTH_SECRET
  if (!authSecret) throw new FeedbackUploadTokenConfigurationError()

  return createHmac("sha256", authSecret)
    .update("qa3da-feedback-upload-v1")
    .digest()
}

function sign(encodedPayload: string): string {
  return createHmac("sha256", getSigningSecret())
    .update(encodedPayload)
    .digest("base64url")
}

export function createUploadToken(input: {
  sid: string
  draft: FeedbackDraft
  files: FeedbackUploadFile[]
}): string {
  const payload: UploadTokenPayload = {
    v: TOKEN_VERSION,
    sid: input.sid,
    draft: input.draft,
    files: input.files,
    exp: Date.now() + TOKEN_TTL_MS,
  }
  const encoded = Buffer.from(JSON.stringify(payload), "utf8").toString(
    "base64url"
  )
  return `${encoded}.${sign(encoded)}`
}

function isValidFile(value: unknown): value is FeedbackUploadFile {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false
  const file = value as Record<string, unknown>
  return (
    typeof file.key === "string" &&
    OBJECT_KEY_PATTERN.test(file.key) &&
    isFeedbackMimeType(file.contentType) &&
    typeof file.size === "number" &&
    Number.isInteger(file.size) &&
    file.size > 0
  )
}

export function verifyUploadToken(
  token: string | null | undefined
): VerifiedUploadToken | null {
  if (!token || typeof token !== "string" || token.length > 20_000) return null

  const [encoded, signature, extra] = token.split(".")
  if (!encoded || !signature || extra !== undefined) return null

  let expected: Buffer
  let actual: Buffer
  try {
    expected = Buffer.from(sign(encoded), "base64url")
    actual = Buffer.from(signature, "base64url")
  } catch {
    return null
  }
  if (expected.length !== actual.length) return null
  if (!timingSafeEqual(expected, actual)) return null

  let parsed: unknown
  try {
    parsed = JSON.parse(
      Buffer.from(encoded, "base64url").toString("utf8")
    ) as unknown
  } catch {
    return null
  }

  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed))
    return null
  const payload = parsed as Record<string, unknown>

  if (payload.v !== TOKEN_VERSION) return null
  if (typeof payload.sid !== "string" || !UUID_PATTERN.test(payload.sid)) {
    return null
  }
  if (
    typeof payload.exp !== "number" ||
    !Number.isFinite(payload.exp) ||
    payload.exp < Date.now()
  ) {
    return null
  }

  const draft = validateFeedbackDraft(payload.draft)
  if (!draft.ok) return null

  if (
    !Array.isArray(payload.files) ||
    payload.files.length > FEEDBACK_MAX_FILES
  ) {
    return null
  }
  if (!payload.files.every(isValidFile)) return null

  const keys = new Set(payload.files.map((file) => file.key))
  if (keys.size !== payload.files.length) return null

  return {
    sid: payload.sid,
    draft: draft.value,
    files: payload.files,
  }
}
