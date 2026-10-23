"use client"

import { useTheme } from "next-themes"
import { useEffect, useState } from "react"
import { Switch } from "@/components/ui/switch"

function GeneralSettings() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true)
  }, [])

  const isDark = mounted && theme === "dark"

  return (
    <section className="flex flex-col gap-3">
      <div className="flex flex-col gap-1">
        <h2 className="text-lg font-black">عام</h2>
        <p className="text-sm font-semibold text-ink-soft">
          إعدادات التطبيق الحالية.
        </p>
      </div>

      <div className="flex items-center justify-between gap-4 rounded-md border-2 border-ink bg-card p-4 shadow-[4px_4px_0_var(--color-ink)]">
        <div className="min-w-0">
          <p className="text-sm font-bold text-foreground">الوضع الليلي</p>
          <p className="mt-1 text-xs font-semibold text-ink-soft">
            {mounted
              ? isDark
                ? "الوضع الداكن مفعّل"
                : "الوضع الفاتح مفعّل"
              : "جارٍ تحميل الإعدادات..."}
          </p>
        </div>

        <Switch
          checked={isDark}
          id="theme-toggle"
          disabled={!mounted}
          onCheckedChange={(checked) => setTheme(checked ? "dark" : "light")}
        />
      </div>

      <p className="text-xs leading-6 font-semibold text-ink-soft">
        تغيير الثيم اللوني ملوش دعوة بالوضع الليلي، براحتك خالص ظبط ألوانك على
        كيفك! ✨{" "}
      </p>
    </section>
  )
}

export default GeneralSettings
