#!/usr/bin/env tsx
/**
 * test-question-bulk — pure tests for the admin bulk-add parser/validator.
 *
 * Nothing here touches Neon, the network, or the filesystem. The database
 * allocation/concurrency coverage lives in `test-question-bulk-db.ts` and is
 * opt-in through a dedicated test database URL.
 *
 * Usage:
 *   pnpm test:bulk
 */

import {
  BULK_MAX_PAYLOAD_BYTES,
  BULK_MAX_QUESTIONS,
  buildBulkTemplate,
  getBulkPayloadBytes,
  parseBulkJson,
  validateBulkPayload,
} from "@/features/admin/lib/question-bulk"
import { getSetMeta } from "@/features/admin/lib/content-sets"
import {
  getCategoryLabel,
  getCategoryValues,
} from "@/features/admin/lib/question-categories"

let passed = 0
let failed = 0

function check(label: string, ok: boolean, detail = "") {
  if (ok) {
    passed++
    console.log(`  ✓ ${label}`)
  } else {
    failed++
    console.log(`  ✗ ${label}${detail ? ` — ${detail}` : ""}`)
  }
}

function equal<T>(label: string, actual: T, expected: T) {
  const a = JSON.stringify(actual)
  const e = JSON.stringify(expected)
  check(label, a === e, a === e ? "" : `expected ${e}, got ${a}`)
}

const casinoMeta = getSetMeta("casino")
const bombMeta = getSetMeta("bomb")
const zadMeta = getSetMeta("zad")
const topicsMeta = getSetMeta("topics")

const dbCategories = ["ثقافة", "رياضة"]

const validCasinoRow = {
  text: "سؤال صحيح؟",
  category: "ثقافة",
  correctAnswer: "الإجابة",
}

function payload(rows: unknown[]): string {
  return JSON.stringify(rows)
}

function hasError(
  result: ReturnType<typeof validateBulkPayload>,
  row: number,
  field: string
): boolean {
  return result.errors.some(
    (error) => error.row === row && error.field === field
  )
}

/* ------------------------------------------------------------------ */
/* Parsing and root structure                                         */
/* ------------------------------------------------------------------ */

{
  const result = validateBulkPayload("{", casinoMeta, dbCategories)
  check("malformed JSON is rejected", !result.ok && Boolean(result.rootError))
}

{
  const result = validateBulkPayload(
    JSON.stringify({ text: "x" }),
    casinoMeta,
    dbCategories
  )
  check(
    "non-array root is rejected",
    !result.ok && result.rootError?.includes("قائمة") === true
  )
}

{
  const result = validateBulkPayload("[]", casinoMeta, dbCategories)
  check("empty array is rejected", !result.ok && Boolean(result.rootError))
}

{
  const result = validateBulkPayload(
    payload(
      Array.from({ length: BULK_MAX_QUESTIONS + 1 }, (_, index) => ({
        ...validCasinoRow,
        text: `سؤال ${index}`,
      }))
    ),
    casinoMeta,
    dbCategories
  )
  check(
    "more than the question limit is rejected",
    !result.ok &&
      result.rootError?.includes(String(BULK_MAX_QUESTIONS)) === true
  )
}

{
  const result = validateBulkPayload(
    "x".repeat(BULK_MAX_PAYLOAD_BYTES + 1),
    casinoMeta,
    dbCategories
  )
  check(
    "payload over the byte limit is rejected",
    !result.ok && result.rootError?.includes("كيلوبايت") === true
  )
  check(
    "payload size is measured in UTF-8 bytes",
    getBulkPayloadBytes("س") === 2
  )
}

{
  const parsed = parseBulkJson(payload([validCasinoRow]))
  check("valid JSON parses to the root value", parsed.ok)
}

/* ------------------------------------------------------------------ */
/* Allowed fields, required fields, and optional fields               */
/* ------------------------------------------------------------------ */

{
  const result = validateBulkPayload(
    payload([{ category: "ثقافة", correctAnswer: "ج" }]),
    casinoMeta,
    dbCategories
  )
  check("missing text is rejected", hasError(result, 1, "text"))
}

{
  const result = validateBulkPayload(
    payload([{ ...validCasinoRow, extra: "no" }]),
    casinoMeta,
    dbCategories
  )
  check("unknown field is rejected", hasError(result, 1, "extra"))
}

{
  const idResult = validateBulkPayload(
    payload([{ ...validCasinoRow, id: "server-owned" }]),
    casinoMeta,
    dbCategories
  )
  check("client id is rejected", hasError(idResult, 1, "id"))

  const positionResult = validateBulkPayload(
    payload([{ ...validCasinoRow, position: 0 }]),
    casinoMeta,
    dbCategories
  )
  check("client position is rejected", hasError(positionResult, 1, "position"))
}

{
  const result = validateBulkPayload(
    payload([{ text: "سؤال", category: "ثقافة" }]),
    casinoMeta,
    dbCategories
  )
  check("casino requires correctAnswer", hasError(result, 1, "correctAnswer"))
}

{
  const result = validateBulkPayload(
    payload([{ ...validCasinoRow, badgeLabel: "شارة" }]),
    casinoMeta,
    dbCategories
  )
  check(
    "badgeLabel is rejected for a set that does not support it",
    hasError(result, 1, "badgeLabel")
  )
}

{
  const result = validateBulkPayload(
    payload([{ text: "سؤال", category: "ثقافة", correctAnswer: 5 }]),
    casinoMeta,
    dbCategories
  )
  check(
    "non-string optional field is rejected",
    hasError(result, 1, "correctAnswer")
  )
}

{
  const result = validateBulkPayload(
    payload([
      {
        text: "سؤال زاد",
        category: null,
        badgeLabel: null,
      },
    ]),
    zadMeta,
    dbCategories
  )
  check(
    "zad accepts null category and badgeLabel",
    result.ok &&
      result.rows[0]?.category === null &&
      result.rows[0]?.badgeLabel === null
  )
}

/* ------------------------------------------------------------------ */
/* Categories                                                         */
/* ------------------------------------------------------------------ */

{
  const result = validateBulkPayload(
    payload([{ ...validCasinoRow, category: "غير موجودة" }]),
    casinoMeta,
    dbCategories
  )
  check(
    "category outside the existing DB categories is rejected",
    hasError(result, 1, "category")
  )
}

{
  const result = validateBulkPayload(
    payload([{ text: "سؤال", category: "معلومات عامة" }]),
    bombMeta,
    []
  )
  check(
    "bomb rejects Arabic labels as stored values",
    hasError(result, 1, "category")
  )
}

{
  const result = validateBulkPayload(
    payload([{ text: "سؤال", category: "GENERAL" }]),
    bombMeta,
    []
  )
  check(
    "bomb accepts a canonical key and keeps it stored as-is",
    result.ok && result.rows[0]?.category === "GENERAL"
  )
}

{
  const result = validateBulkPayload(
    payload([{ text: "سؤال", category: "ثقافة" }]),
    topicsMeta,
    dbCategories
  )
  check(
    "non-bomb sets use the existing DB categories",
    result.ok && result.rows[0]?.category === "ثقافة"
  )
}

{
  check(
    "bomb display label is Arabic while the stored value stays canonical",
    getCategoryLabel("bomb", "GENERAL") !== "GENERAL" &&
      bombMeta.categoryOptions?.includes("GENERAL") === true
  )
  check(
    "non-bomb display labels are the stored values",
    getCategoryLabel("topics", "ثقافة") === "ثقافة"
  )
  equal(
    "bomb category values stay canonical",
    getCategoryValues(bombMeta, []),
    bombMeta.categoryOptions
  )
}

/* ------------------------------------------------------------------ */
/* Normalization and duplicate warnings                               */
/* ------------------------------------------------------------------ */

{
  const result = validateBulkPayload(
    payload([
      { text: "  سؤال  ", category: " ثقافة ", correctAnswer: "  ج  " },
      { text: "سؤال", category: "ثقافة", correctAnswer: "ج" },
    ]),
    casinoMeta,
    dbCategories
  )
  check("valid rows are trimmed", result.ok && result.rows[0]?.text === "سؤال")
  check(
    "duplicates inside the batch are warnings, not errors",
    result.ok && result.warnings.length === 1 && result.warnings[0]?.row === 2
  )
  equal(
    "duplicate warning points at the first row",
    result.warnings[0]?.firstRow,
    1
  )
}

{
  const result = validateBulkPayload(
    payload([validCasinoRow, { ...validCasinoRow, text: "سؤال تاني" }]),
    casinoMeta,
    dbCategories
  )
  check("duplicate warnings do not block a valid batch", result.ok)
}

/* ------------------------------------------------------------------ */
/* Boundary and template                                              */
/* ------------------------------------------------------------------ */

{
  const rows = Array.from({ length: BULK_MAX_QUESTIONS }, (_, index) => ({
    text: `سؤال ${index}`,
    category: "ثقافة",
    correctAnswer: "ج",
  }))
  const result = validateBulkPayload(payload(rows), casinoMeta, dbCategories)
  check(
    `exactly ${BULK_MAX_QUESTIONS} valid rows are accepted`,
    result.ok && result.rows.length === BULK_MAX_QUESTIONS
  )
}

{
  const template = buildBulkTemplate(casinoMeta, dbCategories)
  const result = validateBulkPayload(template, casinoMeta, dbCategories)
  check("casino template validates", result.ok)
}

{
  const template = buildBulkTemplate(bombMeta, [])
  const result = validateBulkPayload(template, bombMeta, [])
  check("bomb template uses canonical keys and validates", result.ok)
}

{
  const template = buildBulkTemplate(zadMeta, dbCategories)
  const result = validateBulkPayload(template, zadMeta, dbCategories)
  check("zad template validates with optional fields", result.ok)
}

/* ------------------------------------------------------------------ */
/* Server-side revalidation is the same pipeline                      */
/* ------------------------------------------------------------------ */

{
  const tampered = payload([{ ...validCasinoRow, id: "client-id" }])
  const result = validateBulkPayload(tampered, casinoMeta, dbCategories)
  check(
    "server revalidation rejects client-owned fields even if a client preview passed",
    !result.ok && hasError(result, 1, "id")
  )
}

console.log(`\n${passed} passed, ${failed} failed\n`)
if (failed > 0) process.exit(1)
