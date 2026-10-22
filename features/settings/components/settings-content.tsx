"use client"

import { AppearanceSection } from "./appearance-section"
import { Info, Music, Volume2 } from "lucide-react"
import packageJson from "@/package.json"

export function SettingsContent() {
  const version = packageJson.version

  return (
    <div className="flex flex-col gap-6">
      <AppearanceSection />

      <section className="flex flex-col gap-3">
        <div className="flex flex-col gap-1">
          <h2 className="text-lg font-black">عام</h2>
          <p className="text-sm font-semibold text-ink-soft">
            إعدادات التطبيق الحالية.
          </p>
        </div>
        <div className="rounded-md border-2 border-ink bg-card p-4 shadow-[4px_4px_0_var(--color-ink)]">
          <p className="text-sm font-bold text-foreground">
            الوضع الليلي/الفاتح يتحكم فيه زر الترويسة ويعمل مع جميع الثيمات.
          </p>
          <p className="mt-1 text-xs font-semibold text-ink-soft">
            اختيار الثيم مستقل عن وضع الألوان ولا يعيده.
          </p>
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <div className="flex flex-col gap-1">
          <h2 className="text-lg font-black">الصوت والأجواء</h2>
          <p className="text-sm font-semibold text-ink-soft">
            قيد التطوير — placeholders فقط.
          </p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="flex items-center gap-3 rounded-md border-2 border-ink bg-card p-4 opacity-70 shadow-[4px_4px_0_var(--color-ink)]">
            <div className="flex size-9 items-center justify-center border border-ink/20">
              <Volume2 className="size-4 text-ink-soft" />
            </div>
            <div className="flex flex-1 flex-col">
              <span className="text-sm font-black">مؤثرات صوتية</span>
              <span className="text-xs font-semibold text-ink-soft">
                قريبًا
              </span>
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-md border-2 border-ink bg-card p-4 opacity-70 shadow-[4px_4px_0_var(--color-ink)]">
            <div className="flex size-9 items-center justify-center border border-ink/20">
              <Music className="size-4 text-ink-soft" />
            </div>
            <div className="flex flex-1 flex-col">
              <span className="text-sm font-black">موسيقى خلفية</span>
              <span className="text-xs font-semibold text-ink-soft">
                مستقبلًا
              </span>
            </div>
          </div>
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <div className="flex flex-col gap-1">
          <h2 className="text-lg font-black">عن التطبيق</h2>
        </div>
        <div className="flex items-start gap-3 rounded-md border-2 border-ink bg-card p-4 shadow-[4px_4px_0_var(--color-ink)]">
          <div className="flex size-9 items-center justify-center border border-ink/20">
            <Info className="size-4 text-ink-soft" />
          </div>
          <div className="flex flex-1 flex-col gap-1">
            <div className="flex items-center justify-between">
              <span className="text-sm font-black">القعدة</span>
              <span className="font-mono text-xs font-bold text-ink-soft">
                v{version}
              </span>
            </div>
            <p className="text-xs leading-relaxed font-semibold text-ink-soft">
              تطبيق ويب مصري اجتماعي للشلة على القهوة أو في أي قعدة. يدعم العمل
              بدون إنترنت.
            </p>
          </div>
        </div>
      </section>
    </div>
  )
}
