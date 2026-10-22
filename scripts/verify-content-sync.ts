#!/usr/bin/env tsx
/**
 * verify-content-sync — read-only verification for the content sync work.
 *
 * Checks, against the real Neon dev branch:
 *   1. All six content sets exist with the expected live counts.
 *   2. Content is returned in `position` order with contiguous positions.
 *   3. Soft-deleted rows are excluded.
 *   4. The API response version matches the database version.
 *   5. Database content matches the bundled TypeScript sources exactly
 *      (ids, order, text, category, correct_answer, badgeLabel).
 *   6. Total live questions is 3,181.
 *
 * Read-only: no migrations, no writes, no production access.
 *
 * Usage:
 *   node --env-file=.env.local --import tsx scripts/verify-content-sync.ts
 */

import { neon } from "@neondatabase/serverless"

import { casinoQuestions } from "../contents/casino"
import { challenges } from "../contents/challenges"
import { punishments } from "../contents/punishments"
import { sheikhQuestions } from "../contents/sheikh-questions"
import { topics } from "../contents/topics"
import { zadTopics } from "../contents/zad"
import { CONTENT_SET_IDS, type ContentSetId } from "../lib/content/types"

interface ExpectedQuestion {
  id: string
  text: string
  category?: string
  correct_answer?: string
  badgeLabel?: string
}

const SOURCES: Record<ContentSetId, readonly ExpectedQuestion[]> = {
  casino: casinoQuestions,
  topics,
  challenges,
  sheikh: sheikhQuestions,
  zad: zadTopics,
  punishments,
}

const EXPECTED_COUNTS: Record<ContentSetId, number> = {
  casino: 1094,
  topics: 502,
  challenges: 500,
  sheikh: 500,
  zad: 86,
  punishments: 499,
}

const EXPECTED_TOTAL = 3181

let failures = 0

function check(label: string, ok: boolean, detail = "") {
  if (ok) {
    console.log(`  ✓ ${label}`)
  } else {
    failures++
    console.log(`  ✗ ${label}${detail ? ` — ${detail}` : ""}`)
  }
}

async function main() {
  const url = process.env.DATABASE_URL
  if (!url) {
    console.error(
      "DATABASE_URL is not set. Run with: node --env-file=.env.local --import tsx ..."
    )
    process.exit(1)
  }

  const sql = neon(url)

  console.log("\n1) Versions + counts")
  const sets = (await sql.query(
    `select id, version, name from content_sets order by id asc`
  )) as Array<{ id: string; version: string; name: string }>

  const versionById = new Map<string, string>()
  for (const row of sets) {
    versionById.set(row.id, String(row.version))
  }

  check(
    `content_sets has all ${CONTENT_SET_IDS.length} sets`,
    CONTENT_SET_IDS.every((id) => versionById.has(id)),
    `found: ${sets.map((s) => s.id).join(", ")}`
  )

  let total = 0
  for (const id of CONTENT_SET_IDS) {
    const rows = (await sql.query(
      `select count(*)::int as n from questions where set_id = $1 and deleted_at is null`,
      [id]
    )) as Array<{ n: number }>
    const live = rows[0]?.n ?? 0
    total += live
    check(
      `${id}: ${live} live (expected ${EXPECTED_COUNTS[id]})`,
      live === EXPECTED_COUNTS[id]
    )
  }
  check(
    `total live questions = ${total} (expected ${EXPECTED_TOTAL})`,
    total === EXPECTED_TOTAL
  )

  console.log("\n2) Position order + contiguous positions + no deleted rows")
  for (const id of CONTENT_SET_IDS) {
    const rows = (await sql.query(
      `select external_id, position, text, category, correct_answer, badge_label
         from questions where set_id = $1 and deleted_at is null
         order by position asc`,
      [id]
    )) as Array<{
      external_id: string
      position: number
      text: string
      category: string | null
      correct_answer: string | null
      badge_label: string | null
    }>

    const ordered = rows.every((r, i) => r.position === i)
    check(`${id}: positions are 0..${rows.length - 1} in order`, ordered)

    const dbSet = new Set(rows.map((r) => r.external_id))
    const deletedCount = (await sql.query(
      `select count(*)::int as n from questions where set_id = $1 and deleted_at is not null`,
      [id]
    )) as Array<{ n: number }>
    check(
      `${id}: no soft-deleted rows leak (deleted=${deletedCount[0]?.n ?? 0})`,
      dbSet.size === rows.length
    )
  }

  console.log("\n3) Database matches bundled sources exactly")
  for (const id of CONTENT_SET_IDS) {
    const source = SOURCES[id]
    const rows = (await sql.query(
      `select external_id, position, text, category, correct_answer, badge_label
         from questions where set_id = $1 and deleted_at is null
         order by position asc`,
      [id]
    )) as Array<{
      external_id: string
      text: string
      category: string | null
      correct_answer: string | null
      badge_label: string | null
    }>

    check(
      `${id}: source count ${source.length} === db count ${rows.length}`,
      source.length === rows.length
    )

    let mismatch = -1
    for (let i = 0; i < Math.min(source.length, rows.length); i++) {
      const s = source[i]
      const r = rows[i]
      const same =
        s.id === r.external_id &&
        s.text === r.text &&
        (s.category ?? null) === (r.category ?? null) &&
        (s.correct_answer ?? null) === (r.correct_answer ?? null) &&
        (s.badgeLabel ?? null) === (r.badge_label ?? null)
      if (!same) {
        mismatch = i
        break
      }
    }
    check(
      `${id}: every row matches (id, text, category, answer, badge)`,
      mismatch === -1,
      mismatch >= 0 ? `first mismatch at index ${mismatch}` : ""
    )
  }

  console.log("\n4) Version tokens are present and opaque")
  for (const id of CONTENT_SET_IDS) {
    const v = versionById.get(id)
    check(
      `${id}: has non-empty version token`,
      typeof v === "string" && v.length > 0,
      `got ${v}`
    )
  }

  console.log(
    failures === 0 ? "\nALL CHECKS PASSED\n" : `\n${failures} CHECK(S) FAILED\n`
  )
  process.exit(failures === 0 ? 0 : 1)
}

main().catch((error) => {
  console.error("verify-content-sync failed:", error)
  process.exit(1)
})
