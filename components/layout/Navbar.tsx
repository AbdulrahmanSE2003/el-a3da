"use client"

import Link from "next/link"
import { Settings } from "lucide-react"

const Navbar = () => {
  return (
    <header className="mx-auto flex max-w-7xl items-center justify-between px-6 py-6 lg:px-10">
      <Link href="/" className="text-2xl font-black tracking-tight">
        القعدة
      </Link>

      <nav className="hidden items-center gap-8 text-sm font-bold md:flex">
        <Link href="/about" className="transition-opacity hover:opacity-60">
          عن القعدة
        </Link>

        <Link href="/changelog" className="transition-opacity hover:opacity-60">
          التحديثات
        </Link>

        <Link href="/download" className="transition-opacity hover:opacity-60">
          التحميل
        </Link>

        <Link href="/settings" className="transition-opacity hover:opacity-60">
          الإعدادات
        </Link>
      </nav>

      <div className="flex items-center gap-2">
        <Link
          href="/settings"
          className="flex size-10 items-center justify-center rounded-full border-2 border-ink bg-card text-foreground shadow-[2px_2px_0_var(--color-ink)] transition-all hover:-translate-x-[1px] hover:-translate-y-[1px] hover:shadow-[3px_3px_0_var(--color-ink)] md:hidden"
          aria-label="الإعدادات"
        >
          <Settings className="size-4" />
        </Link>
        <Link
          href="/download"
          className="rounded-full bg-ink px-5 py-3 text-sm font-bold text-paper transition-transform hover:-translate-y-0.5"
        >
          ابدأ قعدة
        </Link>
      </div>
    </header>
  )
}

export default Navbar
