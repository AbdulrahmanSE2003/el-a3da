import type { LucideIcon } from "lucide-react"
import { CircleAlert, Info, TriangleAlert } from "lucide-react"

/* ------------------------------------------------------------------ */
/* Content sets                                                        */
/* ------------------------------------------------------------------ */

/**
 * معرّفات مجموعات المحتوى. القيم دي ثابتة في `content_sets` وفي ملفات
 * `contents/*`، ومش بتتغيّر من الداشبورد.
 */
export type ContentSetId =
  "casino" | "challenges" | "sheikh" | "topics" | "zad" | "punishments"

/**
 * وصْف ثابت للمجموعة (اسم، stamp، ملف المصدر، الحقول الاختيارية).
 * الأرقام والنسخ بتيجي من قاعدة البيانات، مش من هنا.
 */
export interface ContentSetMeta {
  id: ContentSetId
  title: string
  stamp: string
  sourceFile: string
  /** هل المجموعة مربوطة بصفحة/لعبة في التطبيق؟ */
  isUsed: boolean
  hasCorrectAnswer: boolean
  /** زاد القعدة بس — الفئة اختيارية (نص حر لكل كارت) */
  hasOptionalCategory: boolean
  hasBadgeLabel: boolean
}

/** صف مجموعة محتوى بعد دمجه مع إحصائيات `questions`. */
export interface ContentSetRow {
  id: ContentSetId
  title: string
  stamp: string
  sourceFile: string
  isUsed: boolean
  /** bigint من قاعدة البيانات — بنعرضه كنص عشان منفقدش دقة */
  version: string
  liveCount: number
  deletedCount: number
}

/* ------------------------------------------------------------------ */
/* Questions                                                           */
/* ------------------------------------------------------------------ */

/** عنصر محتوى حقيقي من جدول `questions`. */
export interface QuestionRow {
  id: string
  setId: ContentSetId
  externalId: string
  /** ترتيب المصدر من 0 — هو المرجع، مش externalId */
  position: number
  text: string
  category: string | null
  correctAnswer: string | null
  badgeLabel: string | null
  createdAt: string
  updatedAt: string
  deletedAt: string | null
}

export interface CategoryCount {
  category: string
  count: number
}

/* ------------------------------------------------------------------ */
/* Overview                                                            */
/* ------------------------------------------------------------------ */

export interface OverviewData {
  sets: ContentSetRow[]
  totalLive: number
  totalDeleted: number
  /** آخر تحديث لعنصر محتوى حي، أو null لو مفيش عناصر */
  lastContentUpdate: string | null
}

/* ------------------------------------------------------------------ */
/* Content health                                                      */
/* ------------------------------------------------------------------ */

export type FindingSeverity = "critical" | "warning" | "info"

export interface HealthFinding {
  id: string
  severity: FindingSeverity
  title: string
  description: string
  setId?: ContentSetId
  count?: number
}

export interface HealthSetRow extends ContentSetRow {
  missingCategory: number
  missingCorrectAnswer: number
  missingBadgeLabel: number
  emptyText: number
  duplicatePositions: number
  /** فراغات في تسلسل position داخل العناصر الحية */
  positionGaps: number
  duplicateTextGroups: number
  duplicateTextRecords: number
}

export interface HealthReport {
  sets: HealthSetRow[]
  findings: HealthFinding[]
  severityCounts: Record<FindingSeverity, number>
  totals: {
    live: number
    deleted: number
    duplicateTextGroups: number
    duplicateTextRecords: number
  }
}

/* ------------------------------------------------------------------ */
/* Label maps & helpers                                                */
/* ------------------------------------------------------------------ */

export const SEVERITY_LABELS: Record<FindingSeverity, string> = {
  critical: "حرج",
  warning: "تحذير",
  info: "معلومة",
}

export const SEVERITY_CLASS: Record<FindingSeverity, string> = {
  critical: "border-danger-brand/40 bg-danger-brand/10 text-danger-brand",
  warning: "border-copper/40 bg-copper/10 text-copper",
  info: "border-ink/20 bg-ink/5 text-ink-soft",
}

export const SEVERITY_ICON: Record<FindingSeverity, LucideIcon> = {
  critical: TriangleAlert,
  warning: CircleAlert,
  info: Info,
}
