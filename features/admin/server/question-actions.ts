"use server"

import { revalidatePath } from "next/cache"
import { AdminAuthenticationError, requireAdmin } from "./auth"
import {
  softDeleteQuestionRecord,
  updateQuestionRecord,
} from "./question-mutations"
import type {
  QuestionDraft,
  QuestionMutationResult,
} from "../lib/question-form"

const AUTH_ERROR: QuestionMutationResult = {
  ok: false,
  error: "انتهت الجلسة. سجّل الدخول من جديد.",
}

const GENERIC_ERROR: QuestionMutationResult = {
  ok: false,
  error: "تعذر تنفيذ العملية. حاول تاني.",
}

function revalidateAdminContent() {
  revalidatePath("/admin/questions")
  revalidatePath("/admin")
  revalidatePath("/admin/health")
}

async function authorize(): Promise<QuestionMutationResult | null> {
  try {
    await requireAdmin()
    return null
  } catch (error) {
    if (error instanceof AdminAuthenticationError) return AUTH_ERROR
    throw error
  }
}

function asString(value: unknown): string {
  return typeof value === "string" ? value : ""
}

function parseUpdateInput(
  input: unknown
): { id: string; draft: QuestionDraft } | null {
  if (!input || typeof input !== "object") return null

  const value = input as Record<string, unknown>
  if (typeof value.id !== "string") return null

  return {
    id: value.id,
    draft: {
      text: asString(value.text),
      category: asString(value.category),
      correctAnswer: asString(value.correctAnswer),
      badgeLabel: asString(value.badgeLabel),
    },
  }
}

function parseDeleteInput(input: unknown): { id: string } | null {
  if (!input || typeof input !== "object") return null

  const value = input as Record<string, unknown>
  if (typeof value.id !== "string") return null

  return { id: value.id }
}

/** تعديل حقول السؤال المسموحة فقط؛ external_id وposition مش قابلين للتعديل. */
export async function updateQuestionAction(
  input: unknown
): Promise<QuestionMutationResult> {
  const authError = await authorize()
  if (authError) return authError

  const parsed = parseUpdateInput(input)
  if (!parsed) return { ok: false, error: "طلب غير صالح." }

  try {
    const result = await updateQuestionRecord(parsed.id, parsed.draft)
    if (result.ok) revalidateAdminContent()
    return result
  } catch (error) {
    console.error("[admin/questions] update failed", error)
    return GENERIC_ERROR
  }
}

/** حذف ناعم فقط: السجل بيفضل في قاعدة البيانات مع deleted_at. */
export async function deleteQuestionAction(
  input: unknown
): Promise<QuestionMutationResult> {
  const authError = await authorize()
  if (authError) return authError

  const parsed = parseDeleteInput(input)
  if (!parsed) return { ok: false, error: "طلب غير صالح." }

  try {
    const result = await softDeleteQuestionRecord(parsed.id)
    if (result.ok) revalidateAdminContent()
    return result
  } catch (error) {
    console.error("[admin/questions] delete failed", error)
    return GENERIC_ERROR
  }
}
