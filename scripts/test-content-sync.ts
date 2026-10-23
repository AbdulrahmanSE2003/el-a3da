#!/usr/bin/env tsx
/**
 * test-content-sync — tests for the content sync lifecycle.
 *
 * The project has no test runner, so this follows the repo's scripting
 * convention and runs with `tsx`. It installs a minimal in-memory
 * IndexedDB shim plus a controllable `fetch`, then exercises the real
 * `lib/content/sync.ts` and `lib/content/cache.ts` modules.
 *
 * Nothing here touches the network or the database.
 *
 * Usage:
 *   node --import tsx scripts/test-content-sync.ts
 */

/* ------------------------------------------------------------------ */
/* Minimal in-memory IndexedDB shim                                    */
/* ------------------------------------------------------------------ */

type Listener = (() => void) | null

interface FakeRequest<T> {
  result: T
  error: unknown
  onsuccess: Listener
  onerror: Listener
}

interface FakeTransaction {
  error: unknown
  oncomplete: Listener
  onerror: Listener
  onabort: Listener
}

class ShimStore {
  data = new Map<string, unknown>()
  constructor(public tx: ShimTransaction) {}

  get(key: string): FakeRequest<unknown> {
    return this.tx.schedule(() => this.data.get(key))
  }

  getAll(): FakeRequest<unknown[]> {
    return this.tx.schedule(() => [...this.data.values()])
  }

  getAllKeys(): FakeRequest<string[]> {
    return this.tx.schedule(() => [...this.data.keys()])
  }

  put(value: { id: string }): FakeRequest<{ id: string }> {
    return this.tx.schedule(() => {
      this.data.set(value.id, structuredClone(value))
      return value
    })
  }

  delete(key: string): FakeRequest<undefined> {
    return this.tx.schedule(() => {
      this.data.delete(key)
      return undefined
    })
  }
}

class ShimTransaction implements FakeTransaction {
  error: unknown = null
  oncomplete: Listener = null
  onerror: Listener = null
  onabort: Listener = null

  private pending = 0
  private settled = false

  constructor(
    private store: ShimStore | null,
    public failWrites = false
  ) {}

  attach(store: ShimStore) {
    this.store = store
  }

  /** يحاكي `IDBTransaction.objectStore(name)`. */
  objectStore(name: string): ShimStore {
    if (!this.store) throw new Error(`transaction has no store (${name})`)
    return this.store
  }

  schedule<T>(fn: () => T): FakeRequest<T> {
    this.pending++
    this.settled = false

    const request: FakeRequest<T> = {
      result: undefined as unknown as T,
      error: null,
      onsuccess: null,
      onerror: null,
    }

    const settle = () => {
      if (this.failWrites) {
        request.error = new Error("simulated write failure")
        this.error = request.error
        request.onerror?.()
        this.finish()
        return
      }
      try {
        request.result = fn()
        request.onsuccess?.()
      } catch (error) {
        request.error = error
        this.error = error
        request.onerror?.()
      }
      this.finish()
    }

    // Defer so the caller can attach onsuccess/onerror handlers.
    setTimeout(settle, 0)

    return request
  }

  private finish() {
    this.pending--
    if (this.pending > 0 || this.settled) return
    this.settled = true

    // Let `withStore` attach its handlers before we report the outcome.
    setTimeout(() => {
      if (this.error) {
        this.onerror?.()
        this.onabort?.()
      } else {
        this.oncomplete?.()
      }
    }, 0)
  }
}

class ShimDatabase {
  stores = new Map<string, ShimStore>()
  objectStoreNames = {
    contains: (name: string) => this.stores.has(name),
  }

  createObjectStore(name: string) {
    const store = new ShimStore(new ShimTransaction(null))
    this.stores.set(name, store)
    return store
  }

  transaction(name: string, mode: string): ShimTransaction {
    const store = this.stores.get(name)
    if (!store) throw new Error(`no store ${name}`)
    // A fresh transaction per call, sharing the same underlying data.
    const tx = new ShimTransaction(store)
    // Only writes can be made to fail; reads stay reliable.
    tx.failWrites = nextFailWrites && mode === "readwrite"
    store.tx = tx
    return tx
  }

  close() {}
}

const databases = new Map<string, ShimDatabase>()
let nextFailWrites = false

const fakeIndexedDB = {
  open(name: string): FakeRequest<ShimDatabase> {
    const request = {
      result: undefined as unknown as ShimDatabase,
      error: null,
      onsuccess: null as Listener,
      onerror: null as Listener,
      onupgradeneeded: null as Listener,
      onblocked: null as Listener,
    }

    setTimeout(() => {
      let db = databases.get(name)
      const isNew = !db
      if (!db) {
        db = new ShimDatabase()
        databases.set(name, db)
      }

      if (isNew) {
        request.result = db
        request.onupgradeneeded?.()
      }

      if (nextFailWrites) {
        for (const store of db.stores.values()) {
          store.tx.failWrites = true
        }
      }

      request.result = db
      request.onsuccess?.()
    }, 0)

    return request as unknown as FakeRequest<ShimDatabase>
  },
}

/* ------------------------------------------------------------------ */
/* Controllable fetch                                                  */
/* ------------------------------------------------------------------ */

interface FakeSet {
  id: string
  version: string
  questions: Array<Record<string, unknown>>
}

let remoteVersions: Record<string, string> = {}
let remoteSets: Record<string, FakeSet> = {}
let versionRequestCount = 0
let setRequestCount = 0
let failNetwork = false
/** عدد ردود 503 المؤقتة المطلوب إرجاعها قبل النجاح، لكل مجموعة. */
let transientPlan: Record<string, number> = {}

function installFetch() {
  globalThis.fetch = (async (input: RequestInfo | URL) => {
    const url = typeof input === "string" ? input : input.toString()

    if (failNetwork) throw new Error("network down")

    if (url.includes("/api/content/versions")) {
      versionRequestCount++
      return jsonResponse({
        sets: Object.entries(remoteVersions).map(([id, version]) => ({
          id,
          version,
        })),
      })
    }

    const match = url.match(/\/api\/content\/sets\/([^/?]+)/)
    if (match) {
      setRequestCount++
      const id = match[1]
      if (transientPlan[id] > 0) {
        transientPlan[id]--
        return jsonResponse({ error: "service unavailable" }, 503)
      }
      const set = remoteSets[id]
      if (!set) return jsonResponse({ error: "not found" }, 404)
      return jsonResponse(set)
    }

    return jsonResponse({ error: "unexpected" }, 404)
  }) as typeof fetch
}

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  })
}

/* ------------------------------------------------------------------ */
/* Test harness                                                        */
/* ------------------------------------------------------------------ */

let failures = 0
let passes = 0

function check(label: string, ok: boolean, detail = "") {
  if (ok) {
    passes++
    console.log(`  ✓ ${label}`)
  } else {
    failures++
    console.log(`  ✗ ${label}${detail ? ` — ${detail}` : ""}`)
  }
}

function makeSet(
  id: string,
  version: string,
  count: number,
  corrupt = false
): FakeSet {
  const questions = Array.from({ length: count }, (_, i) => ({
    id: `${id}-${i}`,
    text: `${id} question ${i}`,
    category: "cat",
    ...(corrupt && i === 0 ? { text: 123 } : {}),
  }))
  return { id, version, questions }
}

const SET_IDS = [
  "casino",
  "topics",
  "challenges",
  "sheikh",
  "zad",
  "punishments",
]

function resetRemote(
  versions: Record<string, string>,
  counts: Record<string, number>
) {
  remoteVersions = { ...versions }
  remoteSets = {}
  for (const id of SET_IDS) {
    remoteSets[id] = makeSet(id, versions[id], counts[id] ?? 3)
  }
  versionRequestCount = 0
  setRequestCount = 0
  failNetwork = false
  transientPlan = {}
}

async function resetDatabase() {
  databases.clear()
  nextFailWrites = false
}

/* ------------------------------------------------------------------ */
/* Import real modules after the shims are installed                   */
/* ------------------------------------------------------------------ */

async function loadModules() {
  // @ts-expect-error assigning a shim to the global
  globalThis.indexedDB = fakeIndexedDB
  // window/indexedDB presence makes the cache consider itself supported.
  // @ts-expect-error minimal window shim
  globalThis.window = { indexedDB: fakeIndexedDB }

  const cache = await import("../lib/content/cache")
  const sync = await import("../lib/content/sync")
  const types = await import("../lib/content/types")
  const provider = await import("../lib/content/provider")
  return { cache, sync, types, provider }
}

async function main() {
  installFetch()
  const { cache, sync, types, provider } = await loadModules()

  const versions = {
    casino: "10",
    topics: "20",
    challenges: "30",
    sheikh: "40",
    zad: "50",
    punishments: "60",
  }
  const counts = {
    casino: 5,
    topics: 5,
    challenges: 5,
    sheikh: 5,
    zad: 5,
    punishments: 5,
  }

  console.log("\n1) Fresh install with no cache loads and caches all sets")
  await resetDatabase()
  resetRemote(versions, counts)
  sync.resetContentSyncState()
  let result = await sync.syncContent({ force: true })
  check("sync reported ok", result.ok, JSON.stringify(result.sets))
  check("no sets skipped", !result.skipped)
  check(
    "all six sets updated",
    result.sets.length === 6 &&
      result.sets.every((s) => s.status === "updated"),
    JSON.stringify(result.sets.map((s) => `${s.id}:${s.status}`))
  )
  const cachedAll = await cache.readCachedVersions()
  check(
    "cache holds all six versions",
    SET_IDS.every(
      (id) =>
        cachedAll[id as keyof typeof cachedAll] ===
        versions[id as keyof typeof versions]
    ),
    JSON.stringify(cachedAll)
  )
  check(
    "downloaded exactly six sets",
    setRequestCount === 6,
    `got ${setRequestCount}`
  )

  console.log("\n2) Second sync with unchanged versions downloads nothing")
  resetRemote(versions, counts)
  sync.resetContentSyncState()
  result = await sync.syncContent({ force: true })
  check(
    "all sets unchanged",
    result.sets.every((s) => s.status === "unchanged")
  )
  check(
    "content endpoint was not called",
    setRequestCount === 0,
    `got ${setRequestCount}`
  )

  console.log("\n3) One changed version downloads only that set")
  resetRemote({ ...versions, topics: "999" }, counts)
  sync.resetContentSyncState()
  result = await sync.syncContent({ force: true })
  const changed = result.sets.filter((s) => s.status === "updated")
  check(
    "exactly one set updated",
    changed.length === 1,
    JSON.stringify(changed)
  )
  check(
    "the updated set is topics",
    changed[0]?.id === "topics",
    changed[0]?.id
  )
  check(
    "only one content fetch",
    setRequestCount === 1,
    `got ${setRequestCount}`
  )
  const cachedTopics = await cache.readCachedSet("topics")
  check(
    "topics cache now has new version",
    cachedTopics?.version === "999",
    cachedTopics?.version
  )

  console.log(
    "\n4) A missing local dataset is repaired even when others are current"
  )
  // Re-establish a clean baseline so only the missing set is stale.
  resetRemote(versions, counts)
  sync.resetContentSyncState()
  await sync.syncContent({ force: true })
  await cache.deleteCachedSet("zad")
  resetRemote(versions, counts)
  sync.resetContentSyncState()
  result = await sync.syncContent({ force: true })
  const zadResult = result.sets.find((s) => s.id === "zad")
  check("zad repaired", zadResult?.status === "updated", zadResult?.status)
  check("only zad was fetched", setRequestCount === 1, `got ${setRequestCount}`)
  const zadCached = await cache.readCachedSet("zad")
  check(
    "zad cache exists again",
    !!zadCached && zadCached.questions.length === 5
  )

  console.log("\n5) Malformed response does not replace valid cached data")
  // Make a valid cache first.
  resetRemote({ ...versions, sheikh: "77" }, counts)
  sync.resetContentSyncState()
  await sync.syncContent({ force: true })
  const goodSheikh = await cache.readCachedSet("sheikh")
  check(
    "sheikh cached at 77",
    goodSheikh?.version === "77",
    goodSheikh?.version
  )

  // Now serve a malformed payload for a newer version.
  remoteVersions = { ...versions, sheikh: "78" }
  remoteSets.sheikh = {
    id: "sheikh",
    version: "78",
    questions: [{ id: "only-id" }],
  }
  sync.resetContentSyncState()
  result = await sync.syncContent({ force: true })
  const sheikhResult = result.sets.find((s) => s.id === "sheikh")
  check(
    "sheikh marked invalid-payload",
    sheikhResult?.status === "invalid-payload",
    sheikhResult?.status
  )
  check("sync reported not ok", !result.ok)
  const afterBadSheikh = await cache.readCachedSet("sheikh")
  check(
    "good sheikh data preserved",
    afterBadSheikh?.version === "77",
    afterBadSheikh?.version
  )
  check("sheikh question count intact", afterBadSheikh?.questions.length === 5)

  console.log("\n6) Failed write preserves the old dataset and version")
  resetRemote(versions, counts)
  sync.resetContentSyncState()
  result = await sync.syncContent({ force: true })
  check("baseline sync ok", result.ok)
  // Change a version and force writes to fail.
  remoteVersions = { ...versions, casino: "999" }
  remoteSets.casino = makeSet("casino", "999", 5)
  nextFailWrites = true
  sync.resetContentSyncState()
  result = await sync.syncContent({ force: true })
  const casinoResult = result.sets.find((s) => s.id === "casino")
  check(
    "casino write failure surfaced",
    casinoResult?.status === "cache-write-failed",
    casinoResult?.status
  )
  nextFailWrites = false
  const casinoAfter = await cache.readCachedSet("casino")
  check(
    "casino still has the old version",
    casinoAfter?.version === versions.casino,
    casinoAfter?.version
  )

  console.log("\n7) Concurrent sync requests are deduplicated")
  resetRemote({ ...versions, topics: "500" }, counts)
  sync.resetContentSyncState()
  setRequestCount = 0
  const a = sync.syncContent({ force: true })
  const b = sync.syncContent({ force: true })
  const c = sync.syncContent({ force: true })
  const [ra, rb, rc] = await Promise.all([a, b, c])
  check("all three calls share one result", ra === rb && rb === rc)
  check(
    "only one content fetch happened",
    setRequestCount === 1,
    `got ${setRequestCount}`
  )

  console.log("\n8) Offline sync does not destroy cache and reports skipped")
  resetRemote(versions, counts)
  sync.resetContentSyncState()
  await sync.syncContent({ force: true })
  const beforeOffline = await cache.readCachedVersions()
  failNetwork = true
  sync.resetContentSyncState()
  result = await sync.syncContent({ force: true })
  check("offline sync skipped", result.skipped)
  check("offline sync not ok", !result.ok)
  const afterOffline = await cache.readCachedVersions()
  check(
    "cache untouched while offline",
    JSON.stringify(beforeOffline) === JSON.stringify(afterOffline)
  )

  console.log("\n9) Cooldown prevents a tight retry loop after failure")
  sync.resetContentSyncState()
  failNetwork = true
  const firstFail = await sync.syncContent()
  check("first attempt runs and fails", firstFail.skipped === true)
  failNetwork = false
  versionRequestCount = 0
  const secondAttempt = await sync.syncContent() // no force → cooldown applies
  check(
    "second attempt is suppressed by cooldown",
    secondAttempt.skipped === true
  )
  check(
    "no network request during cooldown",
    versionRequestCount === 0,
    `got ${versionRequestCount}`
  )

  console.log("\n10) Parser rejects duplicate ids and unknown set ids")
  check(
    "duplicate ids rejected",
    types.parseContentSetResponse({
      id: "topics",
      version: "1",
      questions: [
        { id: "a", text: "one" },
        { id: "a", text: "two" },
      ],
    }) === null
  )
  check(
    "unknown set id rejected",
    types.parseContentSetResponse({
      id: "nope",
      version: "1",
      questions: [{ id: "a", text: "x" }],
    }) === null
  )
  check(
    "empty question list rejected",
    types.parseContentSetResponse({
      id: "topics",
      version: "1",
      questions: [],
    }) === null
  )
  check(
    "mismatched expected id rejected",
    types.parseContentSetResponse(
      { id: "topics", version: "1", questions: [{ id: "a", text: "x" }] },
      "casino"
    ) === null
  )

  console.log("\n11) Transient 503 is retried and eventually succeeds")
  await resetDatabase()
  cache.resetContentCacheConnection()
  resetRemote(versions, counts)
  transientPlan = { casino: 1 } // one 503, then success
  sync.resetContentSyncState()
  result = await sync.syncContent({ force: true })
  const casinoTransient = result.sets.find((s) => s.id === "casino")
  check(
    "casino recovered after retry",
    casinoTransient?.status === "updated",
    casinoTransient?.status
  )
  check(
    "casino was retried (2 requests)",
    setRequestCount === 7,
    `got ${setRequestCount}`
  )
  const casinoCached = await cache.readCachedSet("casino")
  check(
    "casino cached after retry",
    casinoCached?.version === "10",
    casinoCached?.version
  )

  console.log(
    "\n12) Persistent 5xx is reported as fetch-failed, cache preserved"
  )
  resetRemote(versions, counts)
  sync.resetContentSyncState()
  await sync.syncContent({ force: true })
  transientPlan = { topics: 99 } // always 503
  remoteVersions = { ...versions, topics: "999" }
  sync.resetContentSyncState()
  result = await sync.syncContent({ force: true })
  const topicsFailed = result.sets.find((s) => s.id === "topics")
  check(
    "topics reported fetch-failed",
    topicsFailed?.status === "fetch-failed",
    topicsFailed?.status
  )
  check("sync reported not ok", !result.ok)
  const topicsStillGood = await cache.readCachedSet("topics")
  check(
    "topics old version preserved",
    topicsStillGood?.version === "20",
    topicsStillGood?.version
  )

  console.log("\n13) Permanent 4xx is not retried")
  resetRemote(versions, counts)
  sync.resetContentSyncState()
  await sync.syncContent({ force: true })
  remoteVersions = { ...versions, zad: "777" }
  delete remoteSets.zad // -> 404
  setRequestCount = 0
  sync.resetContentSyncState()
  result = await sync.syncContent({ force: true })
  const zadFailed = result.sets.find((s) => s.id === "zad")
  check(
    "zad reported fetch-failed",
    zadFailed?.status === "fetch-failed",
    zadFailed?.status
  )
  check(
    "only one request for permanent failure",
    setRequestCount === 1,
    `got ${setRequestCount}`
  )
  const zadKept = await cache.readCachedSet("zad")
  check(
    "zad old version preserved",
    zadKept?.version === "50",
    zadKept?.version
  )

  console.log(
    "\n14) Provider uses the cached casino snapshot and bundled fallback"
  )
  await resetDatabase()
  cache.resetContentCacheConnection()

  const bundledCasino = await provider.loadContentSnapshot("casino")
  check(
    "bundled casino snapshot is used when cache is empty",
    bundledCasino.source === "bundled" && bundledCasino.version === null,
    `${bundledCasino.source}:${bundledCasino.version}`
  )
  check(
    "bundled casino snapshot is not empty",
    bundledCasino.questions.length > 0,
    String(bundledCasino.questions.length)
  )

  const seededWrite = await cache.writeCachedSet({
    id: "casino",
    version: "777",
    questions: [
      { id: "casino-0", text: "casino question 0", category: "cat" },
      { id: "casino-1", text: "casino question 1", category: "cat" },
    ],
    savedAt: Date.now(),
  })
  check("seeded casino cache record is written", seededWrite)

  const cachedCasino = await provider.loadContentSnapshot("casino")
  check(
    "cached casino snapshot is preferred over the bundle",
    cachedCasino.source === "cache" && cachedCasino.version === "777",
    `${cachedCasino.source}:${cachedCasino.version}`
  )
  check(
    "cached casino snapshot keeps its questions",
    cachedCasino.questions.length === 2 &&
      cachedCasino.questions[0].id === "casino-0" &&
      cachedCasino.questions[1].id === "casino-1",
    cachedCasino.questions.map((q) => q.id).join(",")
  )

  console.log(
    failures === 0
      ? `\nALL ${passes} CHECKS PASSED\n`
      : `\n${failures} CHECK(S) FAILED (${passes} passed)\n`
  )
  process.exit(failures === 0 ? 0 : 1)
}

main().catch((error) => {
  console.error("test-content-sync failed:", error)
  process.exit(1)
})
