import "server-only"

import { getSetMeta, isContentSetId } from "../lib/content-sets"
import type { ContentSetId } from "../lib/types"
import {
  validateQuestionCreateDraft,
  validateQuestionDraft,
  type QuestionCreateDraft,
  type QuestionCreateMutationResult,
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

/** خطأ قيد unique في Postgres (23505) — بنستخدمه لرسالة معرّف مكرر. */
function isUniqueViolation(error: unknown, constraint: string): boolean {
  const value = error as {
    code?: string
    constraint?: string
    cause?: { code?: string; constraint?: string }
  }
  const code = value?.code ?? value?.cause?.code
  const name = value?.constraint ?? value?.cause?.constraint
  return code === "23505" && name === constraint
}

export async function updateQuestionRecord(
  id: string,
  draft: QuestionDraft
): Promise<QuestionMutationResult> {
  if (!isQuestionId(id)) {
    return { ok: false, error: "معرّف السؤال غير صالح." }
  }

  const rows = (await getSql().query(
    `
      select set_id
      from questions
      where id = $1
        and deleted_at is null
    `,
    [id]
  )) as Array<{ set_id: string }>

  const row = rows[0]
  if (!row) {
    return { ok: false, error: "السؤال غير موجود أو تم حذفه بالفعل." }
  }

  if (!isContentSetId(row.set_id)) {
    return { ok: false, error: "مجموعة السؤال غير معروفة." }
  }

  const setMeta = getSetMeta(row.set_id)
  const validation = validateQuestionDraft(draft, setMeta)
  if (!validation.ok) {
    return {
      ok: false,
      error: "راجع الحقول المعلّمة وحاول تاني.",
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
    return { ok: false, error: "السؤال غير موجود أو تم حذفه بالفعل." }
  }

  return { ok: true }
}

export async function softDeleteQuestionRecord(
  id: string
): Promise<QuestionMutationResult> {
  if (!isQuestionId(id)) {
    return { ok: false, error: "معرّف السؤال غير صالح." }
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
    return { ok: false, error: "السؤال غير موجود أو تم حذفه بالفعل." }
  }

  return { ok: true }
}

/**
 * إضافة سؤال جديد.
 *
 * الخصائص المهمة:
 * - `external_id` بيتولد تلقائياً على السيرفر من أعلى position + 1 عشان
 *   المستخدم ميقدرش يكتب معرّف يدويًا ويضاربه مع حد تاني.
 * - بنرفض أي external_id مستخدم بالفعل حتى لو السؤال القديم متحذوف ناعمًا،
 *   لأن قيد unique مش بيستثني deleted_at.
 * - الترتيب الجديد بيبقى أكبر position مستخدم في المجموعة (حتى المحذوف
 *   ناعمًا) عشان قيد unique على (set_id, position) ميخالفش.
 * - كل ده في معاملة واحدة مع الـ trigger اللي بيزود نسخة المحتوى.
 */
export async function createQuestionRecord(
  setId: ContentSetId,
  draft: QuestionCreateDraft
): Promise<QuestionCreateMutationResult> {
  const setMeta = getSetMeta(setId)
  const validation = validateQuestionCreateDraft(draft, setMeta)
  if (!validation.ok) {
    return {
      ok: false,
      error: "راجع الحقول المعلّمة وحاول تاني.",
      fieldErrors: validation.fieldErrors,
    }
  }

  const sql = getSql()

  try {
    const created = (await sql.query(
      `
        with next_position as (
          select coalesce(max(position), -1) + 1 as position
          from questions
          where set_id = $1
        )
        insert into questions (
          set_id, external_id, position, text, category, correct_answer, badge_label
        )
        select $1, (next_position.position)::text, next_position.position, $2, $3, $4, $5
        from next_position
        returning id
      `,
      [
        setId,
        validation.value.text,
        validation.value.category,
        validation.value.correctAnswer,
        validation.value.badgeLabel,
      ]
    )) as Array<{ id: string }>

    if (created.length === 0) {
      return { ok: false, error: "تعذر إضافة السؤال. حاول تاني." }
    }
  } catch (error) {
    if (isUniqueViolation(error, "questions_set_external_id_key")) {
      return {
        ok: false,
        error: "راجع الحقول المعلّمة وحاول تاني.",
        fieldErrors: {
          externalId: "المعرّف ده مستخدم بالفعل في المجموعة.",
        },
      }
    }
    throw error
  }

  return { ok: true }
}
