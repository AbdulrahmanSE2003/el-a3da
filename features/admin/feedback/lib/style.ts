import type {
  FeedbackPriority,
  FeedbackStatus,
  FeedbackType,
} from "@/features/feedback/lib/feedback"

/** ألوان ثابتة لكل نوع ملاحظة — نفس نمط العلامات في الداشبورد. */
export const FEEDBACK_TYPE_CLASS: Record<FeedbackType, string> = {
  general: "border-ink/20 bg-ink/5 text-ink-soft",
  bug: "border-danger-brand/40 bg-danger-brand/10 text-danger-brand",
  suggestion: "border-sky-600/40 bg-sky-600/10 text-sky-700",
  question_issue: "border-copper/40 bg-copper/10 text-copper",
}

/** ألوان الحالة (مفتوحة / مقروءة / تم الحل). */
export const FEEDBACK_STATUS_CLASS: Record<FeedbackStatus, string> = {
  open: "border-copper/40 bg-copper/10 text-copper",
  reviewed: "border-sky-600/40 bg-sky-600/10 text-sky-700",
  done: "border-emerald-600/40 bg-emerald-600/10 text-emerald-700",
}

/** ألوان الأولوية (عادية / متوسطة / عالية). */
export const FEEDBACK_PRIORITY_CLASS: Record<FeedbackPriority, string> = {
  low: "border-ink/20 bg-ink/5 text-ink-soft",
  medium: "border-amber-600/40 bg-amber-600/10 text-amber-700",
  high: "border-danger-brand/40 bg-danger-brand/10 text-danger-brand",
}
