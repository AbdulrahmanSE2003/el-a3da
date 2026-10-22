"use client"

import * as React from "react"
import { ThemeProvider as NextThemesProvider } from "next-themes"
import { Qa3daThemeProvider } from "@/components/qa3da-theme-provider"

function ThemeProvider({
  children,
  ...props
}: React.ComponentProps<typeof NextThemesProvider>) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="dark"
      enableSystem={false}
      disableTransitionOnChange
      {...props}
    >
      <Qa3daThemeProvider>{children}</Qa3daThemeProvider>
    </NextThemesProvider>
  )
}

export { ThemeProvider }
