import "server-only"

import { getSql } from "@/lib/server/db"
import type { FeedbackDraft } from "../lib/feedback"
import type { FeedbackUploadFile } from "./upload-token"

export interface InsertFeedbackInput {
  id: string
  draft: FeedbackDraft
  files: FeedbackUploadFile[]
}

/**
 * كتابة الملاحظة والمرفقات في Neon في معاملة واحدة.
 *
 * `on conflict do nothing` بتخلي إعادة المحاولة بعد نجاح الطلب idempotent،
 * من غير ما نكرر نفس الملاحظة أو نفس المرفق.
 */
export async function insertFeedback({
  id,
  draft,
  files,
}: InsertFeedbackInput): Promise<void> {
  const sql = getSql()

  await sql.transaction((txn) => [
    txn.query(
      `
        insert into feedback (
          id, type, message, rating, contact, set_id, question_external_id, device_info
        )
        values ($1::uuid, $2, $3, $4, $5, $6, $7, $8)
        on conflict (id) do nothing
      `,
      [
        id,
        draft.type,
        draft.message,
        draft.rating,
        draft.contact || null,
        draft.setId,
        draft.questionExternalId || null,
        draft.deviceInfo || null,
      ]
    ),
    ...files.map((file) =>
      txn.query(
        `
          insert into feedback_attachments (
            feedback_id, storage_key, mime_type, size_bytes
          )
          values ($1::uuid, $2, $3, $4)
          on conflict (storage_key) do nothing
        `,
        [id, file.key, file.contentType, file.size]
      )
    ),
  ])
}
