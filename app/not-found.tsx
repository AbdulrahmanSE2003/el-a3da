import Link from "next/link"
import { ArrowLeftIcon, FileQuestionIcon } from "lucide-react"

interface NotFoundProps {
  title?: string
  description?: string
  backLink?: string
  backLabel?: string
}

export default function NotFound({
  title = "الصفحة غير موجودة",
  description = "العنصر أو الصفحة التي تحاول الوصول إليها غير متاحة أو تم نقلها.",
  backLink = "/admin",
  backLabel = "العودة للوحة التحكم",
}: NotFoundProps) {
  return (
    <div className="flex min-h-90 w-full flex-col items-center justify-center gap-4 border-2 border-ink bg-paper-warm p-8 text-center shadow-[6px_6px_0_var(--color-ink)]">
      <div className="flex size-14 items-center justify-center border-2 border-ink bg-paper text-ink shadow-[3px_3px_0_var(--color-ink)]">
        <FileQuestionIcon className="size-7 text-copper" />
      </div>

      <div className="max-w-md">
        <span className="stamp-text">404 NOT FOUND</span>
        <h2 className="mt-1 text-xl font-black text-ink">{title}</h2>
        <p className="mt-2 text-xs leading-relaxed text-ink-soft">
          {description}
        </p>
      </div>

      <Link
        href={backLink}
        className="mt-2 inline-flex items-center gap-2 border-2 border-ink bg-paper px-4 py-2 text-xs font-bold text-ink shadow-[3px_3px_0_var(--color-ink)] transition-all hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[5px_5px_0_var(--color-ink)] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none"
      >
        <ArrowLeftIcon className="size-4" />
        {backLabel}
      </Link>
    </div>
  )
}
