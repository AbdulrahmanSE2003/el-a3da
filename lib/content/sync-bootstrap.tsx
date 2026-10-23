"use client"

/**
 * مشغّل المزامنة الصامت.
 *
 * بيبدأ المزامنة في تلات حالات بس:
 *   1. أول تشغيل (بعد ما الصفحة تبقى تفاعلية).
 *   2. لما التطبيق يرجع للواجهة بعد ما كان في الخلفية.
 *   3. لما الشبكة ترجع.
 *
 * ما بيتنفّذش أي polling أو timers، وما بيعرضش أي UI أو toast — الفشل
 * الصامت مقصود: اللاعب ما ينزعجش من مشكلة محتوى.
 *
 * مهم: ما بنوعدش بمزامنة والتطبيق مقفول تمامًا. الـ service worker هنا
 * بيخدم offline shell بس؛ المزامنة محتاجة الصفحة تكون حيّة.
 */

import { useEffect } from "react"

import { syncContent } from "./sync"

/** أقل مدة بين مزامنة عند العودة للواجهة — يمنع رجّة التبديل السريع. */
const VISIBILITY_COOLDOWN_MS = 30_000

let lastVisibilitySyncAt = 0

export function ContentSyncBootstrap() {
  useEffect(() => {
    // 1) التشغيل الأول. بنأجّله لميكروتاسك عشان ما يتزاحمش مع أول رسم.
    const initial = setTimeout(() => {
      void syncContent()
    }, 0)

    // 2) العودة للواجهة.
    const handleVisibility = () => {
      if (document.visibilityState !== "visible") return

      const now = Date.now()
      if (now - lastVisibilitySyncAt < VISIBILITY_COOLDOWN_MS) return
      lastVisibilitySyncAt = now

      void syncContent()
    }

    // 3) رجوع الشبكة. بنتجاهل تغييرات خروج الشبكة (offline event).
    const handleOnline = () => {
      void syncContent({ force: true })
    }

    document.addEventListener("visibilitychange", handleVisibility)
    window.addEventListener("online", handleOnline)

    return () => {
      clearTimeout(initial)
      document.removeEventListener("visibilitychange", handleVisibility)
      window.removeEventListener("online", handleOnline)
    }
  }, [])

  return null
}
