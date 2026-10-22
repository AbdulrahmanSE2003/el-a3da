import type { Metadata } from "next"
import { SettingsContent } from "@/features/settings/components/settings-content"
import Header from "@/components/layout/Header"
import HomeBottomNav from "@/components/layout/HomeBottomNav"
import BackgroundAtmosphere from "@/components/atmosphere/BackgroundAtmosphere"
import GridPattern from "@/components/atmosphere/GridPattern"

export const metadata: Metadata = {
  title: "الإعدادات — القعدة",
  description: "إعدادات المظهر والثيم في تطبيق القعدة.",
}

export default function SettingsPage() {
  return (
    <main className="relative min-h-dvh overflow-hidden bg-paper px-5 py-6 pb-24 text-ink">
      <GridPattern />
      <BackgroundAtmosphere />
      <div className="relative z-10 mx-auto flex w-full max-w-md flex-col">
        <Header stamp="SETTINGS" />
        <header className="mb-8 flex flex-col gap-2">
          <p className="text-xs font-black tracking-[0.25em] text-copper">
            SETTINGS
          </p>
          <h1 className="text-3xl font-black tracking-tight">الإعدادات</h1>
          <p className="text-sm leading-relaxed font-semibold text-ink-soft">
            تخصيص مظهر التطبيق، مع الحفاظ على الوضع الليلي/الفاتح الحالي.
          </p>
        </header>

        <SettingsContent />
      </div>
      <HomeBottomNav />
    </main>
  )
}
