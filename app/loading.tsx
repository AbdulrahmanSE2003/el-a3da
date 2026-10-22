import { Loader2Icon } from "lucide-react"

import { StatePanel } from "@/components/ui/state-panel"

interface LoadingProps {
  label?: string
}

/**
 * شاشة التحميل العامة. بتستخدم نفس StatePanel عشان تاخد نفس الطابع
 * على الموبايل، وكلها CSS خفيف (من غير JS) عشان تظهر فورًا.
 */
export default function Loading({
  label = "جاري تحضير القعدة...",
}: LoadingProps) {
  return (
    <StatePanel
      variant="full"
      tone="copper"
      icon={Loader2Icon}
      stamp="LOADING"
      title={label}
      description="استنى ثانية واحدة بس وكل حاجة هتكون جاهزة."
    >
      <div className="relative w-full max-w-md space-y-2.5" aria-hidden>
        <div className="h-3 w-1/3 animate-pulse bg-ink/10" />
        <div className="h-3 w-full animate-pulse bg-ink/10" />
        <div className="h-3 w-4/5 animate-pulse bg-ink/10" />
      </div>

      <div
        className="relative grid w-full grid-cols-2 gap-2 sm:grid-cols-3"
        aria-hidden
      >
        {Array.from({ length: 3 }).map((_, index) => (
          <div
            key={index}
            className="h-16 animate-pulse border-2 border-ink/15 bg-paper sm:h-20"
          />
        ))}
      </div>
    </StatePanel>
  )
}
