/**
 * مزوّد المحتوى — الطبقة الوحيدة اللي اللعبة بتسألها عن محتوى مجموعة.
 *
 * القاعدة الأساسية: **جلسة، نسخة محتوى واحدة**.
 * لما جلسة لعبة تطلب مجموعة، بنرجّع لها snapshot ثابت من نسخة واحدة
 * (الكاش المحلي لو سليم، وإلا الملفات المدمجة). أي مزامنة بتحصل بعد كده
 * بتكتب في الكاش بس — مش بتلمس snapshot أي جلسة شغالة. النسخة الجديدة
 * بتظهر للجلسات اللي بتتبني بعد كده.
 */

import { casinoQuestions } from "@/contents/casino"
import { challenges } from "@/contents/challenges"
import { punishments } from "@/contents/punishments"
import { sheikhQuestions } from "@/contents/sheikh-questions"
import { topics } from "@/contents/topics"
import { zadTopics } from "@/contents/zad"

import { readCachedSet } from "./cache"
import type { ContentQuestion, ContentSetId } from "./types"

/**
 * مصدر الحقيقة الثابت (fallback). نفس الملفات اللي اللعبة كانت بتستوردها
 * قبل المزامنة، وبنفس الحقول بالظبط.
 */
const BUNDLED: Record<ContentSetId, readonly ContentQuestion[]> = {
  casino: casinoQuestions,
  challenges,
  sheikh: sheikhQuestions,
  topics,
  zad: zadTopics,
  punishments,
}

/** نسخة محتوى مجمّدة (frozen) لجلسة واحدة. */
export interface ContentSnapshot {
  id: ContentSetId
  source: "cache" | "bundled"
  version: string | null
  questions: readonly ContentQuestion[]
}

/**
 * ذاكرة صغيرة داخل الصفحة: مجمّدات بنفس (المجموعة + النسخة).
 * بتمنع إعادة بناء الـ arrays، وبتخلي كل الجلسات المبنية على نفس النسخة
 * تشترك في نفس المرجع — أسرع وأقل استهلاكًا للذاكرة.
 */
const snapshotPool = new Map<string, ContentSnapshot>()

const poolKey = (id: ContentSetId, version: string | null) =>
  `${id}@${version ?? "bundled"}`

function frozenQuestions(
  questions: readonly ContentQuestion[]
): readonly ContentQuestion[] {
  // تجميد السطح: أي محاولة تعديل بتفشل في strict mode بدل ما تعدّل
  // المحتوى بصمت. العناصر نفسها من ملفات/كاش immutable عمليًا.
  return Object.freeze([...questions]) as readonly ContentQuestion[]
}

function bundledSnapshot(id: ContentSetId): ContentSnapshot {
  const key = poolKey(id, null)
  const existing = snapshotPool.get(key)
  if (existing) return existing

  const snapshot: ContentSnapshot = {
    id,
    source: "bundled",
    version: null,
    questions: frozenQuestions(BUNDLED[id]),
  }
  snapshotPool.set(key, snapshot)
  return snapshot
}

/**
 * جلب مجموعة محتوى لجلسة جديدة.
 *
 * - لو فيه كاش محلي سليم → بنستخدمه.
 * - غير كده → بنرجع للملفات المدمجة على طول، من غير ما ننتظر الشبكة.
 *
 * بيرجّع دايمًا نتيجة صالحة (البندل موجود دايمًا)، فمفيش أي احتمال إن
 * اللعبة تتوقف بسبب المزامنة.
 */
export async function loadContentSnapshot(
  id: ContentSetId
): Promise<ContentSnapshot> {
  const cached = await readCachedSet(id)

  if (cached && cached.questions.length > 0) {
    const key = poolKey(id, cached.version)
    const existing = snapshotPool.get(key)
    if (existing) return existing

    const snapshot: ContentSnapshot = {
      id,
      source: "cache",
      version: cached.version,
      questions: frozenQuestions(cached.questions),
    }
    snapshotPool.set(key, snapshot)
    return snapshot
  }

  return bundledSnapshot(id)
}

/** نسخة البندل المتزامنة — للأماكن اللي محتاجة محتوى فورًا بدون await. */
export function getBundledSnapshot(id: ContentSetId): ContentSnapshot {
  return bundledSnapshot(id)
}

/**
 * بناء deck من snapshot. نفس آلية `createContentDeck` بالظبط
 * (Fisher-Yates + refill) — اللعبة بتاخد `questions` كـ array عادي.
 */
export function snapshotQuestions(
  snapshot: ContentSnapshot
): ContentQuestion[] {
  return [...snapshot.questions]
}
