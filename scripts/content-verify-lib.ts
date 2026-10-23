/**
 * Pure comparison/integrity helpers for `verify-content-sync.ts`.
 *
 * The bundled `contents/*.ts` files are a release/import baseline, not a live
 * mirror of Neon. Admin additions, edits, and soft deletes are expected to
 * produce drift. This module keeps the structural integrity rules separate
 * from that expected drift so the verifier can report both clearly.
 *
 * No database or network access belongs here; the fixture tests exercise these
 * functions directly.
 */

export interface BaselineQuestion {
  id: string
  text: string
  category?: string | null
  correct_answer?: string | null
  badgeLabel?: string | null
}

/** Raw live row as returned by the database. Validated before use. */
export interface RawLiveQuestion {
  external_id: unknown
  position: unknown
  text: unknown
  category?: unknown
  correct_answer?: unknown
  badge_label?: unknown
}

/** Raw soft-deleted row. Only identity and position matter for reconciliation. */
export interface RawDeletedQuestion {
  external_id: unknown
  position: unknown
}

export interface ValidLiveQuestion {
  external_id: string
  position: number
  text: string
  category: string | null
  correct_answer: string | null
  badge_label: string | null
}

export interface ValidDeletedQuestion {
  external_id: string
  position: number
}

export type ChangedField =
  | "text"
  | "category"
  | "correct_answer"
  | "badgeLabel"

export interface ChangedQuestion {
  id: string
  fields: ChangedField[]
}

export interface SetVerification {
  id: string
  baselineCount: number
  liveCount: number
  deletedCount: number
  /** Live rows whose external_id is not in the bundled baseline. */
  extra: string[]
  /** Baseline ids absent from live rows (soft-deleted or unexplained). */
  missing: string[]
  /** Missing baseline ids that have a corresponding soft-deleted row. */
  softDeleted: string[]
  /** Missing baseline ids with no live or soft-deleted row. */
  unexplainedMissing: string[]
  /** Baseline ids present live, with differing content fields. */
  changed: ChangedQuestion[]
  duplicateExternalIds: string[]
  duplicateLivePositions: number[]
  invalidLiveRows: string[]
  /** Position gaps explained by a soft-deleted row. */
  explainedGaps: number[]
  /** Position gaps with no soft-deleted row. */
  unexplainedGaps: number[]
  /** Genuine structural/content errors; these are never tolerated. */
  integrityErrors: string[]
  /** Expected drift: extra, missing, or changed rows. */
  drift: boolean
}

/** Guard against a corrupt position causing a huge gap scan. */
const MAX_GAP_SCAN = 1_000_000

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim() !== ""
}

function nullableString(value: unknown): string | null | undefined {
  if (value === null || value === undefined) return null
  if (typeof value === "string") return value
  return undefined
}

function duplicateValues<T>(values: readonly T[]): T[] {
  const seen = new Set<T>()
  const duplicates = new Set<T>()
  for (const value of values) {
    if (seen.has(value)) duplicates.add(value)
    else seen.add(value)
  }
  return [...duplicates]
}

function normalizeLiveRow(
  raw: RawLiveQuestion,
  index: number
): { row?: ValidLiveQuestion; error?: string } {
  const label = `live row ${index + 1}`
  const externalId = raw.external_id
  const position = raw.position
  const text = raw.text

  if (!isNonEmptyString(externalId)) {
    return { error: `${label}: external_id is empty or not a string` }
  }
  if (
    typeof position !== "number" ||
    !Number.isInteger(position) ||
    position < 0
  ) {
    return {
      error: `${label} (${externalId}): position is not a non-negative integer`,
    }
  }
  if (typeof text !== "string" || text.trim() === "") {
    return { error: `${label} (${externalId}): text is empty or not a string` }
  }

  const category = nullableString(raw.category)
  if (category === undefined) {
    return { error: `${label} (${externalId}): category is not a string or null` }
  }

  const correctAnswer = nullableString(raw.correct_answer)
  if (correctAnswer === undefined) {
    return {
      error: `${label} (${externalId}): correct_answer is not a string or null`,
    }
  }

  const badgeLabel = nullableString(raw.badge_label)
  if (badgeLabel === undefined) {
    return {
      error: `${label} (${externalId}): badge_label is not a string or null`,
    }
  }

  return {
    row: {
      external_id: externalId,
      position,
      text,
      category,
      correct_answer: correctAnswer,
      badge_label: badgeLabel,
    },
  }
}

function normalizeDeletedRow(
  raw: RawDeletedQuestion,
  index: number
): { row?: ValidDeletedQuestion; error?: string } {
  const label = `soft-deleted row ${index + 1}`
  const externalId = raw.external_id
  const position = raw.position

  if (!isNonEmptyString(externalId)) {
    return { error: `${label}: external_id is empty or not a string` }
  }
  if (
    typeof position !== "number" ||
    !Number.isInteger(position) ||
    position < 0
  ) {
    return {
      error: `${label} (${externalId}): position is not a non-negative integer`,
    }
  }

  return { row: { external_id: externalId, position } }
}

/**
 * Compare one content set against its bundled baseline and apply the
 * integrity rules.
 *
 * - extra/missing/changed rows are drift.
 * - A missing baseline id is explained only by a soft-deleted row with the
 *   same external_id.
 * - A live position gap is explained only by a soft-deleted row at that
 *   position. Positions are unique across live and deleted rows, so this is
 *   the schema-level explanation for gaps (soft deletes never renumber).
 * - Invalid rows, duplicate ids/positions, unexplained gaps, and unexplained
 *   missing baseline ids are integrity errors.
 */
export function verifySet(
  id: string,
  baseline: readonly BaselineQuestion[],
  liveRaw: readonly RawLiveQuestion[],
  deletedRaw: readonly RawDeletedQuestion[] = []
): SetVerification {
  const integrityErrors: string[] = []
  const invalidLiveRows: string[] = []
  const validLive: ValidLiveQuestion[] = []
  const validDeleted: ValidDeletedQuestion[] = []

  for (let index = 0; index < liveRaw.length; index++) {
    const normalized = normalizeLiveRow(liveRaw[index], index)
    if (normalized.row) {
      validLive.push(normalized.row)
    } else if (normalized.error) {
      invalidLiveRows.push(normalized.error)
      integrityErrors.push(`${id}: ${normalized.error}`)
    }
  }

  for (let index = 0; index < deletedRaw.length; index++) {
    const normalized = normalizeDeletedRow(deletedRaw[index], index)
    if (normalized.row) {
      validDeleted.push(normalized.row)
    } else if (normalized.error) {
      integrityErrors.push(`${id}: ${normalized.error}`)
    }
  }

  if (baseline.length === 0) {
    integrityErrors.push(`${id}: bundled baseline is empty`)
  }
  if (liveRaw.length === 0) {
    integrityErrors.push(`${id}: live set is empty`)
  }

  const validBaseline: BaselineQuestion[] = []
  for (const row of baseline) {
    if (!isNonEmptyString(row.id)) {
      integrityErrors.push(`${id}: bundled baseline contains an empty external_id`)
      continue
    }
    if (typeof row.text !== "string" || row.text.trim() === "") {
      integrityErrors.push(
        `${id}: bundled baseline row "${row.id}" has empty text`
      )
      continue
    }
    validBaseline.push(row)
  }

  const duplicateBaselineIds = duplicateValues(validBaseline.map((row) => row.id))
  if (duplicateBaselineIds.length > 0) {
    integrityErrors.push(
      `${id}: bundled baseline has duplicate external_id(s): ${duplicateBaselineIds.join(", ")}`
    )
  }

  const baselineById = new Map<string, BaselineQuestion>()
  for (const row of validBaseline) {
    if (!baselineById.has(row.id)) baselineById.set(row.id, row)
  }

  const duplicateExternalIds = duplicateValues(
    validLive.map((row) => row.external_id)
  )
  if (duplicateExternalIds.length > 0) {
    integrityErrors.push(
      `${id}: duplicate live external_id(s): ${duplicateExternalIds.join(", ")}`
    )
  }

  const duplicateLivePositions = duplicateValues(
    validLive.map((row) => row.position)
  )
  if (duplicateLivePositions.length > 0) {
    integrityErrors.push(
      `${id}: duplicate live position(s): ${duplicateLivePositions.join(", ")}`
    )
  }

  const liveById = new Map<string, ValidLiveQuestion>()
  for (const row of validLive) {
    if (!liveById.has(row.external_id)) liveById.set(row.external_id, row)
  }

  const deletedById = new Map<string, ValidDeletedQuestion>()
  for (const row of validDeleted) {
    if (!deletedById.has(row.external_id)) deletedById.set(row.external_id, row)
  }

  const extra = [
    ...new Set(
      validLive
        .filter((row) => !baselineById.has(row.external_id))
        .map((row) => row.external_id)
    ),
  ]

  const missing: string[] = []
  const softDeleted: string[] = []
  const unexplainedMissing: string[] = []

  for (const baselineId of baselineById.keys()) {
    if (liveById.has(baselineId)) continue
    missing.push(baselineId)

    if (deletedById.has(baselineId)) {
      softDeleted.push(baselineId)
    } else {
      unexplainedMissing.push(baselineId)
      integrityErrors.push(
        `${id}: baseline external_id "${baselineId}" is absent from live data and has no soft-deleted record`
      )
    }
  }

  const changed: ChangedQuestion[] = []
  for (const [baselineId, baselineRow] of baselineById) {
    const liveRow = liveById.get(baselineId)
    if (!liveRow) continue

    const fields: ChangedField[] = []
    if (baselineRow.text !== liveRow.text) fields.push("text")
    if ((baselineRow.category ?? null) !== liveRow.category) {
      fields.push("category")
    }
    if ((baselineRow.correct_answer ?? null) !== liveRow.correct_answer) {
      fields.push("correct_answer")
    }
    if ((baselineRow.badgeLabel ?? null) !== liveRow.badge_label) {
      fields.push("badgeLabel")
    }

    if (fields.length > 0) changed.push({ id: baselineId, fields })
  }

  const livePositions = new Set(validLive.map((row) => row.position))
  const deletedPositions = new Set(validDeleted.map((row) => row.position))
  const explainedGaps: number[] = []
  const unexplainedGaps: number[] = []

  if (validLive.length > 0) {
    const maxLive = validLive.reduce(
      (max, row) => Math.max(max, row.position),
      0
    )

    if (maxLive > MAX_GAP_SCAN) {
      integrityErrors.push(
        `${id}: live position ${maxLive} exceeds the safe gap-scan limit (${MAX_GAP_SCAN})`
      )
    } else {
      for (let position = 0; position <= maxLive; position++) {
        if (livePositions.has(position)) continue
        if (deletedPositions.has(position)) {
          explainedGaps.push(position)
        } else {
          unexplainedGaps.push(position)
          integrityErrors.push(
            `${id}: live position ${position} is missing and has no soft-deleted row`
          )
        }
      }
    }
  }

  return {
    id,
    baselineCount: baseline.length,
    liveCount: liveRaw.length,
    deletedCount: deletedRaw.length,
    extra,
    missing,
    softDeleted,
    unexplainedMissing,
    changed,
    duplicateExternalIds,
    duplicateLivePositions,
    invalidLiveRows,
    explainedGaps,
    unexplainedGaps,
    integrityErrors,
    drift: extra.length > 0 || missing.length > 0 || changed.length > 0,
  }
}
