"use server"

import { revalidatePath } from "next/cache"
import { AdminAuthenticationError, requireAdmin } from "./auth"
import { updateFeedbackStatusRecord } from "./feedback-mutations"
import {
  isFeedbackStatus,
  type FeedbackStatus,
} from "@/features/feedback/lib/feedback"

export interface FeedbackStatusActionResult {
  ok: boolean
  error?: string
  status?: FeedbackStatus
}

const AUTH_ERROR: FeedbackStatusActionResult = {
  ok: false,
  error: "انتهت الجلسة. سجّل الدخول من جديد.",
}

const GENERIC_ERROR: FeedbackStatusActionResult = {
  ok: false,
  error: "تعذر تحديث الحالة. حاول تاني.",
}

function parseInput(
  input: unknown
): { id: string; status: FeedbackStatus } | null {
  if (!input || typeof input !== "object") return null

  const value = input as Record<string, unknown>
  if (typeof value.id !== "string") return null
  if (!isFeedbackStatus(value.status)) return null

  return { id: value.id, status: value.status }
}

function revalidateFeedback() {
  revalidatePath("/admin/feedback")
  revalidatePath("/admin")
}

/** تغيير حالة رسالة: مفتوحة / مقروءة / تم الحل. الرجوع مسموح. */
export async function updateFeedbackStatusAction(
  input: unknown
): Promise<FeedbackStatusActionResult> {
  let reviewer = ""
  try {
    const session = await requireAdmin()
    reviewer = session.sub
  } catch (error) {
    if (error instanceof AdminAuthenticationError) return AUTH_ERROR
    throw error
  }

  const parsed = parseInput(input)
  if (!parsed) return { ok: false, error: "طلب غير صالح." }

  try {
    const result = await updateFeedbackStatusRecord(
      parsed.id,
      parsed.status,
      reviewer
    )
    if (result.ok) revalidateFeedback()
    return result
  } catch (error) {
    console.error("[admin/feedback] status update failed", error)
    return GENERIC_ERROR
  }
}
