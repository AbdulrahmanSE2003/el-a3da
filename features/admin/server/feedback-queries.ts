import "server-only"

import { connection } from "next/server"
import { requireAdmin } from "./auth"
import { getSql } from "./db"
import { isContentSetId } from "../lib/content-sets"
import type { ContentSetId } from "../lib/types"
import {
  isFeedbackStatus,
  isFeedbackType,
  type FeedbackStatus,
  type FeedbackType,
} from "@/features/feedback/lib/feedback"
import type {
  FeedbackAttachmentRow,
  FeedbackCounts,
  FeedbackPageData,
} from "../feedback/lib/types"

/**
 * قراءات رسائل اللاعبين. كل دالة بتتحقق من الجلسة بنفسها قبل أي استعلام،
 * والاستعلامات كلها بمعاملات (parameterized) عشان مفيش SQL injection.
 */

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

async function query<T>(text: string, params: unknown[] = []): Promise<T[]> {
  await requireAdmin()
  await connection()
  const rows = await getSql().query(text, params)
  return rows as T[]
}

const asNumber = (value: unknown): number => {
  const number = typeof value === "number" ? value : Number(value ?? 0)
  return Number.isFinite(number) ? number : 0
}

const asText = (value: unknown): string => (value == null ? "" : String(value))

const asNullableText = (value: unknown): string | null =>
  value == null ? null : String(value)

const asType = (value: unknown): FeedbackType =>
  isFeedbackType(value) ? value : "general"

const asStatus = (value: unknown): FeedbackStatus =>
  isFeedbackStatus(value) ? value : "open"

const asSetId = (value: unknown): ContentSetId | null => {
  const text = asNullableText(value)
  return text && isContentSetId(text) ? text : null
}

export interface FeedbackPageArgs {
  status?: FeedbackStatus | "all"
  type?: FeedbackType | "all"
  query?: string
  page?: number
  pageSize?: number
}

interface FeedbackDbRow {
  id: string
  type: string
  status: string
  priority: number | null
  message: string
  rating: number | null
  contact: string | null
  set_id: string | null
  question_external_id: string | null
  app_version: string | null
  device_info: string | null
  created_at: string
  updated_at: string
  attachment_count: string | number
}

interface FeedbackAttachmentDbRow {
  id: string
  feedback_id: string
  mime_type: string
  size_bytes: string | number
}

const mapAttachment = (
  row: FeedbackAttachmentDbRow
): FeedbackAttachmentRow => ({
  id: asText(row.id),
  mimeType: asText(row.mime_type),
  sizeBytes: asNumber(row.size_bytes),
})

export async function getFeedbackPage({
  status = "all",
  type = "all",
  query: search,
  page: requestedPage = 1,
  pageSize: requestedPageSize = 20,
}: FeedbackPageArgs): Promise<FeedbackPageData> {
  const pageSize = Math.min(
    Math.max(Math.trunc(requestedPageSize) || 20, 1),
    100
  )
  const conditions: string[] = []
  const params: unknown[] = []

  if (status !== "all") {
    params.push(status)
    conditions.push(`f.status = $${params.length}`)
  }

  if (type !== "all") {
    params.push(type)
    conditions.push(`f.type = $${params.length}`)
  }

  const term = search?.trim()
  if (term) {
    params.push(term.toLowerCase())
    const index = params.length
    conditions.push(
      `(strpos(lower(f.message), $${index}) > 0
        or strpos(lower(coalesce(f.contact, '')), $${index}) > 0
        or strpos(lower(coalesce(f.question_external_id, '')), $${index}) > 0
        or strpos(lower(coalesce(f.set_id, '')), $${index}) > 0)`
    )
  }

  const where = conditions.length > 0 ? `where ${conditions.join(" and ")}` : ""

  const [countRows, countsRows] = await Promise.all([
    query<{ total: string | number }>(
      `select count(*)::int as total from feedback f ${where}`,
      params
    ),
    query<{ status: string; count: string | number }>(
      `select status, count(*)::int as count from feedback group by status`
    ),
  ])

  const counts: FeedbackCounts = {
    total: 0,
    open: 0,
    reviewed: 0,
    done: 0,
  }
  for (const row of countsRows) {
    const count = asNumber(row.count)
    counts.total += count
    if (isFeedbackStatus(row.status)) counts[row.status] = count
  }

  const total = asNumber(countRows[0]?.total)
  const pageCount = Math.max(1, Math.ceil(total / pageSize))
  const page = Math.min(Math.max(Math.trunc(requestedPage) || 1, 1), pageCount)
  const offset = (page - 1) * pageSize

  const rows = await query<FeedbackDbRow>(
    `
      select
        f.id::text as id,
        f.type,
        f.status,
        f.priority,
        f.message,
        f.rating,
        f.contact,
        f.set_id,
        f.question_external_id,
        f.app_version,
        f.device_info,
        to_char(f.created_at at time zone 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"') as created_at,
        to_char(f.updated_at at time zone 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"') as updated_at,
        count(a.id)::int as attachment_count
      from feedback f
      left join feedback_attachments a on a.feedback_id = f.id
      ${where}
      group by f.id
      order by f.created_at desc
      limit $${params.length + 1} offset $${params.length + 2}
    `,
    [...params, pageSize, offset]
  )

  const ids = rows.map((row) => asText(row.id))
  const attachmentsByFeedback = new Map<string, FeedbackAttachmentRow[]>()

  if (ids.length > 0) {
    const attachments = await query<FeedbackAttachmentDbRow>(
      `
        select
          id::text as id,
          feedback_id::text as feedback_id,
          mime_type,
          size_bytes::bigint as size_bytes
        from feedback_attachments
        where feedback_id = any($1::uuid[])
        order by created_at asc
      `,
      [ids]
    )

    for (const attachment of attachments) {
      const list = attachmentsByFeedback.get(attachment.feedback_id) ?? []
      list.push(mapAttachment(attachment))
      attachmentsByFeedback.set(attachment.feedback_id, list)
    }
  }

  return {
    rows: rows.map((row) => {
      const id = asText(row.id)
      return {
        id,
        type: asType(row.type),
        status: asStatus(row.status),
        priority: row.priority == null ? null : asNumber(row.priority),
        message: asText(row.message),
        rating: row.rating == null ? null : asNumber(row.rating),
        contact: asNullableText(row.contact),
        setId: asSetId(row.set_id),
        questionExternalId: asNullableText(row.question_external_id),
        appVersion: asNullableText(row.app_version),
        deviceInfo: asNullableText(row.device_info),
        createdAt: asText(row.created_at),
        updatedAt: asText(row.updated_at),
        attachmentCount: asNumber(row.attachment_count),
        attachments: attachmentsByFeedback.get(id) ?? [],
      }
    }),
    total,
    page,
    pageCount,
    counts,
  }
}

export interface FeedbackAttachmentTarget {
  id: string
  storageKey: string
  mimeType: string
}

export async function getFeedbackAttachment(
  id: string
): Promise<FeedbackAttachmentTarget | null> {
  if (!UUID_PATTERN.test(id)) return null

  const rows = await query<{
    id: string
    storage_key: string
    mime_type: string
  }>(
    `
      select id::text as id, storage_key, mime_type
      from feedback_attachments
      where id = $1::uuid
    `,
    [id]
  )

  const row = rows[0]
  if (!row) return null

  return {
    id: asText(row.id),
    storageKey: asText(row.storage_key),
    mimeType: asText(row.mime_type),
  }
}
