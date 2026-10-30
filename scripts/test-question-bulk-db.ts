#!/usr/bin/env tsx
/**
 * test-question-bulk-db — opt-in database tests for the shared allocator.
 *
 * This script writes ONLY to a dedicated test database supplied through
 * `BULK_TEST_DATABASE_URL`. It never reads `DATABASE_URL` from `.env.local`
 * implicitly and never cleans up or writes to any existing content set.
 *
 * Required to run:
 *   BULK_DB_TEST=1
 *   BULK_TEST_DATABASE_URL=postgres://...   (a disposable/test Neon branch)
 *
 * Usage:
 *   BULK_DB_TEST=1 BULK_TEST_DATABASE_URL=... pnpm test:bulk:db
 *
 * Without both variables the script prints a skip and exits successfully, so
 * the default test suite never touches a database.
 */

import assert from "node:assert/strict"
import { randomUUID } from "node:crypto"
import { neon } from "@neondatabase/serverless"

if (process.env.BULK_DB_TEST !== "1") {
  console.log("Skipping bulk DB tests: set BULK_DB_TEST=1 to opt in.")
  process.exit(0)
}

const testUrl = process.env.BULK_TEST_DATABASE_URL
if (!testUrl) {
  console.log(
    "Skipping bulk DB tests: BULK_TEST_DATABASE_URL (dedicated test branch) is not set."
  )
  process.exit(0)
}

// The mutation module caches the client on first use; set the URL before
// importing it. The test module must also run with --conditions=react-server
// so the server-only guards resolve.
process.env.DATABASE_URL = testUrl

const { insertQuestionRecords, createQuestionRecord } =
  await import("@/features/admin/server/question-mutations")

const sql = neon(testUrl)
const setId = `bulk-test-${Date.now()}-${randomUUID().slice(0, 8)}`
const setName = "Bulk allocation test (disposable)"
let setCreated = false

const draft = (text: string) => ({
  text,
  category: "test-category",
  correctAnswer: null,
  badgeLabel: null,
})

const rowsForSet = async () =>
  (await sql.query(
    `
      select id::text as id, external_id, position::int as position, text, deleted_at
      from questions
      where set_id = $1
      order by position asc, external_id asc
    `,
    [setId]
  )) as Array<{
    id: string
    external_id: string
    position: number
    text: string
    deleted_at: string | null
  }>

const countForSet = async () => {
  const rows = (await sql.query(
    `select count(*)::int as count from questions where set_id = $1`,
    [setId]
  )) as Array<{ count: number }>
  return Number(rows[0]?.count ?? 0)
}

try {
  await sql.query(
    `insert into content_sets (id, name, version) values ($1, $2, 1)`,
    [setId, setName]
  )
  setCreated = true

  // Seed gaps and a mix of numeric/non-numeric external ids. Positions 1, 3,
  // and 4 stay free; external ids "a" and "7"/"10" exercise the numeric max.
  await sql.query(
    `
      insert into questions (set_id, external_id, position, text, category)
      values
        ($1, 'a', 0, 'existing a', 'test-category'),
        ($1, '7', 2, 'existing 7', 'test-category'),
        ($1, '10', 5, 'existing 10', 'test-category')
    `,
    [setId]
  )

  const before = await rowsForSet()
  assert.equal(before.length, 3, "seed rows should exist")

  const inserted = await insertQuestionRecords(setId, [
    draft("new one"),
    draft("new two"),
    draft("new three"),
  ])

  assert.equal(inserted.ok, true, "insert should succeed")
  if (!inserted.ok) throw new Error("unreachable")

  assert.deepEqual(
    inserted.created.map((row) => row.externalId),
    ["11", "12", "13"],
    "external ids must come from max numeric id + 1, independent of position"
  )
  assert.deepEqual(
    inserted.created.map((row) => row.position),
    [6, 7, 8],
    "positions must append after the highest existing position"
  )

  const after = await rowsForSet()
  assert.deepEqual(
    after.filter((row) => before.some((old) => old.id === row.id)),
    before,
    "existing rows (including ids/positions/order) must not change"
  )
  assert.equal(
    after.filter((row) => row.external_id === "a").length,
    1,
    "non-numeric external id must be preserved"
  )
  assert.equal(
    after.some((row) => row.position === 1 || row.position === 3),
    false,
    "gaps must not be filled or renumbered"
  )

  // Concurrent single + bulk writes must serialize on the content_sets lock.
  const concurrent = await Promise.all([
    createQuestionRecord(setId, {
      text: "concurrent single",
      category: "test-category",
      correctAnswer: "",
      badgeLabel: "",
    }),
    insertQuestionRecords(setId, [
      draft("concurrent bulk 1"),
      draft("concurrent bulk 2"),
    ]),
    createQuestionRecord(setId, {
      text: "concurrent single 2",
      category: "test-category",
      correctAnswer: "",
      badgeLabel: "",
    }),
  ])

  assert.equal(
    concurrent.every((result) => result.ok),
    true,
    "all concurrent writes should succeed"
  )

  const concurrentRows = await rowsForSet()
  const positions = concurrentRows.map((row) => row.position)
  const externalIds = concurrentRows.map((row) => row.external_id)
  assert.equal(
    new Set(positions).size,
    positions.length,
    "concurrent writes must not duplicate positions"
  )
  assert.equal(
    new Set(externalIds).size,
    externalIds.length,
    "concurrent writes must not duplicate external ids"
  )
  assert.equal(
    concurrentRows.length,
    3 + 3 + 4,
    "all concurrent rows should be present"
  )

  // A failing insert must roll back the whole batch, not leave a partial one.
  const countBeforeFailure = await countForSet()
  let failed = false
  try {
    await insertQuestionRecords(setId, [
      draft("valid before failure"),
      { ...draft(""), text: "" },
    ])
  } catch {
    failed = true
  }
  assert.equal(failed, true, "invalid row should make the transaction fail")
  assert.equal(
    await countForSet(),
    countBeforeFailure,
    "failed batch must roll back completely"
  )

  console.log("✓ bulk DB tests passed (disposable set only)")
} finally {
  if (setCreated) {
    await sql.query(`delete from questions where set_id = $1`, [setId])
    await sql.query(`delete from content_sets where id = $1`, [setId])
  }
}
