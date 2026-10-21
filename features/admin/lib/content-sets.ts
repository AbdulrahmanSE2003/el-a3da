import type { ContentSetId, ContentSetMeta } from "./types"

/**
 * Metadata ثابتة لمجموعات المحتوى. الأعداد والنسخ بتتحسب من Neon في
 * `features/admin/server/queries.ts`، ومفيش هنا أي محتوى أسئلة.
 *
 * `isUsed` بتوصف هل المجموعة مربوطة بصفحة في التطبيق حاليًا، مش حالة
 * تفعيل في قاعدة البيانات — مفيش عمود is_active/is_used في المخطط.
 */
export const CONTENT_SETS: readonly ContentSetMeta[] = [
  {
    id: "casino",
    title: "كافيه الألعاب",
    stamp: "CASINO",
    sourceFile: "contents/casino.ts",
    isUsed: true,
    hasCorrectAnswer: true,
    hasOptionalCategory: false,
    hasBadgeLabel: false,
  },
  {
    id: "topics",
    title: "مواضيع",
    stamp: "TOPICS",
    sourceFile: "contents/topics.ts",
    isUsed: true,
    hasCorrectAnswer: false,
    hasOptionalCategory: false,
    hasBadgeLabel: false,
  },
  {
    id: "challenges",
    title: "تحديات",
    stamp: "CHALLENGES",
    sourceFile: "contents/challenges.ts",
    isUsed: true,
    hasCorrectAnswer: false,
    hasOptionalCategory: false,
    hasBadgeLabel: false,
  },
  {
    id: "sheikh",
    title: "شيخ الحارة",
    stamp: "SHEIKH",
    sourceFile: "contents/sheikh-questions.ts",
    isUsed: true,
    hasCorrectAnswer: false,
    hasOptionalCategory: false,
    hasBadgeLabel: false,
  },
  {
    id: "zad",
    title: "زاد القعدة",
    stamp: "ZAD",
    sourceFile: "contents/zad.ts",
    isUsed: true,
    hasCorrectAnswer: false,
    hasOptionalCategory: true,
    hasBadgeLabel: true,
  },
  {
    id: "punishments",
    title: "عقوبات",
    stamp: "PUNISHMENTS",
    sourceFile: "contents/punishments.ts",
    // مش متسحبة من أي صفحة في التطبيق حاليًا — محتوى معلّق.
    isUsed: false,
    hasCorrectAnswer: false,
    hasOptionalCategory: false,
    hasBadgeLabel: false,
  },
]

export const CONTENT_SET_IDS = CONTENT_SETS.map((set) => set.id)

export function isContentSetId(value: string | null | undefined): value is ContentSetId {
  return Boolean(value) && CONTENT_SET_IDS.includes(value as ContentSetId)
}

export function getSetMeta(id: ContentSetId): ContentSetMeta {
  const meta = CONTENT_SETS.find((set) => set.id === id)
  if (!meta) throw new Error(`Unknown content set: ${id}`)
  return meta
}
