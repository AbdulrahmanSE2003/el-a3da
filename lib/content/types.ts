/**
 * الشكل الموحّد للمحتوى العام (client + server) ونفس الحدود اللي بيتحرك
 * فيها المحتوى: من Neon → الـ API → الكاش المحلي → اللعبة.
 *
 * الملف ده ما بيعتمدش على أي حاجة server-only، عشان ينفع يتستورد من
 * client components ومن الـ route handlers في نفس الوقت.
 */

/* ------------------------------------------------------------------ */
/* Content sets                                                        */
/* ------------------------------------------------------------------ */

/**
 * Content sets are DB-driven. The API, cache and sync must accept any
 * ordinary set identifier that Neon exposes, not only the bundled ones.
 *
 * The identifier format is intentionally conservative: lower-case ASCII,
 * digits, underscores and hyphens, starting with a letter or digit.
 */
export type ContentSetId = string

const CONTENT_SET_ID_PATTERN = /^[a-z0-9][a-z0-9_-]{0,62}$/

export function isContentSetId(value: unknown): value is ContentSetId {
  return typeof value === "string" && CONTENT_SET_ID_PATTERN.test(value)
}

/* ------------------------------------------------------------------ */
/* Questions                                                           */
/* ------------------------------------------------------------------ */

/**
 * عنصر محتوى جاهز للعب. نفس الحقول اللي ملفات `contents/*` بتصدّرها
 * بالظبط، عشان ما يحصلش أي تغيير في السلوك أو في الأسماء المستخدمة.
 *
 * `id` هو `external_id` من قاعدة البيانات (المعرّف المستقر)، مش الـ uuid.
 */
export interface ContentQuestion {
  id: string
  text: string
  category?: string
  correct_answer?: string
  badgeLabel?: string
}

/** الشكل الأساسي اللي `createContentDeck` بتتعامل معاه. */
export interface ContentItem {
  id: string
  text: string
  category?: string
  correct_answer?: string
  badgeLabel?: string
}

/** نسخ المجموعات زي ما بترجّعها قاعدة البيانات (bigint كنص). */
export interface ContentSetVersion {
  id: ContentSetId
  version: string
}

/** رد `/api/content/versions`. */
export interface ContentVersionsResponse {
  sets: ContentSetVersion[]
}

/** رد `/api/content/sets/[id]`. */
export interface ContentSetResponse {
  id: ContentSetId
  version: string
  questions: ContentQuestion[]
}

/* ------------------------------------------------------------------ */
/* Validation                                                          */
/* ------------------------------------------------------------------ */

/** الحد الأقصى الآمن لعدد الأسئلة في مجموعة واحدة — حماية من ردود ضخمة. */
export const MAX_QUESTIONS_PER_SET = 20_000

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value)
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim() !== ""
}

/**
 * التحقق من سؤال واحد قادم من الشبكة أو من الكاش.
 * الحقول الاختيارية بتتحقق بنوعها لو موجودة، وبنتجاهل أي حقول زيادة.
 */
export function parseContentQuestion(value: unknown): ContentQuestion | null {
  if (!isPlainObject(value)) return null
  if (!isNonEmptyString(value.id)) return null
  if (typeof value.text !== "string" || value.text.trim() === "") return null

  const question: ContentQuestion = {
    id: value.id,
    text: value.text,
  }

  if (value.category !== undefined && value.category !== null) {
    if (typeof value.category !== "string") return null
    question.category = value.category
  }

  if (value.correct_answer !== undefined && value.correct_answer !== null) {
    if (typeof value.correct_answer !== "string") return null
    question.correct_answer = value.correct_answer
  }

  if (value.badgeLabel !== undefined && value.badgeLabel !== null) {
    if (typeof value.badgeLabel !== "string") return null
    question.badgeLabel = value.badgeLabel
  }

  return question
}

/**
 * التحقق من رد مجموعة كاملة: المعرّف، النسخة، والترتيب.
 *
 * بيرجّع `null` لو أي حقل أساسي غلط أو عدد الأسئلة غير منطقي، عشان
 * الكاش ما يتكتبش أبدًا بمحتوى ناقص أو تالف.
 */
export function parseContentSetResponse(
  value: unknown,
  expectedId?: ContentSetId
): ContentSetResponse | null {
  if (!isPlainObject(value)) return null
  if (!isContentSetId(value.id)) return null
  if (expectedId && value.id !== expectedId) return null
  if (typeof value.version !== "string" || value.version === "") return null
  if (!Array.isArray(value.questions)) return null
  if (value.questions.length === 0) return null
  if (value.questions.length > MAX_QUESTIONS_PER_SET) return null

  const questions: ContentQuestion[] = []
  const seen = new Set<string>()

  for (const raw of value.questions) {
    const question = parseContentQuestion(raw)
    if (!question) return null
    // تكرار المعرّفات داخل نفس المجموعة = محتوى تالف.
    if (seen.has(question.id)) return null
    seen.add(question.id)
    questions.push(question)
  }

  return { id: value.id, version: value.version, questions }
}

/** التحقق من رد قائمة النسخ. */
export function parseContentVersionsResponse(
  value: unknown
): ContentVersionsResponse | null {
  if (!isPlainObject(value)) return null
  if (!Array.isArray(value.sets)) return null

  const sets: ContentSetVersion[] = []
  const seen = new Set<string>()

  for (const raw of value.sets) {
    if (!isPlainObject(raw)) return null
    if (!isContentSetId(raw.id)) return null
    if (typeof raw.version !== "string" || raw.version === "") return null
    if (seen.has(raw.id)) return null
    seen.add(raw.id)
    sets.push({ id: raw.id, version: raw.version })
  }

  return { sets }
}
