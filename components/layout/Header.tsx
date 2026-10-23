"use client"

import { ArrowRight, Moon, Sun } from "lucide-react"

import Link from "next/link"

import { useTheme } from "next-themes"
import { useMounted } from "@/hooks/use-mounted"

const Header = ({
  stamp,
  href,
  linkText,
}: {
  stamp: string
  href?: string
  linkText?: string
}) => {
  const { resolvedTheme, setTheme } = useTheme()

  const mounted = useMounted()

  const toggleTheme = () => {
    setTheme(resolvedTheme === "dark" ? "light" : "dark")
  }

  return (
    <header className="relative z-10 w-full max-w-md">
      <div className="flex items-center justify-between border-b border-ink/10 pb-3">
        <Link
          href={href || "/"}
          className="group flex items-center gap-1.5 text-xs font-bold text-ink-soft transition-colors hover:text-copper"
        >
          <ArrowRight className="size-4 transition-transform duration-200 group-hover:-translate-x-0.5" />
          <span>{linkText || "الرئيسية"}</span>
        </Link>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={toggleTheme}
            aria-label="تغيير المظهر"
            className="flex size-8 items-center justify-center rounded-md border border-ink/10 text-ink-soft transition-colors hover:border-copper/30 hover:text-copper"
          >
            {mounted ? (
              resolvedTheme === "dark" ? (
                <Sun className="size-4" />
              ) : (
                <Moon className="size-4" />
              )
            ) : (
              <span className="size-4" />
            )}
          </button>

          <span className="rounded-md border border-copper/30 bg-copper/10 px-2.5 py-2 font-mono text-[10px] font-bold tracking-widest text-copper">
            {stamp}
          </span>
        </div>
      </div>
    </header>
  )
}

export default Header
