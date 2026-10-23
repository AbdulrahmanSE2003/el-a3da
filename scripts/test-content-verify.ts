#!/usr/bin/env tsx
/**
 * test-content-verify — fixture tests for the content verifier rules.
 *
 * These tests exercise only `scripts/content-verify-lib.ts` with in-memory
 * data. Nothing here touches Neon, the network, or the filesystem.
 *
 * Usage:
 *   pnpm content:verify:test
 */

import {
  verifySet,
  type BaselineQuestion,
  type RawDeletedQuestion,
  type RawLiveQuestion,
} from "./content-verify-lib"

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

function baseline(
  id: string,
  text: string,
  extra: Partial<BaselineQuestion> = {}
): BaselineQuestion {
  return { id, text, ...extra }
}

function live(
  id: string,
  position: number,
  text: string,
  extra: Partial<
    Omit<RawLiveQuestion, "external_id" | "position" | "text">
  > = {}
): RawLiveQuestion {
  return {
    external_id: id,
    position,
    text,
    category: null,
    correct_answer: null,
    badge_label: null,
    ...extra,
  }
}

function deleted(id: string, position: number): RawDeletedQuestion {
  return { external_id: id, position }
}

/* ------------------------------------------------------------------ */
/* Drift: extra, changed, valid soft deletes                          */
/* ------------------------------------------------------------------ */

{
  const result = verifySet(
    "casino",
    [baseline("a", "A"), baseline("b", "B")],
    [live("a", 0, "A"), live("b", 1, "B"), live("c", 2, "C")]
  )
  equal("extra live row: extra", result.extra, ["c"])
  equal("extra live row: missing", result.missing, [])
  equal("extra live row: changed", result.changed, [])
  equal("extra live row: integrity errors", result.integrityErrors, [])
  check("extra live row: drift", result.drift)
}

{
  const result = verifySet(
    "casino",
    [baseline("a", "A"), baseline("b", "B")],
    [live("a", 0, "A changed"), live("b", 1, "B")]
  )
  equal("changed row: changed", result.changed, [
    { id: "a", fields: ["text"] },
  ])
  equal("changed row: extra", result.extra, [])
  equal("changed row: missing", result.missing, [])
  equal("changed row: integrity errors", result.integrityErrors, [])
  check("changed row: drift", result.drift)
}

{
  const result = verifySet(
    "casino",
    [
      baseline("a", "A", {
        category: "old-category",
        correct_answer: "old-answer",
        badgeLabel: "old-badge",
      }),
    ],
    [
      live("a", 0, "A", {
        category: "new-category",
        correct_answer: "new-answer",
        badge_label: "new-badge",
      }),
    ]
  )
  equal("changed fields: category/answer/badge", result.changed, [
    { id: "a", fields: ["category", "correct_answer", "badgeLabel"] },
  ])
  equal("changed fields: integrity errors", result.integrityErrors, [])
}

{
  const result = verifySet(
    "casino",
    [baseline("a", "A")],
    [live("a", 0, "A", { category: null, correct_answer: null, badge_label: null })]
  )
  equal("undefined baseline fields equal null live fields", result.changed, [])
  equal("null normalization: integrity errors", result.integrityErrors, [])
  check("null normalization: no drift", !result.drift)
}

{
  const result = verifySet(
    "casino",
    [baseline("a", "A"), baseline("b", "B"), baseline("c", "C")],
    [live("a", 0, "A"), live("c", 2, "C")],
    [deleted("b", 1)]
  )
  equal("soft delete: missing", result.missing, ["b"])
  equal("soft delete: soft-deleted", result.softDeleted, ["b"])
  equal("soft delete: unexplained missing", result.unexplainedMissing, [])
  equal("soft delete: explained gaps", result.explainedGaps, [1])
  equal("soft delete: unexplained gaps", result.unexplainedGaps, [])
  equal("soft delete: integrity errors", result.integrityErrors, [])
  check("soft delete: drift", result.drift)
}

{
  const result = verifySet(
    "casino",
    [
      baseline("a", "A"),
      baseline("b", "B"),
      baseline("c", "C"),
      baseline("d", "D"),
    ],
    [live("a", 0, "A"), live("d", 3, "D")],
    [deleted("b", 1), deleted("c", 2)]
  )
  equal("multiple soft-delete gaps: explained", result.explainedGaps, [1, 2])
  equal("multiple soft-delete gaps: unexplained", result.unexplainedGaps, [])
  equal("multiple soft-delete gaps: missing", result.missing, ["b", "c"])
  equal("multiple soft-delete gaps: integrity errors", result.integrityErrors, [])
}

{
  const result = verifySet(
    "casino",
    [baseline("a", "A"), baseline("b", "B")],
    [live("b", 1, "B")],
    [deleted("a", 0)]
  )
  equal("leading soft delete: explained gaps", result.explainedGaps, [0])
  equal("leading soft delete: missing", result.missing, ["a"])
  equal("leading soft delete: integrity errors", result.integrityErrors, [])
}

{
  const result = verifySet(
    "casino",
    [baseline("a", "A"), baseline("b", "B"), baseline("c", "C")],
    [live("a", 0, "A"), live("b", 1, "B")],
    [deleted("c", 2)]
  )
  equal("tail soft delete: missing", result.missing, ["c"])
  equal("tail soft delete: soft-deleted", result.softDeleted, ["c"])
  equal("tail soft delete: gaps", result.explainedGaps, [])
  equal("tail soft delete: integrity errors", result.integrityErrors, [])
  check("tail soft delete: drift", result.drift)
}

/* ------------------------------------------------------------------ */
/* Integrity failures                                                  */
/* ------------------------------------------------------------------ */

{
  const result = verifySet(
    "casino",
    [baseline("a", "A"), baseline("b", "B"), baseline("c", "C")],
    [live("a", 0, "A"), live("c", 2, "C")]
  )
  equal("unexplained gap: unexplained gaps", result.unexplainedGaps, [1])
  equal("unexplained gap: unexplained missing", result.unexplainedMissing, ["b"])
  check(
    "unexplained gap: integrity error",
    result.integrityErrors.some((error) =>
      error.includes("live position 1 is missing")
    ),
    result.integrityErrors.join(" | ")
  )
}

{
  const result = verifySet(
    "casino",
    [baseline("a", "A"), baseline("b", "B")],
    [live("a", 0, "A"), live("b", 1, "B"), live("c", 3, "C")]
  )
  equal("unexplained gap without missing baseline: extra", result.extra, ["c"])
  equal("unexplained gap without missing baseline: missing", result.missing, [])
  equal(
    "unexplained gap without missing baseline: unexplained gaps",
    result.unexplainedGaps,
    [2]
  )
  check(
    "unexplained gap without missing baseline: integrity error",
    result.integrityErrors.some((error) =>
      error.includes("live position 2 is missing")
    )
  )
}

{
  const result = verifySet(
    "casino",
    [baseline("a", "A"), baseline("b", "B")],
    [live("a", 0, "A"), live("a", 1, "A duplicate")]
  )
  equal("duplicate external id: duplicates", result.duplicateExternalIds, ["a"])
  check(
    "duplicate external id: integrity error",
    result.integrityErrors.some((error) =>
      error.includes("duplicate live external_id")
    )
  )
}

{
  const result = verifySet(
    "casino",
    [baseline("a", "A"), baseline("b", "B")],
    [live("a", 0, "A"), live("b", 0, "B")]
  )
  equal("duplicate live position: duplicates", result.duplicateLivePositions, [0])
  check(
    "duplicate live position: integrity error",
    result.integrityErrors.some((error) =>
      error.includes("duplicate live position")
    )
  )
}

{
  const result = verifySet(
    "casino",
    [baseline("a", "A"), baseline("b", "B"), baseline("c", "C")],
    [live("a", 0, "A"), live("b", 1, "B")]
  )
  equal("missing baseline row: missing", result.missing, ["c"])
  equal("missing baseline row: unexplained", result.unexplainedMissing, ["c"])
  check(
    "missing baseline row: integrity error",
    result.integrityErrors.some((error) =>
      error.includes('baseline external_id "c"')
    )
  )
}

{
  const result = verifySet("casino", [baseline("a", "A")], [])
  equal("empty live set: integrity error", result.integrityErrors.includes(
    "casino: live set is empty"
  ), true)
  equal("empty live set: missing", result.missing, ["a"])
  equal("empty live set: unexplained missing", result.unexplainedMissing, ["a"])
}

{
  const result = verifySet(
    "casino",
    [baseline("a", "A")],
    [live("a", 0, "")]
  )
  equal("invalid live text: invalid rows", result.invalidLiveRows.length, 1)
  check(
    "invalid live text: integrity error",
    result.integrityErrors.some((error) => error.includes("text is empty"))
  )
}

{
  const result = verifySet(
    "casino",
    [baseline("a", "A")],
    [live("a", -1, "A")]
  )
  equal("invalid live position: invalid rows", result.invalidLiveRows.length, 1)
  check(
    "invalid live position: integrity error",
    result.integrityErrors.some((error) =>
      error.includes("position is not a non-negative integer")
    )
  )
}

/* ------------------------------------------------------------------ */
/* Deleted rows that are not part of the baseline                     */
/* ------------------------------------------------------------------ */

{
  const result = verifySet(
    "casino",
    [baseline("a", "A"), baseline("b", "B")],
    [live("a", 0, "A"), live("b", 1, "B")],
    [deleted("extra", 2)]
  )
  equal("deleted extra: extra", result.extra, [])
  equal("deleted extra: missing", result.missing, [])
  equal("deleted extra: changed", result.changed, [])
  equal("deleted extra: integrity errors", result.integrityErrors, [])
  check("deleted extra: no drift", !result.drift)
}

/* ------------------------------------------------------------------ */

console.log(`\n${passed} passed, ${failed} failed\n`)
process.exit(failed === 0 ? 0 : 1)
