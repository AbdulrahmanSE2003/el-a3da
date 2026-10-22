import type { LucideIcon } from "lucide-react"

import { cn } from "@/lib/utils"

type StateTone = "ink" | "copper" | "danger"

const TONES: Record<StateTone, { icon: string; stamp: string }> = {
  ink: {
    icon: "border-ink bg-paper text-ink",
    stamp: "text-ink-soft",
  },
  copper: {
    icon: "border-ink bg-copper/15 text-copper",
    stamp: "text-copper",
  },
  danger: {
    icon: "border-ink bg-danger-brand/10 text-danger-brand",
    stamp: "text-danger-brand",
  },
}

interface StatePanelProps {
  icon: LucideIcon
  stamp?: string
  title: string
  description?: string
  /** أزرار أو روابط الإجراءات تحت الرسالة. */
  actions?: React.ReactNode
  /** محتوى إضافي اختياري (مثل تفاصيل الخطأ) داخل صندوق متمرّر. */
  children?: React.ReactNode
  tone?: StateTone
  /** full: بيملأ الشاشة مع نمط الخلفية — مناسب لصفحات error/404 العامة. */
  variant?: "card" | "full"
  className?: string
}

/**
 * الشكل الموحّد لحالات loading / error / not-found.
 *
 * - على الشاشات الكبيرة (sm وفوق): كارت بسيط زي ما هو.
 * - على الموبايل: نفس الرسالة بطابع "لعبة" أكتر — رقم كبير في الخلفية
 *   (watermark) وألوان أقوى، عشان تتماشى مع باقي المنصة.
 *
 * كل المقاسات بتتحسب على أقل عرض عملي (320px)، ومفيش أي عرض ثابت.
 */
export function StatePanel({
  icon: Icon,
  stamp,
  title,
  description,
  actions,
  children,
  tone = "ink",
  variant = "card",
  className,
}: StatePanelProps) {
  const isFull = variant === "full"
  const palette = TONES[tone]

  return (
    <div
      className={cn(
        "relative flex w-full items-center justify-center px-3 py-8 sm:px-6 sm:py-12",
        isFull && "min-h-dvh overflow-hidden",
        className
      )}
    >
      {isFull && (
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage:
              "radial-gradient(var(--color-ink) 1.5px, transparent 1.5px)",
            backgroundSize: "18px 18px",
          }}
        />
      )}

      <div
        className={cn(
          "relative z-10 mx-auto flex w-full max-w-md flex-col items-center gap-4 border-2 border-ink bg-paper-warm p-5 text-center shadow-[5px_5px_0_var(--color-ink)] sm:gap-5 sm:p-8 sm:shadow-[6px_6px_0_var(--color-ink)]",
          !isFull && "min-h-[min(70dvh,28rem)] justify-center"
        )}
      >
        {/* زخرفة الموبايل بس: شبكة + رقم عملاق في الخلفية (طابع لعبة). */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 overflow-hidden sm:hidden"
        >
          <div
            className="absolute inset-0 opacity-[0.05]"
            style={{
              backgroundImage:
                "radial-gradient(var(--color-ink) 1.5px, transparent 1.5px)",
              backgroundSize: "14px 14px",
            }}
          />
          {stamp && (
            <span className="absolute -bottom-6 -left-3 font-mono text-[6.5rem] leading-none font-black text-ink-glow/5 select-none">
              {stamp.split(" ")[0]}
            </span>
          )}
        </div>

        <div
          className={cn(
            "relative flex size-12 shrink-0 items-center justify-center border-2 shadow-[3px_3px_0_var(--color-ink)] sm:size-14 sm:shadow-[3px_3px_0_var(--color-ink)]",
            palette.icon
          )}
        >
          <Icon className="size-6 sm:size-7" />
          {/* نبضة خفيفة حوالين الأيقونة على الموبايل بس. */}
          <span
            aria-hidden
            className="absolute inset-0 animate-ping border-2 border-copper/25 sm:hidden"
          />
        </div>

        <div className="relative w-full max-w-md">
          {stamp && (
            <p
              className={cn(
                "font-mono text-[10px] font-bold tracking-widest break-words sm:text-xs",
                palette.stamp
              )}
            >
              {stamp}
            </p>
          )}

          <h2 className="mt-1 text-xl leading-snug font-black text-balance text-ink sm:text-xl">
            {title}
          </h2>

          {description && (
            <p className="mt-2 text-xs leading-relaxed text-pretty text-ink-soft sm:text-sm">
              {description}
            </p>
          )}
        </div>

        {children}

        {actions && (
          <div className="relative mt-1 flex w-full flex-col items-stretch gap-2 sm:w-auto sm:flex-row sm:items-center sm:justify-center">
            {actions}
          </div>
        )}
      </div>
    </div>
  )
}

/** صندوق تفاصيل تقني (رسالة خطأ، digest، كود). */
export function StatePanelDetails({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative w-full max-w-md overflow-x-auto border border-ink/20 bg-paper px-3 py-2 text-start font-mono text-[11px] leading-relaxed break-words text-danger-brand">
      {children}
    </div>
  )
}

/** زر إعادة المحاولة الموحّد — بيستخدم ألوان الخطر. */
export function StateRetryButton({
  onClick,
  icon: Icon,
  children,
  disabled,
}: {
  onClick: () => void
  icon?: LucideIcon
  children: React.ReactNode
  disabled?: boolean
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="inline-flex w-full items-center justify-center gap-2 border-2 border-ink bg-danger-brand px-4 py-2.5 text-sm font-bold text-paper shadow-[3px_3px_0_var(--color-ink)] transition-all hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[5px_5px_0_var(--color-ink)] focus-visible:ring-[3px] focus-visible:ring-copper/50 focus-visible:outline-none active:translate-x-0.5 active:translate-y-0.5 active:shadow-none disabled:pointer-events-none disabled:opacity-60 sm:w-auto sm:text-xs"
    >
      {Icon && <Icon className="size-4" />}
      {children}
    </button>
  )
}

/** رابط إجراء ثانوي (زي "العودة للرئيسية") بنفس ستايل الزر المفرّغ. */
export function StateLinkButton({
  href,
  icon: Icon,
  children,
}: {
  href: string
  icon?: LucideIcon
  children: React.ReactNode
}) {
  return (
    <a
      href={href}
      className="inline-flex w-full items-center justify-center gap-2 border-2 border-ink bg-paper px-4 py-2.5 text-sm font-bold text-ink shadow-[3px_3px_0_var(--color-ink)] transition-all hover:-translate-x-0.5 hover:-translate-y-0.5 hover:bg-paper-warm hover:shadow-[5px_5px_0_var(--color-ink)] focus-visible:ring-[3px] focus-visible:ring-copper/50 focus-visible:outline-none active:translate-x-0.5 active:translate-y-0.5 active:shadow-none sm:w-auto sm:text-xs"
    >
      {Icon && <Icon className="size-4 shrink-0" />}
      {children}
    </a>
  )
}
