import { CONTENT_SETS, isContentSetId } from "@/features/admin/lib/content-sets"
import type { ContentSetId } from "@/features/admin/lib/types"

/* ------------------------------------------------------------------ */
/* Shared feedback constants                                           */
/* ------------------------------------------------------------------ */

export const FEEDBACK_TYPES = [
  "general",
  "bug",
  "suggestion",
  "question_issue",
] as const

export type FeedbackType = (typeof FEEDBACK_TYPES)[number]

export const FEEDBACK_TYPE_LABELS: Record<FeedbackType, string> = {
  general: "رسالة عامة",
  bug: "مشكلة",
  suggestion: "اقتراح",
  question_issue: "ملاحظة على سؤال",
}

export const FEEDBACK_TYPE_DESCRIPTIONS: Record<FeedbackType, string> = {
  general: "أي حاجة عايز تقولها عن القعدة",
  bug: "حاجة مش شغالة أو بتظهر بشكل غلط",
  suggestion: "فكرة جديدة أو تحسين في التجربة",
  question_issue: "سؤال فيه غلطة أو إجابة مش مظبوطة",
}

export const FEEDBACK_STATUSES = ["open", "reviewed", "done"] as const

export type FeedbackStatus = (typeof FEEDBACK_STATUSES)[number]

export const FEEDBACK_STATUS_LABELS: Record<FeedbackStatus, string> = {
  open: "مفتوحة",
  reviewed: "مقروءة",
  done: "تم الحل",
}

export const FEEDBACK_STATUS_DESCRIPTIONS: Record<FeedbackStatus, string> = {
  open: "اتبعتت ولسه مشفتش",
  reviewed: "قريتها بس لسه متحلتش",
  done: "قريتها واشتغلت عليها",
}

export const FEEDBACK_PRIORITIES = ["low", "medium", "high"] as const

export type FeedbackPriority = (typeof FEEDBACK_PRIORITIES)[number]

export const FEEDBACK_PRIORITY_LABELS: Record<FeedbackPriority, string> = {
  low: "عادية",
  medium: "متوسطة",
  high: "عالية",
}

/**
 * الأولوية بتتحدد تلقائيًا من نوع الرسالة:
 * عامة → عادية، اقتراح/ملاحظة على سؤال → متوسطة، مشكلة → عالية.
 * مش قابلة للتعديل من الواجهة عشان تفضل متسقة مع النوع.
 */
export const FEEDBACK_TYPE_PRIORITY: Record<FeedbackType, FeedbackPriority> = {
  general: "low",
  suggestion: "medium",
  question_issue: "medium",
  bug: "high",
}

export function getFeedbackPriority(type: FeedbackType): FeedbackPriority {
  return FEEDBACK_TYPE_PRIORITY[type]
}

export function isFeedbackPriority(value: unknown): value is FeedbackPriority {
  return (
    typeof value === "string" &&
    (FEEDBACK_PRIORITIES as readonly string[]).includes(value)
  )
}

export const FEEDBACK_MESSAGE_MIN_LENGTH = 10
export const FEEDBACK_MESSAGE_MAX_LENGTH = 4000
export const FEEDBACK_CONTACT_MAX_LENGTH = 200
export const FEEDBACK_QUESTION_ID_MAX_LENGTH = 100
export const FEEDBACK_DEVICE_INFO_MAX_LENGTH = 500
export const FEEDBACK_MAX_FILES = 3
export const FEEDBACK_MAX_FILE_BYTES = 5 * 1024 * 1024

export const FEEDBACK_ACCEPTED_MIME_TYPES = [
  "image/png",
  "image/jpeg",
  "image/webp",
] as const

export type FeedbackMimeType = (typeof FEEDBACK_ACCEPTED_MIME_TYPES)[number]

export const FEEDBACK_ACCEPT = FEEDBACK_ACCEPTED_MIME_TYPES.join(",")

const FEEDBACK_FILE_EXTENSIONS: Record<FeedbackMimeType, string> = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/webp": "webp",
}

export const FEEDBACK_SET_OPTIONS = CONTENT_SETS.map((set) => ({
  id: set.id,
  title: set.title,
}))

export function isFeedbackType(value: unknown): value is FeedbackType {
  return (
    typeof value === "string" &&
    (FEEDBACK_TYPES as readonly string[]).includes(value)
  )
}

export function isFeedbackStatus(value: unknown): value is FeedbackStatus {
  return (
    typeof value === "string" &&
    (FEEDBACK_STATUSES as readonly string[]).includes(value)
  )
}

export function isFeedbackMimeType(value: unknown): value is FeedbackMimeType {
  return (
    typeof value === "string" &&
    (FEEDBACK_ACCEPTED_MIME_TYPES as readonly string[]).includes(value)
  )
}

export function getFeedbackFileExtension(type: FeedbackMimeType): string {
  return FEEDBACK_FILE_EXTENSIONS[type]
}

export function formatFeedbackFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

/* ------------------------------------------------------------------ */
/* Draft validation (client + server)                                  */
/* ------------------------------------------------------------------ */

export interface FeedbackDraft {
  type: FeedbackType
  message: string
  rating: number | null
  contact: string
  setId: ContentSetId | null
  questionExternalId: string
  deviceInfo: string
}

export interface FeedbackFieldErrors {
  type?: string
  message?: string
  rating?: string
  contact?: string
  setId?: string
  questionExternalId?: string
  deviceInfo?: string
}

export type FeedbackDraftValidation =
  | { ok: true; value: FeedbackDraft }
  | { ok: false; fieldErrors: FeedbackFieldErrors }

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {}
}

function asText(value: unknown): string {
  return typeof value === "string" ? value.trim() : ""
}

export function validateFeedbackDraft(input: unknown): FeedbackDraftValidation {
  const record = asRecord(input)
  const fieldErrors: FeedbackFieldErrors = {}

  const rawType = record.type
  const type = isFeedbackType(rawType) ? rawType : "general"
  if (
    rawType !== undefined &&
    rawType !== null &&
    rawType !== "" &&
    !isFeedbackType(rawType)
  ) {
    fieldErrors.type = "اختار نوع الملاحظة."
  }

  const message = asText(record.message)
  if (message.length < FEEDBACK_MESSAGE_MIN_LENGTH) {
    fieldErrors.message = `اكتب ${FEEDBACK_MESSAGE_MIN_LENGTH} حروف على الأقل.`
  } else if (message.length > FEEDBACK_MESSAGE_MAX_LENGTH) {
    fieldErrors.message = `الرسالة أطول من ${FEEDBACK_MESSAGE_MAX_LENGTH} حرف.`
  }

  let rating: number | null = null
  if (
    record.rating !== undefined &&
    record.rating !== null &&
    record.rating !== ""
  ) {
    const parsed = Number(record.rating)
    if (!Number.isInteger(parsed) || parsed < 1 || parsed > 5) {
      fieldErrors.rating = "التقييم من 1 لـ 5."
    } else {
      rating = parsed
    }
  }

  const contact = asText(record.contact)
  if (contact.length > FEEDBACK_CONTACT_MAX_LENGTH) {
    fieldErrors.contact = `بيانات التواصل أطول من ${FEEDBACK_CONTACT_MAX_LENGTH} حرف.`
  }

  const rawSetId = asText(record.setId)
  let setId: ContentSetId | null = null
  if (rawSetId && rawSetId !== "none") {
    if (isContentSetId(rawSetId)) {
      setId = rawSetId
    } else {
      fieldErrors.setId = "المجموعة المختارة غير معروفة."
    }
  }

  const questionExternalId = asText(record.questionExternalId)
  if (questionExternalId.length > FEEDBACK_QUESTION_ID_MAX_LENGTH) {
    fieldErrors.questionExternalId = " ID السؤال  طويل جدًا."
  }

  const deviceInfo = asText(record.deviceInfo)
  if (deviceInfo.length > FEEDBACK_DEVICE_INFO_MAX_LENGTH) {
    fieldErrors.deviceInfo = "بيانات الجهاز طويلة جدًا."
  }

  if (Object.keys(fieldErrors).length > 0) {
    return { ok: false, fieldErrors }
  }

  return {
    ok: true,
    value: {
      type,
      message,
      rating,
      contact,
      setId,
      questionExternalId,
      deviceInfo,
    },
  }
}

/* ------------------------------------------------------------------ */
/* Upload descriptors                                                  */
/* ------------------------------------------------------------------ */

export interface FeedbackFileDescriptor {
  name: string
  type: FeedbackMimeType
  size: number
}

export type FeedbackFilesValidation =
  { ok: true; value: FeedbackFileDescriptor[] } | { ok: false; error: string }

export function validateFeedbackFiles(input: unknown): FeedbackFilesValidation {
  if (input === undefined || input === null) return { ok: true, value: [] }
  if (!Array.isArray(input)) {
    return { ok: false, error: "قائمة الصور غير صالحة." }
  }
  if (input.length > FEEDBACK_MAX_FILES) {
    return { ok: false, error: `الحد الأقصى ${FEEDBACK_MAX_FILES} صور.` }
  }

  const files: FeedbackFileDescriptor[] = []
  for (const item of input) {
    const record = asRecord(item)
    const name = asText(record.name).slice(0, 200)
    const type = record.type
    const size = Number(record.size)

    if (!isFeedbackMimeType(type)) {
      return { ok: false, error: "الصور المسموحة: PNG أو JPG أو WebP." }
    }
    if (!Number.isInteger(size) || size <= 0) {
      return { ok: false, error: "حجم إحدى الصور غير صالح." }
    }
    if (size > FEEDBACK_MAX_FILE_BYTES) {
      return {
        ok: false,
        error: `كل صورة لازم تكون ${Math.round(
          FEEDBACK_MAX_FILE_BYTES / (1024 * 1024)
        )} ميجا أو أقل.`,
      }
    }

    files.push({ name, type, size })
  }

  return { ok: true, value: files }
}
