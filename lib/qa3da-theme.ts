export type Qa3daAccentTheme =
  "cafe" | "original-green" | "night-blue" | "ember-red" | "velvet-purple"

export const QA3DA_ACCENT_THEMES: Qa3daAccentTheme[] = [
  "cafe",
  "original-green",
  "night-blue",
  "ember-red",
  "velvet-purple",
]

export const QA3DA_ACCENT_THEME_STORAGE_KEY = "qa3da-accent-theme"

export const QA3DA_DEFAULT_ACCENT_THEME: Qa3daAccentTheme = "cafe"

export const QA3DA_ACCENT_THEME_META: Record<
  Qa3daAccentTheme,
  {
    label: string
    description: string
    surface: string
    border: string
    accent: string
    accentBg: string
  }
> = {
  cafe: {
    label: "قهوة سكيتو",
    description: "الهوية الكلاسيكية — بني نحاسي دافئ بريحة البُن الأصلي",
    surface: "var(--paper-warm)",
    border: "color-mix(in srgb, var(--accent-theme) 40%, var(--ink))",
    accent: "var(--accent-theme)",
    accentBg: "color-mix(in srgb, var(--accent-theme) 12%, transparent)",
  },
  "original-green": {
    label: "ماتشا",
    description: "إنتعاش أخضر عصري للقعدات والمزاج الرايق",
    surface: "var(--paper-warm)",
    border: "color-mix(in srgb, var(--accent-theme) 40%, var(--ink))",
    accent: "var(--accent-theme)",
    accentBg: "color-mix(in srgb, var(--accent-theme) 12%, transparent)",
  },
  "night-blue": {
    label: "سهرة القهوة",
    description: "كحلي هادئ وأجواء ليلية رايقة في قعدتنا",
    surface: "var(--paper-warm)",
    border: "color-mix(in srgb, var(--accent-theme) 38%, var(--ink))",
    accent: "var(--accent-theme)",
    accentBg: "color-mix(in srgb, var(--accent-theme) 12%, transparent)",
  },
  "ember-red": {
    label: "كركديه",
    description: "أحمر عنابي دافئ بلمسة خشبية وقعدة رايقة",
    surface: "var(--paper-warm)",
    border: "color-mix(in srgb, var(--accent-theme) 40%, var(--ink))",
    accent: "var(--accent-theme)",
    accentBg: "color-mix(in srgb, var(--accent-theme) 12%, transparent)",
  },
  "velvet-purple": {
    label: "سموزي برقوق",
    description: "بنفسجي مخملي عميق مع أسطح برقوقية هادئة",
    surface: "var(--paper-warm)",
    border: "color-mix(in srgb, var(--accent-theme) 40%, var(--ink))",
    accent: "var(--accent-theme)",
    accentBg: "color-mix(in srgb, var(--accent-theme) 12%, transparent)",
  },
}

export function isQa3daAccentTheme(value: unknown): value is Qa3daAccentTheme {
  return (
    typeof value === "string" &&
    (QA3DA_ACCENT_THEMES as readonly string[]).includes(value)
  )
}

export function getStoredQa3daAccentTheme(): Qa3daAccentTheme {
  if (typeof window === "undefined") return QA3DA_DEFAULT_ACCENT_THEME

  try {
    const stored = window.localStorage.getItem(QA3DA_ACCENT_THEME_STORAGE_KEY)

    if (isQa3daAccentTheme(stored)) return stored
  } catch {
    // Ignore storage errors.
  }

  return QA3DA_DEFAULT_ACCENT_THEME
}

export function setStoredQa3daAccentTheme(theme: Qa3daAccentTheme) {
  if (typeof window === "undefined") return

  try {
    window.localStorage.setItem(QA3DA_ACCENT_THEME_STORAGE_KEY, theme)
  } catch {
    // Ignore storage errors.
  }
}
