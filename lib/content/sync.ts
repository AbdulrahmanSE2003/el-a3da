/**
 * منسّق مزامنة المحتوى.
 *
 * مسؤول عن: قراءة النسخ المحلية → جلب نسخ السيرفر → مقارنة → تنزيل
 * المجموعات اللي اتغيّرت بس → التحقق → التفعيل الآمن.
 *
 * الملف ده مستقل تمامًا عن محرّك اللعبة وعن الداشبورد، وما بيعرفش حاجة
 * عن أي UI. أي failures بترجع كـ نتيجة منظّمة بدل ما ترمي للـ caller.
 */

import {
  parseContentSetResponse,
  parseContentVersionsResponse,
  type ContentSetId,
} from "./types"
import {
  readCachedVersions,
  writeCachedSet,
  isContentCacheSupported,
} from "./cache"

export type SyncSetStatus =
  | "updated"
  | "unchanged"
  | "invalid-payload"
  | "fetch-failed"
  | "cache-write-failed"

export interface SyncSetResult {
  id: ContentSetId
  status: SyncSetStatus
  /** النسخة اللي بقت فعّالة محليًا بعد العملية (لو معروفة). */
  version?: string
}

export interface SyncResult {
  ok: boolean
  /** true لو الفحص نفسه فشل (أوفلاين/النسخ ما وصلتش). */
  skipped: boolean
  sets: SyncSetResult[]
}

const VERSIONS_URL = "/api/content/versions"
const SET_URL = (id: ContentSetId) =>
  `/api/content/sets/${encodeURIComponent(id)}`

/** مهلة الطلب — من غيرها ممكن الطلب يعلّق على شبكة سيئة. */
const REQUEST_TIMEOUT_MS = 10_000

/**
 * أقل مدة بين فحصين متتاليين لما الشبكة تكون فشلت.
 * بيمنع "retry storm" على اتصال غير مستقر لما الـ app يرجع foreground
 * أو الـ online event يتكرر.
 */
const FAILURE_COOLDOWN_MS = 60_000

let inFlight: Promise<SyncResult> | null = null
let lastAttemptAt = 0
let lastAttemptFailed = false

/** محاولات إضافية للفشل المؤقت (5xx/timeout/شبكة) — بإجمالي 3 محاولات. */
const TRANSIENT_RETRIES = 2
/** أساس الـ backoff بين المحاولات المؤقتة. */
const RETRY_BASE_DELAY_MS = 400

type FetchOutcome =
  | { kind: "ok"; data: unknown }
  /** فشل مؤقت: شبكة، timeout، أو 5xx — يستحق إعادة محاولة. */
  | { kind: "transient" }
  /** فشل دائم: 4xx — إعادة المحاولة مش هتفرق. */
  | { kind: "permanent"; status: number }

/** ردود 5xx أو 429 مؤقتة بطبيعتها؛ الباقي من 4xx دائم. */
function isTransientStatus(status: number): boolean {
  return status >= 500 || status === 408 || status === 429
}

async function fetchOnce(url: string): Promise<FetchOutcome> {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS)

  try {
    const response = await fetch(url, {
      // لازم نتخطى كاش الـ service worker والكاش الوسيط: نسخة قديمة
      // معناها قرار مزامنة غلط.
      cache: "no-store",
      signal: controller.signal,
      headers: { Accept: "application/json" },
    })

    if (!response.ok) {
      return isTransientStatus(response.status)
        ? { kind: "transient" }
        : { kind: "permanent", status: response.status }
    }

    // جسم مالوش معنى (مش JSON) يعتبر فشل دائم للمحتوى ده، مش مؤقت.
    try {
      return { kind: "ok", data: (await response.json()) as unknown }
    } catch {
      return { kind: "permanent", status: response.status }
    }
  } catch {
    // أخطاء الشبكة و AbortError مؤقتة.
    return { kind: "transient" }
  } finally {
    clearTimeout(timeout)
  }
}

const sleep = (ms: number) =>
  new Promise<void>((resolve) => setTimeout(resolve, ms))

/**
 * جلب JSON مع إعادة محاولة محدودة للفشل المؤقت بس.
 *
 * الهدف: ما نعتبرش رد 503 أو timeout محتوى تالف، وما نضيّعش محاولة
 * المزامنة كلها بسببها. الفشل الدائم (4xx) ما بيتعادش.
 */
async function fetchJson(url: string): Promise<FetchOutcome> {
  let outcome = await fetchOnce(url)

  for (let attempt = 0; attempt < TRANSIENT_RETRIES; attempt++) {
    if (outcome.kind !== "transient") return outcome
    // backoff بسيط: 400ms ثم 800ms.
    await sleep(RETRY_BASE_DELAY_MS * 2 ** attempt)
    outcome = await fetchOnce(url)
  }

  return outcome
}

async function runSync(): Promise<SyncResult> {
  if (!isContentCacheSupported()) {
    return {
      ok: false,
      skipped: true,
      sets: [],
    }
  }

  const versionsOutcome = await fetchJson(VERSIONS_URL)
  const remote =
    versionsOutcome.kind === "ok"
      ? parseContentVersionsResponse(versionsOutcome.data)
      : null

  if (!remote) {
    return { ok: false, skipped: true, sets: [] }
  }

  const localVersions = await readCachedVersions()
  const results: SyncSetResult[] = []

  for (const remoteSet of remote.sets) {
    const { id, version } = remoteSet
    const localVersion = localVersions[id]

    // المجموعة سليمة محليًا وبنفس النسخة → مننزّلهاش تاني.
    if (localVersion === version) {
      results.push({ id, status: "unchanged", version })
      continue
    }

    const payloadOutcome = await fetchJson(SET_URL(id))

    // فشل مؤقت أو دائم على مستوى الطلب: بنسيب آخر نسخة سليمة زي ما هي
    // وبنرجّع حالة `fetch-failed` (مش `invalid-payload`).
    if (payloadOutcome.kind !== "ok") {
      results.push({ id, status: "fetch-failed", version: localVersion })
      continue
    }

    const payload = parseContentSetResponse(payloadOutcome.data, id)

    // رد وصل بس شكله تالف أو ناقص: نفس القاعدة — آخر نسخة سليمة بتفضل.
    if (!payload) {
      results.push({ id, status: "invalid-payload", version: localVersion })
      continue
    }

    // نفس النسخة اللي وصلتنا (نادرة: اتغيّرت بين الفحص والتنزيل) —
    // بنعتبرها غير متغيرة لو المحتوى عندنا بنفس النسخة.
    if (payload.version === localVersion) {
      results.push({ id, status: "unchanged", version: localVersion })
      continue
    }

    const written = await writeCachedSet({
      id: payload.id,
      version: payload.version,
      questions: payload.questions,
      savedAt: Date.now(),
    })

    results.push({
      id,
      status: written ? "updated" : "cache-write-failed",
      // لو الكتابة فشلت، النسخة الفعّالة لسه القديمة.
      version: written ? payload.version : localVersion,
    })
  }

  return {
    ok: results.every(
      (r) =>
        r.status !== "invalid-payload" &&
        r.status !== "cache-write-failed" &&
        r.status !== "fetch-failed"
    ),
    skipped: false,
    sets: results,
  }
}

/**
 * فحص وتحديث المحتوى. نداءات متزامنة بتتدمج في نفس العملية الجارية.
 *
 * البدء من `ContentSyncBootstrap` بيتم عند الإقلاع وعند رجوع التطبيق
 * للواجهة وعند رجوع الشبكة؛ الـ cooldown بيمنع تكرار المحاولات الفاشلة.
 */
export function syncContent(options?: {
  force?: boolean
}): Promise<SyncResult> {
  if (inFlight) return inFlight

  const now = Date.now()
  if (
    !options?.force &&
    lastAttemptFailed &&
    now - lastAttemptAt < FAILURE_COOLDOWN_MS
  ) {
    return Promise.resolve({ ok: false, skipped: true, sets: [] })
  }

  const promise = (async () => {
    lastAttemptAt = Date.now()
    const result = await runSync()
    lastAttemptFailed = result.skipped || !result.ok
    return result
  })()

  inFlight = promise

  // بنصفّر الـ in-flight بعد ما تخلص، عشان أي نداء جديد يبدأ من جديد.
  promise.finally(() => {
    if (inFlight === promise) inFlight = null
  })

  return promise
}

/** إعادة ضبط الحالة الداخلية — للتشخيص/الاختبارات فقط. */
export function resetContentSyncState(): void {
  inFlight = null
  lastAttemptAt = 0
  lastAttemptFailed = false
}
