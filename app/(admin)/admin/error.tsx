"use client"

import { useEffect } from "react"
import { RotateCcwIcon } from "lucide-react"

import { StatePanel, StateRetryButton } from "@/components/ui/state-panel"

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
    <StatePanel
      tone="danger"
      icon={RotateCcwIcon}
      stamp="DASHBOARD ERROR"
      title="تعذّر تحميل بيانات الداشبورد"
      description="حصل خطأ أثناء قراءة قاعدة البيانات. راجع اتصال Neon وإعداد DATABASE_URL على السيرفر. تفاصيل الاتصال مش بتتعرض في الواجهة."
      actions={
        <StateRetryButton onClick={retry} icon={RotateCcwIcon}>
          إعادة المحاولة
        </StateRetryButton>
      }
    />
  )
}
