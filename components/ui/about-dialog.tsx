"use client"

import { Info, Coffee, Code2, Globe, GitBranch, ArrowLeft } from "lucide-react"

import { AppDialog } from "./AppDialog"
import Link from "next/link"

type AboutDialogProps = {
  version: string
}

export function AboutDialog({ version }: AboutDialogProps) {
  return (
    <AppDialog
      className="p-0"
      trigger={
        <button
          type="button"
          className="group flex w-full items-start gap-3 rounded-md border-2 border-ink bg-card p-4 text-right shadow-[4px_4px_0_var(--color-ink)] transition-all hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[6px_6px_0_var(--color-ink)] focus-visible:ring-2 focus-visible:ring-copper focus-visible:ring-offset-2 focus-visible:outline-none active:translate-x-0.5 active:translate-y-0.5 active:shadow-none"
        >
          <span className="flex size-9 shrink-0 items-center justify-center border border-ink/20 bg-paper-warm/40">
            <Info className="size-4 text-ink-soft group-hover:text-ink" />
          </span>

          <span className="flex min-w-0 flex-1 flex-col gap-1">
            <span className="flex items-center justify-between gap-3">
              <span className="text-sm font-black text-foreground">القعدة</span>
              <span className="border border-copper/30 bg-copper/10 px-1.5 py-0.5 font-mono text-xs font-bold text-copper">
                v{version}
              </span>
            </span>

            <span className="text-xs leading-relaxed font-semibold text-ink-soft">
              تطبيق اجتماعي مصري للشلة على القهوة أو في أي قعدة. يعمل بدون
              إنترنت.
            </span>

            <span className="mt-1 inline-flex items-center gap-1 text-xs font-bold text-copper group-hover:underline">
              اعرف حكاية القعدة
              <ArrowLeft className="size-3.5 transition-transform group-hover:-translate-x-1" />
            </span>
          </span>
        </button>
      }
      title={
        <div className="flex items-center gap-2">
          <Coffee className="size-5 text-copper" />
          <span>عن القعدة</span>
        </div>
      }
      subtitle="كل قعدة ولها حكاية"
    >
      <div className="flex flex-col gap-5 pt-1">
        {/* App Banner Card */}
        <div className="flex items-center justify-between gap-3 rounded-md border-2 border-ink bg-paper-warm p-3.5 shadow-[3px_3px_0_var(--color-ink)]">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex size-11 shrink-0 items-center justify-center rounded-md border-2 border-ink bg-paper shadow-[2px_2px_0_var(--color-ink)]">
              <Coffee className="size-5 text-copper" />
            </div>

            <div className="min-w-0">
              <h3 className="text-base font-black text-foreground">القعدة</h3>
              <p className="truncate text-xs font-semibold text-ink-soft">
                ضحك ولعب وذكريات مع الشلة
              </p>
            </div>
          </div>

          <span className="shrink-0 border border-ink/20 bg-paper px-2 py-0.5 font-mono text-[11px] font-bold text-ink-soft">
            v{version}
          </span>
        </div>

        {/* Story Section */}
        <section className="flex flex-col gap-2">
          <h3 className="flex items-center gap-2 text-xs font-bold tracking-wider text-ink-soft uppercase">
            <Info className="size-4 text-copper" />
            كيف بدأت الحكاية؟
          </h3>

          <p className="rounded-md border border-ink/10 bg-paper-warm/30 p-3 text-xs leading-relaxed font-semibold text-ink-soft">
            القعدة تطبيق ويب اجتماعي مصري مُصمم لجمع الشلة حول الألعاب والأسئلة
            والضحك في أي مكان. يعمل بالكامل بدون اتصال بالإنترنت لتستمر التجربة
            حتى في حال انقطاع الشبكة.
          </p>
        </section>

        {/* Developer Section */}
        <section className="flex flex-col gap-2">
          <h3 className="flex items-center gap-2 text-xs font-bold tracking-wider text-ink-soft uppercase">
            <Code2 className="size-4 text-copper" />
            التطوير
          </h3>

          <div className="rounded-md border-2 border-ink bg-card p-3.5 shadow-[2px_2px_0_var(--color-ink)]">
            <p className="text-sm font-black text-foreground">
              Abdulrahman Saad Hassan
            </p>
            <p className="mt-0.5 text-xs font-semibold text-ink-soft">
              Frontend Engineer · Project Developer
            </p>

            <div className="mt-3 flex flex-wrap gap-2">
              <Link
                href="https://github.com/AbdulrahmanSE2003"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 rounded-md border-2 border-ink bg-paper px-3 py-1.5 text-xs font-bold text-foreground shadow-[2px_2px_0_var(--color-ink)] transition-all hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[3px_3px_0_var(--color-ink)] focus-visible:ring-2 focus-visible:ring-copper focus-visible:outline-none active:translate-x-0.5 active:translate-y-0.5 active:shadow-none"
              >
                <GitBranch className="size-3.5" />
                GitHub
              </Link>

              <Link
                href="https://mnmlst-dev.vercel.app"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 rounded-md border-2 border-ink bg-paper px-3 py-1.5 text-xs font-bold text-foreground shadow-[2px_2px_0_var(--color-ink)] transition-all hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[3px_3px_0_var(--color-ink)] focus-visible:ring-2 focus-visible:ring-copper focus-visible:outline-none active:translate-x-0.5 active:translate-y-0.5 active:shadow-none"
              >
                <Globe className="size-3.5 text-copper" />
                الموقع الشخصي
              </Link>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="flex flex-col items-center gap-1 border-t border-ink/10 pt-4 text-center">
          <p className="text-[11px] font-semibold text-ink-soft">
            اجمعوا الشلة، والباقي على القعدة.
          </p>
        </footer>
      </div>
    </AppDialog>
  )
}
