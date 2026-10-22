"use client"

import { CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"

interface FeedbackSuccessProps {
  onReset: () => void
}

export function FeedbackSuccess({ onReset }: FeedbackSuccessProps) {
  return (
    <section
      className="border-2 border-ink bg-paper-warm p-6 text-center shadow-[6px_6px_0_var(--color-ink)]"
      role="status"
    >
      <span className="mx-auto flex size-14 items-center justify-center border-2 border-ink bg-copper text-paper shadow-[3px_3px_0_var(--color-ink)]">
        <CheckCircle2 className="size-7" />
      </span>

      <h2 className="mt-4 text-xl font-black text-ink">وصلتنا رسالتك</h2>

      <p className="mt-2 text-xs leading-6 font-semibold text-ink-soft">
        شكرًا إنك ساعدتنا نخلي القعدة أحلى. الرسالة وصلت لفريق المطوّر، ولو حطيت
        بيانات تواصل ممكن نرد عليك.
      </p>

      <Button className="mt-5 w-full" onClick={onReset}>
        ابعت رسالة تانية
      </Button>
    </section>
  )
}
