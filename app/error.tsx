"use client"

import { useEffect } from "react"
import { AlertTriangleIcon, HomeIcon, RotateCcwIcon } from "lucide-react"

import {
  StateLinkButton,
  StatePanel,
  StatePanelDetails,
  StateRetryButton,
} from "@/components/ui/state-panel"

interface ErrorProps {
  error: Error & { digest?: string }
  reset: () => void
}

export default function ErrorPage({ error, reset }: ErrorProps) {
  useEffect(() => {
    console.error("App error:", error)
    console.error("Error digest:", error?.digest)
  }, [error])

  return (
    <StatePanel
      variant="full"
      tone="danger"
      icon={AlertTriangleIcon}
      stamp="SYSTEM ERROR"
      title="حدث خطأ غير متوقع"
      description="تعذر تحميل البيانات أو إكمال العملية المطلوبة. يمكنك المحاولة مرة أخرى، ولو المشكلة استمرت ارجع للصفحة الرئيسية."
      actions={
        <>
          <StateRetryButton onClick={reset} icon={RotateCcwIcon}>
            إعادة المحاولة
          </StateRetryButton>
          <StateLinkButton href="/" icon={HomeIcon}>
            العودة للرئيسية
          </StateLinkButton>
        </>
      }
    >
      {error?.digest && (
        <StatePanelDetails>
          <span className="text-ink-soft">رقم الخطأ: </span>
          {error.digest}
        </StatePanelDetails>
      )}
    </StatePanel>
  )
}
