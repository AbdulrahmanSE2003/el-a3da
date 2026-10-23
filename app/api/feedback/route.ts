import { randomUUID } from "node:crypto"
import { revalidatePath } from "next/cache"
import { NextResponse } from "next/server"
import {
  FEEDBACK_DEVICE_INFO_MAX_LENGTH,
  getFeedbackFileExtension,
  validateFeedbackDraft,
  validateFeedbackFiles,
} from "@/features/feedback/lib/feedback"
import { insertFeedback } from "@/features/feedback/server/feedback-service"
import { checkRateLimit } from "@/features/feedback/server/rate-limit"
import {
  getClientAddress,
  getDeviceInfo,
  isSameOrigin,
} from "@/features/feedback/server/request"
import {
  createUploadToken,
  FeedbackUploadTokenConfigurationError,
} from "@/features/feedback/server/upload-token"
import {
  createFeedbackUploadUrl,
  FeedbackStorageConfigurationError,
} from "@/lib/server/neon-storage"

export const runtime = "nodejs"

const MAX_JSON_BYTES = 32 * 1024
const RATE_LIMIT = 6
const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000

function json(
  body: unknown,
  init?: { status?: number; headers?: Record<string, string> }
) {
  return NextResponse.json(body, {
    status: init?.status,
    headers: { "Cache-Control": "no-store", ...init?.headers },
  })
}

export async function POST(request: Request) {
  if (!isSameOrigin(request)) {
    return json(
      { ok: false, error: "الطلب مش من نفس الموقع." },
      { status: 403 }
    )
  }

  const contentLength = Number(request.headers.get("content-length") ?? 0)
  if (Number.isFinite(contentLength) && contentLength > MAX_JSON_BYTES) {
    return json(
      { ok: false, error: "حجم البيانات كبير جدًا." },
      { status: 413 }
    )
  }

  const rate = checkRateLimit(
    "feedback-submit",
    getClientAddress(request),
    RATE_LIMIT,
    RATE_LIMIT_WINDOW_MS
  )
  if (!rate.allowed) {
    return json(
      {
        ok: false,
        error: "وصلت الحد الأقصى للمحاولات. جرّب تاني بعد شوية.",
      },
      {
        status: 429,
        headers: { "Retry-After": String(rate.retryAfterSeconds) },
      }
    )
  }

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return json(
      { ok: false, error: "البيانات المرسلة غير صالحة." },
      { status: 400 }
    )
  }

  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return json(
      { ok: false, error: "البيانات المرسلة غير صالحة." },
      { status: 400 }
    )
  }

  const record = body as Record<string, unknown>

  // Honeypot: الفورم الحقيقي بيبعته فاضي. البوتات بتملاه غالبًا.
  if (typeof record.website === "string" && record.website.trim()) {
    return json({ ok: true })
  }

  const clientInfo =
    typeof record.deviceInfo === "string" ? record.deviceInfo.slice(0, 200) : ""
  const draft = validateFeedbackDraft({
    ...record,
    deviceInfo: getDeviceInfo(request, clientInfo).slice(
      0,
      FEEDBACK_DEVICE_INFO_MAX_LENGTH
    ),
  })
  if (!draft.ok) {
    return json(
      {
        ok: false,
        error: "راجع البيانات المكتوبة وجرب تاني.",
        fieldErrors: draft.fieldErrors,
      },
      { status: 400 }
    )
  }

  const files = validateFeedbackFiles(record.files)
  if (!files.ok) {
    return json({ ok: false, error: files.error }, { status: 400 })
  }

  const feedbackId = randomUUID()

  try {
    if (files.value.length === 0) {
      await insertFeedback({ id: feedbackId, draft: draft.value, files: [] })
      revalidatePath("/admin/feedback")
      revalidatePath("/admin")
      return json({ ok: true })
    }

    const date = new Date().toISOString().slice(0, 10)
    const uploadFiles = files.value.map((file) => ({
      key: `feedback/${date}/${feedbackId}/${randomUUID()}.${getFeedbackFileExtension(
        file.type
      )}`,
      contentType: file.type,
      size: file.size,
    }))

    const token = createUploadToken({
      sid: feedbackId,
      draft: draft.value,
      files: uploadFiles,
    })
    const uploads = await Promise.all(
      uploadFiles.map(async (file) => ({
        key: file.key,
        ...(await createFeedbackUploadUrl(file.key, file.contentType)),
      }))
    )

    return json({ ok: true, pending: true, token, uploads })
  } catch (error) {
    if (
      error instanceof FeedbackStorageConfigurationError ||
      error instanceof FeedbackUploadTokenConfigurationError
    ) {
      return json(
        { ok: false, error: "رفع الصور مش متاح حاليًا. جرّب من غير صورة." },
        { status: 503 }
      )
    }

    console.error("Feedback submission failed", error)
    return json(
      { ok: false, error: "حصلت مشكلة وإحنا بنحفظ الملاحظة. جرّب تاني." },
      { status: 500 }
    )
  }
}
