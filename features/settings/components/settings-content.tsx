"use client"

import { AppearanceSection } from "./appearance-section"
import { Info, Music, Volume2 } from "lucide-react"
import packageJson from "@/package.json"
import GeneralSettings from "./GeneralSetting"
import { AboutDialog } from "@/components/ui/about-dialog"

export function SettingsContent() {
  const version = packageJson.version

  return (
    <div className="flex flex-col gap-6">
      {/* Appearance */}
      <AppearanceSection />

      {/* General */}
      <GeneralSettings />

      {/* Sound */}
      <section className="flex flex-col gap-3">
        <div className="flex flex-col gap-1">
          <h2 className="text-lg font-black">الصوت والأجواء</h2>
          <p className="text-sm font-semibold text-ink-soft">
            لسه عالرمالة — قريب جداً 🎧{" "}
          </p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="flex items-center gap-3 rounded-md border-2 border-ink bg-card p-4 opacity-70 shadow-[4px_4px_0_var(--color-ink)]">
            <div className="flex size-9 items-center justify-center border border-ink/20">
              <Volume2 className="size-4 text-ink-soft" />
            </div>
            <div className="flex flex-1 flex-col">
              <span className="text-sm font-black">صوتيات القهوة (قريباً)</span>
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
              <span className="text-sm font-black">راديو القهوة</span>
              <span className="text-xs font-semibold text-ink-soft">
                قريباً
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* About */}
      <section className="flex flex-col gap-3">
        <div className="flex flex-col gap-1">
          <h2 className="text-lg font-black">حكاية القعدة ☕</h2>
        </div>
        <AboutDialog version={version} />
      </section>
    </div>
  )
}
