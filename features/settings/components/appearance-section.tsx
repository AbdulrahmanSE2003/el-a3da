"use client"

import { Check } from "lucide-react"

import { useQa3daTheme } from "@/components/qa3da-theme-provider"
import { QA3DA_ACCENT_THEME_META, QA3DA_ACCENT_THEMES } from "@/lib/qa3da-theme"
import { cn } from "@/lib/utils"
import { THEME_STYLES } from "../constants"

function AppearanceSection() {
  const { theme, setTheme, mounted } = useQa3daTheme()

  return (
    <section className="space-y-4" aria-labelledby="appearance-heading">
      <div className="space-y-1">
        <h2 id="appearance-heading" className="text-sm font-black text-ink">
          شكل القعدة
        </h2>

        <p className="text-xs leading-6 text-ink-soft">
          اختار الهوية البصرية اللي تناسبك. تغيير الثيم مش هيغيّر اختيار الوضع
          الفاتح أو الداكن.
        </p>
      </div>

      {!mounted ? (
        <div className="grid grid-cols-1 gap-3" aria-hidden="true">
          {QA3DA_ACCENT_THEMES.map((value) => (
            <div
              key={value}
              className="h-28 animate-pulse rounded-md border border-ink/10"
            />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3">
          {QA3DA_ACCENT_THEMES.map((value) => {
            const meta = QA3DA_ACCENT_THEME_META[value]
            const style = THEME_STYLES[value]
            const selected = theme === value

            return (
              <button
                key={value}
                type="button"
                onClick={() => setTheme(value)}
                aria-pressed={selected}
                className={cn(
                  "w-full rounded-md border p-3 text-right transition-colors",
                  value === "cafe" ? "border-2" : "border",
                  selected ? "border-copper" : "border-ink/15",
                  "focus-visible:ring-2 focus-visible:ring-copper focus-visible:ring-offset-2 focus-visible:outline-none"
                )}
                style={{
                  borderRadius: style.radius,
                  boxShadow: selected ? style.shadow : "none",
                }}
              >
                <div className="flex items-start gap-3">
                  <div
                    aria-hidden="true"
                    className="flex h-20 w-24 shrink-0 flex-col justify-between border p-2"
                    style={{
                      backgroundColor: style.surface,
                      borderColor: style.border,
                      borderRadius: style.radius,
                      boxShadow: style.shadow,
                    }}
                  >
                    <div className="flex items-center gap-1">
                      <span
                        className="size-2"
                        style={{
                          backgroundColor: style.accent,
                          borderRadius: value === "cafe" ? "0" : "999px",
                        }}
                      />
                      <span
                        className="h-1 w-7"
                        style={{
                          backgroundColor: style.foreground,
                          opacity: 0.8,
                          borderRadius: style.radius,
                        }}
                      />
                    </div>

                    <div className="space-y-1">
                      <div
                        className="h-1.5 w-full"
                        style={{
                          backgroundColor: style.foreground,
                          borderRadius: style.radius,
                        }}
                      />
                      <div
                        className="h-1 w-2/3"
                        style={{
                          backgroundColor: style.muted,
                          borderRadius: style.radius,
                        }}
                      />
                    </div>

                    <div
                      className="h-2 w-8"
                      style={{
                        backgroundColor: style.accent,
                        borderRadius: style.radius,
                      }}
                    />
                  </div>

                  <div className="min-w-0 flex-1 space-y-1">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-sm font-black text-ink">
                        {meta.label}
                      </span>

                      {selected && (
                        <span className="flex size-6 shrink-0 items-center justify-center rounded-md bg-copper text-paper">
                          <Check className="size-3.5" />
                        </span>
                      )}
                    </div>

                    <p className="text-xs leading-5 text-ink-soft">
                      {meta.description}
                    </p>

                    <div className="flex items-center gap-1.5 pt-1">
                      {[style.surface, style.foreground, style.accent].map(
                        (color) => (
                          <span
                            key={color}
                            aria-hidden="true"
                            className="size-3.5 border border-ink/10"
                            style={{
                              backgroundColor: color,
                              borderRadius: style.radius,
                            }}
                          />
                        )
                      )}
                    </div>
                  </div>
                </div>
              </button>
            )
          })}
        </div>
      )}
    </section>
  )
}

export { AppearanceSection }
