"use client"

import { AppearanceSection } from "./appearance-section"
import { Info, Music } from "lucide-react"
import packageJson from "@/package.json"
import GeneralSettings from "./GeneralSetting"
import { SoundSetting } from "./SoundSetting"
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
        <SoundSetting />
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
