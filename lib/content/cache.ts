/**
 * كاش المحتوى المحلي (IndexedDB).
 *
 * ليه IndexedDB مش localStorage:
 *   - آلاف الأسئلة (~3,181) أكبر بكتير من حدود localStorage وكمان بيقفل
 *     الـ main thread أثناء القراءة/الكتابة.
 *   - IndexedDB معاملات حقيقية (transactions) وإحكام ذرّي، وده بالظبط
 *     اللي محتاجينه عشان استبدال مجموعة محتوى من غير ما نكسر النسخة
 *     القديمة لو حصل أي فشل في النص.
 *
 * كل مجموعة بتتخزن كسجل واحد مستقل جوه store واحد. السجل الواحد معناه
 * إن كتابة مجموعة إما تنجح كلها أو تفشل كلها — مفيش حالة "نص مجموعة".
 *
 * الملف ده client-only: أي محاولة استخدامه من السيرفر بترجّع no-op بدل
 * ما ترمي، عشان الـ imports تفضل آمنة في أي مكان.
 */

import {
  CONTENT_SET_IDS,
  parseContentQuestion,
  type ContentQuestion,
  type ContentSetId,
} from "./types"

const DB_NAME = "qa3da-content"
const DB_VERSION = 1
const STORE_NAME = "sets"

export interface CachedContentSet {
  id: ContentSetId
  /** النسخة اللي المحتوى ده اتسجّل بيها — مصدر الحقيقة للمقارنة. */
  version: string
  questions: ContentQuestion[]
  /** وقت الحفظ (للتشخيص بس، مش بيأثر في القرارات). */
  savedAt: number
}

/** بيستخدمه المتصل عشان يعرف إذا الكاش متاح ولا لأ. */
export function isContentCacheSupported(): boolean {
  return typeof window !== "undefined" && typeof indexedDB !== "undefined"
}

/** اتصال واحد مشترك بقاعدة الكاش — بنفتحه مرة ونستخدمه للكل. */
let dbPromise: Promise<IDBDatabase> | null = null

function openDatabase(): Promise<IDBDatabase> {
  if (dbPromise) return dbPromise

  dbPromise = new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION)

    request.onupgradeneeded = () => {
      const db = request.result
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: "id" })
      }
    }

    request.onsuccess = () => {
      const db = request.result

      // لو اتصال تاني فتح نسخة أحدث أو المستخدم مسح التخزين، بنصفّر
      // الاتصال المخزّن عشان العملية الجاية تفتح من جديد.
      db.onclose = () => {
        dbPromise = null
      }
      db.onversionchange = () => {
        db.close()
        dbPromise = null
      }

      resolve(db)
    }

    request.onerror = () => {
      dbPromise = null
      reject(request.error)
    }
    // حالة متصفح بيمنع التخزين (private mode مثلًا) — بنفشل بهدوء.
    request.onblocked = () => {
      dbPromise = null
      reject(new Error("content cache blocked"))
    }
  })

  return dbPromise
}

function promisify<T>(request: IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
}

/**
 * تشغيل عملية على الـ store. بيتعامل مع أي خطأ في الفتح أو في الـ
 * transaction بإنه يرجّع الفشل، من غير ما يرمي في وش المتصل.
 *
 * ملاحظة مهمة: **ما بنقفلش الاتصال** بعد كل عملية. فيه عمليات قراءة
 * (من `useContentSet`) بتحصل في نفس وقت عمليات كتابة (من المزامنة)،
 * وقفل اتصال أثناء معاملة تانية بيقدر يلغيها. اتصال واحد مشترك بيشيل
 * المشكلة دي من أصلها.
 */
async function withStore<T>(
  mode: IDBTransactionMode,
  run: (store: IDBObjectStore) => Promise<T> | T
): Promise<{ ok: true; value: T } | { ok: false }> {
  if (!isContentCacheSupported()) return { ok: false }

  try {
    const db = await openDatabase()
    const transaction = db.transaction(STORE_NAME, mode)
    const store = transaction.objectStore(STORE_NAME)

    const value = await run(store)

    // بنستنى الـ transaction تخلص (commit) قبل ما نعتبر العملية ناجحة،
    // عشان النسخة ما تتسجّلش قبل ما المحتوى يتحفظ فعلًا.
    await new Promise<void>((resolve, reject) => {
      transaction.oncomplete = () => resolve()
      transaction.onerror = () => reject(transaction.error)
      transaction.onabort = () => reject(transaction.error)
    })

    return { ok: true, value }
  } catch {
    return { ok: false }
  }
}

/**
 * التحقق من سجل كاش واحد (ممكن يكون قديم أو تالف من نسخة سابقة).
 * بيرجّع `null` لو السجل مش صالح للاستخدام.
 */
function parseCachedSet(value: unknown): CachedContentSet | null {
  if (typeof value !== "object" || value === null) return null

  const record = value as Record<string, unknown>

  if (
    typeof record.id !== "string" ||
    !(CONTENT_SET_IDS as readonly string[]).includes(record.id)
  ) {
    return null
  }
  if (typeof record.version !== "string" || record.version === "") return null
  if (!Array.isArray(record.questions) || record.questions.length === 0) {
    return null
  }

  const questions: ContentQuestion[] = []
  const seen = new Set<string>()

  for (const raw of record.questions) {
    const question = parseContentQuestion(raw)
    if (!question) return null
    if (seen.has(question.id)) return null
    seen.add(question.id)
    questions.push(question)
  }

  return {
    id: record.id as ContentSetId,
    version: record.version,
    questions,
    savedAt: typeof record.savedAt === "number" ? record.savedAt : 0,
  }
}

/** نسخة المحتوى المخزّنة لمجموعة واحدة، أو `null` لو مفيش سجل صالح. */
export async function readCachedSet(
  id: ContentSetId
): Promise<CachedContentSet | null> {
  const result = await withStore("readonly", (store) =>
    promisify(store.get(id))
  )

  if (!result.ok) return null
  return parseCachedSet(result.value)
}

/** نسخ كل المجموعات المخزّنة — للفحص السريع قبل التنزيل. */
export async function readCachedVersions(): Promise<
  Partial<Record<ContentSetId, string>>
> {
  const result = await withStore("readonly", async (store) => {
    const ids = await promisify(store.getAllKeys())
    const values = await promisify(store.getAll())
    void ids

    const versions: Partial<Record<ContentSetId, string>> = {}
    for (const value of values) {
      const record = parseCachedSet(value)
      if (record) versions[record.id] = record.version
    }
    return versions
  })

  return result.ok ? result.value : {}
}

/**
 * حفظ مجموعة كاملة والنسخة بتاعتها في معاملة واحدة.
 *
 * السجل واحد جوه store واحد، والكتابة بتتم عبر `put` واحد، والنسخة
 * بتتسجّل مع نفس المحتوى بالظبط. لو أي حاجة فشلت (فشل الكتابة، امتلاء
 * المساحة، إغلاق المتصفح) الـ transaction بتترجع (abort) والسجل القديم
 * بيفضل زي ما هو.
 */
export async function writeCachedSet(set: CachedContentSet): Promise<boolean> {
  // دفاع إضافي: نرفض أي مجموعة فاضية أو مكرّرة قبل ما توصل للكاش.
  if (set.questions.length === 0) return false
  if (new Set(set.questions.map((q) => q.id)).size !== set.questions.length) {
    return false
  }

  const result = await withStore("readwrite", (store) =>
    promisify(
      store.put({
        id: set.id,
        version: set.version,
        questions: set.questions,
        savedAt: Date.now(),
      })
    )
  )

  return result.ok
}

/** حذف سجل مجموعة (يُستخدم عند التنظيف فقط). */
export async function deleteCachedSet(id: ContentSetId): Promise<boolean> {
  const result = await withStore("readwrite", (store) =>
    promisify(store.delete(id))
  )
  return result.ok
}

/**
 * تصفير الاتصال المشترك. للاختبارات بس: لما بيتمسح الـ database من
 * تحتنا، الاتصال المخزّن بيبقى لنسخة مش موجودة.
 *
 * @internal
 */
export function resetContentCacheConnection(): void {
  dbPromise = null
}
