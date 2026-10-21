#!/usr/bin/env tsx
/**
 * content-ids — read-only audit / safe migration of `id` fields in one content file.
 *
 * Usage:
 *   pnpm content:ids -- contents/topics.ts
 *   pnpm content:ids -- contents/topics.ts --write
 *   pnpm content:ids -- contents/topics.ts --write --out mapping.txt
 *   pnpm content:ids -- --help
 *
 * - Default mode is dry-run: reads the file and prints a proposed migration report.
 * - `--write` applies the migration to the specified target file only. A backup
 *   copy `<target>.idbak-<timestamp>` is created next to it before any write.
 * - `--out <path>` also writes the full old-to-new mapping (every item) to the
 *   explicitly given path, for retention ahead of the later database import.
 *
 * Policy:
 *   1. Normalization = trimming leading/trailing whitespace only. No other rewrite.
 *   2. Already-valid ids (no surrounding whitespace, no collisions) are preserved
 *      byte-for-byte.
 *   3. Collision group (same id after normalization):
 *        - the item whose raw id already equals the normalized value keeps it;
 *          if none qualifies, the first item in file order takes the value;
 *        - remaining items receive deterministic suffixes `base-2`, `base-3`, ...
 *          in file order, skipping any value that already exists in the file.
 *   - Original ids are preserved in the mapping report so per-item identity and
 *     traceability survive the migration. Items with the same normalized id are
 *     NOT assumed to be duplicates — nothing is merged or deleted.
 */

import * as fs from "node:fs"
import ts from "typescript"

const USAGE = `Usage:
  pnpm content:ids -- <path-to-content.ts>
  pnpm content:ids <path-to-content.ts> --write
  pnpm content:ids <path-to-content.ts> --write --out <mapping.txt>

Default is a dry-run audit. --write applies the migration to the target only.
`

interface ItemInfo {
  /** position of the item inside the exported array */
  index: number
  /** decoded id value (escapes resolved by the compiler) */
  raw: string
  /** quote character used for this literal in the source */
  quote: string
  /** source offsets of the string literal token (inclusive of quotes) */
  start: number
  end: number
}

interface Extraction {
  constName: string
  typeName: string | null
  items: ItemInfo[]
}

function die(message: string): never {
  console.error(message)
  process.exit(1)
}

/* ------------------------------------------------------------------ *
 * Extraction (TypeScript compiler API)                                *
 * ------------------------------------------------------------------ */

function extract(sourceText: string, fileLabel: string): Extraction {
  const sf = ts.createSourceFile(fileLabel, sourceText, ts.ScriptTarget.ES2022, true)

  const exportedArrayDeclarations: ts.VariableDeclaration[] = []

  sf.forEachChild((node) => {
    if (!ts.isVariableStatement(node)) return
    const isExported =
      node.modifiers?.some((modifier) => modifier.kind === ts.SyntaxKind.ExportKeyword) ?? false
    if (!isExported) return

    for (const declaration of node.declarationList.declarations) {
      if (declaration.initializer && ts.isArrayLiteralExpression(declaration.initializer)) {
        exportedArrayDeclarations.push(declaration)
      }
    }
  })

  if (exportedArrayDeclarations.length === 0) {
    die(`[error] ${fileLabel}: no exported const holding an array literal — unsupported file.`)
  }
  if (exportedArrayDeclarations.length > 1) {
    const names = exportedArrayDeclarations.map((declaration) => declaration.name.getText(sf)).join(", ")
    die(
      `[error] ${fileLabel}: ambiguous source — ${exportedArrayDeclarations.length} exported arrays found (${names}). Refusing to guess.`
    )
  }

  const declaration = exportedArrayDeclarations[0]
  const constName = declaration.name.getText(sf)
  const typeName = declaration.type
    ? declaration.type.getText(sf).replace(/\[\s*\]$/, "")
    : null

  const items: ItemInfo[] = []
  const elements = (declaration.initializer as ts.ArrayLiteralExpression).elements

  elements.forEach((element, index) => {
    if (!ts.isObjectLiteralExpression(element)) {
      die(
        `[error] ${fileLabel}: element #${index} is not an object literal (spread or other expression) — unsupported structure.`
      )
    }

    const idProperty = element.properties.find(
      (property): property is ts.PropertyAssignment =>
        ts.isPropertyAssignment(property) && ts.isIdentifier(property.name) && property.name.text === "id"
    )

    if (!idProperty) {
      die(`[error] ${fileLabel}: element #${index} has no "id" property — unsupported structure.`)
    }
    if (!ts.isStringLiteral(idProperty.initializer)) {
      die(
        `[error] ${fileLabel}: element #${index} "id" is not a plain string literal — unsupported structure.`
      )
    }

    const literal = idProperty.initializer as ts.StringLiteral

    items.push({
      index,
      raw: literal.text,
      quote: sourceText[literal.getStart(sf)],
      start: literal.getStart(sf),
      end: literal.getEnd(),
    })
  })

  return { constName, typeName, items }
}

/* ------------------------------------------------------------------ *
 * Migration plan                                                      *
 * ------------------------------------------------------------------ */

const normalize = (value: string) => value.trim()

const MAX_PRINTED_CHANGES = 60

interface Plan {
  newIds: string[]
  changedIndexes: Set<number>
  whitespaceCount: number
  exactDuplicateItems: number
  collisionGroupCount: number
  collisionItemCount: number
}

function buildPlan(items: ItemInfo[]): Plan {
  const normalizedList = items.map((item) => normalize(item.raw))
  const existingNormalized = new Set(normalizedList)

  // groups keyed by normalized id, first-occurrence order preserved
  const groups = new Map<string, number[]>()
  normalizedList.forEach((value, index) => {
    const members = groups.get(value)
    if (members) members.push(index)
    else groups.set(value, [index])
  })

  const newIds: string[] = new Array<string>(items.length)
  const taken = new Set<string>()

  for (const [normalized, members] of groups) {
    // keeper: raw already clean, otherwise first item in file order
    const keeperIndex = members.find((member) => items[member].raw === normalized) ?? members[0]
    newIds[keeperIndex] = normalized
    taken.add(normalized)

    let suffixCounter = 1
    for (const member of members) {
      if (member === keeperIndex) continue
      let candidate = ""
      do {
        suffixCounter += 1
        candidate = `${normalized}-${suffixCounter}`
      } while (taken.has(candidate) || existingNormalized.has(candidate))
      newIds[member] = candidate
      taken.add(candidate)
    }
  }

  // plan sanity: non-empty, trimmed, globally unique
  for (let index = 0; index < newIds.length; index += 1) {
    const value = newIds[index]
    if (value === undefined) die("[internal] plan is missing an entry — aborting.")
    if (value.length === 0) die(`[internal] plan produced an empty id at #${index} — aborting.`)
    if (value !== normalize(value)) {
      die(`[internal] plan produced an id with surrounding whitespace at #${index} — aborting.`)
    }
  }
  if (new Set(newIds).size !== items.length) {
    die("[internal] plan produced duplicate ids — aborting.")
  }

  const changedIndexes = new Set<number>()
  items.forEach((item, index) => {
    if (item.raw !== newIds[index]) changedIndexes.add(index)
  })

  const exactRawCounts = new Map<string, number>()
  items.forEach((item) => {
    exactRawCounts.set(item.raw, (exactRawCounts.get(item.raw) ?? 0) + 1)
  })
  const exactDuplicateItems = [...exactRawCounts.values()]
    .filter((count) => count > 1)
    .reduce((sum, count) => sum + count, 0)

  const collisionGroups = [...groups.values()].filter((members) => members.length > 1)

  return {
    newIds,
    changedIndexes,
    whitespaceCount: items.filter((item) => item.raw !== normalize(item.raw)).length,
    exactDuplicateItems,
    collisionGroupCount: collisionGroups.length,
    collisionItemCount: collisionGroups.reduce((sum, members) => sum + members.length, 0),
  }
}

/* ------------------------------------------------------------------ *
 * Rewriting                                                           *
 * ------------------------------------------------------------------ */

function makeLiteral(quote: string, value: string): string {
  if (quote === "'") return "'" + value.replace(/\\/g, "\\\\").replace(/'/g, "\\'") + "'"
  if (quote === '"') return JSON.stringify(value)
  return die(`[internal] unsupported quote style: "${quote}"`)
}

function applyReplacements(source: string, items: ItemInfo[], newIds: string[]): string {
  const changes = items
    .map((item) => ({ item, newId: newIds[item.index] }))
    .filter((change) => change.item.raw !== change.newId)
    .sort((left, right) => right.item.start - left.item.start)

  let output = source
  for (const change of changes) {
    output =
      output.slice(0, change.item.start) +
      makeLiteral(change.item.quote, change.newId) +
      output.slice(change.item.end)
  }
  return output
}

/** Re-parse the candidate output and verify the result before any write. */
function validateOutput(
  original: Extraction,
  outputText: string,
  plan: Plan
): void {
  const label = "candidate-output"
  const candidate = extract(outputText, label)

  if (candidate.constName !== original.constName) {
    die("[validation] exported array name changed after rewrite — aborting.")
  }
  if ((candidate.typeName ?? null) !== (original.typeName ?? null)) {
    die("[validation] exported array type annotation changed after rewrite — aborting.")
  }
  if (candidate.items.length !== original.items.length) {
    die(
      `[validation] item count changed after rewrite (${original.items.length} -> ${candidate.items.length}) — aborting.`
    )
  }

  for (let index = 0; index < original.items.length; index += 1) {
    const actual = candidate.items[index].raw
    const expected = plan.newIds[index]
    if (actual !== expected) {
      die(
        `[validation] id mismatch at item #${index}: expected "${expected}", got "${actual}" — aborting.`
      )
    }
  }

  if (new Set(candidate.items.map((item) => item.raw)).size !== candidate.items.length) {
    die("[validation] duplicate ids remain after rewrite — aborting.")
  }
  for (const item of candidate.items) {
    if (item.raw.trim() !== item.raw || item.raw.length === 0) {
      die(`[validation] invalid id "${item.raw}" survives the rewrite — aborting.`)
    }
  }
}

/* ------------------------------------------------------------------ *
 * Reporting                                                           *
 * ------------------------------------------------------------------ */

function printReport(
  target: string,
  extraction: Extraction,
  plan: Plan,
  write: boolean
): void {
  const total = extraction.items.length
  const changedCount = plan.changedIndexes.size

  console.log(`File: ${target}`)
  console.log(
    `Exported array: ${extraction.constName}${extraction.typeName ? `: ${extraction.typeName}[]` : ""} (${total} items)`
  )
  console.log("")
  console.log("Findings")
  console.log(`  ids with leading/trailing whitespace : ${plan.whitespaceCount}`)
  console.log(`  items sharing an exact duplicate id  : ${plan.exactDuplicateItems}`)
  console.log(
    `  collisions after normalization       : ${plan.collisionGroupCount} groups / ${plan.collisionItemCount} items`
  )
  console.log("")
  console.log("Policy: trim whitespace; first clean occurrence keeps the value; remaining")
  console.log("colliding items get deterministic suffixes base-2, base-3, ... in file order.")
  console.log("Nothing is merged or deleted; originals are kept in the mapping report.")
  console.log("")

  if (changedCount === 0) {
    console.log("Proposed changes: 0 — file ids are already normalized and unique.")
  } else {
    console.log(`Proposed changes: ${changedCount} of ${total} items`)
    console.log("")
    console.log("Mapping (old -> new), changed items only:")
    const changedItems = extraction.items.filter((item) => plan.changedIndexes.has(item.index))
    changedItems.slice(0, MAX_PRINTED_CHANGES).forEach((item) => {
      console.log(
        `  #${String(item.index).padStart(4)}  ${JSON.stringify(item.raw)} -> ${JSON.stringify(plan.newIds[item.index])}`
      )
    })
    if (changedItems.length > MAX_PRINTED_CHANGES) {
      console.log(`  ... and ${changedItems.length - MAX_PRINTED_CHANGES} more (use --out to save the full mapping)`)
    }
  }
  console.log("")

  if (write) {
    console.log(`Mode: --write (a backup is created next to the target before writing)`)
  } else {
    console.log(`Mode: dry-run — no file was modified.`)
  }
}

function writeMappingFile(
  outPath: string,
  extraction: Extraction,
  plan: Plan
): void {
  const lines: string[] = []
  lines.push("# content-ids mapping report")
  lines.push(`# exported array: ${extraction.constName}${extraction.typeName ? `: ${extraction.typeName}[]` : ""}`)
  lines.push(`# total items: ${extraction.items.length}; changed: ${plan.changedIndexes.size}`)
  lines.push("#\tindex\told\tnew\tstatus")
  extraction.items.forEach((item) => {
    const status = plan.changedIndexes.has(item.index) ? "renamed" : "same"
    lines.push(`\t${item.index}\t${JSON.stringify(item.raw)}\t${JSON.stringify(plan.newIds[item.index])}\t${status}`)
  })
  fs.writeFileSync(outPath, lines.join("\n") + "\n", "utf8")
}

/* ------------------------------------------------------------------ *
 * CLI                                                                 *
 * ------------------------------------------------------------------ */

function main(): void {
  const args = process.argv.slice(2)
  if (args.length === 0 || args.includes("--help")) {
    console.log(USAGE)
    process.exit(args.length === 0 ? 1 : 0)
  }

// pnpm >= 7 forwards everything after the script name verbatim, so a bare `--`
// can reach us (from `pnpm content:ids -- file.ts`). Skip it.
const positionalArgs = args.filter((arg) => arg !== "--")

let target: string | null = null
let applyWrite = false
let outPath: string | null = null

for (let i = 0; i < positionalArgs.length; i += 1) {
    const arg = positionalArgs[i]
    if (arg === "--write") {
      applyWrite = true
    } else if (arg === "--out") {
      outPath = positionalArgs[i + 1]
      if (!outPath) die("[error] --out requires a file path.")
      i += 1
    } else if (arg.startsWith("--")) {
      die(`[error] unknown option: ${arg}\n\n${USAGE}`)
    } else if (target === null) {
      target = arg
    } else {
      die(`[error] unexpected extra argument: ${arg}\n\n${USAGE}`)
    }
  }

  if (!target) die(`[error] missing target file.\n\n${USAGE}`)
  if (!target.endsWith(".ts")) die(`[error] unsupported input "${target}": expected a .ts content file.`)
  if (!fs.existsSync(target) || !fs.statSync(target).isFile()) {
    die(`[error] target file not found: ${target}`)
  }

  if (outPath && fs.existsSync(outPath) && fs.statSync(outPath).isDirectory()) {
    die(`[error] --out path is an existing directory: ${outPath}`)
  }

  const originalText = fs.readFileSync(target, "utf8")
  const extraction = extract(originalText, target)
  const plan = buildPlan(extraction.items)

  printReport(target, extraction, plan, applyWrite)

  if (outPath) {
    writeMappingFile(outPath, extraction, plan)
    console.log(`Mapping report saved to: ${outPath}`)
  }

  if (!applyWrite) return
  if (plan.changedIndexes.size === 0) {
    console.log("Nothing to write — file is already clean (migration is idempotent).")
    return
  }

  const outputText = applyReplacements(originalText, extraction.items, plan.newIds)
  validateOutput(extraction, outputText, plan)

  const stamp = new Date().toISOString().replace(/[:.]/g, "-")
  const backupPath = `${target}.idbak-${stamp}`
  if (fs.existsSync(backupPath)) {
    die(`[error] backup path already exists, refusing to overwrite: ${backupPath}`)
  }

  fs.copyFileSync(target, backupPath)

  try {
    fs.writeFileSync(target, outputText, "utf8")
  } catch (error) {
    // fail-safe: restore the original content rather than leaving a partial write
    fs.writeFileSync(target, originalText, "utf8")
    die(`[error] write failed, target restored to original: ${String(error)}`)
  }

  console.log("")
  console.log(`Migration applied: ${target}`)
  console.log(`Items preserved: ${extraction.items.length} (no item was merged or deleted)`)
  console.log(`Ids changed: ${plan.changedIndexes.size}; unchanged: ${extraction.items.length - plan.changedIndexes.size}`)
  console.log(`Backup created: ${backupPath}`)

  // post-write self-check by re-reading and re-validating from disk
  const written = fs.readFileSync(target, "utf8")
  const writtenExtraction = extract(written, target)
  const writtenPlan = buildPlan(writtenExtraction.items)
  if (writtenPlan.changedIndexes.size !== 0) {
    die(`[error] post-write check reports remaining issues (${writtenPlan.changedIndexes.size}) — inspect the backup.`)
  }
  console.log("Post-write self-check: ids are normalized and unique. A second run is a no-op.")
}

main()
