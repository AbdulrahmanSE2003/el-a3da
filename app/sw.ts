import { defaultCache } from "@serwist/next/worker"
import { NetworkOnly } from "serwist"
import type { PrecacheEntry, RuntimeCaching } from "serwist"
import { Serwist } from "serwist"

declare const self: ServiceWorkerGlobalScope & {
  __SW_MANIFEST: (string | PrecacheEntry)[] | undefined
}

/**
 * قواعد كاش مزامنة المحتوى.
 *
 * `defaultCache` بتخزّن كل طلبات `/api/` بنفس الأصل بـ NetworkFirst،
 * وده خطر هنا: لو نسخة المحتوى اتحفظت في كاش الـ service worker، ممكن
 * الفحص يرجّع نسخة قديمة من غير ما يوصل للسيرفر — فنعتبر المحتوى متزامن
 * وهو مش متزامن.
 *
 * القاعدة دي بتتقدّم قبل قواعد `/api/` العامة وبتخلي طلبات `/api/content/`
 * تروح للشبكة بس. الكاش المحلي (IndexedDB) هو المسؤول عن اللعب offline،
 * مش كاش الـ service worker.
 */
const contentSyncCache: RuntimeCaching = {
  matcher: ({ url: { pathname }, sameOrigin }) =>
    sameOrigin && pathname.startsWith("/api/content/"),
  handler: new NetworkOnly(),
}

const serwist = new Serwist({
  precacheEntries: self.__SW_MANIFEST,
  skipWaiting: true,
  clientsClaim: true,
  navigationPreload: true,
  runtimeCaching: [contentSyncCache, ...defaultCache],
})

serwist.addEventListeners()
