import "server-only"

import { connection } from "next/server"
import { requireAdmin } from "./auth"
import { getSql } from "./db"
import { CONTENT_SETS, getSetMeta, isContentSetId } from "../lib/content-sets"
import type {
  CategoryCount,
  ContentSetId,
  ContentSetRow,
  FindingSeverity,
  HealthFinding,
  HealthReport,
  HealthSetRow,
  OverviewData,
  QuestionRow,
} from "../lib/types"

/**
 * كل استعلامات الداشبورد هنا. الملف server-only: أي محاولة لاستيراده من
 * Client Component هتفشل وقت البناء، و`DATABASE_URL` عمره ما بيتحط في
 * الـ browser bundle.
 */

/**
 * `connection()` بتخلي الصفحة request-time. من غيرها Next ممكن يعمل prerender
 * للاستعلامات وقت البناء، والداشبورد هيفضل يعرض أرقام قديمة.
 */
async function query<T>(text: string, params: unknown[] = []): Promise<T[]> {
  // Defense in depth: حتى لو صفحة اتحركت خارج admin layout بالغلط، مفيش
  // استعلام بيتنفذ قبل التحقق من الجلسة.
  await requireAdmin()
  await connection()
  const rows = await getSql().query(text, params)
  return rows as T[]
}

const asNumber = (value: unknown): number => {
  const number = typeof value === "number" ? value : Number(value ?? 0)
  return Number.isFinite(number) ? number : 0
}

const asText = (value: unknown): string => (value == null ? "" : String(value))

const asNullableText = (value: unknown): string | null =>
  value == null ? null : String(value)

/* ------------------------------------------------------------------ */
/* Content sets                                                        */
/* ------------------------------------------------------------------ */

interface SetAggregateDbRow {
  id: string
  name: string
  version: string | number
  live_count: string | number
  deleted_count: string | number
}

export async function getContentSets(): Promise<ContentSetRow[]> {
  const rows = await query<SetAggregateDbRow>(`
    select
      cs.id,
      cs.name,
      cs.version,
      count(q.id) filter (where q.deleted_at is null)::int as live_count,
      count(q.id) filter (where q.deleted_at is not null)::int as deleted_count
    from content_sets cs
    left join questions q on q.set_id = cs.id
    group by cs.id, cs.name, cs.version
  `)

  const dbRows = rows
    .filter((row) => isContentSetId(row.id))
    .map<ContentSetRow>((row) => {
      const meta = getSetMeta(row.id, row.name)
      return {
        id: row.id,
        title: meta.title,
        stamp: meta.stamp,
        sourceFile: meta.sourceFile,
        isUsed: meta.isUsed,
        version: String(row.version),
        liveCount: asNumber(row.live_count),
        deletedCount: asNumber(row.deleted_count),
      }
    })

  // نعرض المجموعات المعروفة الناقصة كصفوف صفرية بدل ما تختفي من الداشبورد.
  const present = new Set(dbRows.map((row) => row.id))
  const missingKnown = CONTENT_SETS.filter((meta) => !present.has(meta.id)).map(
    (meta): ContentSetRow => ({
      id: meta.id,
      title: meta.title,
      stamp: meta.stamp,
      sourceFile: meta.sourceFile,
      isUsed: meta.isUsed,
      version: "—",
      liveCount: 0,
      deletedCount: 0,
    })
  )

  const knownOrder = new Map(
    CONTENT_SETS.map((meta, index) => [meta.id, index])
  )
  return [...dbRows, ...missingKnown].sort((a, b) => {
    const aOrder = knownOrder.get(a.id) ?? Number.MAX_SAFE_INTEGER
    const bOrder = knownOrder.get(b.id) ?? Number.MAX_SAFE_INTEGER
    if (aOrder !== bOrder) return aOrder - bOrder
    return a.id.localeCompare(b.id)
  })
}

export async function getOverviewData(): Promise<OverviewData> {
  const [sets, lastUpdateRows, feedbackRows, notesRows] = await Promise.all([
    getContentSets(),
    query<{ last_updated: string | null }>(`
      select to_char(
        max(updated_at) at time zone 'UTC',
        'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"'
      ) as last_updated
      from questions
      where deleted_at is null
    `),
    query<{ open: string | number }>(
      `select count(*)::int as open from feedback where status = 'open'`
    ),
    query<{ total: string | number }>(
      `select count(*)::int as total from notes`
    ),
  ])

  const totalLive = sets.reduce((sum, set) => sum + set.liveCount, 0)
  const totalDeleted = sets.reduce((sum, set) => sum + set.deletedCount, 0)

  return {
    sets,
    totalLive,
    totalDeleted,
    lastContentUpdate: lastUpdateRows[0]?.last_updated ?? null,
    openFeedback: asNumber(feedbackRows[0]?.open),
    notesCount: asNumber(notesRows[0]?.total),
  }
}

/* ------------------------------------------------------------------ */
/* Questions                                                           */
/* ------------------------------------------------------------------ */

export interface QuestionsPageArgs {
  setId: ContentSetId
  query?: string
  category?: string | null
  page?: number
  pageSize?: number
}

export interface QuestionsPageData {
  rows: QuestionRow[]
  total: number
  page: number
  pageCount: number
  categories: CategoryCount[]
}

interface QuestionDbRow {
  id: string
  set_id: string
  external_id: string
  position: string | number
  text: string
  category: string | null
  correct_answer: string | null
  badge_label: string | null
  created_at: string
  updated_at: string
  deleted_at: string | null
}

const mapQuestion = (row: QuestionDbRow): QuestionRow => ({
  id: asText(row.id),
  setId: asText(row.set_id),
  externalId: asText(row.external_id),
  position: asNumber(row.position),
  text: asText(row.text),
  category: asNullableText(row.category),
  correctAnswer: asNullableText(row.correct_answer),
  badgeLabel: asNullableText(row.badge_label),
  createdAt: asText(row.created_at),
  updatedAt: asText(row.updated_at),
  deletedAt: asNullableText(row.deleted_at),
})

export async function getNextQuestionExternalId(
  setId: ContentSetId
): Promise<string> {
  await requireAdmin()
  await connection()
  const rows = (await getSql().query(
    `select coalesce(max(position), -1) + 1 as next_pos from questions where set_id = $1`,
    [setId]
  )) as Array<{ next_pos: number | string }>

  const nextPos = Number(rows[0]?.next_pos ?? 0)
  return String(Math.max(0, nextPos))
}

export async function getQuestionsPage({
  setId,
  query: search,
  category,
  page: requestedPage = 1,
  pageSize: requestedPageSize = 20,
}: QuestionsPageArgs): Promise<QuestionsPageData> {
  const pageSize = Math.min(
    Math.max(Math.trunc(requestedPageSize) || 20, 1),
    100
  )
  const conditions = ["set_id = $1", "deleted_at is null"]
  const params: unknown[] = [setId]

  const term = search?.trim()
  if (term) {
    params.push(term.toLowerCase())
    const index = params.length
    conditions.push(
      `(strpos(lower(text), $${index}) > 0
        or strpos(lower(external_id), $${index}) > 0
        or strpos(lower(coalesce(category, '')), $${index}) > 0
        or strpos(lower(coalesce(correct_answer, '')), $${index}) > 0
        or strpos(lower(coalesce(badge_label, '')), $${index}) > 0)`
    )
  }

  if (category && category !== "all") {
    params.push(category)
    conditions.push(`category = $${params.length}`)
  }

  const where = conditions.join(" and ")

  // قائمة الفئات مستقلة تمامًا عن العدّ والترقيم (بتعتمد على `setId` بس)،
  // فبنشغّلها مع العدّ في نفس الوقت بدل ما نستنى العدّ الأول. الصفوف نفسها
  // لسه بعدهم لأنها محتاجة `offset` المحسوب من `total`.
  const [countRows, categories] = await Promise.all([
    query<{ total: string | number }>(
      `select count(*)::int as total from questions where ${where}`,
      params
    ),
    query<{ category: string; count: string | number }>(
      `
        select category, count(*)::int as count
        from questions
        where set_id = $1
          and deleted_at is null
          and category is not null
          and btrim(category) <> ''
        group by category
        order by count desc, category asc
      `,
      [setId]
    ),
  ])

  const total = asNumber(countRows[0]?.total)
  const pageCount = Math.max(1, Math.ceil(total / pageSize))
  const page = Math.min(Math.max(Math.trunc(requestedPage) || 1, 1), pageCount)
  const offset = (page - 1) * pageSize

  const rows = await query<QuestionDbRow>(
    `
      select
        id::text as id,
        set_id,
        external_id,
        position,
        text,
        category,
        correct_answer,
        badge_label,
        to_char(created_at at time zone 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"') as created_at,
        to_char(updated_at at time zone 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"') as updated_at,
        to_char(deleted_at at time zone 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"') as deleted_at
      from questions
      where ${where}
      order by position asc
      limit $${params.length + 1} offset $${params.length + 2}
    `,
    [...params, pageSize, offset]
  )

  return {
    rows: rows.map(mapQuestion),
    total,
    page,
    pageCount,
    categories: categories.map((row) => ({
      category: row.category,
      count: asNumber(row.count),
    })),
  }
}

/* ------------------------------------------------------------------ */
/* Content health                                                      */
/* ------------------------------------------------------------------ */

interface HealthDbRow {
  id: string
  name: string
  version: string | number
  live: string | number
  deleted: string | number
  missing_category: string | number
  missing_correct_answer: string | number
  missing_badge_label: string | number
  empty_text: string | number
  duplicate_positions: string | number
  min_position: string | number | null
  max_position: string | number | null
}

interface DuplicateTextDbRow {
  set_id: string
  groups: string | number
  records: string | number
}

export async function getHealthReport(): Promise<HealthReport> {
  const [healthRows, duplicateRows] = await Promise.all([
    query<HealthDbRow>(`
      select
        cs.id,
        cs.name,
        cs.version,
        count(q.id) filter (where q.deleted_at is null)::int as live,
        count(q.id) filter (where q.deleted_at is not null)::int as deleted,
        count(q.id) filter (where q.deleted_at is null and (q.category is null or btrim(q.category) = ''))::int as missing_category,
        count(q.id) filter (where q.deleted_at is null and (q.correct_answer is null or btrim(q.correct_answer) = ''))::int as missing_correct_answer,
        count(q.id) filter (where q.deleted_at is null and (q.badge_label is null or btrim(q.badge_label) = ''))::int as missing_badge_label,
        count(q.id) filter (where q.deleted_at is null and btrim(q.text) = '')::int as empty_text,
        count(q.id) filter (where q.deleted_at is null)::int
          - count(distinct q.position) filter (where q.deleted_at is null)::int as duplicate_positions,
        min(q.position) filter (where q.deleted_at is null) as min_position,
        max(q.position) filter (where q.deleted_at is null) as max_position
      from content_sets cs
      left join questions q on q.set_id = cs.id
      group by cs.id, cs.name, cs.version
    `),
    query<DuplicateTextDbRow>(`
      select set_id, count(*)::int as groups, coalesce(sum(n), 0)::int as records
      from (
        select set_id, text, count(*)::int as n
        from questions
        where deleted_at is null
        group by set_id, text
        having count(*) > 1
      ) duplicates
      group by set_id
    `),
  ])

  const healthById = new Map(
    healthRows
      .filter((row) => isContentSetId(row.id))
      .map((row) => [row.id, row])
  )
  const duplicatesById = new Map(duplicateRows.map((row) => [row.set_id, row]))

  const dbSets: HealthSetRow[] = [...healthById.values()].map((row) => {
    const meta = getSetMeta(row.id, row.name)
    const duplicates = duplicatesById.get(row.id)
    const live = asNumber(row.live)
    const maxPosition =
      row.max_position == null ? null : asNumber(row.max_position)
    // لو كل العناصر الحية بترتيب 0..live-1 يبقى مفيش فراغات.
    const positionGaps =
      live === 0 || maxPosition === null
        ? 0
        : Math.max(0, maxPosition - live + 1)

    return {
      id: meta.id,
      title: meta.title,
      stamp: meta.stamp,
      sourceFile: meta.sourceFile,
      isUsed: meta.isUsed,
      version: String(row.version),
      liveCount: live,
      deletedCount: asNumber(row.deleted),
      missingCategory: asNumber(row.missing_category),
      missingCorrectAnswer: asNumber(row.missing_correct_answer),
      missingBadgeLabel: asNumber(row.missing_badge_label),
      emptyText: asNumber(row.empty_text),
      duplicatePositions: asNumber(row.duplicate_positions),
      positionGaps,
      duplicateTextGroups: duplicates ? asNumber(duplicates.groups) : 0,
      duplicateTextRecords: duplicates ? asNumber(duplicates.records) : 0,
    }
  })

  const present = new Set(dbSets.map((set) => set.id))
  const missingKnown: HealthSetRow[] = CONTENT_SETS.filter(
    (meta) => !present.has(meta.id)
  ).map((meta) => ({
    id: meta.id,
    title: meta.title,
    stamp: meta.stamp,
    sourceFile: meta.sourceFile,
    isUsed: meta.isUsed,
    version: "—",
    liveCount: 0,
    deletedCount: 0,
    missingCategory: 0,
    missingCorrectAnswer: 0,
    missingBadgeLabel: 0,
    emptyText: 0,
    duplicatePositions: 0,
    positionGaps: 0,
    duplicateTextGroups: 0,
    duplicateTextRecords: 0,
  }))

  const knownOrder = new Map(
    CONTENT_SETS.map((meta, index) => [meta.id, index])
  )
  const sets: HealthSetRow[] = [...dbSets, ...missingKnown].sort((a, b) => {
    const aOrder = knownOrder.get(a.id) ?? Number.MAX_SAFE_INTEGER
    const bOrder = knownOrder.get(b.id) ?? Number.MAX_SAFE_INTEGER
    if (aOrder !== bOrder) return aOrder - bOrder
    return a.id.localeCompare(b.id)
  })

  const findings: HealthFinding[] = []
  const addFinding = (finding: Omit<HealthFinding, "id">) => {
    findings.push({ ...finding, id: `finding-${findings.length + 1}` })
  }

  for (const meta of CONTENT_SETS) {
    if (!healthById.has(meta.id)) {
      addFinding({
        severity: "critical",
        setId: meta.id,
        title: `${meta.title}: مجموعة غير موجودة في Neon`,
        description:
          "المجموعة معرّفة في التطبيق لكن مفيش صف مقابل ليها في content_sets. أضف الصف أو راجع سبب حذفه.",
        count: 1,
      })
    }
  }

  for (const set of sets) {
    const meta = getSetMeta(set.id, set.title)

    if (set.emptyText > 0) {
      addFinding({
        severity: "critical",
        setId: set.id,
        title: `${set.title}: نصوص فاضية`,
        description: `${set.emptyText} عنصر نصه فاضي في قاعدة البيانات.`,
        count: set.emptyText,
      })
    }

    if (meta.hasCorrectAnswer && set.missingCorrectAnswer > 0) {
      addFinding({
        severity: "critical",
        setId: set.id,
        title: `${set.title}: إجابات ناقصة`,
        description: `${set.missingCorrectAnswer} عنصر من غير correct_answer.`,
        count: set.missingCorrectAnswer,
      })
    }

    if (meta.hasBadgeLabel && set.missingBadgeLabel > 0) {
      addFinding({
        severity: "warning",
        setId: set.id,
        title: `${set.title}: شارات ناقصة`,
        description: `${set.missingBadgeLabel} عنصر من غير badge_label.`,
        count: set.missingBadgeLabel,
      })
    }

    if (!meta.hasOptionalCategory && set.missingCategory > 0) {
      addFinding({
        severity: "warning",
        setId: set.id,
        title: `${set.title}: فئات ناقصة`,
        description: `${set.missingCategory} عنصر من غير category.`,
        count: set.missingCategory,
      })
    }

    if (set.duplicatePositions > 0) {
      addFinding({
        severity: "critical",
        setId: set.id,
        title: `${set.title}: ترتيب مكرر`,
        description: `${set.duplicatePositions} عنصر بيشارك نفس position مع عنصر تاني.`,
        count: set.duplicatePositions,
      })
    }

    if (set.positionGaps > 0) {
      addFinding({
        severity: "warning",
        setId: set.id,
        title: `${set.title}: فراغات في الترتيب`,
        description: `${set.positionGaps} موضع ناقص في تسلسل position للعناصر الحية.`,
        count: set.positionGaps,
      })
    }

    if (set.deletedCount > 0) {
      addFinding({
        severity: "info",
        setId: set.id,
        title: `${set.title}: عناصر محذوفة`,
        description: `${set.deletedCount} عنصر محذوف soft delete ومحفوظ للتاريخ.`,
        count: set.deletedCount,
      })
    }

    if (set.duplicateTextGroups > 0) {
      addFinding({
        severity: "info",
        setId: set.id,
        title: `${set.title}: نصوص مكررة`,
        description: `${set.duplicateTextGroups} مجموعة نص مكرر (${set.duplicateTextRecords} سجل). التكرار جزء من المصدر واتحفظ زي ما هو.`,
        count: set.duplicateTextRecords,
      })
    }
  }

  const severityCounts: Record<FindingSeverity, number> = {
    critical: 0,
    warning: 0,
    info: 0,
  }
  for (const finding of findings) severityCounts[finding.severity] += 1

  return {
    sets,
    findings,
    severityCounts,
    totals: {
      live: sets.reduce((sum, set) => sum + set.liveCount, 0),
      deleted: sets.reduce((sum, set) => sum + set.deletedCount, 0),
      duplicateTextGroups: sets.reduce(
        (sum, set) => sum + set.duplicateTextGroups,
        0
      ),
      duplicateTextRecords: sets.reduce(
        (sum, set) => sum + set.duplicateTextRecords,
        0
      ),
    },
  }
}
