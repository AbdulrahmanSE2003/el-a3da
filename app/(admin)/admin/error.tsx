"use client"

import { useEffect } from "react"
import { Button } from "@/components/ui/button"

export default function AdminError({
  error,
  retry,
}: {
  error: Error & { digest?: string }
  retry: () => void
}) {
  useEffect(() => {
    // من غير ما نطبع رسالة الخطأ كاملة — ممكن تحتوي تفاصيل اتصال قاعدة البيانات.
    console.error("Admin dashboard error", error.digest)
  }, [error.digest])

  return (
    <div className="flex flex-col items-center gap-4 border-2 border-danger-brand/40 bg-danger-brand/5 px-6 py-14 text-center">
      <p className="font-mono text-[10px] font-bold tracking-widest text-danger-brand">
        DASHBOARD ERROR
      </p>
      <h2 className="text-xl font-black text-ink">
        تعذّر تحميل بيانات الداشبورد
      </h2>
      <p className="max-w-lg text-xs leading-relaxed text-ink-soft">
        حصل خطأ أثناء قراءة قاعدة البيانات. راجع اتصال Neon وإعداد
        <code className="mx-1 font-mono" dir="ltr">
          DATABASE_URL
        </code>
        على السيرفر. تفاصيل الاتصال مش بتتعرض في الواجهة.
      </p>
      <Button variant="outline" size="sm" onClick={retry}>
        إعادة المحاولة
      </Button>
    </div>
  )
}
