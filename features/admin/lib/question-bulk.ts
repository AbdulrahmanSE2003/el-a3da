import {
  validateQuestionDraft,
  type NormalizedQuestionDraft,
  type QuestionFieldErrors,
} from "./question-form"
import {
  formatCategoryOption,
  getCategoryOptions,
  type CategoryOption,
} from "./question-categories"
import type { ContentSetMeta } from "./types"

/**
 * منطق الـbulk add النقي (بدون DB أو React):
 * parsing، validation، duplicate warnings، والقالب.
 *
 * نفس الملف بيتستخدم في الكلاينت للمعاينة وفي السيرفر لإعادة التحقق،
 * عشان القواعد تفضل واحدة في الاتجاهين.
 */

export const BULK_MAX_QUESTIONS = 500
export const BULK_MAX_PAYLOAD_BYTES = 512 * 1024

export interface BulkRowError {
  /** رقم الصف من 1 */
  row: number
  field: string
  message: string
}

export interface BulkDuplicateWarning {
  row: number
  firstRow: number
  text: string
}

export interface BulkValidationResult {
  ok: boolean
  /** الصفوف الصالحة بعد التطبيع؛ السيرفر مابيدخلش غيرها. */
  rows: NormalizedQuestionDraft[]
  errors: BulkRowError[]
  warnings: BulkDuplicateWarning[]
  /** خطأ على مستوى الملف كله (JSON أو root أو الحدود). */
  rootError?: string
}

export interface QuestionBulkResult {
  ok: boolean
  error?: string
  count?: number
  externalIds?: string[]
  rowErrors?: BulkRowError[]
  warnings?: BulkDuplicateWarning[]
}

const encoder = new TextEncoder()

export function getBulkPayloadBytes(value: string): number {
  return encoder.encode(value).length
}

export function parseBulkJson(
  raw: string
): { ok: true; value: unknown } | { ok: false; error: string } {
  if (!raw.trim()) {
    return {
      ok: false,
      error:
        "أضيفي الأسئلة باللصق أو برفع ملف JSON، وهنعاينها مع بعض قبل الإضافة.",
    }
  }

  if (getBulkPayloadBytes(raw) > BULK_MAX_PAYLOAD_BYTES) {
    return {
      ok: false,
      error: `حجم الملف أكبر من المسموح (${Math.round(BULK_MAX_PAYLOAD_BYTES / 1024)} كيلوبايت). حاول تقصّره أو قسّمه على دفعات أصغر.`,
    }
  }

  try {
    return { ok: true, value: JSON.parse(raw) as unknown }
  } catch {
    return {
      ok: false,
      error: "صيغة الملف فيها حاجة ناقصة — راجع الأقواس والفواصل وجرّب تاني.",
    }
  }
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value)
}

function asOptionalString(
  value: Record<string, unknown>,
  field: string,
  row: number,
  label: string,
  errors: BulkRowError[]
): string {
  const raw = value[field]
  if (raw === undefined || raw === null) return ""

  if (typeof raw !== "string") {
    errors.push({
      row,
      field,
      message: `${label} لازم يكون نصًا، أو تسيبه فاضيًا.`,
    })
    return ""
  }

  return raw
}

function pushFieldErrors(
  row: number,
  fieldErrors: QuestionFieldErrors,
  errors: BulkRowError[]
) {
  for (const [field, message] of Object.entries(fieldErrors)) {
    if (!message) continue
    errors.push({ row, field, message })
  }
}

function formatAllowedCategories(options: readonly CategoryOption[]): string {
  if (options.length === 0) return "مفيش فئات متاحة في المجموعة دلوقتي."
  return options.map(formatCategoryOption).join("، ")
}

/**
 * يتحقق من الصفوف بعد ما الـJSON اتحوّل لـarray.
 * بيستخدم `validateQuestionDraft` عشان نفس قواعد الفردي (الحقول المطلوبة
 * والحدود)، وبيزيد عليه: الحقول المسموحة، الفئات المسموحة، والتكرار.
 */
export function validateBulkRows(
  value: readonly unknown[],
  setMeta: ContentSetMeta,
  dbCategories: readonly string[]
): BulkValidationResult {
  const categoryOptions = getCategoryOptions(setMeta, dbCategories)
  const allowedCategories = new Set(
    categoryOptions.map((category) => category.value)
  )
  const allowedFields = new Set(["text", "category"])

  if (setMeta.hasCorrectAnswer) allowedFields.add("correctAnswer")
  if (setMeta.hasBadgeLabel) allowedFields.add("badgeLabel")

  const errors: BulkRowError[] = []
  const rows: NormalizedQuestionDraft[] = []

  for (let index = 0; index < value.length; index += 1) {
    const row = index + 1
    const item = value[index]

    if (!isPlainObject(item)) {
      errors.push({
        row,
        field: "root",
        message: "كل سؤال في القائمة لازم يكون بين أقواس { }.",
      })
      continue
    }

    const rowErrorsBefore = errors.length

    for (const key of Object.keys(item)) {
      if (key === "id") {
        errors.push({
          row,
          field: key,
          message: "متكتبيش حقل id — النظام بيولّده لوحده.",
        })
      } else if (key === "position") {
        errors.push({
          row,
          field: key,
          message: "متكتبيش حقل position — النظام بيضبط الترتيب لوحده.",
        })
      } else if (!allowedFields.has(key)) {
        errors.push({
          row,
          field: key,
          message: `الحقل ${key} غير مدعوم في مجموعة ${setMeta.title}.`,
        })
      }
    }

    let text = ""
    if (typeof item.text === "string") {
      text = item.text
    } else {
      errors.push({
        row,
        field: "text",
        message: "نص السؤال لازم يكون نص (مش رقم أو رمز).",
      })
    }

    const category = asOptionalString(item, "category", row, "الفئة", errors)
    const correctAnswer = asOptionalString(
      item,
      "correctAnswer",
      row,
      "الإجابة الصحيحة",
      errors
    )
    const badgeLabel = asOptionalString(
      item,
      "badgeLabel",
      row,
      "الشارة",
      errors
    )

    // لو فيه خطأ هيكلي في الصف، منكررش نفس المشكلة من الـbase validator.
    if (errors.length !== rowErrorsBefore) continue

    const validation = validateQuestionDraft(
      { text, category, correctAnswer, badgeLabel },
      setMeta
    )

    if (!validation.ok) {
      pushFieldErrors(row, validation.fieldErrors, errors)
      continue
    }

    const normalizedCategory = validation.value.category
    if (normalizedCategory && !allowedCategories.has(normalizedCategory)) {
      errors.push({
        row,
        field: "category",
        message: `الفئة دي غير متاحة في المجموعة. الفئات المتاحة: ${formatAllowedCategories(categoryOptions)}`,
      })
      continue
    }

    rows.push(validation.value)
  }

  return {
    ok: errors.length === 0,
    rows,
    errors,
    warnings: buildDuplicateWarnings(rows),
  }
}

function buildDuplicateWarnings(
  rows: readonly NormalizedQuestionDraft[]
): BulkDuplicateWarning[] {
  const firstRowByText = new Map<string, number>()
  const warnings: BulkDuplicateWarning[] = []

  rows.forEach((row, index) => {
    const first = firstRowByText.get(row.text)
    if (first === undefined) {
      firstRowByText.set(row.text, index + 1)
      return
    }

    warnings.push({ row: index + 1, firstRow: first, text: row.text })
  })

  return warnings
}

/** parsing + root checks + row validation. هو الـpipeline الوحيد للصق والملف. */
export function validateBulkPayload(
  raw: string,
  setMeta: ContentSetMeta,
  dbCategories: readonly string[]
): BulkValidationResult {
  const parsed = parseBulkJson(raw)
  if (!parsed.ok) {
    return {
      ok: false,
      rows: [],
      errors: [],
      warnings: [],
      rootError: parsed.error,
    }
  }

  if (!Array.isArray(parsed.value)) {
    return {
      ok: false,
      rows: [],
      errors: [],
      warnings: [],
      rootError: "الملف لازم يكون قائمة أسئلة بين أقواس [ ].",
    }
  }

  if (parsed.value.length === 0) {
    return {
      ok: false,
      rows: [],
      errors: [],
      warnings: [],
      rootError: "القائمة فاضية، أضفي سؤال واحد على الأقل عشان تبدأ.",
    }
  }

  if (parsed.value.length > BULK_MAX_QUESTIONS) {
    return {
      ok: false,
      rows: [],
      errors: [],
      warnings: [],
      rootError: `أقصى حد ${BULK_MAX_QUESTIONS} سؤال في الدفعة الواحدة. لو عندك أكثر، قسّميها على دفعات أصغر.`,
    }
  }
  return validateBulkRows(parsed.value, setMeta, dbCategories)
}

/**
 * قالب JSON واقعي حسب المجموعة. بيستخدم قيم canonical؛ في Bomb المستخدم
 * بيشوف الاسم العربي في الـlegend جانب المحرر.
 */
export function buildBulkTemplate(
  setMeta: ContentSetMeta,
  dbCategories: readonly string[]
): string {
  const categoryOptions = getCategoryOptions(setMeta, dbCategories)
  const category = categoryOptions[0]?.value

  const buildRow = (text: string, includeCategory = true) => {
    const row: Record<string, unknown> = { text }

    if (includeCategory && category) row.category = category
    else if (setMeta.hasOptionalCategory) row.category = null

    if (setMeta.hasCorrectAnswer) row.correctAnswer = "الإجابة الصحيحة هنا"
    if (setMeta.hasBadgeLabel) row.badgeLabel = "زاد القعدة"

    return row
  }

  const rows = [
    buildRow("مثال أول لسؤال جديد"),
    buildRow("مثال تاني لسؤال جديد", categoryOptions.length > 1),
  ]

  return JSON.stringify(rows, null, 2)
}
