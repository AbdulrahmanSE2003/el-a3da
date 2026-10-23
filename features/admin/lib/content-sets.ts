import { bombCategoryKeys } from "@/games/bomb/constants"
import { isContentSetId as isContentSetIdentifier } from "@/lib/content/types"
import type { ContentSetId, ContentSetMeta } from "./types"

/**
 * Metadata وصفية لمجموعات المحتوى المعروفة. الأعداد والنسخ بتتحسب من
 * Neon في `features/admin/server/queries.ts`، ومفيش هنا أي محتوى أسئلة.
 *
 * المجموعات الجديدة اللي بتتضاف لـ `content_sets` بتظهر تلقائيًا؛ الدالة
 * `getSetMeta` بترجع وصفًا افتراضيًا لأي ID صالح مش موجود في القائمة دي.
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
    id: "bomb",
    title: "القنبلة",
    stamp: "BOMB",
    sourceFile: "contents/bomb.ts",
    isUsed: true,
    hasCorrectAnswer: false,
    hasOptionalCategory: false,
    hasBadgeLabel: false,
    // فئات القنبلة ثابتة في محرك اللعبة، فلازم نمنع كتابة فئة مش معروفة.
    categoryOptions: bombCategoryKeys,
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

export function isContentSetId(
  value: string | null | undefined
): value is ContentSetId {
  return isContentSetIdentifier(value)
}

/**
 * بيرجّع الوصف المعروف للمجموعة، أو وصف افتراضيًا لأي ID صالح جديد في
 * قاعدة البيانات. `title` اختياريًا بييجي من `content_sets.name`.
 */
export function getSetMeta(id: ContentSetId, title?: string): ContentSetMeta {
  const known = CONTENT_SETS.find((set) => set.id === id)
  const dbTitle = title?.trim()

  if (known) {
    return dbTitle ? { ...known, title: dbTitle } : known
  }

  return {
    id,
    title: dbTitle || id,
    stamp: id.toUpperCase(),
    sourceFile: "—",
    isUsed: false,
    hasCorrectAnswer: false,
    hasOptionalCategory: false,
    hasBadgeLabel: false,
  }
}
