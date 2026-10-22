import { revalidatePath } from "next/cache"
import { NextResponse } from "next/server"
import { insertFeedback } from "@/features/feedback/server/feedback-service"
import { checkRateLimit } from "@/features/feedback/server/rate-limit"
import {
  getClientAddress,
  isSameOrigin,
} from "@/features/feedback/server/request"
import { verifyUploadToken } from "@/features/feedback/server/upload-token"
import {
  deleteFeedbackObjects,
  FeedbackStorageConfigurationError,
  headFeedbackObject,
} from "@/lib/server/neon-storage"

export const runtime = "nodejs"

const MAX_JSON_BYTES = 24 * 1024
const RATE_LIMIT = 12
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

function normalizeContentType(value: string | null): string {
  return (value ?? "").split(";")[0]?.trim().toLowerCase() ?? ""
}

/**
 * الخطوة التانية للرفع: العميل بيرجّع التوكين الموقّع بعد ما خلّص رفع
 * الصور مباشرة على Neon Storage. السيرفر بيتأكد إن كل صورة موجودة
 * وبالحجم والنوع المتفق عليه، وبعدها بيكتب الملاحظة والمرفقات.
 */
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
    "feedback-complete",
    getClientAddress(request),
    RATE_LIMIT,
    RATE_LIMIT_WINDOW_MS
  )
  if (!rate.allowed) {
    return json(
      { ok: false, error: "جرّب تاني بعد شوية." },
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

  const token =
    body && typeof body === "object" && !Array.isArray(body)
      ? (body as Record<string, unknown>).token
      : null

  const payload = verifyUploadToken(typeof token === "string" ? token : null)
  if (!payload) {
    return json(
      { ok: false, error: "انتهت صلاحية الرفع. ابدأ من جديد." },
      { status: 400 }
    )
  }

  const keys = payload.files.map((file) => file.key)

  try {
    for (const file of payload.files) {
      const head = await headFeedbackObject(file.key)
      if (
        !head ||
        head.sizeBytes !== file.size ||
        normalizeContentType(head.contentType) !== file.contentType
      ) {
        await deleteFeedbackObjects(keys).catch(() => undefined)
        return json(
          { ok: false, error: "الصور لم تكتمل. جرّب ترفعها تاني." },
          { status: 400 }
        )
      }
    }

    await insertFeedback({
      id: payload.sid,
      draft: payload.draft,
      files: payload.files,
    })
  } catch (error) {
    if (error instanceof FeedbackStorageConfigurationError) {
      return json(
        { ok: false, error: "رفع الصور مش متاح حاليًا." },
        { status: 503 }
      )
    }

    await deleteFeedbackObjects(keys).catch(() => undefined)
    console.error("Feedback completion failed", error)
    return json(
      { ok: false, error: "حصلت مشكلة وإحنا بنحفظ الملاحظة. جرّب تاني." },
      { status: 500 }
    )
  }

  revalidatePath("/admin/feedback")
  revalidatePath("/admin")
  return json({ ok: true })
}
