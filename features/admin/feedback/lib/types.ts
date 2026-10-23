import type { ContentSetId } from "@/features/admin/lib/types"
import type {
  FeedbackPriority,
  FeedbackStatus,
  FeedbackType,
} from "@/features/feedback/lib/feedback"

/* ------------------------------------------------------------------ */
/* Player feedback (admin read model)                                  */
/* ------------------------------------------------------------------ */

export interface FeedbackAttachmentRow {
  id: string
  mimeType: string
  sizeBytes: number
}

export interface FeedbackRow {
  id: string
  type: FeedbackType
  status: FeedbackStatus
  priority: FeedbackPriority
  message: string
  rating: number | null
  contact: string | null
  setId: ContentSetId | null
  questionExternalId: string | null
  appVersion: string | null
  deviceInfo: string | null
  createdAt: string
  updatedAt: string
  reviewedAt: string | null
  reviewedBy: string | null
  attachmentCount: number
  attachments: FeedbackAttachmentRow[]
}

export interface FeedbackCounts {
  total: number
  open: number
  reviewed: number
  done: number
}

export interface FeedbackPageData {
  rows: FeedbackRow[]
  total: number
  page: number
  pageCount: number
  counts: FeedbackCounts
}
