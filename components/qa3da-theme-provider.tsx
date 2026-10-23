"use client"

import * as React from "react"
import {
  getStoredQa3daAccentTheme,
  isQa3daAccentTheme,
  QA3DA_ACCENT_THEME_STORAGE_KEY,
  QA3DA_DEFAULT_ACCENT_THEME,
  type Qa3daAccentTheme,
} from "@/lib/qa3da-theme"

type Qa3daThemeContextValue = {
  theme: Qa3daAccentTheme
  setTheme: (next: Qa3daAccentTheme) => void
  mounted: boolean
}

const Qa3daThemeContext = React.createContext<Qa3daThemeContextValue | null>(
  null
)

function applyAccentTheme(theme: Qa3daAccentTheme) {
  if (typeof document === "undefined") return

  document.documentElement.setAttribute("data-accent-theme", theme)
}

function Qa3daThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = React.useState<Qa3daAccentTheme>(
    QA3DA_DEFAULT_ACCENT_THEME
  )

  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    const storedTheme = getStoredQa3daAccentTheme()

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setThemeState(storedTheme)
    applyAccentTheme(storedTheme)
    setMounted(true)
  }, [])

  const setTheme = React.useCallback((next: Qa3daAccentTheme) => {
    if (!isQa3daAccentTheme(next)) return

    setThemeState(next)

    try {
      window.localStorage.setItem(QA3DA_ACCENT_THEME_STORAGE_KEY, next)
    } catch {
      // The theme still works if localStorage is unavailable.
    }

    applyAccentTheme(next)
  }, [])

  const value = React.useMemo(
    () => ({ theme, setTheme, mounted }),
    [theme, setTheme, mounted]
  )

  return (
    <Qa3daThemeContext.Provider value={value}>
      {children}
    </Qa3daThemeContext.Provider>
  )
}

function useQa3daTheme() {
  const context = React.useContext(Qa3daThemeContext)

  if (!context) {
    throw new Error("useQa3daTheme must be used within Qa3daThemeProvider")
  }

  return context
}

export { Qa3daThemeProvider, useQa3daTheme }
