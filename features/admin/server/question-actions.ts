"use server"

import { revalidatePath } from "next/cache"
import { AdminAuthenticationError, requireAdmin } from "./auth"
import {
  createQuestionRecord,
  getQuestionSetContext,
  insertQuestionRecords,
  softDeleteQuestionRecord,
  updateQuestionRecord,
} from "./question-mutations"
import { getSetMeta, isContentSetId } from "../lib/content-sets"
import {
  validateBulkPayload,
  type QuestionBulkResult,
} from "../lib/question-bulk"
import type { ContentSetId } from "../lib/types"
import type {
  QuestionDraft,
  QuestionMutationResult,
} from "../lib/question-form"

const AUTH_ERROR: QuestionMutationResult = {
  ok: false,
  error: "انتهت الجلسة، وسجّل دخولك من جديد.",
}

const GENERIC_ERROR: QuestionMutationResult = {
  ok: false,
  error: "مقدرناش ننفّذ العملية. جرّب تاني.",
}

const GENERIC_CREATE_ERROR: QuestionMutationResult = {
  ok: false,
  error: "مقدرناش نضيف السؤال. جرّب تاني.",
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

function parseDraft(value: Record<string, unknown>): QuestionDraft {
  return {
    text: asString(value.text),
    category: asString(value.category),
    correctAnswer: asString(value.correctAnswer),
    badgeLabel: asString(value.badgeLabel),
  }
}

function parseUpdateInput(
  input: unknown
): { id: string; draft: QuestionDraft } | null {
  if (!input || typeof input !== "object") return null

  const value = input as Record<string, unknown>
  if (typeof value.id !== "string") return null

  return { id: value.id, draft: parseDraft(value) }
}

function parseDeleteInput(input: unknown): { id: string } | null {
  if (!input || typeof input !== "object") return null

  const value = input as Record<string, unknown>
  if (typeof value.id !== "string") return null

  return { id: value.id }
}

function parseCreateInput(
  input: unknown
): { setId: ContentSetId; draft: QuestionDraft } | null {
  if (!input || typeof input !== "object") return null

  const value = input as Record<string, unknown>
  const setId = value.setId
  if (typeof setId !== "string" || !isContentSetId(setId)) return null

  // الـ externalId بيتولد على السيرفر، فمش بنستقبله من العميل خالص.
  return { setId, draft: parseDraft(value) }
}

function parseBulkInput(
  input: unknown
): { setId: ContentSetId; json: string } | null {
  if (!input || typeof input !== "object") return null

  const value = input as Record<string, unknown>
  const setId = value.setId
  if (typeof setId !== "string" || !isContentSetId(setId)) return null
  if (typeof value.json !== "string") return null

  return { setId, json: value.json }
}

/** إضافة سؤال جديد للمجموعة المختارة. */
export async function createQuestionAction(
  input: unknown
): Promise<QuestionMutationResult> {
  const authError = await authorize()
  if (authError) return authError

  const parsed = parseCreateInput(input)
  if (!parsed) return { ok: false, error: "طلب غير صالح." }

  try {
    const result = await createQuestionRecord(parsed.setId, parsed.draft)
    if (result.ok) revalidateAdminContent()
    if (!result.ok && result.fieldErrors) {
      return {
        ok: false,
        error: result.error ?? GENERIC_CREATE_ERROR.error,
        fieldErrors: result.fieldErrors,
      }
    }
    return result
  } catch (error) {
    console.error("[admin/questions] create failed", error)
    return GENERIC_CREATE_ERROR
  }
}

/**
 * إضافة دفعة أسئلة من JSON. الـaction بيعمل parsing وتحقق كامل تاني على
 * السيرفر، حتى لو الكلاينت عمل preview. أي خطأ في أي صف بيرفض الدفعة كلها
 * قبل ما نوصل للإدخال.
 */
export async function createQuestionsBulkAction(
  input: unknown
): Promise<QuestionBulkResult> {
  const authError = await authorize()
  if (authError) return authError

  const parsed = parseBulkInput(input)
  if (!parsed) return { ok: false, error: "طلب غير صالح." }

  try {
    const context = await getQuestionSetContext(parsed.setId)
    if (!context) {
      return {
        ok: false,
        error: "المجموعة مش موجودة. ضيفها الأول.",
      }
    }

    const setMeta = getSetMeta(parsed.setId, context.name)
    const validation = validateBulkPayload(
      parsed.json,
      setMeta,
      context.categories
    )

    if (!validation.ok) {
      return {
        ok: false,
        error:
          validation.rootError ?? "الدفعة فيها أخطاء. راجع الصفوف وجرّب تاني.",
        rowErrors: validation.errors,
        warnings: validation.warnings,
      }
    }

    const inserted = await insertQuestionRecords(parsed.setId, validation.rows)
    if (!inserted.ok) {
      return {
        ok: false,
        error: inserted.error,
        warnings: validation.warnings,
      }
    }

    revalidateAdminContent()
    return {
      ok: true,
      count: inserted.created.length,
      externalIds: inserted.created.map((question) => question.externalId),
      warnings: validation.warnings,
    }
  } catch (error) {
    console.error("[admin/questions] bulk create failed", error)
    return {
      ok: false,
      error: "مقدرناش نضيف الأسئلة. جرّب تاني.",
    }
  }
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
