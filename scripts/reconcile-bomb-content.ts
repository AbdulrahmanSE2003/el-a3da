#!/usr/bin/env tsx
/**
 * reconcile-bomb-content — safe, idempotent Bomb content-set reconciliation.
 *
 * The Bomb game used to read `contents/bomb.ts` directly. The bundled file is
 * now the offline fallback, and Neon is the source of truth. This script adds
 * the missing `bomb` content set and its 67 source questions to the **dev**
 * branch only. It never updates or deletes existing rows.
 *
 * Default mode is a read-only plan. `--apply` writes the missing rows in one
 * transaction. The script refuses to run against any branch other than the
 * known Neon dev branch.
 *
 * Usage:
 *   pnpm content:bomb
 *   pnpm content:bomb -- --apply
 */

import { neon } from "@neondatabase/serverless"

import { bombQuestions } from "../contents/bomb"
import { isBombCategory } from "../games/bomb/constants"

const DEV_BRANCH_ID = "br-calm-art-b9yzd3hg"
const SET_ID = "bomb"
const SET_NAME = "القنبلة"

interface SetRow {
  id: string
  name: string
  version: string | number
}

interface ExistingRow {
  external_id: string
  position: number | string
  text: string
  category: string | null
  deleted_at: string | null
}

interface PlannedRow {
  externalId: string
  position: number
  text: string
  category: string
}

function fail(message: string): never {
  console.error(`\n✗ ${message}\n`)
  process.exit(2)
}

function buildPlan(): PlannedRow[] {
  const seenIds = new Set<string>()
  const seenPositions = new Set<number>()

  return bombQuestions.map((question, position) => {
    if (!question.id.trim()) fail(`Bomb question ${position} has an empty id`)
    if (!question.text.trim())
      fail(`Bomb question ${question.id} has empty text`)
    if (!isBombCategory(question.category)) {
      fail(`Bomb question ${question.id} has an unknown category`)
    }
    if (seenIds.has(question.id))
      fail(`Duplicate Bomb question id: ${question.id}`)
    if (seenPositions.has(position))
      fail(`Duplicate Bomb position: ${position}`)

    seenIds.add(question.id)
    seenPositions.add(position)

    return {
      externalId: question.id,
      position,
      text: question.text,
      category: question.category,
    }
  })
}

async function main() {
  const url = process.env.DATABASE_URL
  if (!url) {
    fail(
      "DATABASE_URL is not set. Run with: pnpm content:bomb (loads .env.local)"
    )
  }

  const args = process.argv.slice(2).filter((arg) => arg !== "--")
  const unknown = args.filter((arg) => arg !== "--apply")
  if (unknown.length > 0) fail(`Unknown argument(s): ${unknown.join(", ")}`)
  const apply = args.includes("--apply")

  const sql = neon(url)

  const branchRows = (await sql.query(
    `select current_setting('neon.branch_id', true) as branch_id`
  )) as Array<{ branch_id: string | null }>
  const branchId = branchRows[0]?.branch_id ?? null

  if (branchId !== DEV_BRANCH_ID) {
    fail(
      `Refusing to reconcile Bomb content outside Neon dev. Expected branch ${DEV_BRANCH_ID}, got ${branchId ?? "unknown"}.`
    )
  }

  const plan = buildPlan()

  const setRows = (await sql.query(
    `select id, name, version from content_sets where id = $1`,
    [SET_ID]
  )) as SetRow[]
  const existingRows = (await sql.query(
    `
      select external_id, position, text, category, deleted_at
      from questions
      where set_id = $1
      order by position asc
    `,
    [SET_ID]
  )) as ExistingRow[]

  const existingById = new Map(
    existingRows.map((row) => [String(row.external_id), row])
  )
  const occupiedPositions = new Map(
    existingRows.map((row) => [Number(row.position), String(row.external_id)])
  )

  const missing = plan.filter((row) => !existingById.has(row.externalId))
  const changed = plan.filter((row) => {
    const existing = existingById.get(row.externalId)
    if (!existing) return false
    return (
      Number(existing.position) !== row.position ||
      existing.text !== row.text ||
      (existing.category ?? "") !== row.category ||
      existing.deleted_at !== null
    )
  })
  const positionConflicts = missing.filter((row) =>
    occupiedPositions.has(row.position)
  )

  console.log("\nBomb content reconciliation (dev only)")
  console.log(`  branch:        ${branchId}`)
  console.log(
    `  set:           ${SET_ID} ${setRows[0] ? `(version ${setRows[0].version})` : "(missing)"}`
  )
  console.log(`  source rows:   ${plan.length}`)
  console.log(`  existing rows: ${existingRows.length}`)
  console.log(
    `  live rows:     ${existingRows.filter((row) => row.deleted_at === null).length}`
  )
  console.log(`  missing rows:  ${missing.length}`)
  console.log(`  changed rows:  ${changed.length} (left untouched)`)
  console.log(`  position collisions: ${positionConflicts.length}`)

  if (changed.length > 0) {
    console.log(
      "  ⚠ existing rows differ from the bundled source; they will not be overwritten."
    )
  }

  if (positionConflicts.length > 0) {
    console.log("\n  Position collisions:")
    for (const row of positionConflicts) {
      console.log(
        `    ${row.externalId} wants position ${row.position}, already used by ${occupiedPositions.get(row.position)}`
      )
    }
    fail("Position collisions must be resolved first. No data was written.")
  }

  if (!apply) {
    console.log(
      "\nRead-only plan complete. Re-run with `--apply` to insert missing rows.\n"
    )
    return
  }

  if (!setRows[0] && missing.length === 0) {
    fail("No set and no planned rows; refusing to write an empty set.")
  }

  if (setRows[0] && missing.length === 0) {
    console.log("\n✓ Nothing to apply; the dev set is already complete.\n")
    return
  }

  await sql.transaction((txn) => {
    const queries = []

    if (!setRows[0]) {
      queries.push(
        txn.query(
          `insert into content_sets (id, name) values ($1, $2) on conflict (id) do nothing`,
          [SET_ID, SET_NAME]
        )
      )
    }

    queries.push(
      txn.query(
        `
          insert into questions (
            set_id, external_id, position, text, category, correct_answer, badge_label
          )
          select
            $1,
            source.external_id,
            source.position,
            source.text,
            source.category,
            null,
            null
          from jsonb_to_recordset($2::jsonb) as source(
            external_id text,
            position int,
            text text,
            category text
          )
          on conflict (set_id, external_id) do nothing
        `,
        [
          SET_ID,
          JSON.stringify(
            missing.map((row) => ({
              external_id: row.externalId,
              position: row.position,
              text: row.text,
              category: row.category,
            }))
          ),
        ]
      )
    )

    return queries
  })

  const afterRows = (await sql.query(
    `
      select
        cs.version,
        count(q.id) filter (where q.deleted_at is null)::int as live,
        count(q.id) filter (where q.deleted_at is not null)::int as deleted
      from content_sets cs
      left join questions q on q.set_id = cs.id
      where cs.id = $1
      group by cs.version
    `,
    [SET_ID]
  )) as Array<{ version: string | number; live: number; deleted: number }>

  const after = afterRows[0]
  console.log(
    `\n✓ Applied. Bomb version ${after?.version ?? "—"}, live ${after?.live ?? 0}, deleted ${after?.deleted ?? 0}.\n`
  )
}

main().catch((error) => {
  console.error("\nBomb content reconciliation failed:")
  console.error(error)
  process.exit(1)
})
