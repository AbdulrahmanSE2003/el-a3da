#!/usr/bin/env tsx
/**
 * verify-content-sync — read-only content verification against Neon.
 *
 * Contract:
 * - The bundled `contents/*.ts` files are the historical import/release
 *   baseline, not a live mirror of Neon.
 * - Neon is authoritative. Admin additions, edits, and soft deletes are
 *   reported as expected drift.
 * - Genuine integrity problems always fail:
 *     * missing or empty required content sets
 *     * invalid live rows
 *     * duplicate live `external_id` or `position`
 *     * unexplained position gaps
 *     * baseline ids absent from both live rows and soft-deleted records
 *
 * Default mode exits 0 for drift-only results. `--strict` exits 1 on any
 * drift, which is useful before a release that promises baseline parity.
 *
 * This script only reads the database. It does not call the HTTP API, run
 * migrations, or write any data.
 *
 * Exit codes:
 *   0 — no integrity errors (and no drift in `--strict` mode)
 *   1 — integrity errors, or drift in `--strict` mode
 *   2 — operational failure (missing DATABASE_URL, connection/read error)
 *
 * Usage:
 *   pnpm content:verify
 *   pnpm content:verify -- --strict
 */

import { neon } from "@neondatabase/serverless"

import { casinoQuestions } from "../contents/casino"
import { challenges } from "../contents/challenges"
import { punishments } from "../contents/punishments"
import { sheikhQuestions } from "../contents/sheikh-questions"
import { topics } from "../contents/topics"
import { zadTopics } from "../contents/zad"
import { CONTENT_SET_IDS, type ContentSetId } from "../lib/content/types"
import {
  verifySet,
  type BaselineQuestion,
  type ChangedQuestion,
  type RawDeletedQuestion,
  type RawLiveQuestion,
  type SetVerification,
} from "./content-verify-lib"

interface ContentSetRow {
  id: string
  version: string | number
}

const SOURCES: Record<ContentSetId, readonly BaselineQuestion[]> = {
  casino: casinoQuestions,
  topics,
  challenges,
  sheikh: sheikhQuestions,
  zad: zadTopics,
  punishments,
}

const LIVE_QUERY = `
  select external_id, position, text, category, correct_answer, badge_label
  from questions
  where set_id = $1
    and deleted_at is null
  order by position asc
`

const DELETED_QUERY = `
  select external_id, position
  from questions
  where set_id = $1
    and deleted_at is not null
  order by position asc
`

function formatList<T>(values: readonly T[], limit = 20): string {
  if (values.length === 0) return "—"
  const shown = values.slice(0, limit).map(String).join(", ")
  return values.length > limit
    ? `${shown} … (+${values.length - limit} more)`
    : shown
}

function formatChanged(changed: readonly ChangedQuestion[], limit = 20): string {
  if (changed.length === 0) return "—"
  const shown = changed
    .slice(0, limit)
    .map((row) => `${row.id} [${row.fields.join(", ")}]`)
    .join(", ")
  return changed.length > limit
    ? `${shown} … (+${changed.length - limit} more)`
    : shown
}

function driftCount(result: SetVerification): number {
  return result.extra.length + result.missing.length + result.changed.length
}

async function main() {
  const url = process.env.DATABASE_URL
  if (!url) {
    console.error(
      "DATABASE_URL is not set. Run with: pnpm content:verify (loads .env.local)"
    )
    process.exit(2)
  }

  const args = process.argv.slice(2).filter((arg) => arg !== "--")
  const unknownArgs = args.filter((arg) => arg !== "--strict")
  if (unknownArgs.length > 0) {
    console.error(`Unknown argument(s): ${unknownArgs.join(", ")}`)
    console.error("Usage: pnpm content:verify [-- --strict]")
    process.exit(2)
  }
  const strict = args.includes("--strict")

  const sql = neon(url)
  const sets = (await sql.query(
    `select id, version from content_sets order by id asc`
  )) as ContentSetRow[]

  const versionById = new Map<string, string>()
  for (const row of sets) {
    versionById.set(String(row.id), String(row.version))
  }

  const globalErrors: string[] = []
  const missingSetIds = CONTENT_SET_IDS.filter((id) => !versionById.has(id))
  if (missingSetIds.length > 0) {
    globalErrors.push(
      `content_sets is missing required set(s): ${missingSetIds.join(", ")}`
    )
  }
  for (const id of CONTENT_SET_IDS) {
    const version = versionById.get(id)
    if (version !== undefined && version.trim() === "") {
      globalErrors.push(`${id}: content set has an empty version token`)
    }
  }

  const results: SetVerification[] = []
  for (const id of CONTENT_SET_IDS) {
    if (!versionById.has(id)) continue

    const liveRows = (await sql.query(LIVE_QUERY, [
      id,
    ])) as RawLiveQuestion[]
    const deletedRows = (await sql.query(DELETED_QUERY, [
      id,
    ])) as RawDeletedQuestion[]

    results.push(verifySet(id, SOURCES[id], liveRows, deletedRows))
  }

  const baselineTotal = CONTENT_SET_IDS.reduce(
    (total, id) => total + SOURCES[id].length,
    0
  )
  const liveTotal = results.reduce((total, result) => total + result.liveCount, 0)
  const deletedTotal = results.reduce(
    (total, result) => total + result.deletedCount,
    0
  )
  const totalExtra = results.reduce(
    (total, result) => total + result.extra.length,
    0
  )
  const totalMissing = results.reduce(
    (total, result) => total + result.missing.length,
    0
  )
  const totalChanged = results.reduce(
    (total, result) => total + result.changed.length,
    0
  )
  const totalDrift = results.reduce(
    (total, result) => total + driftCount(result),
    0
  )
  const integrityErrorCount =
    globalErrors.length +
    results.reduce((total, result) => total + result.integrityErrors.length, 0)

  console.log("\nContent verification (read-only)")
  console.log("Baseline: bundled contents/*.ts (historical import baseline)")
  console.log("Live:     Neon (authoritative)")

  console.log("\n1) Content sets")
  for (const id of CONTENT_SET_IDS) {
    const result = results.find((row) => row.id === id)
    if (!result) {
      console.log(`  ✗ ${id}: missing from content_sets`)
      continue
    }
    const version = versionById.get(id) ?? "—"
    const hasErrors =
      result.integrityErrors.length > 0 ||
      (versionById.get(id) !== undefined && versionById.get(id)?.trim() === "")
    console.log(
      `  ${hasErrors ? "✗" : "✓"} ${id}: baseline ${result.baselineCount}, live ${result.liveCount}, soft-deleted ${result.deletedCount}, version ${version}`
    )
  }

  console.log("\n2) Integrity")
  for (const error of globalErrors) {
    console.log(`  ✗ ${error}`)
  }
  for (const result of results) {
    if (result.integrityErrors.length === 0) {
      console.log(`  ✓ ${result.id}: integrity checks passed`)
      continue
    }
    for (const error of result.integrityErrors) {
      console.log(`  ✗ ${error}`)
    }
  }

  console.log("\n3) Drift vs bundled baseline")
  for (const result of results) {
    const count = driftCount(result)
    if (count === 0) {
      console.log(`  ✓ ${result.id}: no drift`)
      continue
    }

    console.log(
      `  ~ ${result.id}: ${count} difference(s) — extra ${result.extra.length}, missing ${result.missing.length}, changed ${result.changed.length}`
    )
    if (result.extra.length > 0) {
      console.log(`      extra: ${formatList(result.extra)}`)
    }
    if (result.missing.length > 0) {
      console.log(`      missing: ${formatList(result.missing)}`)
    }
    if (result.softDeleted.length > 0) {
      console.log(`      soft-deleted: ${formatList(result.softDeleted)}`)
    }
    if (result.unexplainedMissing.length > 0) {
      console.log(
        `      unexplained missing: ${formatList(result.unexplainedMissing)}`
      )
    }
    if (result.changed.length > 0) {
      console.log(`      changed: ${formatChanged(result.changed)}`)
    }
    if (result.explainedGaps.length > 0) {
      console.log(`      explained gaps: ${formatList(result.explainedGaps)}`)
    }
    if (result.unexplainedGaps.length > 0) {
      console.log(`      unexplained gaps: ${formatList(result.unexplainedGaps)}`)
    }
  }

  console.log("\n4) Totals")
  console.log(`  baseline:         ${baselineTotal}`)
  console.log(
    `  live:             ${liveTotal} (${liveTotal - baselineTotal >= 0 ? "+" : ""}${liveTotal - baselineTotal})`
  )
  console.log(`  soft-deleted rows: ${deletedTotal}`)
  console.log(
    `  drift:            ${totalDrift} (extra ${totalExtra}, missing ${totalMissing}, changed ${totalChanged})`
  )

  console.log("\nSummary")
  if (integrityErrorCount > 0) {
    console.log(`  ✗ integrity errors: ${integrityErrorCount}`)
    console.log(`  drift:              ${totalDrift}`)
    console.log("\nFAILED — integrity errors must be fixed.\n")
    process.exit(1)
  }

  console.log("  ✓ integrity: pass")
  if (strict && totalDrift > 0) {
    console.log(`  ✗ strict:   ${totalDrift} drift difference(s) detected`)
    console.log("\nFAILED — strict mode rejects content drift.\n")
    process.exit(1)
  }

  if (totalDrift > 0) {
    console.log(
      `  ℹ drift:    ${totalDrift} difference(s) (expected admin content drift)`
    )
    console.log(
      "\nPASSED — drift is reported but allowed in default mode. Use --strict to fail on drift.\n"
    )
  } else {
    console.log("  ✓ drift:    none")
    console.log("\nALL CHECKS PASSED\n")
  }

  process.exit(0)
}

main().catch((error) => {
  console.error(
    "\nverify-content-sync could not complete (operational error, not a content-integrity result):"
  )
  console.error(error)
  process.exit(2)
})
