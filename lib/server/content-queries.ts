import "server-only"

import { getSql } from "@/lib/server/db"
import {
  isContentSetId,
  parseContentSetResponse,
  type ContentSetId,
  type ContentSetResponse,
  type ContentQuestion,
  type ContentVersionsResponse,
} from "@/lib/content/types"

/**
 * قراءات المحتوى العام من Neon. الملف server-only، وبيعيد استخدام نفس
 * عميل قاعدة البيانات المشترك، من غير أي عمليات كتابة.
 *
 * مفيش أي بيانات أدمن هنا: بنختار الأعمدة اللي اللعبة محتاجاها بس
 * (`external_id`, `position`, `text`, `category`, `correct_answer`,
 * `badge_label`) ونرمي `uuid` و`deleted_at` و`created_at` بره.
 */

interface VersionRow {
  id: string
  version: string | number
}

interface QuestionRow {
  external_id: string
  position: string | number
  text: string
  category: string | null
  correct_answer: string | null
  badge_label: string | null
}

const asText = (value: unknown): string =>
  typeof value === "string" ? value : String(value ?? "")

/**
 * نسخ كل مجموعات المحتوى المسجّلة في Neon. مفيش أي محتوى بيتحمّل هنا —
 * استعلام واحد صغير بس على `content_sets`. أي مجموعة عادية جديدة بتظهر
 * تلقائيًا من غير قائمة ثابتة في الكود.
 */
export async function getContentVersions(): Promise<ContentVersionsResponse> {
  const rows = (await getSql().query(
    `
      select id, version
      from content_sets
      order by id asc
    `
  )) as VersionRow[]

  const sets = rows
    .filter((row) => isContentSetId(row.id))
    .map((row) => ({
      id: row.id as ContentSetId,
      // bigint بييجي من العميل ممكن يكون نص أو رقم — بنوحّده كنص
      version: asText(row.version),
    }))

  return { sets }
}

/**
 * محتوى مجموعة واحدة مرتّب بـ `position`، من غير الصفوف المحذوفة soft
 * delete. بترجّع `null` لو المجموعة مش موجودة أو المعرّف غير معروف.
 */
export async function getContentSet(
  id: ContentSetId
): Promise<ContentSetResponse | null> {
  if (!isContentSetId(id)) return null

  const sql = getSql()

  const setRows = (await sql.query(
    `
      select id, version
      from content_sets
      where id = $1
    `,
    [id]
  )) as VersionRow[]

  if (setRows.length === 0) return null

  const questionRows = (await sql.query(
    `
      select
        external_id,
        position,
        text,
        category,
        correct_answer,
        badge_label
      from questions
      where set_id = $1
        and deleted_at is null
      order by position asc
    `,
    [id]
  )) as QuestionRow[]

  const questions: ContentQuestion[] = questionRows.map((row) => {
    const question: ContentQuestion = {
      // المعرّف المستقر هو external_id، مش الـ uuid الداخلي.
      id: asText(row.external_id),
      text: row.text,
    }

    if (row.category != null) question.category = row.category
    if (row.correct_answer != null) question.correct_answer = row.correct_answer
    if (row.badge_label != null) question.badgeLabel = row.badge_label

    return question
  })

  // بنمرّر الرد على نفس الـ parser اللي الكلاينت بيستخدمه، عشان اللي
  // بيتكتب في الكاش هو نفس اللي اتفحص بالظبط.
  return parseContentSetResponse({
    id,
    version: asText(setRows[0].version),
    questions,
  })
}
