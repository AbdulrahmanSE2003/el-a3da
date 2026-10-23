#!/usr/bin/env tsx
/**
 * test-content-registry — pure tests for the DB-driven content registry.
 *
 * Covers identifier validation, fallback metadata for new sets, category
 * constraints for Bomb, and the safe empty bundled snapshot for DB-only sets.
 *
 * Usage:
 *   pnpm test:registry
 */

import {
  isContentSetId,
  parseContentVersionsResponse,
} from "@/lib/content/types"
import { CONTENT_SETS, getSetMeta } from "@/features/admin/lib/content-sets"
import { getSetColor } from "@/features/admin/constants"
import { validateQuestionDraft } from "@/features/admin/lib/question-form"
import { FEEDBACK_SET_OPTIONS } from "@/features/feedback/lib/feedback"
import { getBundledSnapshot } from "@/lib/content/provider"

let passed = 0
let failed = 0

function check(label: string, ok: boolean, detail = "") {
  passed += ok ? 1 : 0
  failed += ok ? 0 : 1
  console.log(`  ${ok ? "✓" : "✗"} ${label}${detail ? ` — ${detail}` : ""}`)
}

function equal<T>(label: string, actual: T, expected: T) {
  const actualJson = JSON.stringify(actual)
  const expectedJson = JSON.stringify(expected)
  check(
    label,
    actualJson === expectedJson,
    actualJson === expectedJson
      ? ""
      : `expected ${expectedJson}, got ${actualJson}`
  )
}

console.log("\n1) Dynamic content set identifiers")
check("existing id accepted", isContentSetId("casino"))
check("new ordinary id accepted", isContentSetId("new-set_2"))
check("uppercase id rejected", !isContentSetId("NOPE"))
check("punctuation rejected", !isContentSetId("bad/id"))
check("empty id rejected", !isContentSetId(""))
check("63-character id accepted", isContentSetId("a".repeat(63)))
check("64-character id rejected", !isContentSetId("a".repeat(64)))

const versions = parseContentVersionsResponse({
  sets: [
    { id: "casino", version: "12" },
    { id: "new-set", version: "1" },
  ],
})
check("versions parser accepts a new set", versions?.sets.length === 2)
check(
  "versions parser rejects invalid ids",
  parseContentVersionsResponse({
    sets: [{ id: "bad id", version: "1" }],
  }) === null
)

console.log("\n2) Metadata fallback for DB-only sets")
const newSetMeta = getSetMeta("new-set", "مجموعة جديدة")
equal("db title is used", newSetMeta.title, "مجموعة جديدة")
equal("unknown set is not marked as used", newSetMeta.isUsed, false)
equal("unknown set has no source file", newSetMeta.sourceFile, "—")
equal(
  "unknown set uses the fallback color",
  getSetColor("new-set"),
  "var(--color-ink-soft)"
)
check(
  "known Bomb metadata is present",
  CONTENT_SETS.some((set) => set.id === "bomb" && set.isUsed)
)
check(
  "feedback options include Bomb",
  FEEDBACK_SET_OPTIONS.some((set) => set.id === "bomb")
)

console.log("\n3) Bomb category constraints")
const bombMeta = getSetMeta("bomb")
const validBomb = validateQuestionDraft(
  {
    text: "سؤال",
    category: "SPORT",
    correctAnswer: "",
    badgeLabel: "",
  },
  bombMeta
)
check("known Bomb category accepted", validBomb.ok)

const invalidBomb = validateQuestionDraft(
  {
    text: "سؤال",
    category: "RANDOM",
    correctAnswer: "",
    badgeLabel: "",
  },
  bombMeta
)
check(
  "RANDOM is rejected as a stored Bomb category",
  !invalidBomb.ok && Boolean(invalidBomb.fieldErrors.category)
)

const emptyBomb = validateQuestionDraft(
  {
    text: "سؤال",
    category: "",
    correctAnswer: "",
    badgeLabel: "",
  },
  bombMeta
)
check(
  "Bomb category is required",
  !emptyBomb.ok && Boolean(emptyBomb.fieldErrors.category)
)

console.log("\n4) Bundled fallback for DB-only sets")
const bomb = getBundledSnapshot("bomb")
check("Bomb has a bundled fallback", bomb.questions.length > 0)
const dbOnly = getBundledSnapshot("new-set")
check("DB-only set has a safe empty fallback", dbOnly.questions.length === 0)

console.log(
  failed === 0
    ? `\nALL ${passed} CHECKS PASSED\n`
    : `\n${failed} CHECK(S) FAILED (${passed} passed)\n`
)
process.exit(failed === 0 ? 0 : 1)
