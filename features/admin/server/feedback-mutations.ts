import "server-only"

import { getSql } from "./db"
import {
  isFeedbackStatus,
  type FeedbackStatus,
} from "@/features/feedback/lib/feedback"

/**
 * كتابات حالة رسائل اللاعبين. الملف ده مابيعملش auth بنفسه: كل استدعاء
 * لازم ييجي من server action بعد `requireAdmin()`.
 */

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export interface FeedbackStatusMutationResult {
  ok: boolean
  error?: string
  status?: FeedbackStatus
}

/**
 * تغيير حالة الرسالة. الرجوع لأي حالة مسموح (مفتوحة ↔ مقروءة ↔ تم الحل).
 *
 * - `reviewed_at` و`reviewed_by` بيتسجلوا أول مرة تخرج فيها الرسالة من
 *   "مفتوحة" (يعني أول قراءة)، وبيتمسحوا لو رجّعتها "مفتوحة".
 * - لو الحالة اتغيرت فعلًا بنحدّث `updated_at`.
 */
export async function updateFeedbackStatusRecord(
  id: string,
  status: FeedbackStatus,
  reviewer: string
): Promise<FeedbackStatusMutationResult> {
  if (!UUID_PATTERN.test(id)) {
    return { ok: false, error: "معرّف الرسالة غير صالح." }
  }

  if (!isFeedbackStatus(status)) {
    return { ok: false, error: "الحالة المطلوبة غير معروفة." }
  }

  const reviewerEmail = reviewer.trim().slice(0, 200) || null

  const rows = (await getSql().query(
    `
      update feedback
         set status = $2,
             reviewed_at = case
               when $2 = 'open' then null
               else coalesce(reviewed_at, now())
             end,
             reviewed_by = case
               when $2 = 'open' then null
               else coalesce($3, reviewed_by)
             end,
             updated_at = now()
       where id = $1::uuid
         and status <> $2
      returning status
    `,
    [id, status, reviewerEmail]
  )) as Array<{ status: string }>

  // صفر صفوف معناها إن الرسالة مش موجودة، أو إنها أصلًا بنفس الحالة.
  if (rows.length === 0) {
    const existing = (await getSql().query(
      `select status from feedback where id = $1::uuid`,
      [id]
    )) as Array<{ status: string }>

    if (existing.length === 0) {
      return { ok: false, error: "الرسالة غير موجودة." }
    }

    return { ok: true, status }
  }

  return { ok: true, status }
}
