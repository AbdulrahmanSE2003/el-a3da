import "server-only"

import { getSetMeta, isContentSetId } from "../lib/content-sets"
import {
  validateQuestionDraft,
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
