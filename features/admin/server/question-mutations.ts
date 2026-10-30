import "server-only"

import { getSetMeta, isContentSetId } from "../lib/content-sets"
import { getCategoryValues } from "../lib/question-categories"
import type { ContentSetId } from "../lib/types"
import {
  validateQuestionDraft,
  type NormalizedQuestionDraft,
  type QuestionDraft,
  type QuestionMutationResult,
} from "../lib/question-form"
import { getSql } from "./db"

/**
 * كتابات الأسئلة نفسها. الملف ده مابيعملش auth بنفسه: كل استدعاء لازم
 * ييجي من server action بعد `requireAdmin()`. الفصل ده بيخلي قواعد الـ SQL
 * والتحقق في مكان واحد بدل ما يتكرروا في الـ action.
 */

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

const isQuestionId = (value: string) => UUID_PATTERN.test(value)

export async function updateQuestionRecord(
  id: string,
  draft: QuestionDraft
): Promise<QuestionMutationResult> {
  if (!isQuestionId(id)) {
    return { ok: false, error: "معرف السؤال غير صحيح." }
  }

  const rows = (await getSql().query(
    `
      select q.set_id, cs.name
      from questions q
      join content_sets cs on cs.id = q.set_id
      where q.id = $1
        and q.deleted_at is null
    `,
    [id]
  )) as Array<{ set_id: string; name: string }>

  const row = rows[0]
  if (!row) {
    return { ok: false, error: "السؤال مش موجود أو تم حذفه من قبل." }
  }

  if (!isContentSetId(row.set_id)) {
    return { ok: false, error: "المجموعة غير معروفة." }
  }

  const setMeta = getSetMeta(row.set_id, row.name)
  const validation = validateQuestionDraft(draft, setMeta)
  if (!validation.ok) {
    return {
      ok: false,
      error: "راجع الحقول المعلّمة وجرّب تاني.",
      fieldErrors: validation.fieldErrors,
    }
  }

  const updated = (await getSql().query(
    `
      update questions
         set text = $2,
             category = $3,
             correct_answer = $4,
             badge_label = $5
       where id = $1
         and deleted_at is null
      returning id
    `,
    [
      id,
      validation.value.text,
      validation.value.category,
      validation.value.correctAnswer,
      validation.value.badgeLabel,
    ]
  )) as Array<{ id: string }>

  if (updated.length === 0) {
    return { ok: false, error: "السؤال مش موجود أو تم حذفه من قبل." }
  }

  return { ok: true }
}

export async function softDeleteQuestionRecord(
  id: string
): Promise<QuestionMutationResult> {
  if (!isQuestionId(id)) {
    return { ok: false, error: "معرف السؤال غير صحيح." }
  }

  const deleted = (await getSql().query(
    `
      update questions
         set deleted_at = now()
       where id = $1
         and deleted_at is null
      returning id
    `,
    [id]
  )) as Array<{ id: string }>

  if (deleted.length === 0) {
    return { ok: false, error: "السؤال مش موجود أو تم حذفه من قبل." }
  }

  return { ok: true }
}

export interface QuestionSetContext {
  name: string
  /** الفئات الحية الموجودة فعلاً في الداتابيز لهذه المجموعة. */
  categories: string[]
}

export interface CreatedQuestionRecord {
  id: string
  externalId: string
  position: number
}

export type QuestionInsertResult =
  { ok: true; created: CreatedQuestionRecord[] } | { ok: false; error: string }

/**
 * يقرأ اسم المجموعة وفئاتها الحية. مابيعملش auth بنفسه؛ بيتنادى بعد
 * `requireAdmin()` من الـ action، أو من داخل mutation بعد ما الـ action
 * تحقق بالفعل.
 */
export async function getQuestionSetContext(
  setId: ContentSetId
): Promise<QuestionSetContext | null> {
  if (!isContentSetId(setId)) return null

  const sql = getSql()
  const setRows = (await sql.query(
    `select name from content_sets where id = $1`,
    [setId]
  )) as Array<{ name: string }>

  if (!setRows[0]) return null

  const categoryRows = (await sql.query(
    `
      select distinct category
      from questions
      where set_id = $1
        and deleted_at is null
        and category is not null
        and btrim(category) <> ''
      order by category asc
    `,
    [setId]
  )) as Array<{ category: string }>

  return {
    name: setRows[0].name,
    categories: categoryRows.map((row) => row.category),
  }
}

/**
 * الإدخال الفعلي للسؤال أو للدفعة، في معاملة واحدة.
 *
 * - بنقفل صف `content_sets` الأول بـ`for update`، فأي كتابة تانية بتتبع نفس
 *   البروتوكول (الفردي، bulk، reconciliation) بتستنى بدل ما تحسب نفس
 *   position/external_id في نفس اللحظة.
 * - `position` = أعلى position موجود + 1، وبيتزاد لكل صف بالترتيب.
 * - `external_id` مستقل تمامًا عن position: أعلى external_id رقمي + 1.
 *   القيم غير الرقمية (زي `1-2`) بتتخطى صراحةً. بنستخدم `numeric` بدل
 *   `bigint` عشان التحويل ما يعملش overflow حتى لو الأرقام طويلة.
 * - مفيش `on conflict do nothing`: أي تصادم uniqueness بيفشل المعاملة كلها
 *   ويرجع rollback كامل.
 */
export async function insertQuestionRecords(
  setId: ContentSetId,
  drafts: readonly NormalizedQuestionDraft[]
): Promise<QuestionInsertResult> {
  if (!isContentSetId(setId)) {
    return { ok: false, error: "المجموعة غير صالحة." }
  }

  if (drafts.length === 0) {
    return { ok: false, error: "مفيش أسئلة في الدفعة، أضفي بعضها الأول." }
  }

  const sql = getSql()
  const texts = drafts.map((draft) => draft.text)
  const categories = drafts.map((draft) => draft.category)
  const correctAnswers = drafts.map((draft) => draft.correctAnswer)
  const badgeLabels = drafts.map((draft) => draft.badgeLabel)

  const results = await sql.transaction((txn) => [
    txn.query(`select id from content_sets where id = $1 for update`, [setId]),
    txn.query(
      `
        with base as (
          select
            coalesce(max(position), -1) as max_position,
            coalesce(
              max(
                case
                  when external_id ~ '^[0-9]+$' then external_id::numeric
                end
              ),
              -1
            ) as max_external
          from questions
          where set_id = $1
        )
        insert into questions (
          set_id, external_id, position, text, category, correct_answer, badge_label
        )
        select
          $1,
          (base.max_external + input.ord)::text,
          (base.max_position + input.ord)::int,
          input.text,
          input.category,
          input.correct_answer,
          input.badge_label
        from base
        cross join unnest($2::text[], $3::text[], $4::text[], $5::text[])
          with ordinality as input(text, category, correct_answer, badge_label, ord)
        returning id, external_id, position
      `,
      [setId, texts, categories, correctAnswers, badgeLabels]
    ),
  ])

  const inserted = results[1] as Array<{
    id: string
    external_id: string
    position: string | number
  }>

  if (inserted.length !== drafts.length) {
    return { ok: false, error: "مقدرناش نضيف كل الأسئلة. جرّب تاني." }
  }

  return {
    ok: true,
    created: inserted.map((row) => ({
      id: row.id,
      externalId: row.external_id,
      position: Number(row.position),
    })),
  }
}

/**
 * إضافة سؤال واحد. بتستخدم نفس allocator والـlock بتاع الـbulk عشان
 * الإضافتين ما يتعارضوش لو حصلوا في نفس اللحظة.
 */
export async function createQuestionRecord(
  setId: ContentSetId,
  draft: QuestionDraft
): Promise<QuestionMutationResult> {
  if (!isContentSetId(setId)) {
    return { ok: false, error: "المجموعة غير صالحة." }
  }

  const context = await getQuestionSetContext(setId)
  if (!context) {
    return {
      ok: false,
      error: "المجموعة مش موجودة. ضيفها الأول.",
    }
  }

  const setMeta = getSetMeta(setId, context.name)
  const validation = validateQuestionDraft(draft, setMeta)
  if (!validation.ok) {
    return {
      ok: false,
      error: "راجع الحقول المعلّمة وجرّب تاني.",
      fieldErrors: validation.fieldErrors,
    }
  }

  const categoryOptions = getCategoryValues(setMeta, context.categories)
  const category = validation.value.category
  if (category && !categoryOptions.includes(category)) {
    return {
      ok: false,
      error: "راجع الحقول المعلّمة وجرّب تاني.",
      fieldErrors: {
        category: `اختار فئة من دول: ${categoryOptions.join("، ")}`,
      },
    }
  }

  const inserted = await insertQuestionRecords(setId, [validation.value])
  if (!inserted.ok) {
    return { ok: false, error: inserted.error }
  }

  return { ok: true }
}
