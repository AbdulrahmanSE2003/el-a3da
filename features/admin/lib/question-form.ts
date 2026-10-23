import type { ContentSetMeta } from "./types"

/**
 * قواعد التحقق من بيانات تعديل السؤال. الملف ده pure ومش server-only
 * عشان الـ client يستخدمه للتحقق الفوري، لكن السيرفر لازم يعيد التحقق
 * دائمًا قبل أي كتابة.
 */

export const QUESTION_TEXT_MAX_LENGTH = 4000
export const QUESTION_CATEGORY_MAX_LENGTH = 200
export const QUESTION_CORRECT_ANSWER_MAX_LENGTH = 1000
export const QUESTION_BADGE_LABEL_MAX_LENGTH = 200
export const QUESTION_EXTERNAL_ID_MAX_LENGTH = 100

export interface QuestionDraft {
  text: string
  category: string
  correctAnswer: string
  badgeLabel: string
}

/** مسودة الإضافة بتزود  ID السؤال ، مش موجود في التعديل. */
export interface QuestionCreateDraft extends QuestionDraft {
  externalId: string
}

export type QuestionField = keyof QuestionDraft
export type QuestionFieldErrors = Partial<Record<QuestionField, string>>
export type QuestionCreateFieldErrors = QuestionFieldErrors &
  Partial<Record<"externalId", string>>

export interface NormalizedQuestionDraft {
  text: string
  category: string | null
  correctAnswer: string | null
  badgeLabel: string | null
}

export type QuestionValidationResult =
  | { ok: true; value: NormalizedQuestionDraft }
  | { ok: false; fieldErrors: QuestionFieldErrors }

export type QuestionCreateValidationResult =
  | { ok: true; value: NormalizedQuestionDraft }
  | { ok: false; fieldErrors: QuestionCreateFieldErrors }

export interface QuestionMutationResult {
  ok: boolean
  error?: string
  fieldErrors?: QuestionFieldErrors
}

export interface QuestionCreateMutationResult {
  ok: boolean
  error?: string
  fieldErrors?: QuestionCreateFieldErrors
}

const normalizeNullable = (value: string): string | null => {
  const trimmed = value.trim()
  return trimmed ? trimmed : null
}

/**
 * `setMeta` بيحدد الحقول المسموحة لكل مجموعة:
 * - casino: correct_answer مطلوب.
 * - zad: category وbadge_label اختياريين.
 * - bomb: category مطلوب ومحصور في فئات محرك اللعبة.
 * - باقي المجموعات: category مطلوب.
 */
export function validateQuestionDraft(
  draft: QuestionDraft,
  setMeta: ContentSetMeta
): QuestionValidationResult {
  const fieldErrors: QuestionFieldErrors = {}

  const text = draft.text.trim()
  if (!text) {
    fieldErrors.text = "نص السؤال مطلوب."
  } else if (text.length > QUESTION_TEXT_MAX_LENGTH) {
    fieldErrors.text = `نص السؤال أطول من ${QUESTION_TEXT_MAX_LENGTH} حرف.`
  }

  const category = normalizeNullable(draft.category)
  if (category && category.length > QUESTION_CATEGORY_MAX_LENGTH) {
    fieldErrors.category = `الفئة أطول من ${QUESTION_CATEGORY_MAX_LENGTH} حرف.`
  } else if (
    category &&
    setMeta.categoryOptions &&
    !setMeta.categoryOptions.includes(category)
  ) {
    fieldErrors.category = `الفئة لازم تكون واحدة من: ${setMeta.categoryOptions.join(", ")}`
  } else if (!category && !setMeta.hasOptionalCategory) {
    fieldErrors.category = "الفئة مطلوبة لهذه المجموعة."
  }

  const correctAnswer = setMeta.hasCorrectAnswer
    ? normalizeNullable(draft.correctAnswer)
    : null
  if (
    correctAnswer &&
    correctAnswer.length > QUESTION_CORRECT_ANSWER_MAX_LENGTH
  ) {
    fieldErrors.correctAnswer = `الإجابة أطول من ${QUESTION_CORRECT_ANSWER_MAX_LENGTH} حرف.`
  } else if (setMeta.hasCorrectAnswer && !correctAnswer) {
    fieldErrors.correctAnswer = "الإجابة الصحيحة مطلوبة لهذه المجموعة."
  }

  const badgeLabel = setMeta.hasBadgeLabel
    ? normalizeNullable(draft.badgeLabel)
    : null
  if (badgeLabel && badgeLabel.length > QUESTION_BADGE_LABEL_MAX_LENGTH) {
    fieldErrors.badgeLabel = `الشارة أطول من ${QUESTION_BADGE_LABEL_MAX_LENGTH} حرف.`
  }

  if (Object.keys(fieldErrors).length > 0) {
    return { ok: false, fieldErrors }
  }

  return {
    ok: true,
    value: {
      text,
      category,
      correctAnswer,
      badgeLabel,
    },
  }
}

/**
 * نفس قواعد التحقق مع  ID السؤال  المطلوب للإضافة.
 *  ID السؤال  بيتولد تلقائياً على السيرفر من ترتيب السؤال، فمش بنحتاج
 * يتحقق منه من طرف العميل دلوقتي.
 */
export function validateQuestionCreateDraft(
  draft: QuestionCreateDraft,
  setMeta: ContentSetMeta
): QuestionCreateValidationResult {
  const base = validateQuestionDraft(draft, setMeta)
  const fieldErrors: QuestionCreateFieldErrors = base.ok
    ? {}
    : { ...base.fieldErrors }

  if (!base.ok || Object.keys(fieldErrors).length > 0) {
    return { ok: false, fieldErrors }
  }

  return base
}
